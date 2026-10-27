'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getAllProducts, adaptStoreProductToLuxury, LuxuryProduct } from '@/data/altajProducts';
import { BrandHeader } from '@/components/brand/BrandHeader';
import { BrandFooter } from '@/components/brand/BrandFooter';
import { useLanguage } from '@/context/LanguageContext';
import { getProducts } from '@/lib/db/store';

export default function ProductsCatalogPage() {
  const { lang, isRtl } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [catalogProducts, setCatalogProducts] = useState<LuxuryProduct[]>(getAllProducts);

  useEffect(() => {
    try {
      const stored = getProducts();
      if (Array.isArray(stored) && stored.length > 0) {
        setCatalogProducts(stored.map(adaptStoreProductToLuxury));
      }
    } catch {}
  }, []);

  const categories = lang === 'ar'
    ? [
        { id: 'all', label: 'جميع الموديلات' },
        { id: 'wallets', label: 'محافظ الجيب' },
        { id: 'travel', label: 'إكسسوارات السفر' },
        { id: 'cardholders', label: 'حاملات البطاقات' },
      ]
    : [
        { id: 'all', label: 'Tous les Modèles' },
        { id: 'wallets', label: 'Portefeuilles' },
        { id: 'travel', label: 'Voyage' },
        { id: 'cardholders', label: 'Porte-Cartes' },
      ];

  const filteredProducts =
    selectedCategory === 'all'
      ? catalogProducts
      : catalogProducts.filter((p) => p.category === selectedCategory);


  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#1E1916]" dir={isRtl ? 'rtl' : 'ltr'}>
      <BrandHeader />

      <main className="flex-1 pb-16">
        {/* HERO INTRO - Short & Minimal */}
        <div className="bg-[#191514] text-white py-10 sm:py-14 px-4 text-center border-b border-[#2F2520]">
          <div className="max-w-3xl mx-auto space-y-2.5">
            <span className="text-[11px] font-bold text-[#D9A74A] uppercase tracking-wider bg-[#2E241E] px-3 py-1 rounded-full border border-[#44362C]">
              {lang === 'ar' ? '100% جلد طبيعي' : '100% Cuir Naturel Fait Main'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-serif">
              {lang === 'ar' ? 'التشكيلة الملكية — ALTAJ' : 'La Collection ALTAJ LEATHER'}
            </h1>
            <p className="text-xs sm:text-sm text-[#C4B7AC] max-w-lg mx-auto">
              {lang === 'ar'
                ? 'عرض خاص: 1 بـ 129 درهم | 2 بـ 189 درهم مع توصيل مجاني ودفع عند الاستلام.'
                : 'Offre Duo : 1 pour 129 DH | 2 pour 189 DH. Livraison gratuite et paiement à la livraison.'}
            </p>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#8C5E35] text-white shadow-xs'
                    : 'bg-white text-[#5C5046] border border-[#E8DFD3] hover:bg-[#FAF4EC]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID (2 columns on mobile, 4 on desktop) */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => {
              const prodTitle = lang === 'ar' ? product.arabicName : product.frenchName;
              const prodSubtitle = lang === 'ar' ? product.subtitle : product.frenchSubtitle;
              const prodCategory = lang === 'ar' ? product.categoryArabic : product.categoryFrench;
              const prodBadge = lang === 'ar' ? product.badge : product.frenchBadge;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-[#E8DFD3] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative aspect-square w-full block overflow-hidden bg-[#FAF6F0]"
                    >
                      <Image
                        src={product.featuredImage}
                        alt={prodTitle}
                        fill
                        sizes="(max-width: 768px) 50vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute top-2 ${isRtl ? 'right-2' : 'left-2'} px-2 py-0.5 rounded-full bg-[#1A1615]/85 text-[#FFDE9E] text-[9.5px] font-bold`}>
                        {prodBadge}
                      </div>
                    </Link>

                    <div className={`p-3 space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <span className="text-[10px] font-semibold text-[#8C5E35]">
                        {prodCategory}
                      </span>
                      <Link href={`/products/${product.slug}`} className="block">
                        <h3 className="font-bold text-xs sm:text-sm text-[#1E1916] group-hover:text-[#8C5E35] transition-colors leading-snug line-clamp-2">
                          {prodTitle}
                        </h3>
                      </Link>
                      <p className="text-[10.5px] text-[#7A6E63] line-clamp-1">
                        {prodSubtitle}
                      </p>

                      <div className="pt-1.5 border-t border-[#F5EFE8] space-y-0.5 text-[10.5px] text-[#5C5046] hidden sm:block">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#28A745] shrink-0" />
                          <span>{lang === 'ar' ? '100% جلد طبيعي' : '100% Cuir Naturel'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 pt-0">
                    <div className={`bg-[#FAF7F2] p-2 rounded-xl border border-[#EAE1D5] mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm font-black text-[#8C5E35]">
                        {product.price} <span className="text-[10px] font-bold">DH</span>
                      </div>
                      <div className="text-[9.5px] text-[#28A745] font-semibold">
                        {lang === 'ar' ? 'عرض 2 بـ 189 د.م' : 'Duo à 189 DH'}
                      </div>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#8C5E35] to-[#5A381E] text-white text-[11px] sm:text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <span>{lang === 'ar' ? 'طلب ومعاينة' : 'Commander'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* MINIMALIST FOOTER */}
      <BrandFooter />
    </div>
  );
}
