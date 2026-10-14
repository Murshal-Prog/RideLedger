"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all",
        interactive &&
          "hover:border-primary/50 hover:shadow-md cursor-pointer active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1 p-5 pb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold leading-tight tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-5 pt-0 border-t border-border/50 mt-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface StatCardProps {
  title: string;
  value: string;
  isPlaceholder?: boolean;
  placeholderNotice?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  variant?: "default" | "success" | "accent" | "danger";
  className?: string;
}

export function StatCard({
  title,
  value,
  isPlaceholder = false,
  placeholderNotice = "Awaiting session entries",
  icon,
  subtitle,
  badge,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        variant === "success" && "border-emerald-500/20 dark:border-emerald-500/30",
        variant === "accent" && "border-amber-500/20 dark:border-amber-500/30",
        variant === "danger" && "border-rose-500/20 dark:border-rose-500/30",
        className
      )}
    >
      <div className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          {icon && (
            <div className="p-2 rounded-lg bg-secondary/80 text-foreground shrink-0">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-2xl font-bold tracking-tight font-mono",
                isPlaceholder && "text-muted-foreground/80 font-normal tracking-normal"
              )}
            >
              {value}
            </span>
            {badge}
          </div>

          {isPlaceholder ? (
            <span className="inline-block mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {placeholderNotice}
            </span>
          ) : subtitle ? (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
