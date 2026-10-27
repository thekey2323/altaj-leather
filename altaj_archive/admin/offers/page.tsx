"use client";

import React, { useState, useEffect } from "react";
import { getProducts, saveProduct } from "@/lib/db/store";
import { Product, BundleOffer } from "@/types";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tag, Plus, Trash2, X } from "lucide-react";

export default function AdminOffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offerName, setOfferName] = useState("2 Portefeuilles (Pack Duo)");
  const [offerQty, setOfferQty] = useState(2);
  const [offerPrice, setOfferPrice] = useState(200);
  const [offerBadge, setOfferBadge] = useState("MEILLEURE OFFRE — LIVRAISON GRATUITE");
  const [offerSavings, setOfferSavings] = useState(138);

  const loadData = () => {
    const prods = getProducts();
    setProducts(prods);
    if (!selectedProductId && prods.length > 0) {
      setSelectedProductId(prods[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentProduct = products.find((p) => p.id === selectedProductId);

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    const newOffer: BundleOffer = {
      id: `bundle-${Date.now()}`,
      name: offerName.trim(),
      quantity: Number(offerQty),
      price: Number(offerPrice),
      badge: offerBadge.trim(),
      savings: Number(offerSavings),
      isPopular: true,
    };

    const updatedOffers = [...currentProduct.bundleOffers, newOffer];
    saveProduct({ ...currentProduct, bundleOffers: updatedOffers });
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteOffer = (offerId: string) => {
    if (!currentProduct) return;
    if (confirm("Supprimer cette offre ?")) {
      const updatedOffers = currentProduct.bundleOffers.filter((o) => o.id !== offerId);
      saveProduct({ ...currentProduct, bundleOffers: updatedOffers });
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">Moteur de Vente</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-altaj-dark uppercase">OFFRES & BUNDLES</h1>
        </div>
        <Button variant="gold" size="md" onClick={() => setIsModalOpen(true)}>+ Nouvelle Offre</Button>
      </div>

      <div className="bg-white p-4 rounded-sm border border-altaj-border shadow-sm flex items-center gap-4">
        <label className="text-xs font-bold uppercase">Sélectionner modèle :</label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="bg-altaj-sand/30 border border-altaj-border px-3 py-2 text-xs rounded-sm flex-1"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} (Prix unitaire : {formatMAD(p.price)})</option>
          ))}
        </select>
      </div>

      {currentProduct && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentProduct.bundleOffers.map((offer) => (
            <div key={offer.id} className="bg-white p-5 rounded-sm border-2 border-altaj-border shadow-sm space-y-3 relative">
              {offer.badge && (
                <span className="bg-altaj-brown text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm">
                  {offer.badge}
                </span>
              )}
              <h4 className="font-serif text-base font-bold text-altaj-dark">{offer.name}</h4>
              <p className="text-xs text-altaj-muted">Quantité : {offer.quantity} | Économie : {formatMAD(offer.savings || 0)}</p>
              <div className="flex justify-between items-center pt-2 border-t border-altaj-border">
                <span className="font-serif text-xl font-bold text-altaj-brown">{formatMAD(offer.price)}</span>
                <button onClick={() => handleDeleteOffer(offer.id)} className="text-altaj-muted hover:text-altaj-crimson">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-altaj-dark/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-sm p-6 space-y-4">
            <h3 className="font-serif text-base font-bold uppercase">Créer une offre</h3>
            <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
              <Input label="Nom de l'offre" value={offerName} onChange={(e) => setOfferName(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Quantité" type="number" value={offerQty} onChange={(e) => setOfferQty(parseInt(e.target.value) || 1)} required />
                <Input label="Prix total (DH)" type="number" value={offerPrice} onChange={(e) => setOfferPrice(parseFloat(e.target.value) || 0)} required />
              </div>
              <Input label="Badge" value={offerBadge} onChange={(e) => setOfferBadge(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" variant="gold" size="sm">Créer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
