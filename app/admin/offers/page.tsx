"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, saveProduct } from "@/lib/db/store";
import { Product, BundleOffer } from "@/types";
import { formatMAD } from "@/lib/utils";
import {
  Tag,
  Plus,
  Trash2,
  Pencil,
  X,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Truck,
  Star,
  Flame,
  ArrowRight,
  Package,
} from "lucide-react";

export default function AdminOffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOfferName, setNewOfferName] = useState("Pack Duo (2 Portefeuilles Cuir)");
  const [newOfferQty, setNewOfferQty] = useState(2);
  const [newOfferPrice, setNewOfferPrice] = useState(200);
  const [newOfferBadge, setNewOfferBadge] = useState("MEILLEURE OFFRE — LIVRAISON GRATUITE");
  const [newOfferSavings, setNewOfferSavings] = useState(138);
  const [newOfferIsPopular, setNewOfferIsPopular] = useState(true);

  // Edit Modal State
  const [editingOffer, setEditingOffer] = useState<{
    offer: BundleOffer;
    productId: string;
  } | null>(null);

  // Delete State
  const [deletingOffer, setDeletingOffer] = useState<{
    offer: BundleOffer;
    productId: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/offers");
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          if (!selectedProductId && data.products.length > 0) {
            setSelectedProductId(data.products[0].id);
          }
          return;
        }
      }
    } catch (e) {}

    const prods = getProducts();
    setProducts(prods);
    if (!selectedProductId && prods.length > 0) {
      setSelectedProductId(prods[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Auto-calculate savings suggestion based on quantity & product price
  const calculateDefaultSavings = (qty: number, price: number, unitPrice: number) => {
    const regularTotal = (unitPrice || 119) * qty;
    return Math.max(0, regularTotal - price);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: currentProduct.id,
          name: newOfferName,
          quantity: newOfferQty,
          price: newOfferPrice,
          badge: newOfferBadge,
          savings: newOfferSavings,
          isPopular: newOfferIsPopular,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          saveProduct(data.product);
        }
      } else {
        // Fallback local save
        const newOffer: BundleOffer = {
          id: `bundle-${Date.now()}`,
          name: newOfferName.trim(),
          quantity: Number(newOfferQty),
          price: Number(newOfferPrice),
          badge: newOfferBadge.trim(),
          savings: Number(newOfferSavings),
          isPopular: newOfferIsPopular,
        };
        const updatedOffers = [...(currentProduct.bundleOffers || []), newOffer];
        saveProduct({ ...currentProduct, bundleOffers: updatedOffers });
      }
    } catch (e) {
      const newOffer: BundleOffer = {
        id: `bundle-${Date.now()}`,
        name: newOfferName.trim(),
        quantity: Number(newOfferQty),
        price: Number(newOfferPrice),
        badge: newOfferBadge.trim(),
        savings: Number(newOfferSavings),
        isPopular: newOfferIsPopular,
      };
      const updatedOffers = [...(currentProduct.bundleOffers || []), newOffer];
      saveProduct({ ...currentProduct, bundleOffers: updatedOffers });
    }

    setIsCreateModalOpen(false);
    loadData();
    showToast(`Offre "${newOfferName}" créée avec succès !`);
  };

  const handleUpdateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;

    const { offer, productId } = editingOffer;

    try {
      const res = await fetch("/api/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          offerId: offer.id,
          name: offer.name,
          quantity: offer.quantity,
          price: offer.price,
          badge: offer.badge,
          savings: offer.savings,
          isPopular: offer.isPopular,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          saveProduct(data.product);
        }
      } else {
        const prod = products.find((p) => p.id === productId);
        if (prod) {
          const updatedOffers = (prod.bundleOffers || []).map((o) =>
            o.id === offer.id ? offer : o
          );
          saveProduct({ ...prod, bundleOffers: updatedOffers });
        }
      }
    } catch (e) {
      const prod = products.find((p) => p.id === productId);
      if (prod) {
        const updatedOffers = (prod.bundleOffers || []).map((o) =>
          o.id === offer.id ? offer : o
        );
        saveProduct({ ...prod, bundleOffers: updatedOffers });
      }
    }

    setEditingOffer(null);
    loadData();
    showToast(`Offre "${offer.name}" mise à jour avec succès !`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOffer) return;
    const { offer, productId } = deletingOffer;

    try {
      await fetch(
        `/api/offers?productId=${encodeURIComponent(productId)}&offerId=${encodeURIComponent(
          offer.id
        )}`,
        { method: "DELETE" }
      );
    } catch (e) {}

    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const updatedOffers = (prod.bundleOffers || []).filter((o) => o.id !== offer.id);
      saveProduct({ ...prod, bundleOffers: updatedOffers });
    }

    setDeletingOffer(null);
    loadData();
    showToast(`Offre "${offer.name}" supprimée.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-400 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EBE6DE] shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-fuchsia-600 bg-fuchsia-50 px-2.5 py-0.5 rounded-full border border-fuchsia-200">
            Conversion & Panier Moyen
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Offres & Packs Bundles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurez vos packs (Pack Duo 200 DH, Trio, etc.), réductions et livraison gratuite. Synchronisé en direct avec le bot WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="px-3.5 py-2 text-xs font-bold text-slate-700 border border-[#E0D9CE] rounded-2xl bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            ← Dashboard
          </Link>
          <button
            onClick={() => {
              if (currentProduct) {
                const calculatedSavings = calculateDefaultSavings(2, 200, currentProduct.price);
                setNewOfferSavings(calculatedSavings);
              }
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Nouvelle Offre</span>
          </button>
        </div>
      </div>

      {/* Model Selection Selector */}
      <div className="bg-white p-5 rounded-3xl border border-[#EBE6DE] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-fuchsia-50 border border-fuchsia-100 rounded-2xl text-fuchsia-600">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Modèle de Référence</h3>
            <p className="text-[11px] text-slate-400">Sélectionnez le modèle dont vous gérez les offres :</p>
          </div>
        </div>

        <div className="w-full md:w-80">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full bg-[#F4F2EE] hover:bg-[#EFECE6] border border-transparent focus:border-amber-400 px-4 py-2.5 text-xs font-bold rounded-2xl focus:outline-none transition-all text-slate-800"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Prix unitaire : {formatMAD(p.price)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Product Info Banner */}
      {currentProduct && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-3xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-amber-200 overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
              {currentProduct.featuredImage ? (
                <img
                  src={currentProduct.featuredImage}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">{currentProduct.name}</h2>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                  {currentProduct.sku}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Prix unitaire client : <strong className="text-amber-800">{formatMAD(currentProduct.price)}</strong> • Coût atelier : {formatMAD(currentProduct.cost || 50)}
              </p>
            </div>
          </div>

          <div className="text-right sm:text-left text-xs text-slate-500">
            <span>Offres actives : </span>
            <strong className="text-slate-900">{currentProduct.bundleOffers?.length || 0} packs</strong>
          </div>
        </div>
      )}

      {/* Bundle Offers Grid */}
      {currentProduct && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(!currentProduct.bundleOffers || currentProduct.bundleOffers.length === 0) ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mx-auto">
                <Tag className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-800">
                Aucune offre configurée pour ce modèle
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Créez une offre groupée (ex: Pack Duo 2 portefeuilles à 200 DH avec livraison gratuite) pour booster vos ventes.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4 text-amber-400" />
                <span>Créer le Pack Duo</span>
              </button>
            </div>
          ) : (
            currentProduct.bundleOffers.map((offer) => {
              const unitPriceCalculated = Math.round(offer.price / (offer.quantity || 1));
              const isFreeShipping = offer.quantity >= 2 || (offer.badge && offer.badge.toLowerCase().includes("gratuit"));

              return (
                <div
                  key={offer.id}
                  className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-lg relative overflow-hidden ${
                    offer.isPopular
                      ? "border-amber-300 shadow-md ring-1 ring-amber-200"
                      : "border-[#EBE6DE] shadow-sm"
                  }`}
                >
                  {/* Popular top banner */}
                  {offer.isPopular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                      <Flame className="h-3 w-3 fill-slate-950" />
                      <span>Plus Populaire</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Badge */}
                    {offer.badge ? (
                      <span className="inline-block bg-fuchsia-50 border border-fuchsia-200/80 text-fuchsia-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                        {offer.badge}
                      </span>
                    ) : (
                      <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                        Offre Standard
                      </span>
                    )}

                    {/* Title */}
                    <div>
                      <h4 className="font-serif text-lg font-bold text-slate-900 tracking-tight">
                        {offer.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Contient <strong>{offer.quantity} articles</strong> ({unitPriceCalculated} DH / pièce)
                      </p>
                    </div>

                    {/* Pricing Display */}
                    <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#F0EBE3] space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-slate-500">Prix Total Client :</span>
                        <span className="font-serif text-2xl font-black text-amber-900">
                          {formatMAD(offer.price)}
                        </span>
                      </div>

                      {offer.savings ? (
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAE3D8]">
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                            Économie Client :
                          </span>
                          <span className="font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            -{formatMAD(offer.savings)}
                          </span>
                        </div>
                      ) : null}

                      {/* Delivery badge */}
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 pt-1">
                        <Truck className="h-3.5 w-3.5 text-amber-600" />
                        {isFreeShipping ? (
                          <span className="text-emerald-700 font-extrabold">Livraison Gratuite (0 DH)</span>
                        ) : (
                          <span>Livraison Standard (25 DH)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {offer.id.slice(0, 14)}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* EDIT BUTTON */}
                      <button
                        title="Modifier cette offre"
                        onClick={() =>
                          setEditingOffer({
                            offer: { ...offer },
                            productId: currentProduct.id,
                          })
                        }
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Pencil className="h-3.5 w-3.5 text-amber-700" />
                        <span>Modifier</span>
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        title="Supprimer cette offre"
                        onClick={() =>
                          setDeletingOffer({
                            offer,
                            productId: currentProduct.id,
                          })
                        }
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT OFFER (MODIFIER L'OFFRE ET BUNDLE)                           */}
      {/* ========================================================================= */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Pencil className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Modifier l'Offre & Bundle
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ajustez les prix, quantités et affichage de l'offre
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingOffer(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOffer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Nom de l'offre / Titre</label>
                <input
                  type="text"
                  required
                  value={editingOffer.offer.name}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      offer: { ...editingOffer.offer, name: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-semibold text-slate-800 outline-none transition-all"
                  placeholder="Ex: Pack Duo (2 Portefeuilles Cuir)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Quantité incluse</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={editingOffer.offer.quantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value) || 1;
                      const calculatedSavings = calculateDefaultSavings(
                        qty,
                        editingOffer.offer.price,
                        currentProduct?.price || 119
                      );
                      setEditingOffer({
                        ...editingOffer,
                        offer: {
                          ...editingOffer.offer,
                          quantity: qty,
                          savings: calculatedSavings,
                        },
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-mono font-bold text-slate-800 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Prix Total Client (DH)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingOffer.offer.price}
                    onChange={(e) => {
                      const p = Number(e.target.value) || 0;
                      const calculatedSavings = calculateDefaultSavings(
                        editingOffer.offer.quantity,
                        p,
                        currentProduct?.price || 119
                      );
                      setEditingOffer({
                        ...editingOffer,
                        offer: {
                          ...editingOffer.offer,
                          price: p,
                          savings: calculatedSavings,
                        },
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-mono font-black text-amber-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Économie Client (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingOffer.offer.savings || 0}
                    onChange={(e) =>
                      setEditingOffer({
                        ...editingOffer,
                        offer: {
                          ...editingOffer.offer,
                          savings: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-mono font-bold text-emerald-700 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Badge Marketing</label>
                  <input
                    type="text"
                    value={editingOffer.offer.badge || ""}
                    onChange={(e) =>
                      setEditingOffer({
                        ...editingOffer,
                        offer: { ...editingOffer.offer, badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-semibold text-slate-800 outline-none transition-all"
                    placeholder="Ex: 🔥 MEILLEURE OFFRE — LIVRAISON GRATUITE"
                  />
                </div>
              </div>

              {/* Popular Checkbox */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-950 block">Mettre en avant cette offre</span>
                  <span className="text-[11px] text-amber-800/80">
                    Affiche le badge doré "Plus Populaire" et met en relief la carte
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(editingOffer.offer.isPopular)}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      offer: {
                        ...editingOffer.offer,
                        isPopular: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 rounded-lg text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOffer(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-md"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE NEW OFFER                                                 */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200">
                  <Plus className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Créer une Nouvelle Offre Bundle
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ajoutez un pack duo, trio ou offre personnalisée
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Nom de l'offre / Titre</label>
                <input
                  type="text"
                  required
                  value={newOfferName}
                  onChange={(e) => setNewOfferName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-semibold text-slate-800 outline-none transition-all"
                  placeholder="Ex: Pack Duo (2 Portefeuilles Cuir)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Quantité incluse</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newOfferQty}
                    onChange={(e) => {
                      const q = Number(e.target.value) || 1;
                      setNewOfferQty(q);
                      setNewOfferSavings(
                        calculateDefaultSavings(q, newOfferPrice, currentProduct?.price || 119)
                      );
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-mono font-bold text-slate-800 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Prix Total Client (DH)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOfferPrice}
                    onChange={(e) => {
                      const p = Number(e.target.value) || 0;
                      setNewOfferPrice(p);
                      setNewOfferSavings(
                        calculateDefaultSavings(newOfferQty, p, currentProduct?.price || 119)
                      );
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-mono font-black text-amber-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Économie Client (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={newOfferSavings}
                    onChange={(e) => setNewOfferSavings(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-mono font-bold text-emerald-700 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Badge Promotionnel</label>
                  <input
                    type="text"
                    value={newOfferBadge}
                    onChange={(e) => setNewOfferBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F2EE] focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl font-semibold text-slate-800 outline-none transition-all"
                    placeholder="Ex: 🔥 MEILLEURE OFFRE — LIVRAISON GRATUITE"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-950 block">Mettre en avant cette offre</span>
                  <span className="text-[11px] text-amber-800/80">
                    Affiche le badge "Plus Populaire"
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newOfferIsPopular}
                  onChange={(e) => setNewOfferIsPopular(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-md"
                >
                  Créer l'Offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRM DELETE OFFER                                             */}
      {/* ========================================================================= */}
      {deletingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-rose-200 shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Supprimer cette Offre ?
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Cette action retirera le pack de la boutique et du bot WhatsApp.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1 border border-slate-200">
              <p>
                <strong>Offre :</strong> {deletingOffer.offer.name}
              </p>
              <p>
                <strong>Quantité :</strong> {deletingOffer.offer.quantity} articles • {formatMAD(deletingOffer.offer.price)}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingOffer(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md"
              >
                Oui, Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
