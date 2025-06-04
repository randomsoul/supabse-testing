
import { z } from "zod";

export const signUpFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().optional(),
  role: z.enum(["donor", "seeker", "both"], {
    required_error: "Please select a role",
  }),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
});

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
