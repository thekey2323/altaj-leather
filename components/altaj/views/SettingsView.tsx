'use client';

import React, { useState } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Save,
  DollarSign,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';

export function SettingsView() {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    resetDemo,
    clearData,
  } = useAltaj();

  // Settings form state
  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportJson = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALTAJLEATHER_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importData(text);
        if (ok) {
          setImportStatus('Backup restored successfully!');
        } else {
          setImportStatus('Error: Invalid or corrupted JSON backup file.');
        }
      } catch (err) {
        setImportStatus('Error reading file.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('Do you want to reset all data with the ALTAJ artisan demonstration dataset?')) {
      resetDemo();
      setFormData(settings);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('WARNING: This will permanently delete ALL wallet models, sales, inventory, and expenses. Are you sure?')) {
      clearData();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="font-serif font-bold text-xl md:text-2xl text-charcoal-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-sage-500" />
          Settings & Data Management
        </h2>
        <p className="text-xs md:text-sm text-charcoal-500 mt-1">
          Workshop financial rules, currency, hourly wage rates, and backups
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-800 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0" />
          <span>Workshop settings successfully updated and saved.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 md:p-8 space-y-6">
        {/* Section 1: Business Identity */}
        <div>
          <h3 className="font-serif font-bold text-base text-charcoal-900 border-b border-cream-200 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-sage-600" />
            1. Workshop & Artisan Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full p-2.5 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-semibold"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Tagline / Brand Signature</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Artisan / Owner Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full p-2.5 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Workshop Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-medium text-charcoal-700 block mb-1">Workshop Address</label>
              <input
                type="text"
                value={formData.atelierAddress}
                onChange={(e) => setFormData({ ...formData, atelierAddress: e.target.value })}
                className="w-full p-2.5 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Currency & Labor Rates */}
        <div>
          <h3 className="font-serif font-bold text-base text-charcoal-900 border-b border-cream-200 pb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-sage-600" />
            2. Currency, Labor Rates & Taxation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Reporting Currency</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="e.g. MAD"
                  className="w-full p-2.5 border border-cream-300 rounded-xl font-bold font-mono outline-none"
                />
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  placeholder="e.g. DH"
                  className="w-full p-2.5 border border-cream-300 rounded-xl font-bold font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Labor Hourly Rate ({formData.currencySymbol}/h)
              </label>
              <input
                type="number"
                step="5"
                value={formData.defaultLaborRatePerHour}
                onChange={(e) => setFormData({ ...formData, defaultLaborRatePerHour: Number(e.target.value) })}
                className="w-full p-2.5 border border-cream-300 rounded-xl font-bold font-serif text-sm outline-none focus:ring-1 focus:ring-sage-400"
              />
              <span className="text-[10px] text-charcoal-400 block mt-0.5">
                Artisan bench crafting time incorporated into production cost
              </span>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Estimated Tax Rate (%)
              </label>
              <input
                type="number"
                step="1"
                value={formData.defaultTaxRatePercent}
                onChange={(e) => setFormData({ ...formData, defaultTaxRatePercent: Number(e.target.value) })}
                className="w-full p-2.5 border border-cream-300 rounded-xl font-bold outline-none focus:ring-1 focus:ring-sage-400"
              />
              <span className="text-[10px] text-charcoal-400 block mt-0.5">
                Auto-entrepreneur / artisan regime (0% or customized)
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Delivery Defaults & Recognition Rules */}
        <div>
          <h3 className="font-serif font-bold text-base text-charcoal-900 border-b border-cream-200 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sage-600" />
            3. Revenue Recognition & Shipping Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Revenue Recognition Rule
              </label>
              <select
                value={formData.revenueRecognitionRule}
                onChange={(e) => setFormData({ ...formData, revenueRecognitionRule: e.target.value as any })}
                className="w-full p-2.5 border border-cream-300 rounded-xl bg-cream-50 text-charcoal-800 outline-none"
              >
                <option value="on_shipped_or_delivered">On Shipped or Delivered (Recommended)</option>
                <option value="on_delivery">Only on Confirmed Delivery</option>
                <option value="on_confirmation">Upon Order Confirmation</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Actual Courier Cost ({formData.currencySymbol})
              </label>
              <input
                type="number"
                value={formData.defaultShippingCostActual}
                onChange={(e) => setFormData({ ...formData, defaultShippingCostActual: Number(e.target.value) })}
                className="w-full p-2.5 border border-cream-300 rounded-xl outline-none font-medium"
              />
              <span className="text-[10px] text-charcoal-400 block mt-0.5">
                Average cost billed by courier / carrier
              </span>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Shipping Charged to Client ({formData.currencySymbol})
              </label>
              <input
                type="number"
                value={formData.defaultShippingCharged}
                onChange={(e) => setFormData({ ...formData, defaultShippingCharged: Number(e.target.value) })}
                className="w-full p-2.5 border border-cream-300 rounded-xl outline-none font-medium"
              />
              <span className="text-[10px] text-charcoal-400 block mt-0.5">
                Standard delivery fee charged to buyer
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-sage-400 hover:bg-sage-500 text-white rounded-xl text-xs md:text-sm font-semibold shadow-soft transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Data Persistence, Backup & Demo Data Management */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 md:p-8 space-y-6">
        <div>
          <h3 className="font-serif font-bold text-base text-charcoal-900 border-b border-cream-200 pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-sage-600" />
            Backup, Restore & Data Management
          </h3>
          <p className="text-xs text-charcoal-500 mt-1">
            All your data (wallet models, BOM recipes, leather stocks, orders, and expenses) is securely persisted locally and can be exported at any time as JSON.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-cream-100 border border-cream-300 text-xs text-charcoal-800">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="p-4 rounded-2xl border border-cream-300 hover:border-sage-400 bg-cream-50/50 hover:bg-cream-100/70 text-left transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-charcoal-900 block">
                Export Full Database
              </span>
              <span className="text-[10px] text-charcoal-500 block mt-0.5">
                Download a JSON file containing your complete history
              </span>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-2xl border border-cream-300 hover:border-paleblue-400 bg-cream-50/50 hover:bg-cream-100/70 text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer group">
            <div className="w-8 h-8 rounded-xl bg-paleblue-100 text-paleblue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-charcoal-900 block">
                Restore from Backup
              </span>
              <span className="text-[10px] text-charcoal-500 block mt-0.5">
                Import a previously saved JSON backup file
              </span>
            </div>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={handleResetDemo}
            className="p-4 rounded-2xl border border-cream-300 hover:border-lavender-400 bg-cream-50/50 hover:bg-cream-100/70 text-left transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="w-8 h-8 rounded-xl bg-lavender-100 text-lavender-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-charcoal-900 block">
                Reset Demo Data
              </span>
              <span className="text-[10px] text-charcoal-500 block mt-0.5">
                Restore sample models, leathers, and orders
              </span>
            </div>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={handleClearAll}
            className="p-4 rounded-2xl border border-red-200 hover:border-red-400 bg-red-50/40 hover:bg-red-50 text-left transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-red-900 block">
                Clear All Data
              </span>
              <span className="text-[10px] text-red-600 block mt-0.5">
                Full reset to start with a fresh blank slate
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
