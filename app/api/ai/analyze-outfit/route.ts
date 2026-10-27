import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_MODEL_TEXT, isGeminiConfigured } from '@/lib/gemini';
import { OutfitAnalysisResult } from '@/types/heiba';

export async function POST(req: NextRequest) {
  try {
    const { outfitDescription, userGoal } = (await req.json()) as {
      outfitDescription?: string;
      userGoal?: string;
    };

    const fallbackAnalysis: OutfitAnalysisResult = {
      id: `analysis_${Date.now()}`,
      imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=80',
      overallScore: 88,
      colorHarmony: {
        status: 'excellent',
        feedback: 'The earthy palette provides natural warmth with clean contrast against the dark trousers.',
        feedbackAr: 'انسجام الألوان ممتاز: تدرجات البيج مع الكحلي تعطي دفئاً طبيعياً متزناً دون صخب.',
      },
      proportionsAndFit: {
        status: 'good',
        feedback: 'Shirt shoulder seam sits right at the natural shoulder line. Trouser break is clean.',
        feedbackAr: 'القصة متناسقة ومريحة، خطوط الكتف متوازنة وحاشية السروال تنتهي بشكل نظيف.',
      },
      occasionSuitability: {
        status: 'excellent',
        feedback: 'Highly appropriate for smart-casual dinners, creative work environments, and coffee meetings.',
        feedbackAr: 'مناسب جداً للعمل الإبداعي، لقاءات العمل غير الرسمية، والطلعات المسائية الراقية.',
      },
      detectedItems: ['Beige Button Shirt', 'Dark Chinos', 'White Leather Sneakers', 'Leather Strap Watch'],
      detectedItemsAr: ['قميص بيج', 'سروال تشينو كحلي', 'سنيكرز جلد أبيض', 'ساعة يد بحزام جلدي'],
      whatWorks: [
        'Balanced contrast between upper and lower garment tones',
        'Minimalist footwear keeps the look contemporary rather than stiff',
      ],
      whatWorksAr: [
        'التباين المتوازن بين القطعة العلوية الفاتحة والسروال الداكن يمنح حضوراً واثقاً',
        'اختيار الحذاء الأبيض يضفي حيوية عصرية تكسر النمطية',
      ],
      stylingOpportunity: 'Cuffing shirt sleeves once more will add relaxed masculine confidence.',
      stylingOpportunityAr: 'ثني أكمام القميص ثنية خفيفة إضافية يمنح اللوك عفوية رجالية أكثر جاذبية.',
      quickUpgrade: 'Add a braided leather belt matching the tone of your watch strap.',
      quickUpgradeAr: 'إضافة حزام جلد مضفور بنفس درجة لون حزام الساعة لربط تفاصيل اللوك ببراعة.',
      createdAt: new Date().toISOString(),
    };

    if (!isGeminiConfigured() || !geminiClient) {
      return NextResponse.json(fallbackAnalysis);
    }

    const prompt = `You are a respectful, high-end personal menswear stylist for HEIBA (هيبة).
Analyze this men's outfit: "${outfitDescription || 'Beige linen shirt with navy chinos and white sneakers'}".
User Goal: "${userGoal || 'Elevated smart casual'}".

Rules:
1. Be constructive, encouraging, respectful, and sophisticated.
2. Never make medical, weight-shaming, or harsh negative comments.
3. Highlight what works, styling opportunity, and one quick actionable upgrade.
4. Provide structured JSON:
{
  "overallScore": 88,
  "colorHarmony": { "status": "excellent", "feedback": "...", "feedbackAr": "..." },
  "proportionsAndFit": { "status": "good", "feedback": "...", "feedbackAr": "..." },
  "occasionSuitability": { "status": "excellent", "feedback": "...", "feedbackAr": "..." },
  "detectedItems": ["Item 1", "Item 2"],
  "detectedItemsAr": ["قطعة 1", "قطعة 2"],
  "whatWorks": ["Point 1", "Point 2"],
  "whatWorksAr": ["نقطة 1", "نقطة 2"],
  "stylingOpportunity": "...",
  "stylingOpportunityAr": "...",
  "quickUpgrade": "...",
  "quickUpgradeAr": "..."
}`;

    const model = geminiClient.getGenerativeModel({
      model: GEMINI_MODEL_TEXT,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json({
      ...fallbackAnalysis,
      ...parsed,
      id: `analysis_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Analyze Outfit Error:', err);
    return NextResponse.json({
      overallScore: 85,
      colorHarmony: { status: 'good', feedback: 'Pleasing neutral palette', feedbackAr: 'تناسق ألوان هادئ ومريح للعين' },
      proportionsAndFit: { status: 'good', feedback: 'Natural drape', feedbackAr: 'انسيابية طبيعية ومريحة' },
      occasionSuitability: { status: 'excellent', feedback: 'Great for smart casual', feedbackAr: 'ممتاز للسمارت كاجوال' },
      detectedItems: ['Shirt', 'Chinos', 'Sneakers'],
      detectedItemsAr: ['قميص', 'تشينو', 'سنيكرز'],
      whatWorks: ['Good color balance', 'Appropriate footwear'],
      whatWorksAr: ['توازن لوني جيد', 'حذاء مناسب ومريح'],
      stylingOpportunity: 'Ensure shirt is ironed and collar is crisp',
      stylingOpportunityAr: 'الحرص على كي الياقة لتكون مشدودة وأنيقة',
      quickUpgrade: 'Add an understated wrist accessory',
      quickUpgradeAr: 'إضافة إكسسوار يد كلاسيكي خفيف',
      createdAt: new Date().toISOString(),
    });
  }
}
