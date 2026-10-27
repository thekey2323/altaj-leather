'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { OutfitAnalysisResult } from '@/types/heiba';
import {
  Scan,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

export function AnalyzerView() {
  const { isRtl, t, user } = useHeiba();

  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=80'
  );
  const [description, setDescription] = useState('Beige linen shirt with navy chinos and minimalist white sneakers');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<OutfitAnalysisResult | null>(null);

  const samplePhotos = [
    {
      title: isRtl ? 'سمارت كاجوال (كتان وتشينو)' : 'Smart Casual (Linen & Chinos)',
      url: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=80',
      desc: 'Beige linen shirt with navy chinos and clean white sneakers',
    },
    {
      title: isRtl ? 'بليزر رملي مع تيشيرت' : 'Sand Blazer with Knit Tee',
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80',
      desc: 'Unstructured sand blazer, off-white crewneck tee, tailored dark pants, and suede loafers',
    },
    {
      title: isRtl ? 'أوفرشيرت زيتي كاجوال' : 'Olive Overshirt Casual',
      url: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=700&q=80',
      desc: 'Olive green safari overshirt with neutral beige trousers',
    },
  ];

  const handleSelectSample = (sample: (typeof samplePhotos)[0]) => {
    setImageUrl(sample.url);
    setDescription(sample.desc);
    setAnalysisResult(null);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfitDescription: description,
          userGoal: user.mainGoal,
        }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysisResult(data);
    } catch (e) {
      console.warn('Fallback analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-black text-heiba-text flex items-center gap-2">
          <span>{t.analyzer.title}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        </h1>
        <p className="text-xs text-heiba-secondary">
          {t.analyzer.subtitle}
        </p>
      </div>

      {/* Upload & Photo Card */}
      <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card space-y-4">
        {/* Sample photos picker */}
        <div>
          <span className="text-[11px] font-bold text-heiba-secondary uppercase tracking-wider block mb-2">
            {isRtl ? 'اختر صورة جاهزة للاختبار أو ارفع صورتك:' : 'Select sample outfit or upload your photo:'}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {samplePhotos.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`rounded-2xl overflow-hidden border-2 text-left transition-all relative h-20 ${
                  imageUrl === sample.url
                    ? 'border-heiba-accent ring-2 ring-heiba-accentLight'
                    : 'border-heiba-border opacity-70 hover:opacity-100'
                }`}
              >
                <img src={sample.url} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold p-1 truncate text-center">
                  {sample.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Photo Preview */}
        <div className="relative rounded-2xl overflow-hidden h-64 bg-heiba-bg border border-heiba-border">
          <img src={imageUrl} alt="Outfit Review" className="w-full h-full object-cover object-top" />
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-soft text-xs font-bold text-heiba-text flex items-center gap-1.5 border border-heiba-border">
            <Camera className="w-3.5 h-3.5 text-heiba-accent" />
            <span>{isRtl ? 'إطلالة قيد الفحص' : 'Active Look'}</span>
          </div>
        </div>

        {/* Analyze CTA */}
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="w-full py-3.5 bg-heiba-accent text-white rounded-2xl font-bold text-xs shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{t.analyzer.analyzing}</span>
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              <span>{t.analyzer.analyzeAction}</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card space-y-4 animate-fade-in">
          {/* Top Score Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-heiba-border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-heiba-secondary">
                {t.analyzer.reviewTitle}
              </span>
              <h3 className="font-black text-lg text-heiba-text">
                {t.analyzer.overallScore}
              </h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex flex-col items-center justify-center font-black text-xl shadow-soft">
              <span>{analysisResult.overallScore}</span>
              <span className="text-[9px] text-emerald-600 font-bold -mt-1">/ 100</span>
            </div>
          </div>

          {/* Key Metrics: Color Harmony, Proportions, Occasion */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-heiba-bg border border-heiba-border">
              <span className="text-[10px] text-heiba-secondary block mb-1">
                {t.analyzer.harmonyLabel}
              </span>
              <span className="text-xs font-black text-emerald-700">
                {analysisResult.colorHarmony.status === 'excellent' ? 'ممتاز ★' : 'جيد'}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-heiba-bg border border-heiba-border">
              <span className="text-[10px] text-heiba-secondary block mb-1">
                {t.analyzer.proportionsLabel}
              </span>
              <span className="text-xs font-black text-blue-700">
                {analysisResult.proportionsAndFit.status === 'excellent' ? 'ممتاز' : 'متناسق'}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-heiba-bg border border-heiba-border">
              <span className="text-[10px] text-heiba-secondary block mb-1">
                {t.analyzer.occasionLabel}
              </span>
              <span className="text-xs font-black text-purple-700">
                {analysisResult.occasionSuitability.status === 'excellent' ? 'مثالي' : 'مناسب'}
              </span>
            </div>
          </div>

          {/* Color Harmony Breakdown */}
          <div className="p-3.5 rounded-2xl bg-heiba-bg border border-heiba-border text-xs leading-relaxed">
            <strong className="block text-heiba-text font-bold mb-1">
              🎨 {t.analyzer.harmonyLabel}:
            </strong>
            <p className="text-heiba-secondary text-[11px]">
              {isRtl
                ? analysisResult.colorHarmony.feedbackAr
                : analysisResult.colorHarmony.feedback}
            </p>
          </div>

          {/* What Works (Strengths) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs">
            <strong className="block text-emerald-900 font-bold mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.analyzer.whatWorks}</span>
            </strong>
            <ul className="space-y-1 text-emerald-800 text-[11px]">
              {(isRtl ? analysisResult.whatWorksAr : analysisResult.whatWorks).map((w, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span>•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Styling Opportunity */}
          <div className="p-3.5 rounded-2xl bg-heiba-peach/60 border border-heiba-peachDark text-xs">
            <strong className="block text-amber-900 font-bold mb-1">
              {t.analyzer.opportunity}
            </strong>
            <p className="text-amber-900 text-[11px] leading-relaxed">
              {isRtl
                ? analysisResult.stylingOpportunityAr
                : analysisResult.stylingOpportunity}
            </p>
          </div>

          {/* One Quick Upgrade */}
          <div className="p-3.5 rounded-2xl bg-heiba-lavender/60 border border-heiba-lavenderDark text-xs">
            <strong className="block text-purple-950 font-bold mb-1 flex items-center gap-1">
              <Zap className="w-4 h-4 text-heiba-accent" />
              <span>{t.analyzer.quickUpgrade}</span>
            </strong>
            <p className="text-purple-900 text-[11px] leading-relaxed">
              {isRtl ? analysisResult.quickUpgradeAr : analysisResult.quickUpgrade}
            </p>
          </div>

          {/* Retest button */}
          <button
            onClick={() => setAnalysisResult(null)}
            className="w-full py-3 bg-heiba-bg border border-heiba-border text-heiba-text rounded-2xl font-bold text-xs hover:bg-heiba-beige flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.analyzer.retest}</span>
          </button>
        </div>
      )}
    </div>
  );
}
