'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { ClothingCategory, WardrobeItem } from '@/types/heiba';
import {
  Plus,
  Search,
  Heart,
  Filter,
  Trash2,
  Sparkles,
  Shirt,
  Info,
} from 'lucide-react';
import { AddItemModal } from '@/components/modals/AddItemModal';

export function WardrobeView() {
  const {
    wardrobe,
    removeWardrobeItem,
    toggleFavoriteItem,
    wardrobeInsights,
    setCurrentView,
    isRtl,
    t,
  } = useHeiba();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');

  // Filter items
  const filteredItems = wardrobe.filter((item) => {
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.nameAr && item.nameAr.includes(searchQuery)) ||
      (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesColor =
      selectedColor === 'all' || item.color === selectedColor;

    return matchesSearch && matchesCategory && matchesColor;
  });

  const categories = Object.keys(t.categories) as ClothingCategory[];

  // Collect unique colors in wardrobe
  const availableColors = Array.from(new Set(wardrobe.map((i) => i.color)));

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-heiba-text flex items-center gap-2">
            <span>{t.wardrobe.title}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-heiba-beige text-amber-900">
              {wardrobe.length} {isRtl ? 'قطع' : 'items'}
            </span>
          </h1>
          <p className="text-xs text-heiba-secondary">
            {t.wardrobe.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="p-3 bg-heiba-accent text-white rounded-2xl shadow-coral hover:bg-heiba-accentHover active:scale-95 transition-all flex items-center gap-1 text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إضافة قطعة' : 'Add Item'}</span>
        </button>
      </div>

      {/* Real Wardrobe Insights Card */}
      <div className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-heiba-beige text-amber-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-heiba-text">
                {t.wardrobe.insightsTitle}
              </h3>
              <p className="text-[10px] text-heiba-secondary">
                {isRtl ? 'تحليل مبني على قطع ملابسك الحقيقية' : 'Based on your actual garments'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('shopping')}
            className="text-[11px] font-bold text-heiba-accent hover:underline"
          >
            {isRtl ? 'عرض المقترحات' : 'View Suggestions'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-heiba-bg border border-heiba-border flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: wardrobeInsights.topColor.hex }}
            ></span>
            <div className="min-w-0">
              <span className="text-[10px] text-heiba-secondary block truncate">
                {t.wardrobe.topColor}
              </span>
              <span className="font-bold text-heiba-text truncate block">
                {wardrobeInsights.topColor.name} ({wardrobeInsights.topColor.count})
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-heiba-peach/60 border border-heiba-peachDark flex items-center gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-amber-900 block truncate font-semibold">
                {t.wardrobe.missingPiece}
              </span>
              <span className="font-bold text-heiba-text truncate block">
                {isRtl ? wardrobeInsights.missingPiece.nameAr : wardrobeInsights.missingPiece.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-heiba-secondary absolute top-3.5 left-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.wardrobe.searchPlaceholder}
          className="w-full py-2.5 pl-10 pr-4 bg-white border border-heiba-border rounded-2xl text-xs text-heiba-text placeholder-heiba-secondary focus:border-heiba-accent outline-none shadow-soft"
        />
      </div>

      {/* Category Filter Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-2xl transition-all ${
            selectedCategory === 'all'
              ? 'bg-heiba-text text-white shadow-soft'
              : 'bg-white border border-heiba-border text-heiba-secondary hover:text-heiba-text'
          }`}
        >
          {t.wardrobe.allCategories}
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-2xl transition-all ${
              selectedCategory === cat
                ? 'bg-heiba-accent text-white shadow-coral'
                : 'bg-white border border-heiba-border text-heiba-secondary hover:text-heiba-text'
            }`}
          >
            {t.categories[cat]}
          </button>
        ))}
      </div>

      {/* Garments Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-heiba-border shadow-soft text-center my-6 space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-heiba-beige text-amber-900 flex items-center justify-center mx-auto">
            <Shirt className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-heiba-text">
            {t.wardrobe.emptyTitle}
          </h3>
          <p className="text-xs text-heiba-secondary max-w-xs mx-auto leading-relaxed">
            {t.wardrobe.emptySub}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-5 bg-heiba-accent text-white rounded-2xl text-xs font-bold shadow-coral hover:bg-heiba-accentHover inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t.wardrobe.addFirstItem}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-3 border border-heiba-border shadow-soft flex flex-col justify-between hover:border-heiba-borderHover transition-all group relative"
            >
              {/* Photo Container */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-heiba-bg mb-2.5">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />

                {/* Favorite Toggle Button */}
                <button
                  onClick={() => toggleFavoriteItem(item.id)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md shadow-soft transition-colors ${
                    item.isFavorite
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-white/80 text-heiba-secondary hover:text-rose-600'
                  }`}
                  title="Favorite"
                >
                  <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
                </button>

                {/* Color Swatch Badge */}
                <span
                  className="absolute bottom-2 left-2 w-4 h-4 rounded-full border-2 border-white shadow-soft"
                  style={{ backgroundColor: item.colorHex }}
                  title={item.color}
                ></span>
              </div>

              {/* Garment Details */}
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-heiba-secondary block">
                  {t.categories[item.category]}
                </span>
                <h4 className="font-extrabold text-xs text-heiba-text truncate mt-0.5">
                  {isRtl ? item.nameAr || item.name : item.name}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-heiba-secondary mt-1">
                  <span>{item.brand || item.material || 'Linen'}</span>
                  <span>{item.wearCount || 0} {isRtl ? 'لبسة' : 'wears'}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-heiba-border/60 mt-2">
                <button
                  onClick={() => setCurrentView('generator')}
                  className="text-[10px] font-bold text-heiba-accent hover:underline flex items-center gap-0.5"
                >
                  <span>{isRtl ? 'نسّق معها' : 'Style with this'}</span>
                </button>
                <button
                  onClick={() => removeWardrobeItem(item.id)}
                  className="p-1 text-heiba-secondary hover:text-rose-600 transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
