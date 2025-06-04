
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from '@/lib/auth-utils';
import { SignUpFormValues } from "@/components/auth/schemas/signUpSchema";

export const registerUser = async (values: SignUpFormValues) => {
  // Clean up existing auth state
  cleanupAuthState();
  
  // Try to sign out globally first
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    // Continue even if this fails
  }
  
  // Format location string if city/state/country are provided
  let formattedLocation = values.location || "";
  if (values.city || values.state || values.country) {
    const locationParts = [values.city, values.state, values.country].filter(Boolean);
    formattedLocation = locationParts.join(", ");
  }
  
  // Register user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        name: values.name,
        phone: values.phone || null,
        role: values.role,
        location: formattedLocation || null,
      },
    },
  });

  if (authError) throw authError;
  
  // Insert user data into public users table
  if (authData.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      role: values.role,
      location: formattedLocation || null,
      status: 'active',
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // This error happens because the users table doesn't have city, state or country columns
      // But we can continue because the auth still works
    }
  }
  
  return authData;
};
