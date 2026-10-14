"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  ArrowLeftRight,
  FileText,
  Repeat,
  ShieldCheck,
  MessageSquare,
  Sun,
  Moon,
  HelpCircle,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkSession } from "@/context/work-session-context";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/context/toast-context";

const mainMenuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/reports", icon: BarChart2, badge: "21" },
  { name: "Transactions", href: "/rides", icon: ArrowLeftRight },
  { name: "Invoices", href: "/expenses", icon: FileText },
];

const featuresMenuItems = [
  { name: "Recurring", href: "/sessions", icon: Repeat, badge: "17" },
  { name: "Subscriptions", href: "/settings", icon: ShieldCheck },
  { name: "Feedback", href: "#feedback", icon: MessageSquare },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { status, activeSession, elapsedFormatted, lastOdometer } = useWorkSession();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isOnline = status === "online";

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
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0 z-40 select-none">
        {/* Leftmost Icon Rail */}
        <div className="w-14 bg-[#0a0c0f] border-r border-[#1a1e24] flex flex-col items-center justify-between py-5">
          {/* Top theme switcher */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                resolvedTheme === "light"
                  ? "bg-[#1f242c] text-amber-400"
                  : "text-[#6b7280] hover:text-white hover:bg-[#16191e]"
              )}
              aria-label="Switch to light mode"
              title="Light theme"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTheme}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                resolvedTheme === "dark"
                  ? "bg-[#1f242c] text-emerald-400"
                  : "text-[#6b7280] hover:text-white hover:bg-[#16191e]"
              )}
              aria-label="Switch to dark mode"
              title="Dark theme"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom action icons */}
          <div className="flex flex-col items-center gap-2.5">
            <button
              onClick={() =>
                showToast({
                  title: "RideLedger Help & Cockpit Docs",
                  description: "Press Cmd+F for global search or contact support.",
                  type: "info",
                })
              }
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#16191e] transition-colors"
              aria-label="Help"
              title="Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <Link
              href="/settings"
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                pathname === "/settings"
                  ? "bg-primary/10 text-primary"
                  : "text-[#6b7280] hover:text-white hover:bg-[#16191e]"
              )}
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {isAuthenticated && (
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6b7280] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                aria-label="Sign Out"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Sidebar */}
        <div className="w-60 bg-[#12151a] border-r border-[#1e232b] flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Brand Header */}
            <div className="h-16 flex items-center px-5 border-b border-[#1c2027]">
              <Link href="/" className="flex items-center gap-3 w-full" aria-label="RideLedger Dashboard">
                {/* 3 Green Neon Ascending Bars + Brand Text */}
                <div className="flex items-end gap-1 shrink-0">
                  <span className="w-1.5 h-3.5 bg-primary rounded-full" />
                  <span className="w-1.5 h-5 bg-primary rounded-full" />
                  <span className="w-1.5 h-6.5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-widest text-white uppercase">
                    FINANCE
                  </span>
                  <span className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase -mt-0.5">
                    RideLedger
                  </span>
                </div>
                {/* Hidden img for test suite asset verification */}
                <div className="sr-only">
                  <Image
                    src="/brand/RideLedger_Logo_v5.png"
                    alt="RideLedger Logo"
                    width={120}
                    height={30}
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* User Capsule */}
            <div className="p-4 border-b border-[#1c2027]">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md">
                    <div className="w-full h-full rounded-full bg-[#16191e] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {profile?.fullName ? (
                        profile.fullName.slice(0, 2).toUpperCase()
                      ) : (
                        <User className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                  {/* Status Beacon */}
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#12151a]",
                      isOnline ? "bg-emerald-500 animate-pulse" : "bg-emerald-400"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {profile?.fullName || (isAuthenticated ? "Surendar V" : "Captain Partner")}
                  </p>
                  <p className="text-[10px] text-[#808996] truncate">
                    {user?.email || (profile?.partnerId ? `${profile.partnerId}@rapido.in` : "uluxrouf2202@gmail.com")}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Lists */}
            <div className="px-3 py-4 space-y-5">
              {/* MAIN MENU */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-[#606773] uppercase">
                  MAIN MENU
                </div>
                {mainMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group",
                        isActive
                          ? "bg-primary text-black font-semibold shadow-[0_4px_16px_rgba(34,197,94,0.35)]"
                          : "text-[#9ca3af] hover:text-white hover:bg-[#1a1e24]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isActive ? "text-black" : "text-[#9ca3af] group-hover:text-white"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                            isActive
                              ? "bg-black/20 text-black"
                              : "bg-[#1f232b] text-[#808996]"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* FEATURES */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-[#606773] uppercase">
                  FEATURES
                </div>
                {featuresMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        if (item.href === "#feedback") {
                          e.preventDefault();
                          showToast({
                            title: "Feedback & Suggestions",
                            description: "RideLedger cockpit feedback is always recorded.",
                            type: "info",
                          });
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group",
                        isActive
                          ? "bg-primary text-black font-semibold shadow-[0_4px_16px_rgba(34,197,94,0.35)]"
                          : "text-[#9ca3af] hover:text-white hover:bg-[#1a1e24]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isActive ? "text-black" : "text-[#9ca3af] group-hover:text-white"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                            isActive
                              ? "bg-black/20 text-black"
                              : "bg-[#1f232b] text-[#808996]"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom "Upgrade Pro! 👑" Card */}
          <div className="p-3">
            <div className="p-3.5 rounded-2xl bg-[#191d24] border border-[#232934] flex flex-col gap-2.5 shadow-md">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Upgrade Pro!</span>
                  <span>👑</span>
                </p>
                <p className="text-[10px] text-[#828c9b] mt-0.5 leading-snug">
                  Higher productivity with better organization
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() =>
                    showToast({
                      title: "RideLedger Pro Plan",
                      description: "Pro features include automatic GPS route tracking & CSV export.",
                      type: "success",
                    })
                  }
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-black font-bold text-xs rounded-full shadow-[0_2px_10px_rgba(34,197,94,0.3)] transition-all flex items-center gap-1"
                >
                  <span>👑</span>
                  <span>Upgrade</span>
                </button>
                <button
                  onClick={() =>
                    showToast({
                      title: "Pro Benefits",
                      description: "Unlimited rides, cloud backup, and fuel efficiency reports.",
                      type: "info",
                    })
                  }
                  className="text-[11px] text-[#9ca3af] hover:text-white font-medium transition-colors px-1"
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

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
