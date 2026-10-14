import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80)
    .optional(),
  partnerId: z
    .string()
    .trim()
    .min(2, "Partner ID must be at least 2 characters")
    .optional(),
  phoneNumber: z.string().trim().nullable().optional(),
  vehicleType: z.string().trim().default("Two-Wheeler (Motorcycle)"),
  vehicleNumber: z.string().trim().nullable().optional(),
  dailyTargetInr: z
    .number()
    .min(0, "Daily target must be non-negative")
    .optional(),
  initialOdometer: z
    .number()
    .min(0, "Initial odometer must be non-negative")
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
