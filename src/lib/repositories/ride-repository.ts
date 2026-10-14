import { Ride } from "@/lib/types/models";
import { createRideSchema, CreateRideInput } from "@/lib/validations/ride";
import { StorageAdapter, SecurityError } from "./storage-adapter";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const RideRepository = {
  async createRide(userId: string, input: CreateRideInput): Promise<Ride> {
    if (!userId) throw new SecurityError("User ID is required to create a ride record");
    const validated = createRideSchema.parse(input);

    const earningInr = Number(validated.earningInr.toFixed(2));
    const incentiveInr = Number((validated.incentiveInr ?? 0).toFixed(2));
    const tipInr = Number((validated.tipInr ?? 0).toFixed(2));
    const totalIncomeInr = Number((earningInr + incentiveInr + tipInr).toFixed(2));
    const rideTime = validated.rideTime || new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("rides")
          .insert({
            user_id: userId,
            work_session_id: validated.workSessionId || null,
            ride_time: rideTime,
            earning_inr: earningInr,
            incentive_inr: incentiveInr,
            tip_inr: tipInr,
            payment_method: validated.paymentMethod,
            notes: validated.notes || null,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Failed to record ride");
        }

        return {
          id: data.id,
          userId: data.user_id,
          workSessionId: data.work_session_id,
          rideTime: data.ride_time,
          earningInr: Number(data.earning_inr),
          incentiveInr: Number(data.incentive_inr),
          tipInr: Number(data.tip_inr),
          totalIncomeInr: Number(data.total_income_inr),
          paymentMethod: data.payment_method,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const ride: Ride = {
      id: "ride-" + crypto.randomUUID(),
      userId,
      workSessionId: validated.workSessionId || null,
      rideTime,
      earningInr,
      incentiveInr,
      tipInr,
      totalIncomeInr,
      paymentMethod: validated.paymentMethod,
      notes: validated.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return StorageAdapter.saveRide(userId, ride);
  },

  async getRides(userId: string, workSessionId?: string | null): Promise<Ride[]> {
    if (!userId) throw new SecurityError("User ID is required to fetch ride records");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let query = supabase
          .from("rides")
          .select("*")
          .eq("user_id", userId)
          .order("ride_time", { ascending: false });

        if (workSessionId) {
          query = query.eq("work_session_id", workSessionId);
        }

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map((d) => ({
          id: d.id,
          userId: d.user_id,
          workSessionId: d.work_session_id,
          rideTime: d.ride_time,
          earningInr: Number(d.earning_inr),
          incentiveInr: Number(d.incentive_inr),
          tipInr: Number(d.tip_inr),
          totalIncomeInr: Number(d.total_income_inr),
          paymentMethod: d.payment_method,
          notes: d.notes,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }

    return StorageAdapter.getRides(userId, workSessionId);
  },

  async getRideById(userId: string, rideId: string): Promise<Ride | null> {
    if (!userId) throw new SecurityError("User ID is required");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("rides")
          .select("*")
          .eq("id", rideId)
          .eq("user_id", userId)
          .maybeSingle();

        if (error || !data) return null;
        return {
          id: data.id,
          userId: data.user_id,
          workSessionId: data.work_session_id,
          rideTime: data.ride_time,
          earningInr: Number(data.earning_inr),
          incentiveInr: Number(data.incentive_inr),
          tipInr: Number(data.tip_inr),
          totalIncomeInr: Number(data.total_income_inr),
          paymentMethod: data.payment_method,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    return StorageAdapter.getRideById(userId, rideId);
  },

  async deleteRide(userId: string, rideId: string): Promise<boolean> {
    if (!userId) throw new SecurityError("User ID is required");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase
          .from("rides")
          .delete()
          .eq("id", rideId)
          .eq("user_id", userId);
        return !error;
      }
    }

    return StorageAdapter.deleteRide(userId, rideId);
  },
};
