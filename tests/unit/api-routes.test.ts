import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { StorageAdapter } from "@/lib/repositories/storage-adapter";
import { GET as getMe } from "@/app/api/auth/me/route";
import { GET as getProfile, PUT as updateProfile } from "@/app/api/user/profile/route";
import { GET as getRides, POST as postRide } from "@/app/api/rides/route";
import { GET as getExpenses, POST as postExpense } from "@/app/api/expenses/route";
import { GET as getSessions, POST as postSession, PATCH as patchSession } from "@/app/api/sessions/route";

function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    userId?: string;
  } = {}
): NextRequest {
  const headers = new Headers();
  if (options.userId) {
    headers.set("x-user-id", options.userId);
  }
  if (options.body) {
    headers.set("content-type", "application/json");
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  } as any);
}

describe("Phase 2 — API Route Handlers & Data Isolation", () => {
  beforeEach(() => {
    StorageAdapter._resetStore();
  });

  describe("Authentication Gateways", () => {
    it("rejects unauthorized access to /api/auth/me without user credentials", async () => {
      const req = createMockRequest("/api/auth/me");
      const res = await getMe(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/Unauthorized/i);
    });

    it("rejects unauthorized access to /api/rides without user credentials", async () => {
      const req = createMockRequest("/api/rides");
      const res = await getRides(req);
      expect(res.status).toBe(401);
    });

    it("rejects unauthorized access to /api/expenses without user credentials", async () => {
      const req = createMockRequest("/api/expenses");
      const res = await getExpenses(req);
      expect(res.status).toBe(401);
    });
  });

  describe("Server-Side Validation", () => {
    const testUser = "usr-validation-tester";

    it("rejects invalid ride payload with 400 Bad Request", async () => {
      const req = createMockRequest("/api/rides", {
        method: "POST",
        userId: testUser,
        body: {
          earningInr: -50, // invalid negative fare
          paymentMethod: "cash",
        },
      });

      const res = await postRide(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it("rejects invalid expense category with 400 Bad Request", async () => {
      const req = createMockRequest("/api/expenses", {
        method: "POST",
        userId: testUser,
        body: {
          category: "illegal_category",
          description: "Test",
          amountInr: 100,
        },
      });

      const res = await postExpense(req);
      expect(res.status).toBe(400);
    });
  });

  describe("API User-Level Data Isolation", () => {
    const userA = "usr-api-alpha";
    const userB = "usr-api-beta";

    it("isolates ride records between distinct authenticated users", async () => {
      // User A posts a ride
      const postReqA = createMockRequest("/api/rides", {
        method: "POST",
        userId: userA,
        body: {
          earningInr: 180,
          incentiveInr: 20,
          tipInr: 15,
          paymentMethod: "upi",
        },
      });
      const postResA = await postRide(postReqA);
      expect(postResA.status).toBe(201);
      const { ride: rideA } = await postResA.json();
      expect(rideA.totalIncomeInr).toBe(215);

      // User B posts their own ride
      const postReqB = createMockRequest("/api/rides", {
        method: "POST",
        userId: userB,
        body: {
          earningInr: 85,
          paymentMethod: "cash",
        },
      });
      const postResB = await postRide(postReqB);
      expect(postResB.status).toBe(201);

      // User A queries their rides
      const getReqA = createMockRequest("/api/rides", { userId: userA });
      const getResA = await getRides(getReqA);
      const { rides: ridesA } = await getResA.json();
      expect(ridesA.length).toBe(1);
      expect(ridesA[0].id).toBe(rideA.id);

      // User B queries their rides -> must NOT see User A's ride!
      const getReqB = createMockRequest("/api/rides", { userId: userB });
      const getResB = await getRides(getReqB);
      const { rides: ridesB } = await getResB.json();
      expect(ridesB.length).toBe(1);
      expect(ridesB[0].id).not.toBe(rideA.id);
      expect(ridesB[0].earningInr).toBe(85);
    });

    it("isolates expense records between distinct authenticated users", async () => {
      // User A records fuel expense
      const postReqA = createMockRequest("/api/expenses", {
        method: "POST",
        userId: userA,
        body: {
          category: "fuel",
          description: "Full tank petrol",
          amountInr: 500,
        },
      });
      const postResA = await postExpense(postReqA);
      expect(postResA.status).toBe(201);

      // User B checks expenses -> should be empty
      const getReqB = createMockRequest("/api/expenses", { userId: userB });
      const getResB = await getExpenses(getReqB);
      const { expenses: expensesB } = await getResB.json();
      expect(expensesB.length).toBe(0);
    });
  });
});
