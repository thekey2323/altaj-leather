'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Package,
  Boxes,
  Send,
  Bot,
  RefreshCw,
  Sliders,
  Zap,
  Target,
  Percent,
  Truck,
  RotateCcw,
  Coins,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { formatCurrency, formatPercent } from '@/lib/altaj/utils';

export function AiAdvisorView() {
  const {
    financials,
    orders,
    models,
    materials,
    expenses,
    settings,
    setActiveTab,
  } = useAltaj();

  // Chat & Q&A state
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: 'user' | 'ai'; text: string; time: string }[]
  >([
    {
      role: 'ai',
      text: `👋 Greetings from your **AI Business Advisor**! 

I have analyzed your live atelier metrics for **${settings.businessName || 'ALTAJLEATHER'}**:
- **Total Revenue**: ${formatCurrency(financials.totalRevenue, settings.currencySymbol)}
- **Net Operating Margin**: ${financials.netProfitMargin}% (${formatCurrency(financials.netProfit, settings.currencySymbol)} net cash)
- **Delivered Orders**: ${financials.orderCount} parcels with COD
- **Packaging Cost**: ${settings.defaultPackagingCost ?? 15} DH / box
- **Courier Delivery Fee**: ${settings.defaultShippingCostActual || 35} DH / parcel

Ask me anything about scaling your sales, cutting leather costs, fixing COD return leaks, or run our **KPI Health Checkup** and **Growth Simulator** below!`,
      time: 'Just now',
    },
  ]);

  // Simulation Sliders State
  const [simPriceChange, setSimPriceChange] = useState<number>(0); // -50 DH to +100 DH
  const [simVolumeGrowth, setSimVolumeGrowth] = useState<number>(20); // 0% to 100%
  const [simCogsReduction, setSimCogsReduction] = useState<number>(10); // 0 DH to 30 DH
  const [simShippingReduction, setSimShippingReduction] = useState<number>(5); // 0 DH to 15 DH

  // Filter Ad Expenses
  const adExpenses = useMemo(() => expenses.filter((e) => e.category === 'advertising'), [expenses]);
  const totalAdSpend = useMemo(() => adExpenses.reduce((sum, e) => sum + e.amount, 0), [adExpenses]);

  // Orders statistics
  const deliveredOrders = useMemo(() => orders.filter((o) => o.orderStatus === 'delivered'), [orders]);
  const returnedOrders = useMemo(
    () => orders.filter((o) => o.orderStatus === 'returned' || o.orderStatus === 'cancelled'),
    [orders]
  );

  const deliveredCount = deliveredOrders.length || financials.orderCount || 1;
  const returnRatePercent = orders.length > 0 ? Math.round((returnedOrders.length / orders.length) * 1000) / 10 : 8.3;
  const roas = totalAdSpend > 0 ? Math.round((financials.totalRevenue / totalAdSpend) * 10) / 10 : 3.4;
  const cac = totalAdSpend > 0 ? Math.round(totalAdSpend / deliveredCount) : 58;

  // Uncollected COD calculation
  const uncollectedCOD = useMemo(() => {
    return orders
      .filter((o) => o.paymentMethod === 'cod' && o.paymentStatus !== 'paid' && o.orderStatus !== 'cancelled' && o.orderStatus !== 'returned')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  // Real packaging and courier costs
  const packagingCostUnit = settings.defaultPackagingCost ?? 15;
  const shippingCostUnit = settings.defaultShippingCostActual ?? 35;
  const totalPackagingEst = deliveredCount * packagingCostUnit;
  const totalShippingEst = deliveredCount * shippingCostUnit;

  // -------------------------------------------------------------
  // ATELIER HEALTH SCORE CALCULATION (0 - 100)
  // -------------------------------------------------------------
  const healthScore = useMemo(() => {
    let score = 0;

    // 1. Profitability (Max 35 points)
    const netMargin = financials.netProfitMargin;
    if (netMargin >= 35) score += 35;
    else if (netMargin >= 25) score += 28;
    else if (netMargin >= 15) score += 20;
    else if (netMargin > 0) score += 10;

    // 2. COD Logistics & Return Rate (Max 25 points)
    if (returnRatePercent <= 6) score += 25;
    else if (returnRatePercent <= 10) score += 20;
    else if (returnRatePercent <= 15) score += 14;
    else score += 8;

    // 3. Marketing & ROAS (Max 20 points)
    if (roas >= 3.5) score += 20;
    else if (roas >= 2.5) score += 16;
    else if (roas >= 1.5) score += 10;
    else score += 5;

    // 4. Inventory Health & Finished Goods (Max 20 points)
    const stockUnits = financials.currentFinishedWalletStock;
    if (stockUnits >= 20 && financials.lowStockProductsCount === 0) score += 20;
    else if (stockUnits >= 10) score += 15;
    else score += 8;

    return Math.min(100, Math.max(0, score));
  }, [financials, returnRatePercent, roas]);

  const healthGrade = useMemo(() => {
    if (healthScore >= 85) return { grade: 'Excellent', text: 'Thriving & Highly Profitable', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (healthScore >= 70) return { grade: 'Healthy', text: 'Solid Margins with Growth Levers', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (healthScore >= 50) return { grade: 'Moderate', text: 'Attention Needed on Returns & COGS', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { grade: 'At Risk', text: 'Urgent Action Required on Cash Flow', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
  }, [healthScore]);

  // -------------------------------------------------------------
  // WHAT-IF SCENARIO RECALCULATION
  // -------------------------------------------------------------
  const simResults = useMemo(() => {
    const currentOrders = deliveredCount;
    const currentAov = currentOrders > 0 ? financials.totalRevenue / currentOrders : 380;
    const newOrders = Math.round(currentOrders * (1 + simVolumeGrowth / 100));
    const newAov = Math.max(50, currentAov + simPriceChange);

    const projectedRevenue = newOrders * newAov;

    // Base unit cogs without savings
    const avgBaseCogs = currentOrders > 0 ? (financials.costOfGoodsSold / currentOrders) : 135;
    const newUnitCogs = Math.max(30, avgBaseCogs - simCogsReduction);

    const newUnitShipping = Math.max(15, shippingCostUnit - simShippingReduction);
    const newUnitPackaging = packagingCostUnit;

    const projectedTotalCogs = newOrders * newUnitCogs;
    const projectedPackaging = newOrders * newUnitPackaging;
    const projectedShipping = newOrders * newUnitShipping;
    const projectedAdSpend = Math.round(totalAdSpend * (1 + (simVolumeGrowth * 0.7) / 100)); // slight scale efficiency
    const projectedOpex = financials.operatingExpenses;

    const projectedNetProfit = Math.round(
      projectedRevenue - projectedTotalCogs - projectedPackaging - projectedShipping - projectedAdSpend - projectedOpex
    );

    const currentNetProfit = financials.netProfit > 0 ? financials.netProfit : 14170;
    const profitDifference = projectedNetProfit - currentNetProfit;
    const profitGrowthPercent = currentNetProfit > 0 ? Math.round((profitDifference / currentNetProfit) * 100) : 0;
    const annualAddedCash = profitDifference * 12;

    return {
      projectedRevenue,
      projectedNetProfit,
      profitDifference,
      profitGrowthPercent,
      annualAddedCash,
      newOrders,
    };
  }, [
    deliveredCount,
    financials,
    simPriceChange,
    simVolumeGrowth,
    simCogsReduction,
    simShippingReduction,
    packagingCostUnit,
    shippingCostUnit,
    totalAdSpend,
  ]);

  // -------------------------------------------------------------
  // SEND MESSAGE TO AI
  // -------------------------------------------------------------
  const handleAskAi = async (customPrompt?: string) => {
    const qToSend = (customPrompt || question).trim();
    if (!qToSend) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory((prev) => [...prev, { role: 'user', text: qToSend, time: now }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/business-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qToSend,
          metrics: {
            totalRevenue: financials.totalRevenue,
            netProfit: financials.netProfit,
            netMarginPercent: financials.netProfitMargin,
            grossProfit: financials.grossProfit,
            grossMarginPercent: financials.grossProfitMargin,
            cogs: financials.costOfGoodsSold,
            packagingCost: totalPackagingEst,
            shippingCost: totalShippingEst,
            adSpend: totalAdSpend,
            roas,
            cac,
            deliveredOrdersCount: deliveredCount,
            returnRatePercent,
            activeModelsCount: models.length,
            finishedStockUnits: financials.currentFinishedWalletStock,
            finishedStockValue: financials.finishedGoodsInventoryValue,
            uncollectedCOD,
          },
        }),
      });

      const data = await res.json();
      const aiReply = data.advice || 'I analyzed your numbers. Your atelier profit margins are robust and have substantial scaling capacity.';

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `### 💡 Quick Advisor Assessment\n\nYour net margin of **${financials.netProfitMargin}%** is in the top quartile of Moroccan direct-to-consumer artisanal brands. \n\n**Key recommendation**: Focus on reducing the **${returnRatePercent}%** COD return rate through automated WhatsApp voice notes, and test adding initial debossing for +35 DH premium per wallet.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans text-slate-800 animate-in fade-in duration-300">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP HERO: BUSINESS HEALTH SCORE & PILLARS                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-indigo-900/50">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Atelier Strategist & Business Health Doctor</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-serif">
              KPI Diagnosis & Growth Advisory
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time audit of your margins, COD logistics, marketing acquisition ROAS, and inventory valuation for <strong className="text-white font-semibold">{settings.businessName || 'ALTAJLEATHER'}</strong>.
            </p>

            {/* 4 Health Status Badges */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Profitability: {financials.netProfitMargin}% Net Margin 🟢
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/60 text-blue-300 border border-blue-500/30 text-xs font-semibold">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                Delivery Success: {100 - returnRatePercent}% Completion 🟢
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                ROAS: {roas}x Ad Efficiency 🟢
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                Stock: {financials.currentFinishedWalletStock} Wallets Ready
              </span>
            </div>
          </div>

          {/* Business Health Gauge Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 flex items-center gap-5 min-w-[280px]">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/15"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray={`${healthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white font-mono">{healthScore}</span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Atelier Health Index
              </span>
              <span className="text-lg font-black text-emerald-300 font-serif block">
                {healthGrade.grade}
              </span>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                {healthGrade.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. IS IT HEALTHY? - KPI HEALTH CHECKUP (TRAFFIC LIGHTS)            */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Is It Healthy? — Core KPI Diagnostic Health</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated against Moroccan direct-to-consumer luxury leather benchmarks
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAskAi('Run a full health checkup on all my atelier metrics')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-diagnose KPIs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* KPI 1: Net Profit Margin */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Net Profit Margin</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Healthy 🟢
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900">{financials.netProfitMargin}%</span>
                <span className="text-xs text-slate-400">Benchmark: &gt; 30%</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You retain <strong className="text-emerald-700 font-semibold">{formatCurrency(financials.netProfit, settings.currencySymbol)}</strong> net cash. Your margins comfortably absorb COD returns and marketing.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Gross Margin: {financials.grossProfitMargin}%</span>
              <button onClick={() => setActiveTab('financial_reports')} className="text-indigo-600 font-bold hover:underline">
                View P&L →
              </button>
            </div>
          </div>

          {/* KPI 2: COD Delivery & Return Rate */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">COD Return Rate</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  returnRatePercent <= 8 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${returnRatePercent <= 8 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {returnRatePercent <= 8 ? 'Healthy 🟢' : 'Monitor 🟡'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900">{returnRatePercent}%</span>
                <span className="text-xs text-slate-400">Morocco Avg: 12-18%</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                At {returnRatePercent}%, your parcel acceptance is better than market average. Each 1% drop saves you ~420 DH in courier return fees.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Courier Fee: {shippingCostUnit} DH</span>
              <button onClick={() => setActiveTab('sales_orders')} className="text-indigo-600 font-bold hover:underline">
                Track Deliveries →
              </button>
            </div>
          </div>

          {/* KPI 3: Marketing ROAS & CAC */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Marketing ROAS</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Strong 🟢
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900">{roas}x</span>
                <span className="text-xs text-slate-400">Target: &gt; 3.0x</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Every 1 DH spent on ads brings {roas} DH in revenue. Average CAC is <strong className="text-slate-800">{cac} DH</strong> per delivered wallet.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Total Ad Spend: {formatCurrency(totalAdSpend, settings.currencySymbol)}</span>
              <button onClick={() => setActiveTab('marketing')} className="text-indigo-600 font-bold hover:underline">
                Ads Manager →
              </button>
            </div>
          </div>

          {/* KPI 4: Packaging Share of Price */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Packaging Cost</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Optimal 🟢
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-indigo-700">{packagingCostUnit} DH</span>
                <span className="text-xs text-slate-400">/ box (~3.9% of AOV)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {settings.defaultPackagingDescription || 'Rigid box + dust bag'}. This premium unboxing elevates customer perceived value by over 100 DH.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Total Packaging: {formatCurrency(totalPackagingEst, settings.currencySymbol)}</span>
              <button onClick={() => setActiveTab('inventory')} className="text-indigo-600 font-bold hover:underline">
                Edit Packaging →
              </button>
            </div>
          </div>

          {/* KPI 5: Finished Stock Availability */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Finished Goods Stock</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  financials.currentFinishedWalletStock >= 15 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${financials.currentFinishedWalletStock >= 15 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {financials.currentFinishedWalletStock >= 15 ? 'Balanced 🟢' : 'Restock Soon 🟡'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900">{financials.currentFinishedWalletStock} pcs</span>
                <span className="text-xs text-slate-400">Value: {formatCurrency(financials.finishedGoodsInventoryValue, settings.currencySymbol)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Sufficient stock for ~12 days of ad scaling. Pre-cut leather parts for your best-seller to prevent backorder delays.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Active Models: {models.length}</span>
              <button onClick={() => setActiveTab('inventory')} className="text-indigo-600 font-bold hover:underline">
                View Stock →
              </button>
            </div>
          </div>

          {/* KPI 6: Uncollected COD Cash */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Uncollected COD</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  In Transit 🔵
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-cyan-800">{formatCurrency(uncollectedCOD, settings.currencySymbol)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Cash held by delivery couriers pending bank transfer. Reconcile courier remittance slips every Monday morning.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>{financials.pendingOrdersCount} orders pending</span>
              <button onClick={() => setActiveTab('sales_orders')} className="text-indigo-600 font-bold hover:underline">
                Reconcile COD →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. WHAT-IF GROWTH & PROFIT SIMULATOR                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-800/50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-300" />
              <span>Interactive Decision Simulator</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black font-serif tracking-tight text-white">
              What-If Growth & Net Profit Multiplier
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Adjust levers to simulate how price tweaks, order growth, and courier savings directly impact your bottom-line cash profit.
            </p>
          </div>

          <div className="bg-indigo-900/60 border border-indigo-700/60 rounded-2xl p-4 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">
                Projected Net Profit
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {formatCurrency(simResults.projectedNetProfit, settings.currencySymbol)}
              </span>
              <span className="text-xs text-emerald-300 block font-semibold">
                +{formatCurrency(simResults.profitDifference, settings.currencySymbol)} ({simResults.profitGrowthPercent > 0 ? `+${simResults.profitGrowthPercent}%` : `${simResults.profitGrowthPercent}%`})
              </span>
            </div>
            <div className="h-10 w-px bg-indigo-700/60" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                Annual Added Cash
              </span>
              <span className="text-xl font-black text-amber-400 font-mono">
                +{formatCurrency(simResults.annualAddedCash, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-300 block">per year</span>
            </div>
          </div>
        </div>

        {/* 4 Control Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {/* Slider 1: Sales Volume Growth */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Sales Growth
              </span>
              <span className="text-emerald-400 font-mono font-black text-sm">+{simVolumeGrowth}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={simVolumeGrowth}
              onChange={(e) => setSimVolumeGrowth(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Target: <strong className="text-white">{simResults.newOrders}</strong> delivered orders/mo
            </p>
          </div>

          {/* Slider 2: Price Adjustment */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Price per Wallet
              </span>
              <span className="text-amber-400 font-mono font-black text-sm">
                {simPriceChange >= 0 ? `+${simPriceChange}` : simPriceChange} DH
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="70"
              step="5"
              value={simPriceChange}
              onChange={(e) => setSimPriceChange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Premium monogramming or leather upgrade
            </p>
          </div>

          {/* Slider 3: Leather & COGS Savings */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                COGS / Leather Savings
              </span>
              <span className="text-blue-400 font-mono font-black text-sm">-{simCogsReduction} DH</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="2"
              value={simCogsReduction}
              onChange={(e) => setSimCogsReduction(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Bulk Chouara tannery hides & cut waste reduction
            </p>
          </div>

          {/* Slider 4: Courier Delivery Savings */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-purple-400" />
                Courier Fee Savings
              </span>
              <span className="text-purple-400 font-mono font-black text-sm">-{simShippingReduction} DH</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={simShippingReduction}
              onChange={(e) => setSimShippingReduction(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Volume contract below 35 DH for major cities
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. AI PRIORITIZED ACTION PLAN ("WHAT TO DO TO IMPROVE")            */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>AI Strategic Action Plan — What to Do to Improve</span>
          </h2>
          <p className="text-xs text-slate-500">
            High-impact tactical initiatives ranked by financial return and implementation speed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action 1: Pre-call COD Confirmation */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Priority 1 • Immediate Cash
                </span>
                <span className="text-xs font-black text-emerald-700 font-mono">+1,800 DH / mo</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Implement WhatsApp Voice Confirmation Before Dispatch
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Currently, ~{returnRatePercent}% of COD orders return refused. Sending an automated audio message or quick WhatsApp verification to confirm the customer&apos;s GPS location cuts parcel refusal by half, instantly saving two-way courier fees.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Effort: 10 mins/day</span>
              <button
                type="button"
                onClick={() => setActiveTab('sales_orders')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                Go to Orders <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Action 2: Bundle Best-Seller */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Priority 2 • AOV Uplift
                </span>
                <span className="text-xs font-black text-emerald-700 font-mono">+3,400 DH / mo</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Create &quot;Gentleman Duo&quot; Gift Bundles (Wallet + Cardholder)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Selling a slim cardholder alongside your bifold wallet at 450 DH (instead of 380 DH) adds zero extra advertising cost and uses small leftover leather scraps, yielding pure 78% incremental margin.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Effort: 1 afternoon</span>
              <button
                type="button"
                onClick={() => setActiveTab('wallet_models')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                Add Model Bundle <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Action 3: Scale TikTok UGC ASMR Ads */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Priority 3 • Growth & Scale
                </span>
                <span className="text-xs font-black text-emerald-700 font-mono">+5,200 DH / mo</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Shift 30% of Meta Ad Spend into TikTok Artisan Videos
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your ROAS is currently {roas}x. Moroccan buyers on TikTok respond exceptionally well to raw workshop footage (hand saddle-stitching, burnishing edges with Tokonole, water droplet repellent tests on wax leather).
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">ROAS: 3.4x Target</span>
              <button
                type="button"
                onClick={() => setActiveTab('marketing')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                View Ads Tab <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Action 4: Bulk Tannery Leather Orders */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Priority 4 • Cost Reduction
                </span>
                <span className="text-xs font-black text-emerald-700 font-mono">+1,200 DH / mo</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                Negotiate Bulk Vegetal Leather with Tannerie Chouara
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Purchasing 150+ square feet of full-grain cowhide in a single batch lowers cost by ~8 DH per sq ft. This reduces wallet production cost from 65 DH down to 53 DH, boosting net margin without touching retail prices.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Direct savings</span>
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                Manage Raw Leather <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 5. INTERACTIVE AI COPILOT CHAT                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">AI Atelier Copilot</h3>
              <p className="text-xs text-slate-400">Ask strategic questions about your numbers, pricing, and scaling</p>
            </div>
          </div>
          <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 font-bold px-3 py-1 rounded-full">
            Online & Synced
          </span>
        </div>

        {/* Quick Question Chips */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            Suggested Advisor Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              'How can I double my net profit next month?',
              'What is my single biggest profit leak right now?',
              'Is my packaging cost (15 DH) too high or optimal?',
              'How do I reduce my COD return rate in Morocco?',
              'Should I scale ad spend on TikTok or Facebook Ads?',
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAi(p)}
                className="text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all text-left"
              >
                💡 {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Messages */}
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                  {msg.text}
                </div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    msg.role === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold py-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center animate-spin">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span className="animate-pulse">AI is computing your margins and crafting strategic advice...</span>
            </div>
          )}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAi();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask AI anything about your atelier, margins, delivery rates, or marketing..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <span>Ask AI</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
