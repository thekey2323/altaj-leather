'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import {
  ShieldAlert,
  Users,
  DollarSign,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Settings,
  ArrowRight,
  ArrowLeft,
  Crown,
} from 'lucide-react';

export function AdminView() {
  const { isRtl, formatPrice, wardrobe, user, upgradeToPro, downgradeToFree } = useHeiba();

  // Representative live metrics
  const adminMetrics = {
    totalUsers: 2840,
    activeProSubscribers: 412,
    mrrSAR: 11948,
    aiQueriesThisMonth: 38920,
    topFeatures: [
      { name: isRtl ? 'المستشار الذكي (AI Chat)' : 'AI Stylist Chat', percent: 42 },
      { name: isRtl ? 'مولد اللوكات (Outfit Generator)' : 'Outfit Generator', percent: 28 },
      { name: isRtl ? 'محلل اللوك بالصورة (Mirror Review)' : 'Outfit Analyzer', percent: 18 },
      { name: isRtl ? 'الخزانة الرقمية (Wardrobe)' : 'Digital Wardrobe', percent: 12 },
    ],
  };

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-black text-heiba-text">
              {isRtl ? 'لوحة تحكم مالك المنتج' : 'Product Owner Dashboard'}
            </h1>
            <p className="text-[10px] text-heiba-secondary">
              {isRtl ? 'مؤشرات الأداء والاشتراكات لـ هيبة' : 'HEIBA platform KPIs & subscription metrics'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Users */}
        <div className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft">
          <div className="flex items-center justify-between text-heiba-secondary mb-2">
            <span className="text-[10px] font-bold uppercase">{isRtl ? 'المستخدمين' : 'Total Users'}</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-heiba-text">
            {adminMetrics.totalUsers.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">
            +18% {isRtl ? 'هذا الأسبوع' : 'this week'}
          </span>
        </div>

        {/* Pro Subscribers */}
        <div className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft">
          <div className="flex items-center justify-between text-heiba-secondary mb-2">
            <span className="text-[10px] font-bold uppercase">{isRtl ? 'مشتركي PRO' : 'Pro Subscribers'}</span>
            <Crown className="w-4 h-4 text-heiba-accent" />
          </div>
          <span className="text-2xl font-black text-heiba-text">
            {adminMetrics.activeProSubscribers}
          </span>
          <span className="text-[10px] text-purple-700 font-bold block mt-1">
            14.5% {isRtl ? 'نسبة التحويل' : 'conversion rate'}
          </span>
        </div>

        {/* MRR */}
        <div className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft">
          <div className="flex items-center justify-between text-heiba-secondary mb-2">
            <span className="text-[10px] font-bold uppercase">{isRtl ? 'الإيراد الشهري MRR' : 'Monthly MRR'}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-heiba-text">
            {formatPrice(adminMetrics.mrrSAR)}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">
            +24% MoM
          </span>
        </div>

        {/* AI Queries */}
        <div className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft">
          <div className="flex items-center justify-between text-heiba-secondary mb-2">
            <span className="text-[10px] font-bold uppercase">{isRtl ? 'استعلامات AI' : 'AI Queries'}</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-black text-heiba-text">
            {adminMetrics.aiQueriesThisMonth.toLocaleString()}
          </span>
          <span className="text-[10px] text-heiba-secondary block mt-1">
            Gemini 1.5 Flash
          </span>
        </div>
      </div>

      {/* Feature Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card space-y-3">
        <h3 className="font-extrabold text-xs text-heiba-text uppercase tracking-wider">
          {isRtl ? 'أكثر الميزات استخداماً' : 'Most Used Features'}
        </h3>

        <div className="space-y-2.5">
          {adminMetrics.topFeatures.map((feat, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-heiba-text">{feat.name}</span>
                <span className="font-bold text-heiba-secondary">{feat.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-heiba-bg overflow-hidden border border-heiba-border">
                <div
                  className="h-full bg-heiba-accent rounded-full"
                  style={{ width: `${feat.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Developer Controls */}
      <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-soft space-y-3">
        <h4 className="font-extrabold text-xs text-heiba-text uppercase tracking-wider">
          {isRtl ? 'التحكم السريع في حساب الاختبار' : 'Quick Developer Toggles'}
        </h4>

        <div className="flex items-center justify-between py-2 border-b border-heiba-border">
          <span className="text-xs text-heiba-text font-semibold">
            {isRtl ? 'تبديل حالة اشتراك PRO' : 'Toggle Pro Subscription'}
          </span>
          <button
            onClick={() => (user.isPro ? downgradeToFree() : upgradeToPro())}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              user.isPro ? 'bg-purple-100 text-purple-800' : 'bg-heiba-bg text-heiba-text border'
            }`}
          >
            {user.isPro ? 'PRO Active' : 'Free Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
