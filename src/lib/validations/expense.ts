import { z } from "zod";

export const expenseCategories = [
  "fuel",
  "maintenance",
  "food_water",
  "parking_tolls",
  "mobile_recharge",
  "insurance",
  "vehicle_emi",
  "riding_equipment",
  "platform_charges",
  "other",
] as const;

export const createExpenseSchema = z.object({
  category: z.enum(expenseCategories, {
    message: "Expense category is required",
  }),
  customCategory: z.string().trim().max(50).nullable().optional(),
  description: z
    .string()
    .trim()
    .min(2, "Description must be at least 2 characters")
    .max(255),
  amountInr: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than zero"),
  workSessionId: z.string().uuid().nullable().optional(),
  expenseTime: z.string().datetime().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
