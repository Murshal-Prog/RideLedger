"use client";

import React from "react";
import { Gauge, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { useWorkSession } from "@/context/work-session-context";

export default function SessionsPage() {
  const { status, activeSession, lastOdometer, elapsedFormatted } = useWorkSession();
  const isOnline = status === "online";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Work Sessions & Odometer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review shift durations, starting and ending odometer readings, and distance travelled.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Current State</span>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={isOnline ? "online" : "offline"} dot>
              {isOnline ? "SESSION ACTIVE" : "OFFLINE"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isOnline ? `Elapsed: ${elapsedFormatted}` : "No active session in progress"}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Last Recorded Odometer</span>
          <p className="text-2xl font-bold font-mono mt-1">{lastOdometer} km</p>
          <p className="text-xs text-muted-foreground mt-1">Verified benchmark for next shift</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Kilometres Logged</span>
          <p className="text-2xl font-bold font-mono mt-1">0.0 km</p>
          <p className="text-xs text-muted-foreground mt-1">Sum of completed work sessions</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Gauge className="w-8 h-8 text-primary" />}
            title="No Completed Sessions Found"
            description="Start and complete shifts by recording odometer readings. Completed sessions with distance and duration will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
