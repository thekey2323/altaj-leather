'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Language,
  Currency,
  UserProfile,
  WardrobeItem,
  Outfit,
  ChatMessage,
  StyleChallenge,
  ClothingCategory,
  StyleIdentity,
} from '@/types/heiba';
import {
  INITIAL_WARDROBE,
  INITIAL_USER_PROFILE,
  SAMPLE_OUTFITS,
  WEEKLY_CHALLENGES,
  SAMPLE_STYLE_IDENTITIES,
} from '@/lib/mock-data';
import { translations } from '@/lib/translations';
import { enrichOutfitPiecesWithImages } from '@/lib/garment-images';
import { buildLookImageUrl } from '@/lib/image-generator';

export type AppView =
  | 'landing'
  | 'onboarding'
  | 'dashboard'
  | 'wardrobe'
  | 'stylist'
  | 'looks'
  | 'profile'
  | 'generator'
  | 'analyzer'
  | 'inspiration'
  | 'challenges'
  | 'shopping'
  | 'pricing'
  | 'admin'
  | 'privacy';


interface HeibaContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  formatPrice: (amountInSAR: number) => string;
  t: typeof translations.ar;
  isRtl: boolean;

  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  completeOnboarding: (data: Partial<UserProfile>, generatedIdentity: StyleIdentity) => void;
  upgradeToPro: () => void;
  downgradeToFree: () => void;

  wardrobe: WardrobeItem[];
  addWardrobeItem: (item: Omit<WardrobeItem, 'id' | 'createdAt'>) => WardrobeItem;
  removeWardrobeItem: (id: string) => void;
  toggleFavoriteItem: (id: string) => void;
  wardrobeInsights: {
    totalItems: number;
    topColor: { name: string; hex: string; count: number };
    missingPiece: { name: string; nameAr: string; category: ClothingCategory };
    categoryCounts: Record<string, number>;
  };

  savedOutfits: Outfit[];
  saveOutfit: (outfit: Outfit) => void;
  removeSavedOutfit: (id: string) => void;
  isOutfitSaved: (id: string) => boolean;

  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, imageUrl?: string) => Promise<void>;
  isChatLoading: boolean;

  challenges: StyleChallenge[];
  toggleChallengeTask: (challengeId: string, day: number) => void;

  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;

  resetDemoData: () => void;
}

const HeibaContext = createContext<HeibaContextType | undefined>(undefined);

const CURRENCY_RATES: Record<Currency, { rate: number; symbolAr: string; symbolEn: string }> = {
  SAR: { rate: 1, symbolAr: 'ر.س', symbolEn: 'SAR' },
  EGP: { rate: 8.2, symbolAr: 'ج.م', symbolEn: 'EGP' },
  MAD: { rate: 2.7, symbolAr: 'د.م', symbolEn: 'MAD' },
  USD: { rate: 0.27, symbolAr: '$', symbolEn: '$' },
};

export function HeibaProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [currency, setCurrency] = useState<Currency>('SAR');
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(INITIAL_WARDROBE);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>(SAMPLE_OUTFITS);
  const [challenges, setChallenges] = useState<StyleChallenge[]>(WEEKLY_CHALLENGES);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'stylist',
      text: 'Welcome! I am your personal menswear stylist at HEIBA. How can I elevate your presence today? You can ask me what to wear, coordinate a specific garment, or choose a quick prompt below.',
      textAr:
        'أهلاً بك! معك مستشارك الشخصي في هيبة. كيف نطور إطلالتك وحضورك اليوم؟ اسألني عن أي استشارة في الأناقة، أو نسّق قطعة ملابس محددة، أو اختر إحدى الأسئلة السريعة بالأسفل.',
      timestamp: '10:00 AM',
    },
  ]);

  // Handle HTML document direction and lang
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setUser((prev) => ({ ...prev, language: lang }));
  };

  const isRtl = language === 'ar';
  const t = language === 'ar' ? translations.ar : translations.en;

  // Currency Formatter
  const formatPrice = (amountInSAR: number): string => {
    const config = CURRENCY_RATES[currency];
    const converted = Math.round(amountInSAR * config.rate);
    return isRtl ? `${converted} ${config.symbolAr}` : `${config.symbolEn} ${converted}`;
  };

  // User Profile actions
  const updateUser = (fields: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...fields }));
  };

  const completeOnboarding = (data: Partial<UserProfile>, generatedIdentity: StyleIdentity) => {
    setUser((prev) => ({
      ...prev,
      ...data,
      styleIdentity: generatedIdentity,
      onboardingCompleted: true,
    }));
    setCurrentView('dashboard');
  };

  const upgradeToPro = () => {
    setUser((prev) => ({
      ...prev,
      isPro: true,
      proExpiresAt: '2027-09-20',
      aiQueriesLimit: 9999,
    }));
    setShowUpgradeModal(false);
  };

  const downgradeToFree = () => {
    setUser((prev) => ({
      ...prev,
      isPro: false,
      aiQueriesLimit: 5,
    }));
  };

  // Wardrobe actions
  const addWardrobeItem = (itemData: Omit<WardrobeItem, 'id' | 'createdAt'>): WardrobeItem => {
    const newItem: WardrobeItem = {
      ...itemData,
      id: `item_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      wearCount: 0,
      isFavorite: false,
    };
    setWardrobe((prev) => [newItem, ...prev]);
    return newItem;
  };

  const removeWardrobeItem = (id: string) => {
    setWardrobe((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleFavoriteItem = (id: string) => {
    setWardrobe((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
  };

  // Wardrobe Insights Calculation
  const wardrobeInsights = useMemo(() => {
    const totalItems = wardrobe.length;
    const colorCounts: Record<string, { count: number; hex: string }> = {};
    const categoryCounts: Record<string, number> = {};

    wardrobe.forEach((item) => {
      // Colors
      if (!colorCounts[item.color]) {
        colorCounts[item.color] = { count: 0, hex: item.colorHex || '#202124' };
      }
      colorCounts[item.color].count += 1;

      // Categories
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    let topColor = totalItems > 0
      ? { name: 'Black', hex: '#1F1F1F', count: 0 }
      : { name: isRtl ? 'لا يوجد بعد' : 'None yet', hex: '#CCCCCC', count: 0 };

    if (totalItems > 0) {
      Object.entries(colorCounts).forEach(([name, data]) => {
        if (data.count > topColor.count) {
          topColor = { name, hex: data.hex, count: data.count };
        }
      });
    }

    // Determine missing essential piece
    let missingPiece = {
      name: 'Beige Chinos',
      nameAr: 'سروال تشينو بيج كلاسيكي',
      category: 'chinos' as ClothingCategory,
    };
    if (!categoryCounts['blazers'] || categoryCounts['blazers'] === 0) {
      missingPiece = {
        name: 'Unstructured Summer Blazer',
        nameAr: 'بليزر صيفي غير مبطن',
        category: 'blazers',
      };
    } else if (!categoryCounts['shoes'] || categoryCounts['shoes'] === 0) {
      missingPiece = {
        name: 'Suede Penny Loafers',
        nameAr: 'حذاء لوفر سويد راقي',
        category: 'shoes',
      };
    } else if (!categoryCounts['belts'] || categoryCounts['belts'] === 0) {
      missingPiece = {
        name: 'Woven Brown Leather Belt',
        nameAr: 'حزام جلد بني مضفور',
        category: 'belts',
      };
    }

    return {
      totalItems,
      topColor,
      missingPiece,
      categoryCounts,
    };
  }, [wardrobe]);

  // Outfits saving
  const saveOutfit = (outfit: Outfit) => {
    setSavedOutfits((prev) => {
      if (prev.some((o) => o.id === outfit.id)) return prev;
      return [{ ...outfit, isSaved: true }, ...prev];
    });
  };

  const removeSavedOutfit = (id: string) => {
    setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
  };

  const isOutfitSaved = (id: string) => {
    return savedOutfits.some((o) => o.id === id);
  };

  // Chat actions with server-side AI integration
  const sendChatMessage = async (text: string, imageUrl?: string) => {
    if (!text.trim() && !imageUrl) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      textAr: text,
      imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      // Call server AI endpoint
      const response = await fetch('/api/ai/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          userProfile: user,
          wardrobe,
          language,
          imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed response from AI stylist');
      }

      const data = await response.json();

      let enrichedOutfit = data.outfitCard;
      if (enrichedOutfit && Array.isArray(enrichedOutfit.pieces)) {
        enrichedOutfit.pieces = enrichOutfitPiecesWithImages(enrichedOutfit.pieces, wardrobe);
      }

      const aiMessage: ChatMessage = {
        id: `msg_stylist_${Date.now()}`,
        sender: 'stylist',
        text: data.textEn || data.text,
        textAr: data.textAr || data.text,
        outfitCard: enrichedOutfit,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
      setUser((prev) => ({ ...prev, aiQueriesUsedToday: prev.aiQueriesUsedToday + 1 }));
    } catch (err) {
      console.warn('Using intelligent fallback stylist reply:', err);
      // Fallback styling response with exact piece images
      const rawPieces = [
        {
          category: 'shirts' as const,
          name: 'Beige Linen Button-Down Shirt',
          nameAr: 'قميص كتان بيج كاجوال',
          color: 'Beige',
          colorHex: '#E6DCB8',
          itemRefId: wardrobe[0]?.id,
        },
        {
          category: 'chinos' as const,
          name: 'Navy Blue Tailored Chinos',
          nameAr: 'سروال تشينو كحلي مفصل',
          color: 'Navy Blue',
          colorHex: '#1B263B',
          itemRefId: wardrobe[1]?.id,
        },
        {
          category: 'sneakers' as const,
          name: 'Minimalist White Leather Sneakers',
          nameAr: 'حذاء سنيكرز أبيض كلاسيكي',
          color: 'White',
          colorHex: '#FFFFFF',
          itemRefId: wardrobe[2]?.id,
        },
        {
          category: 'watches' as const,
          name: 'Black Minimalist Leather Watch',
          nameAr: 'ساعة يد كلاسيكية بحزام جلدي أسود',
          color: 'Black',
          colorHex: '#1F1F1F',
          itemRefId: wardrobe[4]?.id,
        },
      ];

      const fallbackOutfit: Outfit = {
        id: `outfit_gen_${Date.now()}`,
        title: 'Curated Harmonic Coordination',
        titleAr: 'تنسيق هادئ متناسق لمناسبتك',
        occasion: 'smart_casual',
        style: 'quiet_luxury',
        imageUrl: buildLookImageUrl({
          outfitTitle: 'Curated Harmonic Coordination',
          style: 'quiet_luxury',
          occasion: 'smart_casual',
          pieces: rawPieces,
          colors: [
            { name: 'Beige', hex: '#E6DCB8' },
            { name: 'Navy', hex: '#1B263B' },
            { name: 'White', hex: '#FFFFFF' },
          ],
        }),
        pieces: enrichOutfitPiecesWithImages(rawPieces as any, wardrobe),
        colorPalette: [
          { name: 'Beige', hex: '#E6DCB8' },
          { name: 'Navy', hex: '#1B263B' },
          { name: 'White', hex: '#FFFFFF' },
        ],
        whyItWorks:
          'The clean contrast between navy and warm sand creates an effortless, distinguished silhouette without looking overdressed.',
        whyItWorksAr:
          'التباين الهادئ بين الكحلي الداكن والبيج الرملي يمنحك هيبة وحضوراً أنيقاً ومريحاً في نفس الوقت، والسنيكرز يضفي روح الشباب العصرية.',
        stylingTips: ['Roll up shirt sleeves to forearm height', 'Keep the top button open for natural collar roll'],
        stylingTipsAr: ['اطوِ أكمام القميص ثنية أنيقة عند الساعد', 'اترك الزر العلوي مفتوحاً لانسيابية طبيعية ومريحة'],
        isSaved: false,
      };


      const fallbackMsg: ChatMessage = {
        id: `msg_stylist_${Date.now()}`,
        sender: 'stylist',
        text: `Here is a curated outfit designed for you based on your wardrobe pieces and style identity. Notice how the neutral palette balances form and casual comfort.`,
        textAr: `بناءً على ذوقك في الأناقة وقطع خزانتك الحالية، أقترح عليك هذا التنسيق الراقي. انسجام الكتان البيج مع الكحلي يمنحك حضوراً واثقاً وأنيقاً دون أي تكلف.`,
        outfitCard: fallbackOutfit,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Challenge actions
  const toggleChallengeTask = (challengeId: string, day: number) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== challengeId) return c;
        const updatedTasks = c.dailyTasks.map((t) => {
          if (t.day !== day) return t;
          return {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? new Date().toISOString().split('T')[0] : undefined,
          };
        });
        const allDone = updatedTasks.every((t) => t.completed);
        return {
          ...c,
          dailyTasks: updatedTasks,
          isCompleted: allDone,
        };
      })
    );
  };

  // Quick reset demo
  const resetDemoData = () => {
    setWardrobe(INITIAL_WARDROBE);
    setUser(INITIAL_USER_PROFILE);
    setSavedOutfits(SAMPLE_OUTFITS);
    setChallenges(WEEKLY_CHALLENGES);
  };

  return (
    <HeibaContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        formatPrice,
        t,
        isRtl,
        user,
        updateUser,
        completeOnboarding,
        upgradeToPro,
        downgradeToFree,
        wardrobe,
        addWardrobeItem,
        removeWardrobeItem,
        toggleFavoriteItem,
        wardrobeInsights,
        savedOutfits,
        saveOutfit,
        removeSavedOutfit,
        isOutfitSaved,
        chatMessages,
        sendChatMessage,
        isChatLoading,
        challenges,
        toggleChallengeTask,
        currentView,
        setCurrentView,
        showUpgradeModal,
        setShowUpgradeModal,
        resetDemoData,
      }}
    >
      {children}
    </HeibaContext.Provider>
  );
}

export function useHeiba() {
  const context = useContext(HeibaContext);
  if (!context) {
    throw new Error('useHeiba must be used within a HeibaProvider');
  }
  return context;
}
