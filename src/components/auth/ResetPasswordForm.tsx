
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ResetPasswordFormProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setAuthMode: React.Dispatch<React.SetStateAction<'login' | 'signup' | 'reset'>>;
};

const ResetPasswordForm = ({ setLoading, loading, setAuthMode }: ResetPasswordFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    
    try {
      // Use window.location.href to get the full current URL
      // This ensures we're using the actual deployed URL, not hardcoded localhost
      const currentUrl = window.location.href;
      // Extract the origin (protocol + domain)
      const origin = window.location.origin;
      
      console.log("Reset password redirect URL:", `${origin}/auth?mode=update-password`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${origin}/auth?mode=update-password`,
      });

      if (error) throw error;
      
      toast.success("Password reset link sent to your email");
      form.reset();
      setAuthMode('login');
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending Reset Link..." : "Send Reset Link"}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
