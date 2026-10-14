import { WorkSession } from "@/lib/types/models";
import {
  startSessionSchema,
  endSessionSchema,
  StartSessionInput,
  EndSessionInput,
} from "@/lib/validations/work-session";
import { StorageAdapter, SecurityError } from "./storage-adapter";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const WorkSessionRepository = {
  async getActiveSession(userId: string): Promise<WorkSession | null> {
    if (!userId) throw new SecurityError("User ID is required");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("work_sessions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle();

        if (error || !data) return null;
        return {
          id: data.id,
          userId: data.user_id,
          status: data.status,
          startTime: data.start_time,
          endTime: data.end_time,
          startingOdometer: Number(data.starting_odometer),
          endingOdometer: data.ending_odometer !== null ? Number(data.ending_odometer) : null,
          distanceKm: data.distance_km !== null ? Number(data.distance_km) : null,
          durationSeconds: data.duration_seconds,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    return StorageAdapter.getActiveSession(userId);
  },

  async startSession(userId: string, input: StartSessionInput): Promise<WorkSession> {
    if (!userId) throw new SecurityError("User ID is required");
    const validated = startSessionSchema.parse(input);

    const active = await this.getActiveSession(userId);
    if (active) {
      throw new Error("Active session already exists. End active session before starting a new one.");
    }

    const startTime = validated.startTime || new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("work_sessions")
          .insert({
            user_id: userId,
            status: "active",
            start_time: startTime,
            starting_odometer: validated.startingOdometer,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Failed to start session in database");
        }

        return {
          id: data.id,
          userId: data.user_id,
          status: data.status,
          startTime: data.start_time,
          endTime: data.end_time,
          startingOdometer: Number(data.starting_odometer),
          endingOdometer: null,
          distanceKm: null,
          durationSeconds: null,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const session: WorkSession = {
      id: "ws-" + crypto.randomUUID(),
      userId,
      status: "active",
      startTime,
      startingOdometer: validated.startingOdometer,
      endingOdometer: null,
      distanceKm: null,
      durationSeconds: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return StorageAdapter.saveSession(userId, session);
  },

  async endSession(
    userId: string,
    sessionId: string,
    input: EndSessionInput
  ): Promise<WorkSession> {
    if (!userId) throw new SecurityError("User ID is required");
    const validated = endSessionSchema.parse(input);
    const endTime = validated.endTime || new Date().toISOString();
    const distanceKm = Number((validated.endingOdometer - validated.startingOdometer).toFixed(1));

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data: existing } = await supabase
          .from("work_sessions")
          .select("start_time")
          .eq("id", sessionId)
          .eq("user_id", userId)
          .single();

        const durationSeconds = existing
          ? Math.max(0, Math.floor((new Date(endTime).getTime() - new Date(existing.start_time).getTime()) / 1000))
          : 0;

        const { data, error } = await supabase
          .from("work_sessions")
          .update({
            status: "completed",
            end_time: endTime,
            ending_odometer: validated.endingOdometer,
            duration_seconds: durationSeconds,
          })
          .eq("id", sessionId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Failed to conclude work session");
        }

        return {
          id: data.id,
          userId: data.user_id,
          status: data.status,
          startTime: data.start_time,
          endTime: data.end_time,
          startingOdometer: Number(data.starting_odometer),
          endingOdometer: Number(data.ending_odometer),
          distanceKm: Number(data.distance_km),
          durationSeconds: data.duration_seconds,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const sessions = StorageAdapter.getSessions(userId);
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error("Work session not found");
    if (session.userId !== userId) {
      throw new SecurityError("Unauthorized modification of another user's work session");
    }

    const durationSeconds = Math.max(
      0,
      Math.floor((new Date(endTime).getTime() - new Date(session.startTime).getTime()) / 1000)
    );

    const completed: WorkSession = {
      ...session,
      status: "completed",
      endTime,
      endingOdometer: validated.endingOdometer,
      distanceKm,
      durationSeconds,
      updatedAt: new Date().toISOString(),
    };

    return StorageAdapter.saveSession(userId, completed);
  },

  async listSessions(userId: string): Promise<WorkSession[]> {
    if (!userId) throw new SecurityError("User ID is required");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("work_sessions")
          .select("*")
          .eq("user_id", userId)
          .order("start_time", { ascending: false });

        if (error || !data) return [];
        return data.map((d) => ({
          id: d.id,
          userId: d.user_id,
          status: d.status,
          startTime: d.start_time,
          endTime: d.end_time,
          startingOdometer: Number(d.starting_odometer),
          endingOdometer: d.ending_odometer !== null ? Number(d.ending_odometer) : null,
          distanceKm: d.distance_km !== null ? Number(d.distance_km) : null,
          durationSeconds: d.duration_seconds,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }

    return StorageAdapter.getSessions(userId);
  },
};
