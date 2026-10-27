"use client";

import React, { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-altaj-dark/80"
          >
            {label}
            {props.required && <span className="text-altaj-crimson ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-altaj-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full bg-white text-altaj-text border border-altaj-border px-3.5 py-3 text-sm placeholder:text-altaj-muted/60 transition-colors focus:border-altaj-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-altaj-brown disabled:bg-altaj-sand/50 disabled:cursor-not-allowed rounded-sm",
              icon && "pl-10",
              error && "border-altaj-crimson focus:border-altaj-crimson focus:ring-altaj-crimson",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-altaj-crimson font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-altaj-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
