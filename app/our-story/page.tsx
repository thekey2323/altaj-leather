'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandHeader } from '@/components/brand/BrandHeader';
import { BrandFooter } from '@/components/brand/BrandFooter';
import { useLanguage } from '@/context/LanguageContext';

export default function OurStoryPage() {
  const { lang, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#1E1916]" dir={isRtl ? 'rtl' : 'ltr'}>
      <BrandHeader />

      <main className="flex-1 pb-16">
        {/* HERO HEADER */}
        <div className="bg-[#191514] text-white py-12 sm:py-16 px-4 text-center border-b border-[#2F2520]">
          <div className="max-w-3xl mx-auto space-y-2.5">
            <span className="text-[11px] font-bold text-[#D9A74A] uppercase tracking-wider bg-[#2E241E] px-3 py-1 rounded-full border border-[#44362C]">
              {lang === 'ar' ? 'حرفية مغربية أصيلة' : 'Artisanat Marocain Authentique'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-serif">
              {lang === 'ar' ? 'قصة دار التاج للمصنوعات الجلدية' : 'L’Histoire de la Maison ALTAJ'}
            </h1>
            <p className="text-xs sm:text-sm text-[#C4B7AC] max-w-lg mx-auto">
              {lang === 'ar'
                ? 'جلد طبيعي 100% مدبوغ نباتياً ومصنوع يدوياً حبة بحبة ليدوم معك طويلاً.'
                : '100% cuir naturel tanné végétalement, façonné à la main avec passion.'}
            </p>
          </div>
        </div>

        {/* SECTION 1: CRAFTSMANSHIP */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-[#E8DFD3]">
              <Image
                src="/images/products/cognac-minimalist.jpg"
                alt="ALTAJ Leathercraft"
                fill
                className="object-cover"
              />
            </div>

            <div className={`space-y-3.5 ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="text-[11px] font-bold text-[#8C5E35] bg-[#F3EBE0] px-3 py-1 rounded-full border border-[#DECDBB]">
                {lang === 'ar' ? 'فلسفتنا' : 'Notre Philosophie'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1E1916]">
                {lang === 'ar' ? 'لماذا أنشأنا علامة «التاج»؟' : 'Pourquoi Choisir ALTAJ LEATHER ?'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5046] leading-relaxed">
                {lang === 'ar'
                  ? 'أردنا إعادة الاعتبار للصناعة اليدوية المغربية الأصيلة، بعيداً عن المنتجات الكيماوية والجلود الاصطناعية سريعة التلف.'
                  : 'Nous redonnons vie à l’artisanat marocain d’exception, loin des simili-cuirs industriels et polluants.'}
              </p>
              <p className="text-xs sm:text-sm text-[#5C5046] leading-relaxed">
                {lang === 'ar'
                  ? 'نختار حصراً الطبقة الأولى من الجلد الطبيعي (Full Grain) المدبوغ نباتياً بمستخلصات لحاء الشجر الطبيعي، مع خياطة السراجة اليدوية المشدودة بخيط مشمع لا ينحل أبداً.'
                  : 'Nous sélectionnons exclusivement le cuir naturel pleine fleur tanné aux extraits végétaux, assemblé avec le point sellier inaltérable.'}
              </p>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="bg-white p-2.5 rounded-xl border border-[#EAE1D5] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#28A745]" />
                  <span>{lang === 'ar' ? '100% جلد طبيعي' : '100% Cuir Naturel'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#EAE1D5] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#28A745]" />
                  <span>{lang === 'ar' ? 'خياطة سراجة يدوية' : 'Couture Sellier Main'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: 4 STEPS */}
        <div className="bg-white py-12 border-y border-[#ECE4D8]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-[#1E1916]">
                {lang === 'ar' ? 'مراحل الصنع اليدوي' : 'Étapes de Fabrication Artisanale'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`bg-[#FCFAF7] p-4 rounded-xl border border-[#EAE1D5] space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] text-[#8C5E35] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1E1916]">
                  {lang === 'ar' ? 'انتقاء الجلد الطبيعي' : 'Sélection du Cuir'}
                </h4>
                <p className="text-[11px] text-[#6E6157] leading-relaxed">
                  {lang === 'ar' ? 'نعتمد فقط على الجلد الطبيعي المدبوغ نباتياً.' : 'Sélection rigoureuse de cuir naturel végétal.'}
                </p>
              </div>

              <div className={`bg-[#FCFAF7] p-4 rounded-xl border border-[#EAE1D5] space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] text-[#8C5E35] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1E1916]">
                  {lang === 'ar' ? 'القص اليدوي الدقيق' : 'Découpe à la Main'}
                </h4>
                <p className="text-[11px] text-[#6E6157] leading-relaxed">
                  {lang === 'ar' ? 'قص يدوي بسكاكين حادة لضمان مقاسات مثالية.' : 'Découpe précise aux dimensions exactes.'}
                </p>
              </div>

              <div className={`bg-[#FCFAF7] p-4 rounded-xl border border-[#EAE1D5] space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] text-[#8C5E35] flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1E1916]">
                  {lang === 'ar' ? 'خياطة السراجة اليدوية' : 'Couture Sellier'}
                </h4>
                <p className="text-[11px] text-[#6E6157] leading-relaxed">
                  {lang === 'ar' ? 'غرز بإبرتين وخيط مشمع لا ينحل أبداً.' : 'Point sellier fait main au fil ciré résistant.'}
                </p>
              </div>

              <div className={`bg-[#FCFAF7] p-4 rounded-xl border border-[#EAE1D5] space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] text-[#8C5E35] flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1E1916]">
                  {lang === 'ar' ? 'تغليف كرافت أنيق' : 'Emballage Kraft'}
                </h4>
                <p className="text-[11px] text-[#6E6157] leading-relaxed">
                  {lang === 'ar' ? 'تغليف كرافت يحمي القطعة مع بطاقة الضمان.' : 'Emballage kraft protecteur avec certificat.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto px-4 pt-10 text-center space-y-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8C5E35] to-[#5A381E] text-white font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <span>{lang === 'ar' ? 'استكشف التشكيلة الملكية' : 'Découvrir la Collection'}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
}
