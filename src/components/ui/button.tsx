"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "outline"
    | "ghost"
    | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
          // Variants
          variant === "primary" &&
            "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm font-semibold",
          variant === "secondary" &&
            "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
          variant === "accent" &&
            "bg-accent-amber text-accent-amber-foreground hover:brightness-105 shadow-sm font-semibold",
          variant === "outline" &&
            "border border-border bg-transparent hover:bg-muted text-foreground",
          variant === "ghost" &&
            "bg-transparent hover:bg-muted text-foreground",
          variant === "destructive" &&
            "bg-destructive text-destructive-foreground hover:brightness-95 shadow-sm",
          // Sizes
          size === "sm" && "h-8 px-3 text-xs gap-1.5",
          size === "md" && "h-11 px-4 text-sm gap-2 min-h-[44px]", // Mobile touch target
          size === "lg" && "h-12 px-6 text-base gap-2.5 min-h-[48px]",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
