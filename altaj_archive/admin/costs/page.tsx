"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getProducts,
  updateProductCostBreakdown,
  updateBatchProductCosts,
  DEFAULT_COST_BREAKDOWN,
  getCodAnalytics,
} from "@/lib/db/store";
import { Product, WalletCostBreakdown } from "@/types";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Coins,
  TrendingUp,
  Package,
  Truck,
  RotateCcw,
  PhoneCall,
  Target,
  Sparkles,
  CheckCircle2,
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Info,
  Layers,
  Percent,
} from "lucide-react";

export default function AdminCostsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [costBreakdowns, setCostBreakdowns] = useState<Record<string, WalletCostBreakdown>>({});
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global What-If Simulator Sliders
  const [simLeatherDelta, setSimLeatherDelta] = useState<number>(0);
  const [simAdsDelta, setSimAdsDelta] = useState<number>(0);
  const [simDeliveryDelta, setSimDeliveryDelta] = useState<number>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    const prods = getProducts();
    setProducts(prods);

    const initialBreakdowns: Record<string, WalletCostBreakdown> = {};
    prods.forEach((p) => {
      initialBreakdowns[p.id] = p.costBreakdown || {
        ...DEFAULT_COST_BREAKDOWN,
        // Calculate rawLeather based on product cost
        rawLeatherCost: Math.round((p.cost || 50) * 0.48),
        craftingCost: Math.round((p.cost || 50) * 0.36),
        suppliesCost: Math.max(5, (p.cost || 50) - Math.round((p.cost || 50) * 0.48) - Math.round((p.cost || 50) * 0.36)),
      };
    });
    setCostBreakdowns(initialBreakdowns);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateField = (
    productId: string,
    field: keyof WalletCostBreakdown,
    value: number
  ) => {
    setCostBreakdowns((prev) => {
      const current = prev[productId] || { ...DEFAULT_COST_BREAKDOWN };
      return {
        ...prev,
        [productId]: {
          ...current,
          [field]: Math.max(0, value),
        },
      };
    });
  };

  const handleSaveProductBreakdown = (productId: string) => {
    const breakdown = costBreakdowns[productId];
    if (!breakdown) return;

    const updated = updateProductCostBreakdown(productId, breakdown);
    if (updated) {
      showToast(`Coûts réels de "${updated.name}" enregistrés ! Coût atelier mis à jour à ${updated.cost} DH.`);
      setEditingProductId(null);
      loadData();
    }
  };

  const handleSaveAll = () => {
    products.forEach((p) => {
      const breakdown = costBreakdowns[p.id];
      if (breakdown) {
        updateProductCostBreakdown(p.id, breakdown);
      }
    });
    showToast("Tous les coûts par portefeuille ont été enregistrés et liés au P&L !");
    setEditingProductId(null);
    loadData();
  };

  // Summary Metrics Across All Wallets
  const summary = useMemo(() => {
    if (products.length === 0) {
      return {
        avgWorkshopCost: 50,
        avgTotalLandedCost: 135,
        avgPrice: 119,
        avgNetProfit: 35,
        avgNetMargin: 25,
      };
    }

    let totalWorkshopCost = 0;
    let totalLandedCost = 0;
    let totalPrice = 0;

    products.forEach((p) => {
      const b = costBreakdowns[p.id] || DEFAULT_COST_BREAKDOWN;
      const workshop = b.rawLeatherCost + b.craftingCost + b.suppliesCost;
      const landed =
        workshop +
        b.packagingCost +
        b.marketingCpa +
        b.deliveryCost +
        b.returnRiskBuffer +
        b.callCenterCost;

      totalWorkshopCost += workshop;
      totalLandedCost += landed;
      totalPrice += p.price;
    });

    const count = products.length;
    const avgWorkshopCost = Math.round(totalWorkshopCost / count);
    const avgLandedCost = Math.round(totalLandedCost / count);
    const avgPrice = Math.round(totalPrice / count);
    const avgNetProfit = avgPrice - avgLandedCost;
    const avgNetMargin = avgPrice > 0 ? Math.round((avgNetProfit / avgPrice) * 100) : 0;

    return {
      avgWorkshopCost,
      avgTotalLandedCost: avgLandedCost,
      avgPrice,
      avgNetProfit,
      avgNetMargin,
    };
  }, [products, costBreakdowns]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-altaj-dark text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-altaj-gold/40 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-altaj-gold flex-shrink-0" />
          <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-altaj-gold bg-altaj-gold/10 px-2.5 py-0.5 rounded-full border border-altaj-gold/30">
              Unit Economics & Marge Réelle
            </span>
            <span className="text-xs text-altaj-muted">• Maroquinerie ALTAJLEATHER</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-altaj-dark uppercase tracking-tight mt-1">
            Coûts de Revient & Dépenses par Portefeuille
          </h1>
          <p className="text-xs sm:text-sm text-altaj-muted">
            Décomposition exhaustive de chaque Dirham dépensé (Cuir, Atelier Fès, Packaging, Pubs Ads, Transport, Retours) pour connaître votre vrai bénéfice net dans la poche.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3 py-2 text-xs font-bold text-altaj-dark border border-altaj-border rounded-xl bg-white hover:bg-altaj-sand/30 transition-colors shadow-sm"
          >
            ← Dashboard
          </Link>
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-200" />
            <span>Enregistrer Tous les Coûts</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Coût Moyen Sortie Atelier */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Coût Sortie d'Atelier (COGS)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-amber-950">
              {formatMAD(summary.avgWorkshopCost)}
            </span>
            <span className="text-xs text-slate-500">/ portefeuille</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Cuir pleine fleur + Façonnage artisan + Fournitures
          </p>
        </div>

        {/* 2. Coût Total Rendu Client */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Coût Total Rendu Client (Landed)
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-indigo-950">
              {formatMAD(summary.avgTotalLandedCost)}
            </span>
            <span className="text-xs text-slate-500">toutes dépenses incluses</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Atelier + Box Luxe + Pubs Ads + Livreur + Provision retour
          </p>
        </div>

        {/* 3. Vrai Bénéfice Net dans la Poche */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
              Vrai Bénéfice Net Moyen
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-emerald-900">
              +{formatMAD(summary.avgNetProfit)}
            </span>
            <span className="text-xs font-bold text-emerald-700">net dans la poche</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium mt-2">
            Pour un prix de vente moyen de {formatMAD(summary.avgPrice)}
          </p>
        </div>

        {/* 4. Marge Nette Moyenne */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Marge Nette Réelle
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-teal-950">
              {summary.avgNetMargin}%
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Rentable
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Objectif e-commerce COD Maroc : &gt; 25%
          </p>
        </div>
      </div>

      {/* SENSITIVITY SIMULATOR BANNER ("QUE SE PASSE-T-IL SI...") */}
      <div className="bg-white rounded-2xl border border-altaj-border p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-altaj-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-serif text-sm sm:text-base font-extrabold uppercase text-altaj-dark">
                Simulateur de Sensibilité & Impact sur le Profit
              </h3>
              <p className="text-[11px] text-altaj-muted">
                Testez l'impact d'une variation du prix du cuir, du CPA publicitaire ou du tarif livreur sur votre marge nette.
              </p>
            </div>
          </div>
          {(simLeatherDelta !== 0 || simAdsDelta !== 0 || simDeliveryDelta !== 0) && (
            <button
              onClick={() => {
                setSimLeatherDelta(0);
                setSimAdsDelta(0);
                setSimDeliveryDelta(0);
              }}
              className="text-xs text-altaj-brown font-bold hover:underline"
            >
              Réinitialiser simulation
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Slider 1: Cuir */}
          <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="text-altaj-dark">Variation Coût Cuir & Atelier :</span>
              <span className="font-mono text-amber-900 bg-white px-2 py-0.5 rounded border">
                {simLeatherDelta > 0 ? `+${simLeatherDelta}` : simLeatherDelta} DH
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="20"
              step="1"
              value={simLeatherDelta}
              onChange={(e) => setSimLeatherDelta(Number(e.target.value))}
              className="w-full accent-amber-700 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Négociation tanneur Fès ou hausse matière
            </span>
          </div>

          {/* Slider 2: Ads CPA */}
          <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="text-altaj-dark">Variation CPA Ads (Meta/TikTok) :</span>
              <span className="font-mono text-sky-900 bg-white px-2 py-0.5 rounded border">
                {simAdsDelta > 0 ? `+${simAdsDelta}` : simAdsDelta} DH
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="25"
              step="1"
              value={simAdsDelta}
              onChange={(e) => setSimAdsDelta(Number(e.target.value))}
              className="w-full accent-sky-700 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Optimisation créatifs UGC ou hausse CPM
            </span>
          </div>

          {/* Slider 3: Livraison */}
          <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="text-altaj-dark">Variation Tarif Livreur :</span>
              <span className="font-mono text-indigo-900 bg-white px-2 py-0.5 rounded border">
                {simDeliveryDelta > 0 ? `+${simDeliveryDelta}` : simDeliveryDelta} DH
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="15"
              step="1"
              value={simDeliveryDelta}
              onChange={(e) => setSimDeliveryDelta(Number(e.target.value))}
              className="w-full accent-indigo-700 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Tarifs négociés par volume expédié
            </span>
          </div>
        </div>

        {/* Live Simulation Result */}
        {(simLeatherDelta !== 0 || simAdsDelta !== 0 || simDeliveryDelta !== 0) && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-altaj-dark text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
            <div>
              <span className="font-bold uppercase tracking-wider text-emerald-300 block text-[11px]">
                Résultat Simulé par Portefeuille Vendu :
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Nouveau Coût de Revient Total :{" "}
                <strong className="text-white font-mono font-bold">
                  {formatMAD(summary.avgTotalLandedCost + simLeatherDelta + simAdsDelta + simDeliveryDelta)}
                </strong>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Nouveau Profit Net</span>
                <span className="font-serif font-black text-lg text-emerald-300">
                  {formatMAD(summary.avgNetProfit - (simLeatherDelta + simAdsDelta + simDeliveryDelta))}
                </span>
              </div>
              <span
                className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                  -(simLeatherDelta + simAdsDelta + simDeliveryDelta) >= 0
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                }`}
              >
                {-(simLeatherDelta + simAdsDelta + simDeliveryDelta) >= 0
                  ? `+${formatMAD(-(simLeatherDelta + simAdsDelta + simDeliveryDelta))}`
                  : `${formatMAD(-(simLeatherDelta + simAdsDelta + simDeliveryDelta))}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED WALLET CARDS LIST WITH ALL POSSIBLE EXPENSES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-altaj-gold" />
            <h2 className="font-serif text-lg sm:text-xl font-extrabold uppercase text-altaj-dark">
              Décomposition par Modèle de Portefeuille ({products.length})
            </h2>
          </div>
          <span className="text-xs text-altaj-muted">
            Modifiez directement les montants et cliquez sur "Enregistrer"
          </span>
        </div>

        <div className="space-y-4">
          {products.map((p) => {
            const b = costBreakdowns[p.id] || DEFAULT_COST_BREAKDOWN;
            const workshopCost = b.rawLeatherCost + b.craftingCost + b.suppliesCost;
            const landedCost =
              workshopCost +
              b.packagingCost +
              b.marketingCpa +
              b.deliveryCost +
              b.returnRiskBuffer +
              b.callCenterCost;
            const netProfit = p.price - landedCost;
            const netMargin = p.price > 0 ? Math.round((netProfit / p.price) * 100) : 0;
            const grossMargin = p.price > 0 ? Math.round(((p.price - workshopCost) / p.price) * 100) : 0;
            const isEditing = editingProductId === p.id;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-altaj-border shadow-sm overflow-hidden transition-all"
              >
                {/* Product Header Bar */}
                <div className="p-4 sm:p-5 border-b border-altaj-border bg-[#FAF8F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-altaj-border bg-altaj-sand flex-shrink-0 shadow-xs">
                      <Image
                        src={p.featuredImage || "/placeholder.jpg"}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-serif text-base font-extrabold text-altaj-dark">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                          {p.sku}
                        </span>
                        <span>• Prix Public: <strong className="text-altaj-dark font-mono">{formatMAD(p.price)}</strong></span>
                        <span>• Stock Atelier: <strong>{p.stock} unités</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Highlights: Profit & Action */}
                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Bénéfice Net Réel / Pièce
                      </span>
                      <div className="font-serif text-xl font-black text-emerald-900">
                        +{formatMAD(netProfit)}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          netMargin >= 25
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        Marge Nette: {netMargin}%
                      </span>
                    </div>

                    <button
                      onClick={() => handleSaveProductBreakdown(p.id)}
                      className="px-3.5 py-2 bg-altaj-brown hover:bg-altaj-dark text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-altaj-gold" />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </div>

                {/* All Expenses Breakdown Grid */}
                <div className="p-5 space-y-5">
                  {/* Category 1: Workshop & Production (COGS) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-amber-700" />
                        1. Coûts de Fabrication Atelier Fès (COGS Sortie Atelier)
                      </span>
                      <span className="font-serif font-bold text-xs text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        Sous-total Atelier : {formatMAD(workshopCost)} (Marge Brute: {grossMargin}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Leather */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-1">
                        <label className="font-bold text-altaj-dark block">
                          🐂 Cuir Vachette Pleine Fleur
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={b.rawLeatherCost}
                            onChange={(e) =>
                              handleUpdateField(p.id, "rawLeatherCost", Number(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs bg-white pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            DH
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Tannage végétal Fès, découpe & parage
                        </span>
                      </div>

                      {/* Crafting / Artisan */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-1">
                        <label className="font-bold text-altaj-dark block">
                          🧵 Main-d'œuvre Maâlem Fès
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={b.craftingCost}
                            onChange={(e) =>
                              handleUpdateField(p.id, "craftingCost", Number(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs bg-white pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            DH
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Assemblage, coutures sellier, brunissage
                        </span>
                      </div>

                      {/* Supplies */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-1">
                        <label className="font-bold text-altaj-dark block">
                          🔨 Fournitures & Teinture
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={b.suppliesCost}
                            onChange={(e) =>
                              handleUpdateField(p.id, "suppliesCost", Number(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs bg-white pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            DH
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Fil poissé haute ténacité, cire d'abeille
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Packaging, Ads, Delivery & Operations */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-indigo-200/80 pb-1.5">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-indigo-700" />
                        2. Dépenses Opérationnelles, Marketing & Logistique COD
                      </span>
                      <span className="font-serif font-bold text-xs text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                        Frais Généraux : {formatMAD(landedCost - workshopCost)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                      {/* Packaging */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-1">
                        <label className="font-bold text-altaj-dark block">
                          📦 Écrin Luxe & Pochon
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={b.packagingCost}
                            onChange={(e) =>
                              handleUpdateField(p.id, "packagingCost", Number(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs bg-white pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            DH
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Boîte dorée, velours, carte Taj
                        </span>
                      </div>

                      {/* Marketing CPA */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-1">
                        <label className="font-bold text-altaj-dark block">
                          📱 Pubs Meta / TikTok
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={b.marketingCpa}
                            onChange={(e) =>
                              handleUpdateField(p.id, "marketingCpa", Number(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs bg-white pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            DH
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Coût d'acquisition client (CPA)
                        </span>
                      </div>

                      {/* Delivery */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-1">
                        <label className="font-bold text-altaj-dark block">
                          🚚 Livraison Transporteur
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={b.deliveryCost}
                            onChange={(e) =>
                              handleUpdateField(p.id, "deliveryCost", Number(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs bg-white pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            DH
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Frais Cathedis / Amana par colis
                        </span>
                      </div>

                      {/* Return Risk Buffer */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-1">
                        <label className="font-bold text-altaj-dark block">
                          ↩️ Provision Risque Retours
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={b.returnRiskBuffer}
                            onChange={(e) =>
                              handleUpdateField(p.id, "returnRiskBuffer", Number(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs bg-white pr-7 text-rose-700"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            DH
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Amortissement pénalité refus
                        </span>
                      </div>

                      {/* Call Center */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-altaj-border space-y-1">
                        <label className="font-bold text-altaj-dark block">
                          📞 Confirmation WhatsApp
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={b.callCenterCost}
                            onChange={(e) =>
                              handleUpdateField(p.id, "callCenterCost", Number(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs bg-white pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            DH
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Appel & validation adresse
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL P&L PROGRESS STACKED BAR */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-600">Répartition de chaque 100 DH de vente :</span>
                      <span className="text-emerald-800">
                        Coût Complet: <strong>{formatMAD(landedCost)}</strong> → Vrai Bénéfice: <strong>+{formatMAD(netProfit)}</strong>
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden border border-slate-200/80">
                      <div
                        style={{ width: `${Math.min(100, Math.round((workshopCost / p.price) * 100))}%` }}
                        className="bg-amber-500 h-full"
                        title={`Cuir & Façonnage: ${formatMAD(workshopCost)}`}
                      />
                      <div
                        style={{ width: `${Math.min(100, Math.round((b.packagingCost / p.price) * 100))}%` }}
                        className="bg-purple-500 h-full"
                        title={`Packaging: ${formatMAD(b.packagingCost)}`}
                      />
                      <div
                        style={{ width: `${Math.min(100, Math.round((b.marketingCpa / p.price) * 100))}%` }}
                        className="bg-sky-500 h-full"
                        title={`Pubs Ads: ${formatMAD(b.marketingCpa)}`}
                      />
                      <div
                        style={{ width: `${Math.min(100, Math.round(((b.deliveryCost + b.returnRiskBuffer) / p.price) * 100))}%` }}
                        className="bg-indigo-500 h-full"
                        title={`Livraison & Retours: ${formatMAD(b.deliveryCost + b.returnRiskBuffer)}`}
                      />
                      <div
                        style={{ width: `${Math.max(0, Math.min(100, Math.round((netProfit / p.price) * 100)))}%` }}
                        className="bg-emerald-500 h-full"
                        title={`Bénéfice Net: +${formatMAD(netProfit)}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Cuir ({workshopCost} DH)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Packaging ({b.packagingCost} DH)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        Ads ({b.marketingCpa} DH)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Transport ({b.deliveryCost + b.returnRiskBuffer} DH)
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Bénéfice Net (+{netProfit} DH)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
