'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Copy,
  Archive,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  ArrowUpDown,
  Scissors,
  X,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { WalletModel } from '@/types/altaj';
import { formatCurrency } from '@/lib/altaj/utils';
import { WalletModelModal } from '../modals/WalletModelModal';

export function WalletModelsView() {
  const {
    models,
    saveModel,
    duplicateModel,
    archiveModel,
    orders,
    settings,
    openQuickActionModal,
  } = useAltaj();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [sortBy, setSortBy] = useState<'recent' | 'profit' | 'stock' | 'price' | 'name'>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected model for detail drawer / modal
  const [selectedModel, setSelectedModel] = useState<WalletModel | null>(null);
  const [editingModel, setEditingModel] = useState<WalletModel | null>(null);

  // Compute sales volume per model from order history
  const salesStatsByModel = useMemo(() => {
    const map = new Map<string, { unitsSold: number; totalRevenue: number }>();
    orders.forEach((o) => {
      if (['shipped', 'delivered', 'returned'].includes(o.orderStatus)) {
        o.items.forEach((it) => {
          const prev = map.get(it.modelId) || { unitsSold: 0, totalRevenue: 0 };
          prev.unitsSold += it.quantity;
          prev.totalRevenue += it.totalPrice;
          map.set(it.modelId, prev);
        });
      }
    });
    return map;
  }, [orders]);

  // Filtered and sorted models
  const filteredModels = useMemo(() => {
    return models
      .filter((m) => {
        // Search query
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          m.name.toLowerCase().includes(q) ||
          m.sku.toLowerCase().includes(q) ||
          m.leatherType.toLowerCase().includes(q) ||
          m.leatherColor.toLowerCase().includes(q);

        // Wallet Type filter
        const matchesType = selectedType === 'all' || m.walletType === selectedType;

        // Status filter
        const matchesStatus =
          selectedStatus === 'all' ||
          (selectedStatus === 'active' && m.status === 'active') ||
          (selectedStatus === 'archived' && m.status === 'archived');

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'recent') {
          comp = (b.createdAt || '').localeCompare(a.createdAt || '');
          return sortOrder === 'desc' ? comp : -comp;
        } else if (sortBy === 'profit') {
          comp = a.grossProfitPerUnit - b.grossProfitPerUnit;
        } else if (sortBy === 'stock') {
          comp = a.finishedStock - b.finishedStock;
        } else if (sortBy === 'price') {
          comp = a.sellingPrice - b.sellingPrice;
        } else if (sortBy === 'name') {
          comp = a.name.localeCompare(b.name);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [models, searchQuery, selectedType, selectedStatus, sortBy, sortOrder]);

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateModel(id);
  };

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const model = models.find((m) => m.id === id);
    if (model) {
      if (model.status === 'archived') {
        saveModel({ ...model, status: 'active' });
      } else {
        archiveModel(id);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      {/* Top Header & Search / Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-charcoal-900">
            Wallet Models Catalog ({filteredModels.length})
          </h2>
          <p className="text-xs md:text-sm text-charcoal-500">
            Artisan specifications, leather bill of materials (BOM), and unit profit margins
          </p>
        </div>

        <button
          type="button"
          onClick={() => openQuickActionModal('add_model')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-soft transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Wallet Model</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, leather type, shade..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-cream-50/60 border border-cream-300 rounded-xl outline-none focus:ring-2 focus:ring-sage-400 transition-all text-charcoal-800"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs md:text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-700 outline-none focus:ring-1 focus:ring-sage-400"
          >
            <option value="all">All Types</option>
            <option value="bifold">Bifold</option>
            <option value="cardholder">Cardholder</option>
            <option value="minimalist">Slim Minimalist</option>
            <option value="long">Long Wallet / Clutch</option>
            <option value="passport">Passport & Travel</option>
            <option value="custom">Custom</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs md:text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-700 outline-none focus:ring-1 focus:ring-sage-400"
          >
            <option value="active">Active Only</option>
            <option value="archived">Archived</option>
            <option value="all">All Statuses</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1 border border-cream-300 rounded-xl bg-cream-50 p-0.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1.5 text-xs bg-transparent text-charcoal-700 outline-none"
            >
              <option value="recent">Newest First</option>
              <option value="profit">Profit Margin</option>
              <option value="stock">Stock Available</option>
              <option value="price">Selling Price</option>
              <option value="name">Name</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1.5 text-charcoal-500 hover:text-charcoal-800 rounded-lg"
              title="Reverse sort"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((model) => {
            const isLowStock = model.finishedStock <= model.minStockThreshold;
            const salesStats = salesStatsByModel.get(model.id) || { unitsSold: 0, totalRevenue: 0 };

            return (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`group bg-white rounded-2xl border transition-all duration-200 hover:shadow-card cursor-pointer overflow-hidden flex flex-col justify-between ${
                  model.status === 'archived'
                    ? 'border-cream-300 opacity-70'
                    : isLowStock
                    ? 'border-rose-200 hover:border-rose-300'
                    : 'border-cream-300 hover:border-emerald-300'
                }`}
              >
                {/* Photo & Badge Banner */}
                <div className="relative h-44 bg-cream-200 overflow-hidden">
                  <img
                    src={model.photoUrl}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-charcoal-900/80 text-white backdrop-blur-xs font-semibold">
                      {model.sku}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-charcoal-800 backdrop-blur-xs capitalize font-medium">
                      {model.walletType}
                    </span>
                  </div>

                  {/* Stock Alert Badge */}
                  <div className="absolute top-3 right-3">
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Low stock ({model.finishedStock})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-emerald-800 backdrop-blur-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {model.finishedStock} in stock
                      </span>
                    )}
                  </div>

                  {/* Title overlay at bottom of photo */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif font-bold text-base leading-tight drop-shadow-sm">
                      {model.name}
                    </h3>
                    <p className="text-[11px] text-white/90 truncate drop-shadow-xs">
                      {model.leatherType} • {model.leatherColor}
                    </p>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-cream-50 border border-cream-200 text-center">
                    <div>
                      <span className="text-[10px] text-charcoal-500 block">Retail Price</span>
                      <strong className="text-xs md:text-sm font-serif font-bold text-charcoal-900">
                        {formatCurrency(model.sellingPrice, settings.currencySymbol)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal-500 block">Unit Cost</span>
                      <strong className="text-xs md:text-sm font-serif font-semibold text-charcoal-700">
                        {formatCurrency(model.unitProductionCost, settings.currencySymbol)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal-500 block">Gross Margin</span>
                      <strong className="text-xs md:text-sm font-bold text-emerald-700">
                        {model.grossProfitMarginPercent.toFixed(1)}%
                      </strong>
                    </div>
                  </div>

                  {/* Production specs */}
                  <div className="space-y-1 text-xs text-charcoal-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-charcoal-500">
                        <Clock className="w-3 h-3 text-charcoal-400" />
                        Crafting time:
                      </span>
                      <span className="font-medium text-charcoal-800">
                        {model.productionTimeMinutes} min (~{(model.productionTimeMinutes / 60).toFixed(1)} h)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-charcoal-500">
                        <Scissors className="w-3 h-3 text-charcoal-400" />
                        Materials (BOM):
                      </span>
                      <span className="font-medium text-charcoal-800">
                        {model.recipe?.length || 0} component{(model.recipe?.length || 0) > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-charcoal-500">
                        <Coins className="w-3 h-3 text-emerald-600" />
                        Gross Profit / unit:
                      </span>
                      <span className="font-bold text-emerald-700 font-serif">
                        +{formatCurrency(model.grossProfitPerUnit, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
                    <span className="text-[10px] text-charcoal-400">
                      {salesStats.unitsSold} sold ({formatCurrency(salesStats.totalRevenue, settings.currencySymbol)})
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingModel(model);
                        }}
                        className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                        title="Edit model & photo"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(model.id, e)}
                        className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-100 transition-colors"
                        title="Duplicate model"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleArchive(model.id, e)}
                        className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-100 transition-colors"
                        title={model.status === 'archived' ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(model);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition-colors"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-300 p-12 text-center">
          <Package className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-charcoal-800">
            No wallet models found
          </h3>
          <p className="text-xs text-charcoal-500 mt-1 max-w-md mx-auto">
            Change your search filters or create a new handcrafted leather model.
          </p>
          <button
            type="button"
            onClick={() => openQuickActionModal('add_model')}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-soft"
          >
            + Create Wallet Model
          </button>
        </div>
      )}

      {/* Model Detail Drawer / Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cream-300 shadow-float p-6 animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-cream-200">
              <div className="flex items-center gap-3">
                <img
                  src={selectedModel.photoUrl}
                  alt={selectedModel.name}
                  className="w-16 h-16 rounded-xl object-cover border border-cream-300 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-cream-200 text-charcoal-800 font-bold">
                      {selectedModel.sku}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-medium capitalize">
                      {selectedModel.walletType}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-charcoal-900 mt-1">
                    {selectedModel.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModel(null)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-charcoal-600 leading-relaxed bg-cream-50 p-3 rounded-xl border border-cream-200">
              {selectedModel.description}
            </p>

            {/* Technical Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Leather & Shade</span>
                <strong className="text-charcoal-800">{selectedModel.leatherType}</strong>
                <span className="text-[10px] text-charcoal-500 block mt-0.5">{selectedModel.leatherColor}</span>
              </div>
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Thread & Stitch</span>
                <strong className="text-charcoal-800">{selectedModel.threadColor}</strong>
                <span className="text-[10px] text-charcoal-500 block mt-0.5">Hand saddle stitch</span>
              </div>
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Dimensions</span>
                <strong className="text-charcoal-800">{selectedModel.dimensions}</strong>
              </div>
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Crafting Time</span>
                <strong className="text-charcoal-800">{selectedModel.productionTimeMinutes} minutes</strong>
              </div>
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Hardware</span>
                <strong className="text-charcoal-800">{selectedModel.hardware}</strong>
              </div>
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Available Stock</span>
                <strong className="text-charcoal-800">{selectedModel.finishedStock} units</strong>
              </div>
            </div>

            {/* Unit Cost Breakdown Table (BOM) */}
            <div>
              <h4 className="font-serif font-bold text-sm text-charcoal-900 mb-2">
                Bill of Materials (BOM) & Production Cost
              </h4>
              <div className="border border-cream-300 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-cream-100 text-[10px] uppercase font-semibold text-charcoal-600">
                    <tr>
                      <th className="p-2.5">Component / Material</th>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {selectedModel.recipe?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-cream-50/50">
                        <td className="p-2.5 font-medium text-charcoal-800">
                          {item.materialName}
                          {item.notes && <span className="block text-[10px] text-charcoal-400">{item.notes}</span>}
                        </td>
                        <td className="p-2.5 text-charcoal-600">
                          {item.quantityRequired} {item.unit}
                        </td>
                        <td className="p-2.5 text-right font-serif font-semibold text-charcoal-900">
                          {formatCurrency(item.totalCost, settings.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-cream-50/60">
                      <td className="p-2.5 font-medium text-charcoal-800">
                        Direct Craft Labor ({selectedModel.productionTimeMinutes} min @ {settings.defaultLaborRatePerHour} {settings.currencySymbol}/h)
                      </td>
                      <td className="p-2.5 text-charcoal-600">
                        {(selectedModel.productionTimeMinutes / 60).toFixed(2)} h
                      </td>
                      <td className="p-2.5 text-right font-serif font-semibold text-charcoal-900">
                        {formatCurrency(selectedModel.directLaborCost, settings.currencySymbol)}
                      </td>
                    </tr>
                    <tr className="bg-cream-50/60">
                      <td className="p-2.5 font-medium text-charcoal-800">
                        Workshop Consumables (Wax, dye, glue)
                      </td>
                      <td className="p-2.5 text-charcoal-600">1 lot</td>
                      <td className="p-2.5 text-right font-serif font-semibold text-charcoal-900">
                        {formatCurrency(selectedModel.otherProductionCosts, settings.currencySymbol)}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 font-bold border-t border-emerald-200">
                      <td className="p-2.5 text-emerald-900" colSpan={2}>
                        Total Production Cost per Wallet
                      </td>
                      <td className="p-2.5 text-right font-serif text-emerald-900 text-sm">
                        {formatCurrency(selectedModel.unitProductionCost, settings.currencySymbol)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profitability Summary Banner */}
            <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-charcoal-500 block">Retail Selling Price:</span>
                <span className="text-lg font-serif font-bold text-charcoal-900">
                  {formatCurrency(selectedModel.sellingPrice, settings.currencySymbol)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-charcoal-500 block">Unit Gross Profit:</span>
                <span className="text-lg font-serif font-bold text-emerald-700">
                  +{formatCurrency(selectedModel.grossProfitPerUnit, settings.currencySymbol)} ({selectedModel.grossProfitMarginPercent.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setSelectedModel(null)}
                className="px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-cream-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = selectedModel;
                  setSelectedModel(null);
                  setEditingModel(m);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-xl text-xs font-semibold transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Model
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedModel(null);
                  openQuickActionModal('record_production');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-soft"
              >
                Start Production Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {editingModel && (
        <WalletModelModal
          initialModel={editingModel}
          onClose={() => setEditingModel(null)}
        />
      )}
    </div>
  );
}
