"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sun, Moon, Bell, User, LogOut, LogIn } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { StatusIndicator } from "./status-indicator";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/context/toast-context";

interface HeaderProps {
  onOpenGoOnline?: () => void;
  onOpenGoOffline?: () => void;
}

export function Header({}: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { showToast } = useToast();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setIsLogoutModalOpen(false);
      showToast({
        title: "Signed Out",
        description: "You have been signed out. Your financial records are safely preserved.",
        type: "info",
      });
    } catch {
      showToast({
        title: "Sign Out Failed",
        description: "An unexpected error occurred while signing out.",
        type: "error",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
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
          <span className="text-lg font-bold tracking-tight text-foreground">
            Captain Dashboard
          </span>
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

          {/* Authentication & Profile Section */}
          {isAuthenticated && profile ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Link
                href="/settings"
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted/70 transition-colors"
                title="View Captain Profile & Settings"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-foreground font-semibold flex items-center justify-center text-xs border border-primary/30">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold leading-none text-foreground truncate max-w-[120px]">
                    {profile.fullName}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {profile.partnerId}
                  </p>
                </div>
              </Link>

              {/* Explicit Sign Out Button */}
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Sign Out"
                title="Sign Out (Preserves Financial Data)"
                data-testid="header-signout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Explicit Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of RideLedger?"
        message="Are you sure you want to sign out? Your stored rides, fuel expenses, and odometer history will remain safely preserved on this device."
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="warning"
        isLoading={isLoggingOut}
      />
    </>
  );
}
