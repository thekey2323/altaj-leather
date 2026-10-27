"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  Truck,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Clock,
  PhoneCall,
  MessageSquare,
  ArrowUpRight,
  Package,
  Boxes,
  Sliders,
  Settings,
  Plus,
  Minus,
  RefreshCw,
  Percent,
  ShieldCheck,
  Flame,
  X,
  Target,
  ChevronRight,
  Info,
  Sparkles,
  Layers,
  Calculator,
  Coins,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import {
  getCodAnalytics,
  getCodSettings,
  saveCodSettings,
  quickAdjustStock,
  updateOrderStatus,
  updateBatchProductCosts,
  updateProductCost,
  DateRangeFilter,
  CodSettings,
} from "@/lib/db/store";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30days");
  const [data, setData] = useState<any>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [costModalTab, setCostModalTab] = useState<"EXPLANATION" | "EDIT">("EXPLANATION");
  const [productCosts, setProductCosts] = useState<Record<string, number>>({});
  const [globalCost, setGlobalCost] = useState<number>(50);
  const [tempSettings, setTempSettings] = useState<CodSettings | null>(null);
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<string>("");
  const [adjustMode, setAdjustMode] = useState<"ADD" | "REMOVE" | "SET">("ADD");
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [customStockReason, setCustomStockReason] = useState<string>("Nouvel arrivage atelier de Fès");
  const [customThreshold, setCustomThreshold] = useState<number>(10);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = () => {
    try {
      const analytics = getCodAnalytics(dateRange);
      setData(analytics);
      setTempSettings(analytics.settings);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const openCostModal = (tab: "EXPLANATION" | "EDIT" = "EXPLANATION") => {
    if (!data?.productsStock) return;
    const initialCosts: Record<string, number> = {};
    data.productsStock.forEach((p: any) => {
      initialCosts[p.id] = p.cost || 50;
    });
    setProductCosts(initialCosts);
    setCostModalTab(tab);
    setCostModalOpen(true);
  };

  const handleApplyGlobalCost = () => {
    if (!data?.productsStock) return;
    const updated: Record<string, number> = {};
    data.productsStock.forEach((p: any) => {
      updated[p.id] = globalCost;
    });
    setProductCosts(updated);
  };

  const handleSaveCosts = (e: React.FormEvent) => {
    e.preventDefault();
    updateBatchProductCosts(productCosts);
    setCostModalOpen(false);
    loadData();
    showToast("Coûts de fabrication par portefeuille enregistrés ! Bénéfice net recalculé.");
  };

  // Live real profit simulation based on entered product costs
  const costSimulation = useMemo(() => {
    if (!data || !data.productsStock) {
      return {
        simulatedCogs: 0,
        simulatedNetProfit: 0,
        simulatedNetMargin: 0,
        simulatedGrossProfit: 0,
        simulatedGrossMargin: 0,
        diffFromCurrentNet: 0,
      };
    }

    let simulatedCogs = 0;
    data.productsStock.forEach((p: any) => {
      const unitCost = productCosts[p.id] !== undefined ? productCosts[p.id] : (p.cost || 50);
      simulatedCogs += (p.deliveredUnits || 0) * unitCost;
    });

    const simulatedGrossProfit = data.deliveredRevenue - simulatedCogs;
    const simulatedGrossMargin =
      data.deliveredRevenue > 0
        ? Math.round((simulatedGrossProfit / data.deliveredRevenue) * 1000) / 10
        : 0;

    const otherExpenses =
      data.totalAdSpend +
      data.courierDeliveryCost +
      data.courierReturnCost +
      data.packagingCost;
    const simulatedNetProfit = data.deliveredRevenue - simulatedCogs - otherExpenses;
    const simulatedNetMargin =
      data.deliveredRevenue > 0
        ? Math.round((simulatedNetProfit / data.deliveredRevenue) * 1000) / 10
        : 0;
    const diffFromCurrentNet = simulatedNetProfit - data.netProfit;

    return {
      simulatedCogs,
      simulatedNetProfit,
      simulatedNetMargin,
      simulatedGrossProfit,
      simulatedGrossMargin,
      diffFromCurrentNet,
    };
  }, [data, productCosts]);

  const openStockModal = (
    productId?: string,
    mode: "ADD" | "REMOVE" | "SET" = "ADD"
  ) => {
    const pId = productId || data?.productsStock[0]?.id || "";
    setSelectedProductForRestock(pId);
    setAdjustMode(mode);
    setRestockAmount(mode === "ADD" ? 15 : mode === "REMOVE" ? 2 : 25);
    setCustomStockReason(
      mode === "ADD"
        ? "Nouvel arrivage atelier maroquinerie Fès"
        : mode === "REMOVE"
        ? "Prélèvement / Pièce d'exposition"
        : "Comptage physique & inventaire atelier"
    );
    setStockModalOpen(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSettings) return;
    saveCodSettings(tempSettings);
    setSettingsModalOpen(false);
    loadData();
    showToast("Paramètres COD et dépenses Ads mis à jour avec succès !");
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForRestock) return;

    quickAdjustStock(
      selectedProductForRestock,
      restockAmount,
      adjustMode,
      customStockReason,
      customThreshold
    );
    setStockModalOpen(false);
    loadData();

    const targetProduct = data.productsStock.find(
      (p: any) => p.id === selectedProductForRestock
    );
    const prodName = targetProduct ? targetProduct.name : "Produit";

    showToast(
      adjustMode === "ADD"
        ? `Stock augmenté (+${restockAmount} unités) pour ${prodName} !`
        : adjustMode === "REMOVE"
        ? `Stock réduit (-${restockAmount} unités) pour ${prodName}.`
        : `Stock fixé à ${restockAmount} unités pour ${prodName}.`
    );
  };

  const handleQuickConfirm = (orderId: string) => {
    updateOrderStatus(orderId, "CONFIRMED", "Admin");
    loadData();
    showToast("Commande confirmée et prête pour expédition !");
  };

  if (!data) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-altaj-gold border-t-transparent rounded-full mb-3" />
        <p className="text-xs text-altaj-muted font-medium">Chargement du tableau de bord COD ALTAJLEATHER...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* SUCCESS TOAST */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-emerald-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E6DFD5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
              Direct Atelier Maroquinerie Fès
            </span>
            <span className="text-[11px] text-altaj-muted font-medium">Paiement à la Livraison (COD Maroc)</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#201B18] mt-1 tracking-tight">
            TABLEAU DE BORD EXÉCUTIF
          </h1>
          <p className="text-xs text-altaj-muted mt-0.5">
            Suivi du bénéfice net réel, du taux de livraison transporteur et du stock de portefeuilles en cuir fait-main.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date range toggle pills */}
          <div className="bg-[#FAF8F5] p-1 rounded-lg border border-[#E6DFD5] flex items-center text-xs font-semibold">
            {(
              [
                { id: "today", label: "Aujourd'hui" },
                { id: "7days", label: "7 Jours" },
                { id: "30days", label: "30 Jours" },
                { id: "all", label: "Tout" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  dateRange === tab.id
                    ? "bg-altaj-brown text-white shadow-sm"
                    : "text-altaj-muted hover:text-altaj-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cost per Wallet / Net Profit Button */}
          <button
            onClick={() => openCostModal("EXPLANATION")}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            title="Comprendre le calcul du bénéfice net et ajuster les coûts"
          >
            <Calculator className="h-3.5 w-3.5 text-emerald-200" />
            <span>Calcul du Bénéfice & Coûts</span>
          </button>

          {/* Quick Restock Action */}
          <button
            onClick={() => openStockModal(data.productsStock[0]?.id, "ADD")}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Boxes className="h-3.5 w-3.5 text-amber-700" />
            <span>Ajuster Inventaire</span>
          </button>

          {/* Settings & Simulation Button */}
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-sm"
            title="Ajuster les dépenses Ads Meta/TikTok et tarifs transporteurs"
          >
            <Sliders className="h-3.5 w-3.5 text-slate-600" />
            <span>Régler Ads & Frais COD</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. THE 3 CORE KPIs REQUESTED (SOFT COLOR THEMES WITH COLORFUL VIBRANT ACCENTS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: NET PROFIT (BÉNÉFICE NET RÉEL) - CLICKABLE TO VIEW HOW IT'S CALCULATED & EDIT WALLET COSTS */}
        <div
          onClick={() => openCostModal("EXPLANATION")}
          className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-50 via-[#E8F8F0] to-[#DCF5E8] border-2 border-emerald-300/80 shadow-sm space-y-3 cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all group"
          title="Cliquez pour voir comment le bénéfice net est calculé étape par étape et ajuster les coûts"
        >
          {/* Hover indicator badge */}
          <div className="absolute top-3.5 right-3 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            <Calculator className="h-3 w-3 text-emerald-300" />
            <span>Voir le Calcul Détaillé</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                  1. Bénéfice Net Réel
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">
                  Argent net dans la poche
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-200/90 text-emerald-950 border border-emerald-300 group-hover:bg-emerald-300 transition-colors">
              Marge: {data.netMargin}%
            </span>
          </div>

          <div className="pt-2">
            <div className="font-serif text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight flex items-baseline justify-between">
              <span>{formatMAD(data.netProfit)}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  openCostModal("EXPLANATION");
                }}
                className="text-xs font-bold text-emerald-800 underline group-hover:text-emerald-950 flex items-center gap-1"
              >
                <Calculator className="h-3 w-3" />
                <span>Voir le Calcul</span>
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 font-medium mt-1.5 leading-relaxed">
              Déduit à 100% : Cuir artisanal ({formatMAD(data.deliveredCogs)}), Ads Meta & TikTok ({formatMAD(data.totalAdSpend)}), Frais Livreur ({formatMAD(data.courierDeliveryCost)}) et Retours ({formatMAD(data.courierReturnCost)}).
            </p>
          </div>

          <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
            <span className="text-emerald-900 font-bold">
              CA Encaissé : {formatMAD(data.deliveredRevenue)}
            </span>
            <span className={`font-extrabold flex items-center gap-1 ${data.netMargin >= data.settings.targetNetMargin ? "text-emerald-800" : "text-amber-800"}`}>
              {data.netMargin >= data.settings.targetNetMargin ? "✓ Objectif atteint" : "! Sous objectif 25%"}
            </span>
          </div>
        </div>

        {/* KPI 2: DELIVERY RATE (TAUX DE LIVRAISON RÉEL COD) */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-50 via-[#EDF0FD] to-[#E2E6FB] border-2 border-indigo-300/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
                <Truck className="h-5 w-5 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 block">
                  2. Taux de Livraison
                </span>
                <span className="text-[10px] text-indigo-700 font-medium">
                  Santé logistique transporteur
                </span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
              data.deliveryRate >= 75
                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                : data.deliveryRate >= 65
                ? "bg-indigo-200 text-indigo-950 border-indigo-300"
                : "bg-rose-100 text-rose-900 border-rose-300"
            }`}>
              {data.deliveryRate >= 75 ? "🟢 Excellent" : data.deliveryRate >= 65 ? "🟡 Moyen" : "🔴 Critique"}
            </span>
          </div>

          <div className="pt-2">
            <div className="font-serif text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight flex items-baseline gap-2">
              <span>{data.deliveryRate}%</span>
              <span className="text-xs font-normal text-indigo-700">
                ({data.deliveredOrdersCount} livrées / {data.shippedOrdersCount} expédiées)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-indigo-200/80 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.deliveryRate)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-200/80 flex items-center justify-between text-[11px] text-indigo-900">
            <span>Retours refusés : <strong className="text-rose-700">{data.returnedOrdersCount} colis ({data.returnRate}%)</strong></span>
            <span>En transit : <strong>{data.inTransitOrdersCount}</strong></span>
          </div>
        </div>

        {/* KPI 3: WHAT LEFT ON STOCK (STOCK RESTANT & ATELIER) */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-50 via-[#FDF5E8] to-[#FCECD0] border-2 border-amber-300/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-amber-600 text-white shadow-sm">
                <Boxes className="h-5 w-5 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                  3. Stock Restant
                </span>
                <span className="text-[10px] text-amber-700 font-medium">
                  Portefeuilles disponibles
                </span>
              </div>
            </div>
            {data.lowStockCount > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-rose-600" />
                {data.lowStockCount} alerte stock
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                ✓ Stock Confortable
              </span>
            )}
          </div>

          <div className="pt-2">
            <div className="font-serif text-3xl sm:text-4xl font-black text-amber-950 tracking-tight flex items-baseline gap-2">
              <span>{data.totalStockUnits}</span>
              <span className="text-sm font-semibold text-amber-800">unités en stock</span>
            </div>
            <p className="text-[11px] text-amber-900 font-medium mt-1.5">
              Valeur de fabrication : <strong className="font-bold">{formatMAD(data.totalStockCostValue)}</strong> • Vente potentielle : <strong className="font-bold">{formatMAD(data.totalStockRetailValue)}</strong>
            </p>
          </div>

          <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between text-[11px]">
            <span className="text-amber-950 font-semibold">
              4 Modèles de maroquinerie
            </span>
            <button
              onClick={() => openStockModal(data.productsStock[0]?.id, "ADD")}
              className="text-amber-900 hover:text-amber-950 font-extrabold underline flex items-center gap-1"
            >
              <span>+ Ajuster le Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECONDARY EXECUTIVE METRICS: ADS SPEND, CONFIRMATION, ESCROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Paid Ads Spend & ROAS */}
        <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-sm space-y-1 bg-gradient-to-b from-sky-50/50 to-white">
          <div className="flex items-center justify-between text-xs text-sky-900 font-bold uppercase tracking-wider text-[10px]">
            <span>Dépenses Ads & ROAS</span>
            <Target className="h-4 w-4 text-sky-600" />
          </div>
          <div className="font-serif text-2xl font-black text-sky-950">
            {formatMAD(data.totalAdSpend)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-sky-800 font-semibold pt-1">
            <span>ROAS Encaissé: <strong className="text-sky-950 font-extrabold">{data.blendedRoas}x</strong></span>
            <span>CPA Livré: <strong>{data.deliveredCpa} DH</strong></span>
          </div>
        </div>

        {/* Metric 2: Confirmation Rate */}
        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm space-y-1 bg-gradient-to-b from-purple-50/50 to-white">
          <div className="flex items-center justify-between text-xs text-purple-900 font-bold uppercase tracking-wider text-[10px]">
            <span>Taux Confirmation</span>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </div>
          <div className="font-serif text-2xl font-black text-purple-950">
            {data.confirmationRate}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-purple-800 font-semibold pt-1">
            <span>{data.confirmedOrdersCount} confirmées</span>
            <span className="text-rose-700">{data.cancelledOrdersCount} annulées ({data.cancellationRate}%)</span>
          </div>
        </div>

        {/* Metric 3: Funds in Escrow with Courier */}
        <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-sm space-y-1 bg-gradient-to-b from-teal-50/50 to-white">
          <div className="flex items-center justify-between text-xs text-teal-900 font-bold uppercase tracking-wider text-[10px]">
            <span>Fonds chez Transporteur</span>
            <ShieldCheck className="h-4 w-4 text-teal-600" />
          </div>
          <div className="font-serif text-2xl font-black text-teal-950">
            {formatMAD(data.fundsInEscrow)}
          </div>
          <p className="text-[10px] text-teal-800 font-medium pt-1">
            Encaissé en cash, en attente de virement banque (Cathedis/Amana)
          </p>
        </div>

        {/* Metric 4: Total Orders & Basket */}
        <div className="bg-white p-4 rounded-xl border border-[#E6DFD5] shadow-sm space-y-1 bg-gradient-to-b from-[#FAF8F5] to-white">
          <div className="flex items-center justify-between text-xs text-altaj-dark font-bold uppercase tracking-wider text-[10px]">
            <span>Total Commandes</span>
            <ShoppingCart className="h-4 w-4 text-altaj-brown" />
          </div>
          <div className="font-serif text-2xl font-black text-altaj-dark">
            {data.totalOrders}
          </div>
          <div className="flex items-center justify-between text-[11px] text-altaj-muted font-medium pt-1">
            <span>En attente : <strong className="text-amber-800 font-bold">{data.pendingOrdersCount}</strong></span>
            <span>Panier : <strong>{Math.round(data.deliveredRevenue / (data.deliveredOrdersCount || 1))} DH</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOROCCAN COD PROFIT & LOSS WATERFALL (COMPTE DE RÉSULTAT TRANSPARENT) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E6DFD5] shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-[#FAF8F5] to-white border-b border-[#E6DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-altaj-gold">
              Économie Unitaire Cash-on-Delivery
            </span>
            <h2 className="font-serif text-lg font-extrabold text-altaj-dark uppercase">
              Waterfall de Rentabilité Réelle (P&L Maroc)
            </h2>
          </div>
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="text-xs font-bold text-altaj-brown hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Modifier les coûts & dépenses Ads</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-altaj-muted leading-relaxed">
            Dans le e-commerce COD au Maroc, seul le chiffre d’affaires des colis <strong>réellement livrés et encaissés</strong> est comptabilisé. Les commandes retournées ou annulées ne rapportent rien et engendrent des frais de transport.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {/* 1. Gross Revenue */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase block tracking-wider">
                (+) CA Encaissé
              </span>
              <div className="font-serif text-base sm:text-lg font-bold text-emerald-950 mt-1">
                {formatMAD(data.deliveredRevenue)}
              </div>
              <span className="text-[10px] text-emerald-700 block mt-0.5">
                {data.deliveredOrdersCount} colis réglés
              </span>
            </div>

            {/* 2. Leather Crafting COGS - CLICKABLE */}
            <div
              onClick={() => openCostModal("EDIT")}
              className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-100 hover:border-amber-400 transition-all group"
              title="Cliquez pour ajuster le coût de fabrication par portefeuille (COGS)"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-amber-900 uppercase block tracking-wider">
                  (-) Coût Cuir & Atelier
                </span>
                <span className="text-[10px] text-amber-800 font-bold underline flex items-center gap-0.5 group-hover:text-amber-950">
                  <Sliders className="h-2.5 w-2.5" />
                  <span>Ajuster</span>
                </span>
              </div>
              <div className="font-serif text-base sm:text-lg font-bold text-amber-950 mt-1">
                -{formatMAD(data.deliveredCogs)}
              </div>
              <span className="text-[10px] text-amber-700 block mt-0.5">
                Coût réel par modèle • Cliquez
              </span>
            </div>

            {/* 3. Paid Ads Spend */}
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200">
              <span className="text-[10px] font-extrabold text-sky-900 uppercase block tracking-wider">
                (-) Pubs Meta & TikTok
              </span>
              <div className="font-serif text-base sm:text-lg font-bold text-sky-950 mt-1">
                -{formatMAD(data.totalAdSpend)}
              </div>
              <span className="text-[10px] text-sky-700 block mt-0.5">
                Meta: {formatMAD(data.metaSpend)} | TT: {formatMAD(data.tiktokSpend)}
              </span>
            </div>

            {/* 4. Delivery Fees */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
              <span className="text-[10px] font-extrabold text-indigo-900 uppercase block tracking-wider">
                (-) Frais Livraisons
              </span>
              <div className="font-serif text-base sm:text-lg font-bold text-indigo-950 mt-1">
                -{formatMAD(data.courierDeliveryCost)}
              </div>
              <span className="text-[10px] text-indigo-700 block mt-0.5">
                {data.settings.deliveryFeePerDelivered} DH × {data.deliveredOrdersCount} colis
              </span>
            </div>

            {/* 5. Return Penalty Fees */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
              <span className="text-[10px] font-extrabold text-rose-900 uppercase block tracking-wider">
                (-) Pénalités Retours
              </span>
              <div className="font-serif text-base sm:text-lg font-bold text-rose-950 mt-1">
                -{formatMAD(data.courierReturnCost)}
              </div>
              <span className="text-[10px] text-rose-700 block mt-0.5">
                {data.settings.returnFeePerReturned} DH × {data.returnedOrdersCount} refus
              </span>
            </div>

            {/* 6. Packaging & Confirmation */}
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
              <span className="text-[10px] font-extrabold text-purple-900 uppercase block tracking-wider">
                (-) Emballage & Box
              </span>
              <div className="font-serif text-base sm:text-lg font-bold text-purple-950 mt-1">
                -{formatMAD(data.packagingCost)}
              </div>
              <span className="text-[10px] text-purple-700 block mt-0.5">
                {data.settings.packagingPerOrder} DH / commande
              </span>
            </div>
          </div>

          {/* Bottom Net Result Banner - CLICKABLE */}
          <div
            onClick={() => openCostModal("EXPLANATION")}
            className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md cursor-pointer hover:opacity-95 transition-opacity"
            title="Cliquer pour voir le détail mathématique et ajuster les coûts"
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                <span>Résultat Final Net d'ALTAJLEATHER :</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Calculator className="h-2.5 w-2.5" />
                  <span>Voir le calcul détaillé</span>
                </span>
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-black">
                {formatMAD(data.netProfit)} Net Encaissé
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="bg-black/20 px-3.5 py-1.5 rounded-lg text-center">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Marge Brute Cuir</span>
                <span className="font-bold text-sm">{data.grossMargin}%</span>
              </div>
              <div className="bg-black/20 px-3.5 py-1.5 rounded-lg text-center">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Marge Nette Finale</span>
                <span className="font-bold text-sm text-emerald-300">{data.netMargin}%</span>
              </div>
              <div className="bg-white text-emerald-950 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm">
                <Sliders className="h-3.5 w-3.5 text-emerald-800" />
                <span>Régler Coûts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WHAT LEFT ON STOCK (CE QU'IL RESTE EN STOCK — SUIVI PAR MODÈLE) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E6DFD5] shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-[#E6DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Boxes className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-base font-extrabold text-altaj-dark uppercase">
                Ce qu'il reste en Stock — Collection Maroquinerie ({data.totalStockUnits} pièces)
              </h2>
              <p className="text-[11px] text-altaj-muted">
                Niveaux d'inventaire en direct, seuils d'alerte et potentiel de vente atelier.
              </p>
            </div>
          </div>

          <button
            onClick={() => openStockModal(data.productsStock[0]?.id, "ADD")}
            className="px-3.5 py-1.5 bg-altaj-brown hover:bg-altaj-dark text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Ajuster l'Inventaire Atelier</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.productsStock.map((prod: any) => {
            const isCritical = prod.stock <= 5;
            const isLow = prod.stock > 5 && prod.stock <= 12;

            return (
              <div
                key={prod.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? "bg-rose-50/50 border-rose-300 shadow-sm"
                    : isLow
                    ? "bg-amber-50/50 border-amber-300"
                    : "bg-white border-[#E6DFD5] hover:border-altaj-gold"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[9px] font-mono uppercase font-bold text-altaj-muted">
                      {prod.sku}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-altaj-dark line-clamp-1">
                      {prod.name}
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isCritical
                        ? "bg-rose-200 text-rose-950"
                        : isLow
                        ? "bg-amber-200 text-amber-950"
                        : "bg-emerald-100 text-emerald-900"
                    }`}
                  >
                    {isCritical ? "Critique" : isLow ? "Faible" : "En Stock"}
                  </span>
                </div>

                <div className="my-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-black text-altaj-dark">
                      {prod.stock}{" "}
                      <span className="text-xs font-normal text-altaj-muted">restants</span>
                    </span>
                    <span className="text-[11px] font-bold text-altaj-brown">
                      {prod.price} DH
                    </span>
                  </div>

                  {/* Stock capacity bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical
                          ? "bg-rose-600"
                          : isLow
                          ? "bg-amber-500"
                          : "bg-emerald-600"
                      }`}
                      style={{ width: `${prod.stockPct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-altaj-muted">
                  <span>Coût : {prod.cost} DH</span>
                  <span>Bénéfice potent. : <strong className="text-emerald-800 font-bold">+{formatMAD(prod.potentialProfit)}</strong></span>
                </div>

                <button
                  onClick={() => openStockModal(prod.id, "ADD")}
                  className="w-full mt-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Boxes className="h-3 w-3 text-altaj-brown" />
                  <span>Ajuster Stock</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PAID ADS COMMAND CENTER & COD PIPELINE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Paid Ads Hub (Meta vs TikTok) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E6DFD5] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-sky-100 text-sky-800">
                <Target className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif text-sm font-extrabold uppercase tracking-wider text-altaj-dark">
                  Hub Publicitaire Payant (Paid Ads)
                </h3>
                <p className="text-[11px] text-altaj-muted">
                  Rentabilité réelle comparée : Meta Ads vs TikTok Ads
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                ROAS Global : {data.blendedRoas}x
              </span>
              <Link
                href="/admin/marketing"
                className="text-xs font-bold text-altaj-brown hover:underline hidden sm:inline-block"
              >
                Gérer →
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {data.channelStats.map((ch: any) => {
              const roas = ch.spend > 0 ? (ch.revenue / ch.spend).toFixed(2) : "0";
              const cpa = ch.delivered > 0 ? Math.round(ch.spend / ch.delivered) : 0;

              return (
                <div key={ch.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-altaj-dark flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                      {ch.name}
                    </span>
                    <span className="text-xs font-black text-emerald-800">
                      ROAS : {roas}x
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-altaj-muted font-semibold uppercase block">Dépense Ads</span>
                      <strong className="text-altaj-dark font-serif">{formatMAD(ch.spend)}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-altaj-muted font-semibold uppercase block">Commandes Livrées</span>
                      <strong className="text-indigo-900 font-serif">{ch.delivered} colis</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-altaj-muted font-semibold uppercase block">Coût / Livraison (CPA)</span>
                      <strong className="text-sky-900 font-serif">{cpa} DH</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COD Logistics Pipeline */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E6DFD5] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif text-sm font-extrabold uppercase tracking-wider text-altaj-dark">
                  Tunnel Logistique COD Maroc
                </h3>
                <p className="text-[11px] text-altaj-muted">
                  De la passation de commande au virement bancaire
                </p>
              </div>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-altaj-brown hover:underline">
              Gérer ({data.totalOrders}) →
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-600 block">1. Reçues</span>
              <div className="font-serif text-base font-bold text-slate-900 mt-0.5">{data.totalOrders}</div>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-[9px] uppercase font-bold text-purple-700 block">2. Confirmées</span>
              <div className="font-serif text-base font-bold text-purple-900 mt-0.5">{data.confirmedOrdersCount}</div>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-[9px] uppercase font-bold text-amber-700 block">3. Expédiées</span>
              <div className="font-serif text-base font-bold text-amber-900 mt-0.5">{data.shippedOrdersCount}</div>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[9px] uppercase font-bold text-emerald-800 block">4. Livrées ($)</span>
              <div className="font-serif text-base font-bold text-emerald-950 mt-0.5">{data.deliveredOrdersCount}</div>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
              <span className="text-[9px] uppercase font-bold text-rose-700 block">5. Retours</span>
              <div className="font-serif text-base font-bold text-rose-900 mt-0.5">{data.returnedOrdersCount}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">6. Annulées</span>
              <div className="font-serif text-base font-bold text-slate-700 mt-0.5">{data.cancelledOrdersCount}</div>
            </div>
          </div>

          <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              <div>
                <span className="font-bold text-teal-950">Fonds en Transit chez les Livreurs</span>
                <p className="text-[10px] text-teal-800">
                  {formatMAD(data.fundsInEscrow)} encaissés en espèces par les coursiers, en attente de versement.
                </p>
              </div>
            </div>
            <span className="font-serif text-base font-black text-teal-950">
              {formatMAD(data.fundsInEscrow)}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MOROCCAN CITIES MATRIX & ACTION RECOMMENDATIONS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E6DFD5] shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-[#E6DFD5] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-altaj-gold">
              Géomarketing & Ciblage Publicitaire
            </span>
            <h2 className="font-serif text-base font-extrabold text-altaj-dark uppercase">
              Performance par Ville Marocaine (Taux de Livraison Réel)
            </h2>
            <p className="text-[11px] text-altaj-muted">
              Identifiez les villes à fort taux de livraison pour booster vos campagnes Meta/TikTok, et celles à fort taux de refus à surveiller.
            </p>
          </div>
          <span className="text-xs text-altaj-muted font-semibold hidden sm:inline">
            {data.cityMatrix.length} villes desservies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E6DFD5] text-[10px] uppercase font-bold text-altaj-dark">
              <tr>
                <th className="p-3.5">Ville Marocaine</th>
                <th className="p-3.5 text-center">Commandes</th>
                <th className="p-3.5 text-center">Livrées</th>
                <th className="p-3.5 text-center">Refus / Retours</th>
                <th className="p-3.5">Taux de Livraison</th>
                <th className="p-3.5">Chiffre d'Affaires</th>
                <th className="p-3.5 text-right">Recommandation Ads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.cityMatrix.map((c: any) => (
                <tr key={c.city} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-altaj-dark flex items-center gap-1.5">
                    <span>{c.city}</span>
                  </td>
                  <td className="p-3.5 text-center font-medium">{c.orders}</td>
                  <td className="p-3.5 text-center text-emerald-800 font-bold">{c.delivered}</td>
                  <td className="p-3.5 text-center text-rose-700 font-medium">
                    {c.returned > 0 ? `${c.returned} (${c.returnRate}%)` : "0"}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            c.deliveryRate >= 80
                              ? "bg-emerald-600"
                              : c.deliveryRate >= 65
                              ? "bg-indigo-600"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${c.deliveryRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-altaj-dark">{c.deliveryRate}%</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-serif font-bold text-altaj-brown">
                    {formatMAD(c.revenue)}
                  </td>
                  <td className="p-3.5 text-right">
                    {c.recommendation === "BOOST_ADS" ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                        🚀 Booster Ads
                      </span>
                    ) : c.recommendation === "HIGH_RETURN_RISK" ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-300">
                        ⚠️ Risque Retour
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800">
                        ✓ Standard
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. URGENT COD ACTIONS: PENDING ORDERS CONFIRMATION QUEUE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-amber-300 shadow-sm overflow-hidden space-y-4">
        <div className="p-5 bg-amber-50/70 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-600 text-white">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-serif text-sm font-extrabold uppercase tracking-wider text-amber-950">
                Commandes à Confirmer Immédiatement ({data.pendingOrdersCount})
              </h3>
              <p className="text-[11px] text-amber-900">
                La confirmation par appel ou WhatsApp avant expédition garantit un taux de livraison &gt; 80%.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase text-amber-900 hover:underline tracking-wider"
          >
            Voir les {data.totalOrders} commandes →
          </Link>
        </div>

        {data.pendingOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-altaj-muted">
            ✨ Félicitations ! Toutes les commandes récentes ont été confirmées et préparées.
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-slate-200 text-[10px] uppercase font-bold text-altaj-dark">
                <tr>
                  <th className="p-3">N° Commande</th>
                  <th className="p-3">Client & Ville</th>
                  <th className="p-3">Articles</th>
                  <th className="p-3">Total à Encaisser</th>
                  <th className="p-3 text-center">Contact Direct (1-Clic)</th>
                  <th className="p-3 text-right">Action Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.pendingOrders.map((o: any) => {
                  const rawPhone = o.customerPhone.replace(/^0/, "");
                  const waMsg = encodeURIComponent(
                    `Salam ${o.customerName}, kanchkrouk 3la talabiya dyalk men ALTAJLEATHER. Kanetasslo bik bach n-valider l'adresse dial livraison dial portefeuille cuir (${o.orderNumber}) à ${o.customerCity}. Wach kolchi mzyan bach n-siftouh lik lyoum ?`
                  );

                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-serif font-bold text-altaj-dark">
                        <Link href={`/admin/orders/${o.id}`} className="hover:text-altaj-brown underline">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-altaj-dark">{o.customerName}</div>
                        <div className="text-[11px] text-altaj-muted font-medium">{o.customerCity}</div>
                      </td>
                      <td className="p-3">
                        {o.items.map((it: any, idx: number) => (
                          <div key={idx} className="truncate max-w-xs text-altaj-dark font-medium">
                            {it.quantity}x {it.productName}
                          </div>
                        ))}
                      </td>
                      <td className="p-3 font-serif font-bold text-altaj-brown">
                        {formatMAD(o.total)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`tel:${o.customerPhone}`}
                            className="p-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-md font-bold flex items-center gap-1 text-[11px]"
                            title="Appeler directement"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span>{o.customerPhone}</span>
                          </a>
                          <a
                            href={`https://wa.me/212${rawPhone}?text=${waMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-md font-bold flex items-center gap-1 text-[11px]"
                            title="Envoyer confirmation WhatsApp en darija"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={() => handleQuickConfirm(o.id)}
                          className="text-[11px] px-3 py-1 font-bold"
                        >
                          Valider & Préparer
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SETTINGS & ADS SPEND ADJUSTER */}
      {/* ========================================================================= */}
      {settingsModalOpen && tempSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-altaj-gold" />
                <h3 className="font-serif text-lg font-bold text-altaj-dark">
                  Réglages Dépenses Ads & Frais COD
                </h3>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <p className="text-slate-600 text-[11px]">
                Ajustez vos budgets publicitaires réels et tarifs logistiques pour recalculer votre Bénéfice Net Réel et vos ROAS en temps réel.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Meta Ads Spend (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={tempSettings.metaAdsSpend}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        metaAdsSpend: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-altaj-muted">Instagram Reels & Feed</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">TikTok Ads Spend (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={tempSettings.tiktokAdsSpend}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        tiktokAdsSpend: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-altaj-muted">Spark Ads & Vidéos UGC</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Frais Livraison / Colis (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={tempSettings.deliveryFeePerDelivered}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        deliveryFeePerDelivered: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-altaj-muted">Frais facturé par Cathedis/Amana</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Pénalité Retour / Refus (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={tempSettings.returnFeePerReturned}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        returnFeePerReturned: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-rose-700"
                  />
                  <span className="text-[10px] text-altaj-muted">Coût du colis non livré retourné</span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="font-bold text-altaj-dark">Emballage & Centre d'Appels / Colis (DH)</label>
                <input
                  type="number"
                  min="0"
                  value={tempSettings.packagingPerOrder}
                  onChange={(e) =>
                    setTempSettings({
                      ...tempSettings,
                      packagingPerOrder: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
                <span className="text-[10px] text-altaj-muted">Boîte cadeau, pochon tissu, cachet de cire et validation appel</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-altaj-brown hover:bg-altaj-dark text-white rounded-lg font-bold shadow-md"
                >
                  Appliquer & Recalculer le P&L
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADVANCED INVENTORY ADJUSTMENT MODAL */}
      {/* ========================================================================= */}
      {stockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Boxes className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-altaj-dark">
                    Ajustement de l'Inventaire & Stock
                  </h3>
                  <p className="text-[11px] text-altaj-muted">
                    Atelier de maroquinerie ALTAJLEATHER — Fès
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              {/* 1. Mode Selector (ADD, REMOVE, SET) */}
              <div className="space-y-1.5">
                <label className="font-bold text-altaj-dark">Type d'Opération d'Inventaire</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustMode("ADD");
                      setCustomStockReason("Nouvel arrivage atelier maroquinerie Fès");
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      adjustMode === "ADD"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5 text-emerald-700" />
                    <span>+ Ajouter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustMode("REMOVE");
                      setCustomStockReason("Prélèvement / Pièce d'exposition");
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      adjustMode === "REMOVE"
                        ? "bg-rose-50 border-rose-300 text-rose-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Minus className="h-3.5 w-3.5 text-rose-700" />
                    <span>- Déduire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustMode("SET");
                      setCustomStockReason("Comptage physique & inventaire atelier");
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      adjustMode === "SET"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5 text-indigo-700" />
                    <span>= Fixer Valeur</span>
                  </button>
                </div>
              </div>

              {/* 2. Product Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-altaj-dark">Modèle de Portefeuille en Cuir</label>
                <select
                  value={selectedProductForRestock}
                  onChange={(e) => {
                    setSelectedProductForRestock(e.target.value);
                    const prod = data.productsStock.find((p: any) => p.id === e.target.value);
                    if (prod && adjustMode === "SET") {
                      setRestockAmount(prod.stock);
                    }
                  }}
                  className="w-full px-3 py-2.5 border rounded-lg font-bold bg-white text-xs"
                >
                  {data.productsStock.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Stock actuel : {p.stock} unités (Coût: {p.cost} DH)
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Quantity Input with Presets */}
              {(() => {
                const currentProd = data.productsStock.find(
                  (p: any) => p.id === selectedProductForRestock
                );
                const currentStock = currentProd ? currentProd.stock : 0;
                let calculatedNewStock = currentStock;
                if (adjustMode === "ADD") calculatedNewStock = currentStock + Math.abs(restockAmount);
                else if (adjustMode === "REMOVE") calculatedNewStock = Math.max(0, currentStock - Math.abs(restockAmount));
                else calculatedNewStock = Math.max(0, restockAmount);

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-altaj-dark">
                        {adjustMode === "ADD"
                          ? "Quantité à Ajouter (+)"
                          : adjustMode === "REMOVE"
                          ? "Quantité à Déduire (-)"
                          : "Nouveau Stock Total Réel (=)"}
                      </label>
                      <span className="text-[11px] font-bold text-altaj-brown">
                        Stock actuel : {currentStock} unités
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={adjustMode === "SET" ? 0 : 1}
                        max={1000}
                        value={restockAmount}
                        onChange={(e) => setRestockAmount(Number(e.target.value))}
                        className="flex-1 px-3 py-2.5 border rounded-lg font-mono font-black text-lg bg-[#FAF8F5]"
                      />

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1">
                        {[5, 10, 25, 50].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              if (adjustMode === "SET") {
                                setRestockAmount(num);
                              } else {
                                setRestockAmount(num);
                              }
                            }}
                            className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                          >
                            {adjustMode === "SET" ? `${num}` : `+${num}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Calculation Preview Banner */}
                    <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-amber-700" />
                        <div>
                          <span className="font-semibold text-amber-950">Aperçu après validation :</span>
                          <p className="text-[10px] text-amber-800">
                            {currentStock} unités → <strong className="font-extrabold text-amber-950 text-xs">{calculatedNewStock} unités</strong>
                          </p>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-xs text-amber-900 bg-white px-2.5 py-1 rounded-md border border-amber-200">
                        {calculatedNewStock > currentStock ? `+${calculatedNewStock - currentStock}` : `${calculatedNewStock - currentStock}`} ex.
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 4. Reason for Movement */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark">Motif du Mouvement de Stock</label>
                <input
                  type="text"
                  value={customStockReason}
                  onChange={(e) => setCustomStockReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  placeholder="Ex: Arrivage 30 portefeuilles cuir ciré atelier Fès..."
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  {[
                    "Arrivage atelier Fès",
                    "Comptage physique",
                    "Pièce showroom",
                    "Retour réintégré",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCustomStockReason(tag)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Alert Threshold */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-altaj-dark">Seuil d'Alerte Stock Faible</label>
                  <span className="text-[10px] text-altaj-muted">Déclenche un badge d'avertissement</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customThreshold}
                  onChange={(e) => setCustomThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-altaj-brown hover:bg-altaj-dark text-white rounded-lg font-bold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-altaj-gold" />
                  <span>Enregistrer l'Ajustement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: HOW NET PROFIT IS CALCULATED & REAL COST PER WALLET SIMULATOR     */}
      {/* ========================================================================= */}
      {costModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-fade-in my-8 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Calculator className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-altaj-dark flex items-center gap-2">
                    <span>Calcul du Bénéfice Net Réel & Coûts Portefeuille</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      COD Maroc
                    </span>
                  </h3>
                  <p className="text-[11px] text-altaj-muted">
                    Comprenez exactement comment chaque dirham est calculé et ajustez le coût de fabrication unitaire.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCostModalTab("EXPLANATION")}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  costModalTab === "EXPLANATION"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-altaj-dark hover:bg-white/60"
                }`}
              >
                <Calculator className="h-4 w-4" />
                <span>📐 Formule & Décomposition du Calcul (How it's calculated)</span>
              </button>
              <button
                type="button"
                onClick={() => setCostModalTab("EDIT")}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  costModalTab === "EDIT"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-altaj-dark hover:bg-white/60"
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span>⚙️ Coûts par Portefeuille & Simulation</span>
              </button>
            </div>

            {/* TAB 1: HOW IT IS CALCULATED (EXPLANATION) */}
            {costModalTab === "EXPLANATION" && (
              <div className="space-y-4">
                {/* 1. Official COD Formula Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white border border-emerald-500/30 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                        Formule Mathématique Officielle ALTAJLEATHER
                      </span>
                    </div>
                    <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-slate-300 font-medium">
                      Période active : {dateRange === "today" ? "Aujourd'hui" : dateRange === "7days" ? "7 Derniers Jours" : dateRange === "30days" ? "30 Derniers Jours" : "Tout l'Historique"}
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-lg border border-emerald-400/30 text-center font-mono font-bold text-xs sm:text-sm text-emerald-300 tracking-tight leading-relaxed">
                    Bénéfice Net = CA Encaissé (Livrés) − Cuir (COGS) − Dépenses Ads − Frais Livraison − Pénalités Retours − Packaging/Confirmation
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    💡 <strong>Règle d'or du Cash-On-Delivery au Maroc :</strong> Contrairement au paiement par carte bancaire, le chiffre d'affaires n'est validé <strong>qu'au moment où le client paie en espèces au livreur</strong>. Les colis refusés ou annulés rapportent 0 DH, mais leurs coûts publicitaires et pénalités de retour (20 DH) sont ici déduits à 100% pour vous donner votre <strong>vrai bénéfice net en poche</strong>.
                  </p>
                </div>

                {/* 2. Step-by-Step Numerical Breakdown Table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <div className="p-3 bg-[#FAF8F5] border-b border-slate-200 flex items-center justify-between font-bold text-altaj-dark">
                    <span>Décomposition détaillée pas-à-pas des 6 postes de dépenses</span>
                    <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Calculé sur vos données réelles
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {/* Step 1: Delivered Revenue */}
                    <div className="p-3 flex items-start justify-between gap-4 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">1</span>
                          <span className="font-bold text-emerald-950 text-xs sm:text-sm">(+) Chiffre d'Affaires Encaissé (Colis Livrés)</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-7">
                          {data.deliveredOrdersCount || data.deliveredOrders || 0} commandes livrées avec succès × panier moyen de {formatMAD(data.deliveredRevenue / (data.deliveredOrdersCount || data.deliveredOrders || 1))} (Taux de livraison : <strong>{data.deliveryRate}%</strong>)
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-serif font-black text-base text-emerald-700">+{formatMAD(data.deliveredRevenue)}</div>
                        <div className="text-[10px] text-slate-400 font-medium">100% du CA Encaissé</div>
                      </div>
                    </div>

                    {/* Step 2: Leather Crafting COGS */}
                    <div className="p-3 flex items-start justify-between gap-4 hover:bg-amber-50/40 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-[10px] flex items-center justify-center">2</span>
                          <span className="font-bold text-amber-950">(-) Coût Fabrication Cuir Fait-Main (COGS)</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-7">
                          Matières premières cuir véritable de Fès, fournitures et main-d'œuvre artisan (moyenne : <strong>{Math.round(data.deliveredCogs / (data.deliveredOrdersCount || data.deliveredOrders || 1))} DH</strong> / portefeuille livré)
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-serif font-bold text-sm text-amber-900">-{formatMAD(data.deliveredCogs)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {data.deliveredRevenue > 0 ? Math.round((data.deliveredCogs / data.deliveredRevenue) * 100) : 0}% du CA
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Paid Ads Spend */}
                    <div className="p-3 flex items-start justify-between gap-4 hover:bg-sky-50/40 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">3</span>
                          <span className="font-bold text-sky-950">(-) Dépenses Publicitaires (Campagnes Marketing)</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-7">
                          {data.metaSpend > 0 ? `Meta Ads (${formatMAD(data.metaSpend)})` : ""}
                          {data.metaSpend > 0 && data.tiktokSpend > 0 ? " + " : ""}
                          {data.tiktokSpend > 0 ? `TikTok Ads (${formatMAD(data.tiktokSpend)})` : ""}
                          {(data.metaSpend > 0 || data.tiktokSpend > 0) && data.googleSpend > 0 ? " + " : ""}
                          {data.googleSpend > 0 ? `Google (${formatMAD(data.googleSpend)})` : ""}
                          {data.metaSpend === 0 && data.tiktokSpend === 0 && data.googleSpend === 0 ? `Total Dépenses : ${formatMAD(data.totalAdSpend)}` : ""}
                          {" • "}CPA Réel par Colis Livré : <strong>{formatMAD(data.deliveredCpa || data.realDeliveredCpa || 0)}</strong>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-serif font-bold text-sm text-sky-900">-{formatMAD(data.totalAdSpend)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {data.deliveredRevenue > 0 ? Math.round((data.totalAdSpend / data.deliveredRevenue) * 100) : 0}% du CA
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Courier Delivery Fees */}
                    <div className="p-3 flex items-start justify-between gap-4 hover:bg-violet-50/40 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center">4</span>
                          <span className="font-bold text-violet-950">(-) Frais de Livraison Payés aux Transporteurs</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-7">
                          {data.deliveredOrdersCount || data.deliveredOrders || 0} colis livrés et encaissés × <strong>{data.settings?.deliveryFeePerDelivered || 35} DH</strong> (tarif transporteur moyen négocié)
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-serif font-bold text-sm text-violet-900">-{formatMAD(data.courierDeliveryCost)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {data.deliveredRevenue > 0 ? Math.round((data.courierDeliveryCost / data.deliveredRevenue) * 100) : 0}% du CA
                        </div>
                      </div>
                    </div>

                    {/* Step 5: Courier Return Penalty */}
                    <div className="p-3 flex items-start justify-between gap-4 hover:bg-rose-50/40 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">5</span>
                          <span className="font-bold text-rose-950">(-) Pénalités Transporteur sur Retours / Refus</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-7">
                          {data.returnedOrdersCount || data.returnedOrders || 0} colis retournés ou clients injoignables × <strong>{data.settings?.returnFeePerReturned || 20} DH</strong> (frais de retour facturés par le livreur)
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-serif font-bold text-sm text-rose-900">-{formatMAD(data.courierReturnCost)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {data.deliveredRevenue > 0 ? Math.round((data.courierReturnCost / data.deliveredRevenue) * 100) : 0}% du CA
                        </div>
                      </div>
                    </div>

                    {/* Step 6: Luxury Packaging & Call Confirmation */}
                    <div className="p-3 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center">6</span>
                          <span className="font-bold text-slate-900">(-) Packaging Luxe & Confirmation Téléphonique</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-7">
                          {(data.deliveredOrdersCount || 0) + (data.returnedOrdersCount || 0)} colis expédiés × <strong>{data.settings?.packagingPerOrder || 8} DH</strong> (boîte rigide ALTAJ, pochon velours, cire à cacheter, appel call center)
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-serif font-bold text-sm text-slate-800">-{formatMAD(data.packagingCost)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {data.deliveredRevenue > 0 ? Math.round((data.packagingCost / data.deliveredRevenue) * 100) : 0}% du CA
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grand Result Banner */}
                  <div className="p-4 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                        <span>(=) Résultat Final : Argent Net Réel Dans la Poche</span>
                      </div>
                      <div className="font-serif text-2xl sm:text-3xl font-black">
                        {formatMAD(data.netProfit)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-center">
                      <div className="bg-black/25 px-3 py-1.5 rounded-lg border border-white/10">
                        <div className="text-[9px] uppercase font-bold text-emerald-200">Marge Nette</div>
                        <div className="font-mono font-black text-sm text-emerald-300">{data.netMargin}%</div>
                      </div>
                      <div className="bg-black/25 px-3 py-1.5 rounded-lg border border-white/10">
                        <div className="text-[9px] uppercase font-bold text-amber-200">Marge Brute</div>
                        <div className="font-mono font-black text-sm text-amber-300">{data.grossMargin}%</div>
                      </div>
                      <div className="bg-black/25 px-3 py-1.5 rounded-lg border border-white/10">
                        <div className="text-[9px] uppercase font-bold text-sky-200">Net / Pièce</div>
                        <div className="font-mono font-black text-sm text-sky-300">
                          +{formatMAD(Math.round(data.netProfit / (data.deliveredOrdersCount || data.deliveredOrders || 1)))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Visual 100 DH Breakdown Bar */}
                {data.deliveredRevenue > 0 && (
                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-altaj-dark">
                      <span>Sur chaque 100 DH payés en espèces par le client au livreur :</span>
                      <span className="text-[11px] text-emerald-800 font-bold">
                        {data.netMargin} DH net dans votre poche
                      </span>
                    </div>

                    {/* Progress Segmented Bar */}
                    <div className="h-3.5 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-200 text-[9px] font-bold text-white">
                      {/* Cuir */}
                      <div
                        className="bg-amber-700 h-full flex items-center justify-center transition-all"
                        style={{ width: `${Math.round((data.deliveredCogs / data.deliveredRevenue) * 100)}%` }}
                        title={`Cuir & Atelier: ${Math.round((data.deliveredCogs / data.deliveredRevenue) * 100)}%`}
                      />
                      {/* Ads */}
                      <div
                        className="bg-sky-600 h-full flex items-center justify-center transition-all"
                        style={{ width: `${Math.round((data.totalAdSpend / data.deliveredRevenue) * 100)}%` }}
                        title={`Pubs: ${Math.round((data.totalAdSpend / data.deliveredRevenue) * 100)}%`}
                      />
                      {/* Delivery */}
                      <div
                        className="bg-violet-600 h-full flex items-center justify-center transition-all"
                        style={{ width: `${Math.round((data.courierDeliveryCost / data.deliveredRevenue) * 100)}%` }}
                        title={`Frais Livraison: ${Math.round((data.courierDeliveryCost / data.deliveredRevenue) * 100)}%`}
                      />
                      {/* Return & Pack */}
                      <div
                        className="bg-rose-600 h-full flex items-center justify-center transition-all"
                        style={{ width: `${Math.round(((data.courierReturnCost + data.packagingCost) / data.deliveredRevenue) * 100)}%` }}
                        title={`Retours & Packaging: ${Math.round(((data.courierReturnCost + data.packagingCost) / data.deliveredRevenue) * 100)}%`}
                      />
                      {/* Net Profit */}
                      <div
                        className="bg-emerald-600 h-full flex items-center justify-center transition-all"
                        style={{ width: `${Math.max(0, data.netMargin)}%` }}
                        title={`Bénéfice Net Réel: ${data.netMargin}%`}
                      />
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
                        <span>Cuir: <strong>{Math.round((data.deliveredCogs / data.deliveredRevenue) * 100)} DH</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                        <span>Pubs: <strong>{Math.round((data.totalAdSpend / data.deliveredRevenue) * 100)} DH</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                        <span>Livreur: <strong>{Math.round((data.courierDeliveryCost / data.deliveredRevenue) * 100)} DH</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                        <span>Retours & Box: <strong>{Math.round(((data.courierReturnCost + data.packagingCost) / data.deliveredRevenue) * 100)} DH</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <span className="text-emerald-950 font-bold">Bénéfice Net: <strong>{data.netMargin} DH</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Footer for Explanation Tab */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <Link
                    href="/admin/costs"
                    className="text-xs text-altaj-brown font-bold hover:underline flex items-center gap-1.5"
                  >
                    <Coins className="h-4 w-4" />
                    <span>Voir l'analyse complète des 8 coûts opérationnels (Coûts & Marges)</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCostModalOpen(false)}
                      className="px-4 py-2 border rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs"
                    >
                      Fermer
                    </button>
                    <button
                      type="button"
                      onClick={() => setCostModalTab("EDIT")}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm transition-all text-xs flex items-center gap-1.5"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span>Ajuster les Coûts Portefeuilles</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EDIT WALLET COSTS & LIVE SIMULATION */}
            {costModalTab === "EDIT" && (
              <div className="space-y-4">
                {/* Quick Uniform Setter */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-950 block">
                      Définir un coût uniforme pour tous les modèles :
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Applique ce prix de revient à l'ensemble du catalogue en un clic.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-24">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={globalCost}
                        onChange={(e) => setGlobalCost(Math.max(1, Number(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg font-mono font-bold text-sm bg-white text-emerald-950 pr-7"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-[10px] text-slate-500">
                        DH
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyGlobalCost}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-sm transition-colors whitespace-nowrap"
                    >
                      Appliquer à Tous
                    </button>
                  </div>
                </div>

                {/* Product Costs Form */}
                <form onSubmit={handleSaveCosts} className="space-y-4 text-xs">
                  <div className="space-y-3">
                    <label className="font-bold text-altaj-dark block">
                      Coût Unitaire Artisanal par Modèle de Portefeuille (DH) :
                    </label>

                    {data.productsStock.map((prod: any) => {
                      const currentCost =
                        productCosts[prod.id] !== undefined ? productCosts[prod.id] : prod.cost || 50;
                      const unitMargin = prod.price - currentCost;
                      const unitMarginPct =
                        prod.price > 0 ? Math.round((unitMargin / prod.price) * 100) : 0;
                      const modelCogs = (prod.deliveredUnits || 0) * currentCost;

                      return (
                        <div
                          key={prod.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-colors space-y-2.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-slate-200 bg-altaj-sand flex-shrink-0">
                                <Image
                                  src={prod.image || "/placeholder.jpg"}
                                  alt={prod.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-serif font-bold text-altaj-dark text-xs sm:text-sm">
                                  {prod.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    {prod.sku}
                                  </span>
                                  <span>Prix vente: <strong>{formatMAD(prod.price)}</strong></span>
                                  <span>• En stock: <strong>{prod.stock} ex.</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Cost Input & Presets */}
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <div className="relative w-28">
                                <input
                                  type="number"
                                  min="1"
                                  max="500"
                                  value={currentCost}
                                  onChange={(e) =>
                                    setProductCosts((prev) => ({
                                      ...prev,
                                      [prod.id]: Math.max(0, Number(e.target.value) || 0),
                                    }))
                                  }
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-black text-sm bg-white text-altaj-dark pr-8 focus:outline-none focus:border-emerald-600"
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-[10px] text-slate-500">
                                  DH
                                </span>
                              </div>

                              {/* Presets */}
                              <div className="flex items-center gap-1">
                                {[40, 45, 50, 55, 60].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() =>
                                      setProductCosts((prev) => ({
                                        ...prev,
                                        [prod.id]: preset,
                                      }))
                                    }
                                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors ${
                                      currentCost === preset
                                        ? "bg-emerald-600 text-white border-emerald-700"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    {preset}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Margin and Impact Sub-banner */}
                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 text-slate-600">
                            <div className="flex items-center gap-2">
                              <span>
                                Marge brute unitaire:{" "}
                                <strong className="text-emerald-700 font-serif font-bold">
                                  +{formatMAD(unitMargin)} ({unitMarginPct}%)
                                </strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>
                                Colis livrés: <strong>{prod.deliveredUnits || 0} ex.</strong>
                              </span>
                              <span>
                                → Coût COGS total:{" "}
                                <strong className="font-mono text-altaj-dark">
                                  {formatMAD(modelCogs)}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* LIVE SIMULATION CARD */}
                  <div className="p-4 bg-gradient-to-br from-slate-900 to-altaj-dark text-white rounded-xl shadow-lg space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-emerald-500/20 text-emerald-300">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <span className="font-bold uppercase tracking-wider text-emerald-200 text-[11px]">
                          Aperçu en Direct du Nouveau Bénéfice Réel
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300">
                        Période: {dateRange}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[10px] text-slate-400 block uppercase">CA Encaissé</span>
                        <span className="font-serif font-bold text-sm text-white">
                          {formatMAD(data.deliveredRevenue)}
                        </span>
                      </div>

                      <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[10px] text-amber-300 block uppercase">(-) Coût Cuir (COGS)</span>
                        <span className="font-serif font-bold text-sm text-amber-200">
                          -{formatMAD(costSimulation.simulatedCogs)}
                        </span>
                      </div>

                      <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[10px] text-sky-300 block uppercase">(-) Pubs & Logistique</span>
                        <span className="font-serif font-bold text-sm text-sky-200">
                          -{formatMAD(data.totalAdSpend + data.courierDeliveryCost + data.courierReturnCost + data.packagingCost)}
                        </span>
                      </div>

                      <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/40">
                        <span className="text-[10px] text-emerald-300 block uppercase font-black">
                          (=) Vrai Bénéfice Net
                        </span>
                        <span className="font-serif font-black text-base text-emerald-300">
                          {formatMAD(costSimulation.simulatedNetProfit)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 text-[11px]">
                          Nouvelle Marge Nette :{" "}
                          <strong className="text-emerald-300 font-bold">
                            {costSimulation.simulatedNetMargin}%
                          </strong>
                        </span>
                        <span className="text-slate-300 text-[11px]">
                          Marge Brute :{" "}
                          <strong className="text-amber-300 font-bold">
                            {costSimulation.simulatedGrossMargin}%
                          </strong>
                        </span>
                      </div>

                      {costSimulation.diffFromCurrentNet !== 0 && (
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            costSimulation.diffFromCurrentNet > 0
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                          }`}
                        >
                          {costSimulation.diffFromCurrentNet > 0
                            ? `+${formatMAD(costSimulation.diffFromCurrentNet)} de profit`
                            : `${formatMAD(costSimulation.diffFromCurrentNet)} de profit`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCostModalOpen(false)}
                      className="px-4 py-2 border rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white rounded-lg font-bold shadow-md flex items-center gap-2 transition-all text-xs"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                      <span>Enregistrer & Recalculer Tout le Bénéfice</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
