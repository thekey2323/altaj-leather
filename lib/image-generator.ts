/**
 * Dynamic Menswear Look Visual Engine
 * Intelligently matches outfit garments, colors, style identity, and occasions
 * to photorealistic high-fashion lookbook editorial photography.
 *
 * Supports remote AI generation via FLUX.1 (Hugging Face / Fal.ai / Pollinations)
 * with instant, high-fidelity editorial fallback matching.
 */

import { CURATED_MENSWEAR_LOOKS, CuratedLook } from './look-library';

export interface LookImagePromptOptions {
  outfitTitle?: string;
  style?: string;
  occasion?: string;
  pieces?: Array<{ name?: string; nameAr?: string; category?: string; color?: string; colorHex?: string }>;
  colors?: Array<{ name?: string; hex?: string }>;
  customPrompt?: string;
  seed?: number;
}

/**
 * Intelligent Garment Matching Algorithm
 * Calculates an affinity score between an outfit recommendation and curated editorial looks.
 */
export function matchCuratedLook(options: LookImagePromptOptions): CuratedLook {
  const { style, occasion, pieces, colors, outfitTitle } = options;

  // Extract garment categories present in the outfit
  const garmentCategories = (pieces || []).map((p) => (p.category || '').toLowerCase().trim());
  const garmentNames = (pieces || []).map((p) => `${p.name || ''} ${p.nameAr || ''}`.toLowerCase());
  const allGarmentText = `${outfitTitle || ''} ${garmentCategories.join(' ')} ${garmentNames.join(' ')}`.toLowerCase();

  // Primary Garment Type Detection (The hero silhouette)
  const isBlazer = allGarmentText.includes('blazer') || garmentCategories.some((c) => c.includes('blazer'));
  const isSuit = allGarmentText.includes('suit') || allGarmentText.includes('بدلة');
  const isOvershirt = allGarmentText.includes('overshirt') || allGarmentText.includes('أوفرشيرت') || allGarmentText.includes('safari');
  const isHoodie = allGarmentText.includes('hoodie') || allGarmentText.includes('هودي');
  const isPolo = allGarmentText.includes('polo') || allGarmentText.includes('بولو');
  const isCoat = allGarmentText.includes('coat') || allGarmentText.includes('معطف');
  const isDenimJacket = allGarmentText.includes('denim jacket') || allGarmentText.includes('جاكيت جينز');
  const isLinen = allGarmentText.includes('linen') || allGarmentText.includes('كتان');
  const isKnit = allGarmentText.includes('knit') || allGarmentText.includes('تريكو') || allGarmentText.includes('كنزة');

  // Extract all searchable tokens from outfit
  const tokens: string[] = [];

  if (style) {
    tokens.push(...style.toLowerCase().split(/[\s_-]+/));
  }

  if (occasion) {
    tokens.push(...occasion.toLowerCase().split(/[\s_-]+/));
  }

  if (Array.isArray(pieces)) {
    for (const p of pieces) {
      if (p.category) tokens.push(...p.category.toLowerCase().split(/[\s_-]+/));
      if (p.color) tokens.push(...p.color.toLowerCase().split(/[\s_-]+/));
      if (p.name) tokens.push(...p.name.toLowerCase().split(/[\s_-]+/));
    }
  }

  if (Array.isArray(colors)) {
    for (const c of colors) {
      if (c.name) tokens.push(...c.name.toLowerCase().split(/[\s_-]+/));
    }
  }

  const cleanTokens = tokens.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 2);

  let bestMatch = CURATED_MENSWEAR_LOOKS[0];
  let highestScore = -999;

  for (const look of CURATED_MENSWEAR_LOOKS) {
    let score = 0;
    const lookText = `${look.id} ${look.keywords.join(' ')} ${look.pieces.top} ${look.pieces.bottom} ${look.pieces.footwear} ${look.titleEn} ${look.descriptionEn}`.toLowerCase();

    // 1. Hero Garment Matching (Decisive weight: +50 / -40)
    if (isBlazer) {
      if (lookText.includes('blazer')) score += 50;
      else score -= 40;
    }
    if (isSuit) {
      if (lookText.includes('suit') && !lookText.includes('swimsuit')) score += 50;
      else score -= 40;
    }
    if (isOvershirt) {
      if (lookText.includes('overshirt') || lookText.includes('utility')) score += 50;
      else score -= 30;
    }
    if (isHoodie) {
      if (lookText.includes('hoodie')) score += 50;
      else score -= 30;
    }
    if (isPolo) {
      if (lookText.includes('polo')) score += 50;
      else score -= 30;
    }
    if (isCoat) {
      if (lookText.includes('coat')) score += 50;
      else score -= 30;
    }
    if (isDenimJacket) {
      if (lookText.includes('denim') && lookText.includes('jacket')) score += 50;
      else score -= 30;
    }
    if (isLinen && !isBlazer) {
      if (lookText.includes('linen')) score += 35;
    }
    if (isKnit && !isBlazer) {
      if (lookText.includes('knit')) score += 25;
    }

    // 2. Style Identity Match (+15)
    if (style && look.style.toLowerCase() === style.toLowerCase()) {
      score += 15;
    }

    // 3. Occasion Match (+10)
    if (occasion && look.occasions.includes(occasion.toLowerCase())) {
      score += 10;
    }

    // 4. Token & Color Affinity Match
    for (const token of cleanTokens) {
      // Direct keyword inclusion
      if (look.keywords.some((k) => k.includes(token) || token.includes(k))) {
        score += 8;
      }
      // Color affinity
      if (look.colors.some((c) => c.includes(token) || token.includes(c))) {
        score += 6;
      }
      // Look description inclusion
      if (lookText.includes(token)) {
        score += 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = look;
    }
  }

  return bestMatch;
}

/**
 * Builds the optimal visual URL for the outfit.
 * Returns the exact matched high-fashion editorial look photograph.
 */
export function buildLookImageUrl(options: LookImagePromptOptions): string {
  const matchedLook = matchCuratedLook(options);
  return matchedLook.imageUrl;
}

/**
 * Builds an anatomical FLUX.1 generation prompt for remote AI inference
 */
export function buildFluxPrompt(options: LookImagePromptOptions): string {
  const { occasion, pieces, customPrompt } = options;

  if (customPrompt) return customPrompt;

  let topWear = '';
  let bottomWear = '';
  let footwear = '';
  let accessories = '';
  const details: string[] = [];

  if (pieces && pieces.length > 0) {
    for (const p of pieces) {
      const cat = (p.category || '').toLowerCase();
      const color = (p.color || '').trim();
      const name = (p.name || p.category || '').trim();
      const desc = color && !name.toLowerCase().includes(color.toLowerCase())
        ? `${color} ${name}`
        : name || color;

      if (['shirts', 't_shirts', 'polo_shirts', 'blazers', 'jackets', 'suits', 'hoodies', 'sweaters'].includes(cat)) {
        topWear = topWear ? `${topWear} layered with ${desc}` : desc;
      } else if (['chinos', 'jeans', 'trousers', 'pants', 'shorts'].includes(cat)) {
        bottomWear = desc;
      } else if (['sneakers', 'shoes', 'boots', 'loafers'].includes(cat)) {
        footwear = desc;
      } else if (['watches', 'belts', 'bags', 'accessories', 'sunglasses'].includes(cat)) {
        accessories = accessories ? `${accessories}, ${desc}` : desc;
      } else {
        details.push(desc);
      }
    }
  }

  if (!topWear) topWear = 'tailored beige linen shirt';
  if (!bottomWear) bottomWear = 'tailored navy chinos';
  if (!footwear) footwear = 'white minimalist leather sneakers';

  let setting = 'modern minimalist urban street architecture in soft daylight';
  if (occasion === 'date_night' || occasion === 'dinner') {
    setting = 'upscale outdoor evening restaurant terrace, soft ambient warm bokeh';
  } else if (occasion === 'formal' || occasion === 'wedding' || occasion === 'office') {
    setting = 'luxury contemporary hotel promenade, natural soft daylight';
  } else if (occasion === 'summer' || occasion === 'weekend') {
    setting = 'sunlit Mediterranean coastal walkway, clean limestone architectural backdrop';
  }

  return (
    `High-fashion editorial full-body lookbook photograph of an attractive stylish Arab gentleman standing with relaxed confident posture. ` +
    `Exact outfit coordination: Upper body: ${topWear}. Lower body: ${bottomWear}. Footwear: ${footwear}. ` +
    (accessories ? `Accessories: ${accessories}. ` : '') +
    (details.length > 0 ? `Details: ${details.join(', ')}. ` : '') +
    `Setting: ${setting}. ` +
    `Photographic aesthetic: shot on Hasselblad H6D, 85mm portrait lens, GQ Middle East lookbook, authentic skin texture, sharp fabric weave, photorealistic 8k uhd.`
  );
}
