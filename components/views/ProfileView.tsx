'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import {
  User,
  Sparkles,
  Crown,
  Globe,
  DollarSign,
  Shield,
  Trash2,
  Check,
  Edit3,
  Shirt,
  Bookmark,
  Award,
  ExternalLink,
} from 'lucide-react';
import { Currency, Language } from '@/types/heiba';

export function ProfileView() {
  const {
    user,
    updateUser,
    wardrobe,
    savedOutfits,
    language,
    setLanguage,
    currency,
    setCurrency,
    setShowUpgradeModal,
    setCurrentView,
    resetDemoData,
    isRtl,
    t,
  } = useHeiba();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateUser({ name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const currencies: Currency[] = ['SAR', 'EGP', 'MAD', 'USD'];

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Top User Card */}
      <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card flex items-center gap-4 relative">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-heiba-accent shadow-soft bg-heiba-beige flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-amber-900" />
            )}
          </div>
          {user.isPro && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-heiba-accent text-white flex items-center justify-center text-[9px] shadow-soft">
              <Crown className="w-3 h-3 fill-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-1.5 mb-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="px-2 py-1 bg-heiba-bg border border-heiba-border rounded-lg text-xs font-bold text-heiba-text outline-none focus:border-heiba-accent"
              />
              <button
                onClick={handleSaveName}
                className="p-1 rounded-lg bg-heiba-accent text-white text-xs"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-heiba-text truncate">
                {user.name || (isRtl ? 'ضيف هيبة' : 'HEIBA Guest')}
              </h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-heiba-secondary hover:text-heiba-text"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-xs text-heiba-secondary truncate">
            {user.email || (isRtl ? 'حساب تجريبي جديد' : 'New Guest Account')}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-heiba-peach text-amber-900">
              {isRtl ? user.styleIdentity?.nameAr || 'غير محددة بعد' : user.styleIdentity?.name || 'Not Set Yet'}
            </span>
            {user.isPro ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                PRO ACTIVE
              </span>
            ) : (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-heiba-accentLight text-heiba-accent hover:underline"
              >
                {isRtl ? 'ترقية لـ PRO' : 'Upgrade to Pro'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Style Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl p-3 border border-heiba-border shadow-soft text-center">
          <Shirt className="w-4 h-4 mx-auto text-amber-800 mb-1" />
          <span className="text-base font-extrabold text-heiba-text block">
            {wardrobe.length}
          </span>
          <span className="text-[10px] text-heiba-secondary font-medium">
            {isRtl ? 'قطع ملابس' : 'Garments'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3 border border-heiba-border shadow-soft text-center">
          <Bookmark className="w-4 h-4 mx-auto text-blue-700 mb-1" />
          <span className="text-base font-extrabold text-heiba-text block">
            {savedOutfits.length}
          </span>
          <span className="text-[10px] text-heiba-secondary font-medium">
            {isRtl ? 'لوكات محفوظة' : 'Saved Looks'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3 border border-heiba-border shadow-soft text-center">
          <Award className="w-4 h-4 mx-auto text-emerald-700 mb-1" />
          <span className="text-base font-extrabold text-heiba-text block">
            88
          </span>
          <span className="text-[10px] text-heiba-secondary font-medium">
            {isRtl ? 'مستوى الستايل' : 'Style Score'}
          </span>
        </div>
      </div>

      {/* "My Style DNA" Card */}
      {user.styleIdentity ? (
        <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-heiba-peach text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-heiba-accent" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-heiba-text">
                  {isRtl ? 'هويتي في الأناقة (Style DNA)' : 'My Style DNA'}
                </h3>
                <p className="text-[10px] text-heiba-secondary">
                  {isRtl ? user.styleIdentity?.nameAr : user.styleIdentity?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('onboarding')}
              className="text-[11px] font-bold text-heiba-accent hover:underline"
            >
              {isRtl ? 'إعادة الاختبار' : 'Retake Quiz'}
            </button>
          </div>

          <p className="text-xs text-heiba-secondary leading-relaxed">
            {isRtl ? user.styleIdentity?.descriptionAr : user.styleIdentity?.description}
          </p>

          {/* Favorite Colors Bar */}
          {user.styleIdentity?.bestColors && (
            <div>
              <span className="text-[11px] font-bold text-heiba-text block mb-1.5">
                {isRtl ? 'ألوانك المفضلة والموصى بها:' : 'Optimal Color Harmony:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user.styleIdentity.bestColors.map((c, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-heiba-bg border border-heiba-border font-medium flex items-center gap-1.5"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.hex }}
                    ></span>
                    <span>{isRtl ? c.nameAr : c.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fits */}
          <div>
            <span className="text-[11px] font-bold text-heiba-text block mb-1.5">
              {isRtl ? 'القصات المفضلة:' : 'Silhouette & Fits:'}
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-heiba-secondary">
              {(isRtl
                ? user.styleIdentity?.recommendedFitsAr
                : user.styleIdentity?.recommendedFits
              )?.map((fit, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-heiba-lavender text-purple-900 font-semibold"
                >
                  {fit}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-heiba-border shadow-card space-y-3.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-heiba-peach text-amber-700 flex items-center justify-center mx-auto shadow-soft">
            <Sparkles className="w-6 h-6 text-heiba-accent" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-heiba-text">
              {isRtl ? 'لم تكتشف هويتك في الأناقة بعد' : 'Discover Your Style Identity'}
            </h3>
            <p className="text-xs text-heiba-secondary max-w-xs mx-auto mt-1 leading-relaxed">
              {isRtl
                ? 'أجب عن بضعة أسئلة سريعة لنحدد نمطك المفضل، وألوانك المثالية، والقصات الأكثر ملاءمة لبنيتك.'
                : 'Take our tailored quiz to unlock your optimal color palette, best garment silhouettes, and unique style DNA.'}
            </p>
          </div>
          <button
            onClick={() => setCurrentView('onboarding')}
            className="py-2.5 px-5 bg-heiba-accent text-white rounded-2xl text-xs font-bold shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRtl ? 'بدء استشارة الأسلوب' : 'Start Style Quiz'}</span>
          </button>
        </div>
      )}

      {/* App Preferences & Settings */}
      <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-soft space-y-3">
        <h4 className="font-extrabold text-xs text-heiba-text uppercase tracking-wider">
          {isRtl ? 'الإعدادات واللغة' : 'Settings & Preferences'}
        </h4>

        {/* Language Switch */}
        <div className="flex items-center justify-between py-2 border-b border-heiba-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-heiba-text">
            <Globe className="w-4 h-4 text-heiba-secondary" />
            <span>{isRtl ? 'لغة التطبيق' : 'Language'}</span>
          </div>
          <div className="flex items-center gap-1 bg-heiba-bg p-1 rounded-xl border border-heiba-border">
            <button
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'ar' ? 'bg-heiba-accent text-white shadow-soft' : 'text-heiba-secondary'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'en' ? 'bg-heiba-accent text-white shadow-soft' : 'text-heiba-secondary'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Currency Switch */}
        <div className="flex items-center justify-between py-2 border-b border-heiba-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-heiba-text">
            <DollarSign className="w-4 h-4 text-heiba-secondary" />
            <span>{isRtl ? 'العملة المعروضة' : 'Currency'}</span>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="px-3 py-1 bg-heiba-bg border border-heiba-border rounded-xl text-xs font-bold text-heiba-text outline-none"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>

        {/* Privacy Link */}
        <button
          onClick={() => setCurrentView('privacy')}
          className="w-full flex items-center justify-between py-2 text-xs font-semibold text-heiba-text hover:text-heiba-accent transition-colors"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-heiba-secondary" />
            <span>{isRtl ? 'سياسة الخصوصية وأمان الصور' : 'Privacy & Photo Security'}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-heiba-secondary" />
        </button>

        {/* Demo reset */}
        <div className="pt-2 border-t border-heiba-border flex items-center justify-between">
          <span className="text-xs text-heiba-secondary">
            {isRtl ? 'استعادة البيانات التجريبية الافتراضية' : 'Reset sample demo data'}
          </span>
          <button
            onClick={resetDemoData}
            className="px-3 py-1 bg-heiba-bg border border-heiba-border text-xs font-bold rounded-xl text-heiba-text hover:bg-heiba-beige"
          >
            {isRtl ? 'إعادة ضبط' : 'Reset'}
          </button>
        </div>
      </div>
    </div>
  );
}
