import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signInSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
