import React from "react";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">
          Transparence Totale
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-altaj-dark uppercase">
          LIVRAISON & RETOURS AU MAROC
        </h1>
      </div>

      <div className="space-y-8 bg-white p-6 sm:p-10 rounded-sm border border-altaj-border shadow-sm text-xs sm:text-sm text-altaj-text/80 leading-relaxed">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-serif text-base font-bold text-altaj-dark">
            <Truck className="h-5 w-5 text-altaj-gold" />
            <h3>1. Délais et Frais de Livraison</h3>
          </div>
          <p>
            Toutes nos commandes sont expédiées depuis nos ateliers au Maroc. Nous travaillons avec des transporteurs express spécialisés dans la livraison contre remboursement (COD).
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Grand Casablanca & Rabat :</strong> Livraison en 24h ouvrées.</li>
            <li><strong>Marrakech, Tanger, Fès, Agadir, Meknès :</strong> Livraison en 24h à 48h.</li>
            <li><strong>Autres villes du Royaume :</strong> Livraison sous 48h à 72h.</li>
            <li><strong>Tarif :</strong> Livraison offerte dès 200 DH d'achat (dès 2 portefeuilles). Pour les commandes unitaires (119 DH), le forfait standard est de 25 DH.</li>
          </ul>
        </div>

        <div className="space-y-3 pt-6 border-t border-altaj-border">
          <div className="flex items-center gap-2 font-serif text-base font-bold text-altaj-dark">
            <ShieldCheck className="h-5 w-5 text-altaj-gold" />
            <h3>2. Paiement à la Livraison (Cash On Delivery)</h3>
          </div>
          <p>
            Vous ne payez rien en ligne. Vous réglez directement le montant exact en dirhams (MAD) au livreur au moment où il vous remet votre colis. Vous avez le droit d'ouvrir le colis et de vérifier l'état du produit.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-altaj-border">
          <div className="flex items-center gap-2 font-serif text-base font-bold text-altaj-dark">
            <RotateCcw className="h-5 w-5 text-altaj-gold" />
            <h3>3. Politique d'Échange et Retours</h3>
          </div>
          <p>
            Si le produit présente un quelconque défaut de fabrication ou ne correspond pas à vos attentes, vous bénéficiez d'un délai de 7 jours après réception pour demander un échange ou un remboursement. Le produit doit être neuf, non utilisé, dans son emballage d'origine.
          </p>
        </div>
      </div>
    </div>
  );
}
