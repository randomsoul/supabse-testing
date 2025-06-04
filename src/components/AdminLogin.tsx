
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from '@/lib/auth-utils';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if we have any admin users in the database when component mounts
  useEffect(() => {
    const checkAdminUser = async () => {
      try {
        // Try to find admin users
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1);
          
        if (error) {
          console.error("Error checking for admin users:", error);
          return;
        }
        
        // If no admin users found, create the default one
        if (!data || data.length === 0) {
          console.log("No admin users found, creating default admin user");
          await createDefaultAdmin();
        }
      } catch (err) {
        console.error("Failed to check for admin users:", err);
      }
    };
    
    checkAdminUser();
  }, []);
  
  // Create a default admin user
  const createDefaultAdmin = async () => {
    try {
      // Clean up existing auth state to avoid conflicts
      cleanupAuthState();

      // First try to sign out globally
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Sign out failed during admin creation, continuing anyway");
      }
      
      // Register the default admin in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@admin.com',
        password: 'admin123#',
        options: {
          data: {
            name: 'Admin User',
            role: 'admin',
          }
        }
      });
      
      if (authError) {
        // If there's an error because the user already exists, we can just continue
        if (authError.message.includes('already registered')) {
          console.log("Admin user already exists in auth, skipping creation");
          return;
        }
        
        console.error("Error creating default admin auth:", authError);
        return;
      }
      
      // If we get a user from the auth signup
      if (authData.user) {
        console.log("Default admin created in auth, now creating profile in users table");
        
        // Insert the admin into the users table
        const { error: insertError } = await supabase.from('users').insert({
          id: authData.user.id,
          name: 'Admin User',
          email: 'admin@admin.com',
          role: 'admin',
          status: 'active',
        });
        
        if (insertError) {
          // If user already exists, this is fine
          if (insertError.code === '23505') { // Unique violation error code
            console.log("Admin user already exists in users table");
            return;
          }
          
          console.error("Error creating admin user record:", insertError);
        } else {
          console.log("Default admin user created successfully");
          
          // Sign out after creating to avoid session conflicts
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error("Failed to create default admin:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try to sign out globally first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        // Continue even if this fails
      }
      
      // Check if we're using the admin@admin.com email or just 'admin' username
      const loginEmail = username.includes('@') ? username : 'admin@admin.com';
      
      console.log("Attempting admin login with:", loginEmail);
      
      // First try to authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
        
        // If supabase auth fails, try the hardcoded credentials as fallback
        if ((username === 'admin' && password === 'admin123#') || 
            (username === 'admin@admin.com' && password === 'admin123#')) {
          console.log("Using hardcoded admin credentials");
          toast.success("Login successful");
          onLogin(true);
          return;
        }
        
        throw error;
      }
      
      if (data.user) {
        console.log("Auth successful, checking if user is admin");
        
        // Check if the user is an admin in our database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (userError) {
          console.error("Error fetching user role:", userError);
          throw new Error("Could not verify admin role");
        }
        
        console.log("User role:", userData?.role);
        
        if (userData?.role === 'admin') {
          toast.success("Admin login successful");
          onLogin(true);
        } else {
          toast.error("User is not an admin");
          // Sign them out if they're not an admin
          await supabase.auth.signOut();
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input 
                id="username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or admin@admin.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <div className="text-sm text-gray-500 mt-2">
              <p>Default admin credentials:</p>
              <p>Username: admin@admin.com</p>
              <p>Password: admin123#</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
