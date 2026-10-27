'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { SHOPPING_RECOMMENDATIONS } from '@/lib/mock-data';
import { ShoppingBag, Sparkles, DollarSign, Check, Layers, ArrowRight, ArrowLeft } from 'lucide-react';
import { Currency } from '@/types/heiba';

export function ShoppingView() {
  const { isRtl, t, currency, formatPrice, setCurrentView } = useHeiba();
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-black text-heiba-text flex items-center gap-2">
          <span>{isRtl ? 'المساعد الذكي للتسوق' : 'Smart Shopping Assistant'}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-800"></span>
        </h1>
        <p className="text-xs text-heiba-secondary">
          {isRtl
            ? 'أكمل نواقص خزانتك بأعلى قيمة لمظهرك دون إهدار أموالك'
            : 'Fill wardrobe gaps with highest cost-per-wear versatility'}
        </p>
      </div>

      {/* Wardrobe Gap Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-heiba-beige text-amber-900 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-heiba-text">
              {isRtl ? 'تحليل نواقص خزانتك الفعلية' : 'Wardrobe Gap Analysis'}
            </h3>
            <p className="text-[10px] text-heiba-secondary">
              {isRtl ? 'قطع تضاعف عدد إطلالاتك الحالية فوراً' : 'Staples that double your outfit combinations'}
            </p>
          </div>
        </div>

        <p className="text-xs text-heiba-secondary leading-relaxed">
          {isRtl
            ? 'بناءً على ملابسك المسجلة، إضافة سروال تشينو بيج وحزام جلد مضفور سيمنحك أكثر من 14 إطلالة متناسقة جديدة دون الحاجة لشراء ملابس كاملة مكلفة.'
            : 'Based on your existing garments, acquiring beige pleated chinos and a woven leather belt unlocks over 14 distinct cohesive outfits.'}
        </p>

        {/* Cost per wear concept box */}
        <div className="p-3 rounded-2xl bg-heiba-bg border border-heiba-border text-[11px] text-heiba-text">
          <strong className="block text-heiba-accent mb-0.5">
            {isRtl ? '💡 معادلة تكلفة الارتداء (Cost Per Wear):' : '💡 Cost-Per-Wear Principle:'}
          </strong>
          <span className="text-heiba-secondary">
            {isRtl
              ? 'القطعة المتقنة التي ترتديها 50 مرة تكلفك أقل بكثير من قطعة رخيصة ترتديها مرتين فقط ثم تبقى معلقة في الخزانة.'
              : 'A premium staple worn 50 times delivers vastly higher ROI than a cheap impulse buy worn twice.'}
          </span>
        </div>
      </div>

      {/* Recommended Garments List */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-heiba-text uppercase tracking-wider">
          {isRtl ? 'القطع الأساسية الموصى بها لك' : 'Recommended Capsule Staples'}
        </h3>

        {SHOPPING_RECOMMENDATIONS.map((item) => {
          const priceSAR = item.estimatedPrice.SAR;
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 border border-heiba-border shadow-soft flex gap-3.5 items-start"
            >
              {/* Thumbnail */}
              <div className="w-20 h-24 rounded-2xl overflow-hidden bg-heiba-bg shrink-0 border border-heiba-border">
                <img
                  src={item.sampleImageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.priority === 'must_have'
                      ? isRtl
                        ? 'أولوية قصوى'
                        : 'Must Have'
                      : isRtl
                      ? 'موصى بها'
                      : 'Recommended'}
                  </span>
                  <span className="font-black text-xs text-heiba-text">
                    {formatPrice(priceSAR)}
                  </span>
                </div>

                <h4 className="font-extrabold text-xs text-heiba-text truncate">
                  {isRtl ? item.titleAr : item.title}
                </h4>

                <p className="text-[11px] text-heiba-secondary leading-snug mt-1">
                  {isRtl ? item.reasonAr : item.reason}
                </p>

                {/* Pairs with */}
                <div className="mt-2 text-[10px] font-bold text-amber-900 bg-heiba-peach/60 px-2 py-0.5 rounded-lg inline-block">
                  {isRtl
                    ? `يتناسق مع ${item.pairsWithItemsCount} قطع في خزانتك`
                    : `Pairs with ${item.pairsWithItemsCount} existing items`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
