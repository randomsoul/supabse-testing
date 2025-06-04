
/**
 * Clean up auth state to prevent authentication limbo states
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Parse location JSON from Supabase to ensure it matches our expected format
 */
export const parseLocationFromJson = (locationJson: any): { lat: number; lng: number; address: string } => {
  if (typeof locationJson === 'string') {
    try {
      // If it's a string JSON, parse it
      locationJson = JSON.parse(locationJson);
    } catch (e) {
      console.error('Failed to parse location JSON:', e);
      return { lat: 0, lng: 0, address: 'Unknown location' };
    }
  }
  
  // Ensure the location object has the expected properties
  return {
    lat: Number(locationJson?.lat || 0),
    lng: Number(locationJson?.lng || 0),
    address: String(locationJson?.address || 'Unknown location')
  };
};
