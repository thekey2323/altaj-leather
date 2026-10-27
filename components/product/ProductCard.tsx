"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatMAD } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Star, ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="group flex flex-col bg-white border border-altaj-border/80 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-luxury-hover hover:border-altaj-softBrown/50">
      {/* Image Container with Badges */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full bg-altaj-sand/30 overflow-hidden block"
      >
        <Image
          src={product.featuredImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />

        {/* Promo / Discount Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.promotionBadge && (
            <Badge variant="promo" size="sm">
              {product.promotionBadge}
            </Badge>
          )}
          {discountPercent && (
            <span className="text-[9px] font-bold bg-altaj-dark text-altaj-bg px-1.5 py-0.5 rounded-[2px] tracking-wider uppercase">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick View Hover Indicator on Desktop */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center h-8 w-8 rounded-full bg-white/90 text-altaj-dark shadow-md">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </Link>

      {/* Details Container */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          {/* Star Rating snippet */}
          <div className="flex items-center gap-1 text-altaj-gold text-[11px]">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-altaj-gold text-altaj-gold"
                />
              ))}
            </div>
            <span className="text-altaj-muted font-medium text-[10px]">
              ({product.reviewCount})
            </span>
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="font-serif text-xs sm:text-sm font-bold text-altaj-dark uppercase tracking-wider line-clamp-1 group-hover:text-altaj-brown transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-[11px] text-altaj-muted line-clamp-1 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-altaj-border/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-serif text-sm sm:text-base font-bold text-altaj-dark">
              {formatMAD(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[11px] text-altaj-muted/70 line-through">
                {formatMAD(product.compareAtPrice)}
              </span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="text-[10px] uppercase font-bold tracking-wider text-altaj-brown hover:text-altaj-dark transition-colors inline-flex items-center gap-0.5"
          >
            <span>Détails</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
