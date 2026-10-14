"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Bike, Gauge, IndianRupee, ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { signupSchema } from "@/lib/validations/auth";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "Rapido Captain",
    partnerId: "RAP-4091",
    phoneNumber: "",
    vehicleNumber: "MH 02 AB 1234",
    dailyTargetInr: 1500,
    initialOdometer: 14250,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(formData);
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

    setIsSubmitting(true);
    try {
      await signUp(formData);
      showToast({
        title: "Registration Successful!",
        description: "Your Captain profile has been created.",
        type: "success",
      });
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      showToast({
        title: "Registration Error",
        description: message,
        type: "error",
      });
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative h-12 w-48 mb-1">
            <Image
              src="/brand/RideLedger_Logo_v5.png"
              alt="RideLedger"
              fill
              sizes="192px"
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Register Captain Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure your profile, vehicle info, and daily target.
          </p>
        </div>

        <Card className="border border-border/80 shadow-md">
          <CardContent className="pt-6 space-y-5">
            {errors.form && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {errors.form}
              </div>
            )}

            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="captain@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      error={errors.email}
                      className="pl-10"
                      required
                    />
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Password (min 6 characters) *
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      error={errors.password}
                      className="pl-10"
                      required
                    />
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Captain Name
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Rapido Captain"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      error={errors.fullName}
                      className="pl-10"
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
                    placeholder="RAP-4091"
                    value={formData.partnerId}
                    onChange={(e) => handleChange("partnerId", e.target.value)}
                    error={errors.partnerId}
                  />
                </div>

                {/* Vehicle Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Vehicle Number
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="MH 02 AB 1234"
                      value={formData.vehicleNumber}
                      onChange={(e) => handleChange("vehicleNumber", e.target.value)}
                      error={errors.vehicleNumber}
                      className="pl-10"
                    />
                    <Bike className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Daily Target */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Daily Target (₹)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="1500"
                      value={formData.dailyTargetInr}
                      onChange={(e) => handleChange("dailyTargetInr", Number(e.target.value))}
                      error={errors.dailyTargetInr}
                      className="pl-10"
                    />
                    <IndianRupee className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Initial Odometer */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Starting Odometer Reading (km)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="14250.0"
                      value={formData.initialOdometer}
                      onChange={(e) => handleChange("initialOdometer", Number(e.target.value))}
                      error={errors.initialOdometer}
                      className="pl-10"
                    />
                    <Gauge className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full font-bold mt-2"
                size="lg"
                isLoading={isSubmitting}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Complete Registration
              </Button>
            </form>

            <div className="text-center pt-2 text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign In <ArrowLeft className="inline w-3 h-3 rotate-180" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
