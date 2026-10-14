"use client";

import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      id,
      leftAddon,
      rightAddon,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-foreground/80 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "relative flex items-center w-full rounded-lg border bg-card transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 focus-within:border-primary",
            error
              ? "border-destructive focus-within:ring-destructive"
              : "border-border",
            disabled && "opacity-50 pointer-events-none bg-muted"
          )}
        >
          {leftAddon && (
            <div className="flex items-center pl-3 text-muted-foreground select-none">
              {leftAddon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-11 px-3 py-2 text-sm bg-transparent rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed",
              leftAddon && "pl-2",
              rightAddon && "pr-2",
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="flex items-center pr-3 text-muted-foreground select-none">
              {rightAddon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-destructive font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
