
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  showContactInfo?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  showContactInfo = false
}) => {
  const { user, isLoading, userRole } = useAuth();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If not logged in, redirect to auth page
  if (!user) {
    if (showContactInfo) {
      // If this is a route that shows contact info, notify the user they need to log in
      toast.error("Please sign in to view contact information");
    }
    return <Navigate to="/auth" replace />;
  }
  
  // If roles are specified and user doesn't have the right role
  if (allowedRoles && allowedRoles.length > 0 && userRole) {
    if (!allowedRoles.includes(userRole)) {
      toast.error("You don't have permission to access this page");
      return <Navigate to="/" replace />;
    }
  }
  
  // If user is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
