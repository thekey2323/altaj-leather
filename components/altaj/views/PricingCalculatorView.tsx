'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Scissors,
  Clock,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { calculateWalletPricing } from '@/lib/altaj/pricingCalculator';
import { PricingCalculatorInputs, MaterialUnit } from '@/types/altaj';
import { formatCurrency, formatPercent } from '@/lib/altaj/utils';

export function PricingCalculatorView() {
  const { settings, openQuickActionModal } = useAltaj();

  // Calculator inputs state with realistic artisan defaults
  const [inputs, setInputs] = useState<PricingCalculatorInputs>({
    leatherAreaRequired: 0.85,
    leatherUnit: 'sq_ft',
    leatherPurchasePricePerUnit: 45, // 45 DH / sq ft
    leatherWastePercent: 15, // 15% waste scrap
    threadCost: 1.5,
    hardwareCost: 4.5,
    edgeFinishingCost: 4.0,
    packagingCost: 13.7,
    productionTimeMinutes: 110, // ~1.83 hours
    hourlyLaborRate: settings.defaultLaborRatePerHour || 55,
    otherDirectCosts: 5.0,
    variableSellingFeePercent: 0,
    shippingSubsidy: 15, // Actual shipping (35 DH) - customer charged (20 DH) = 15 DH subsidy
    targetProfitMarginPercent: 55,
    desiredSellingPrice: 380,
  });

  const outputs = useMemo(() => {
    return calculateWalletPricing(inputs);
  }, [inputs]);

  const updateInput = <K extends keyof PricingCalculatorInputs>(
    key: K,
    val: PricingCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-serif font-bold text-xl md:text-2xl text-charcoal-900 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-sage-500" />
          Artisan Pricing Simulator & Cost Calculator
        </h2>
        <p className="text-xs md:text-sm text-charcoal-500 mt-1">
          Calculate retail pricing with mathematical rigor based on leather area, scrap waste rate, craftsperson bench time, and your target margin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Inputs Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-cream-300 shadow-xs p-6 space-y-6">
          {/* Section 1: Leather & Raw Materials */}
          <div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900 flex items-center gap-2 border-b border-cream-200 pb-2">
              <Scissors className="w-4 h-4 text-terracotta-500" />
              1. Leather & Raw Materials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Net Leather Area</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    value={inputs.leatherAreaRequired}
                    onChange={(e) => updateInput('leatherAreaRequired', Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-medium"
                  />
                  <select
                    value={inputs.leatherUnit}
                    onChange={(e) => updateInput('leatherUnit', e.target.value as MaterialUnit)}
                    className="p-2 border border-cream-300 rounded-xl bg-cream-50 text-charcoal-700 outline-none"
                  >
                    <option value="sq_ft">sq ft</option>
                    <option value="sq_dm">sq dm</option>
                    <option value="sq_m">sq m</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Leather Purchase Price ({settings.currencySymbol}/unit)
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.leatherPurchasePricePerUnit}
                  onChange={(e) => updateInput('leatherPurchasePricePerUnit', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-medium"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Cutting Scrap / Waste (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.leatherWastePercent}
                  onChange={(e) => updateInput('leatherWastePercent', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-medium"
                />
              </div>
            </div>

            {/* Other materials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Waxed Thread ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.threadCost}
                  onChange={(e) => updateInput('threadCost', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Hardware / Zipper</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.hardwareCost}
                  onChange={(e) => updateInput('hardwareCost', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Edge Finishing (Tokonole)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.edgeFinishingCost}
                  onChange={(e) => updateInput('edgeFinishingCost', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Luxury Box & Dust Bag</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.packagingCost}
                  onChange={(e) => updateInput('packagingCost', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Labor & Overhead */}
          <div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900 flex items-center gap-2 border-b border-cream-200 pb-2">
              <Clock className="w-4 h-4 text-lavender-500" />
              2. Handcrafting & Artisan Bench Labor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Crafting Time (minutes)
                </label>
                <input
                  type="number"
                  step="5"
                  value={inputs.productionTimeMinutes}
                  onChange={(e) => updateInput('productionTimeMinutes', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-medium"
                />
                <span className="text-[10px] text-charcoal-400 block mt-0.5">
                  = {(inputs.productionTimeMinutes / 60).toFixed(2)} hours
                </span>
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Hourly Wage Rate ({settings.currencySymbol}/h)
                </label>
                <input
                  type="number"
                  step="5"
                  value={inputs.hourlyLaborRate}
                  onChange={(e) => updateInput('hourlyLaborRate', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-medium"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Other Workshop Direct Costs
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.otherDirectCosts}
                  onChange={(e) => updateInput('otherDirectCosts', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Distribution, Selling Fees & Targets */}
          <div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900 flex items-center gap-2 border-b border-cream-200 pb-2">
              <TrendingUp className="w-4 h-4 text-sage-500" />
              3. Selling Fees, Shipping & Margin Target
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Selling Fee / Commission (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.variableSellingFeePercent}
                  onChange={(e) => updateInput('variableSellingFeePercent', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Shipping Subsidy Absorbed ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.shippingSubsidy}
                  onChange={(e) => updateInput('shippingSubsidy', Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
                />
                <span className="text-[10px] text-charcoal-400 block mt-0.5">
                  Actual courier fee − billed to customer
                </span>
              </div>

              <div>
                <label className="font-semibold text-sage-700 block mb-1">
                  Target Gross Margin (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.targetProfitMarginPercent}
                  onChange={(e) => updateInput('targetProfitMarginPercent', Number(e.target.value))}
                  className="w-full p-2 border border-sage-300 bg-sage-50/50 rounded-xl outline-none font-bold text-sage-800"
                />
              </div>
            </div>

            {/* Desired selling price check */}
            <div className="mt-4 pt-4 border-t border-cream-200">
              <label className="text-xs font-semibold text-charcoal-800 block mb-1">
                Or test a Target Selling Price ({settings.currencySymbol}):
              </label>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="number"
                  step="10"
                  value={inputs.desiredSellingPrice || ''}
                  onChange={(e) => updateInput('desiredSellingPrice', Number(e.target.value))}
                  placeholder="e.g. 380 DH"
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif font-bold text-sm text-charcoal-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Mathematical Outputs & Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Pricing Recommendation Card */}
          <div className="bg-gradient-to-br from-ivory-100 to-cream-100 rounded-3xl border border-cream-300 shadow-soft p-6 space-y-5">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-charcoal-500 block">
                Suggested Selling Price (Target Margin)
              </span>
              <div className="text-3xl md:text-4xl font-serif font-bold text-charcoal-900 mt-1">
                {formatCurrency(outputs.suggestedSellingPrice, settings.currencySymbol)}
              </div>
              <p className="text-xs text-charcoal-500 mt-1">
                Formula: Unit Fixed Costs ÷ (1 − Margin − Fee)
              </p>
            </div>

            {/* Infeasible margin warning */}
            {!outputs.isMarginFeasible && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{outputs.errorMessage}</span>
              </div>
            )}

            {/* Breakdown of costs */}
            <div className="space-y-2 text-xs border-t border-cream-200 pt-4">
              <div className="flex justify-between text-charcoal-600">
                <span>Total Material Cost (with {inputs.leatherWastePercent}% scrap):</span>
                <strong className="text-charcoal-900 font-serif">
                  {formatCurrency(outputs.totalMaterialCost, settings.currencySymbol)}
                </strong>
              </div>

              <div className="flex justify-between text-charcoal-600">
                <span>Labor ({inputs.productionTimeMinutes} min):</span>
                <strong className="text-charcoal-900 font-serif">
                  {formatCurrency(outputs.directLaborCost, settings.currencySymbol)}
                </strong>
              </div>

              <div className="flex justify-between text-charcoal-600">
                <span>Shipping Subsidy Absorbed:</span>
                <strong className="text-charcoal-900 font-serif">
                  {formatCurrency(outputs.shippingSubsidy, settings.currencySymbol)}
                </strong>
              </div>

              <div className="flex justify-between font-semibold text-charcoal-800 pt-1 border-t border-cream-200">
                <span>Total Unit Cost of Production:</span>
                <strong className="text-charcoal-900 font-serif text-sm">
                  {formatCurrency(outputs.totalProductionCost, settings.currencySymbol)}
                </strong>
              </div>

              <div className="flex justify-between text-sage-700 font-bold pt-1">
                <span>Gross Profit per Wallet:</span>
                <strong className="font-serif text-sm">
                  +{formatCurrency(outputs.grossProfitAtSuggested, settings.currencySymbol)}
                </strong>
              </div>

              <div className="flex justify-between text-sage-700 font-bold">
                <span>Realized Gross Margin:</span>
                <strong className="text-sm">
                  {outputs.grossMarginAtSuggestedPercent.toFixed(1)}%
                </strong>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => openQuickActionModal('add_model')}
              className="w-full py-2.5 bg-sage-400 hover:bg-sage-500 text-white rounded-xl text-xs font-semibold shadow-soft transition-all"
            >
              Save as New Catalog Model
            </button>
          </div>

          {/* Desired Price Analysis (if set) */}
          {outputs.desiredPriceAnalysis && (
            <div className="bg-white rounded-3xl border border-cream-300 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-charcoal-900">
                  Analysis of Test Price: {formatCurrency(outputs.desiredPriceAnalysis.sellingPrice, settings.currencySymbol)}
                </h4>
                {outputs.desiredPriceAnalysis.isProfitable ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-sage-700">
                    Profitable
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                    Selling at a Loss!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200">
                  <span className="text-[10px] text-charcoal-500 block">Net Profit</span>
                  <strong className={`font-serif text-sm font-bold ${outputs.desiredPriceAnalysis.grossProfit > 0 ? 'text-sage-700' : 'text-red-600'}`}>
                    {formatCurrency(outputs.desiredPriceAnalysis.grossProfit, settings.currencySymbol)}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200">
                  <span className="text-[10px] text-charcoal-500 block">Gross Margin</span>
                  <strong className="text-sm font-bold text-charcoal-900">
                    {outputs.desiredPriceAnalysis.grossMarginPercent.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
