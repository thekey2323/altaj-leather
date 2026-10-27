export type Language = 'ar' | 'en';
export type Currency = 'SAR' | 'EGP' | 'MAD' | 'USD';

export type ClothingCategory =
  | 't_shirts'
  | 'shirts'
  | 'polo_shirts'
  | 'jeans'
  | 'chinos'
  | 'trousers'
  | 'shorts'
  | 'jackets'
  | 'blazers'
  | 'suits'
  | 'sneakers'
  | 'shoes'
  | 'boots'
  | 'watches'
  | 'belts'
  | 'bags'
  | 'accessories';

export type StylePreference =
  | 'old_money'
  | 'quiet_luxury'
  | 'smart_casual'
  | 'streetwear'
  | 'minimalist'
  | 'classic'
  | 'sporty'
  | 'formal'
  | 'casual';

export type Lifestyle = 'student' | 'office' | 'business' | 'creative' | 'active' | 'mixed';

export type BodyBuild = 'slim' | 'athletic' | 'average' | 'muscular' | 'heavy';

export type FitPreference = 'slim' | 'regular' | 'relaxed' | 'oversized';

export type OccasionType =
  | 'daily_casual'
  | 'smart_casual'
  | 'office'
  | 'date_night'
  | 'wedding'
  | 'travel'
  | 'summer'
  | 'winter'
  | 'gym'
  | 'friday_prayer'
  | 'night_out';

export interface WardrobeItem {
  id: string;
  name: string;
  nameAr: string;
  category: ClothingCategory;
  color: string;
  colorHex: string;
  pattern?: string;
  material?: string;
  fit?: FitPreference;
  season?: 'summer' | 'winter' | 'all_season' | 'transitional';
  formality?: 'casual' | 'smart_casual' | 'formal';
  brand?: string;
  price?: number;
  currency?: Currency;
  imageUrl: string;
  isFavorite?: boolean;
  wearCount?: number;
  createdAt?: string;
}

export interface OutfitPiece {
  category: ClothingCategory;
  name: string;
  nameAr: string;
  color: string;
  colorHex: string;
  itemRefId?: string; // Links to user's wardrobe item if matched
  imageUrl?: string;
}

export interface Outfit {
  id: string;
  title: string;
  titleAr: string;
  occasion: OccasionType;
  style: StylePreference;
  pieces: OutfitPiece[];
  colorPalette: { name: string; hex: string }[];
  whyItWorks: string;
  whyItWorksAr: string;
  stylingTips: string[];
  stylingTipsAr: string[];
  imageUrl?: string;
  imagePrompt?: string;
  isSaved?: boolean;
  createdAt?: string;
  matchScore?: number; // % match with user wardrobe
}

export interface StyleIdentity {
  code: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  bestColors: { name: string; nameAr: string; hex: string }[];
  recommendedFits: FitPreference[];
  recommendedFitsAr: string[];
  wardrobeEssentials: string[];
  wardrobeEssentialsAr: string[];
  thingsToAvoid: string[];
  thingsToAvoidAr: string[];
  sampleOutfits: Outfit[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  language: Language;
  currency: Currency;
  isPro: boolean;
  proExpiresAt?: string;
  aiQueriesUsedToday: number;
  aiQueriesLimit: number;
  ageRange?: string;
  country?: string;
  heightCm?: number;
  preferredFit?: FitPreference;
  bodyBuild?: BodyBuild;
  skinTone?: string;
  clothingSize?: string;
  lifestyle?: Lifestyle;
  occasions?: OccasionType[];
  preferredStyles?: StylePreference[];
  usualColors?: string[];
  colorsToTry?: string[];
  budgetLevel?: 'budget' | 'mid_range' | 'luxury' | 'flexible';
  mainGoal?: string;
  styleIdentity?: StyleIdentity;
  onboardingCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'stylist';
  text: string;
  textAr?: string;
  timestamp: string;
  outfitCard?: Outfit;
  suggestedItems?: WardrobeItem[];
  imageUrl?: string;
  isStreaming?: boolean;
}

export interface OutfitAnalysisResult {
  id: string;
  imageUrl: string;
  overallScore: number; // 0-100
  colorHarmony: {
    status: 'excellent' | 'good' | 'fair';
    feedback: string;
    feedbackAr: string;
  };
  proportionsAndFit: {
    status: 'excellent' | 'good' | 'fair';
    feedback: string;
    feedbackAr: string;
  };
  occasionSuitability: {
    status: 'excellent' | 'good' | 'fair';
    feedback: string;
    feedbackAr: string;
  };
  detectedItems: string[];
  detectedItemsAr: string[];
  whatWorks: string[];
  whatWorksAr: string[];
  stylingOpportunity: string;
  stylingOpportunityAr: string;
  quickUpgrade: string;
  quickUpgradeAr: string;
  recommendedAddition?: string;
  recommendedAdditionAr?: string;
  createdAt: string;
}

export interface StyleChallenge {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  difficulty: 'easy' | 'medium' | 'hard';
  daysCount: number;
  currentDay: number;
  badgeName: string;
  badgeNameAr: string;
  badgeIcon: string;
  dailyTasks: {
    day: number;
    task: string;
    taskAr: string;
    completed: boolean;
    photoUrl?: string;
    completedAt?: string;
  }[];
  isCompleted?: boolean;
}

export interface InspirationLook {
  id: string;
  title: string;
  titleAr: string;
  category: StylePreference;
  imageUrl: string;
  occasion: OccasionType;
  colorPalette: { name: string; hex: string }[];
  pieces: string[];
  piecesAr: string[];
  saved?: boolean;
}

export interface ShoppingRecommendation {
  id: string;
  title: string;
  titleAr: string;
  category: ClothingCategory;
  reason: string;
  reasonAr: string;
  priority: 'must_have' | 'recommended' | 'optional';
  colorHex: string;
  estimatedPrice: {
    SAR: number;
    EGP: number;
    MAD: number;
    USD: number;
  };
  costPerWearInsight: string;
  costPerWearInsightAr: string;
  pairsWithItemsCount: number;
  sampleImageUrl: string;
}
