'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function BrandFooter() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-[#120F0E] text-[#C4B7AC] py-8 pb-24 sm:pb-12 border-t border-[#251E1A]">
      <div className="max-w-3xl mx-auto px-4 flex flex-col items-center justify-center text-center space-y-3">
        {/* Taj Crown Mini Logo & Brand Title */}
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/95 border border-[#4A3B32] p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/images/altaj-logo.jpg"
              alt="ALTAJ LEATHER"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="text-start">
            <div className="font-serif tracking-widest text-sm font-bold text-white leading-tight">
              ALTAJ LEATHER
            </div>
            <div className="text-[10.5px] text-[#A69788] font-medium leading-tight">
              {lang === 'ar' ? 'التاج للمصنوعات الجلدية الطبيعية' : 'Maroquinerie en Cuir Naturel'}
            </div>
          </div>
        </Link>

        {/* Minimal WhatsApp link */}
        <div className="pt-1">
          <a
            href="https://wa.me/212693148230?text=Bonjour%20Altajleather"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F1A17] hover:bg-[#2A231F] border border-[#382D25] text-[#25D366] text-xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span dir="ltr" className="font-mono text-white text-[11px] font-semibold">06 93 14 82 30</span>
          </a>
        </div>

        <div className="flex items-center justify-center gap-3 text-[10px] text-[#716458] pt-1">
          <span>© {new Date().getFullYear()} ALTAJ LEATHER • {lang === 'ar' ? 'صناعة يدوية بالمغرب 🇲🇦' : 'Fait main au Maroc 🇲🇦'}</span>
        </div>
      </div>
    </footer>
  );
}
