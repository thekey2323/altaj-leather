'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import {
  StylePreference,
  FitPreference,
  BodyBuild,
  Lifestyle,
  OccasionType,
  StyleIdentity,
} from '@/types/heiba';
import { SAMPLE_STYLE_IDENTITIES } from '@/lib/mock-data';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function OnboardingView() {
  const { isRtl, completeOnboarding, setLanguage, language, t } = useHeiba();
  const ArrowNext = isRtl ? ArrowLeft : ArrowRight;
  const ArrowPrev = isRtl ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState(1);
  const totalSteps = 15;
  const [isGeneratingIdentity, setIsGeneratingIdentity] = useState(false);
  const [generatedIdentity, setGeneratedIdentity] = useState<StyleIdentity | null>(null);

  // Form states
  const [prefLang, setPrefLang] = useState<'ar' | 'en'>(language);
  const [ageRange, setAgeRange] = useState('25-34');
  const [country, setCountry] = useState('المملكة العربية السعودية');
  const [heightCm, setHeightCm] = useState(178);
  const [preferredFit, setPreferredFit] = useState<FitPreference>('regular');
  const [bodyBuild, setBodyBuild] = useState<BodyBuild>('athletic');
  const [skinTone, setSkinTone] = useState('Warm Olive / دافئ');
  const [clothingSize, setClothingSize] = useState('L');
  const [lifestyle, setLifestyle] = useState<Lifestyle>('office');
  const [occasions, setOccasions] = useState<OccasionType[]>(['smart_casual', 'date_night', 'office']);
  const [styles, setStyles] = useState<StylePreference[]>(['quiet_luxury', 'smart_casual', 'old_money']);
  const [usualColors, setUsualColors] = useState<string[]>(['Navy', 'Black', 'White', 'Beige']);
  const [colorsToTry, setColorsToTry] = useState<string[]>(['Sage Green', 'Terracotta / Coral', 'Sky Blue']);
  const [budgetLevel, setBudgetLevel] = useState<'budget' | 'mid_range' | 'luxury' | 'flexible'>('mid_range');
  const [mainGoal, setMainGoal] = useState('Look more attractive & commanding');

  const toggleOccasion = (occ: OccasionType) => {
    setOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const toggleStyle = (st: StylePreference) => {
    setStyles((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    setIsGeneratingIdentity(true);
    setTimeout(() => {
      // Determine style identity code
      const primaryStyle = styles[0] || 'quiet_luxury';
      const identity = SAMPLE_STYLE_IDENTITIES[primaryStyle] || SAMPLE_STYLE_IDENTITIES.quiet_luxury;
      setGeneratedIdentity(identity);
      setIsGeneratingIdentity(false);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (e) {
        // Safe
      }
    }, 1800);
  };

  const handleEnterApp = () => {
    if (!generatedIdentity) return;
    completeOnboarding(
      {
        language: prefLang,
        ageRange,
        country,
        heightCm,
        preferredFit,
        bodyBuild,
        skinTone,
        clothingSize,
        lifestyle,
        occasions,
        preferredStyles: styles,
        usualColors,
        colorsToTry,
        budgetLevel,
        mainGoal,
      },
      generatedIdentity
    );
  };

  // If loading animation is running
  if (isGeneratingIdentity) {
    return (
      <div className="min-h-screen bg-heiba-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-heiba-lavender text-purple-700 flex items-center justify-center shadow-card animate-pulse-soft mb-4">
          <Sparkles className="w-8 h-8 text-heiba-accent" />
        </div>
        <h2 className="text-xl font-bold text-heiba-text mb-2">
          {t.onboarding.analyzing}
        </h2>
        <p className="text-xs text-heiba-secondary max-w-xs leading-relaxed">
          {isRtl
            ? 'نقوم بتحديد أفضل لوحة ألوان لملامحك، والقصات المناسبة لقوامك، وهويتك المتفردة في الأناقة.'
            : 'Synthesizing your silhouette, palette, and wardrobe essentials for a bespoke Style DNA.'}
        </p>
      </div>
    );
  }

  // If identity generated: Result Screen
  if (generatedIdentity) {
    return (
      <div className="min-h-screen bg-heiba-bg p-4 pb-20 max-w-md mx-auto">
        <div className="text-center my-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.onboarding.identityReady}
          </span>
          <h1 className="text-2xl font-black text-heiba-text">
            {isRtl ? generatedIdentity.nameAr : generatedIdentity.name}
          </h1>
          <p className="text-xs text-heiba-secondary mt-1">
            {isRtl ? generatedIdentity.taglineAr : generatedIdentity.tagline}
          </p>
        </div>

        {/* Style DNA Card */}
        <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card mb-4">
          <h3 className="text-xs font-bold text-heiba-secondary uppercase tracking-wider mb-2">
            {isRtl ? 'وصف هويتك في اللبس' : 'Style Philosophy'}
          </h3>
          <p className="text-xs text-heiba-text leading-relaxed mb-4">
            {isRtl ? generatedIdentity.descriptionAr : generatedIdentity.description}
          </p>

          {/* Best Colors */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-heiba-text mb-2">
              {isRtl ? 'أفضل ألوان تناسبك وتبرز حضورك:' : 'Your Optimal Color Palette:'}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {generatedIdentity.bestColors.map((color, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-xl bg-heiba-bg border border-heiba-border"
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: color.hex }}
                  ></span>
                  <span className="text-xs font-medium text-heiba-text truncate">
                    {isRtl ? color.nameAr : color.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Fits */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-heiba-text mb-1.5">
              {isRtl ? 'القصات المفضلة لقوامك:' : 'Flattering Silhouettes & Fits:'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(isRtl ? generatedIdentity.recommendedFitsAr : generatedIdentity.recommendedFits).map(
                (fit, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-xl bg-heiba-lavender text-purple-900 font-semibold"
                  >
                    {fit}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Recommended Wardrobe Essentials */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-heiba-text mb-1.5">
              {isRtl ? 'قطع أساسية لتبني بها خزانتك:' : 'Core Capsule Wardrobe Essentials:'}
            </h4>
            <ul className="space-y-1 text-xs text-heiba-secondary">
              {(isRtl ? generatedIdentity.wardrobeEssentialsAr : generatedIdentity.wardrobeEssentials).map(
                (item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-heiba-accent"></span>
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Things to Avoid */}
          <div>
            <h4 className="text-xs font-bold text-rose-700 mb-1.5">
              {isRtl ? 'أشياء يُفضل تجنبها:' : 'Styling Pitfalls to Avoid:'}
            </h4>
            <ul className="space-y-1 text-xs text-heiba-secondary">
              {(isRtl ? generatedIdentity.thingsToAvoidAr : generatedIdentity.thingsToAvoid).map(
                (item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Enter Dashboard CTA */}
        <button
          onClick={handleEnterApp}
          className="w-full py-3.5 bg-heiba-accent text-white rounded-2xl font-bold text-sm shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span>{t.onboarding.enterDashboard}</span>
          <ArrowNext className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Interactive 15-step Questions UI
  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-20 max-w-md mx-auto">
      {/* Top Header & Progress */}
      <div className="py-3 mb-4">
        <div className="flex items-center justify-between text-xs text-heiba-secondary font-bold mb-2">
          <span>{t.onboarding.title}</span>
          <span>
            {step} / {totalSteps}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-heiba-border overflow-hidden">
          <div
            className="h-full bg-heiba-accent transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 border border-heiba-border shadow-card mb-6 animate-fade-in">
        {step === 1 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qLang}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: 'ar' as const, label: 'العربية (موصى بها)' },
                { code: 'en' as const, label: 'English' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setPrefLang(item.code);
                    setLanguage(item.code);
                  }}
                  className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all ${
                    prefLang === item.code
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qAge}</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {['18 - 24', '25 - 34', '35 - 44', '45+'].map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setAgeRange(age)}
                  className={`p-3.5 rounded-2xl border font-bold text-xs transition-all ${
                    ageRange === age
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qCountry}</h3>
            <div className="space-y-2">
              {[
                'المملكة العربية السعودية',
                'مصر (Egypt)',
                'المغرب (Morocco)',
                'الإمارات العربية المتحدة',
                'دولة أخرى في الشرق الأوسط أو شمال أفريقيا',
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountry(c)}
                  className={`w-full p-3 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                    country === c
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  <span>{c}</span>
                  {country === c && <Check className="w-4 h-4 text-heiba-accent" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-2">{t.onboarding.qHeight}</h3>
            <p className="text-xs text-heiba-secondary mb-4">
              {isRtl ? 'يساعدنا في تحديد أفضل أطوال للقمصان وحواشي السراويل.' : 'Optimizes pant breaks and jacket proportions.'}
            </p>
            <div className="text-center mb-4">
              <span className="text-3xl font-extrabold text-heiba-text">{heightCm}</span>
              <span className="text-xs text-heiba-secondary font-bold mr-1"> cm</span>
            </div>
            <input
              type="range"
              min="155"
              max="205"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full accent-heiba-accent cursor-pointer"
            />
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qFit}</h3>
            <div className="space-y-2">
              {[
                { id: 'regular' as const, label: isRtl ? 'منتظم ومريح (Regular Fit)' : 'Regular Fit' },
                { id: 'slim' as const, label: isRtl ? 'مفصل على الجسم (Slim Tailored)' : 'Slim Fit' },
                { id: 'relaxed' as const, label: isRtl ? 'فضفاض عصري (Relaxed Drape)' : 'Relaxed Fit' },
                { id: 'oversized' as const, label: isRtl ? 'أوفرسايز شبابي (Oversized)' : 'Oversized' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPreferredFit(f.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                    preferredFit === f.id
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  <span>{f.label}</span>
                  {preferredFit === f.id && <Check className="w-4 h-4 text-heiba-accent" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qBuild}</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'athletic' as const, label: isRtl ? 'رياضي (Athletic)' : 'Athletic' },
                { id: 'slim' as const, label: isRtl ? 'نحيف (Slim)' : 'Slim' },
                { id: 'average' as const, label: isRtl ? 'متوسط (Average)' : 'Average' },
                { id: 'muscular' as const, label: isRtl ? 'عضلي بارز (Muscular)' : 'Muscular' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBodyBuild(b.id)}
                  className={`p-3.5 rounded-2xl border font-bold text-xs transition-all ${
                    bodyBuild === b.id
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qSkin}</h3>
            <div className="space-y-2">
              {[
                { name: 'Warm Olive / حنطي دافئ', hex: '#C68A4C' },
                { name: 'Fair / فاتح', hex: '#F1C27D' },
                { name: 'Medium Tan / قمحي متوازن', hex: '#A86C32' },
                { name: 'Deep Bronze / أسمر جذاب', hex: '#633B18' },
              ].map((st) => (
                <button
                  key={st.name}
                  type="button"
                  onClick={() => setSkinTone(st.name)}
                  className={`w-full p-3 rounded-2xl border font-bold text-xs transition-all flex items-center justify-between ${
                    skinTone === st.name
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: st.hex }}
                    ></span>
                    <span>{st.name}</span>
                  </div>
                  {skinTone === st.name && <Check className="w-4 h-4 text-heiba-accent" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 8 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qSize}</h3>
            <div className="grid grid-cols-3 gap-2">
              {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setClothingSize(sz)}
                  className={`p-3 rounded-2xl border font-extrabold text-xs transition-all ${
                    clothingSize === sz
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 9 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qLifestyle}</h3>
            <div className="space-y-2">
              {[
                { id: 'office' as const, label: isRtl ? 'موظف ومكتبي (Office & Corporate)' : 'Office & Corporate' },
                { id: 'business' as const, label: isRtl ? 'رائد أعمال وأعمال حرة (Entrepreneur)' : 'Entrepreneur' },
                { id: 'student' as const, label: isRtl ? 'طالب جامعي (Student)' : 'Student' },
                { id: 'creative' as const, label: isRtl ? 'مجال إبداعي وتقني (Creative & Tech)' : 'Creative & Tech' },
                { id: 'active' as const, label: isRtl ? 'كثير التنقل وحركي (Active & Travel)' : 'Active & Travel' },
              ].map((ls) => (
                <button
                  key={ls.id}
                  type="button"
                  onClick={() => setLifestyle(ls.id)}
                  className={`w-full p-3 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                    lifestyle === ls.id
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  <span>{ls.label}</span>
                  {lifestyle === ls.id && <Check className="w-4 h-4 text-heiba-accent" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 10 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-1">{t.onboarding.qOccasions}</h3>
            <p className="text-xs text-heiba-secondary mb-3">
              {isRtl ? 'يمكنك اختيار أكثر من مناسبة:' : 'Select all that apply:'}
            </p>
            <div className="space-y-2">
              {(
                [
                  'daily_casual',
                  'smart_casual',
                  'office',
                  'date_night',
                  'wedding',
                  'friday_prayer',
                ] as OccasionType[]
              ).map((occ) => {
                const isSelected = occasions.includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => toggleOccasion(occ)}
                    className={`w-full p-3 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                        : 'border-heiba-border bg-heiba-bg text-heiba-text'
                    }`}
                  >
                    <span>{t.occasions[occ]}</span>
                    {isSelected && <Check className="w-4 h-4 text-heiba-accent" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 11 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-1">{t.onboarding.qStyles}</h3>
            <p className="text-xs text-heiba-secondary mb-3">
              {isRtl ? 'اختر الأنماط الأقرب لذوقك وطموحك:' : 'Select your favorite aesthetics:'}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {(Object.keys(t.styles) as StylePreference[]).map((st) => {
                const isSelected = styles.includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleStyle(st)}
                    className={`w-full p-3 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                        : 'border-heiba-border bg-heiba-bg text-heiba-text'
                    }`}
                  >
                    <span>{t.styles[st]}</span>
                    {isSelected && <Check className="w-4 h-4 text-heiba-accent" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 12 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qColorsUsual}</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Navy Blue', 'Black', 'White / Off-White', 'Beige / Khaki', 'Grey', 'Brown'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setUsualColors((prev) =>
                      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                    )
                  }
                  className={`p-3 rounded-2xl border font-bold text-xs text-center transition-all ${
                    usualColors.includes(c)
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 13 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qColorsTry}</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Sage Green (زيتي هادئ)', 'Terracotta / Coral (قرميدي)', 'Sky Blue (أزرق سماوي)', 'Burgundy (عنابي راقي)'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setColorsToTry((prev) =>
                      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                    )
                  }
                  className={`p-3 rounded-2xl border font-bold text-xs text-center transition-all ${
                    colorsToTry.includes(c)
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 14 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qBudget}</h3>
            <div className="space-y-2">
              {[
                { id: 'budget' as const, label: isRtl ? 'اقتصادي وذكي (Budget Conscious)' : 'Budget Conscious' },
                { id: 'mid_range' as const, label: isRtl ? 'متوسط وجودة عالية (Zara, Massimo Dutti, COS)' : 'Mid-Range Quality' },
                { id: 'luxury' as const, label: isRtl ? 'فاخر ومصممين (Luxury Brands)' : 'Luxury & Tailored' },
                { id: 'flexible' as const, label: isRtl ? 'مرن حسب القطعة (Flexible)' : 'Flexible' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudgetLevel(b.id)}
                  className={`w-full p-3 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                    budgetLevel === b.id
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  <span>{b.label}</span>
                  {budgetLevel === b.id && <Check className="w-4 h-4 text-heiba-accent" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 15 && (
          <div>
            <h3 className="font-extrabold text-lg text-heiba-text mb-3">{t.onboarding.qGoal}</h3>
            <div className="space-y-2">
              {[
                isRtl ? 'الظهور بمظهر أكثر جاذبية وهيبة' : 'Look more attractive & commanding',
                isRtl ? 'بناء خزانة ملابس ذكية (Capsule Wardrobe)' : 'Build a smart versatile capsule wardrobe',
                isRtl ? 'التأنق للمناسبات ومواعيد العشاء بثقة' : 'Dress better for dates & weddings',
                isRtl ? 'تطوير أسلوبي في بيئة العمل والمكتب' : 'Dress more professionally for corporate career',
                isRtl ? 'توفير الوقت والتوقف عن الحيرة اليومية' : 'Save time and eliminate daily morning guesswork',
              ].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setMainGoal(goal)}
                  className={`w-full p-3 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                    mainGoal === goal
                      ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent'
                      : 'border-heiba-border bg-heiba-bg text-heiba-text'
                  }`}
                >
                  <span>{goal}</span>
                  {mainGoal === goal && <Check className="w-4 h-4 text-heiba-accent" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="py-3 px-5 rounded-2xl bg-white border border-heiba-border text-heiba-text font-bold text-xs hover:bg-heiba-bg transition-all flex items-center gap-1.5"
          >
            <ArrowPrev className="w-4 h-4" />
            <span>{t.onboarding.back}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-heiba-accent text-white font-bold text-xs shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span>{step === totalSteps ? t.onboarding.finish : t.onboarding.next}</span>
          <ArrowNext className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
