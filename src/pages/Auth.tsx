
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Mail, Facebook } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import the logo
import logo from "/public/lovable-uploads/b2144384-426a-463f-8359-98bbd50ff78d.png";

const Auth = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset' | 'update-password'>('login');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse query parameters to determine initial mode
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode');
    
    if (mode === 'signup') {
      setAuthMode('signup');
    } else if (mode === 'reset') {
      setAuthMode('reset');
    } else if (mode === 'update-password') {
      setAuthMode('update-password');
    }
    
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mode !== 'update-password') {
        navigate('/');
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && authMode !== 'update-password') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.search, authMode]);

  const handleSocialLogin = async (provider: 'github' | 'google' | 'facebook') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || `${provider} login failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      toast.success("Password updated successfully");
      // Redirect to home after password update
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img 
            src={logo} 
            alt="Book Donation Connect" 
            className="mx-auto h-24 w-auto mb-4" 
          />
          <h1 className="text-3xl font-bold">Book Donation Connect</h1>
          <p className="text-muted-foreground mt-2">Connect, donate, and find books</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {authMode === 'login' ? 'Sign In' : 
               authMode === 'signup' ? 'Create an Account' : 
               authMode === 'reset' ? 'Reset Password' :
               'Update Your Password'}
            </CardTitle>
            <CardDescription>
              {authMode === 'login' 
                ? 'Enter your credentials to sign in to your account' 
                : authMode === 'signup' 
                  ? 'Fill out the form to create a new account' 
                  : authMode === 'reset'
                    ? 'Enter your email to reset your password'
                    : 'Enter your new password to update it'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {authMode === 'login' && (
              <div className="space-y-4">
                <LoginForm setLoading={setLoading} loading={loading} />
                
                <div className="flex flex-col space-y-2 mt-4">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={() => setAuthMode('reset')}
                  >
                    Forgot password?
                  </Button>
                </div>
              </div>
            )}
            
            {authMode === 'signup' && <SignUpForm setLoading={setLoading} loading={loading} />}
            
            {authMode === 'reset' && <ResetPasswordForm setLoading={setLoading} loading={loading} setAuthMode={setAuthMode} />}
            
            {authMode === 'update-password' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    type="password"
                    id="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    minLength={6}
                  />
                </div>
                <Button 
                  className="w-full" 
                  disabled={loading}
                  onClick={handleUpdatePassword}
                >
                  {loading ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            )}
            
            {(authMode === 'login' || authMode === 'signup') && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    disabled={loading}
                    onClick={() => handleSocialLogin('github')}
                  >
                    <Github className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    disabled={loading}
                    onClick={() => handleSocialLogin('google')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    disabled={loading}
                    onClick={() => handleSocialLogin('facebook')}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            {authMode === 'login' && (
              <Button
                variant="link"
                className="w-full"
                onClick={() => setAuthMode('signup')}
                disabled={loading}
              >
                Don't have an account? Sign up
              </Button>
            )}
            
            {authMode === 'signup' && (
              <Button
                variant="link"
                className="w-full"
                onClick={() => setAuthMode('login')}
                disabled={loading}
              >
                Already have an account? Sign in
              </Button>
            )}
            
            {authMode === 'reset' && (
              <Button
                variant="link"
                className="w-full"
                onClick={() => setAuthMode('login')}
                disabled={loading}
              >
                Back to login
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
