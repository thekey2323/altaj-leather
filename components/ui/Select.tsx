"use client";

import React, { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-altaj-dark/80"
          >
            {label}
            {props.required && <span className="text-altaj-crimson ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none bg-white text-altaj-text border border-altaj-border px-3.5 py-3 pr-10 text-sm transition-colors focus:border-altaj-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-altaj-brown disabled:bg-altaj-sand/50 disabled:cursor-not-allowed rounded-sm",
              error && "border-altaj-crimson focus:border-altaj-crimson focus:ring-altaj-crimson",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-altaj-muted">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <p className="text-xs text-altaj-crimson font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-altaj-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
