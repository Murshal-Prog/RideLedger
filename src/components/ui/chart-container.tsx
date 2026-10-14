"use client";

import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";
import { cn } from "@/lib/utils";

export interface ChartContainerProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  action,
  isEmpty = false,
  emptyTitle = "No Activity Data Available",
  emptyDescription = "Chart trends will populate automatically once rides and expenses are recorded.",
  isLoading = false,
  children,
  className,
}: ChartContainerProps) {
  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>{title}</span>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs">Loading analytics data...</p>
          </div>
        ) : isEmpty ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 p-6 text-center border border-dashed border-border rounded-xl bg-muted/20">
            <div className="p-3 rounded-full bg-secondary text-muted-foreground">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div className="max-w-xs">
              <h4 className="text-sm font-semibold text-foreground">{emptyTitle}</h4>
              <p className="text-xs text-muted-foreground mt-1">{emptyDescription}</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 min-h-[250px]">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
