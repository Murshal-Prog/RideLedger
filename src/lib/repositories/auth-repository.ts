import { User, UserProfile, AuthSession } from "@/lib/types/models";
import { loginSchema, signupSchema, LoginInput, SignupInput } from "@/lib/validations/auth";
import { StorageAdapter } from "./storage-adapter";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Default pre-seeded demo user for immediate evaluation and test environments
export const DEMO_USER: User = {
  id: "00000000-0000-0000-0000-000000004091",
  email: "captain@rideledger.local",
  createdAt: "2026-10-14T00:00:00.000Z",
};

export const DEMO_PROFILE: UserProfile = {
  id: DEMO_USER.id,
  fullName: "Rapido Captain Partner",
  partnerId: "RAP-4091",
  phoneNumber: "+91 98765 43210",
  vehicleType: "Two-Wheeler (Motorcycle)",
  vehicleNumber: "MH 02 AB 1234",
  dailyTargetInr: 1500.0,
  initialOdometer: 14250.0,
  createdAt: "2026-10-14T00:00:00.000Z",
  updatedAt: "2026-10-14T00:00:00.000Z",
};

export const AuthRepository = {
  async getSession(): Promise<AuthSession | null> {
    // 1. Supabase Mode if configured
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) return null;
        const supaUser = data.session.user;
        const user: User = {
          id: supaUser.id,
          email: supaUser.email || "",
          createdAt: supaUser.created_at,
        };
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const profile: UserProfile = profileData
          ? {
              id: profileData.id,
              fullName: profileData.full_name,
              partnerId: profileData.partner_id,
              phoneNumber: profileData.phone_number,
              vehicleType: profileData.vehicle_type,
              vehicleNumber: profileData.vehicle_number,
              dailyTargetInr: Number(profileData.daily_target_inr),
              initialOdometer: Number(profileData.initial_odometer),
              createdAt: profileData.created_at,
              updatedAt: profileData.updated_at,
            }
          : {
              id: user.id,
              fullName: supaUser.user_metadata?.full_name || "Rapido Captain",
              partnerId: supaUser.user_metadata?.partner_id || "RAP-" + user.id.slice(0, 4),
              vehicleType: "Two-Wheeler (Motorcycle)",
              dailyTargetInr: 1500,
              initialOdometer: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

        return { user, profile, token: data.session.access_token, expiresAt: data.session.expires_at };
      }
    }

    // 2. Local Persistent Storage fallback mode
    const stored = StorageAdapter.getStoredAuthSession();
    if (!stored) return null;

    let profile = StorageAdapter.getProfile(stored.userId);
    if (!profile) {
      if (stored.userId === DEMO_USER.id) {
        profile = StorageAdapter.saveProfile(DEMO_PROFILE);
      } else {
        profile = StorageAdapter.saveProfile({
          id: stored.userId,
          fullName: "Rapido Captain",
          partnerId: "RAP-" + stored.userId.slice(0, 4),
          vehicleType: "Two-Wheeler (Motorcycle)",
          dailyTargetInr: 1500,
          initialOdometer: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const user: User = {
      id: stored.userId,
      email: stored.email,
      createdAt: profile.createdAt,
    };

    return { user, profile };
  },

  async signIn(input: LoginInput): Promise<AuthSession> {
    const validated = loginSchema.parse(input);

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        });
        if (error || !data.user || !data.session) {
          throw new Error(error?.message || "Invalid credentials");
        }
        const session = await this.getSession();
        if (!session) throw new Error("Failed to load session after login");
        return session;
      }
    }

    // Local / Offline fallback
    // Check if demo user
    let userId: string;
    let email = validated.email.toLowerCase();

    if (email === DEMO_USER.email.toLowerCase() || email === "demo@rideledger.com") {
      userId = DEMO_USER.id;
      if (!StorageAdapter.getProfile(userId)) {
        StorageAdapter.saveProfile(DEMO_PROFILE);
      }
    } else {
      // Deterministic UUID for any custom email in local mode
      userId = `usr-${btoa(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16).padEnd(16, "0")}`;
      if (!StorageAdapter.getProfile(userId)) {
        StorageAdapter.saveProfile({
          id: userId,
          fullName: email.split("@")[0],
          partnerId: "RAP-" + Math.floor(1000 + Math.random() * 9000),
          vehicleType: "Two-Wheeler (Motorcycle)",
          dailyTargetInr: 1500,
          initialOdometer: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    StorageAdapter.setStoredAuthSession({ userId, email });
    const session = await this.getSession();
    if (!session) throw new Error("Could not retrieve session after authentication");
    return session;
  },

  async signUp(input: SignupInput): Promise<AuthSession> {
    const validated = signupSchema.parse(input);

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            data: {
              full_name: validated.fullName,
              partner_id: validated.partnerId,
            },
          },
        });
        if (error || !data.user) {
          throw new Error(error?.message || "Registration failed");
        }
        // If auto-logged in or session created:
        const session = await this.getSession();
        if (session) return session;
      }
    }

    // Local storage mode:
    const email = validated.email.toLowerCase();
    const userId = `usr-${btoa(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16).padEnd(16, "0")}`;

    const newProfile: UserProfile = {
      id: userId,
      fullName: validated.fullName,
      partnerId: validated.partnerId,
      phoneNumber: validated.phoneNumber || null,
      vehicleType: "Two-Wheeler (Motorcycle)",
      vehicleNumber: validated.vehicleNumber || null,
      dailyTargetInr: validated.dailyTargetInr,
      initialOdometer: validated.initialOdometer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAdapter.saveProfile(newProfile);
    StorageAdapter.setStoredAuthSession({ userId, email });

    const session = await this.getSession();
    if (!session) throw new Error("Registration succeeded but session could not be established");
    return session;
  },

  async signOut(): Promise<void> {
    // Explicit logout only
    // DOES NOT DELETE FINANCIAL RECORDS
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    // Clear the active session token only
    StorageAdapter.setStoredAuthSession(null);
  },
};
