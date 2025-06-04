
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { signUpFormSchema, type SignUpFormValues } from "./schemas/signUpSchema";
import SignUpPersonalInfo from "./SignUpPersonalInfo";
import SignUpLocationInfo from "./SignUpLocationInfo";
import SignUpRoleSelector from "./SignUpRoleSelector";
import { registerUser } from "@/services/authService";

type SignUpFormProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

const SignUpForm = ({ setLoading, loading }: SignUpFormProps) => {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "both",
      city: "",
      state: "",
      country: "",
      location: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setLoading(true);
    
    try {
      await registerUser(values);
      toast.success("Account created successfully! Please check your email to verify your account.");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SignUpPersonalInfo form={form} />
        
        <SignUpLocationInfo form={form} />
        
        <SignUpRoleSelector form={form} />
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
