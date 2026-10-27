"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { getOrderById, getSettings } from "@/lib/db/store";
import { Order } from "@/types";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  Package,
  PhoneCall,
  MessageSquare,
  Truck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function OrderConfirmationView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger festive luxury gold confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#B89563", "#5A4031", "#201B18", "#E2D9CE"],
      });
    } catch {}

    if (orderId) {
      const found = getOrderById(orderId);
      if (found) {
        setOrder(found);
      }
    }
    setLoading(false);
  }, [orderId]);

  const settings = getSettings();
  const whatsappNumber = settings.whatsappNumber || "212661234567";

  const whatsappMsg = order
    ? `Bonjour ALTAJLEATHER, je viens de passer la commande #${order.orderNumber} d'un montant de ${formatMAD(order.total)}. Pouvez-vous me confirmer la prise en charge ?`
    : "Bonjour ALTAJLEATHER, je viens de passer commande.";

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <p className="text-sm text-altaj-muted">Chargement de votre reçu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* Success Card Header */}
      <div className="bg-white border border-altaj-border rounded-sm p-6 sm:p-10 shadow-luxury text-center space-y-4">
        <div className="h-16 w-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">
            Commande Validée avec Succès
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-altaj-dark uppercase">
            Merci pour votre commande !
          </h1>
          <p className="text-xs sm:text-sm text-altaj-muted max-w-md mx-auto">
            Votre commande a bien été enregistrée. Notre équipe va vous contacter par téléphone ou WhatsApp pour confirmer l'expédition.
          </p>
        </div>

        {/* Order Identifier Pill */}
        {order && (
          <div className="inline-block bg-altaj-sand px-4 py-1.5 rounded-sm border border-altaj-border">
            <span className="text-xs text-altaj-muted uppercase font-bold tracking-wider">
              N° de commande :{" "}
            </span>
            <span className="text-xs font-serif font-bold text-altaj-dark tracking-widest">
              {order.orderNumber}
            </span>
          </div>
        )}

        {/* Action WhatsApp direct for Moroccan buyers */}
        <div className="pt-2 max-w-sm mx-auto">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 px-4 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            <MessageSquare className="h-4 w-4 fill-white" />
            <span>Confirmer plus rapidement sur WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Order Details Receipt */}
      {order && (
        <div className="bg-white border border-altaj-border rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-altaj-dark border-b border-altaj-border pb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-altaj-gold" />
            <span>Récapitulatif de votre colis</span>
          </h2>

          {/* Items */}
          <div className="space-y-3 divide-y divide-altaj-border/60">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center pt-3 text-xs">
                <div>
                  <h4 className="font-serif font-bold text-altaj-dark">{item.productName}</h4>
                  {item.bundleName && (
                    <span className="text-[10px] text-altaj-brown bg-altaj-sand px-1.5 py-0.5 rounded-[2px] font-semibold">
                      {item.bundleName}
                    </span>
                  )}
                  <div className="text-[11px] text-altaj-muted mt-0.5">Quantité : {item.quantity}</div>
                </div>
                <div className="font-serif font-bold text-altaj-dark text-sm">
                  {formatMAD(item.totalPrice)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-altaj-border space-y-1.5 text-xs">
            <div className="flex justify-between text-altaj-muted">
              <span>Sous-total</span>
              <span className="font-semibold text-altaj-dark">{formatMAD(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-altaj-muted">
              <span>Livraison ({order.customerCity})</span>
              <span className="font-semibold text-altaj-dark">
                {order.shippingFee === 0 ? "Gratuite" : formatMAD(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-altaj-dark pt-2 border-t border-altaj-border">
              <span>Montant à régler en espèces :</span>
              <span className="font-serif text-altaj-brown text-lg">{formatMAD(order.total)}</span>
            </div>
          </div>

          {/* Delivery destination */}
          <div className="pt-4 border-t border-altaj-border bg-altaj-sand/30 p-4 rounded-sm text-xs space-y-1">
            <h4 className="font-bold text-altaj-dark uppercase tracking-wider text-[10px]">
              Adresse de livraison :
            </h4>
            <p className="font-medium text-altaj-dark">{order.customerName}</p>
            <p className="text-altaj-muted">{order.customerAddress}</p>
            <p className="text-altaj-muted">{order.customerCity}, Maroc</p>
            <p className="text-altaj-muted">Téléphone : {order.customerPhone}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-sm">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <span>Vous payez uniquement après avoir reçu et inspecté votre portefeuille ALTAJ.</span>
          </div>
        </div>
      )}

      {/* Continuation buttons */}
      <div className="text-center pt-2">
        <Link href="/shop">
          <Button variant="outline" size="md">
            Continuer mes achats
          </Button>
        </Link>
      </div>
    </div>
  );
}
