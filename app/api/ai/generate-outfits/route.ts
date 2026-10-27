import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_MODEL_TEXT, isGeminiConfigured } from '@/lib/gemini';
import { Outfit, OccasionType, StylePreference, WardrobeItem } from '@/types/heiba';
import { buildLookImageUrl } from '@/lib/image-generator';

export async function POST(req: NextRequest) {
  try {
    const { occasion, preferredStyle, wardrobe, includeSuggestions } = (await req.json()) as {
      occasion: OccasionType;
      preferredStyle: StylePreference;
      wardrobe: WardrobeItem[];
      includeSuggestions: boolean;
    };

    // Predefined curated outfits engine
    const curatedOutfits: Outfit[] = [
      {
        id: `gen_outfit_${Date.now()}_1`,
        title: 'Effortless Smart Casual Linen Harmony',
        titleAr: 'تنسيق الكتان الصيفي الراقي',
        occasion: occasion || 'smart_casual',
        style: preferredStyle || 'quiet_luxury',
        imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=80',
        pieces: [
          {
            category: 'shirts',
            name: 'Beige Linen Button-Down',
            nameAr: 'قميص كتان بيج كاجوال',
            color: 'Beige',
            colorHex: '#E6DCB8',
            itemRefId: wardrobe[0]?.id,
          },
          {
            category: 'chinos',
            name: 'Navy Blue Tailored Chinos',
            nameAr: 'سروال تشينو كحلي مفصل',
            color: 'Navy Blue',
            colorHex: '#1B263B',
            itemRefId: wardrobe[1]?.id,
          },
          {
            category: 'sneakers',
            name: 'Clean White Leather Sneakers',
            nameAr: 'سنيكرز جلد أبيض نظيف',
            color: 'White',
            colorHex: '#FFFFFF',
            itemRefId: wardrobe[2]?.id,
          },
        ],
        colorPalette: [
          { name: 'Beige', hex: '#E6DCB8' },
          { name: 'Navy', hex: '#1B263B' },
          { name: 'White', hex: '#FFFFFF' },
        ],
        whyItWorks: 'High versatility and breathing room. Earth tones keep the look grounded and relaxed.',
        whyItWorksAr: 'قمة المرونة والأناقة الهادئة. الألوان الترابية تمنحك إطلالة رجالية طبيعية ومريحة للعين.',
        stylingTips: ['Unbutton top two buttons for an effortless drape', 'Avoid wearing high visible athletic socks'],
        stylingTipsAr: ['اترك أول زرين مفتوحين لانسيابية طبيعية', 'تجنب الجوارب الرياضية الطويلة مع السنيكرز'],
        matchScore: 100,
        isSaved: false,
      },
      {
        id: `gen_outfit_${Date.now()}_2`,
        title: 'Modern Layered Tailored Silhouette',
        titleAr: 'تنسيق الطبقات المعاصر مع البليزر',
        occasion: occasion || 'smart_casual',
        style: preferredStyle || 'old_money',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80',
        pieces: [
          {
            category: 'blazers',
            name: 'Unstructured Sand Blazer',
            nameAr: 'بليزر صيفي غير مبطن لون رملي',
            color: 'Sand',
            colorHex: '#D2B48C',
            itemRefId: wardrobe.find(i => i.category === 'blazers')?.id,
          },
          {
            category: 't_shirts',
            name: 'Heavyweight Off-White Tee',
            nameAr: 'تيشيرت أوف وايت قطني فاخر',
            color: 'Off-White',
            colorHex: '#FAF0E6',
            itemRefId: wardrobe.find(i => i.category === 't_shirts')?.id,
          },
          {
            category: 'chinos',
            name: 'Navy Blue Chinos',
            nameAr: 'تشينو كحلي',
            color: 'Navy Blue',
            colorHex: '#1B263B',
            itemRefId: wardrobe.find(i => i.category === 'chinos')?.id,
          },
          {
            category: 'shoes',
            name: 'Taupe Suede Loafers',
            nameAr: 'حذاء لوفر سويد بني فاتح',
            color: 'Taupe',
            colorHex: '#8B7355',
            itemRefId: wardrobe.find(i => i.category === 'shoes')?.id,
          },
        ],
        colorPalette: [
          { name: 'Sand', hex: '#D2B48C' },
          { name: 'Off-White', hex: '#FAF0E6' },
          { name: 'Navy', hex: '#1B263B' },
          { name: 'Taupe', hex: '#8B7355' },
        ],
        whyItWorks: 'The blazer delivers instant structure, softened by the minimalist crewneck.',
        whyItWorksAr: 'البليزر يمنحك هيبة وحضوراً قوياً فورياً، مع تخفيف رسميته بالتيشيرت القطني الناعم.',
        stylingTips: ['Leave the blazer unbuttoned while standing or moving'],
        stylingTipsAr: ['اترك البليزر مفتوحاً عند الوقوف والحركة لإبراز تناسق الطبقات'],
        matchScore: 92,
        isSaved: false,
      },
      {
        id: `gen_outfit_${Date.now()}_3`,
        title: 'Safari Utility Earth Tones',
        titleAr: 'إطلالة السفاري والزيتي الكلاسيكي',
        occasion: occasion || 'daily_casual',
        style: preferredStyle || 'classic',
        imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=700&q=80',
        pieces: [
          {
            category: 'jackets',
            name: 'Olive Green Overshirt',
            nameAr: 'أوفرشيرت زيتي خفيف',
            color: 'Olive Green',
            colorHex: '#4A5320',
            itemRefId: wardrobe.find(i => i.category === 'jackets')?.id,
          },
          {
            category: 't_shirts',
            name: 'Heavyweight Off-White Tee',
            nameAr: 'تيشيرت أوف وايت',
            color: 'Off-White',
            colorHex: '#FAF0E6',
          },
          {
            category: 'chinos',
            name: 'Navy Chinos',
            nameAr: 'تشينو كحلي',
            color: 'Navy',
            colorHex: '#1B263B',
          },
          {
            category: 'sneakers',
            name: 'Minimal White Sneakers',
            nameAr: 'سنيكرز أبيض ناصع',
            color: 'White',
            colorHex: '#FFFFFF',
          },
        ],
        colorPalette: [
          { name: 'Olive', hex: '#4A5320' },
          { name: 'Off-White', hex: '#FAF0E6' },
          { name: 'Navy', hex: '#1B263B' },
        ],
        whyItWorks: 'Olive and off-white offer a timeless outdoor masculine aesthetic that feels relaxed yet thoughtful.',
        whyItWorksAr: 'تناسق الزيتي مع الأوف وايت يعطي لمسة رجالية كلاسيكية عملية وجذابة لأي يوم عادي.',
        stylingTips: ['Push overshirt sleeves slightly up the forearms'],
        stylingTipsAr: ['ارفع أكمام الأوفرشيرت قليلاً عند الساعد لحركة أكثر راحة وعفوية'],
        matchScore: 95,
        isSaved: false,
      },
    ];

    // Apply dynamic free open-source FLUX.1 look image generation for each outfit based on exact pieces
    const finalizedOutfits = curatedOutfits.map((outfit) => ({
      ...outfit,
      imageUrl: buildLookImageUrl({
        outfitTitle: outfit.title,
        style: outfit.style,
        occasion: outfit.occasion,
        pieces: outfit.pieces,
        colors: outfit.colorPalette,
      }),
    }));

    return NextResponse.json({ outfits: finalizedOutfits });
  } catch (err) {
    console.error('Outfit Generator API Error:', err);
    return NextResponse.json({ outfits: [] }, { status: 500 });
  }
}
