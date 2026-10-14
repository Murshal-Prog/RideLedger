"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type SessionState = "offline" | "starting" | "online" | "ending";

export interface ActiveSession {
  id: string;
  startTime: string; // ISO string
  startTimestamp: number;
  startingOdometer: number;
}

interface WorkSessionContextType {
  status: SessionState;
  activeSession: ActiveSession | null;
  elapsedSeconds: number;
  elapsedFormatted: string;
  lastOdometer: number;
  goOnline: (startingOdo: number) => Promise<{ success: boolean; error?: string }>;
  goOffline: (endingOdo: number) => Promise<{ success: boolean; distance?: number; error?: string }>;
}

const WorkSessionContext = createContext<WorkSessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "rideledger-active-session";
const LAST_ODO_KEY = "rideledger-last-odometer";

export function WorkSessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionState>("offline");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [lastOdometer, setLastOdometer] = useState<number>(12450); // realistic starting fallback

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const storedOdo = localStorage.getItem(LAST_ODO_KEY);
      if (storedOdo) {
        const parsed = parseFloat(storedOdo);
        if (!isNaN(parsed)) setLastOdometer(parsed);
      }

      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsed: ActiveSession = JSON.parse(storedSession);
        if (parsed.startTime && parsed.startTimestamp) {
          setActiveSession(parsed);
          setStatus("online");
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Live timer calculated from unambiguous start timestamp
  useEffect(() => {
    if (status !== "online" || !activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - activeSession.startTimestamp) / 1000));
      setElapsedSeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status, activeSession]);

  const formatElapsed = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const goOnline = useCallback(
    async (startingOdo: number): Promise<{ success: boolean; error?: string }> => {
      if (startingOdo <= 0) {
        return { success: false, error: "Starting odometer must be greater than zero." };
      }
      if (startingOdo < lastOdometer) {
        return {
          success: false,
          error: `Starting odometer (${startingOdo}) cannot be less than previous recorded reading (${lastOdometer}).`,
        };
      }

      const session: ActiveSession = {
        id: `sess_${Date.now()}`,
        startTime: new Date().toISOString(),
        startTimestamp: Date.now(),
        startingOdometer: startingOdo,
      };

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        localStorage.setItem(LAST_ODO_KEY, startingOdo.toString());
      } catch {
        // Continue even if storage unavailable
      }

      setActiveSession(session);
      setLastOdometer(startingOdo);
      setStatus("online");
      return { success: true };
    },
    [lastOdometer]
  );

  const goOffline = useCallback(
    async (
      endingOdo: number
    ): Promise<{ success: boolean; distance?: number; error?: string }> => {
      if (!activeSession) {
        return { success: false, error: "No active session found to close." };
      }
      if (endingOdo < activeSession.startingOdometer) {
        return {
          success: false,
          error: `Ending odometer (${endingOdo}) cannot be less than starting odometer (${activeSession.startingOdometer}).`,
        };
      }

      const distance = Math.round((endingOdo - activeSession.startingOdometer) * 10) / 10;

      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.setItem(LAST_ODO_KEY, endingOdo.toString());
      } catch {
        // Continue even if storage unavailable
      }

      setActiveSession(null);
      setLastOdometer(endingOdo);
      setStatus("offline");
      return { success: true, distance };
    },
    [activeSession]
  );

  return (
    <WorkSessionContext.Provider
      value={{
        status,
        activeSession,
        elapsedSeconds,
        elapsedFormatted: formatElapsed(elapsedSeconds),
        lastOdometer,
        goOnline,
        goOffline,
      }}
    >
      {children}
    </WorkSessionContext.Provider>
  );
}

export function useWorkSession() {
  const context = useContext(WorkSessionContext);
  if (!context) {
    throw new Error("useWorkSession must be used within a WorkSessionProvider");
  }
  return context;
}
