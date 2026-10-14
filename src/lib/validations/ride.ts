import { z } from "zod";

export const createRideSchema = z.object({
  earningInr: z
    .number({ message: "Ride earning must be a number" })
    .positive("Ride earning must be greater than zero"),
  incentiveInr: z
    .number({ message: "Incentive must be a number" })
    .min(0, "Incentive cannot be negative")
    .default(0),
  tipInr: z
    .number({ message: "Tip must be a number" })
    .min(0, "Tip cannot be negative")
    .default(0),
  paymentMethod: z.enum(["cash", "upi"], {
    message: "Payment method must be cash or upi",
  }),
  workSessionId: z.string().uuid().nullable().optional(),
  rideTime: z.string().datetime().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export type CreateRideInput = z.infer<typeof createRideSchema>;
