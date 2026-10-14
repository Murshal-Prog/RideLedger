"use client";

import React, { useState } from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { Modal } from "@/components/ui/modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkSession } from "@/context/work-session-context";
import { useToast } from "@/context/toast-context";
import { Gauge, CheckCircle2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { status, lastOdometer, goOnline, goOffline } = useWorkSession();
  const { toast } = useToast();

  const [isGoOnlineOpen, setIsGoOnlineOpen] = useState(false);
  const [isGoOfflineOpen, setIsGoOfflineOpen] = useState(false);
  const [startingOdometerInput, setStartingOdometerInput] = useState<string>(
    lastOdometer.toString()
  );
  const [endingOdometerInput, setEndingOdometerInput] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenGoOnline = () => {
    setStartingOdometerInput(lastOdometer.toString());
    setFormError(null);
    setIsGoOnlineOpen(true);
  };

  const handleOpenGoOffline = () => {
    setEndingOdometerInput((lastOdometer + 15).toString()); // sensible default
    setFormError(null);
    setIsGoOfflineOpen(true);
  };

  const handleConfirmGoOnline = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = parseFloat(startingOdometerInput);
    if (isNaN(parsed) || parsed <= 0) {
      setFormError("Please enter a valid positive odometer reading.");
      return;
    }

    setIsLoading(true);
    const res = await goOnline(parsed);
    setIsLoading(false);

    if (res.success) {
      setIsGoOnlineOpen(false);
      toast.success(
        "Online Session Started",
        `Starting odometer recorded at ${parsed} km. Add Ride is now active.`
      );
    } else {
      setFormError(res.error || "Failed to start session.");
    }
  };

  const handleConfirmGoOffline = async () => {
    const parsed = parseFloat(endingOdometerInput);
    if (isNaN(parsed) || parsed < lastOdometer) {
      toast.error(
        "Invalid Odometer Reading",
        `Ending odometer must be greater than or equal to starting odometer (${lastOdometer} km).`
      );
      return;
    }

    setIsLoading(true);
    const res = await goOffline(parsed);
    setIsLoading(false);

    if (res.success) {
      setIsGoOfflineOpen(false);
      toast.success(
        "Work Session Saved",
        `Distance travelled: ${res.distance} km. Saved to offline session log.`
      );
    } else {
      toast.error("Error", res.error || "Failed to end work session.");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased overflow-x-hidden w-full">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 w-full overflow-x-hidden">
        <Header
          onOpenGoOnline={handleOpenGoOnline}
          onOpenGoOffline={handleOpenGoOffline}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav
          onOpenGoOnline={handleOpenGoOnline}
          onOpenGoOffline={handleOpenGoOffline}
        />
      </div>

      {/* Go Online Modal */}
      <Modal
        isOpen={isGoOnlineOpen}
        onClose={() => setIsGoOnlineOpen(false)}
        title="Start Online Work Session"
        description="Record your starting odometer before accepting Rapido rides."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGoOnlineOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmGoOnline}
              isLoading={isLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm & Go Online
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmGoOnline} className="space-y-4">
          <Input
            label="Starting Odometer Reading (km)"
            type="number"
            step="0.1"
            required
            value={startingOdometerInput}
            onChange={(e) => setStartingOdometerInput(e.target.value)}
            leftAddon={<Gauge className="w-4 h-4" />}
            helperText={`Previous reading: ${lastOdometer} km`}
            error={formError || undefined}
          />
          <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground leading-relaxed">
            Starting your work session will activate the live duration timer and enable the <strong>Add Ride</strong> feature.
          </div>
        </form>
      </Modal>

      {/* Go Offline Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isGoOfflineOpen}
        onClose={() => setIsGoOfflineOpen(false)}
        onConfirm={handleConfirmGoOffline}
        title="End Work Session"
        message={`Are you sure you want to go offline? Please verify your ending odometer (starting was ${lastOdometer} km).`}
        confirmText="Go Offline & Save"
        cancelText="Stay Online"
        variant="warning"
        isLoading={isLoading}
      />
    </div>
  );
}
