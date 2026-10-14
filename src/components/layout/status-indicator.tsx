"use client";

import React from "react";
import { useWorkSession } from "@/context/work-session-context";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusIndicator({ compact = false }: { compact?: boolean }) {
  const { status, elapsedFormatted } = useWorkSession();
  const isOnline = status === "online";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
        isOnline
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
          : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
      )}
      role="status"
      aria-label={`Session Status: ${isOnline ? "Online" : "Offline"}`}
    >
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            isOnline ? "bg-emerald-500" : "bg-slate-400"
          )}
        />
      </span>

      <span className="font-semibold tracking-wide">
        {isOnline ? "ONLINE" : "OFFLINE"}
      </span>

      {isOnline && !compact && (
        <span className="flex items-center gap-1 pl-1 border-l border-emerald-500/30 font-mono text-[11px]">
          <Clock className="w-3 h-3 opacity-80" />
          <span>{elapsedFormatted}</span>
        </span>
      )}
    </div>
  );
}
