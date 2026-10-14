import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Name is too long")
    .default("Rapido Captain"),
  partnerId: z
    .string()
    .trim()
    .min(2, "Partner ID must be at least 2 characters")
    .default("RAP-4091"),
  phoneNumber: z.string().trim().optional(),
  vehicleNumber: z.string().trim().optional(),
  dailyTargetInr: z
    .number()
    .min(0, "Daily target must be zero or positive")
    .default(1500),
  initialOdometer: z
    .number()
    .min(0, "Initial odometer must be non-negative")
    .default(0),
});

export type SignupInput = z.infer<typeof signupSchema>;
