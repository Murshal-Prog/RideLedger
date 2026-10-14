import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { startSessionSchema, endSessionSchema } from "@/lib/validations/work-session";
import { createRideSchema } from "@/lib/validations/ride";
import { createExpenseSchema } from "@/lib/validations/expense";
import { updateProfileSchema } from "@/lib/validations/user-profile";

describe("Phase 2 — Validation Schemas", () => {
  describe("Auth Schemas", () => {
    it("validates valid login credentials", () => {
      const valid = loginSchema.safeParse({
        email: "captain@rideledger.local",
        password: "password123",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects invalid email and short passwords", () => {
      const invalidEmail = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(invalidEmail.success).toBe(false);

      const shortPassword = loginSchema.safeParse({
        email: "captain@rideledger.local",
        password: "123",
      });
      expect(shortPassword.success).toBe(false);
    });

    it("validates signup payload with defaults", () => {
      const valid = signupSchema.safeParse({
        email: "newcaptain@example.com",
        password: "securepassword",
        fullName: "Raju Captain",
        partnerId: "RAP-9999",
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.dailyTargetInr).toBe(1500);
        expect(valid.data.initialOdometer).toBe(0);
      }
    });
  });

  describe("Work Session Schemas", () => {
    it("validates starting odometer non-negative", () => {
      expect(startSessionSchema.safeParse({ startingOdometer: 14200 }).success).toBe(true);
      expect(startSessionSchema.safeParse({ startingOdometer: 0 }).success).toBe(true);
      expect(startSessionSchema.safeParse({ startingOdometer: -5 }).success).toBe(false);
    });

    it("enforces ending odometer >= starting odometer", () => {
      const valid = endSessionSchema.safeParse({
        startingOdometer: 14200,
        endingOdometer: 14285.5,
      });
      expect(valid.success).toBe(true);

      const invalid = endSessionSchema.safeParse({
        startingOdometer: 14200,
        endingOdometer: 14190,
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("Ride Schemas", () => {
    it("validates valid ride with earnings and tips", () => {
      const valid = createRideSchema.safeParse({
        earningInr: 120,
        incentiveInr: 25,
        tipInr: 10,
        paymentMethod: "upi",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects non-positive ride earnings", () => {
      expect(
        createRideSchema.safeParse({
          earningInr: 0,
          paymentMethod: "cash",
        }).success
      ).toBe(false);

      expect(
        createRideSchema.safeParse({
          earningInr: -50,
          paymentMethod: "cash",
        }).success
      ).toBe(false);
    });

    it("rejects invalid payment methods", () => {
      expect(
        createRideSchema.safeParse({
          earningInr: 100,
          // @ts-expect-error Testing runtime invalid enum
          paymentMethod: "bitcoin",
        }).success
      ).toBe(false);
    });
  });

  describe("Expense Schemas", () => {
    it("validates allowed expense categories", () => {
      const valid = createExpenseSchema.safeParse({
        category: "fuel",
        description: "Petrol 2 Litres",
        amountInr: 215.5,
      });
      expect(valid.success).toBe(true);
    });

    it("rejects invalid category and non-positive amount", () => {
      const invalidCategory = createExpenseSchema.safeParse({
        // @ts-expect-error Testing runtime invalid enum
        category: "gambling",
        description: "Test",
        amountInr: 50,
      });
      expect(invalidCategory.success).toBe(false);

      const invalidAmount = createExpenseSchema.safeParse({
        category: "maintenance",
        description: "Oil change",
        amountInr: 0,
      });
      expect(invalidAmount.success).toBe(false);
    });
  });

  describe("Profile Schema", () => {
    it("validates partial profile updates", () => {
      const valid = updateProfileSchema.safeParse({
        fullName: "Mohamed Captain",
        dailyTargetInr: 2000,
        vehicleNumber: "KA 01 XY 9876",
      });
      expect(valid.success).toBe(true);
    });
  });
});
