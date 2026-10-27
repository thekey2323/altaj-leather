'use client';

import React, { useState, useRef } from 'react';
import {
  Package,
  X,
  Upload,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { WalletModel, WalletType } from '@/types/altaj';
import { formatCurrency } from '@/lib/altaj/utils';

const QUICK_PHOTOS = [
  { label: 'Bifold Cognac', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cardholder Espresso', url: 'https://images.unsplash.com/photo-1606503829050-8b1b22fb7534?auto=format&fit=crop&w=800&q=80' },
  { label: 'Slim Tan', url: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Passport Forest', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80' },
  { label: 'Classic Black', url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80' },
];

const WALLET_TYPES: { id: WalletType; label: string }[] = [
  { id: 'bifold', label: 'Bifold Classic' },
  { id: 'cardholder', label: 'Cardholder' },
  { id: 'minimalist', label: 'Slim Minimalist' },
  { id: 'long', label: 'Long Wallet / Clutch' },
  { id: 'passport', label: 'Passport Holder' },
];

interface WalletModelModalProps {
  initialModel?: WalletModel | null;
  onClose: () => void;
}

export function WalletModelModal({ initialModel, onClose }: WalletModelModalProps) {
  const { settings, saveModel, setActiveTab } = useAltaj();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialModel;

  // Essential fields only
  const [name, setName] = useState(initialModel?.name || '');
  const [sellingPrice, setSellingPrice] = useState<number>(initialModel?.sellingPrice || 350);
  const [unitCost, setUnitCost] = useState<number>(initialModel?.unitProductionCost || 130);
  const [finishedStock, setFinishedStock] = useState<number>(initialModel?.finishedStock ?? 5);
  const [walletType, setWalletType] = useState<WalletType>(initialModel?.walletType || 'bifold');
  const [leatherColor, setLeatherColor] = useState(initialModel?.leatherColor || 'Cognac');
  const [photoUrl, setPhotoUrl] = useState(initialModel?.photoUrl || QUICK_PHOTOS[0].url);

  // Optional details toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sku, setSku] = useState(initialModel?.sku || `ALT-${Math.floor(100 + Math.random() * 900)}`);
  const [leatherType, setLeatherType] = useState(initialModel?.leatherType || 'Full-grain Vegetable-Tanned Cowhide');
  const [minStockThreshold, setMinStockThreshold] = useState(initialModel?.minStockThreshold ?? 3);
  const [description, setDescription] = useState(initialModel?.description || '');

  // Live profit calculation
  const grossProfit = Math.max(0, sellingPrice - unitCost);
  const grossMarginPercent = sellingPrice > 0 ? Math.round((grossProfit / sellingPrice) * 100) : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string;
      if (!rawBase64) return;

      // Downscale and compress image to avoid localStorage quota limits (~30KB max)
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.72);
          setPhotoUrl(compressed);
        } else {
          setPhotoUrl(rawBase64);
        }
      };
      img.onerror = () => {
        setPhotoUrl(rawBase64);
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveModel({
      id: initialModel?.id,
      name: name.trim(),
      sku: sku || `ALT-${Math.floor(100 + Math.random() * 900)}`,
      photoUrl,
      description: description || `Handcrafted ${leatherColor} full-grain leather wallet`,
      walletType,
      leatherType,
      leatherColor,
      threadColor: initialModel?.threadColor || 'Natural Cream',
      hardware: initialModel?.hardware || 'None',
      dimensions: initialModel?.dimensions || '11.0 x 9.0 cm',
      productionTimeMinutes: initialModel?.productionTimeMinutes || 90,
      recipe: initialModel?.recipe || [],
      leatherWastePercent: 12,
      leatherCost: unitCost * 0.65,
      threadCost: unitCost * 0.05,
      hardwareCost: unitCost * 0.05,
      packagingCost: unitCost * 0.05,
      directLaborCost: unitCost * 0.2,
      otherProductionCosts: 5,
      unitProductionCost: Number(unitCost) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      grossProfitPerUnit: grossProfit,
      grossProfitMarginPercent: grossMarginPercent,
      finishedStock: Number(finishedStock) || 0,
      reservedStock: initialModel?.reservedStock || 0,
      minStockThreshold: Number(minStockThreshold) || 3,
      status: 'active',
    });

    setActiveTab('wallet_models');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00C9A7] to-[#0072FF] text-white flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-slate-850">
                {isEditing ? `Edit: ${initialModel.name}` : 'New Wallet Model'}
              </h3>
              <p className="text-xs text-slate-400">
                Quick creation with instant profit margin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* 1. Photo & Presets */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Wallet Photo
            </label>
            <div className="flex items-center gap-3">
              <img
                src={photoUrl}
                alt="Preview"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
              />
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload photo from device</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {QUICK_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(p.url)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] whitespace-nowrap transition-all ${
                        photoUrl === p.url
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Wallet Name */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Model Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Atlas Bifold Cognac"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm text-slate-800"
            />
          </div>

          {/* 3. Type & Leather Shade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Wallet Type
              </label>
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value as WalletType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none"
              >
                {WALLET_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Leather Color / Shade
              </label>
              <input
                type="text"
                placeholder="Cognac, Espresso, Black..."
                value={leatherColor}
                onChange={(e) => setLeatherColor(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none"
              />
            </div>
          </div>

          {/* 4. Selling Price & Cost */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Selling Price ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="5"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-base font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Unit Production Cost ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="5"
                  min="0"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-base font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Live Profit Margin */}
            <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Gross Profit Margin:</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-emerald-700 text-sm font-mono">
                  +{formatCurrency(grossProfit, settings.currencySymbol)}
                </span>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {grossMarginPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* 5. Initial Finished Stock */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Finished Units Ready to Sell
            </label>
            <input
              type="number"
              min="0"
              value={finishedStock}
              onChange={(e) => setFinishedStock(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
            />
          </div>

          {/* 6. Advanced Options */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showAdvanced ? 'Hide advanced options' : 'More options (SKU, Alert Threshold, Description)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={minStockThreshold}
                      onChange={(e) => setMinStockThreshold(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-600 block mb-1">Leather Type</label>
                  <input
                    type="text"
                    value={leatherType}
                    onChange={(e) => setLeatherType(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-600 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Pockets, edge finishing, craft notes..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C9A7] via-[#05B3D6] to-[#0072FF] text-white font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Save Wallet Model'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
