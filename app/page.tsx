'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AltajLandingPage = dynamic(
  () => import('@/components/landing/AltajLandingPage').then((mod) => mod.AltajLandingPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8C5E35] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8C5E35] font-mono tracking-wider">
            ALTAJ LEATHER...
          </span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <main>
      <AltajLandingPage />
    </main>
  );
}
