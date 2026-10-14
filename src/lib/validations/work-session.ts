import { z } from "zod";

export const startSessionSchema = z.object({
  startingOdometer: z
    .number({ message: "Starting odometer must be a number" })
    .min(0, "Starting odometer cannot be negative"),
  startTime: z.string().datetime().optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;

export const endSessionSchema = z
  .object({
    startingOdometer: z
      .number({ message: "Starting odometer must be a number" })
      .min(0, "Starting odometer cannot be negative"),
    endingOdometer: z
      .number({ message: "Ending odometer must be a number" })
      .min(0, "Ending odometer cannot be negative"),
    endTime: z.string().datetime().optional(),
  })
  .refine((data) => data.endingOdometer >= data.startingOdometer, {
    message: "Ending odometer must be greater than or equal to starting odometer",
    path: ["endingOdometer"],
  });

export type EndSessionInput = z.infer<typeof endSessionSchema>;
