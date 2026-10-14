"use client";

import React from "react";
import { Sun, Moon, Laptop, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Application Settings</h1>
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

      {/* Captain Profile Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Captain Profile (Read-Only Foundation)</CardTitle>
          <CardDescription>
            Verified credentials and registration for Rapido operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-xs text-muted-foreground uppercase font-medium">Captain Name</span>
              <p className="font-semibold text-foreground mt-0.5">Rapido Captain Partner</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-xs text-muted-foreground uppercase font-medium">Partner ID</span>
              <p className="font-semibold text-foreground mt-0.5">#RAP-4091</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-xs text-muted-foreground uppercase font-medium">Platform</span>
              <p className="font-semibold text-foreground mt-0.5">Rapido Bike Taxi / Delivery</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-xs text-muted-foreground uppercase font-medium">Vehicle Category</span>
              <p className="font-semibold text-foreground mt-0.5">Two-Wheeler (Motorcycle)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
