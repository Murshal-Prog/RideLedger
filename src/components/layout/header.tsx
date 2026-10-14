"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sun, Moon, Bell, User } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { StatusIndicator } from "./status-indicator";

interface HeaderProps {
  onOpenGoOnline?: () => void;
  onOpenGoOffline?: () => void;
}

export function Header({}: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
      {/* Mobile brand header (desktop logo is in sidebar) */}
      <div className="flex items-center gap-3 md:hidden">
        <Link href="/" className="flex items-center gap-2" aria-label="RideLedger Home">
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/brand/RideLedger_Logo_v4.png"
              alt="RideLedger Icon"
              fill
              sizes="32px"
              priority
              className="object-contain"
            />
          </div>
          <span className="font-bold text-base tracking-tight">RideLedger</span>
        </Link>
      </div>

      {/* Desktop view title / breadcrumb */}
      <div className="hidden md:flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          Captain Dashboard
        </h1>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
          Rapido Partner
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Badge */}
        <StatusIndicator />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {/* Notifications placeholder */}
        <button
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* Captain profile placeholder */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-foreground font-semibold flex items-center justify-center text-xs border border-primary/30">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold leading-none">Captain</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">ID: #RAP-4091</p>
          </div>
        </div>
      </div>
    </header>
  );
}
