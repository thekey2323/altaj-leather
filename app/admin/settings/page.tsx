"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getSettings, saveSettings, getProducts, saveProduct } from "@/lib/db/store";
import { StoreSettings, Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Save,
  CheckCircle2,
  MessageCircle,
  Truck,
  ShieldCheck,
  Camera,
  Sparkles,
  Check
} from "lucide-react";

const AVAILABLE_PHOTO_PRESETS = [
  { url: "/images/products/cognac-minimalist.jpg", title: "Royal Cognac (Face)" },
  { url: "/images/products/altaj-classic-brown-front.jpg", title: "Classic Marron (Face)" },
  { url: "/images/products/altaj-classic-brown-open.jpg", title: "Classic Marron (Ouvert)" },
  { url: "/images/products/altaj-classic-brown-interior.jpg", title: "Détail Intérieur" },
  { url: "/images/products/passport-cover.jpg", title: "Protège-Passeport" },
  { url: "/images/products/bifold-morocco.jpg", title: "Classic Bifold" },
  { url: "/images/products/black-snap-wallet.jpg", title: "Snap Noir (Face)" },
  { url: "/images/products/altaj-noir-front.jpg", title: "Noir Minimaliste" },
  { url: "/images/products/altaj-noir-open.jpg", title: "Noir Déployé" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successNote, setSuccessNote] = useState("Paramètres enregistrés avec succès !");

  useEffect(() => {
    setSettings(getSettings());
    setProducts(getProducts());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    saveSettings(settings);
    setSuccessNote("Paramètres enregistrés avec succès !");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSetProductDefaultPhoto = async (productId: string, photoUrl: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const exists = p.images.some((img) => img.url === photoUrl);
    const updatedImages = exists
      ? p.images.map((img) => ({ ...img, isFeatured: img.url === photoUrl }))
      : [
          {
            id: `img-${Date.now()}`,
            url: photoUrl,
            alt: p.name,
            isFeatured: true,
            order: 1,
          },
          ...p.images.map((img) => ({ ...img, isFeatured: false })),
        ];

    const reordered = [
      ...updatedImages.filter((img) => img.url === photoUrl),
      ...updatedImages.filter((img) => img.url !== photoUrl),
    ];

    const updated: Product = {
      ...p,
      featuredImage: photoUrl,
      images: reordered,
      updatedAt: new Date().toISOString(),
    };

    saveProduct(updated);
    setProducts((prev) => prev.map((item) => (item.id === productId ? updated : item)));

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch {}

    setSuccessNote(`Visuel par défaut de « ${p.name} » mis à jour et appliqué sur l'accueil et les fiches produits !`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  if (!settings) {
    return <div className="py-20 text-center text-xs text-slate-400">Chargement des paramètres...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8DFD3]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E35] bg-[#F7F0E6] px-2.5 py-0.5 rounded-full border border-[#E8DAC8]">
            Configuration COD & Boutique
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1E1916] font-serif mt-1">
            Paramètres Simples de la Boutique
          </h1>
          <p className="text-xs text-[#7A6E63] mt-0.5">
            Configurez votre WhatsApp officiel, vos règles COD et vos photos par défaut.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl font-bold border border-emerald-200 animate-fade-in shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successNote}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* 1. WhatsApp Settings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1E1916] border-b border-[#F2ECE3] pb-2">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Numéro WhatsApp Officiel</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Numéro de téléphone WhatsApp (pour recevoir les demandes & confirmer les commandes) :
            </label>
            <Input
              type="text"
              value={settings.whatsappNumber || "0693148230"}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="0693148230 ou 212693148230"
              required
            />
            <p className="text-[11px] text-slate-400">
              Actuel : 06 93 14 82 30 (utilisé sur tous les boutons WhatsApp du site).
            </p>
          </div>
        </div>

        {/* 2. Photos par Défaut des Produits (Appliquées sur page principale & pages produits) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#F2ECE3] pb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1E1916]">
              <Camera className="w-4 h-4 text-[#8C5E35]" />
              <span>Visuels par Défaut (Page d'accueil & Fiches Produits)</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✓ Synchronisation automatique en direct
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Cliquez sur n'importe quelle photo ci-dessous pour la définir instantanément comme image principale par défaut d'un modèle. La modification s'applique automatiquement sur la page d'accueil (vitrine) et sur sa fiche produit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-3.5 bg-[#FAF8F5] rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden border-2 border-altaj-gold bg-white shrink-0 shadow-xs">
                    <Image src={p.featuredImage} alt={p.name} fill className="object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-altaj-gold text-white text-[7.5px] font-bold text-center py-0.2">
                      Défaut ★
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-[#1E1916] truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{p.featuredImage}</div>
                    <div className="text-[10px] text-emerald-800 font-semibold mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Appliqué sur l'accueil & fiche produit</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Changer le visuel par défaut :
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {AVAILABLE_PHOTO_PRESETS.map((opt, i) => {
                      const isActive = p.featuredImage === opt.url;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSetProductDefaultPhoto(p.id, opt.url)}
                          className={`relative h-11 w-11 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            isActive
                              ? "border-altaj-gold ring-2 ring-altaj-gold"
                              : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400"
                          }`}
                          title={`Définir « ${opt.title} » comme défaut`}
                        >
                          <Image src={opt.url} alt={opt.title} fill className="object-cover" />
                          {isActive && (
                            <div className="absolute inset-0 bg-altaj-gold/30 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. COD & Shipping Rules */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1E1916] border-b border-[#F2ECE3] pb-2">
            <Truck className="w-4 h-4 text-[#8C5E35]" />
            <span>Règles de Livraison & Paiement à la Livraison (COD)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Frais de livraison standard (DH) :
              </label>
              <Input
                type="number"
                value={settings.shippingFeeStandard}
                onChange={(e) => setSettings({ ...settings, shippingFeeStandard: parseFloat(e.target.value) || 0 })}
                required
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ex: 0 pour livraison 100% gratuite ou 25 DH.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Seuil de livraison gratuite (DH) :
              </label>
              <Input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                required
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ex: 189 DH (pour offrir la livraison à partir de 2 pièces).
              </p>
            </div>
          </div>
        </div>

        {/* 4. Inspection & Packaging Notice */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD3] space-y-1.5 text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-xs text-[#8C5E35]">
            <ShieldCheck className="w-4 h-4 text-[#28A745]" />
            <span>Garanties COD Actives</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            ✓ 100% Cuir Naturel sans chrome chimique.<br />
            ✓ Emballage Kraft soigné et sobre.<br />
            ✓ Inspection du colis par le client avant paiement en espèces au livreur.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="gold" size="lg" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold cursor-pointer">
            <Save className="h-4 w-4" />
            <span>Enregistrer les Paramètres</span>
          </Button>
        </div>

      </form>
    </div>
  );
}
