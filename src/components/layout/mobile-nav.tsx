"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bike,
  Receipt,
  BarChart2,
  Power,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkSession } from "@/context/work-session-context";

interface MobileNavProps {
  onOpenGoOnline?: () => void;
  onOpenGoOffline?: () => void;
}

export function MobileNav({ onOpenGoOnline, onOpenGoOffline }: MobileNavProps) {
  const pathname = usePathname();
  const { status } = useWorkSession();
  const isOnline = status === "online";

  const handleCenterAction = () => {
    if (isOnline) {
      if (onOpenGoOffline) onOpenGoOffline();
    } else {
      if (onOpenGoOnline) onOpenGoOnline();
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-card/95 backdrop-blur-md px-2 py-1 safe-area-bottom select-none"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {/* Dashboard */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors",
            pathname === "/" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </Link>

        {/* Rides */}
        <Link
          href="/rides"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors",
            pathname === "/rides" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Bike className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Rides</span>
        </Link>

        {/* Center Action: Online/Offline Toggle */}
        <div className="flex items-center justify-center flex-1 h-full">
          <button
            onClick={handleCenterAction}
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-full shadow-md transition-transform active:scale-90 text-white",
              isOnline
                ? "bg-rose-600 hover:bg-rose-700 ring-2 ring-rose-500/30"
                : "bg-emerald-500 hover:bg-emerald-600 ring-2 ring-emerald-400/30"
            )}
            aria-label={isOnline ? "Go Offline" : "Go Online"}
            title={isOnline ? "Go Offline" : "Go Online"}
          >
            <Power className="w-5 h-5" />
          </button>
        </div>

        {/* Expenses */}
        <Link
          href="/expenses"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors",
            pathname === "/expenses" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Expenses</span>
        </Link>

        {/* Reports */}
        <Link
          href="/reports"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors",
            pathname === "/reports" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Reports</span>
        </Link>
      </div>
    </nav>
  );
}
