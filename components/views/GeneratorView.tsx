'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import {
  OccasionType,
  StylePreference,
  Outfit,
} from '@/types/heiba';
import {
  Wand2,
  Sparkles,
  Heart,
  Check,
  RotateCcw,
  Eye,
  Sliders,
  X,
} from 'lucide-react';
import { SAMPLE_OUTFITS } from '@/lib/mock-data';

export function GeneratorView() {
  const { wardrobe, saveOutfit, isOutfitSaved, isRtl, t, user } = useHeiba();

  const [occasion, setOccasion] = useState<OccasionType>('smart_casual');
  const [stylePref, setStylePref] = useState<StylePreference>('quiet_luxury');
  const [useWardrobeOnly, setUseWardrobeOnly] = useState(true);
  const [formality, setFormality] = useState<'casual' | 'smart_casual' | 'formal'>('smart_casual');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [isGeneratingImageForOutfit, setIsGeneratingImageForOutfit] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion,
          preferredStyle: stylePref,
          wardrobe,
          includeSuggestions: !useWardrobeOnly,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      if (data.outfits && data.outfits.length > 0) {
        setGeneratedOutfits(data.outfits);
      }
    } catch (e) {
      console.warn('Outfit generation failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLookImage = async (outfit: Outfit) => {
    setIsGeneratingImageForOutfit(outfit.id);
    try {
      const res = await fetch('/api/ai/generate-look-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfitTitle: outfit.title,
          pieces: outfit.pieces,
          colors: outfit.colorPalette.map((c) => c.name),
          occasion: outfit.occasion,
          style: outfit.style,
          seed: Math.floor(Math.random() * 900000) + 100000,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedOutfits((prev) =>
          prev.map((o) => (o.id === outfit.id ? { ...o, imageUrl: data.imageUrl } : o))
        );
      }
    } catch (e) {
      console.warn('Error generating image:', e);
    } finally {
      setIsGeneratingImageForOutfit(null);
    }
  };

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-float border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative h-96 w-full bg-black">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 bg-white">
              <span className="text-[10px] font-bold text-heiba-accent uppercase tracking-wider block mb-1">
                {isRtl ? 'صورة اللوك المصممة بالذكاء الاصطناعي' : 'AI Generated Look'}
              </span>
              <h4 className="font-extrabold text-sm text-heiba-text">
                {lightboxImage.title}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-black text-heiba-text flex items-center gap-2">
          <span>{t.generator.title}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-heiba-accent"></span>
        </h1>
        <p className="text-xs text-heiba-secondary">
          {t.generator.subtitle}
        </p>
      </div>

      {/* Generator Controls Card */}
      <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card space-y-4">
        {/* Occasion Selector */}
        <div>
          <label className="block text-xs font-bold text-heiba-text mb-1.5">
            {t.generator.occasionLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                'smart_casual',
                'date_night',
                'office',
                'wedding',
                'daily_casual',
                'friday_prayer',
              ] as OccasionType[]
            ).map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => setOccasion(occ)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  occasion === occ
                    ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent shadow-soft'
                    : 'border-heiba-border bg-heiba-bg text-heiba-text hover:border-heiba-borderHover'
                }`}
              >
                {t.occasions[occ]}
              </button>
            ))}
          </div>
        </div>

        {/* Style Aesthetic Selector */}
        <div>
          <label className="block text-xs font-bold text-heiba-text mb-1.5">
            {t.generator.styleLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                'quiet_luxury',
                'old_money',
                'smart_casual',
                'minimalist',
              ] as StylePreference[]
            ).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStylePref(st)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  stylePref === st
                    ? 'border-purple-600 bg-heiba-lavender text-purple-900 shadow-soft'
                    : 'border-heiba-border bg-heiba-bg text-heiba-text hover:border-heiba-borderHover'
                }`}
              >
                {t.styles[st]}
              </button>
            ))}
          </div>
        </div>

        {/* Garment Source Toggle */}
        <div>
          <label className="block text-xs font-bold text-heiba-text mb-1.5">
            {t.generator.sourceLabel}
          </label>
          <div className="flex items-center gap-2 bg-heiba-bg p-1 rounded-2xl border border-heiba-border">
            <button
              type="button"
              onClick={() => setUseWardrobeOnly(true)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                useWardrobeOnly
                  ? 'bg-white text-heiba-text shadow-soft'
                  : 'text-heiba-secondary'
              }`}
            >
              {t.generator.sourceWardrobeOnly}
            </button>
            <button
              type="button"
              onClick={() => setUseWardrobeOnly(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                !useWardrobeOnly
                  ? 'bg-heiba-accent text-white shadow-coral'
                  : 'text-heiba-secondary'
              }`}
            >
              {t.generator.sourceIncludeSuggestions}
            </button>
          </div>
        </div>

        {/* Generate CTA Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3.5 bg-heiba-accent text-white rounded-2xl font-bold text-xs shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{t.generator.generating}</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>{t.generator.generateAction}</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Outfits Results */}
      {generatedOutfits.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-heiba-text uppercase tracking-wider">
            {t.generator.resultsHeading}
          </h3>

        {generatedOutfits.map((outfit) => {
          const isSaved = isOutfitSaved(outfit.id);
          return (
            <div
              key={outfit.id}
              className="bg-white rounded-3xl p-4 border border-heiba-border shadow-card space-y-3 hover:border-heiba-borderHover transition-all"
            >
              {/* Header */}
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

              {/* Photo & Title Banner */}
              <div className="relative rounded-2xl overflow-hidden h-56 bg-stone-200 border border-heiba-border group">
                <img
                  src={
                    outfit.imageUrl ||
                    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={outfit.title}
                  className="w-full h-full object-cover object-top cursor-pointer group-hover:scale-103 transition-transform duration-300"
                  onClick={() =>
                    setLightboxImage({
                      url:
                        outfit.imageUrl ||
                        'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
                      title: isRtl ? outfit.titleAr : outfit.title,
                    })
                  }
                />

                {/* AI Badge Overlay */}
                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-soft text-[10px] font-bold text-heiba-text flex items-center gap-1.5 border border-heiba-border">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isRtl ? 'صورة اللوك AI' : 'AI Look Image'}</span>
                </div>

                {/* Bottom title banner */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                  <h4 className="font-extrabold text-sm">
                    {isRtl ? outfit.titleAr : outfit.title}
                  </h4>
                  <span className="text-[10px] text-white/80">
                    {t.styles[outfit.style] || 'Quiet Luxury'}
                  </span>
                </div>
              </div>

              {/* Re-generate Look Image Button */}
              <button
                type="button"
                onClick={() => handleGenerateLookImage(outfit)}
                disabled={isGeneratingImageForOutfit === outfit.id}
                className="w-full py-2 px-3 rounded-xl bg-heiba-bg border border-heiba-border hover:border-heiba-accent text-[11px] font-bold text-heiba-text flex items-center justify-center gap-1.5 transition-colors shadow-soft"
              >
                <Wand2
                  className={`w-3.5 h-3.5 text-heiba-accent ${
                    isGeneratingImageForOutfit === outfit.id ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {isGeneratingImageForOutfit === outfit.id
                    ? isRtl
                      ? 'جاري توليد صورة الإطلالة...'
                      : 'Synthesizing Look Image...'
                    : isRtl
                    ? 'توليد صورة اللوك بالذكاء الاصطناعي ✨'
                    : 'Generate Look in Image ✨'}
                </span>
              </button>

              {/* Pieces Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-heiba-secondary block">
                  {t.generator.piecesBreakdown}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {outfit.pieces.map((piece, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 p-2 rounded-xl bg-heiba-bg border border-heiba-border text-[11px]"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: piece.colorHex }}
                      ></span>
                      <span className="truncate font-medium text-heiba-text">
                        {isRtl ? piece.nameAr : piece.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why it works */}
              <div className="p-3 rounded-2xl bg-heiba-beige/50 border border-heiba-beigeDark text-xs text-heiba-text leading-snug">
                <strong className="block text-amber-900 mb-0.5">
                  {t.generator.whyWorks}
                </strong>
                <p className="text-[11px] text-heiba-secondary">
                  {isRtl ? outfit.whyItWorksAr : outfit.whyItWorks}
                </p>
              </div>

              {/* Save & Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => saveOutfit(outfit)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isSaved
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-heiba-accent text-white shadow-coral hover:bg-heiba-accentHover'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-600' : ''}`} />
                  <span>{isSaved ? t.generator.saved : t.generator.saveToLooks}</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-heiba-border shadow-card text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-heiba-blue text-blue-700 flex items-center justify-center mx-auto shadow-soft">
            <Wand2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-heiba-text">
            {t.generator.emptyResultsTitle}
          </h3>
          <p className="text-xs text-heiba-secondary max-w-xs mx-auto leading-relaxed">
            {t.generator.emptyResultsSub}
          </p>
        </div>
      )}
    </div>
  );
}
