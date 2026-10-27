'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  Star,
  Award,
  ArrowDown,
  ShoppingBag,
  Eye,
  Check,
  MessageCircle,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { BrandHeader } from '@/components/brand/BrandHeader';
import { BrandFooter } from '@/components/brand/BrandFooter';
import { LUXURY_PRODUCTS, getAllProducts, adaptStoreProductToLuxury, LuxuryProduct } from '@/data/altajProducts';
import { useLanguage } from '@/context/LanguageContext';
import { getProducts } from '@/lib/db/store';

export function AltajLandingPage() {
  const { lang, isRtl } = useLanguage();
  const [productsList, setProductsList] = useState<LuxuryProduct[]>(getAllProducts);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  // Synchronize products dynamically with store / admin updates
  useEffect(() => {
    const syncProducts = async () => {
      try {
        const stored = getProducts();
        if (Array.isArray(stored) && stored.length > 0) {
          const adapted = stored.map(adaptStoreProductToLuxury);
          setProductsList(adapted);
          return;
        }
        const res = await fetch('/api/products');
        if (res.ok) {
          const apiProds = await res.json();
          if (Array.isArray(apiProds) && apiProds.length > 0) {
            setProductsList(apiProds.map(adaptStoreProductToLuxury));
          }
        }
      } catch {
        // fallback
      }
    };
    syncProducts();
  }, []);

  const activeProduct = productsList[selectedProductIndex] || productsList[0] || LUXURY_PRODUCTS[0];

  const scrollToProducts = () => {

    const el = document.getElementById('products-collection');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const reviews = lang === 'ar'
    ? [
        {
          name: 'سفيان بناني',
          city: 'الدار البيضاء',
          date: 'منذ يومين',
          rating: 5,
          comment: 'تبارك الله، المحفظة رويال كونياك جودة الجلد الطبيعي ممتازة وخياطة متقونة. فحصت السلعة قبل ما نخلص الموزع.'
        },
        {
          name: 'عمر التازي',
          city: 'الرباط',
          date: 'منذ 4 أيام',
          rating: 5,
          comment: 'شريت عرض قطعتين بـ 189 درهم، تغليف كرافت أنيق وتوصيل سريع في 24 ساعة. تعامل راقي.'
        },
        {
          name: 'ياسين المودن',
          city: 'طنجة',
          date: 'منذ أسبوع',
          rating: 5,
          comment: 'غلاف جواز السفر فخم وعملي، الجلد الطبيعي سميك ولمسته نقية. خدمة احترافية.'
        },
        {
          name: 'مهدي الصقلي',
          city: 'مراكش',
          date: 'منذ أسبوعين',
          rating: 5,
          comment: 'أول تجربة ممتازة، جودة الجلد الطبيعي عالية والسعر مناسب جداً مقارنة بالإتقان.'
        }
      ]
    : [
        {
          name: 'Soufiane Bennani',
          city: 'Casablanca',
          date: 'Il y a 2 jours',
          rating: 5,
          comment: 'Superbe qualité en cuir naturel, coutures très soignées. Colis vérifié avant paiement au livreur.'
        },
        {
          name: 'Omar Tazi',
          city: 'Rabat',
          date: 'Il y a 4 jours',
          rating: 5,
          comment: 'Offre Duo 2 pièces à 189 DH excellente. Emballage kraft soigné et livraison rapide en 24h.'
        },
        {
          name: 'Yassine El Moden',
          city: 'Tanger',
          date: 'Il y a 1 semaine',
          rating: 5,
          comment: 'Protège-passeport raffiné et robuste en cuir naturel. Très pratique et service impeccable.'
        },
        {
          name: 'Mehdi Skalli',
          city: 'Marrakech',
          date: 'Il y a 2 semaines',
          rating: 5,
          comment: 'Excellente finition artisanale. Le cuir naturel est magnifique, je recommande vivement.'
        }
      ];

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      className="min-h-screen bg-[#FAF8F5] text-[#1E1916] font-sans selection:bg-[#8C5E35] selection:text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. TOP BRAND HEADER */}
      <BrandHeader />

      {/* 2. REFINED LUXURY HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-12 sm:pb-20 overflow-hidden border-b border-[#EAE3D8]">
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C99859]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8C5E35]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Brand Hero Text */}
            <div className={`lg:col-span-7 space-y-4 sm:space-y-5 order-2 lg:order-1 ${isRtl ? 'text-right' : 'text-left'}`}>
              
              {/* Minimalist Atelier Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7DC] border border-[#DECDBB] text-[#5A3E2A] text-xs font-bold shadow-xs">
                <Award className="w-3.5 h-3.5 text-[#B89563]" />
                <span>
                  {lang === 'ar'
                    ? 'دار التاج للمصنوعات الجلدية • 100% جلد طبيعي'
                    : 'ALTAJ LEATHER • 100% Cuir Naturel Fait Main'}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1E1916] leading-tight font-serif tracking-tight">
                {lang === 'ar' ? (
                  <>
                    فخامة الجلد الطبيعي المغربي
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#A66C38] via-[#B88746] to-[#5B3A1E]">
                      صناعة يدوية تدوم لأجيال
                    </span>
                  </>
                ) : (
                  <>
                    L'Élégance du Cuir Naturel
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A66C38] via-[#B88746] to-[#5B3A1E]">
                      Artisanat d'Exception Fait Main
                    </span>
                  </>
                )}
              </h1>

              {/* Minimalist Subtitle */}
              <p className="text-xs sm:text-sm text-[#5D5248] leading-relaxed max-w-xl">
                {lang === 'ar'
                  ? 'محافظ وإكسسوارات حصرية من الجلد الطبيعي 100%. خياطة سراجة يدوية متينة وتصميم نحيف يجمع بين الأناقة والراحة.'
                  : 'Maroquinerie de luxe en cuir 100% naturel. Couture sellier main au fil ciré, format compact et finitions épurées.'}
              </p>

              {/* Key Offer Pills */}
              <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-[#E8DFD3] inline-flex flex-wrap items-center gap-3 text-xs font-bold text-[#5A4031] shadow-xs">
                <span className="text-[#8C5E35] bg-[#FAF5EE] px-2.5 py-1 rounded-lg border border-[#EBDCCB]">
                  {lang === 'ar' ? 'قطعة بـ 129 د.م • قطعتان بـ 189 د.م' : '1 pour 129 DH • Duo à 189 DH'}
                </span>
                <span className="flex items-center gap-1 text-[#28A745]">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'توصيل مجاني بالمغرب' : 'Livraison gratuite'}</span>
                </span>
                <span className="flex items-center gap-1 text-[#3B82F6]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'معاينة قبل الدفع' : 'Inspection avant paiement'}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={scrollToProducts}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#9A6539] via-[#7B4D24] to-[#513014] text-white font-extrabold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#FFD182]" />
                  <span>{lang === 'ar' ? 'استكشف التشكيلة والطلب' : 'Découvrir la Collection'}</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <a
                  href="https://wa.me/212693148230?text=Bonjour%20Altajleather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-[#FAF6F0] text-[#5A3E2A] font-bold text-xs sm:text-sm border border-[#DECDBB] flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>{lang === 'ar' ? 'واتساب: 06 93 14 82 30' : 'WhatsApp : 06 93 14 82 30'}</span>
                </a>
              </div>

              {/* Social Proof Mini */}
              <div className="flex items-center gap-2 text-xs text-[#6F645A] pt-1">
                <div className="flex items-center gap-0.5 text-[#C48C2B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-[#1E1916]">4.9 / 5</span>
                <span className="text-[11px] text-[#7A6E63]">
                  ({lang === 'ar' ? '+120 زبون راضٍ بالمغرب' : '+120 avis vérifiés'})
                </span>
              </div>
            </div>

            {/* Right Column: Featured Piece Spotlight (Direct Click to Product Landing Page) */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#E6DDD0] shadow-xl">
                <Link
                  href={`/products/${activeProduct.slug}`}
                  className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F6F2EC] block group cursor-pointer"
                >
                  <Image
                    src={activeProduct.featuredImage}
                    alt={lang === 'ar' ? activeProduct.arabicName : activeProduct.frenchName}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} px-2.5 py-0.5 rounded-full bg-[#1A1615]/85 backdrop-blur-md text-[#FFDE9E] text-[10px] font-bold border border-[#B89563]/40`}>
                    {lang === 'ar' ? activeProduct.badge : activeProduct.frenchBadge}
                  </div>
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 backdrop-blur-2xs">
                    <Eye className="w-4 h-4 text-[#FFDE9E]" />
                    <span>{lang === 'ar' ? 'عرض التفاصيل والطلب' : 'Voir Détails & Commander'}</span>
                  </div>
                </Link>

                {/* Spotlight Meta */}
                <div className={`mt-3.5 space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8C5E35] bg-[#F8F2EB] px-2.5 py-0.5 rounded-lg border border-[#EBDCCB]">
                      {lang === 'ar' ? activeProduct.categoryArabic : activeProduct.categoryFrench}
                    </span>
                    <div className="text-sm sm:text-base font-black text-[#8C5E35]">
                      {activeProduct.price} DH <span className="text-[10px] text-gray-400 font-normal line-through">189 DH</span>
                    </div>
                  </div>

                  <Link href={`/products/${activeProduct.slug}`} className="block">
                    <h3 className="text-sm sm:text-base font-bold text-[#1E1916] hover:text-[#8C5E35] transition-colors leading-snug">
                      {lang === 'ar' ? activeProduct.arabicName : activeProduct.frenchName}
                    </h3>
                  </Link>
                  <p className="text-[11px] text-[#7A6E63] line-clamp-1">
                    {lang === 'ar' ? activeProduct.subtitle : activeProduct.frenchSubtitle}
                  </p>
                </div>

                {/* Model Selector Tabs */}
                <div className="mt-3 pt-3 border-t border-[#F0EBE3] flex items-center gap-2 overflow-x-auto pb-1">
                  {productsList.map((prod, idx) => (
                    <button
                      type="button"
                      key={prod.id}
                      onClick={() => setSelectedProductIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer shrink-0 ${
                        selectedProductIndex === idx
                          ? 'border-[#9A6539] shadow-xs ring-2 ring-[#9A6539]/20'
                          : 'border-[#EAE3D9] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={prod.featuredImage}
                        alt={lang === 'ar' ? prod.arabicName : prod.frenchName}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </button>
                  ))}
                </div>

                {/* Direct CTA Button to Product Page */}
                <div className="mt-3.5">
                  <Link
                    href={`/products/${activeProduct.slug}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#8C5E35] to-[#5A381E] text-white text-xs font-bold shadow-xs hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{lang === 'ar' ? 'طلب هذا الموديل — الدفع عند الاستلام' : 'Commander ce Modèle — Paiement à la Livraison'}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SIGNATURE PRODUCTS SHOWCASE (Clean, Minimalist Text & Direct Product Landing Links) */}
      <section id="products-collection" className="py-12 sm:py-20 bg-white border-b border-[#ECE5DB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Section Header - Minimalist */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A66C38] bg-[#F7F1E7] px-3 py-1 rounded-full border border-[#E9DCC9]">
              {lang === 'ar' ? 'التشكيلة الملكية' : 'Collection Royale'}
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[#1E1916] font-serif">
              {lang === 'ar' ? '100% جلد طبيعي • مصنوع يدوياً' : '100% Cuir Naturel Fait Main'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6A5E54]">
              {lang === 'ar'
                ? 'عرض خاص: 1 بـ 129 درهم | 2 بـ 189 درهم مع توصيل مجاني ودفع عند الاستلام.'
                : 'Offre Duo : 1 à 129 DH | 2 à 189 DH avec livraison gratuite et paiement à la livraison.'}
            </p>
          </div>

          {/* Product Cards: Entire Card Leads to Product Landing Page */}
          <div className={
            productsList.length <= 2
              ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto"
              : productsList.length === 3
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-5xl mx-auto"
              : "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
          }>
            {productsList.map((product) => {
              const pTitle = lang === 'ar' ? product.arabicName : product.frenchName;
              const pSub = lang === 'ar' ? product.subtitle : product.frenchSubtitle;
              const pCat = lang === 'ar' ? product.categoryArabic : product.categoryFrench;
              const pBadge = lang === 'ar' ? product.badge : product.frenchBadge;

              return (
                <div
                  key={product.id}
                  className="bg-[#FCFAF7] rounded-2xl border border-[#E8E1D5] overflow-hidden flex flex-col justify-between hover:border-[#9A6539] hover:shadow-lg transition-all group"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex-1 flex flex-col justify-between block"
                  >
                    <div>
                      {/* Product Thumbnail */}
                      <div className="relative aspect-square w-full overflow-hidden bg-[#F2EDE5]">
                        <Image
                          src={product.featuredImage}
                          alt={pTitle}
                          fill
                          sizes="(max-width: 768px) 50vw, 300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-400"
                        />
                        <div className={`absolute top-2.5 ${isRtl ? 'right-2.5' : 'left-2.5'} px-2 py-0.5 rounded-full bg-[#1A1615]/85 text-[#FFDE9E] text-[9.5px] font-bold border border-[#B89563]/30`}>
                          {pBadge}
                        </div>
                      </div>

                      {/* Minimalist Card Details */}
                      <div className={`p-3 space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <span className="text-[10px] font-bold text-[#8C5E35]">
                          {pCat}
                        </span>
                        
                        <h3 className="font-bold text-xs sm:text-sm text-[#1E1916] group-hover:text-[#8C5E35] transition-colors leading-snug line-clamp-2">
                          {pTitle}
                        </h3>

                        <p className="text-[10.5px] text-[#7A6E63] line-clamp-1">
                          {pSub}
                        </p>

                        {/* Minimal Craft Checks */}
                        <div className="pt-2 border-t border-[#F0EBE3] space-y-1 text-[10.5px] text-[#5C5046] hidden sm:block">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-[#28A745] shrink-0" />
                            <span>{lang === 'ar' ? '100% جلد طبيعي' : '100% Cuir Naturel'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-[#28A745] shrink-0" />
                            <span>{lang === 'ar' ? 'خياطة سراجة يدوية' : 'Couture sellier main'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="p-3 pt-0">
                      <div className={`bg-[#FAF7F2] p-2 rounded-xl border border-[#EAE1D5] mb-2.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className="text-sm sm:text-base font-black text-[#8C5E35]">
                          {product.price} <span className="text-[10px] font-bold">DH</span>
                        </div>
                        <div className="text-[10px] text-[#28A745] font-semibold">
                          {lang === 'ar' ? 'عرض 2 بـ 189 د.م' : 'Duo à 189 DH'}
                        </div>
                      </div>

                      <div className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#8C5E35] to-[#5A381E] text-white text-[11px] sm:text-xs font-bold shadow-xs group-hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                        <span>{lang === 'ar' ? 'طلب ومعاينة' : 'Commander'}</span>
                        <ArrowIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. BRAND PILLARS (Minimalist & Short Copy) */}
      <section className="py-12 sm:py-16 bg-[#FAF7F2] border-b border-[#EAE1D5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1.5">
            <span className="text-[11px] font-bold text-[#8C5E35] bg-[#EFE4D6] px-3 py-0.5 rounded-full border border-[#DFCEBB]">
              {lang === 'ar' ? 'أصالة الحرفة' : 'Artisanat Marocain'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E1916] font-serif">
              {lang === 'ar' ? 'لماذا تختار دار التاج؟' : 'Pourquoi Choisir ALTAJ ?'}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Pillar 1: 100% Cuir Naturel */}
            <div className={`bg-white p-4 rounded-2xl border border-[#E8DFD3] space-y-1.5 shadow-2xs ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="w-9 h-9 rounded-xl bg-[#FAF0E4] text-[#8C5E35] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-[#1E1916]">
                {lang === 'ar' ? '100% جلد طبيعي' : '100% Cuir Naturel'}
              </h3>
              <p className="text-[11px] text-[#6C6055] leading-relaxed">
                {lang === 'ar'
                  ? 'مدبوغ نباتياً بمستخلصات طبيعية، بدون كروم وبرائحة أصيلة.'
                  : 'Tannage végétal naturel, sans chrome chimique et patine durable.'}
              </p>
            </div>

            {/* Pillar 2: Couture Sellier */}
            <div className={`bg-white p-4 rounded-2xl border border-[#E8DFD3] space-y-1.5 shadow-2xs ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="w-9 h-9 rounded-xl bg-[#FAF0E4] text-[#8C5E35] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-[#1E1916]">
                {lang === 'ar' ? 'خياطة سراجة يدوية' : 'Couture Sellier Main'}
              </h3>
              <p className="text-[11px] text-[#6C6055] leading-relaxed">
                {lang === 'ar'
                  ? 'غرز يدوية متينة بخيط مشمع عالي المقاومة.'
                  : 'Point sellier fait main au fil ciré haute résistance.'}
              </p>
            </div>

            {/* Pillar 3: Emballage Kraft Soigné */}
            <div className={`bg-white p-4 rounded-2xl border border-[#E8DFD3] space-y-1.5 shadow-2xs ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="w-9 h-9 rounded-xl bg-[#FAF0E4] text-[#8C5E35] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-[#1E1916]">
                {lang === 'ar' ? 'تغليف كرافت أنيق' : 'Emballage Kraft Soigné'}
              </h3>
              <p className="text-[11px] text-[#6C6055] leading-relaxed">
                {lang === 'ar'
                  ? 'تغليف كرافت يحمي الجلد وبطاقة ضمان الجودة.'
                  : 'Emballage kraft protecteur avec garantie de qualité.'}
              </p>
            </div>

            {/* Pillar 4: Inspection avant Paiement */}
            <div className={`bg-white p-4 rounded-2xl border border-[#E8DFD3] space-y-1.5 shadow-2xs ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="w-9 h-9 rounded-xl bg-[#FAF0E4] text-[#8C5E35] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-[#1E1916]">
                {lang === 'ar' ? 'معاينة قبل الدفع' : 'Inspection avant Paiement'}
              </h3>
              <p className="text-[11px] text-[#6C6055] leading-relaxed">
                {lang === 'ar'
                  ? 'افحص الجلد بيدك أمام الموزع قبل أن تدفع.'
                  : 'Vérifiez la qualité en main propre avant de payer au livreur.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VERIFIED CUSTOMER REVIEWS */}
      <section className="py-12 sm:py-16 bg-white border-b border-[#E8E1D5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-[11px] font-bold text-[#8C5E35] bg-[#EFE4D6] px-3 py-0.5 rounded-full border border-[#DFCEBB]">
              {lang === 'ar' ? 'آراء الزبناء' : 'Avis Clients'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E1916] font-serif">
              {lang === 'ar' ? 'ماذا يقول زبناؤنا بالمغرب؟' : 'Témoignages Clients au Maroc'}
            </h2>
          </div>

          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className={`w-[82vw] sm:w-[280px] md:w-auto shrink-0 snap-start bg-[#FCFAF7] p-4 rounded-2xl border border-[#E8E0D4] flex flex-col justify-between shadow-2xs ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
              >
                <div>
                  <div className="flex items-center gap-0.5 text-[#D9A74A] mb-2">
                    {[...Array(rev.rating)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#4C4138] leading-relaxed italic mb-3">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="border-t border-[#F2ECE3] pt-2">
                  <div className="font-bold text-xs text-[#1E1916] flex items-center justify-between">
                    <span>{rev.name}</span>
                    <span className="text-[9.5px] text-[#28A745] font-semibold bg-[#E8F8EE] px-1.5 py-0.2 rounded">
                      {lang === 'ar' ? 'شراء مؤكد ✓' : 'Achat Vérifié ✓'}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#8C5E35] font-medium flex items-center justify-between mt-0.5">
                    <span>📍 {rev.city}</span>
                    <span className="text-[10px] text-[#9A8D80]">{rev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHATSAPP ATELIER CONSULTATION */}
      <section className="py-8 bg-[#FAF7F2] border-b border-[#E8DFD3]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-2.5">
          <p className="text-xs sm:text-sm font-bold text-[#1E1916]">
            {lang === 'ar'
              ? 'هل تحتاج مساعدة في اختيار الموديل أو طلبك؟'
              : 'Besoin d’aide pour choisir ou commander ?'}
          </p>
          <div>
            <a
              href="https://wa.me/212693148230?text=Bonjour%20Altajleather"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm shadow-xs transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تواصل معنا مباشرة عبر الواتساب: 06 93 14 82 30' : 'Contactez notre atelier sur WhatsApp : 06 93 14 82 30'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 7. MINIMALIST FOOTER */}
      <BrandFooter />
    </div>
  );
}
