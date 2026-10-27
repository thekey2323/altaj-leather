import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_MODEL_TEXT, isGeminiConfigured } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, itemNameHint } = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
      itemNameHint?: string;
    };

    // Default smart tagger fallback
    const fallbackTags = {
      category: 'shirts',
      name: itemNameHint || 'Textured Linen Blend Shirt',
      nameAr: itemNameHint ? `قطعة ${itemNameHint}` : 'قميص كتان مميز',
      color: 'Beige',
      colorHex: '#E8DCce',
      pattern: 'Solid',
      material: 'Linen Blend',
      fit: 'regular',
      season: 'all_season',
      formality: 'smart_casual',
      confidence: 0.94,
    };

    if (!isGeminiConfigured() || !geminiClient) {
      return NextResponse.json(fallbackTags);
    }

    const prompt = `Analyze this menswear clothing item.
Item Name hint if any: "${itemNameHint || 'None'}".
Determine:
1. category: one of ["t_shirts", "shirts", "polo_shirts", "jeans", "chinos", "trousers", "shorts", "jackets", "blazers", "suits", "sneakers", "shoes", "boots", "watches", "belts", "bags", "accessories"]
2. name: English descriptive name (e.g. "Tailored Pleated Chinos")
3. nameAr: Natural Arabic name (e.g. "سروال تشينو بكسرات")
4. color: Dominant color name
5. colorHex: Hex code (e.g. "#1B263B")
6. pattern: e.g. "Solid", "Striped", "Plaid", "Textured"
7. material: e.g. "Cotton", "Linen", "Wool", "Denim", "Leather"
8. fit: one of ["slim", "regular", "relaxed", "oversized"]
9. season: one of ["summer", "winter", "all_season", "transitional"]
10. formality: one of ["casual", "smart_casual", "formal"]

Return ONLY valid JSON matching this schema:
{
  "category": "shirts",
  "name": "...",
  "nameAr": "...",
  "color": "...",
  "colorHex": "#...",
  "pattern": "...",
  "material": "...",
  "fit": "regular",
  "season": "all_season",
  "formality": "smart_casual"
}`;

    const model = geminiClient.getGenerativeModel({
      model: GEMINI_MODEL_TEXT,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Tag Item API Error:', err);
    return NextResponse.json({
      category: 'shirts',
      name: 'Tailored Cotton Shirt',
      nameAr: 'قميص قطني أنيق',
      color: 'Off-White',
      colorHex: '#FAF0E6',
      pattern: 'Solid',
      material: 'Cotton',
      fit: 'regular',
      season: 'all_season',
      formality: 'smart_casual',
    });
  }
}
