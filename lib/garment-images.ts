import { ClothingCategory, OutfitPiece, WardrobeItem } from '@/types/heiba';

export const DEFAULT_CATEGORY_IMAGES: Record<ClothingCategory, string> = {
  shirts: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
  t_shirts: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  polo_shirts: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
  chinos: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
  jeans: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80',
  trousers: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
  shorts: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
  blazers: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
  jackets: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=600&q=80',
  suits: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=600&q=80',
  sneakers: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
  shoes: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
  boots: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',
  watches: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
  belts: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80',
  bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  accessories: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
};

export function resolvePieceImage(
  piece: Partial<OutfitPiece>,
  wardrobe: WardrobeItem[] = []
): string {
  // If piece already has a verified image URL, use it
  if (piece.imageUrl && piece.imageUrl.startsWith('http')) {
    return piece.imageUrl;
  }

  // If piece references an item in user's wardrobe
  if (piece.itemRefId) {
    const matched = wardrobe.find((i) => i.id === piece.itemRefId);
    if (matched?.imageUrl) return matched.imageUrl;
  }

  // Match wardrobe item by category
  if (piece.category) {
    const matchedCat = wardrobe.find((i) => i.category === piece.category);
    if (matchedCat?.imageUrl) return matchedCat.imageUrl;
  }

  // Fallback to high-quality garment stock image
  const cat = (piece.category || 'shirts') as ClothingCategory;
  return DEFAULT_CATEGORY_IMAGES[cat] || DEFAULT_CATEGORY_IMAGES.shirts;
}

export function enrichOutfitPiecesWithImages(
  pieces: OutfitPiece[],
  wardrobe: WardrobeItem[] = []
): OutfitPiece[] {
  return pieces.map((piece) => ({
    ...piece,
    imageUrl: resolvePieceImage(piece, wardrobe),
  }));
}
