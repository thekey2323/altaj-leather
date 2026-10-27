'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { X, Check, Crown, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export function UpgradeModal() {
  const {
    showUpgradeModal,
    setShowUpgradeModal,
    upgradeToPro,
    formatPrice,
    isRtl,
    t,
    user,
  } = useHeiba();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upgradedSuccess, setUpgradedSuccess] = useState(false);

  if (!showUpgradeModal) return null;

  // Pricing in base SAR
  // Monthly: 29 SAR (~$7.70)
  // Annual: 228 SAR (~$60/year or 19 SAR/mo - 35% savings)
  const monthlyPriceSAR = 29;
  const annualMonthlyEquivalentSAR = 19;
  const annualTotalSAR = 228;

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setUpgradedSuccess(true);
      upgradeToPro();

      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Non-fatal
      }

      setTimeout(() => {
        setUpgradedSuccess(false);
        setShowUpgradeModal(false);
      }, 1800);
    }, 1200);
  };

  const proFeatures = [
    isRtl ? 'استشارات غير محدودة مع المستشار الشخصي الذكي' : 'Unlimited consultations with AI Stylist',
    isRtl ? 'خزانة رقمية غير محدودة مع كشف تلقائي للقطع' : 'Unlimited digital wardrobe with auto-tagging',
    isRtl ? 'توليد لوكات ذكية فورية لجميع المناسبات' : 'Instant multi-occasion outfit generator',
    isRtl ? 'تحليل فوري وتقييم لصور إطلالاتك اليومية' : 'Full photo outfit analysis & fit review',
    isRtl ? 'تحديات الأناقة الأسبوعية وبناء عادات اللبس' : 'Weekly style challenges & habit builder',
    isRtl ? 'دليل التسوق الذكي وسد نواقص الخزانة' : 'Smart shopping assistant & wardrobe gap filler',
    isRtl ? 'أولوية في معالجة طلبات الذكاء الاصطناعي' : 'Priority high-speed AI processing',
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-fade-in"
      onClick={() => setShowUpgradeModal(false)}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-float border border-heiba-border max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-b from-heiba-lavender/60 via-white to-white border-b border-heiba-border text-center">
          <button
            onClick={() => setShowUpgradeModal(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 border border-heiba-border flex items-center justify-center text-heiba-secondary hover:text-heiba-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-heiba-accent text-white flex items-center justify-center mx-auto shadow-coral mb-3">
            <Crown className="w-6 h-6 fill-white" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {isRtl ? 'ترقية حصرية إلى' : 'Upgrade to'} HEIBA PRO
          </span>

          <h2 className="text-xl font-extrabold text-heiba-text">
            {isRtl ? 'مستشارك الشخصي الكامل في جيبك 24/7' : 'Your 24/7 Luxury Menswear Stylist'}
          </h2>
          <p className="text-xs text-heiba-secondary mt-1">
            {isRtl ? 'استثمر في هيبتك وثقتك كل صباح بدون تردد' : 'Step out every morning with effortless confidence'}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center mt-4 bg-heiba-bg p-1 rounded-2xl border border-heiba-border max-w-xs mx-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-heiba-text shadow-soft'
                  : 'text-heiba-secondary hover:text-heiba-text'
              }`}
            >
              {isRtl ? 'شهري' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-heiba-accent text-white shadow-coral'
                  : 'text-heiba-secondary hover:text-heiba-text'
              }`}
            >
              <span>{isRtl ? 'سنوي' : 'Annual'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${billingCycle === 'annual' ? 'bg-white text-heiba-accent' : 'bg-emerald-100 text-emerald-800'}`}>
                {isRtl ? 'وفّر 35%' : 'Save 35%'}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Display */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="bg-heiba-bg rounded-2xl p-4 border border-heiba-border text-center mb-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-extrabold text-heiba-text">
                {billingCycle === 'annual'
                  ? formatPrice(annualMonthlyEquivalentSAR)
                  : formatPrice(monthlyPriceSAR)}
              </span>
              <span className="text-xs text-heiba-secondary font-medium">
                {isRtl ? '/ شهرياً' : '/ month'}
              </span>
            </div>
            {billingCycle === 'annual' && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                {isRtl
                  ? `يُدفع ${formatPrice(annualTotalSAR)} سنوياً (أوفر بـ 35%)`
                  : `Billed as ${formatPrice(annualTotalSAR)} annually (Save 35%)`}
              </p>
            )}
          </div>

          {/* Feature List */}
          <div className="space-y-2.5 mb-6">
            <h4 className="text-xs font-bold text-heiba-secondary uppercase tracking-wider">
              {isRtl ? 'ما الذي تحصل عليه مع PRO:' : "What's included in PRO:"}
            </h4>
            {proFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-heiba-text">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Guarantee pill */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-heiba-secondary mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isRtl ? 'ضمان استرداد 14 يوماً بدون أي أسئلة' : '14-day risk-free money-back guarantee'}</span>
          </div>

          {/* CTA Button */}
          {upgradedSuccess ? (
            <div className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-center text-sm shadow-card flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              <span>{isRtl ? 'تم التفعيل بنجاح! مبروك هيبة PRO' : 'Activated! Welcome to HEIBA PRO'}</span>
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full py-3.5 bg-heiba-accent text-white rounded-2xl font-bold text-sm shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isProcessing ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>{isRtl ? 'جاري المعالجة وتفعيل الاشتراك...' : 'Processing activation...'}</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 fill-white" />
                  <span>{isRtl ? 'تأكيد الاشتراك وتفعيل PRO' : 'Confirm & Activate Pro'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
