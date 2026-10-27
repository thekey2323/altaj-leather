import React from "react";
import { getProducts } from "@/lib/db/store";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Boutique en Ligne | ALTAJLEATHER Maroc",
  description: "Explorez notre gamme complète de portefeuilles faits main en cuir véritable à Fès et Marrakech.",
};

export default function ShopPage() {
  const products = getProducts().filter((p) => p.status === "ACTIVE");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* Shop Header */}
      <div className="border-b border-altaj-border pb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">
            Collection Complète
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-altaj-dark uppercase mt-1">
            BOUTIQUE ALTAJ
          </h1>
          <p className="text-xs sm:text-sm text-altaj-muted mt-1 max-w-lg">
            Portefeuilles en cuir pleine fleur, assemblés à la main au Maroc. 119 DH l'unité • 2 pour 200 DH avec livraison gratuite partout au Maroc.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-altaj-dark bg-white border border-altaj-border px-3.5 py-2 rounded-sm shadow-sm font-semibold">
          <Sparkles className="h-4 w-4 text-altaj-gold" />
          <span>{products.length} Modèles Disponibles</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
