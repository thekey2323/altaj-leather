import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light" | "gold";
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
}

export function Logo({
  className,
  variant = "dark",
  size = "md",
  withTagline = false,
}: LogoProps) {
  const logoSrc = {
    dark: "/images/altaj-logo.png",
    light: "/images/altaj-logo-white.png",
    gold: "/images/altaj-logo-gold.png",
  }[variant];

  const textColor = {
    dark: "text-altaj-dark",
    light: "text-altaj-bg",
    gold: "text-altaj-gold",
  }[variant];

  // Proportions for the official 500x500 emblem
  const imageSizes = {
    sm: "h-8 w-8 sm:h-9 sm:w-9 max-w-[36px] max-h-[36px]",
    md: "h-11 w-11 sm:h-12 sm:w-12 max-w-[48px] max-h-[48px]",
    lg: "h-16 w-16 sm:h-20 sm:w-20 max-w-[80px] max-h-[80px]",
  }[size];

  const maxPx = {
    sm: 36,
    md: 48,
    lg: 80,
  }[size];

  const titleSizes = {
    sm: "text-sm tracking-[0.25em]",
    md: "text-base sm:text-lg tracking-[0.3em]",
    lg: "text-xl sm:text-2xl tracking-[0.35em]",
  }[size];

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 transition-all duration-300 hover:opacity-90 select-none",
        textColor,
        className
      )}
    >
      {/* Official ALTAJ Crown Emblem */}
      <div
        className={cn("relative flex-shrink-0 transition-transform group-hover:scale-105 overflow-hidden", imageSizes)}
        style={{ width: maxPx, height: maxPx, maxWidth: `${maxPx}px`, maxHeight: `${maxPx}px` }}
      >
        <Image
          src={logoSrc}
          alt="ALTAJ Logo"
          fill
          priority
          sizes="(max-width: 768px) 48px, 80px"
          className="object-contain"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col">
        <span className={cn("font-serif font-extrabold uppercase leading-none", titleSizes)}>
          ALTAJ<span className="font-light text-altaj-gold">LEATHER</span>
        </span>
        {withTagline && (
          <span className="text-[9px] uppercase tracking-[0.28em] text-altaj-muted font-medium mt-1">
            Maroquinerie • Maroc
          </span>
        )}
      </div>
    </Link>
  );
}
