"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bike,
  Receipt,
  BarChart2,
  Gauge,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkSession } from "@/context/work-session-context";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Rides", href: "/rides", icon: Bike },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Reports", href: "/reports", icon: BarChart2 },
  { name: "Sessions & Odometer", href: "/sessions", icon: Gauge },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { status, activeSession, elapsedFormatted, lastOdometer } = useWorkSession();
  const isOnline = status === "online";

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0 h-screen sticky top-0 z-40 select-none">
      {/* Brand Header with Logo v5 */}
      <div className="h-16 flex items-center px-6 border-b border-border/70">
        <Link href="/" className="flex items-center gap-3 w-full" aria-label="RideLedger Dashboard">
          <div className="relative h-10 w-44">
            <Image
              src="/brand/RideLedger_Logo_v5.png"
              alt="RideLedger Logo"
              fill
              sizes="176px"
              priority
              className="object-contain object-left"
            />
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/15 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Active Work Session Quick Card */}
      <div className="p-4 border-t border-border/70">
        <div className="p-3.5 rounded-xl bg-secondary/70 border border-border/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Current Session
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                isOnline
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-500/10 text-slate-500"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                )}
              />
              {isOnline ? "ACTIVE" : "OFFLINE"}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs text-muted-foreground">Odometer:</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {activeSession ? `${activeSession.startingOdometer} km` : `${lastOdometer} km`}
            </span>
          </div>

          {isOnline && (
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-muted-foreground">Duration:</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {elapsedFormatted}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="text-[11px]">v0.1.0 (Phase 1)</span>
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="text-[11px]">Help</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
