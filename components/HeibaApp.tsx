'use client';

import React from 'react';
import { useHeiba } from '@/context/HeibaContext';
import { Header } from '@/components/common/Header';
import { BottomNav } from '@/components/common/BottomNav';
import { LandingView } from '@/components/views/LandingView';
import { OnboardingView } from '@/components/views/OnboardingView';
import { DashboardView } from '@/components/views/DashboardView';
import { StylistChatView } from '@/components/views/StylistChatView';
import { WardrobeView } from '@/components/views/WardrobeView';
import { GeneratorView } from '@/components/views/GeneratorView';
import { AnalyzerView } from '@/components/views/AnalyzerView';
import { ProfileView } from '@/components/views/ProfileView';
import { LooksView } from '@/components/views/LooksView';
import { InspirationView } from '@/components/views/InspirationView';
import { ChallengesView } from '@/components/views/ChallengesView';
import { ShoppingView } from '@/components/views/ShoppingView';
import { PricingView } from '@/components/views/PricingView';
import { AdminView } from '@/components/views/AdminView';
import { PrivacyView } from '@/components/views/PrivacyView';

export function HeibaApp() {
  const { currentView } = useHeiba();

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView />;
      case 'onboarding':
        return <OnboardingView />;
      case 'dashboard':
        return <DashboardView />;
      case 'stylist':
        return <StylistChatView />;
      case 'wardrobe':
        return <WardrobeView />;
      case 'generator':
        return <GeneratorView />;
      case 'analyzer':
        return <AnalyzerView />;
      case 'profile':
        return <ProfileView />;
      case 'looks':
        return <LooksView />;
      case 'inspiration':
        return <InspirationView />;
      case 'challenges':
        return <ChallengesView />;
      case 'shopping':
        return <ShoppingView />;
      case 'pricing':
        return <PricingView />;
      case 'admin':
        return <AdminView />;
      case 'privacy':
        return <PrivacyView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex justify-center">
      <main className="w-full max-w-md min-h-screen bg-[#FCFCFA] shadow-float relative flex flex-col">
        <Header />
        <div className="flex-1">
          {renderActiveView()}
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
