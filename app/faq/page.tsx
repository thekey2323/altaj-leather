'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MessageCircle, HelpCircle } from 'lucide-react';
import { BrandHeader } from '@/components/brand/BrandHeader';
import { BrandFooter } from '@/components/brand/BrandFooter';
import { useLanguage } from '@/context/LanguageContext';

export default function FaqPage() {
  const { lang, isRtl } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = lang === 'ar'
    ? [
        {
          q: 'كيف تتم عملية الدفع عند الاستلام (COD)؟',
          a: 'الدفع نقداً 100% عند وصول الطرد إلى باب منزلك، بعد أن تتسلمه وتفتحه وتفحصه بيدك.'
        },
        {
          q: 'هل يمكنني فحص السلعة قبل الدفع للموزع؟',
          a: 'نعم بالتأكيد! افتح الطرد، تأكد من ملمس الجلد الطبيعي وجودة الخياطة قبل دفع درهم واحد للموزع.'
        },
        {
          q: 'كم تستغرق مدة التوصيل؟',
          a: 'من 24 إلى 48 ساعة لكافة مدن المملكة، والتوصيل مجاني على عرض قطعتين بـ 189 درهم.'
        },
        {
          q: 'كيف أتأكد أن الجلد طبيعي 100%؟',
          a: 'جميع منتجاتنا مصنوعة حصراً من الجلد الطبيعي 100% المدبوغ نباتياً. يمكنك تمييزه من رائحته الزكية ومسامه الطبيعية ومتانته التي تدوم طويلاً.'
        },
        {
          q: 'ما هو التغليف الذي تصل فيه المحفظة؟',
          a: 'تصل كل محفظة في تغليف كرافت أنيق يحمي الجلد أثناء الشحن، مع بطاقة ضمان الجودة.'
        },
        {
          q: 'هل يمكنني اختيار موديلين مختلفين في عرض 189 درهم؟',
          a: 'نعم، يمكنك اختيار أي موديلين من التشكيلة بسعر 189 درهم فقط مع شحن مجاني.'
        }
      ]
    : [
        {
          q: 'Comment fonctionne le paiement à la livraison ?',
          a: 'Le paiement s’effectue en espèces à la réception de votre colis, après l’avoir ouvert et vérifié.'
        },
        {
          q: 'Puis-je inspecter le produit avant de payer ?',
          a: 'Absolument ! Vous inspectez le cuir naturel et les coutures en main propre avant de régler le livreur.'
        },
        {
          q: 'Quel est le délai de livraison ?',
          a: 'Entre 24h et 48h partout au Maroc. Livraison offerte pour l’offre 2 pièces à 189 DH.'
        },
        {
          q: 'Le cuir est-il 100% naturel ?',
          a: 'Oui, tous nos articles sont confectionnés en cuir 100% naturel tanné végétalement, sans produits chimiques nocifs.'
        },
        {
          q: 'Quel est le type d’emballage proposé ?',
          a: 'Chaque pièce est emballée avec soin dans un emballage kraft protecteur avec certificat d’authenticité.'
        },
        {
          q: 'Puis-je panacher 2 modèles dans l’offre à 189 DH ?',
          a: 'Oui, vous pouvez choisir deux modèles différents de votre choix pour 189 DH avec livraison gratuite.'
        }
      ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#1E1916]" dir={isRtl ? 'rtl' : 'ltr'}>
      <BrandHeader />

      <main className="flex-1 pb-16">
        {/* HERO */}
        <div className="bg-[#191514] text-white py-10 sm:py-14 px-4 text-center border-b border-[#2F2520]">
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold text-[#D9A74A] uppercase tracking-wider bg-[#2E241E] px-3 py-1 rounded-full border border-[#44362C]">
              FAQ
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-serif">
              {lang === 'ar' ? 'الأسئلة الشائعة والأجوبة' : 'Questions Fréquentes'}
            </h1>
            <p className="text-xs sm:text-sm text-[#C4B7AC]">
              {lang === 'ar' ? 'إجابات مباشرة ومختصرة لكل استفساراتكم' : 'Toutes les réponses à vos questions'}
            </p>
          </div>
        </div>

        {/* ACCORDION */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#E9E1D5] overflow-hidden bg-white shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className={`w-full p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#1E1916] transition-colors cursor-pointer ${
                      isRtl ? 'text-right' : 'text-left'
                    } ${isOpen ? 'bg-[#FAF6F0]' : 'hover:bg-[#FCFAF7]'}`}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8C5E35] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className={`px-4 pb-4 pt-1 text-xs text-[#5C5046] leading-relaxed border-t border-[#F1EAE0] bg-white ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick WhatsApp Support */}
          <div className="mt-8 text-center p-5 rounded-2xl bg-[#FAF5EE] border border-[#E6D9C8] space-y-2">
            <p className="text-xs sm:text-sm font-bold text-[#1E1916]">
              {lang === 'ar' ? 'هل لديك أي استفسار آخر؟' : 'Vous avez une autre question ?'}
            </p>
            <p className="text-[11px] text-[#7A6E65]">
              {lang === 'ar' ? 'فريقنا رهن إشارتكم عبر الواتساب' : 'Notre équipe est à votre écoute sur WhatsApp'}
            </p>
            <div>
              <a
                href="https://wa.me/212693148230?text=Bonjour%20Altajleather"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-xs hover:bg-[#1EBE5D] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span dir="ltr">WhatsApp: 06 93 14 82 30</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
}
