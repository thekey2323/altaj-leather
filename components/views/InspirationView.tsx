'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { StylePreference } from '@/types/heiba';
import { INSPIRATION_FEED } from '@/lib/mock-data';
import { Compass, Sparkles, Heart, Wand2 } from 'lucide-react';

export function InspirationView() {
  const { isRtl, t, setCurrentView } = useHeiba();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [savedFeedIds, setSavedFeedIds] = useState<string[]>([]);

  const toggleSaveFeed = (id: string) => {
    setSavedFeedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredLooks = INSPIRATION_FEED.filter((look) => {
    if (selectedFilter === 'all') return true;
    return look.category === selectedFilter;
  });

  const categories = ['all', 'quiet_luxury', 'old_money', 'streetwear', 'minimalist'];

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-black text-heiba-text flex items-center gap-2">
          <span>{isRtl ? 'إلهام الستايل العالمي' : 'Style Inspiration'}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
        </h1>
        <p className="text-xs text-heiba-secondary">
          {isRtl
            ? 'لوكات وتنسيقات منتقاة بعناية لترقية ذوقك اليومي'
            : 'Curated editorial menswear looks to elevate your daily aesthetics'}
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-2xl transition-all ${
              selectedFilter === cat
                ? 'bg-heiba-accent text-white shadow-coral'
                : 'bg-white border border-heiba-border text-heiba-secondary hover:text-heiba-text'
            }`}
          >
            {cat === 'all'
              ? isRtl
                ? 'جميع الستايلات'
                : 'All Styles'
              : t.styles[cat as StylePreference] || cat}
          </button>
        ))}
      </div>

      {/* Inspiration Cards Grid */}
      <div className="space-y-4">
        {filteredLooks.map((look) => {
          const isSaved = savedFeedIds.includes(look.id);
          return (
            <div
              key={look.id}
              className="bg-white rounded-3xl p-4 border border-heiba-border shadow-card space-y-3"
            >
              {/* Photo */}
              <div className="relative rounded-2xl overflow-hidden h-72 bg-heiba-bg border border-heiba-border">
                <img
                  src={look.imageUrl}
                  alt={look.title}
                  className="w-full h-full object-cover object-top"
                />

                {/* Swatches Overlay */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-soft flex items-center gap-1.5 border border-heiba-border">
                  {look.colorPalette.map((c, i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    ></span>
                  ))}
                </div>

                {/* Save button */}
                <button
                  onClick={() => toggleSaveFeed(look.id)}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md shadow-soft transition-colors ${
                    isSaved
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white/90 text-heiba-secondary hover:text-rose-600'
                  }`}
                  title="Save inspiration"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
                </button>

                {/* Title & Category Banner */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md inline-block mb-1">
                    {t.styles[look.category] || 'Quiet Luxury'}
                  </span>
                  <h3 className="font-extrabold text-sm leading-snug">
                    {isRtl ? look.titleAr : look.title}
                  </h3>
                </div>
              </div>

              {/* Garments in this look */}
              <div className="flex flex-wrap gap-1.5">
                {(isRtl ? look.piecesAr : look.pieces).map((piece, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-heiba-bg border border-heiba-border text-heiba-text font-medium"
                  >
                    {piece}
                  </span>
                ))}
              </div>

              {/* Recreate CTA Button */}
              <button
                onClick={() => setCurrentView('generator')}
                className="w-full py-2.5 bg-heiba-text text-white rounded-xl font-bold text-xs hover:bg-heiba-accent transition-colors flex items-center justify-center gap-2 shadow-soft"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isRtl ? 'نسّق هذا اللوك من خزانتي' : 'Recreate with My Wardrobe'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
