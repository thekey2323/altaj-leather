'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AltajApp = dynamic(
  () => import('@/components/altaj/AltajApp').then((mod) => mod.AltajApp),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider">
            CHARGEMENT ATELIER ALTAJ...
          </span>
        </div>
      </div>
    ),
  }
);

export default function AtelierPage() {
  return (
    <main>
      <AltajApp />
    </main>
  );
}
