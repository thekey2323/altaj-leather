"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { FastCodForm } from "@/components/checkout/FastCodForm";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-altaj-dark/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-altaj-border">
          {/* Header */}
          <div className="p-5 border-b border-altaj-border flex items-center justify-between bg-altaj-bg/50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-altaj-brown" />
              <h2 className="font-serif text-base font-bold uppercase tracking-wider text-altaj-dark">
                Votre Panier ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-altaj-muted hover:text-altaj-dark rounded-sm transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-altaj-sand/60 px-5 py-3 border-b border-altaj-border text-xs">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-altaj-dark font-medium mb-1.5">
                Plus que <span className="font-bold text-altaj-brown">{formatMAD(amountNeededForFreeShipping)}</span> pour bénéficier de la <span className="underline">Livraison Gratuite</span> !
              </p>
            ) : (
              <p className="text-emerald-800 font-bold mb-1.5 flex items-center gap-1.5">
                🎉 Félicitations ! Livraison gratuite partout au Maroc accordée.
              </p>
            )}
            <div className="w-full bg-altaj-border h-2 rounded-full overflow-hidden">
              <div
                className="bg-altaj-gold h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="h-16 w-16 rounded-full bg-altaj-sand flex items-center justify-center text-altaj-muted">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <p className="font-serif text-base text-altaj-dark font-bold">Votre panier est vide</p>
                <p className="text-xs text-altaj-muted max-w-xs">
                  Découvrez notre collection de portefeuilles en cuir faits main et profitez de nos offres spéciales duo.
                </p>
                <Link href="/shop" onClick={closeCart}>
                  <Button size="sm">Explorer la collection</Button>
                </Link>
              </div>
            ) : isCheckingOut ? (
              <div className="space-y-4 animate-fade-in">
                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs font-semibold text-altaj-muted hover:text-altaj-dark flex items-center gap-1"
                >
                  ← Retour au panier
                </button>
                <FastCodForm
                  cartItems={items}
                  subtotal={subtotal}
                  shippingFee={amountNeededForFreeShipping === 0 ? 0 : 25}
                  onSuccess={() => {
                    closeCart();
                    setIsCheckingOut(false);
                  }}
                />
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.bundleOffer
                  ? item.bundleOffer.price / item.bundleOffer.quantity
                  : item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${item.bundleOffer?.id || "single"}`}
                    className="flex gap-4 pb-4 border-b border-altaj-border/60"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 bg-altaj-sand rounded-sm overflow-hidden border border-altaj-border">
                      <Image
                        src={item.product.featuredImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-serif text-xs font-bold text-altaj-dark truncate">
                            {item.product.name}
                          </h4>
                          {item.bundleOffer && (
                            <span className="inline-block text-[10px] font-semibold text-altaj-brown bg-altaj-sand px-1.5 py-0.5 rounded-[2px] mt-0.5">
                              {item.bundleOffer.name}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-altaj-muted hover:text-altaj-crimson transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity switcher */}
                        <div className="flex items-center border border-altaj-border rounded-sm bg-altaj-bg">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-altaj-dark hover:bg-altaj-sand transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-altaj-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-altaj-dark hover:bg-altaj-sand transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="font-serif text-sm font-bold text-altaj-dark">
                          {formatMAD(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Subtotal and Checkout CTA */}
          {items.length > 0 && !isCheckingOut && (
            <div className="p-5 border-t border-altaj-border bg-altaj-bg/50 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-altaj-muted">
                  <span>Sous-total</span>
                  <span className="font-semibold text-altaj-dark">{formatMAD(subtotal)}</span>
                </div>
                <div className="flex justify-between text-altaj-muted">
                  <span>Livraison (Maroc)</span>
                  <span className="font-semibold text-altaj-dark">
                    {amountNeededForFreeShipping === 0 ? "Gratuite" : "25 DH"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-altaj-dark pt-2 border-t border-altaj-border">
                  <span>Total à payer à la livraison</span>
                  <span className="text-base text-altaj-brown font-serif">
                    {formatMAD(subtotal + (amountNeededForFreeShipping === 0 ? 0 : 25))}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full justify-between"
                onClick={() => setIsCheckingOut(true)}
              >
                <span>Commander maintenant</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-altaj-muted uppercase tracking-wider font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                <span>Paiement en espèces à la réception du colis</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
