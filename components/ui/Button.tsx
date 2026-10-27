"use client";

import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none tracking-wider uppercase";

    const variants = {
      primary:
        "bg-altaj-dark text-altaj-bg hover:bg-altaj-brown focus:ring-altaj-dark shadow-md",
      secondary:
        "bg-altaj-sand text-altaj-dark hover:bg-altaj-border focus:ring-altaj-softBrown",
      outline:
        "border border-altaj-dark/20 text-altaj-dark hover:bg-altaj-dark hover:text-white focus:ring-altaj-dark",
      gold:
        "bg-altaj-gold text-white hover:bg-altaj-brown focus:ring-altaj-gold shadow-gold-glow",
      ghost:
        "bg-transparent text-altaj-dark hover:bg-altaj-sand/60 focus:ring-altaj-dark",
      danger:
        "bg-altaj-crimson text-white hover:bg-red-800 focus:ring-red-600 shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 rounded-sm tracking-wide",
      md: "text-xs px-5 py-2.5 rounded-sm tracking-wider",
      lg: "text-sm px-6 py-3.5 rounded-sm tracking-widest font-semibold",
      xl: "text-base px-8 py-4 rounded-sm tracking-widest font-bold",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Traitement...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
