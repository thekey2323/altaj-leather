import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "promo" | "gold" | "dark" | "outline" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium uppercase tracking-wider select-none";

  const variants = {
    promo: "bg-altaj-brown text-white shadow-sm",
    gold: "bg-altaj-gold text-white shadow-sm",
    dark: "bg-altaj-dark text-altaj-bg",
    outline: "border border-altaj-dark/20 text-altaj-dark bg-white/80",
    success: "bg-emerald-800 text-emerald-50",
    warning: "bg-amber-800 text-amber-50",
    danger: "bg-altaj-crimson text-rose-50",
    neutral: "bg-altaj-sand text-altaj-text",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 rounded-[2px]",
    md: "text-xs px-2.5 py-1 rounded-[2px]",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
