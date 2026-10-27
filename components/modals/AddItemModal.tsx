'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { ClothingCategory, FitPreference, WardrobeItem } from '@/types/heiba';
import { X, Upload, Sparkles, Camera, Check, AlertCircle } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_GARMENTS = [
  {
    name: 'Olive Cotton Overshirt',
    nameAr: 'أوفرشيرت زيتي خفيف',
    category: 'jackets' as ClothingCategory,
    color: 'Olive Green',
    colorHex: '#4A5320',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=600&q=80',
    material: 'Cotton Twill',
    formality: 'casual' as const,
  },
  {
    name: 'Crisp Light Blue Oxford Shirt',
    nameAr: 'قميص أكسفورد أزرق سماوي',
    category: 'shirts' as ClothingCategory,
    color: 'Sky Blue',
    colorHex: '#A0C4E2',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    material: '100% Oxford Cotton',
    formality: 'smart_casual' as const,
  },
  {
    name: 'Tobacco Suede Penny Loafers',
    nameAr: 'حذاء لوفر جلد سويد بني هادئ',
    category: 'shoes' as ClothingCategory,
    color: 'Tobacco Brown',
    colorHex: '#8B5A2B',
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
    material: 'Italian Suede',
    formality: 'smart_casual' as const,
  },
  {
    name: 'Woven Textured Brown Belt',
    nameAr: 'حزام جلد بني مضفور',
    category: 'belts' as ClothingCategory,
    color: 'Brown',
    colorHex: '#6B4226',
    imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80',
    material: 'Braided Leather',
    formality: 'smart_casual' as const,
  },
];

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const { addWardrobeItem, isRtl, t } = useHeiba();

  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
  );
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('shirts');
  const [color, setColor] = useState('Beige');
  const [colorHex, setColorHex] = useState('#E6DCB8');
  const [material, setMaterial] = useState('Linen');
  const [fit, setFit] = useState<FitPreference>('regular');
  const [season, setSeason] = useState<'summer' | 'winter' | 'all_season' | 'transitional'>('all_season');
  const [formality, setFormality] = useState<'casual' | 'smart_casual' | 'formal'>('smart_casual');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState<number | undefined>(undefined);

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiDetectedSuccess, setAiDetectedSuccess] = useState(false);

  if (!isOpen) return null;

  const categories = Object.keys(t.categories) as ClothingCategory[];

  const handleSelectPreset = (preset: (typeof PRESET_GARMENTS)[0]) => {
    setImageUrl(preset.imageUrl);
    setName(preset.name);
    setNameAr(preset.nameAr);
    setCategory(preset.category);
    setColor(preset.color);
    setColorHex(preset.colorHex);
    setMaterial(preset.material);
    setFormality(preset.formality);
    setAiDetectedSuccess(true);
  };

  const handleAiAutoTag = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/tag-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemNameHint: name || nameAr }),
      });
      const data = await res.json();
      if (data.name) setName(data.name);
      if (data.nameAr) setNameAr(data.nameAr);
      if (data.category) setCategory(data.category);
      if (data.color) setColor(data.color);
      if (data.colorHex) setColorHex(data.colorHex);
      if (data.material) setMaterial(data.material);
      if (data.fit) setFit(data.fit);
      if (data.formality) setFormality(data.formality);
      setAiDetectedSuccess(true);
    } catch (e) {
      console.warn('Fallback tagging');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWardrobeItem({
      name: name || 'New Garment',
      nameAr: nameAr || name || 'قطعة جديدة',
      category,
      color,
      colorHex,
      material,
      fit,
      season,
      formality,
      brand: brand || undefined,
      price: price || undefined,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-float border border-heiba-border max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-heiba-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-heiba-beige flex items-center justify-center text-amber-800">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-heiba-text text-base">
                {isRtl ? 'إضافة قطعة ملابس جديدة' : 'Add Clothing Item'}
              </h3>
              <p className="text-xs text-heiba-secondary">
                {isRtl ? 'التقط صورة وسيتعرف الذكاء الاصطناعي على التفاصيل' : 'Snap photo or select item attributes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-heiba-bg flex items-center justify-center text-heiba-secondary hover:text-heiba-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Quick presets for test */}
          <div>
            <span className="text-[11px] font-bold text-heiba-secondary uppercase tracking-wider block mb-1.5">
              {isRtl ? 'أو اختر نموذجاً جاهزاً للتجربة السريعة:' : 'Or tap a preset item to test instantly:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_GARMENTS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-heiba-border hover:border-heiba-accent bg-heiba-bg text-left transition-colors"
                >
                  <img src={preset.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-heiba-text truncate">
                      {isRtl ? preset.nameAr : preset.name}
                    </p>
                    <p className="text-[9px] text-heiba-secondary truncate">{preset.color}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Preview & AI Button */}
          <div className="relative rounded-2xl overflow-hidden border border-heiba-border bg-heiba-bg group h-44 flex items-center justify-center">
            <img src={imageUrl} alt="Garment" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
              <button
                type="button"
                onClick={handleAiAutoTag}
                className="px-4 py-2 rounded-xl bg-white text-heiba-text text-xs font-bold shadow-soft flex items-center gap-2 hover:bg-heiba-lavender"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{isRtl ? 'إعادة الفحص بالذكاء الاصطناعي' : 'Re-scan with AI'}</span>
              </button>
            </div>

            {/* AI Auto-tag pill */}
            <button
              type="button"
              onClick={handleAiAutoTag}
              disabled={isAiAnalyzing}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-card border border-heiba-border text-xs font-bold text-heiba-text flex items-center gap-1.5 hover:bg-heiba-lavender transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>
                {isAiAnalyzing
                  ? isRtl
                    ? 'جاري الكشف...'
                    : 'Analyzing...'
                  : isRtl
                  ? 'التعرف التلقائي AI'
                  : 'AI Auto-Tag'}
              </span>
            </button>
          </div>

          {aiDetectedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isRtl
                  ? 'تم التعرف التلقائي بنجاح! يمكنك مراجعة وتعديل الحقول بالأسفل.'
                  : 'AI recognized attributes! You can adjust any field before saving.'}
              </span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-heiba-text mb-1">
                {isRtl ? 'اسم القطعة بالعربية' : 'Garment Name (Arabic)'}
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: قميص كتان بيج كاجوال"
                className="w-full px-3 py-2 bg-heiba-bg border border-heiba-border rounded-xl text-xs text-heiba-text focus:border-heiba-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-heiba-text mb-1">
                {isRtl ? 'اسم القطعة بالإنجليزية' : 'Garment Name (English)'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Beige Linen Button Shirt"
                className="w-full px-3 py-2 bg-heiba-bg border border-heiba-border rounded-xl text-xs text-heiba-text focus:border-heiba-accent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-heiba-text mb-1">
                  {isRtl ? 'التصنيف' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                  className="w-full px-3 py-2 bg-heiba-bg border border-heiba-border rounded-xl text-xs text-heiba-text focus:border-heiba-accent outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t.categories[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-heiba-text mb-1">
                  {isRtl ? 'اللون والرمز' : 'Color'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-heiba-border p-0.5"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-2.5 py-2 bg-heiba-bg border border-heiba-border rounded-xl text-xs text-heiba-text outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-heiba-text mb-1">
                  {isRtl ? 'الخامة' : 'Material'}
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Linen / Cotton / Suede"
                  className="w-full px-3 py-2 bg-heiba-bg border border-heiba-border rounded-xl text-xs text-heiba-text outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-heiba-text mb-1">
                  {isRtl ? 'الرسمية' : 'Formality'}
                </label>
                <select
                  value={formality}
                  onChange={(e) => setFormality(e.target.value as any)}
                  className="w-full px-3 py-2 bg-heiba-bg border border-heiba-border rounded-xl text-xs text-heiba-text outline-none"
                >
                  <option value="casual">{isRtl ? 'كاجوال يومي' : 'Casual'}</option>
                  <option value="smart_casual">{isRtl ? 'سمارت كاجوال' : 'Smart Casual'}</option>
                  <option value="formal">{isRtl ? 'رسمي' : 'Formal'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-heiba-text mb-1">
                  {isRtl ? 'الماركة (اختياري)' : 'Brand (Optional)'}
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Massimo Dutti / Zara"
                  className="w-full px-3 py-2 bg-heiba-bg border border-heiba-border rounded-xl text-xs text-heiba-text outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-heiba-text mb-1">
                  {isRtl ? 'سعر الشراء التقريبي' : 'Price'}
                </label>
                <input
                  type="number"
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value) || undefined)}
                  placeholder="250"
                  className="w-full px-3 py-2 bg-heiba-bg border border-heiba-border rounded-xl text-xs text-heiba-text outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-heiba-accent text-white rounded-2xl font-bold text-sm shadow-coral hover:bg-heiba-accentHover active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isRtl ? 'حفظ القطعة في خزانتي' : 'Save to My Wardrobe'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
