"use client";

import React, { useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  Receipt,
  Bike,
  Clock,
  Gauge,
  PlusCircle,
  Power,
  Fuel,
  Info,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { StatCard, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ui/chart-container";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useWorkSession } from "@/context/work-session-context";
import { useToast } from "@/context/toast-context";

export function DashboardShell() {
  const { status, activeSession, elapsedFormatted, lastOdometer, goOnline, goOffline } =
    useWorkSession();
  const { toast } = useToast();
  const isOnline = status === "online";

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("Fuel/Petrol");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");

  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [startingOdo, setStartingOdo] = useState(lastOdometer.toString());
  const [endingOdo, setEndingOdo] = useState("");
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(startingOdo);
    const res = await goOnline(val);
    if (res.success) {
      setIsOnlineModalOpen(false);
      toast.success("Online Session Started", `Odometer: ${val} km. Add Ride is now enabled.`);
    } else {
      toast.error("Validation Error", res.error);
    }
  };

  const handleEndSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(endingOdo);
    const res = await goOffline(val);
    if (res.success) {
      setIsOfflineModalOpen(false);
      toast.success("Session Ended", `Covered ${res.distance} km. Records updated.`);
    } else {
      toast.error("Validation Error", res.error);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      toast.error("Invalid Amount", "Please enter a valid expense amount in INR.");
      return;
    }
    toast.success("Expense Logged", `₹${expenseAmount} for ${expenseCategory} recorded.`);
    setExpenseAmount("");
    setExpenseDesc("");
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner / Session Controller */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-card to-secondary/40 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? "online" : "offline"} dot>
                {isOnline ? "SESSION ACTIVE" : "OFFLINE"}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isOnline ? "You are Online & Accepting Rides" : "Shift Not Started"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isOnline
                ? `Started at ${activeSession ? new Date(activeSession.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"} • Odometer: ${activeSession?.startingOdometer} km`
                : "Record your starting odometer to begin tracking rides, fuel, and profit."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isOnline ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                  onClick={() => toast.info("Add Ride Form", "Ride logging is fully enabled during active sessions.")}
                >
                  Add Ride
                </Button>
                <Button
                  variant="destructive"
                  size="md"
                  leftIcon={<Power className="w-4 h-4" />}
                  onClick={() => {
                    setEndingOdo((lastOdometer + 12).toString());
                    setIsOfflineModalOpen(true);
                  }}
                >
                  Go Offline
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="accent"
                  size="md"
                  leftIcon={<Power className="w-4 h-4" />}
                  onClick={() => {
                    setStartingOdo(lastOdometer.toString());
                    setIsOnlineModalOpen(true);
                  }}
                >
                  Go Online
                </Button>
                <div title="Requires active work session">
                  <Button
                    variant="outline"
                    size="md"
                    disabled
                    leftIcon={<PlusCircle className="w-4 h-4" />}
                  >
                    Add Ride
                  </Button>
                </div>
              </>
            )}

            <Button
              variant="outline"
              size="md"
              leftIcon={<Receipt className="w-4 h-4" />}
              onClick={() => setIsExpenseModalOpen(true)}
            >
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Placeholder Notice Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="leading-relaxed">
          <strong>Foundation Mode Notice:</strong> Financial cards below display standard placeholder indicators (<code>₹--</code>) until rides and expenses are recorded in active sessions. No fabricated figures are presented.
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Gross Income"
          value="₹--"
          isPlaceholder
          placeholderNotice="Awaiting ride entries"
          variant="success"
          icon={<IndianRupee className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          title="Today's Net Profit"
          value="₹--"
          isPlaceholder
          placeholderNotice="Income minus expenses"
          variant="accent"
          icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Today's Expenses"
          value="₹--"
          isPlaceholder
          placeholderNotice="No expenses recorded"
          variant="danger"
          icon={<Receipt className="w-5 h-5 text-rose-500" />}
        />
        <StatCard
          title="Yesterday's Performance"
          value="₹-- / ₹--"
          isPlaceholder
          placeholderNotice="No prior day records"
          icon={<Calendar className="w-5 h-5 text-muted-foreground" />}
        />
      </div>

      {/* Operational Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Total Rides
          </span>
          <p className="text-xl font-bold font-mono mt-1 text-foreground">0</p>
          <span className="text-[10px] text-muted-foreground">0 Cash • 0 UPI</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Online Duration
          </span>
          <p className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            {isOnline ? elapsedFormatted : "00:00:00"}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {isOnline ? "Live tracking" : "Shift inactive"}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Distance (km)
          </span>
          <p className="text-xl font-bold font-mono mt-1 text-foreground">0.0 km</p>
          <span className="text-[10px] text-muted-foreground">Ending - Starting odo</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Avg / Ride
          </span>
          <p className="text-xl font-bold font-mono mt-1 text-muted-foreground">₹--</p>
          <span className="text-[10px] text-muted-foreground">Gross ÷ rides</span>
        </Card>
        <Card className="p-4 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Income / Hour
          </span>
          <p className="text-xl font-bold font-mono mt-1 text-muted-foreground">₹--</p>
          <span className="text-[10px] text-muted-foreground">Gross ÷ online hrs</span>
        </Card>
      </div>

      {/* Analytics Chart Shell */}
      <ChartContainer
        title="Today's Hourly Earnings vs. Expenses"
        description="Real-time chart trends will plot ride earnings, tips, and fuel costs as you work."
        isEmpty
        emptyTitle="No Financial Activity Today"
        emptyDescription="Once rides and expenses are recorded during an online session, dynamic hourly graphs will render here."
      />

      {/* Recent Activity: Rides & Expenses Empty States */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rides Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bike className="w-4 h-4 text-primary" />
              <span>Recent Rides</span>
            </CardTitle>
            <Badge variant="outline" size="sm">
              Today
            </Badge>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Bike className="w-6 h-6 text-primary" />}
              title="No Rides Logged Today"
              description={
                isOnline
                  ? "Your session is active. Click 'Add Ride' to record your first completed fare."
                  : "Start an online session to enable ride logging and track fares, incentives, and tips."
              }
              action={
                isOnline ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => toast.info("Add Ride", "Ride record form ready.")}
                  >
                    Log First Ride
                  </Button>
                ) : (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      setStartingOdo(lastOdometer.toString());
                      setIsOnlineModalOpen(true);
                    }}
                  >
                    Go Online to Log Rides
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>

        {/* Recent Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-500" />
              <span>Recent Expenses</span>
            </CardTitle>
            <Badge variant="outline" size="sm">
              Today
            </Badge>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Fuel className="w-6 h-6 text-rose-500" />}
              title="No Expenses Recorded Today"
              description="Track fuel/petrol, vehicle repairs, tea/food, and mobile recharges to calculate exact daily net profit."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpenseModalOpen(true)}
                >
                  Log Expense
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Record Expense"
        description="Expenses can be logged anytime while online or offline."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddExpense}>
              Save Expense
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Select
            label="Expense Category"
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
            options={[
              { value: "Fuel/Petrol", label: "Fuel / Petrol" },
              { value: "Maintenance/Repairs", label: "Maintenance & Repairs" },
              { value: "Food/Water", label: "Food & Water" },
              { value: "Parking/Tolls", label: "Parking & Tolls" },
              { value: "Mobile Recharge", label: "Mobile Data / Recharge" },
              { value: "Vehicle EMI", label: "Vehicle EMI" },
              { value: "Riding Equipment", label: "Riding Gear / Helmet" },
              { value: "Other", label: "Other Miscellaneous" },
            ]}
          />
          <Input
            label="Amount in INR (₹)"
            type="number"
            step="1"
            min="1"
            placeholder="e.g. 250"
            required
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            leftAddon={<IndianRupee className="w-4 h-4" />}
          />
          <Input
            label="Description / Note (Optional)"
            placeholder="e.g. HP Petrol Pump, 2.3 Litres"
            value={expenseDesc}
            onChange={(e) => setExpenseDesc(e.target.value)}
          />
        </form>
      </Modal>

      {/* Go Online Modal */}
      <Modal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        title="Start Online Work Session"
        description="Enter your motorcycle odometer reading to begin shift."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOnlineModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleStartSession}>
              Confirm & Go Online
            </Button>
          </>
        }
      >
        <form onSubmit={handleStartSession} className="space-y-4">
          <Input
            label="Starting Odometer (km)"
            type="number"
            step="0.1"
            required
            value={startingOdo}
            onChange={(e) => setStartingOdo(e.target.value)}
            leftAddon={<Gauge className="w-4 h-4" />}
            helperText={`Last recorded reading: ${lastOdometer} km`}
          />
          <p className="text-xs text-muted-foreground">
            Odometer is verified against your previous reading to guarantee accurate distance calculation at shift end.
          </p>
        </form>
      </Modal>

      {/* Go Offline Modal */}
      <Modal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        title="End Online Work Session"
        description="Verify your closing odometer reading to finalize distance and profit."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOfflineModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleEndSession}>
              Confirm & End Shift
            </Button>
          </>
        }
      >
        <form onSubmit={handleEndSession} className="space-y-4">
          <Input
            label="Ending Odometer (km)"
            type="number"
            step="0.1"
            required
            value={endingOdo}
            onChange={(e) => setEndingOdo(e.target.value)}
            leftAddon={<Gauge className="w-4 h-4" />}
            helperText={`Starting reading was ${activeSession?.startingOdometer ?? lastOdometer} km`}
          />
        </form>
      </Modal>
    </div>
  );
}
