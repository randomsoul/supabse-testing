
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SignUpFormValues } from "./schemas/signUpSchema";

type SignUpLocationInfoProps = {
  form: UseFormReturn<SignUpFormValues>;
};

const SignUpLocationInfo: React.FC<SignUpLocationInfoProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City (optional)</FormLabel>
            <FormControl>
              <Input placeholder="New York" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>State (optional)</FormLabel>
            <FormControl>
              <Input placeholder="NY" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country (optional)</FormLabel>
            <FormControl>
              <Input placeholder="USA" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SignUpLocationInfo;
