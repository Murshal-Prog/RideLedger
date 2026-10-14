"use client";

import React from "react";
import { BarChart2, Download, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart-container";
import { useToast } from "@/context/toast-context";

export default function ReportsPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monthly Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Historical profit margins, daily trends, and Excel exports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            October 2026
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() =>
              toast.info("XLSX Export", "Full ExcelJS export engine will activate in Phase 7.")
            }
          >
            Export XLSX
          </Button>
        </div>
      </div>

      <ChartContainer
        title="Income vs Expenses Overview"
        description="Daily breakdown of gross revenue against total expenditures."
        isEmpty
        emptyTitle="No Monthly Aggregation Data"
        emptyDescription="Data will populate as shifts and rides are finalized across the month."
      />
    </div>
  );
}
