"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getProducts,
  getInventoryLogs,
  quickAdjustStock,
  adjustStock,
  updateProductCost,
} from "@/lib/db/store";
import { Product, InventoryLog } from "@/types";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Boxes,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  History,
  Sliders,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  TrendingUp,
  Package,
  ShieldAlert,
  Edit3,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustMode, setAdjustMode] = useState<"ADD" | "REMOVE" | "SET">("ADD");
  const [amount, setAmount] = useState<number>(10);
  const [customReason, setCustomReason] = useState<string>("Nouvel arrivage atelier maroquinerie Fès");
  const [thresholdInput, setThresholdInput] = useState<number>(10);
  const [costInput, setCostInput] = useState<number>(50);
  const [operatorName, setOperatorName] = useState<string>("Othmane (Owner)");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    setProducts(getProducts());
    setLogs(getInventoryLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalCostValue = products.reduce((acc, p) => acc + (p.stock || 0) * (p.cost || 50), 0);
    const totalRetailValue = products.reduce((acc, p) => acc + (p.stock || 0) * (p.price || 0), 0);
    const lowStockItems = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockThreshold || 10));
    const outOfStockItems = products.filter((p) => (p.stock || 0) === 0);

    return {
      totalUnits,
      totalCostValue,
      totalRetailValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
    };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const threshold = p.lowStockThreshold || 10;
      let matchesFilter = true;
      if (stockStatusFilter === "IN_STOCK") {
        matchesFilter = (p.stock || 0) > threshold;
      } else if (stockStatusFilter === "LOW_STOCK") {
        matchesFilter = (p.stock || 0) > 0 && (p.stock || 0) <= threshold;
      } else if (stockStatusFilter === "OUT_OF_STOCK") {
        matchesFilter = (p.stock || 0) === 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, stockStatusFilter]);

  const openAdjustModal = (product: Product, mode: "ADD" | "REMOVE" | "SET" = "ADD") => {
    setSelectedProduct(product);
    setAdjustMode(mode);
    setThresholdInput(product.lowStockThreshold || 10);
    setCostInput(product.cost || 50);

    if (mode === "ADD") {
      setAmount(10);
      setCustomReason("Arrivage atelier maroquinerie Fès");
    } else if (mode === "REMOVE") {
      setAmount(2);
      setCustomReason("Prélèvement shooting publicitaire / Défaut");
    } else {
      setAmount(product.stock);
      setCustomReason("Comptage physique & régularisation inventaire");
    }

    setIsModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (costInput !== selectedProduct.cost) {
      updateProductCost(selectedProduct.id, costInput);
    }

    const updated = quickAdjustStock(
      selectedProduct.id,
      amount,
      adjustMode,
      `${customReason} (Opérateur: ${operatorName})`,
      thresholdInput
    );

    if (updated) {
      showToast(
        `Stock de "${selectedProduct.name}" mis à jour : ${updated.stock} unités (${adjustMode === "ADD" ? `+${amount}` : adjustMode === "REMOVE" ? `-${amount}` : `fixé à ${amount}`}) • Coût: ${costInput} DH`
      );
    }

    setIsModalOpen(false);
    setSelectedProduct(null);
    loadData();
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
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
              Atelier Artisanal Fès
            </span>
            <span className="text-xs text-altaj-muted">• Maroquinerie Cuir Véritable</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-altaj-dark uppercase tracking-tight mt-1">
            Gestion & Ajustement des Stocks
          </h1>
          <p className="text-xs sm:text-sm text-altaj-muted">
            Suivi des portefeuilles disponibles, réapprovisionnement d'atelier et valorisation du stock marchandise.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3 py-2 text-xs font-bold text-altaj-dark border border-altaj-border rounded-xl bg-white hover:bg-altaj-sand/30 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            ← Retour Dashboard
          </Link>
          <button
            onClick={() => products.length > 0 && openAdjustModal(products[0], "ADD")}
            className="px-4 py-2 bg-gradient-to-r from-amber-700 via-altaj-brown to-altaj-dark hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4 text-altaj-gold" />
            <span>Ajouter du Stock</span>
          </button>
        </div>
      </div>

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Units */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Stock Total Disponible
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-altaj-dark">
              {metrics.totalUnits}
            </span>
            <span className="text-xs font-bold text-slate-500">unités en atelier</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Prêt à être expédié partout au Maroc
          </p>
        </div>

        {/* Total Cost Value (COGS) */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Capital Immobilisé (Coût)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-amber-900">
              {formatMAD(metrics.totalCostValue)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Valeur d'achat & façonnage artisan (COGS)
          </p>
        </div>

        {/* Total Retail Value */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Potentiel Vente (Prix Public)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-emerald-900">
              {formatMAD(metrics.totalRetailValue)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-2">
            Marge brute potentielle: +{formatMAD(metrics.totalRetailValue - metrics.totalCostValue)}
          </p>
        </div>

        {/* Stock Alerts (Low & Out) */}
        <div
          onClick={() => setStockStatusFilter(metrics.lowStockCount > 0 ? "LOW_STOCK" : "ALL")}
          className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all shadow-sm relative overflow-hidden ${
            metrics.lowStockCount > 0 || metrics.outOfStockCount > 0
              ? "border-rose-300 bg-rose-50/20 hover:bg-rose-50/40"
              : "border-altaj-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Alertes & Réappro
            </span>
            <div
              className={`p-2 rounded-xl border ${
                metrics.lowStockCount > 0 || metrics.outOfStockCount > 0
                  ? "bg-rose-100 text-rose-700 border-rose-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`font-serif text-2xl sm:text-3xl font-black ${
                metrics.lowStockCount > 0 || metrics.outOfStockCount > 0
                  ? "text-rose-700"
                  : "text-slate-700"
              }`}
            >
              {metrics.lowStockCount + metrics.outOfStockCount}
            </span>
            <span className="text-xs font-bold text-slate-500">modèles critiques</span>
          </div>
          <p className="text-[11px] text-rose-700 font-medium mt-2">
            {metrics.outOfStockCount > 0
              ? `${metrics.outOfStockCount} rupture(s) • ${metrics.lowStockCount} stock(s) faible(s)`
              : metrics.lowStockCount > 0
              ? `${metrics.lowStockCount} modèle(s) proche(s) du seuil`
              : "Tous les modèles ont un stock sain"}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-altaj-border/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par modèle, SKU ou cuir..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF8F5] border border-altaj-border rounded-xl focus:outline-none focus:border-altaj-brown font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Tous", count: products.length },
            {
              id: "IN_STOCK",
              label: "En Stock",
              count: products.filter((p) => (p.stock || 0) > (p.lowStockThreshold || 10)).length,
            },
            { id: "LOW_STOCK", label: "Stock Faible", count: metrics.lowStockCount },
            { id: "OUT_OF_STOCK", label: "Rupture", count: metrics.outOfStockCount },
          ].map((tab) => {
            const active = stockStatusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStockStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  active
                    ? "bg-altaj-dark text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Products Inventory Table */}
      <div className="bg-white rounded-2xl border border-altaj-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-altaj-border flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-altaj-brown" />
            <h3 className="font-serif text-sm sm:text-base font-extrabold uppercase text-altaj-dark">
              Inventaire des Portefeuilles Cuir ALTAJLEATHER ({filteredProducts.length})
            </h3>
          </div>
          <span className="text-[11px] text-altaj-muted hidden sm:inline-block">
            Cliquez sur <strong>+</strong>, <strong>-</strong> ou <strong>Ajuster</strong> pour modifier le stock
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5]/80 border-b border-altaj-border text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              <tr>
                <th className="p-3.5 sm:p-4">Modèle & SKU</th>
                <th className="p-3.5 sm:p-4">Prix Public / Coût</th>
                <th className="p-3.5 sm:p-4">Niveau de Stock</th>
                <th className="p-3.5 sm:p-4">Statut & Santé</th>
                <th className="p-3.5 sm:p-4">Seuil d'Alerte</th>
                <th className="p-3.5 sm:p-4 text-right">Actions Rapides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-altaj-border/60">
              {filteredProducts.map((p) => {
                const threshold = p.lowStockThreshold || 10;
                const isOutOfStock = p.stock === 0;
                const isLow = p.stock > 0 && p.stock <= threshold;
                const healthPercentage = Math.min(100, Math.round((p.stock / 60) * 100));

                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    {/* Product & SKU */}
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href="/admin/products"
                          className="relative h-12 w-12 flex-shrink-0 bg-altaj-sand rounded-xl overflow-hidden border border-altaj-border shadow-xs group/img block"
                          title="Modifier la photo et les informations dans le catalogue Produits"
                        >
                          <Image
                            src={p.featuredImage || "/placeholder.jpg"}
                            alt={p.name}
                            fill
                            className="object-cover group-hover/img:scale-105 transition-transform"
                          />
                        </Link>
                        <div>
                          <div className="font-serif font-bold text-altaj-dark text-xs sm:text-sm">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {p.sku}
                            </span>
                            <span className="text-[10px] text-altaj-muted">
                              {p.category || "Portefeuilles"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price & Cost */}
                    <td className="p-3.5 sm:p-4">
                      <div className="font-bold text-altaj-dark">{formatMAD(p.price)}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Coût atelier: <span className="font-mono">{formatMAD(p.cost || 50)}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        Marge: +{formatMAD(p.price - (p.cost || 50))}
                      </div>
                    </td>

                    {/* Stock Level with Progress Bar */}
                    <td className="p-3.5 sm:p-4 min-w-[140px]">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-serif text-sm sm:text-base font-black text-altaj-dark">
                          {p.stock} <span className="text-xs font-normal text-slate-500">unités</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {formatMAD(p.stock * (p.cost || 50))} immobilisé
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOutOfStock
                              ? "bg-rose-500"
                              : isLow
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.max(5, healthPercentage)}%` }}
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5 sm:p-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          <XCircle className="h-3 w-3" />
                          Rupture
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          <AlertTriangle className="h-3 w-3" />
                          Stock Faible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          <CheckCircle2 className="h-3 w-3" />
                          Optimal
                        </span>
                      )}
                    </td>

                    {/* Low Stock Threshold */}
                    <td className="p-3.5 sm:p-4">
                      <div className="text-[11px] font-bold text-slate-700">
                        ≤ {threshold} unités
                      </div>
                      <span className="text-[10px] text-slate-400">seuil d'alerte</span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 sm:p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAdjustModal(p, "ADD")}
                          title="Ajouter du stock"
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Ajouter</span>
                        </button>
                        <button
                          onClick={() => openAdjustModal(p, "REMOVE")}
                          title="Déduire du stock"
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Minus className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Déduire</span>
                        </button>
                        <button
                          onClick={() => openAdjustModal(p, "SET")}
                          title="Ajuster et fixer le stock exact"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Sliders className="h-3.5 w-3.5 text-altaj-brown" />
                          <span className="hidden sm:inline">Ajuster</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Boxes className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="font-bold">Aucun portefeuille ne correspond aux filtres.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStockStatusFilter("ALL");
                }}
                className="mt-2 text-xs text-altaj-brown font-bold hover:underline"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Movement Log History */}
      <div className="bg-white rounded-2xl border border-altaj-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-altaj-border flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-altaj-gold" />
            <h3 className="font-serif text-sm sm:text-base font-extrabold uppercase text-altaj-dark">
              Historique des Mouvements & Entrées/Sorties Atelier ({logs.length})
            </h3>
          </div>
          <span className="text-[11px] text-altaj-muted">Traçabilité complète</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5]/80 border-b border-altaj-border text-[10px] uppercase font-bold text-slate-600">
              <tr>
                <th className="p-3.5">Date & Heure</th>
                <th className="p-3.5">Produit</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Mouvement</th>
                <th className="p-3.5">Nouveau Stock</th>
                <th className="p-3.5">Motif / Justificatif</th>
                <th className="p-3.5">Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-altaj-border/60">
              {logs.map((log) => {
                const isPositive = log.quantityChange > 0;
                const isZero = log.quantityChange === 0;

                return (
                  <tr key={log.id} className="hover:bg-[#FAF8F5]/40 transition-colors">
                    <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-altaj-dark">{log.productName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{log.sku}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          log.action === "ADD"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.action === "REMOVE"
                            ? "bg-rose-100 text-rose-800"
                            : log.action === "RETURN"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-sm">
                      <span
                        className={
                          isPositive
                            ? "text-emerald-700"
                            : isZero
                            ? "text-slate-500"
                            : "text-rose-700"
                        }
                      >
                        {isPositive ? `+${log.quantityChange}` : log.quantityChange} unités
                      </span>
                    </td>
                    <td className="p-3.5 font-bold font-serif text-altaj-dark">
                      {log.newStock} unités
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-xs">{log.reason}</td>
                    <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                      {log.performedBy || "Admin"}
                    </td>
                  </tr>
                );
              })}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Aucun mouvement d'inventaire enregistré pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPREHENSIVE STOCK ADJUSTMENT MODAL */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-altaj-dark/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-altaj-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-altaj-border bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-altaj-border bg-altaj-sand flex-shrink-0">
                  <Image
                    src={selectedProduct.featuredImage || "/placeholder.jpg"}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-base font-extrabold text-altaj-dark">
                    Ajuster l'Inventaire Atelier
                  </h3>
                  <p className="text-xs font-bold text-altaj-brown">{selectedProduct.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveAdjustment} className="p-5 space-y-4 text-xs">
              {/* 1. Mode Switcher (ADD / REMOVE / SET) */}
              <div className="space-y-1.5">
                <label className="font-bold text-altaj-dark block">Type d'Opération de Stock</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustMode("ADD");
                      setAmount(10);
                      setCustomReason("Arrivage atelier maroquinerie Fès");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      adjustMode === "ADD"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Ajouter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustMode("REMOVE");
                      setAmount(2);
                      setCustomReason("Prélèvement / Perte / Shooting");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      adjustMode === "REMOVE"
                        ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                    <span>- Déduire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustMode("SET");
                      setAmount(selectedProduct.stock);
                      setCustomReason("Inventaire physique & régularisation");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      adjustMode === "SET"
                        ? "bg-altaj-dark text-white border-black shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>= Fixer Valeur</span>
                  </button>
                </div>
              </div>

              {/* 2. Amount Input & Calculation Preview */}
              {(() => {
                const currentStock = selectedProduct.stock;
                let calculatedNewStock = currentStock;
                if (adjustMode === "ADD") calculatedNewStock = currentStock + Math.abs(amount);
                else if (adjustMode === "REMOVE") calculatedNewStock = Math.max(0, currentStock - Math.abs(amount));
                else calculatedNewStock = Math.max(0, amount);

                const diff = calculatedNewStock - currentStock;
                const valueChangeDH = diff * (selectedProduct.cost || 50);

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
                        Stock Actuel : {currentStock} pièces
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={adjustMode === "SET" ? 0 : 1}
                        max={1000}
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                        required
                        className="flex-1 px-3 py-2.5 border border-altaj-border rounded-xl font-mono font-black text-lg bg-[#FAF8F5] focus:outline-none focus:border-altaj-brown"
                      />

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1">
                        {[5, 10, 25, 50].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setAmount(n)}
                            className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                          >
                            {adjustMode === "SET" ? `${n}` : `+${n}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-amber-800" />
                        <div>
                          <span className="font-semibold text-amber-950">Aperçu après validation :</span>
                          <p className="text-[11px] text-amber-900">
                            {currentStock} unités → <strong className="font-black text-xs text-amber-950">{calculatedNewStock} unités</strong>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-serif font-bold text-xs text-amber-950 bg-white px-2.5 py-1 rounded-md border border-amber-200 inline-block">
                          {diff > 0 ? `+${diff}` : `${diff}`} unités
                        </span>
                        <span className="text-[10px] text-amber-800 block mt-0.5">
                          {valueChangeDH >= 0 ? `+${formatMAD(valueChangeDH)}` : formatMAD(valueChangeDH)} (COGS)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Threshold & Real Crafting Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-altaj-dark">Seuil d'Alerte</label>
                    <span className="text-[10px] text-slate-500">≤ seuil</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl font-mono text-xs bg-[#FAF8F5]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-altaj-dark">Coût de Revient (DH)</label>
                    <span className="text-[10px] text-emerald-700 font-bold">COGS artisan</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={costInput}
                      onChange={(e) => setCostInput(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 border border-altaj-border rounded-xl font-mono text-xs font-bold bg-[#FAF8F5] pr-8 text-emerald-950"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      DH
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Reason & Moroccan leather shop tags */}
              <div className="space-y-1.5">
                <label className="font-bold text-altaj-dark">Motif / Justification</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                  placeholder="Ex: Réassort atelier maroquinerie Fès..."
                  className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs focus:outline-none focus:border-altaj-brown"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {[
                    "Arrivage atelier Fès",
                    "Retour colis intact réintégré",
                    "Vente directe atelier",
                    "Shooting pub / Influenceur",
                    "Défaut cuir / Perte",
                    "Inventaire physique annuel",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomReason(preset)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-medium transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Operator Name */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark">Opérateur Responsable</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-altaj-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="rounded-xl text-xs font-bold px-5 bg-gradient-to-r from-amber-600 to-altaj-brown hover:opacity-95"
                >
                  Confirmer l'Ajustement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
