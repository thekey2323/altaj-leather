'use client';

import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Package,
  Plus,
  Search,
  AlertTriangle,
  History,
  Sparkles,
  Scissors,
  CheckCircle2,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { RawMaterial, MaterialCategory, MaterialUnit, WalletModel, WalletType } from '@/types/altaj';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/altaj/utils';
import { calculateModelProductionCapacity } from '@/lib/altaj/finance';

export function InventoryView() {
  const {
    materials,
    models,
    logs,
    financials,
    settings,
    updateSettings,
    saveModel,
    deleteModel,
    saveMaterial,
    deleteMaterial,
    openQuickActionModal,
  } = useAltaj();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'materials' | 'finished' | 'capacity' | 'logs'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  // Packaging & Courier fee modal states
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [pkgCost, setPkgCost] = useState<number>(settings.defaultPackagingCost ?? 15);
  const [pkgDesc, setPkgDesc] = useState<string>(settings.defaultPackagingDescription || 'Rigid box + dust bag');
  const [pkgApplyToModels, setPkgApplyToModels] = useState(true);

  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shipActualCost, setShipActualCost] = useState<number>(settings.defaultShippingCostActual ?? 35);
  const [shipChargedCost, setShipChargedCost] = useState<number>(settings.defaultShippingCharged ?? 20);
  const [shipDesc, setShipDesc] = useState<string>(settings.defaultShippingDescription || 'Average courier fee (Morocco)');

  const handleOpenPackagingModal = () => {
    setPkgCost(settings.defaultPackagingCost ?? 15);
    setPkgDesc(settings.defaultPackagingDescription || 'Rigid box + dust bag');
    setPkgApplyToModels(true);
    setShowPackagingModal(true);
  };

  const handleSavePackaging = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Number(pkgCost) || 0;
    const desc = pkgDesc.trim() || 'Rigid box + dust bag';

    updateSettings({
      defaultPackagingCost: cost,
      defaultPackagingDescription: desc,
    });

    if (pkgApplyToModels && models.length > 0) {
      models.forEach((mod) => {
        saveModel({
          ...mod,
          packagingCost: cost,
        });
      });
    }

    setShowPackagingModal(false);
  };

  const handleOpenShippingModal = () => {
    setShipActualCost(settings.defaultShippingCostActual ?? 35);
    setShipChargedCost(settings.defaultShippingCharged ?? 20);
    setShipDesc(settings.defaultShippingDescription || 'Average courier fee (Morocco)');
    setShowShippingModal(true);
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const actual = Number(shipActualCost) || 0;
    const charged = Number(shipChargedCost) || 0;
    const desc = shipDesc.trim() || 'Average courier fee (Morocco)';

    updateSettings({
      defaultShippingCostActual: actual,
      defaultShippingCharged: charged,
      defaultShippingDescription: desc,
    });

    setShowShippingModal(false);
  };

  // Material edit form states
  const [editMatName, setEditMatName] = useState('');
  const [editMatCategory, setEditMatCategory] = useState<MaterialCategory>('leather');
  const [editMatUnit, setEditMatUnit] = useState<MaterialUnit>('sq_ft');
  const [editMatUnitCost, setEditMatUnitCost] = useState(0);
  const [editMatMinStock, setEditMatMinStock] = useState(0);
  const [editMatSupplierName, setEditMatSupplierName] = useState('');

  // Finished wallet edit form states
  const [editingWallet, setEditingWallet] = useState<WalletModel | null>(null);
  const [walletName, setWalletName] = useState('');
  const [walletSku, setWalletSku] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('bifold');
  const [walletFinishedStock, setWalletFinishedStock] = useState<number>(0);
  const [walletReservedStock, setWalletReservedStock] = useState<number>(0);
  const [walletLeatherCost, setWalletLeatherCost] = useState<number>(65);
  const [walletPackagingCost, setWalletPackagingCost] = useState<number>(15);
  const [walletHardwareCost, setWalletHardwareCost] = useState<number>(10);
  const [walletLaborCost, setWalletLaborCost] = useState<number>(35);
  const [walletOtherCost, setWalletOtherCost] = useState<number>(5);
  const [walletSellingPrice, setWalletSellingPrice] = useState<number>(380);

  const handleOpenEditWallet = (mod: WalletModel) => {
    setEditingWallet(mod);
    setWalletName(mod.name);
    setWalletSku(mod.sku);
    setWalletType(mod.walletType || 'bifold');
    setWalletFinishedStock(mod.finishedStock ?? 0);
    setWalletReservedStock(mod.reservedStock ?? 0);
    setWalletLeatherCost(mod.leatherCost ?? 65);
    setWalletPackagingCost(mod.packagingCost ?? 15);
    setWalletHardwareCost(mod.hardwareCost ?? 10);
    setWalletLaborCost(mod.directLaborCost ?? 35);
    setWalletOtherCost(mod.otherProductionCosts ?? 5);
    setWalletSellingPrice(mod.sellingPrice ?? 380);
  };

  const handleOpenEditWalletCost = handleOpenEditWallet;

  const handleSaveWalletCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;

    const totalCost = Number(walletLeatherCost) + Number(walletPackagingCost) + Number(walletHardwareCost) + Number(walletLaborCost) + Number(walletOtherCost);
    const grossProfit = Math.max(0, Number(walletSellingPrice) - totalCost);
    const grossMargin = Number(walletSellingPrice) > 0 ? (grossProfit / Number(walletSellingPrice)) * 100 : 0;

    saveModel({
      ...editingWallet,
      name: walletName.trim() || editingWallet.name,
      sku: walletSku.trim() || editingWallet.sku,
      walletType: walletType,
      finishedStock: Math.max(0, Number(walletFinishedStock)),
      reservedStock: Math.max(0, Number(walletReservedStock)),
      leatherCost: Number(walletLeatherCost),
      packagingCost: Number(walletPackagingCost),
      hardwareCost: Number(walletHardwareCost),
      directLaborCost: Number(walletLaborCost),
      otherProductionCosts: Number(walletOtherCost),
      unitProductionCost: totalCost,
      sellingPrice: Number(walletSellingPrice),
      grossProfitPerUnit: grossProfit,
      grossProfitMarginPercent: grossMargin,
    });

    setEditingWallet(null);
  };

  const handleDeleteWallet = (mod: WalletModel) => {
    if (window.confirm(`Are you sure you want to delete "${mod.name}" (${mod.sku}) from inventory? This will permanently remove this finished wallet model.`)) {
      deleteModel(mod.id);
      if (editingWallet?.id === mod.id) {
        setEditingWallet(null);
      }
    }
  };

  const handleOpenEditMaterial = (m: RawMaterial) => {
    setEditingMaterial(m);
    setEditMatName(m.name);
    setEditMatCategory(m.category);
    setEditMatUnit(m.unit);
    setEditMatUnitCost(m.unitCost);
    setEditMatMinStock(m.minStockThreshold);
    setEditMatSupplierName(m.supplierName);
  };

  const handleSaveEditedMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !editMatName) return;
    saveMaterial({
      ...editingMaterial,
      name: editMatName,
      category: editMatCategory,
      unit: editMatUnit,
      unitCost: Number(editMatUnitCost),
      minStockThreshold: Number(editMatMinStock),
      supplierName: editMatSupplierName,
    });
    setEditingMaterial(null);
  };
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filtered raw materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.supplierName.toLowerCase().includes(q) ||
        (m.leatherDetails?.color || '').toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [materials, searchQuery, categoryFilter]);

  // Production capacity calculation across models
  const capacityList = useMemo(() => {
    return models
      .filter((m) => m.status === 'active')
      .map((model) => {
        const capacity = calculateModelProductionCapacity(model, materials);
        return {
          model,
          ...capacity,
        };
      })
      .sort((a, b) => b.maxUnitsPossible - a.maxUnitsPossible);
  }, [models, materials]);

  const categoryLabels: Record<string, string> = {
    all: 'All Materials',
    leather: 'Leather (Cost per wallet)',
    packaging: 'Packaging & Gift Boxes',
    thread: 'Thread & Stitching',
    hardware: 'Hardware & Buckles',
    edge_paint: 'Edge Dye & Tokonole',
    consumable: 'Workshop Consumables',
    other: 'Other Supplies',
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      {/* Top Cost per Wallet & Inventory Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Leather Cost per Wallet */}
        <div
          onClick={() => {
            if (models.length > 0) handleOpenEditWalletCost(models[0]);
          }}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
          title="Click to edit wallet cost"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Leather Cost / Wallet
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-bold group-hover:bg-amber-100">
                Edit ✏️
              </span>
            </div>
            <div className="mt-1 text-2xl font-black text-amber-800 font-mono">
              {models[0] ? `${models[0].leatherCost || 65} DH` : '65 DH'} <span className="text-xs font-normal text-slate-400">/ item</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Full-grain vegetable-tanned
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Packaging & Box */}
        <div
          onClick={handleOpenPackagingModal}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
          title="Click to edit Packaging & Kraft Box cost"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Packaging & Kraft Box
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold group-hover:bg-indigo-100">
                Edit ✏️
              </span>
            </div>
            <div className="mt-1 text-2xl font-black text-indigo-700 font-mono">
              {settings.defaultPackagingCost ?? 15} DH <span className="text-xs font-normal text-slate-400">/ box</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {settings.defaultPackagingDescription || 'Rigid box + dust bag'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* 3. COD Shipping */}
        <div
          onClick={handleOpenShippingModal}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all group"
          title="Click to edit COD Courier Delivery fee"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                COD Courier Delivery
              </span>
              <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded-md font-bold group-hover:bg-cyan-100">
                Edit ✏️
              </span>
            </div>
            <div className="mt-1 text-2xl font-black text-cyan-700 font-mono">
              {settings.defaultShippingCostActual ?? 35} DH <span className="text-xs font-normal text-slate-400">/ parcel</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {settings.defaultShippingDescription || 'Average courier fee (Morocco)'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Total Finished Goods Stock */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">
              Finished Wallets in Stock
            </span>
            <div className="mt-1 text-2xl font-black font-mono">
              {financials.currentFinishedWalletStock} pcs
            </div>
            <span className="text-[11px] text-emerald-100">
              Value: {formatCurrency(financials.finishedGoodsInventoryValue, settings.currencySymbol)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openQuickActionModal('adjust_stock')}
            className="px-3 py-1.5 bg-white text-emerald-800 rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-50 transition-colors"
          >
            Adjust
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-cream-300 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('materials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeSubTab === 'materials'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Raw Materials ({materials.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('finished')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeSubTab === 'finished'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          <Package className="w-4 h-4" />
          Finished Wallets ({models.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('capacity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeSubTab === 'capacity'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Production Capacity
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeSubTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          <History className="w-4 h-4" />
          Stock Audit Logs ({logs.length})
        </button>
      </div>

      {/* SUB-TAB 1: RAW MATERIALS */}
      {activeSubTab === 'materials' && (
        <div className="space-y-4">
          {/* Search & Actions Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leather, thread, supplier..."
                className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-cream-50/60 border border-cream-300 rounded-xl outline-none focus:ring-2 focus:ring-sage-400 transition-all text-charcoal-800"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs md:text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-700 outline-none"
              >
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => openQuickActionModal('add_purchase')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-soft transition-all"
              >
                <Plus className="w-4 h-4" />
                + Log Material Purchase
              </button>
            </div>
          </div>

          {/* Raw Materials Table */}
          <div className="bg-white rounded-2xl border border-cream-300 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream-100 border-b border-cream-200 text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Material / Leather</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-center">Unit</th>
                    <th className="py-3 px-4 text-right">Available Stock</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-right">Stock Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-xs">
                  {filteredMaterials.map((mat) => {
                    const isLow = mat.currentStock <= mat.minStockThreshold;
                    return (
                      <tr key={mat.id} className="hover:bg-cream-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-charcoal-900">{mat.name}</div>
                          {mat.isLeather && mat.leatherDetails && (
                            <div className="text-[10px] text-charcoal-500 mt-0.5">
                              {mat.leatherDetails.hideType} • {mat.leatherDetails.color} • Est. scrap: {mat.leatherDetails.estimatedWastePercent}%
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 capitalize text-charcoal-600">
                          <span className="px-2 py-0.5 rounded-md bg-cream-100 text-charcoal-700 text-[11px]">
                            {mat.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-charcoal-600">
                          {mat.supplierName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-charcoal-500">
                          {mat.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`font-bold font-serif text-sm ${isLow ? 'text-rose-600' : 'text-charcoal-900'}`}>
                            {mat.currentStock}
                          </span>
                          <span className="text-[10px] text-charcoal-400 block">
                            Min: {mat.minStockThreshold} {mat.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif text-charcoal-800">
                          {formatCurrency(mat.unitCost, settings.currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif font-bold text-charcoal-900">
                          {formatCurrency(mat.totalValue, settings.currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMaterial(mat)}
                              className="p-1 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                              title="Edit material"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteMaterial(mat.id)}
                              className="p-1 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FINISHED GOODS INVENTORY */}
      {activeSubTab === 'finished' && (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-cream-200 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-charcoal-900">
                Finished Wallets Available in Stock
              </h3>
              <p className="text-xs text-charcoal-500">
                Physical on-hand inventory vs. reserved stock for confirmed orders
              </p>
            </div>
            <button
              type="button"
              onClick={() => openQuickActionModal('adjust_stock')}
              className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 border border-cream-300 rounded-xl text-xs font-medium text-charcoal-800 transition-colors"
            >
              Adjust Stock
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100 border-b border-cream-200 text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Physical Stock</th>
                  <th className="py-3 px-4 text-right">Reserved (Orders)</th>
                  <th className="py-3 px-4 text-right">Net Available</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Stock Value</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {models.map((mod) => {
                  const netAvailable = Math.max(0, mod.finishedStock - (mod.reservedStock || 0));

                  return (
                    <tr key={mod.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div
                          onClick={() => handleOpenEditWallet(mod)}
                          className="flex items-center gap-3 cursor-pointer group/name"
                          title="Click to edit finished wallet and stock"
                        >
                          <img
                            src={mod.photoUrl}
                            alt={mod.name}
                            className="w-10 h-10 rounded-lg object-cover border border-cream-300 shrink-0 group-hover/name:border-emerald-500 transition-colors"
                          />
                          <div>
                            <div className="font-semibold text-charcoal-900 group-hover/name:text-emerald-700 flex items-center gap-1 transition-colors">
                              {mod.name}
                              <Edit className="w-3 h-3 opacity-0 group-hover/name:opacity-70 transition-opacity" />
                            </div>
                            <div className="text-[10px] text-charcoal-500 capitalize">{mod.walletType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-charcoal-600 font-medium">
                        {mod.sku}
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-charcoal-900 text-sm">
                        <button
                          type="button"
                          onClick={() => handleOpenEditWallet(mod)}
                          className="hover:underline hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                          title="Click to edit physical stock level"
                        >
                          {mod.finishedStock}
                          <Edit className="w-3 h-3 text-charcoal-400 opacity-60" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right text-charcoal-500 font-mono">
                        {mod.reservedStock || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold font-serif text-sm ${netAvailable === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {netAvailable}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-serif text-charcoal-700">
                        <button
                          type="button"
                          onClick={() => handleOpenEditWallet(mod)}
                          className="hover:underline hover:text-amber-700 inline-flex items-center gap-1 font-medium"
                          title="Click to edit wallet production cost"
                        >
                          {formatCurrency(mod.unitProductionCost, settings.currencySymbol)}
                          <Edit className="w-3 h-3 text-charcoal-400 opacity-60" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-charcoal-900">
                        {formatCurrency(mod.finishedStock * mod.unitProductionCost, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditWallet(mod)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Edit wallet details, costs & stock"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openQuickActionModal('record_production')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium transition-colors"
                            title="Craft new units of this model"
                          >
                            + Craft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWallet(mod)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title={`Delete ${mod.name} from stock`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MANUFACTURING CAPACITY CALCULATOR */}
      {activeSubTab === 'capacity' && (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Immediate Crafting Capacity (Based on BOM Recipes)
            </h3>
            <p className="text-xs text-charcoal-500">
              How many finished wallets can you craft right now with your currently available raw materials?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {capacityList.map(({ model, maxUnitsPossible, limitingMaterialName, details }) => (
              <div
                key={model.id}
                className="p-4 rounded-2xl border border-cream-300 bg-cream-50/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 font-semibold">
                      {model.sku}
                    </span>
                    <span className="text-xs text-charcoal-500 capitalize">{model.walletType}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-charcoal-900 mt-1">
                    {model.name}
                  </h4>
                </div>

                <div className="p-3 rounded-xl bg-white border border-cream-200 text-center">
                  <span className="text-[10px] text-charcoal-500 uppercase tracking-wider block">
                    Buildable Capacity
                  </span>
                  <div className="text-2xl font-serif font-bold text-emerald-700 mt-0.5">
                    {maxUnitsPossible} <span className="text-xs font-normal text-charcoal-500">units</span>
                  </div>
                  {limitingMaterialName && maxUnitsPossible > 0 && (
                    <span className="text-[10px] text-amber-700 block mt-1 truncate">
                      Bottleneck: {limitingMaterialName}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-charcoal-600 space-y-1">
                  <span className="font-semibold block text-[10px] uppercase text-charcoal-400">
                    BOM requirements per wallet:
                  </span>
                  {details.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <span className="truncate max-w-[140px] text-charcoal-600">{d.materialName}:</span>
                      <span className="font-medium text-charcoal-800">
                        {d.required} / avail {d.available}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => openQuickActionModal('record_production')}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Start This Batch
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: INVENTORY AUDIT LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-cream-200">
            <h3 className="font-serif font-bold text-base text-charcoal-900">
              Stock Movement Audit Trail
            </h3>
            <p className="text-xs text-charcoal-500">
              Audit log of all stock entries, production consumptions, sales, and manual adjustments
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100 border-b border-cream-200 text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Movement Type</th>
                  <th className="py-2.5 px-4">Item / Material</th>
                  <th className="py-2.5 px-4 text-right">Variation</th>
                  <th className="py-2.5 px-4 text-right">New Stock</th>
                  <th className="py-2.5 px-4">Reason / Notes</th>
                  <th className="py-2.5 px-4 text-center">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {logs.map((log) => {
                  const isPositive = log.quantityChange > 0;
                  return (
                    <tr key={log.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="py-3 px-4 text-charcoal-500 font-mono text-[11px]">
                        {formatDateTime(log.date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cream-100 text-charcoal-800 border border-cream-200">
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900">
                        {log.itemName}
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold">
                        <span className={isPositive ? 'text-emerald-700' : 'text-rose-600'}>
                          {isPositive ? `+${log.quantityChange}` : log.quantityChange} {log.unit || ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-medium text-charcoal-800">
                        {log.newStock} {log.unit || ''}
                      </td>
                      <td className="py-3 px-4 text-charcoal-600">
                        {log.reason}
                      </td>
                      <td className="py-3 px-4 text-center text-[10px] text-charcoal-500">
                        {log.performedBy || 'System'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-cream-300 shadow-float p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                Edit Raw Material
              </h3>
              <button type="button" onClick={() => setEditingMaterial(null)}>
                <X className="w-5 h-5 text-charcoal-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedMaterial} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Name / Description *</label>
                <input
                  type="text"
                  required
                  value={editMatName}
                  onChange={(e) => setEditMatName(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Category</label>
                  <select
                    value={editMatCategory}
                    onChange={(e) => setEditMatCategory(e.target.value as MaterialCategory)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                  >
                    <option value="leather">Leather</option>
                    <option value="thread">Thread</option>
                    <option value="hardware">Hardware / Buckles</option>
                    <option value="edge_paint">Edge Dye</option>
                    <option value="glue">Glue</option>
                    <option value="packaging">Packaging</option>
                    <option value="reinforcement">Reinforcement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Unit</label>
                  <select
                    value={editMatUnit}
                    onChange={(e) => setEditMatUnit(e.target.value as MaterialUnit)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                  >
                    <option value="piece">Per Wallet (DH / item)</option>
                    <option value="unit">Per Box / Parcel (Packaging & Delivery)</option>
                    <option value="sq_ft">sq_ft (Square feet leather)</option>
                    <option value="meter">Meter (Waxed linen thread)</option>
                    <option value="ml">ml (Edge dye)</option>
                    <option value="gram">Grams</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Unit Cost ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editMatUnitCost}
                    onChange={(e) => setEditMatUnitCost(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Min Alert Stock</label>
                  <input
                    type="number"
                    value={editMatMinStock}
                    onChange={(e) => setEditMatMinStock(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Supplier</label>
                <input
                  type="text"
                  value={editMatSupplierName}
                  onChange={(e) => setEditMatSupplierName(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2 text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-soft"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FINISHED WALLET & STOCK */}
      {editingWallet && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-cream-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal-900">
                  Edit Finished Wallet & Stock
                </h3>
                <p className="text-xs text-charcoal-500">
                  {editingWallet.name} ({editingWallet.sku}) • Adjust stock levels, pricing & costs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingWallet(null)}
                className="p-1.5 hover:bg-cream-100 rounded-lg text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWalletCost} className="space-y-4 pt-4 text-xs">
              {/* STOCK ON-HAND & RESERVED INVENTORY */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <Boxes className="w-4 h-4 text-emerald-700" />
                    Finished Stock Inventory
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300">
                    Net Available: {Math.max(0, Number(walletFinishedStock) - Number(walletReservedStock))} units
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal-700 block mb-1">
                      Physical Stock on Hand
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={walletFinishedStock}
                      onChange={(e) => setWalletFinishedStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl outline-none font-serif font-bold text-base text-emerald-950 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                    <p className="text-[10px] text-charcoal-500 mt-1">Ready finished wallets in workshop</p>
                  </div>

                  <div>
                    <label className="font-semibold text-charcoal-700 block mb-1">
                      Reserved for Orders
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={walletReservedStock}
                      onChange={(e) => setWalletReservedStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-cream-300 rounded-xl outline-none font-serif font-bold text-base text-charcoal-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                    <p className="text-[10px] text-charcoal-500 mt-1">Committed to pending orders</p>
                  </div>
                </div>
              </div>

              {/* MODEL NAME, SKU & TYPE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-medium text-charcoal-700 block mb-1">Model Name</label>
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium text-charcoal-900 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">SKU</label>
                  <input
                    type="text"
                    value={walletSku}
                    onChange={(e) => setWalletSku(e.target.value)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-mono text-charcoal-900 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Wallet Type</label>
                  <select
                    value={walletType}
                    onChange={(e) => setWalletType(e.target.value as WalletType)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none text-charcoal-900 focus:border-emerald-500 capitalize"
                  >
                    <option value="bifold">Bifold</option>
                    <option value="cardholder">Cardholder</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="long">Long Wallet</option>
                    <option value="passport">Passport</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* UNIT COST & MARGIN SUMMARY */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                <div className="flex items-center justify-between text-amber-950 mb-1">
                  <span className="font-semibold">Calculated Unit Cost:</span>
                  <span className="font-serif font-bold text-base text-amber-900">
                    {formatCurrency(
                      Number(walletLeatherCost) +
                        Number(walletPackagingCost) +
                        Number(walletHardwareCost) +
                        Number(walletLaborCost) +
                        Number(walletOtherCost),
                      settings.currencySymbol
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-amber-800">
                  <span>Selling Price: {formatCurrency(Number(walletSellingPrice), settings.currencySymbol)}</span>
                  <span>
                    Gross Margin:{' '}
                    {Number(walletSellingPrice) > 0
                      ? (
                          ((Number(walletSellingPrice) -
                            (Number(walletLeatherCost) +
                              Number(walletPackagingCost) +
                              Number(walletHardwareCost) +
                              Number(walletLaborCost) +
                              Number(walletOtherCost))) /
                            Number(walletSellingPrice)) *
                          100
                        ).toFixed(1)
                      : '0'}
                    %
                  </span>
                </div>
              </div>

              {/* DIRECT PRODUCTION COSTS BREAKDOWN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">
                    Leather Cost / Wallet ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={walletLeatherCost}
                    onChange={(e) => setWalletLeatherCost(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif font-bold text-charcoal-900 focus:border-emerald-500"
                    required
                  />
                  <p className="text-[10px] text-charcoal-500 mt-0.5">Vegetable-tanned leather per piece</p>
                </div>

                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">
                    Packaging & Box ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={walletPackagingCost}
                    onChange={(e) => setWalletPackagingCost(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif font-bold text-charcoal-900 focus:border-emerald-500"
                    required
                  />
                  <p className="text-[10px] text-charcoal-500 mt-0.5">Kraft gift box, pouch & ribbon</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">
                    Hardware ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={walletHardwareCost}
                    onChange={(e) => setWalletHardwareCost(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif text-charcoal-900 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-charcoal-500 mt-0.5">Snaps, rivets, zipper</p>
                </div>

                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">
                    Crafting Labor ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={walletLaborCost}
                    onChange={(e) => setWalletLaborCost(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif text-charcoal-900 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-charcoal-500 mt-0.5">Hand-stitching labor</p>
                </div>

                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">
                    Thread & Dye ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={walletOtherCost}
                    onChange={(e) => setWalletOtherCost(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif text-charcoal-900 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-charcoal-500 mt-0.5">Consumables</p>
                </div>
              </div>

              <div className="pt-2 border-t border-cream-200">
                <label className="font-medium text-charcoal-700 block mb-1">
                  Retail Selling Price ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={walletSellingPrice}
                  onChange={(e) => setWalletSellingPrice(Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif font-bold text-emerald-900 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => handleDeleteWallet(editingWallet)}
                  className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  title="Permanently remove this wallet model from inventory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Wallet
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingWallet(null)}
                    className="px-4 py-2 text-charcoal-600 hover:bg-cream-100 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-soft"
                  >
                    Save & Update Stock
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PACKAGING & KRAFT BOX MODAL */}
      {showPackagingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Packaging & Kraft Box</h3>
                  <p className="text-xs text-slate-400">Box, dust bag & presentation packaging</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPackagingModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackaging} className="mt-5 space-y-4 text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Packaging Cost per Box ({settings.currencySymbol})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={pkgCost}
                    onChange={(e) => setPkgCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl outline-none font-mono font-bold text-indigo-950 focus:border-indigo-500 text-base"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    DH / box
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Cost of rigid kraft box, cotton dust bag, and wrapping paper</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Packaging Description / Contents
                </label>
                <input
                  type="text"
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  placeholder="e.g. Rigid box + dust bag"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl outline-none text-slate-800 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pkgApplyToModels}
                    onChange={(e) => setPkgApplyToModels(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs text-indigo-950 font-medium leading-relaxed">
                    Apply this packaging cost ({pkgCost || 0} DH) across all finished wallet models ({models.length} models) and recalculate profit margins automatically
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPackagingModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-2xl font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-sm transition-colors"
                >
                  Save Packaging Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COD COURIER DELIVERY MODAL */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cyan-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">COD Courier Delivery Rates</h3>
                  <p className="text-xs text-slate-400">Carrier delivery fee and customer shipping</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShippingModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShipping} className="mt-5 space-y-4 text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Actual Courier Cost per Parcel ({settings.currencySymbol})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={shipActualCost}
                    onChange={(e) => setShipActualCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl outline-none font-mono font-bold text-cyan-950 focus:border-cyan-500 text-base"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    DH / parcel
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Real fee charged by courier (Amana, Cathedis, Ozone, etc.) deducted from Net Profit</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Default Shipping Charged to Customer ({settings.currencySymbol})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={shipChargedCost}
                    onChange={(e) => setShipChargedCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl outline-none font-mono font-bold text-slate-800 focus:border-cyan-500"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    DH charged
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Amount invoiced to customer (enter 0 for free shipping)</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Courier Description / Service Note
                </label>
                <input
                  type="text"
                  value={shipDesc}
                  onChange={(e) => setShipDesc(e.target.value)}
                  placeholder="e.g. Average courier fee (Morocco)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl outline-none text-slate-800 focus:border-cyan-500"
                  required
                />
              </div>

              <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-3.5">
                <p className="text-xs text-cyan-950 leading-relaxed font-medium">
                  💡 Updating this rate automatically recalculates total courier deductions and Net Profit on the Dashboard.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShippingModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-2xl font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-2xl font-bold text-xs shadow-sm transition-colors"
                >
                  Save Courier Rates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
