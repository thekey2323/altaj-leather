"use client";

import React from "react";
import { BundleOffer } from "@/types";
import { formatMAD, cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

interface BundleSelectorProps {
  offers: BundleOffer[];
  selectedOfferId: string;
  onSelect: (offer: BundleOffer) => void;
}

export function BundleSelector({
  offers,
  selectedOfferId,
  onSelect,
}: BundleSelectorProps) {
  if (!offers || offers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-altaj-dark flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-altaj-gold" />
          Offres Spéciales Duo & Pack
        </span>
        <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">
          Économie garantie
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {offers.map((offer) => {
          const isSelected = offer.id === selectedOfferId;

          return (
            <div
              key={offer.id}
              onClick={() => onSelect(offer)}
              className={cn(
                "relative cursor-pointer rounded-sm p-4 transition-all duration-200 border-2 select-none",
                isSelected
                  ? "border-altaj-brown bg-white shadow-luxury"
                  : "border-altaj-border bg-altaj-sand/30 hover:border-altaj-softBrown hover:bg-white"
              )}
            >
              {/* Badge for Best Offer */}
              {offer.badge && (
                <div
                  className={cn(
                    "absolute -top-2.5 right-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm",
                    offer.isPopular
                      ? "bg-altaj-brown text-white"
                      : "bg-altaj-dark text-altaj-bg"
                  )}
                >
                  {offer.badge}
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full flex items-center justify-center border transition-colors",
                        isSelected
                          ? "border-altaj-brown bg-altaj-brown text-white"
                          : "border-altaj-muted bg-white"
                      )}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <h4 className="font-serif text-sm font-bold text-altaj-dark">
                      {offer.name}
                    </h4>
                  </div>

                  {offer.savings && offer.savings > 0 ? (
                    <p className="text-[11px] text-emerald-800 font-semibold pl-6">
                      Vous économisez {formatMAD(offer.savings)}
                    </p>
                  ) : (
                    <p className="text-[11px] text-altaj-muted pl-6">Prix unitaire officiel</p>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-serif text-base font-bold text-altaj-dark">
                    {formatMAD(offer.price)}
                  </div>
                  {offer.quantity > 1 && (
                    <div className="text-[10px] text-altaj-muted">
                      soit {formatMAD(offer.price / offer.quantity)} / unité
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
