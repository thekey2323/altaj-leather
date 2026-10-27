'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  MessageCircle,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Globe
} from 'lucide-react';
import { getAllProducts, LuxuryProduct } from '@/data/altajProducts';
import { useLanguage } from '@/context/LanguageContext';

export function BrandHeader() {
  const pathname = usePathname();
  const { lang, setLanguage, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerProducts, setHeaderProducts] = useState<LuxuryProduct[]>(getAllProducts);

  useEffect(() => {
    try {
      setHeaderProducts(getAllProducts());
    } catch {}
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = lang === 'ar'
    ? [
        { label: 'الرئيسية', href: '/' },
        { label: 'التشكيلة', href: '/products' },
        { label: 'عن الأتولييه', href: '/our-story' },
        { label: 'الأسئلة الشائعة', href: '/faq' },
        { label: 'تتبع الطلب', href: '/track-order' },
      ]
    : [
        { label: 'Accueil', href: '/' },
        { label: 'Collection', href: '/products' },
        { label: 'Notre Atelier', href: '/our-story' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Suivi Commande', href: '/track-order' },
      ];

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR (With Language Selector in Top Corner) */}
      <div className="bg-[#141110] text-[#E8DFD8] text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-6 border-b border-[#2C231F]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Top Corner: Language Selection (العربية / Français) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Globe className="w-3.5 h-3.5 text-[#B89563]" />
            <div className="flex items-center bg-[#251E1A] rounded-full p-0.5 border border-[#3E322C]">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                  lang === 'ar'
                    ? 'bg-[#8C5E35] text-white shadow-2xs'
                    : 'text-[#B8A89A] hover:text-white'
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                  lang === 'fr'
                    ? 'bg-[#8C5E35] text-white shadow-2xs'
                    : 'text-[#B8A89A] hover:text-white'
                }`}
              >
                Français
              </button>
            </div>
          </div>

          {/* Center / Notice Text */}
          <div className="hidden sm:flex items-center gap-1.5 truncate text-[11px] text-[#D8CECA]">
            <span className="inline-flex items-center gap-1 bg-[#B89563]/20 text-[#E3B87A] px-2 py-0.5 rounded-full text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              {lang === 'ar' ? '100% جلد طبيعي' : '100% Cuir Naturel'}
            </span>
            <span className="truncate font-medium">
              {lang === 'ar'
                ? 'توصيل مجاني + معاينة قبل الدفع 🇲🇦'
                : 'Livraison gratuite + Inspection avant paiement 🇲🇦'}
            </span>
          </div>

          {/* Quick WhatsApp Link */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-[#D9A74A] font-semibold text-[11px]">
              {lang === 'ar' ? '1 بـ 129 د.م | 2 بـ 189 د.م' : '1 pour 129 DH | 2 pour 189 DH'}
            </span>
            <a
              href="https://wa.me/212693148230?text=Bonjour%20Altajleather"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#25D366] hover:brightness-110 font-bold text-[11px] bg-[#25D366]/10 px-2.5 py-0.5 rounded-full border border-[#25D366]/25"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span dir="ltr" className="font-mono">06 93 14 82 30</span>
            </a>
          </div>

        </div>
      </div>

      {/* 2. MAIN BRAND HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD3] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Main Logo & Brand Identity (Prominently Visible) */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white shadow-md border-2 border-[#D9CAB8] p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src="/images/altaj-logo.jpg"
                alt="ALTAJ Leather Logo"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="font-serif tracking-wider text-lg sm:text-xl font-black text-[#1A1614] flex items-center gap-1.5 leading-tight">
                <span>ALTAJ</span>
                <span className="text-[#8C5E35] text-xs sm:text-sm font-sans tracking-widest font-extrabold">
                  LEATHER
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#7A6E63] font-semibold leading-none mt-0.5">
                {lang === 'ar' ? 'التاج للمصنوعات الجلدية الطبيعية' : '100% Cuir Naturel Fait Main'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#4A4036]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors relative py-1 ${
                    isActive ? 'text-[#8C5E35] font-bold' : 'hover:text-[#8C5E35]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C5E35] rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Quick dropdown for models */}
            <div className="relative group">
              <button className="flex items-center gap-1 py-1 hover:text-[#8C5E35] transition-colors cursor-pointer">
                <span>{lang === 'ar' ? 'الموديلات' : 'Modèles'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <div className="absolute top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#EAE1D5] p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="text-[11px] font-bold text-[#8C5E35] px-3 py-1.5 border-b border-[#F2ECE3]">
                  {lang === 'ar' ? 'موديلات التاج (129 د.م | 2 بـ 189 د.م):' : 'Modèles ALTAJ (129 DH | 2 pour 189 DH):'}
                </div>
                {headerProducts.map((prod) => (
                  <Link
                    key={prod.slug}
                    href={`/products/${prod.slug}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF6F0] transition-colors"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#EFE8DD]">
                      <Image
                        src={prod.featuredImage}
                        alt={lang === 'ar' ? prod.arabicName : prod.frenchName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E1916] line-clamp-1">
                        {lang === 'ar' ? prod.arabicName : prod.frenchName}
                      </div>
                      <div className="text-[11px] text-[#8C5E35] font-semibold">
                        {prod.price} DH
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#8C5E35] to-[#5A381E] text-white text-xs sm:text-sm font-bold shadow-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'التشكيلة' : 'Collection'}</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#DECDBB] text-[#5A4031] hover:bg-[#FAF4EC] active:scale-95 transition-all cursor-pointer"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* 3. MOBILE FULL-SCREEN SLIDE-IN DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div
              className={`fixed inset-y-0 ${
                isRtl ? 'right-0' : 'left-0'
              } max-w-[85%] w-80 bg-white shadow-2xl z-10 flex flex-col justify-between animate-fade-in`}
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#F0EBE3] flex items-center justify-between bg-[#FAF7F2]">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-white text-gray-500 border border-[#E5DDD2] hover:bg-gray-50 cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-serif font-bold text-sm text-[#1A1614]">ALTAJ LEATHER</div>
                    <div className="text-[10px] text-[#8C5E35] font-semibold">
                      {lang === 'ar' ? 'جلد طبيعي 100%' : '100% Cuir Naturel'}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-[#E5DDD2] p-0.5">
                    <Image
                      src="/images/altaj-logo.jpg"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Language Switcher in Mobile Drawer */}
              <div className="p-3 bg-[#FAF6F0] border-b border-[#EAE2D5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#5A4031]">
                  {lang === 'ar' ? 'اللغة / Langue :' : 'Langue / اللغة :'}
                </span>
                <div className="flex items-center bg-white rounded-full p-0.5 border border-[#DECDBB]">
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      lang === 'ar' ? 'bg-[#8C5E35] text-white' : 'text-[#7A6E63]'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      lang === 'fr' ? 'bg-[#8C5E35] text-white' : 'text-[#7A6E63]'
                    }`}
                  >
                    Français
                  </button>
                </div>
              </div>

              {/* Nav Links */}
              <div className="p-4 space-y-1 overflow-y-auto flex-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                        isActive
                          ? 'bg-[#FAF2E8] text-[#8C5E35] border border-[#ECDCCB]'
                          : 'text-[#4A4036] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="pt-4 border-t border-[#F0EBE3] mt-3">
                  <p className="text-[11px] font-bold text-[#8C5E35] px-2 mb-2">
                    {lang === 'ar' ? 'الموديلات المتوفرة:' : 'Modèles Disponibles :'}
                  </p>
                  {headerProducts.map((prod) => (
                    <Link
                      key={prod.slug}
                      href={`/products/${prod.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors"
                    >
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[#EBE3D8]">
                        <Image
                          src={prod.featuredImage}
                          alt={lang === 'ar' ? prod.arabicName : prod.frenchName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-[#1E1916] line-clamp-1">
                          {lang === 'ar' ? prod.arabicName : prod.frenchName}
                        </div>
                        <div className="text-[11px] text-[#8C5E35] font-semibold">
                          {prod.price} DH
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#F0EBE3] bg-[#FAF7F2] space-y-2">
                <a
                  href="https://wa.me/212693148230?text=Bonjour%20Altajleather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span dir="ltr">WhatsApp: 06 93 14 82 30</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
