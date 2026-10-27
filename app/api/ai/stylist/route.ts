import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_MODEL_TEXT, isGeminiConfigured } from '@/lib/gemini';
import { WardrobeItem, UserProfile } from '@/types/heiba';
import { enrichOutfitPiecesWithImages } from '@/lib/garment-images';
import { buildLookImageUrl } from '@/lib/image-generator';

export async function POST(req: NextRequest) {
  let wardrobe: WardrobeItem[] = [];
  let userProfile: Partial<UserProfile> = {};
  let language: 'ar' | 'en' = 'ar';

  try {
    const body = await req.json();
    const prompt: string = body.prompt || '';
    if (body.wardrobe) wardrobe = body.wardrobe;
    if (body.userProfile) userProfile = body.userProfile;
    if (body.language) language = body.language;

    const isArabic = language === 'ar';


    // Fallback response generator if Gemini is not configured or fails
    const createFallbackResponse = () => {
      const wardrobeItemsStr = wardrobe.slice(0, 4).map(i => i.nameAr || i.name).join('، ');
      return {
        text: `تنسيق متناسق ومميز لإطلالتك. بالنظر إلى أسلوبك المفضل (${userProfile.styleIdentity?.nameAr || 'الفخامة الهادئة'}) والقطع المتاحة في خزانتك، قمت باختيار هذه التوليفة لتحصل على أعلى درجات الجاذبية والأناقة المتزنة.`,
        textEn: `Here is an elevated coordination tailored to your style preferences (${userProfile.styleIdentity?.name || 'Modern Quiet Luxury'}) and core wardrobe pieces.`,
        textAr: `تنسيق متناسق ومميز لإطلالتك. بالنظر إلى أسلوبك المفضل (${userProfile.styleIdentity?.nameAr || 'الفخامة الهادئة'}) والقطع المتاحة في خزانتك (${wardrobeItemsStr || 'الكتان والتشينو والسنيكرز الأبيض'})، قمت باختيار هذه التوليفة لتمنحك حضوراً واثقاً وأنيقاً.`,
        outfitCard: {
          id: `outfit_${Date.now()}`,
          title: 'Harmonic Casual Elegance',
          titleAr: 'تنسيق متناسق هادئ وراقي',
          occasion: 'smart_casual',
          style: userProfile.styleIdentity?.code || 'quiet_luxury',
          imageUrl: buildLookImageUrl({
            outfitTitle: 'Harmonic Casual Elegance',
            style: userProfile.styleIdentity?.code || 'quiet_luxury',
            occasion: 'smart_casual',
            pieces: [
              { name: 'Linen Button-Down Shirt', color: 'Beige' },
              { name: 'Tailored Chinos', color: 'Navy Blue' },
              { name: 'White Leather Sneakers', color: 'White' },
            ],
            colors: [{ name: 'Beige' }, { name: 'Navy Blue' }, { name: 'White' }],
          }),
          pieces: enrichOutfitPiecesWithImages([
            {
              category: 'shirts',
              name: 'Linen Button-Down Shirt',
              nameAr: 'قميص كتان بيج كاجوال',
              color: 'Beige',
              colorHex: '#E6DCB8',
              itemRefId: wardrobe[0]?.id,
            },
            {
              category: 'chinos',
              name: 'Tailored Chinos',
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
          ], wardrobe),

          colorPalette: [
            { name: 'Beige', hex: '#E6DCB8' },
            { name: 'Navy', hex: '#1B263B' },
            { name: 'White', hex: '#FFFFFF' },
          ],
          whyItWorks: 'The warmth of linen softens the deep navy chinos, providing a balanced, commanding masculine aesthetic.',
          whyItWorksAr: 'دفء الكتان البيج يكسر رسمية السروال الكحلي، والسنيكرز الأبيض يمنح الإطلالة لمسة شبابية راقية ومتوازنة.',
          stylingTips: ['Roll up shirt sleeves twice', 'Wear no-show socks with sneakers'],
          stylingTipsAr: ['اطوِ أكمام القميص ثنية أنيقة عند الساعد', 'استخدم جوارب قصيرة غير ظاهرة'],
        },
      };
    };

    if (!isGeminiConfigured() || !geminiClient) {
      return NextResponse.json(createFallbackResponse());
    }

    // Build rich prompt for Gemini
    const wardrobeList = wardrobe
      .map(
        (item) =>
          `- ID: ${item.id} | ${item.name} (${item.nameAr}) | Category: ${item.category} | Color: ${item.color} | Formality: ${item.formality}`
      )
      .join('\n');

    const systemPrompt = `You are HEIBA (هيبة), the premier AI personal stylist for men in Saudi Arabia, Egypt, Morocco, and the wider MENA region.
Brand Voice: Confident, elegant, modern, helpful, masculine, premium, friendly, and aspirational.
The user is asking for styling advice.

User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.ageRange || '25-34'}
- Country: ${userProfile.country || 'MENA'}
- Preferred Fit: ${userProfile.preferredFit || 'regular'}
- Body Build: ${userProfile.bodyBuild || 'athletic'}
- Style Identity: ${userProfile.styleIdentity?.name || 'Modern Quiet Luxury'} (${userProfile.styleIdentity?.nameAr || 'الفخامة الهادئة'})

User's Wardrobe Items:
${wardrobeList || 'Standard staples: Linen shirt, Navy chinos, White sneakers, Sand blazer'}

User Question: "${prompt}"

Rules:
1. Provide practical, culturally respectful menswear styling advice tailored to MENA context.
2. In Arabic, write natural, sophisticated modern Arabic (like high-end fashion editorial, friendly and authoritative).
3. If an outfit is appropriate for this query, provide a structured JSON outfit recommendation with items from the user's wardrobe if possible.
4. Output strict JSON only matching this format:
{
  "textAr": "Detailed friendly Arabic response explaining the advice and why this combination works",
  "textEn": "Detailed English response explaining the advice and why this combination works",
  "outfitCard": {
    "title": "Outfit Title (English)",
    "titleAr": "عنوان التنسيق بالعربية",
    "occasion": "smart_casual",
    "style": "quiet_luxury",
    "pieces": [
      { "category": "shirts", "name": "Shirt Name", "nameAr": "اسم القميص", "color": "Beige", "colorHex": "#E6DCB8", "itemRefId": "item_1" }
    ],
    "colorPalette": [
      { "name": "Beige", "hex": "#E6DCB8" }
    ],
    "imagePrompt": "Full-body photographic lookbook of an attractive stylish Arab gentleman standing in city daylight. Wearing on upper body: [EXACT TOP PIECE AND COLOR], on legs: [EXACT BOTTOM PIECE AND COLOR], on feet: [EXACT SHOES AND COLOR]. High fashion editorial style, photorealistic 8k, sharp focus.",
    "whyItWorks": "Explanation in English",
    "whyItWorksAr": "شرح باللغة العربية لسبب تناسق هذا اللوك",
    "stylingTips": ["Tip 1", "Tip 2"],
    "stylingTipsAr": ["نصيحة 1", "نصيحة 2"]
  }
}`;

    const model = geminiClient.getGenerativeModel({
      model: GEMINI_MODEL_TEXT,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    // Ensure outfitCard always has a high-fashion matched look image and enriched piece images
    if (parsed.outfitCard) {
      parsed.outfitCard.imageUrl = buildLookImageUrl({
        outfitTitle: parsed.outfitCard.title,
        style: parsed.outfitCard.style,
        occasion: parsed.outfitCard.occasion,
        pieces: parsed.outfitCard.pieces,
        colors: parsed.outfitCard.colorPalette,
        customPrompt: parsed.outfitCard.imagePrompt,
      });
      if (Array.isArray(parsed.outfitCard.pieces)) {
        parsed.outfitCard.pieces = enrichOutfitPiecesWithImages(parsed.outfitCard.pieces, wardrobe);
      }
    }

    return NextResponse.json({
      text: isArabic ? parsed.textAr : parsed.textEn,
      textAr: parsed.textAr,
      textEn: parsed.textEn,
      outfitCard: parsed.outfitCard,
    });
  } catch (error) {
    console.error('Stylist API Error:', error);
    // Return robust fallback with enriched piece images
    const rawPieces = [
      { category: 'shirts' as const, name: 'Linen Button Shirt', nameAr: 'قميص كتان بيج', color: 'Beige', colorHex: '#E6DCB8', itemRefId: wardrobe[0]?.id },
      { category: 'chinos' as const, name: 'Navy Chinos', nameAr: 'سروال تشينو كحلي', color: 'Navy Blue', colorHex: '#1B263B', itemRefId: wardrobe[1]?.id },
      { category: 'sneakers' as const, name: 'White Leather Sneakers', nameAr: 'سنيكرز جلد أبيض', color: 'White', colorHex: '#FFFFFF', itemRefId: wardrobe[2]?.id },
      { category: 'watches' as const, name: 'Minimal Leather Watch', nameAr: 'ساعة يد بحزام جلدي', color: 'Black', colorHex: '#1F1F1F', itemRefId: wardrobe[4]?.id },
    ];
    return NextResponse.json({
      textAr: 'تنسيق مقترح متناسق يجمع بين قطع خزانتك بأسلوب هادئ وأنيق، مع صور كل قطعة ولوحة الألوان المتناغمة.',
      textEn: 'A curated harmonious coordination combining your wardrobe pieces with exact piece visuals and palette.',
      outfitCard: {
        id: `outfit_${Date.now()}`,
        title: 'Smart Casual Coffee & City',
        titleAr: 'سمارت كاجوال هادئ وراقي',
        occasion: 'smart_casual',
        style: 'quiet_luxury',
        imageUrl: buildLookImageUrl({
          outfitTitle: 'Smart Casual Coffee & City',
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
        whyItWorks: 'Navy and warm beige provide timeless contrast with effortless elegance.',
        whyItWorksAr: 'التباين الهادئ بين البيج والكحلي يمنحك هيبة وحضوراً راقياً بدون أي تكلف.',
        stylingTips: ['Roll sleeves to forearm', 'Keep collar open'],
        stylingTipsAr: ['اطوِ الأكمام ثنية أنيقة', 'اترك الياقة مفتوحة لمظهر مريح'],
      },
    });
  }

}
