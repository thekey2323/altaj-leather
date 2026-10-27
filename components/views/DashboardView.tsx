'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import {
  Sparkles,
  Shirt,
  Wand2,
  Scan,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Crown,
  Heart,
  RotateCw,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { SAMPLE_OUTFITS } from '@/lib/mock-data';

export function DashboardView() {
  const {
    user,
    isRtl,
    t,
    setCurrentView,
    setShowUpgradeModal,
    wardrobeInsights,
    savedOutfits,
    saveOutfit,
    isOutfitSaved,
    challenges,
  } = useHeiba();

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Available looks (from saved or sample)
  const availableLooks = savedOutfits.length > 0 ? savedOutfits : SAMPLE_OUTFITS;
  const [dailyLookIndex, setDailyLookIndex] = useState(0);
  const currentDailyLook = availableLooks.length > 0 ? availableLooks[dailyLookIndex % availableLooks.length] : null;

  const handleSwapLook = () => {
    if (availableLooks.length > 0) {
      setDailyLookIndex((prev) => (prev + 1) % availableLooks.length);
    }
  };

  const activeChallenge = challenges && challenges.length > 0 ? challenges[0] : null;
  const firstName = user.name?.trim() ? user.name.split(' ')[0] : (isRtl ? 'بك' : 'there');

  return (
    <div className="min-h-screen bg-heiba-bg text-heiba-text p-4 pb-28 max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Personalized Greeting Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-heiba-text flex items-center gap-1.5">
            <span>{t.dashboard.greeting}،</span>
            <span className="text-heiba-accent">{firstName}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-heiba-secondary font-medium">
            {t.dashboard.greetingSub}
          </p>
        </div>

        {/* Style Identity Pill */}
        <button
          onClick={() => setCurrentView('profile')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-heiba-peach border border-heiba-peachDark text-amber-900 text-xs font-bold shadow-soft hover:scale-102 transition-transform"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="truncate max-w-[110px]">
            {isRtl ? user.styleIdentity?.nameAr || 'الفخامة الهادئة' : user.styleIdentity?.name || 'Quiet Luxury'}
          </span>
        </button>
      </div>

      {/* Free User Upgrade Banner */}
      {!user.isPro && (
        <div className="relative rounded-3xl p-4 bg-gradient-to-r from-heiba-lavender via-white to-heiba-peach border border-heiba-border shadow-soft flex items-center justify-between overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-0.5">
              <Crown className="w-3.5 h-3.5 text-heiba-accent fill-heiba-accent" />
              <span>{t.dashboard.upgradeBannerTitle}</span>
            </div>
            <p className="text-[11px] text-heiba-secondary max-w-[200px] leading-snug">
              {t.dashboard.upgradeBannerSub}
            </p>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="relative z-10 px-3.5 py-2 rounded-xl bg-heiba-accent text-white text-xs font-bold shadow-coral hover:bg-heiba-accentHover shrink-0 transition-all"
          >
            {isRtl ? 'ترقية الآن' : 'Upgrade'}
          </button>
        </div>
      )}

      {/* Today's Look Hero Card */}
      {currentDailyLook ? (
        <div className="bg-white rounded-3xl p-4 border border-heiba-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-heiba-text uppercase tracking-wider">
                {t.dashboard.todaysLook}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-heiba-blue text-blue-800">
              {t.occasions[currentDailyLook.occasion] || 'Smart Casual'}
            </span>
          </div>

          {/* Outfit Image & Details */}
          <div className="relative rounded-2xl overflow-hidden mb-3.5 bg-stone-100 h-64 border border-heiba-border">
            <img
              src={currentDailyLook.imageUrl}
              alt={currentDailyLook.title}
              className="w-full h-full object-cover object-top"
            />

            {/* Swatches Overlay */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-soft flex items-center gap-1.5 border border-heiba-border">
              {currentDailyLook.colorPalette.map((c, i) => (
                <span
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                ></span>
              ))}
            </div>

            {/* Title & Style Tag Banner */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
              <h3 className="font-extrabold text-sm leading-snug">
                {isRtl ? currentDailyLook.titleAr : currentDailyLook.title}
              </h3>
              <p className="text-[11px] text-white/90 line-clamp-1 mt-0.5">
                {isRtl ? currentDailyLook.whyItWorksAr : currentDailyLook.whyItWorks}
              </p>
            </div>
          </div>

          {/* Coordinated Pieces Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {currentDailyLook.pieces.map((p, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-heiba-bg border border-heiba-border text-heiba-text font-medium flex items-center gap-1"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.colorHex }}
                ></span>
                <span>{isRtl ? p.nameAr : p.name}</span>
              </span>
            ))}
          </div>

          {/* Action Buttons: View Look & Swap Look */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('generator')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-heiba-text text-white text-xs font-bold hover:bg-heiba-accent transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.dashboard.viewLook}</span>
            </button>
            <button
              onClick={handleSwapLook}
              className="py-2.5 px-3 rounded-xl bg-heiba-bg border border-heiba-border text-heiba-text text-xs font-semibold hover:bg-heiba-beige transition-colors flex items-center gap-1.5"
              title="Swap look"
            >
              <RotateCw className="w-3.5 h-3.5 text-heiba-secondary" />
              <span>{t.dashboard.changeLook}</span>
            </button>
            <button
              onClick={() => saveOutfit(currentDailyLook)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isOutfitSaved(currentDailyLook.id)
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-heiba-bg border-heiba-border text-heiba-secondary hover:text-rose-600'
              }`}
              title="Save look"
            >
              <Heart
                className={`w-4 h-4 ${
                  isOutfitSaved(currentDailyLook.id) ? 'fill-rose-500' : ''
                }`}
              />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-heiba-border shadow-card text-center space-y-3.5">
          <div className="w-12 h-12 rounded-2xl bg-heiba-lavender text-purple-700 flex items-center justify-center mx-auto shadow-soft">
            <Sparkles className="w-6 h-6 text-heiba-accent" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-heiba-text">
              {t.dashboard.emptyDailyLookTitle}
            </h3>
            <p className="text-xs text-heiba-secondary max-w-xs mx-auto mt-1 leading-relaxed">
              {t.dashboard.emptyDailyLookSub}
            </p>
          </div>
          <button
            onClick={() => setCurrentView('generator')}
            className="py-3 px-6 rounded-2xl bg-heiba-accent text-white font-bold text-xs shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all inline-flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            <span>{t.dashboard.generateFirstLook}</span>
          </button>
        </div>
      )}

      {/* Main Dashboard Cards (Soft Pastel Design System) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card A: AI Stylist */}
        <button
          onClick={() => setCurrentView('stylist')}
          className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft text-left hover:border-heiba-lavenderDark hover:shadow-card transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-heiba-lavender text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs text-heiba-text">
            {t.dashboard.quickActions.stylistTitle}
          </h4>
          <p className="text-[11px] text-heiba-secondary mt-0.5">
            {t.dashboard.quickActions.stylistSub}
          </p>
        </button>

        {/* Card B: My Wardrobe */}
        <button
          onClick={() => setCurrentView('wardrobe')}
          className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft text-left hover:border-heiba-beigeDark hover:shadow-card transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-heiba-beige text-amber-900 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Shirt className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-heiba-text">
              {t.dashboard.quickActions.wardrobeTitle}
            </h4>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-heiba-beige text-amber-900">
              {wardrobeInsights.totalItems}
            </span>
          </div>
          <p className="text-[11px] text-heiba-secondary mt-0.5">
            {t.dashboard.quickActions.wardrobeSub}
          </p>
        </button>

        {/* Card C: Generate Outfit */}
        <button
          onClick={() => setCurrentView('generator')}
          className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft text-left hover:border-heiba-blueDark hover:shadow-card transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-heiba-blue text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Wand2 className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs text-heiba-text">
            {t.dashboard.quickActions.generateTitle}
          </h4>
          <p className="text-[11px] text-heiba-secondary mt-0.5">
            {t.dashboard.quickActions.generateSub}
          </p>
        </button>

        {/* Card D: Analyze Outfit */}
        <button
          onClick={() => setCurrentView('analyzer')}
          className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft text-left hover:border-heiba-greenDark hover:shadow-card transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-heiba-green text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Scan className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs text-heiba-text">
            {t.dashboard.quickActions.analyzeTitle}
          </h4>
          <p className="text-[11px] text-heiba-secondary mt-0.5">
            {t.dashboard.quickActions.analyzeSub}
          </p>
        </button>
      </div>

      {/* Card E & F: Weekly Challenge & Style Insights Banner */}
      {activeChallenge && (
        <div className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-heiba-peach text-amber-700 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-heiba-text">
                  {isRtl ? activeChallenge.titleAr : activeChallenge.title}
                </h4>
                <p className="text-[10px] text-heiba-secondary">
                  {isRtl ? `اليوم ${activeChallenge.currentDay} من ${activeChallenge.daysCount}` : `Day ${activeChallenge.currentDay} of ${activeChallenge.daysCount}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('challenges')}
              className="text-xs font-bold text-heiba-accent hover:underline flex items-center gap-0.5"
            >
              <span>{isRtl ? 'عرض' : 'View'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-heiba-bg overflow-hidden border border-heiba-border">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${(activeChallenge.currentDay / activeChallenge.daysCount) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Real Wardrobe Insights Card */}
      <div className="bg-gradient-to-r from-heiba-beige/60 to-white rounded-3xl p-4 border border-heiba-border shadow-soft flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
            {t.wardrobe.insightsTitle}
          </span>
          <p className="text-xs font-bold text-heiba-text mb-0.5">
            {t.wardrobe.topColor}: <span className="text-heiba-accent">{wardrobeInsights.topColor.name}</span>
          </p>
          <p className="text-[11px] text-heiba-secondary">
            {t.wardrobe.missingPiece}:{' '}
            <span className="font-semibold text-heiba-text">
              {isRtl ? wardrobeInsights.missingPiece.nameAr : wardrobeInsights.missingPiece.name}
            </span>
          </p>
        </div>
        <button
          onClick={() => setCurrentView('shopping')}
          className="px-3 py-1.5 rounded-xl bg-white border border-heiba-border text-xs font-bold text-heiba-text hover:bg-heiba-bg shadow-soft"
        >
          {isRtl ? 'سد النقص' : 'Fill Gap'}
        </button>
      </div>

      {/* Recently Saved Carousel */}
      {savedOutfits.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-xs text-heiba-text uppercase tracking-wider">
              {t.dashboard.recentlySaved}
            </h3>
            <button
              onClick={() => setCurrentView('looks')}
              className="text-xs font-semibold text-heiba-accent flex items-center gap-1"
            >
              <span>{isRtl ? 'عرض الكل' : 'View All'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {savedOutfits.map((look) => (
              <div
                key={look.id}
                onClick={() => setCurrentView('looks')}
                className="shrink-0 w-36 bg-white rounded-2xl p-2 border border-heiba-border shadow-soft cursor-pointer hover:border-heiba-borderHover transition-all"
              >
                <div className="w-full h-40 rounded-xl overflow-hidden bg-heiba-bg mb-2">
                  <img src={look.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <h5 className="font-bold text-xs text-heiba-text truncate">
                  {isRtl ? look.titleAr : look.title}
                </h5>
                <p className="text-[10px] text-heiba-secondary truncate">
                  {t.occasions[look.occasion]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
