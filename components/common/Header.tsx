'use client';

import React from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { Sparkles, Globe, Crown, Shield, User, RotateCcw } from 'lucide-react';
import { Currency } from '@/types/heiba';

export function Header() {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    user,
    currentView,
    setCurrentView,
    setShowUpgradeModal,
    resetDemoData,
    isRtl,
  } = useHeiba();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const currencies: Currency[] = ['SAR', 'EGP', 'MAD', 'USD'];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-heiba-border">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <button
          onClick={() => setCurrentView(user.onboardingCompleted ? 'dashboard' : 'landing')}
          className="flex items-center gap-2 group text-left"
        >
          <div className="w-9 h-9 rounded-2xl bg-heiba-lavender flex items-center justify-center text-heiba-accent shadow-soft group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-heiba-accent" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight tracking-tight text-heiba-text flex items-center gap-1.5">
              <span>هيبة</span>
              <span className="text-xs text-heiba-secondary font-medium tracking-widest uppercase">
                | HEIBA
              </span>
            </div>
            <p className="text-[10px] text-heiba-secondary font-medium">
              {isRtl ? 'المستشار الشخصي للأناقة' : 'AI Personal Stylist'}
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Currency Switcher */}
          <select
            value={currency}
            aria-label={isRtl ? 'تغيير العملة' : 'Change currency'}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="text-xs font-semibold bg-heiba-bg border border-heiba-border text-heiba-text rounded-xl px-2 py-1 outline-none hover:border-heiba-borderHover transition-colors cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-heiba-bg hover:bg-heiba-beige border border-heiba-border text-heiba-text transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-heiba-secondary" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Pro Status or Upgrade Pill */}
          {user.isPro ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-heiba-lavender text-purple-800 text-xs font-bold rounded-xl">
              <Crown className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
              <span>PRO</span>
            </div>
          ) : (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-heiba-accent text-white text-xs font-bold rounded-xl shadow-coral hover:bg-heiba-accentHover transition-all"
            >
              <Crown className="w-3.5 h-3.5 fill-white" />
              <span>{isRtl ? 'ترقية' : 'Pro'}</span>
            </button>
          )}

          {/* Admin link shortcut */}
          <button
            onClick={() => setCurrentView(currentView === 'admin' ? 'dashboard' : 'admin')}
            className={`p-1.5 rounded-xl border border-heiba-border transition-colors ${
              currentView === 'admin' ? 'bg-heiba-lavender text-purple-700' : 'bg-heiba-bg text-heiba-secondary hover:text-heiba-text'
            }`}
            title="Admin Dashboard"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Profile Shortcut */}
          <button
            onClick={() => setCurrentView('profile')}
            className="w-8 h-8 rounded-full border border-heiba-border overflow-hidden focus:ring-2 focus:ring-heiba-accent/20 transition-all"
          >
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
