// Persistent Storage Adapter with User-Level Data Isolation
// Supports browser localStorage with SSR/memory fallback.
// Enforces strict user isolation: unauthorized access across user boundaries throws SecurityError.

import { UserProfile, WorkSession, Ride, Expense } from "@/lib/types/models";

const STORAGE_KEYS = {
  USERS: "rideledger_users",
  PROFILES: "rideledger_profiles",
  SESSIONS: "rideledger_work_sessions",
  RIDES: "rideledger_rides",
  EXPENSES: "rideledger_expenses",
  CURRENT_SESSION: "rideledger_auth_session",
} as const;

// In-memory store for SSR and Node.js / Vitest environments
const memoryStore: Record<string, string> = {};

function getItem(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore[key] || null;
    }
  }
  return memoryStore[key] || null;
}

function setItem(key: string, value: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore quota / private browsing errors
    }
  }
  memoryStore[key] = value;
}

function getCollection<T>(key: string): T[] {
  const raw = getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function saveCollection<T>(key: string, items: T[]): void {
  setItem(key, JSON.stringify(items));
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

export const StorageAdapter = {
  // Profiles
  getProfile(userId: string): UserProfile | null {
    if (!userId) throw new SecurityError("User ID is required");
    const profiles = getCollection<UserProfile>(STORAGE_KEYS.PROFILES);
    return profiles.find((p) => p.id === userId) || null;
  },

  saveProfile(profile: UserProfile): UserProfile {
    if (!profile.id) throw new SecurityError("Profile must have a valid user ID");
    const profiles = getCollection<UserProfile>(STORAGE_KEYS.PROFILES);
    const existingIndex = profiles.findIndex((p) => p.id === profile.id);
    if (existingIndex >= 0) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...profile, updatedAt: new Date().toISOString() };
    } else {
      profiles.push(profile);
    }
    saveCollection(STORAGE_KEYS.PROFILES, profiles);
    return profile;
  },

  // Work Sessions (isolated per user)
  getSessions(userId: string): WorkSession[] {
    if (!userId) throw new SecurityError("User ID is required");
    const sessions = getCollection<WorkSession>(STORAGE_KEYS.SESSIONS);
    // User isolation: strictly filter only records belonging to requesting user
    return sessions
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  },

  getActiveSession(userId: string): WorkSession | null {
    if (!userId) throw new SecurityError("User ID is required");
    const sessions = this.getSessions(userId);
    return sessions.find((s) => s.status === "active") || null;
  },

  saveSession(userId: string, session: WorkSession): WorkSession {
    if (!userId) throw new SecurityError("User ID is required");
    if (session.userId !== userId) {
      throw new SecurityError("Data isolation violation: session.userId must match requesting user");
    }

    const allSessions = getCollection<WorkSession>(STORAGE_KEYS.SESSIONS);
    const index = allSessions.findIndex((s) => s.id === session.id);

    if (index >= 0) {
      // Cross-user integrity check on update
      if (allSessions[index].userId !== userId) {
        throw new SecurityError("Unauthorized modification: Cannot update another user's session");
      }
      allSessions[index] = { ...allSessions[index], ...session, updatedAt: new Date().toISOString() };
    } else {
      // Enforce single active session rule
      if (session.status === "active") {
        const hasActive = allSessions.some((s) => s.userId === userId && s.status === "active");
        if (hasActive) {
          throw new Error("Cannot create multiple active work sessions. Conclude previous session first.");
        }
      }
      allSessions.push(session);
    }

    saveCollection(STORAGE_KEYS.SESSIONS, allSessions);
    return session;
  },

  // Rides (isolated per user)
  getRides(userId: string, workSessionId?: string | null): Ride[] {
    if (!userId) throw new SecurityError("User ID is required");
    const allRides = getCollection<Ride>(STORAGE_KEYS.RIDES);
    return allRides
      .filter((r) => r.userId === userId && (!workSessionId || r.workSessionId === workSessionId))
      .sort((a, b) => new Date(b.rideTime).getTime() - new Date(a.rideTime).getTime());
  },

  getRideById(userId: string, rideId: string): Ride | null {
    if (!userId) throw new SecurityError("User ID is required");
    const allRides = getCollection<Ride>(STORAGE_KEYS.RIDES);
    const ride = allRides.find((r) => r.id === rideId);
    if (!ride) return null;
    if (ride.userId !== userId) {
      throw new SecurityError("Data isolation violation: Attempted unauthorized read of another user's ride record");
    }
    return ride;
  },

  saveRide(userId: string, ride: Ride): Ride {
    if (!userId) throw new SecurityError("User ID is required");
    if (ride.userId !== userId) {
      throw new SecurityError("Data isolation violation: ride.userId must match requesting user");
    }

    const allRides = getCollection<Ride>(STORAGE_KEYS.RIDES);
    const index = allRides.findIndex((r) => r.id === ride.id);

    if (index >= 0) {
      if (allRides[index].userId !== userId) {
        throw new SecurityError("Data isolation violation: Attempted unauthorized update of another user's ride record");
      }
      allRides[index] = { ...allRides[index], ...ride, updatedAt: new Date().toISOString() };
    } else {
      allRides.push(ride);
    }

    saveCollection(STORAGE_KEYS.RIDES, allRides);
    return ride;
  },

  deleteRide(userId: string, rideId: string): boolean {
    if (!userId) throw new SecurityError("User ID is required");
    const allRides = getCollection<Ride>(STORAGE_KEYS.RIDES);
    const ride = allRides.find((r) => r.id === rideId);
    if (!ride) return false;
    if (ride.userId !== userId) {
      throw new SecurityError("Data isolation violation: Attempted unauthorized deletion of another user's ride record");
    }
    const filtered = allRides.filter((r) => r.id !== rideId);
    saveCollection(STORAGE_KEYS.RIDES, filtered);
    return true;
  },

  // Expenses (isolated per user)
  getExpenses(userId: string, workSessionId?: string | null): Expense[] {
    if (!userId) throw new SecurityError("User ID is required");
    const allExpenses = getCollection<Expense>(STORAGE_KEYS.EXPENSES);
    return allExpenses
      .filter((e) => e.userId === userId && (!workSessionId || e.workSessionId === workSessionId))
      .sort((a, b) => new Date(b.expenseTime).getTime() - new Date(a.expenseTime).getTime());
  },

  getExpenseById(userId: string, expenseId: string): Expense | null {
    if (!userId) throw new SecurityError("User ID is required");
    const allExpenses = getCollection<Expense>(STORAGE_KEYS.EXPENSES);
    const expense = allExpenses.find((e) => e.id === expenseId);
    if (!expense) return null;
    if (expense.userId !== userId) {
      throw new SecurityError("Data isolation violation: Attempted unauthorized read of another user's expense record");
    }
    return expense;
  },

  saveExpense(userId: string, expense: Expense): Expense {
    if (!userId) throw new SecurityError("User ID is required");
    if (expense.userId !== userId) {
      throw new SecurityError("Data isolation violation: expense.userId must match requesting user");
    }

    const allExpenses = getCollection<Expense>(STORAGE_KEYS.EXPENSES);
    const index = allExpenses.findIndex((e) => e.id === expense.id);

    if (index >= 0) {
      if (allExpenses[index].userId !== userId) {
        throw new SecurityError("Data isolation violation: Attempted unauthorized update of another user's expense record");
      }
      allExpenses[index] = { ...allExpenses[index], ...expense, updatedAt: new Date().toISOString() };
    } else {
      allExpenses.push(expense);
    }

    saveCollection(STORAGE_KEYS.EXPENSES, allExpenses);
    return expense;
  },

  deleteExpense(userId: string, expenseId: string): boolean {
    if (!userId) throw new SecurityError("User ID is required");
    const allExpenses = getCollection<Expense>(STORAGE_KEYS.EXPENSES);
    const expense = allExpenses.find((e) => e.id === expenseId);
    if (!expense) return false;
    if (expense.userId !== userId) {
      throw new SecurityError("Data isolation violation: Attempted unauthorized deletion of another user's expense record");
    }
    const filtered = allExpenses.filter((e) => e.id !== expenseId);
    saveCollection(STORAGE_KEYS.EXPENSES, filtered);
    return true;
  },

  // Auth Session persistence (Survives refreshes, explicit logout clears token but NEVER deletes financial data)
  getStoredAuthSession(): { userId: string; email: string } | null {
    const raw = getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setStoredAuthSession(session: { userId: string; email: string } | null): void {
    if (!session) {
      // Explicit logout: remove current auth session token only. Financial records in other keys remain 100% intact!
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
        } catch {
          // ignore
        }
      }
      delete memoryStore[STORAGE_KEYS.CURRENT_SESSION];
    } else {
      setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    }
  },

  // Test utility to clear memory store
  _resetStore(): void {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch {
        // ignore
      }
    }
  },
};
