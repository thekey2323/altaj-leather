'use client';

import React from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { ShieldCheck, Lock, EyeOff, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

export function PrivacyView() {
  const { isRtl, setCurrentView } = useHeiba();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-heiba-text flex items-center gap-2">
            <span>{isRtl ? 'الخصوصية والأمان' : 'Privacy & Trust'}</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </h1>
          <p className="text-xs text-heiba-secondary">
            {isRtl ? 'التزامنا الكامل بحماية بياناتك وصورك الشخصية' : 'Our commitment to your privacy and photo security'}
          </p>
        </div>

        <button
          onClick={() => setCurrentView('dashboard')}
          className="p-2 rounded-xl bg-white border border-heiba-border text-xs font-bold text-heiba-text"
        >
          {isRtl ? 'العودة' : 'Back'}
        </button>
      </div>

      {/* Commitments Cards */}
      <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card space-y-4 text-xs leading-relaxed text-heiba-text">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm mb-1">
              {isRtl ? 'معالجة الصور الآمنة' : 'Secure Image Processing'}
            </h4>
            <p className="text-heiba-secondary text-[11px]">
              {isRtl
                ? 'الصور التي ترفعها لملابسك أو لإطلالتك تُستخدم حصراً لغرض التحليل والتنسيق الشخصي، ولا تتم مشاركتها أو بيعها لأي طرف ثالث نهائياً.'
                : 'Your uploaded outfit and garment photos are processed strictly for personal styling analysis and never shared or published.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-3 border-t border-heiba-border">
          <div className="w-8 h-8 rounded-xl bg-heiba-lavender text-purple-700 flex items-center justify-center shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm mb-1">
              {isRtl ? 'احترام القوام وعدم التمييز' : 'Respectful & Body Positive'}
            </h4>
            <p className="text-heiba-secondary text-[11px]">
              {isRtl
                ? 'تطبيق هيبة مصمم لتقديم نصائح بناءة ومحترمة تعزز الثقة بالنفس، دون أي أحكام سلبية على القوام أو المظهر.'
                : 'HEIBA is committed to constructive, objective, and uplifting advice without negative body judgment.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-3 border-t border-heiba-border">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm mb-1">
              {isRtl ? 'حق حذف البيانات في أي وقت' : 'Complete Data Erasure Rights'}
            </h4>
            <p className="text-heiba-secondary text-[11px]">
              {isRtl
                ? 'يمكنك بنقرة واحدة حذف حسابك وجميع صور ملابسك ومحادثاتك بالكامل وبشكل دائم من الخوادم.'
                : 'You have the right to erase all your garments, uploaded photos, and chat history permanently anytime.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
