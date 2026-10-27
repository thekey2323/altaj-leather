'use client';

import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  TrendingUp,
  DollarSign,
  Trash2,
  Edit,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { Expense } from '@/types/altaj';
import { formatCurrency, formatDate } from '@/lib/altaj/utils';

export function MarketingAdsView() {
  const { expenses, saveExpenseItem, deleteExpenseItem, models, settings, financials } = useAltaj();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'facebook' | 'tiktok' | 'instagram' | 'google'>('facebook');
  const [campaignName, setCampaignName] = useState('');
  const [targetModel, setTargetModel] = useState('All Models');
  const [amount, setAmount] = useState<number>(350);
  const [ordersGenerated, setOrdersGenerated] = useState<number>(5);
  const [adDate, setAdDate] = useState(new Date().toISOString().slice(0, 10));

  // Filter advertising expenses from store
  const adExpenses = useMemo(() => {
    return expenses.filter((e) => e.category === 'advertising');
  }, [expenses]);

  const totalAdSpend = useMemo(() => {
    return adExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [adExpenses]);

  // Delivered orders for CAC calculation
  const deliveredOrdersCount = financials.orderCount > 0 ? financials.orderCount : 1;
  const cacPub = totalAdSpend > 0 ? Math.round((totalAdSpend / deliveredOrdersCount) * 10) / 10 : 0;
  const roas = totalAdSpend > 0 ? Math.round((financials.totalRevenue / totalAdSpend) * 10) / 10 : 0;
  const adShareOfRevenue = financials.totalRevenue > 0 ? Math.round((totalAdSpend / financials.totalRevenue) * 100) : 0;

  const handleOpenNewModal = () => {
    setEditingExpenseId(null);
    setPlatform('facebook');
    setCampaignName('');
    setTargetModel('All Models');
    setAmount(350);
    setOrdersGenerated(5);
    setAdDate(new Date().toISOString().slice(0, 10));
    setShowAddModal(true);
  };

  const handleStartEdit = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setAmount(exp.amount);
    setAdDate(exp.date);

    // Detect platform
    const descLower = (exp.description || '').toLowerCase();
    if (descLower.includes('tiktok')) {
      setPlatform('tiktok');
    } else if (descLower.includes('instagram')) {
      setPlatform('instagram');
    } else if (descLower.includes('google')) {
      setPlatform('google');
    } else {
      setPlatform('facebook');
    }

    // Try extracting campaign name & target model
    // Format: "Facebook / Meta Ads — CampaignName (Model)"
    if (exp.description.includes('—')) {
      const parts = exp.description.split('—')[1]?.trim() || '';
      if (parts.includes('(') && parts.endsWith(')')) {
        const namePart = parts.substring(0, parts.lastIndexOf('(')).trim();
        const modelPart = parts.substring(parts.lastIndexOf('(') + 1, parts.length - 1).trim();
        setCampaignName(namePart);
        setTargetModel(modelPart || 'All Models');
      } else {
        setCampaignName(parts);
        setTargetModel('All Models');
      }
    } else {
      setCampaignName(exp.description);
      setTargetModel('All Models');
    }

    // Extract orders generated if noted
    if (exp.notes) {
      const match = exp.notes.match(/(\d+)/);
      if (match) {
        setOrdersGenerated(Number(match[1]));
      } else {
        setOrdersGenerated(5);
      }
    } else {
      setOrdersGenerated(5);
    }

    setShowAddModal(true);
  };

  const handleAddAdSpend = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const platformLabels: Record<string, string> = {
      facebook: 'Facebook / Meta Ads',
      tiktok: 'TikTok Ads',
      instagram: 'Instagram Sponsored',
      google: 'Google Ads',
    };

    saveExpenseItem({
      ...(editingExpenseId ? { id: editingExpenseId } : {}),
      date: adDate,
      category: 'advertising',
      description: `${platformLabels[platform]} — ${campaignName || 'Customer Acquisition Campaign'} (${targetModel})`,
      amount: Number(amount),
      paymentMethod: 'card',
      supplierRecipient: platformLabels[platform],
      notes: `${ordersGenerated} estimated sales generated`,
    });

    setEditingExpenseId(null);
    setCampaignName('');
    setAmount(350);
    setOrdersGenerated(5);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">

      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Customer Acquisition & E-commerce
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Automatically Deducted from Net Profit
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 mt-1">
            Marketing & Ads (Facebook & TikTok Ads)
          </h2>
          <p className="text-xs text-slate-500">
            Track advertising budgets, customer acquisition cost (CAC), and real bottom-line impact.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNewModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-2xl text-xs md:text-sm font-bold shadow-sm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Ad Spend</span>
        </button>
      </div>

      {/* 4 Focused Marketing KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Total Ad Spend */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Total Ad Budget
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl md:text-3xl font-black text-slate-900 font-mono">
            {formatCurrency(totalAdSpend, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Facebook & TikTok combined
          </div>
        </div>

        {/* 2. CAC Pub */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Cost Per Order (CAC)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl md:text-3xl font-black text-emerald-700 font-mono">
            {formatCurrency(cacPub, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Ad spend / delivered wallet
          </div>
        </div>

        {/* 3. ROAS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Overall ROAS
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl md:text-3xl font-black text-purple-700 font-mono">
            {roas > 0 ? `${roas}x` : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {roas >= 4 ? 'Highly profitable (>4x)' : 'Standard return'}
          </div>
        </div>

        {/* 4. Ad Share of Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Ad Share of Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl md:text-3xl font-black text-amber-800 font-mono">
            {adShareOfRevenue}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Recommended: 15% to 25%
          </div>
        </div>

      </div>

      {/* Net Profit Explanation */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700">
          <strong className="text-emerald-900 block font-bold mb-0.5">
            Automatic Deduction from Real Net Profit
          </strong>
          Every advertisement logged here is instantly factored into operational expenses. It directly reduces your <strong>Net Profit</strong> on the dashboard, giving you an honest, reliable picture of cash in hand.
        </div>
      </div>

      {/* Ad Campaigns Table */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Facebook & TikTok Ad Spend History
            </h3>
            <p className="text-xs text-slate-400">
              {adExpenses.length} campaign{adExpenses.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
        </div>

        {adExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Platform & Campaign</th>
                  <th className="py-2.5 px-3 text-right">Budget Spent</th>
                  <th className="py-2.5 px-3">Notes & Sales</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adExpenses.map((exp) => {
                  const isTikTok = exp.description.toLowerCase().includes('tiktok');
                  const isFB = exp.description.toLowerCase().includes('facebook') || exp.description.toLowerCase().includes('meta');

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isTikTok
                                ? 'bg-slate-900 text-white'
                                : isFB
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {isTikTok ? 'TikTok Ads' : isFB ? 'Facebook Ads' : 'Instagram'}
                          </span>
                          <span className="font-semibold text-slate-800">{exp.description}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-black font-mono text-slate-900 text-sm">
                        {formatCurrency(exp.amount, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {exp.notes || 'E-commerce acquisition'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(exp)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                            title="Edit ad campaign"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteExpenseItem(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete ad spend"
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
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl p-6">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-600">No ad spend recorded yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Log your Facebook or TikTok Ad spend to calculate customer acquisition costs and net profit.
            </p>
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              + Log Ad Spend
            </button>
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Ad Spend */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-850">
                    {editingExpenseId ? 'Edit Ad Spend' : 'Log Ad Spend'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingExpenseId ? 'Update budget, platform or sales impact' : 'Facebook & TikTok Ads'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingExpenseId(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdSpend} className="space-y-3.5 text-xs">
              {/* Platform */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ad Platform *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('facebook')}
                    className={`p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 transition-all ${
                      platform === 'facebook'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>🔵</span>
                    <span>Facebook / Meta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('tiktok')}
                    className={`p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 transition-all ${
                      platform === 'tiktok'
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>⚫</span>
                    <span>TikTok Ads</span>
                  </button>
                </div>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fez Workshop Video - Bifold Wallet"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-800"
                />
              </div>

              {/* Featured Model */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Featured Wallet Model
                </label>
                <select
                  value={targetModel}
                  onChange={(e) => setTargetModel(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 font-medium"
                >
                  <option value="All Models">All Wallets (General Brand)</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Orders */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Budget Spent ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Estimated Sales (units)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ordersGenerated}
                    onChange={(e) => setOrdersGenerated(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-900 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Spend Date
                </label>
                <input
                  type="date"
                  value={adDate}
                  onChange={(e) => setAdDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingExpenseId(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-xs hover:opacity-95"
                >
                  {editingExpenseId ? 'Save Changes' : 'Save & Deduct from Profit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
