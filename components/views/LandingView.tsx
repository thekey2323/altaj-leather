'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  ShieldCheck,
  ChevronDown,
  Crown,
  Shirt,
  Scan,
  Compass,
  Zap,
} from 'lucide-react';

export function LandingView() {
  const { isRtl, setCurrentView, t, formatPrice, setShowUpgradeModal } = useHeiba();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-heiba-bg text-heiba-text pb-28">
      {/* Hero Section */}
      <section className="pt-8 pb-12 px-4 max-w-md mx-auto text-center">
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-heiba-lavender text-purple-900 text-xs font-bold mb-4 shadow-soft">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>{t.landing.heroBadge}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl font-black text-heiba-text leading-tight tracking-tight mb-3">
          {isRtl ? (
            <>
              دع أسلوبك <span className="text-heiba-accent">يتحدث عنك</span>.
            </>
          ) : (
            <>
              Let your style <span className="text-heiba-accent">speak for you</span>.
            </>
          )}
        </h1>

        {/* Secondary Headline */}
        {isRtl && (
          <p className="text-sm font-semibold text-heiba-secondary mb-2">
            "دع حضورك يفرض هيبتك."
          </p>
        )}

        {/* Subheadline */}
        <p className="text-xs sm:text-sm text-heiba-secondary max-w-xs mx-auto leading-relaxed mb-6">
          {t.landing.featuresSub}
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col gap-2.5 max-w-xs mx-auto mb-8">
          <button
            onClick={() => setCurrentView('onboarding')}
            className="w-full py-3.5 px-6 rounded-2xl bg-heiba-accent text-white font-bold text-sm shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>{t.landing.ctaPrimary}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full py-3 px-6 rounded-2xl bg-white border border-heiba-border text-heiba-text font-semibold text-xs hover:bg-heiba-beige transition-all"
          >
            {t.landing.ctaSecondary}
          </button>
        </div>

        {/* Hero Visual: Premium Mobile Mockup Card */}
        <div className="relative mx-auto max-w-sm rounded-3xl p-3 bg-gradient-to-b from-white to-heiba-bg shadow-card border border-heiba-border text-left">
          <div className="relative rounded-2xl overflow-hidden bg-heiba-beige/30 border border-heiba-border">
            <img
              src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=80"
              alt="Stylish Male Look"
              className="w-full h-64 object-cover object-top"
            />
            {/* Live Stylist Badge */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-soft border border-heiba-border flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] font-bold text-heiba-text">
                {isRtl ? 'المستشار متصل 24/7' : 'Stylist Active 24/7'}
              </span>
            </div>

            {/* Float Outfit Card Overlay */}
            <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-float border border-heiba-border text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-heiba-text">
                  {t.landing.heroOutfitTitle}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  98% Match
                </span>
              </div>
              <p className="text-[11px] text-heiba-secondary leading-snug">
                {t.landing.heroStylistComment}
              </p>
              {/* Color Swatches */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#E6DCB8] border border-black/10"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#1B263B] border border-black/10"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFFFFF] border border-black/10"></span>
                <span className="text-[10px] text-heiba-secondary mr-1">
                  {isRtl ? 'ألوان متناسقة' : 'Harmonized'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-8 px-4 max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-6 border border-heiba-border shadow-soft text-center">
          <span className="text-xs font-bold text-heiba-accent uppercase tracking-wider block mb-1">
            {isRtl ? 'الفارق مع هيبة' : 'The HEIBA Advantage'}
          </span>
          <h2 className="text-xl font-extrabold text-heiba-text mb-2">
            {t.brand.valueProp}
          </h2>
          <p className="text-xs text-heiba-secondary leading-relaxed">
            {t.landing.featuresSub}
          </p>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-6 px-4 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-heiba-text">
            {t.landing.featuresHeading}
          </h2>
          <p className="text-xs text-heiba-secondary mt-1">
            {isRtl ? '6 ركائز تصنع ثقتك اليومية' : '6 pillars for effortless daily confidence'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {t.landing.features.map((f, i) => {
            const bgs = [
              'bg-heiba-peach text-amber-800',
              'bg-heiba-beige text-stone-800',
              'bg-heiba-blue text-blue-800',
              'bg-heiba-green text-emerald-800',
              'bg-heiba-lavender text-purple-800',
              'bg-heiba-accentLight text-heiba-accent',
            ];
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-heiba-border shadow-soft flex flex-col justify-between hover:border-heiba-borderHover transition-all"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs mb-3 ${bgs[i % bgs.length]}`}>
                  0{i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-heiba-text mb-1">{f.title}</h3>
                  <p className="text-[11px] text-heiba-secondary leading-snug">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works: 4 Steps */}
      <section className="py-8 px-4 max-w-md mx-auto">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-heiba-accent uppercase tracking-wider block mb-1">
            {isRtl ? 'بسيطة وسلسة' : 'Simple & Seamless'}
          </span>
          <h2 className="text-xl font-extrabold text-heiba-text">
            {t.landing.howItWorksHeading}
          </h2>
          <p className="text-xs text-heiba-secondary mt-1">
            {t.landing.howItWorksSub}
          </p>
        </div>

        <div className="space-y-3">
          {t.landing.steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-heiba-border shadow-soft flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-heiba-lavender text-purple-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <div>
                <h4 className="font-bold text-xs text-heiba-text mb-0.5">{step.title}</h4>
                <p className="text-[11px] text-heiba-secondary leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Testimonials (Clearly Labeled) */}
      <section className="py-8 px-4 max-w-md mx-auto">
        <div className="text-center mb-5">
          <span className="inline-block px-3 py-1 rounded-full bg-heiba-bg border border-heiba-border text-[10px] font-bold text-heiba-secondary mb-1">
            {t.landing.sampleTestimonialsBadge}
          </span>
          <h2 className="text-xl font-extrabold text-heiba-text">
            {isRtl ? 'ماذا يقول الشباب عن هيبة' : 'What Men Say About HEIBA'}
          </h2>
          <p className="text-[10px] text-heiba-secondary">
            {t.landing.sampleTestimonialsDisclaimer}
          </p>
        </div>

        <div className="space-y-3">
          {t.landing.testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-heiba-border shadow-soft"
            >
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-heiba-text italic mb-3 leading-relaxed">
                "{item.quote}"
              </p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-heiba-text">{item.name}</span>
                <span className="text-heiba-secondary">{item.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-8 px-4 max-w-md mx-auto">
        <div className="bg-gradient-to-b from-heiba-lavender/50 to-white rounded-3xl p-6 border border-heiba-border shadow-card text-center">
          <div className="w-10 h-10 rounded-2xl bg-heiba-accent text-white flex items-center justify-center mx-auto shadow-coral mb-2">
            <Crown className="w-5 h-5 fill-white" />
          </div>
          <h2 className="text-xl font-extrabold text-heiba-text mb-1">
            {t.landing.pricingHeading}
          </h2>
          <p className="text-xs text-heiba-secondary mb-4">
            {t.landing.pricingSub}
          </p>

          <div className="bg-white rounded-2xl p-4 border border-heiba-border shadow-soft text-center mb-4">
            <span className="text-xs font-bold text-heiba-accent uppercase tracking-wider block mb-1">
              HEIBA PRO
            </span>
            <div className="text-2xl font-black text-heiba-text mb-1">
              {formatPrice(19)}{' '}
              <span className="text-xs text-heiba-secondary font-medium">
                {isRtl ? '/ شهرياً' : '/ month'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              {isRtl ? 'استشارات وتحليلات غير محدودة' : 'Unlimited AI styling & photo reviews'}
            </p>
          </div>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full py-3 bg-heiba-accent text-white rounded-2xl font-bold text-xs shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all"
          >
            {isRtl ? 'عرض خطط الاشتراك' : 'Explore Pro Plans'}
          </button>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-6 px-4 max-w-md mx-auto">
        <div className="text-center mb-5">
          <h2 className="text-xl font-extrabold text-heiba-text">
            {t.landing.faqHeading}
          </h2>
        </div>

        <div className="space-y-2">
          {t.landing.faq.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-heiba-border overflow-hidden transition-all shadow-soft"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left gap-3"
                >
                  <span className="font-bold text-xs text-heiba-text">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-heiba-secondary shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-heiba-secondary leading-relaxed border-t border-heiba-border/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-8 border-t border-heiba-border px-4 max-w-md mx-auto text-center text-xs text-heiba-secondary space-y-3">
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-heiba-text">
          <button onClick={() => setCurrentView('privacy')} className="hover:text-heiba-accent">
            {isRtl ? 'سياسة الخصوصية والأمان' : 'Privacy & Trust'}
          </button>
          <span>•</span>
          <button onClick={() => setCurrentView('admin')} className="hover:text-heiba-accent">
            {isRtl ? 'لوحة الإدارة' : 'Admin'}
          </button>
          <span>•</span>
          <button onClick={() => setCurrentView('dashboard')} className="hover:text-heiba-accent">
            {isRtl ? 'لوحة التحكم' : 'Dashboard'}
          </button>
        </div>
        <p className="text-[11px]">
          © {new Date().getFullYear()} هيبة | HEIBA. {isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
        </p>
        <p className="text-[10px] text-heiba-secondary">
          {isRtl ? 'صُممت للشباب الأنيق في السعودية، مصر، المغرب، والعالم العربي.' : 'Crafted for modern men across Saudi Arabia, Egypt, Morocco, and MENA.'}
        </p>
      </footer>
    </div>
  );
}
