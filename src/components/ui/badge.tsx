"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "online"
    | "offline"
    | "success"
    | "warning"
    | "danger"
    | "accent"
    | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full select-none",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        // Variants
        variant === "default" &&
          "bg-secondary text-secondary-foreground border border-border/50",
        variant === "online" &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        variant === "offline" &&
          "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
        variant === "success" &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        variant === "warning" &&
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        variant === "danger" &&
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        variant === "accent" &&
          "bg-accent-amber/15 text-amber-700 dark:text-amber-300 border border-accent-amber/30",
        variant === "outline" && "border border-border text-muted-foreground",
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "online" && "bg-emerald-500 animate-pulse",
            variant === "offline" && "bg-slate-400",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "danger" && "bg-rose-500",
            variant === "accent" && "bg-amber-500",
            variant === "default" && "bg-muted-foreground",
            variant === "outline" && "bg-muted-foreground"
          )}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
