import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "sand" | "dark" | "outline";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-white border border-altaj-border/80 shadow-sm",
    sand: "bg-altaj-sand border border-altaj-border/80 shadow-sm",
    dark: "bg-altaj-dark text-altaj-bg border border-altaj-borderDark shadow-luxury",
    outline: "bg-transparent border border-altaj-border/90",
  };

  return (
    <div
      className={cn("rounded-sm p-5 md:p-6 transition-all", variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
