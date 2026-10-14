"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Bell,
  Info,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/context/toast-context";

interface HeaderProps {
  onOpenGoOnline?: () => void;
  onOpenGoOffline?: () => void;
}

export function Header({}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { showToast } = useToast();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const getPageTitle = () => {
    switch (pathname) {
      case "/rides":
        return "Transactions";
      case "/expenses":
        return "Invoices";
      case "/reports":
        return "Analytics";
      case "/sessions":
        return "Recurring";
      case "/settings":
        return "Subscriptions";
      case "/login":
        return "Sign In";
      case "/signup":
        return "Register";
      default:
        return "Dashboard";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1c2027] bg-[#0d0f12]/95 px-4 backdrop-blur sm:px-6">
        {/* Left: Navigation Buttons & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile brand header (desktop logo is in sidebar) */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/" className="flex items-center gap-2" aria-label="RideLedger Home">
              <div className="relative h-7 w-7 shrink-0">
                <Image
                  src="/brand/RideLedger_Logo_v4.png"
                  alt="RideLedger Icon"
                  fill
                  sizes="28px"
                  priority
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">RideLedger</span>
            </Link>
          </div>

          {/* Desktop arrow buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-xl bg-[#16191e] border border-[#232730] flex items-center justify-center text-[#808996] hover:text-white hover:border-[#2f3542] transition-colors"
              aria-label="Go back"
              title="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => router.forward()}
              className="w-8 h-8 rounded-xl bg-[#16191e] border border-[#232730] flex items-center justify-center text-[#808996] hover:text-white hover:border-[#2f3542] transition-colors"
              aria-label="Go forward"
              title="Go forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Breadcrumb Capsules */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-[#4b5563]">/</span>
            <Link
              href="/"
              className="px-3 py-1 rounded-xl bg-[#16191e] border border-[#232730] text-white font-medium hover:border-[#2f3542] transition-colors"
            >
              Finance
            </Link>
            <span className="text-[#4b5563]">/</span>
            <span className="px-3 py-1 rounded-xl bg-[#16191e]/60 border border-[#232730]/60 text-[#9ca3af] font-medium">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Center / Right: Global Search & Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Bar with Keyboard Shortcut */}
          <div className="relative hidden md:flex items-center">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#16191e] border border-[#232730] focus-within:border-primary/60 transition-colors w-64 lg:w-72">
              <Search className="w-4 h-4 text-[#6b7280] shrink-0" />
              <input
                type="text"
                placeholder="Global search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    showToast({
                      title: "Search Results",
                      description: `Searching cockpit records for "${searchQuery}"...`,
                      type: "info",
                    });
                  }
                }}
                className="bg-transparent text-xs text-white placeholder-[#6b7280] focus:outline-none w-full"
              />
              <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#20252e] border border-[#2c333f] text-[10px] text-[#9ca3af] font-mono">
                <span>⌘</span>
                <span>F</span>
              </span>
            </div>
          </div>

          {/* Notification Bell with beacon */}
          <button
            onClick={() =>
              showToast({
                title: "Notifications",
                description: "All ride and odometer systems operating normally.",
                type: "info",
              })
            }
            className="relative w-9 h-9 rounded-2xl bg-[#16191e] border border-[#232730] flex items-center justify-center text-[#808996] hover:text-white hover:border-[#2f3542] transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#16191e]" />
          </button>

          {/* Info Circle Button */}
          <button
            onClick={() =>
              showToast({
                title: "RideLedger Cockpit Info",
                description: "Phase 2 Active: Isolated storage, cryptographic sessions, and dark financial cockpit.",
                type: "info",
              })
            }
            className="w-9 h-9 rounded-2xl bg-[#16191e] border border-[#232730] flex items-center justify-center text-[#808996] hover:text-white hover:border-[#2f3542] transition-colors"
            aria-label="Application info"
            title="App Information"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Authentication & Profile Section (Full compatibility with Playwright test expectations) */}
          {isAuthenticated && profile ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#232730]">
              <Link
                href="/settings"
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#16191e] transition-colors"
                title="View Captain Profile & Settings"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 text-white font-semibold flex items-center justify-center text-xs border border-primary/30">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="block text-left">
                  <p className="text-xs font-semibold leading-none text-white truncate max-w-[120px]">
                    {profile.fullName}
                  </p>
                  <p className="text-[10px] text-[#808996] mt-0.5">
                    {profile.partnerId}
                  </p>
                </div>
              </Link>

              {/* Explicit Sign Out Button */}
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="p-2 rounded-xl text-[#808996] hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Sign Out"
                title="Sign Out (Preserves Financial Data)"
                data-testid="header-signout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-[#232730]">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-black hover:bg-primary-hover transition-colors shadow-sm"
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
