'use client';

import React from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { Bookmark, Trash2, Heart, Share2, Sparkles, Wand2 } from 'lucide-react';

export function LooksView() {
  const { savedOutfits, removeSavedOutfit, setCurrentView, isRtl, t } = useHeiba();

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-heiba-text flex items-center gap-2">
            <span>{isRtl ? 'لوكاتي المحفوظة' : 'My Saved Looks'}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-heiba-blue text-blue-800">
              {savedOutfits.length}
            </span>
          </h1>
          <p className="text-xs text-heiba-secondary">
            {isRtl ? 'مجموعتك المفضلة من الإطلالات والتنسيقات الجاهزة' : 'Your curated personal lookbook'}
          </p>
        </div>

        <button
          onClick={() => setCurrentView('generator')}
          className="p-2.5 bg-heiba-text text-white rounded-2xl text-xs font-bold shadow-soft hover:bg-heiba-accent transition-colors flex items-center gap-1.5"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>{isRtl ? 'تنسيق جديد' : 'New Look'}</span>
        </button>
      </div>

      {savedOutfits.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-heiba-border shadow-soft text-center my-8 space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-heiba-lavender text-purple-700 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-heiba-text">
            {isRtl ? 'لم تحفظ أي لوك حتى الآن' : 'No saved looks yet'}
          </h3>
          <p className="text-xs text-heiba-secondary max-w-xs mx-auto leading-relaxed">
            {isRtl
              ? 'استخدم مولّد اللوكات أو اسأل المستشار الذكي واضغط على زر الحفظ للاحتفاظ بتنسيقاتك المفضلة هنا.'
              : 'Generate outfits with AI or ask the stylist to save your favorite combinations here.'}
          </p>
          <button
            onClick={() => setCurrentView('generator')}
            className="py-2.5 px-5 bg-heiba-accent text-white rounded-2xl text-xs font-bold shadow-coral hover:bg-heiba-accentHover inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRtl ? 'توليد أول لوك' : 'Generate First Look'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="bg-white rounded-3xl p-4 border border-heiba-border shadow-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-heiba-blue text-blue-800">
                  {t.occasions[outfit.occasion] || 'Smart Casual'}
                </span>
                <div className="flex items-center gap-1">
                  {outfit.colorPalette.map((cp, idx) => (
                    <span
                      key={idx}
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: cp.hex }}
                      title={cp.name}
                    ></span>
                  ))}
                </div>
              </div>

              {/* Outfit Photo */}
              <div className="relative rounded-2xl overflow-hidden h-52 bg-heiba-bg border border-heiba-border">
                <img
                  src={outfit.imageUrl || 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=80'}
                  alt={outfit.title}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h4 className="font-extrabold text-sm">
                    {isRtl ? outfit.titleAr : outfit.title}
                  </h4>
                  <span className="text-[10px] text-white/80">
                    {t.styles[outfit.style] || 'Quiet Luxury'}
                  </span>
                </div>
              </div>

              {/* Pieces Chips */}
              <div className="flex flex-wrap gap-1.5">
                {outfit.pieces.map((piece, pIdx) => (
                  <span
                    key={pIdx}
                    className="text-[11px] px-2 py-1 rounded-xl bg-heiba-bg border border-heiba-border text-heiba-text flex items-center gap-1"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: piece.colorHex }}
                    ></span>
                    <span>{isRtl ? piece.nameAr : piece.name}</span>
                  </span>
                ))}
              </div>

              {/* Why it works summary */}
              <p className="text-[11px] text-heiba-secondary leading-snug">
                {isRtl ? outfit.whyItWorksAr : outfit.whyItWorks}
              </p>

              {/* Delete / Share actions */}
              <div className="flex items-center justify-between pt-2 border-t border-heiba-border">
                <span className="text-[10px] text-heiba-secondary">
                  {outfit.createdAt || 'Saved in collection'}
                </span>
                <button
                  onClick={() => removeSavedOutfit(outfit.id)}
                  className="p-1.5 rounded-xl text-heiba-secondary hover:text-rose-600 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
