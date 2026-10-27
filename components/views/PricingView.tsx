'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { Crown, Check, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';

export function PricingView() {
  const { isRtl, t, formatPrice, setShowUpgradeModal, user } = useHeiba();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const monthlyPriceSAR = 29;
  const annualMonthlyEquivalentSAR = 19;
  const annualTotalSAR = 228;

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="pt-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-heiba-accent text-white flex items-center justify-center mx-auto shadow-coral mb-3">
          <Crown className="w-6 h-6 fill-white" />
        </div>
        <h1 className="text-2xl font-black text-heiba-text">
          {t.pricing.title}
        </h1>
        <p className="text-xs text-heiba-secondary mt-1">
          {t.pricing.subtitle}
        </p>

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center mt-4 bg-white p-1 rounded-2xl border border-heiba-border max-w-xs mx-auto shadow-soft">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-heiba-text text-white shadow-soft'
                : 'text-heiba-secondary'
            }`}
          >
            {t.pricing.monthly}
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              billingCycle === 'annual'
                ? 'bg-heiba-accent text-white shadow-coral'
                : 'text-heiba-secondary'
            }`}
          >
            <span>{t.pricing.annual}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${billingCycle === 'annual' ? 'bg-white text-heiba-accent' : 'bg-emerald-100 text-emerald-800'}`}>
              {t.pricing.saveBadge}
            </span>
          </button>
        </div>
      </div>

      {/* Free vs Pro Comparison Cards */}
      <div className="space-y-4">
        {/* HEIBA PRO Tier */}
        <div className="bg-gradient-to-b from-white to-heiba-lavender/30 rounded-3xl p-5 border-2 border-heiba-accent shadow-card relative">
          <div className="absolute -top-3 right-6 bg-heiba-accent text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold shadow-soft">
            {t.pricing.proTier.badge}
          </div>

          <div className="mb-4">
            <h3 className="font-black text-base text-heiba-text">
              {t.pricing.proTier.name}
            </h3>
            <p className="text-xs text-heiba-secondary mt-0.5">
              {t.pricing.proTier.desc}
            </p>

            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-3xl font-black text-heiba-text">
                {billingCycle === 'annual'
                  ? formatPrice(annualMonthlyEquivalentSAR)
                  : formatPrice(monthlyPriceSAR)}
              </span>
              <span className="text-xs text-heiba-secondary font-medium">
                {isRtl ? '/ شهرياً' : '/ month'}
              </span>
            </div>
            {billingCycle === 'annual' && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                {isRtl
                  ? `يُدفع ${formatPrice(annualTotalSAR)} سنوياً (وفّر 35%)`
                  : `Billed annually at ${formatPrice(annualTotalSAR)} (Save 35%)`}
              </p>
            )}
          </div>

          <div className="space-y-2.5 mb-5">
            {t.pricing.proTier.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-heiba-text">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full py-3.5 bg-heiba-accent text-white rounded-2xl font-bold text-xs shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4 fill-white" />
            <span>{t.pricing.proTier.cta}</span>
          </button>
        </div>

        {/* Free Tier */}
        <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-soft">
          <div className="mb-3">
            <h3 className="font-extrabold text-sm text-heiba-text">
              {t.pricing.freeTier.name}
            </h3>
            <p className="text-xs text-heiba-secondary mt-0.5">
              {t.pricing.freeTier.desc}
            </p>
            <div className="text-xl font-bold text-heiba-text mt-2">
              {formatPrice(0)}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {t.pricing.freeTier.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-heiba-secondary">
                <div className="w-4 h-4 rounded-full bg-heiba-bg text-heiba-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="w-full py-2.5 bg-heiba-bg text-heiba-secondary rounded-xl text-center text-xs font-semibold">
            {t.pricing.freeTier.cta}
          </div>
        </div>
      </div>
    </div>
  );
}
