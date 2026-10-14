"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Laptop,
  User,
  Bike,
  Gauge,
  IndianRupee,
  Save,
  LogOut,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { updateProfileSchema } from "@/lib/validations/user-profile";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, profile, isAuthenticated, updateProfile, signOut } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    partnerId: "",
    phoneNumber: "",
    vehicleType: "Two-Wheeler (Motorcycle)",
    vehicleNumber: "",
    dailyTargetInr: 1500,
    initialOdometer: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        partnerId: profile.partnerId || "",
        phoneNumber: profile.phoneNumber || "",
        vehicleType: profile.vehicleType || "Two-Wheeler (Motorcycle)",
        vehicleNumber: profile.vehicleNumber || "",
        dailyTargetInr: profile.dailyTargetInr || 1500,
        initialOdometer: profile.initialOdometer || 0,
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = updateProfileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(formData);
      showToast({
        title: "Profile Saved",
        description: "Your Captain settings have been updated.",
        type: "success",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      showToast({
        title: "Update Failed",
        description: message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setIsLogoutModalOpen(false);
      showToast({
        title: "Signed Out",
        description: "Your financial records are safely preserved.",
        type: "info",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Application Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure appearance, theme preference, and Captain profile defaults.
        </p>
      </div>

      {/* Appearance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Appearance & Theme</CardTitle>
          <CardDescription>
            Choose your preferred theme. Your choice is saved persistently and applies across all pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                  : "border-border bg-card hover:bg-muted text-muted-foreground"
              }`}
            >
              <Sun className="w-6 h-6 mb-2 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                  : "border-border bg-card hover:bg-muted text-muted-foreground"
              }`}
            >
              <Moon className="w-6 h-6 mb-2 text-slate-700 dark:text-slate-300" />
              <span>Dark Mode</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all ${
                theme === "system"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                  : "border-border bg-card hover:bg-muted text-muted-foreground"
              }`}
            >
              <Laptop className="w-6 h-6 mb-2 text-primary" />
              <span>System Default</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Captain Profile & Operational Defaults */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Captain Profile & Vehicle
            </CardTitle>
            <CardDescription>
              {isAuthenticated
                ? `Authenticated as ${user?.email}`
                : "Not currently signed in with a persistent session."}
            </CardDescription>
          </div>
          {isAuthenticated && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              Active Session
            </span>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Captain Full Name
                </label>
                <div className="relative">
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    error={errors.fullName}
                    placeholder="Rapido Captain"
                    className="pl-10"
                    disabled={!isAuthenticated}
                  />
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Partner ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Partner ID
                </label>
                <Input
                  value={formData.partnerId}
                  onChange={(e) => handleChange("partnerId", e.target.value)}
                  error={errors.partnerId}
                  placeholder="RAP-4091"
                  disabled={!isAuthenticated}
                />
              </div>

              {/* Vehicle Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Vehicle Number
                </label>
                <div className="relative">
                  <Input
                    value={formData.vehicleNumber}
                    onChange={(e) => handleChange("vehicleNumber", e.target.value)}
                    error={errors.vehicleNumber}
                    placeholder="MH 02 AB 1234"
                    className="pl-10"
                    disabled={!isAuthenticated}
                  />
                  <Bike className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Vehicle Category
                </label>
                <Input
                  value={formData.vehicleType}
                  onChange={(e) => handleChange("vehicleType", e.target.value)}
                  disabled={!isAuthenticated}
                />
              </div>

              {/* Daily Target */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Daily Earnings Target (₹)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.dailyTargetInr}
                    onChange={(e) => handleChange("dailyTargetInr", Number(e.target.value))}
                    error={errors.dailyTargetInr}
                    placeholder="1500"
                    className="pl-10"
                    disabled={!isAuthenticated}
                  />
                  <IndianRupee className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Initial Odometer */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Base Starting Odometer (km)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.initialOdometer}
                    onChange={(e) => handleChange("initialOdometer", Number(e.target.value))}
                    error={errors.initialOdometer}
                    placeholder="0.0"
                    className="pl-10"
                    disabled={!isAuthenticated}
                  />
                  <Gauge className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  className="font-bold w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile Changes
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Explicit Sign Out
                </Button>
              </div>
            ) : (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Please{" "}
                  <a href="/login" className="text-primary font-semibold hover:underline">
                    sign in
                  </a>{" "}
                  to edit Captain profile and vehicle settings.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Explicit Logout Dialog */}
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
    </div>
  );
}
