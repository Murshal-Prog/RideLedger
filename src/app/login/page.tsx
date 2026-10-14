"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { loginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
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
      await signIn({ email, password });
      showToast({
        title: "Welcome Back, Captain!",
        description: "Authentication successful. Ready for your shift.",
        type: "success",
      });
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      showToast({
        title: "Authentication Error",
        description: message,
        type: "error",
      });
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("captain@rideledger.local");
    setPassword("password123");
    setIsSubmitting(true);
    try {
      await signIn({ email: "captain@rideledger.local", password: "password123" });
      showToast({
        title: "Signed In as Demo Captain",
        description: "Logged in as Partner RAP-4091.",
        type: "success",
      });
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Demo sign in failed";
      showToast({
        title: "Login Failed",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative h-14 w-52 mb-2">
            <Image
              src="/brand/RideLedger_Logo_v5.png"
              alt="RideLedger"
              fill
              sizes="208px"
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Captain Sign In
          </h1>
          <p className="text-sm text-muted-foreground">
            Secure login for Rapido Captains to record rides and net income.
          </p>
        </div>

        <Card className="border border-border/80 shadow-md">
          <CardContent className="pt-6 space-y-5">
            {errors.form && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="captain@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full font-bold"
                size="lg"
                isLoading={isSubmitting}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Dashboard
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">
                  Or One-Click Test
                </span>
              </div>
            </div>

            {/* Quick Demo Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
            >
              <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
              Sign In with Demo Captain Account
            </Button>

            <div className="text-center pt-2 text-xs text-muted-foreground">
              New Rapido Captain?{" "}
              <Link href="/signup" className="text-primary hover:underline font-semibold">
                Register Profile <ArrowRight className="inline w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
