import { UserProfile } from "@/lib/types/models";
import { updateProfileSchema, UpdateProfileInput } from "@/lib/validations/user-profile";
import { StorageAdapter, SecurityError } from "./storage-adapter";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const UserRepository = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) throw new SecurityError("User ID is required to fetch profile");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error || !data) return null;
        return {
          id: data.id,
          fullName: data.full_name,
          partnerId: data.partner_id,
          phoneNumber: data.phone_number,
          vehicleType: data.vehicle_type,
          vehicleNumber: data.vehicle_number,
          dailyTargetInr: Number(data.daily_target_inr),
          initialOdometer: Number(data.initial_odometer),
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    return StorageAdapter.getProfile(userId);
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    if (!userId) throw new SecurityError("User ID is required to update profile");
    const validated = updateProfileSchema.parse(input);

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const updatePayload: Record<string, unknown> = {};
        if (validated.fullName !== undefined) updatePayload.full_name = validated.fullName;
        if (validated.partnerId !== undefined) updatePayload.partner_id = validated.partnerId;
        if (validated.phoneNumber !== undefined) updatePayload.phone_number = validated.phoneNumber;
        if (validated.vehicleType !== undefined) updatePayload.vehicle_type = validated.vehicleType;
        if (validated.vehicleNumber !== undefined) updatePayload.vehicle_number = validated.vehicleNumber;
        if (validated.dailyTargetInr !== undefined) updatePayload.daily_target_inr = validated.dailyTargetInr;
        if (validated.initialOdometer !== undefined) updatePayload.initial_odometer = validated.initialOdometer;

        const { data, error } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId)
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Failed to update profile");
        }

        return {
          id: data.id,
          fullName: data.full_name,
          partnerId: data.partner_id,
          phoneNumber: data.phone_number,
          vehicleType: data.vehicle_type,
          vehicleNumber: data.vehicle_number,
          dailyTargetInr: Number(data.daily_target_inr),
          initialOdometer: Number(data.initial_odometer),
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const existing = StorageAdapter.getProfile(userId);
    if (!existing) throw new Error("Profile not found");

    const updated: UserProfile = {
      ...existing,
      ...validated,
      updatedAt: new Date().toISOString(),
    };

    return StorageAdapter.saveProfile(updated);
  },
};
