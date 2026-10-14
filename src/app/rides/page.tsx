"use client";

import React from "react";
import { Bike, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useWorkSession } from "@/context/work-session-context";
import { useToast } from "@/context/toast-context";

export default function RidesPage() {
  const { status } = useWorkSession();
  const { toast } = useToast();
  const isOnline = status === "online";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ride Records</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Individual trip fares, incentives, tips, and payment methods.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="md"
            disabled={!isOnline}
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => toast.info("Add Ride", "Ride record modal will open.")}
          >
            {isOnline ? "Record Ride" : "Offline (Go Online to Record)"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Today&apos;s Ride Log</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Bike className="w-8 h-8 text-primary" />}
            title="No Rides Logged Yet"
            description="When you complete a passenger or delivery trip, click 'Record Ride' to log the base fare, Rapido incentives, and customer tips."
          />
        </CardContent>
      </Card>
    </div>
  );
}
