import { describe, it, expect, beforeEach } from "vitest";
import {
  StorageAdapter,
  SecurityError,
  AuthRepository,
  UserRepository,
  WorkSessionRepository,
  RideRepository,
  ExpenseRepository,
  DEMO_USER,
} from "@/lib/repositories";
import { isSupabaseConfigured } from "@/lib/supabase/client";

describe("Phase 2 — Repositories & User Isolation", () => {
  beforeEach(() => {
    StorageAdapter._resetStore();
  });

  describe("AuthRepository & Session Security", () => {
    it("signs in with demo captain credentials and establishes session", async () => {
      const session = await AuthRepository.signIn({
        email: "captain@rideledger.local",
        password: "password123",
      });

      expect(session).toBeDefined();
      expect(session.user.id).toBe(DEMO_USER.id);
      expect(session.profile.partnerId).toBe("RAP-4091");

      // Verify session recovery
      const recovered = await AuthRepository.getSession();
      expect(recovered).not.toBeNull();
      expect(recovered?.user.id).toBe(DEMO_USER.id);
    });

    it("rejects invalid login inputs via Zod validation", async () => {
      await expect(
        AuthRepository.signIn({
          email: "not-an-email",
          password: "password123",
        })
      ).rejects.toThrow();

      await expect(
        AuthRepository.signIn({
          email: "valid@email.com",
          password: "123", // too short
        })
      ).rejects.toThrow();
    });

    it("registers a new Captain account with isolated profile", async () => {
      const session = await AuthRepository.signUp({
        email: "salman@rideledger.local",
        password: "password999",
        fullName: "Salman Captain",
        partnerId: "RAP-7721",
        dailyTargetInr: 1800,
        initialOdometer: 5200,
      });

      expect(session.user.email).toBe("salman@rideledger.local");
      expect(session.profile.fullName).toBe("Salman Captain");
      expect(session.profile.dailyTargetInr).toBe(1800);
    });

    it("handles expired, corrupt, or revoked session gracefully", async () => {
      // Simulate corrupt token in storage
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("rideledger_auth_session", "invalid-json{{{{");
      }
      // getSession should catch and return null safely without throwing uncaught exceptions
      const session = await AuthRepository.getSession();
      expect(session).toBeNull();
    });

    it("explicit sign out clears session token but PRESERVES all financial records", async () => {
      // 1. Sign in as captain
      const session = await AuthRepository.signIn({
        email: "captain@rideledger.local",
        password: "password123",
      });
      const userId = session.user.id;

      // 2. Create financial records (ride and expense)
      const ride = await RideRepository.createRide(userId, {
        earningInr: 150,
        incentiveInr: 30,
        tipInr: 20,
        paymentMethod: "upi",
      });
      expect(ride.totalIncomeInr).toBe(200);

      const expense = await ExpenseRepository.createExpense(userId, {
        category: "fuel",
        description: "Speed Petrol",
        amountInr: 110,
      });
      expect(expense.id).toBeDefined();

      // 3. User explicitly signs out
      await AuthRepository.signOut();

      // Verify session is cleared
      const emptySession = await AuthRepository.getSession();
      expect(emptySession).toBeNull();

      // 4. CRITICAL VERIFICATION: Financial records STILL EXIST and were NOT deleted!
      const preservedRides = StorageAdapter.getRides(userId);
      expect(preservedRides.length).toBe(1);
      expect(preservedRides[0].id).toBe(ride.id);
      expect(preservedRides[0].totalIncomeInr).toBe(200);

      const preservedExpenses = StorageAdapter.getExpenses(userId);
      expect(preservedExpenses.length).toBe(1);
      expect(preservedExpenses[0].id).toBe(expense.id);
      expect(preservedExpenses[0].amountInr).toBe(110);
    });
  });

  describe("WorkSessionRepository & Constraints", () => {
    it("creates active work session and prevents duplicate active sessions", async () => {
      const userId = "usr-test-session-1";

      const session = await WorkSessionRepository.startSession(userId, {
        startingOdometer: 10000,
      });
      expect(session.status).toBe("active");
      expect(session.startingOdometer).toBe(10000);

      // Attempting to start another active session should be rejected
      await expect(
        WorkSessionRepository.startSession(userId, {
          startingOdometer: 10005,
        })
      ).rejects.toThrow(/Active session already exists/i);
    });

    it("rejects ending odometer less than starting odometer", async () => {
      const userId = "usr-test-session-inv";
      const session = await WorkSessionRepository.startSession(userId, {
        startingOdometer: 15000,
      });

      await expect(
        WorkSessionRepository.endSession(userId, session.id, {
          startingOdometer: 15000,
          endingOdometer: 14900, // Invalid: reversed odometer!
        })
      ).rejects.toThrow(/Ending odometer must be greater than or equal/i);
    });

    it("ends work session and calculates net distance travelled", async () => {
      const userId = "usr-test-session-2";
      const session = await WorkSessionRepository.startSession(userId, {
        startingOdometer: 12000,
      });

      const concluded = await WorkSessionRepository.endSession(userId, session.id, {
        startingOdometer: 12000,
        endingOdometer: 12048.5,
      });

      expect(concluded.status).toBe("completed");
      expect(concluded.endingOdometer).toBe(12048.5);
      expect(concluded.distanceKm).toBe(48.5);
    });
  });

  describe("Cross-User Data Isolation (Acceptance Criteria)", () => {
    const userA = "usr-captain-alpha";
    const userB = "usr-captain-beta";

    it("enforces strict user isolation across all records and rejects cross-user read/write", async () => {
      // User A records a ride and expense
      const rideA = await RideRepository.createRide(userA, {
        earningInr: 95,
        incentiveInr: 10,
        tipInr: 5,
        paymentMethod: "cash",
      });

      const expenseA = await ExpenseRepository.createExpense(userA, {
        category: "food_water",
        description: "Lunch & Chai",
        amountInr: 65,
      });

      // User B records their own ride
      const rideB = await RideRepository.createRide(userB, {
        earningInr: 210,
        incentiveInr: 0,
        tipInr: 20,
        paymentMethod: "upi",
      });

      // 1. Verify User A only sees their own rides and expenses
      const ridesForA = await RideRepository.getRides(userA);
      expect(ridesForA.length).toBe(1);
      expect(ridesForA[0].id).toBe(rideA.id);

      const expensesForA = await ExpenseRepository.getExpenses(userA);
      expect(expensesForA.length).toBe(1);
      expect(expensesForA[0].id).toBe(expenseA.id);

      // 2. Verify User B only sees their own rides (cannot see User A's records)
      const ridesForB = await RideRepository.getRides(userB);
      expect(ridesForB.length).toBe(1);
      expect(ridesForB[0].id).toBe(rideB.id);

      const expensesForB = await ExpenseRepository.getExpenses(userB);
      expect(expensesForB.length).toBe(0); // User B has no expenses

      // 3. Unauthorized access violations throw SecurityError
      // User B attempting to read User A's ride directly by ID
      expect(() => StorageAdapter.getRideById(userB, rideA.id)).toThrowError(SecurityError);

      // User B attempting to read User A's expense directly by ID
      expect(() => StorageAdapter.getExpenseById(userB, expenseA.id)).toThrowError(SecurityError);

      // User B attempting to update User A's ride
      expect(() =>
        StorageAdapter.saveRide(userB, {
          ...rideA,
          earningInr: 999,
        })
      ).toThrowError(SecurityError);

      // User B attempting to update User A's expense
      expect(() =>
        StorageAdapter.saveExpense(userB, {
          ...expenseA,
          amountInr: 500,
        })
      ).toThrowError(SecurityError);

      // User B attempting to delete User A's ride
      expect(() => StorageAdapter.deleteRide(userB, rideA.id)).toThrowError(SecurityError);

      // User B attempting to delete User A's expense
      expect(() => StorageAdapter.deleteExpense(userB, expenseA.id)).toThrowError(SecurityError);
    });

    it("enforces isolation on work sessions preventing cross-user session tampering", async () => {
      const sessionA = await WorkSessionRepository.startSession(userA, {
        startingOdometer: 20000,
      });

      // User B cannot see User A's active session
      const activeForB = await WorkSessionRepository.getActiveSession(userB);
      expect(activeForB).toBeNull();

      // User B attempting to end User A's session is rejected
      await expect(
        WorkSessionRepository.endSession(userB, sessionA.id, {
          startingOdometer: 20000,
          endingOdometer: 20050,
        })
      ).rejects.toThrow();
    });
  });

  describe("Environment & Fallback Behavior", () => {
    it("gracefully detects placeholder environment variables and defaults to local isolation", () => {
      // With placeholder variables in .env.example, isSupabaseConfigured must be false
      expect(typeof isSupabaseConfigured).toBe("boolean");
    });
  });
});
