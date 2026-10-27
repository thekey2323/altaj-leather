"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, BundleOffer } from "@/types";
import { formatMAD } from "@/lib/utils";
import { ProductGallery } from "./ProductGallery";
import { BundleSelector } from "./BundleSelector";
import { FastCodForm } from "@/components/checkout/FastCodForm";
import { ProductCard } from "./ProductCard";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Star,
  ShoppingBag,
  Sparkles,
  Award,
  ChevronRight,
  Clock,
  RotateCcw,
} from "lucide-react";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const { addItem } = useCart();
  const orderFormRef = useRef<HTMLDivElement>(null);

  // Selected bundle offer state
  const defaultBundle =
    product.bundleOffers.find((b) => b.isPopular) || product.bundleOffers[0];
  const [selectedBundle, setSelectedBundle] = useState<BundleOffer | undefined>(
    defaultBundle
  );

  const discountAmount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice - product.price
      : 0;

  const scrollToOrderForm = () => {
    orderFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddToCart = () => {
    addItem(product, selectedBundle?.quantity || 1, selectedBundle);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-altaj-muted uppercase tracking-wider">
        <Link href="/" className="hover:text-altaj-dark">
          Accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-altaj-dark">
          Boutique
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-altaj-dark font-bold truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <ProductGallery images={product.images} title={product.name} />

          {/* Guarantee Badges Row */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-sm border border-altaj-border text-center text-xs">
            <div className="space-y-1">
              <ShieldCheck className="h-5 w-5 text-altaj-gold mx-auto" />
              <p className="font-bold text-altaj-dark uppercase text-[10px] tracking-wider">
                100% Cuir Véritable
              </p>
              <p className="text-[10px] text-altaj-muted">Pleine fleur certifiée</p>
            </div>
            <div className="space-y-1 border-x border-altaj-border">
              <Award className="h-5 w-5 text-altaj-gold mx-auto" />
              <p className="font-bold text-altaj-dark uppercase text-[10px] tracking-wider">
                Fait Main à Fès
              </p>
              <p className="text-[10px] text-altaj-muted">Coutures au fil ciré</p>
            </div>
            <div className="space-y-1">
              <Truck className="h-5 w-5 text-altaj-gold mx-auto" />
              <p className="font-bold text-altaj-dark uppercase text-[10px] tracking-wider">
                Paiement COD
              </p>
              <p className="text-[10px] text-altaj-muted">À la livraison</p>
            </div>
          </div>
        </div>

        {/* Right Column: Information, Pricing, Bundle Offer & Fast COD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            {/* Rating & reviews */}
            <div className="flex items-center gap-2">
              <div className="flex text-altaj-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-altaj-gold" />
                ))}
              </div>
              <span className="text-xs font-bold text-altaj-dark">
                {product.rating} / 5
              </span>
              <span className="text-xs text-altaj-muted">
                ({product.reviewCount} avis vérifiés)
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-altaj-dark uppercase tracking-tight">
              {product.name}
            </h1>

            <p className="text-xs text-altaj-muted leading-relaxed">
              {product.tagline}
            </p>
          </div>

          {/* Pricing Highlight Box */}
          <div className="bg-altaj-sand/50 p-4 rounded-sm border border-altaj-border flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-altaj-muted">
                Prix unitaire promotionnel
              </div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-altaj-brown">
                  {formatMAD(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-altaj-muted/80 line-through">
                    {formatMAD(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            {discountAmount > 0 && (
              <div className="text-right">
                <span className="inline-block bg-altaj-dark text-altaj-bg text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-[2px]">
                  Économisez {formatMAD(discountAmount)}
                </span>
                <div className="text-[10px] text-emerald-800 font-bold mt-1">
                  En stock ({product.stock} exemplaires)
                </div>
              </div>
            )}
          </div>

          {/* Bundle Offers Selector */}
          <BundleSelector
            offers={product.bundleOffers}
            selectedOfferId={selectedBundle?.id || ""}
            onSelect={(offer) => setSelectedBundle(offer)}
          />

          {/* Direct Actions Buttons */}
          <div className="space-y-2.5 pt-1">
            <Button
              variant="gold"
              size="lg"
              className="w-full text-sm py-4 shadow-gold-glow font-bold"
              onClick={scrollToOrderForm}
            >
              COMMANDER MAINTENANT (PAIEMENT COD)
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full flex items-center justify-center gap-2 bg-white"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Ajouter au Panier</span>
            </Button>
          </div>

          {/* Trust bullet points */}
          <div className="space-y-2 pt-2 border-t border-altaj-border text-xs text-altaj-dark/90 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 flex-shrink-0" />
              <span>Livraison partout au Maroc (Casablanca, Rabat, Tanger, Marrakech, etc.)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 flex-shrink-0" />
              <span>Paiement en espèces à la livraison après vérification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 flex-shrink-0" />
              <span>Confirmation téléphonique immédiate avec notre équipe</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAST COD CHECKOUT FORM SECTION (Landing Page Anchor) */}
      <div ref={orderFormRef} className="pt-8 border-t border-altaj-border max-w-3xl mx-auto">
        <div className="text-center mb-6 space-y-1">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-altaj-gold">
            Formulaire Express
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-altaj-dark uppercase">
            Finalisez votre commande en 1 clic
          </h2>
          <p className="text-xs text-altaj-muted">
            Pas besoin de créer un compte. Renseignez simplement vos coordonnées pour l'expédition.
          </p>
        </div>

        <FastCodForm
          product={product}
          selectedBundle={selectedBundle}
        />
      </div>

      {/* Detailed Product Specifications & Craftsmanship */}
      <div className="bg-white border border-altaj-border p-6 sm:p-10 rounded-sm shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-altaj-dark">
              Description & Caractéristiques
            </h3>
            <p className="text-xs text-altaj-text/80 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-altaj-dark">
              Matériaux & Confection
            </h3>
            <ul className="space-y-2 text-xs text-altaj-text/80">
              {product.materials.map((mat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-altaj-gold flex-shrink-0" />
                  <span>{mat}</span>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-altaj-gold flex-shrink-0" />
                <span>Dimensions : {product.dimensions}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-altaj-gold flex-shrink-0" />
                <span>Origine : {product.handmadeIn}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-altaj-dark">
              Livraison & Retours
            </h3>
            <div className="space-y-2 text-xs text-altaj-text/80">
              <p>
                <strong>Délai :</strong> 24h à 48h ouvrées selon votre ville.
              </p>
              <p>
                <strong>Mode :</strong> Livreur à domicile ou au bureau.
              </p>
              <p>
                <strong>Garantie :</strong> Échange gratuit sous 7 jours en cas de défaut de fabrication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Selling: "VOUS POURRIEZ AUSSI AIMER" */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-altaj-border pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-altaj-gold">
                Suggestions
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-altaj-dark uppercase">
                VOUS POURRIEZ AUSSI AIMER
              </h3>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase font-bold tracking-wider text-altaj-brown hover:text-altaj-dark"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* STICKY MOBILE CTA BAR (Crucial for high conversion) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-altaj-border p-3 px-4 flex items-center justify-between gap-3 shadow-2xl md:hidden">
        <div>
          <div className="text-[10px] text-altaj-muted uppercase font-bold tracking-wider">
            {selectedBundle ? selectedBundle.name : "Prix unitaire"}
          </div>
          <div className="font-serif text-lg font-bold text-altaj-brown">
            {formatMAD(selectedBundle ? selectedBundle.price : product.price)}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end max-w-xs">
          <Button
            size="sm"
            variant="gold"
            className="w-full text-[11px] py-3 tracking-wider font-bold"
            onClick={scrollToOrderForm}
          >
            COMMANDER MAINTENANT
          </Button>
        </div>
      </div>
    </div>
  );
}
