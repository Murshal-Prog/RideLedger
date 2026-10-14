"use client";

import React, { useState } from "react";
import { Receipt, Plus, IndianRupee } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/context/toast-context";

export default function ExpensesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("Fuel/Petrol");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Invalid Amount", "Please specify a positive amount in INR.");
      return;
    }
    toast.success("Expense Recorded", `₹${amount} for ${category} saved successfully.`);
    setAmount("");
    setDescription("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expense Records</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log fuel, maintenance, tolls, and daily running costs.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsOpen(true)}
          >
            Add Expense
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Expense Log</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Receipt className="w-8 h-8 text-rose-500" />}
            title="No Expenses Logged Yet"
            description="Record your fuel refills, vehicle maintenance, and snacks to track net earnings accurately."
            action={
              <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                Record First Expense
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Expense"
        description="Expenses can be entered at any time."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Expense
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "Fuel/Petrol", label: "Fuel / Petrol" },
              { value: "Maintenance/Repairs", label: "Maintenance & Repairs" },
              { value: "Food/Water", label: "Food & Water" },
              { value: "Parking/Tolls", label: "Parking & Tolls" },
              { value: "Mobile Recharge", label: "Mobile Recharge" },
              { value: "Other", label: "Other" },
            ]}
          />
          <Input
            label="Amount (₹)"
            type="number"
            step="1"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftAddon={<IndianRupee className="w-4 h-4" />}
          />
          <Input
            label="Notes / Vendor"
            placeholder="e.g. Indian Oil, 2 Litres"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
