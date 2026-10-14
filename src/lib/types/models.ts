// Domain Models for RideLedger Data Layer

export type PaymentMethod = "cash" | "upi";

export type SessionStatus = "active" | "completed" | "cancelled";

export type ExpenseCategory =
  | "fuel"
  | "maintenance"
  | "food_water"
  | "parking_tolls"
  | "mobile_recharge"
  | "insurance"
  | "vehicle_emi"
  | "riding_equipment"
  | "platform_charges"
  | "other";

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  partnerId: string;
  phoneNumber?: string | null;
  vehicleType: string;
  vehicleNumber?: string | null;
  dailyTargetInr: number;
  initialOdometer: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkSession {
  id: string;
  userId: string;
  status: SessionStatus;
  startTime: string; // ISO UTC
  endTime?: string | null; // ISO UTC
  startingOdometer: number;
  endingOdometer?: number | null;
  distanceKm?: number | null;
  durationSeconds?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ride {
  id: string;
  userId: string;
  workSessionId?: string | null;
  rideTime: string; // ISO UTC
  earningInr: number;
  incentiveInr: number;
  tipInr: number;
  totalIncomeInr: number;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  workSessionId?: string | null;
  expenseTime: string; // ISO UTC
  category: ExpenseCategory;
  customCategory?: string | null;
  description: string;
  amountInr: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  profile: UserProfile;
  token?: string;
  expiresAt?: number;
}
