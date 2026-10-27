"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const currentImage = images[selectedIndex] || images[0];

  return (
    <div className="space-y-3">
      {/* Large Featured Image */}
      <div className="relative aspect-square w-full bg-altaj-sand/50 rounded-sm overflow-hidden border border-altaj-border shadow-sm group">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Authenticity Badge */}
        <div className="absolute top-3 left-3 bg-altaj-dark/90 text-white backdrop-blur-md px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-altaj-gold" />
          <span>Fait main au Maroc</span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all bg-altaj-sand/40",
                  isSelected
                    ? "border-altaj-brown shadow-sm scale-105"
                    : "border-altaj-border opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${title} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
