'use client';

import React, { useState } from 'react';
import { useHeiba, AppView } from '@/context/HeibaContext';
import {
  Home,
  Shirt,
  Sparkles,
  Bookmark,
  User,
  Wand2,
  Scan,
  Compass,
  Trophy,
  ShoppingBag,
  ShieldAlert,
  ChevronUp,
  X,
  Crown,
} from 'lucide-react';

export function BottomNav() {
  const { currentView, setCurrentView, isRtl, user, t } = useHeiba();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // If user is currently in onboarding or landing, don't show full bottom nav or show clean mode
  if (currentView === 'onboarding') return null;

  const navItems = [
    {
      id: 'dashboard' as AppView,
      label: isRtl ? 'الرئيسية' : 'Home',
      icon: Home,
      color: 'hover:text-heiba-text',
    },
    {
      id: 'wardrobe' as AppView,
      label: isRtl ? 'خزانتي' : 'Wardrobe',
      icon: Shirt,
      color: 'hover:text-amber-800',
    },
    {
      id: 'stylist' as AppView,
      label: isRtl ? 'المستشار' : 'Stylist',
      icon: Sparkles,
      isCenter: true,
    },
    {
      id: 'looks' as AppView,
      label: isRtl ? 'إطلالاتي' : 'Looks',
      icon: Bookmark,
      color: 'hover:text-blue-700',
    },
    {
      id: 'profile' as AppView,
      label: isRtl ? 'حسابي' : 'Profile',
      icon: User,
      color: 'hover:text-rose-700',
    },
  ];

  const secondaryFeatures = [
    {
      id: 'generator' as AppView,
      label: isRtl ? 'مولّد الإطلالات الذكي' : 'Outfit Generator',
      desc: isRtl ? 'تنسيق فوري لأي مناسبة' : 'AI outfit builder',
      icon: Wand2,
      bg: 'bg-heiba-blue text-blue-700',
    },
    {
      id: 'analyzer' as AppView,
      label: isRtl ? 'محلل الإطلالة بالصورة' : 'Outfit Analyzer',
      desc: isRtl ? 'تقييم فوري وتطوير المظهر' : 'Mirror review & critique',
      icon: Scan,
      bg: 'bg-heiba-green text-emerald-700',
    },
    {
      id: 'inspiration' as AppView,
      label: isRtl ? 'إلهام الستايل' : 'Style Inspiration',
      desc: isRtl ? 'لوكات وتنسيقات عالمية' : 'Curated lookbook',
      icon: Compass,
      bg: 'bg-heiba-lavender text-purple-700',
    },
    {
      id: 'challenges' as AppView,
      label: isRtl ? 'تحديات الأسبوع' : 'Style Challenges',
      desc: isRtl ? 'طوّر عادات أناقتك' : 'Weekly fashion habit builder',
      icon: Trophy,
      bg: 'bg-heiba-peach text-amber-700',
    },
    {
      id: 'shopping' as AppView,
      label: isRtl ? 'التسوق الذكي' : 'Shopping Assistant',
      desc: isRtl ? 'أكمل نواقص خزانتك' : 'Wardrobe gaps & staples',
      icon: ShoppingBag,
      bg: 'bg-heiba-beige text-amber-900',
    },
    {
      id: 'pricing' as AppView,
      label: isRtl ? 'باقات هيبة PRO' : 'HEIBA PRO Pricing',
      desc: isRtl ? 'ميزات حصرية واستشارات غير محدودة' : 'Unlock full styling power',
      icon: Crown,
      bg: 'bg-heiba-accentLight text-heiba-accent',
    },
    {
      id: 'admin' as AppView,
      label: isRtl ? 'لوحة تحكم الإدارة' : 'Admin Panel',
      desc: isRtl ? 'إحصائيات المنصة والمشتركين' : 'Platform metrics & users',
      icon: ShieldAlert,
      bg: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <>
      {/* More Features Drawer / Sheet */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center transition-opacity"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-4xl p-6 shadow-float border-t border-heiba-border animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-heiba-border mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-heiba-lavender flex items-center justify-center text-purple-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-heiba-text text-base">
                    {isRtl ? 'كل الميزات والأدوات' : 'All Features & Tools'}
                  </h3>
                  <p className="text-xs text-heiba-secondary">
                    {isRtl ? 'اختر الأداة التي تناسب احتياجك' : 'Explore styling tools'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-8 h-8 rounded-full bg-heiba-bg flex items-center justify-center text-heiba-secondary hover:text-heiba-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {secondaryFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => {
                      setCurrentView(feat.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all text-left ${
                      currentView === feat.id
                        ? 'border-heiba-accent bg-heiba-accentLight/40'
                        : 'border-heiba-border hover:border-heiba-borderHover bg-white hover:bg-heiba-bg/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feat.bg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-heiba-text">{feat.label}</div>
                      <div className="text-xs text-heiba-secondary truncate">{feat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-heiba-border shadow-card pb-safe">
        <div className="max-w-md mx-auto px-4 h-18 flex items-center justify-around relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            if (item.isCenter) {
              return (
                <div key={item.id} className="relative -top-4 flex flex-col items-center">
                  <button
                    onClick={() => setCurrentView(item.id)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-float transition-transform active:scale-95 ${
                      isActive
                        ? 'bg-heiba-accent text-white ring-4 ring-heiba-accentLight'
                        : 'bg-heiba-text text-white hover:bg-heiba-accent hover:shadow-coral'
                    }`}
                  >
                    <Sparkles className="w-6 h-6 animate-pulse-soft" />
                  </button>
                  <span
                    className={`text-[11px] font-bold mt-1 ${
                      isActive ? 'text-heiba-accent' : 'text-heiba-text'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-heiba-accent font-bold scale-105'
                    : 'text-heiba-secondary hover:text-heiba-text font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    isActive ? 'bg-heiba-accentLight text-heiba-accent' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* More menu trigger button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center py-2 px-1 text-heiba-secondary hover:text-heiba-text"
            title="More features"
          >
            <div className="p-1 rounded-xl bg-heiba-bg">
              <ChevronUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{isRtl ? 'المزيد' : 'More'}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
