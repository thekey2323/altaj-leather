export type OrderStatus =
  | 'NEW'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'OUT OF STOCK' | 'ARCHIVED';

export type AdminRole = 'OWNER' | 'ADMIN' | 'STAFF';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isFeatured: boolean;
  order: number;
}

export interface BundleOffer {
  id: string;
  name: string;
  quantity: number;
  price: number;
  badge?: string;
  savings?: number;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice: number;
  cost: number;
  costBreakdown?: WalletCostBreakdown;
  promotionBadge?: string;
  images: ProductImage[];
  featuredImage: string;
  stock: number;
  lowStockThreshold: number;
  category: string;
  tags: string[];
  status: ProductStatus;
  materials: string[];
  dimensions: string;
  handmadeIn: string;
  bundleOffers: BundleOffer[];
  relatedProductSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletCostBreakdown {
  rawLeatherCost: number; // e.g. 24 DH (cuir de vachette pleine fleur, tannage végétal Fès)
  craftingCost: number; // e.g. 18 DH (façonnage maâlem artisan maroquinier, découpe, parage)
  suppliesCost: number; // e.g. 8 DH (fil ciré haute résistance, teinture de tranche, cire d'abeille)
  packagingCost: number; // e.g. 8 DH (boîte rigide luxe ALTAJ, pochon suédine, carte d'authenticité)
  marketingCpa: number; // e.g. 35 DH (dépense publicitaire moyenne Meta / TikTok par commande)
  deliveryCost: number; // e.g. 35 DH (frais société de livraison Cathedis/Amana par colis distribué)
  returnRiskBuffer: number; // e.g. 6 DH (pénalité de retour 20 DH amortie selon taux de retour)
  callCenterCost: number; // e.g. 3 DH (confirmation téléphonique et validation WhatsApp)
}

export interface CartItem {
  product: Product;
  quantity: number;
  bundleOffer?: BundleOffer;
  selectedColor?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  bundleName?: string;
}

export interface OrderNote {
  id: string;
  orderId: string;
  author: string;
  text: string;
  createdAt: string;
  type: 'STATUS_CHANGE' | 'CUSTOMER_CONTACT' | 'INTERNAL_NOTE';
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  notes?: string;
  itemsSummary?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  courierCost?: number; // Frais réel facturé par la société de livraison pour cette commande (ex: 25, 30, 35, 45 DH)
  total: number;
  status: OrderStatus;
  paymentMethod: 'COD';
  utmSource?: string;
  utmCampaign?: string;
  internalNotes: OrderNote[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  reliabilityScore: number; // 0-100%
  notes?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  action: 'ADD' | 'REMOVE' | 'ADJUST' | 'ORDER_FULFILL' | 'RETURN';
  quantityChange: number;
  newStock: number;
  reason: string;
  createdAt: string;
  performedBy: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  country: string;
  whatsappNumber: string;
  whatsappPrefilledMessage: string;
  supportPhone: string;
  supportEmail: string;
  shippingFeeStandard: number;
  freeShippingThreshold: number;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  announcementText: string;
}

export type CampaignPlatform = 'META' | 'TIKTOK' | 'GOOGLE' | 'INFLUENCER' | 'WHATSAPP';
export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT';
export type CreativeType = 'VIDEO_REELS' | 'TIKTOK_UGC' | 'CAROUSEL_PHOTO' | 'IMAGE_STATIC' | 'WHATSAPP_BROADCAST';

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: CampaignPlatform;
  status: CampaignStatus;
  budget: number;
  budgetType: 'DAILY' | 'LIFETIME';
  spent: number;
  targetAudience: string;
  utmCampaign: string;
  utmSource: string;
  creativeType: CreativeType;
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// WHATSAPP BOT & CRM TYPES (Moroccan COD Special)
// -------------------------------------------------------------
export type WhatsAppMessageSender = 'CUSTOMER' | 'BOT' | 'AGENT';
export type WhatsAppMessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  sender: WhatsAppMessageSender;
  text: string;
  mediaType?: 'image' | 'video' | 'catalog';
  mediaUrl?: string;
  mediaCaption?: string;
  mediaItems?: {
    title: string;
    imageUrl: string;
    price: number;
    description?: string;
  }[];
  timestamp: string;
  status?: WhatsAppMessageStatus;
}

export type WhatsAppFunnelState =
  | 'GREETING'
  | 'SHOWING_MODELS'
  | 'OFFER_PITCH'
  | 'ASKING_DETAILS'
  | 'CONFIRMING_ORDER'
  | 'ORDER_PLACED'
  | 'HUMAN_TAKEOVER';

export interface WhatsAppCapturedOrder {
  customerName?: string;
  customerPhone?: string;
  customerCity?: string;
  customerAddress?: string;
  modelChosen?: string;
  quantity?: number;
  totalPrice?: number;
  shippingFee?: number;
  isConfirmed?: boolean;
  orderId?: string;
  orderNumber?: string;
  confirmedAt?: string;
}

export interface WhatsAppConversation {
  id: string;
  customerPhone: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  botActive: boolean;
  funnelState: WhatsAppFunnelState;
  capturedOrder?: WhatsAppCapturedOrder;
  tags: string[]; // e.g. ["Ad-Facebook", "Pack-Duo", "Casa", "Commande-Confirmée"]
  utmSource?: string;
  utmCampaign?: string;
  messages: WhatsAppMessage[];
}

export interface WhatsAppModelMedia {
  id: string;
  name: string;
  slug: string;
  badge?: string;
  price: number;
  compareAtPrice?: number;
  packDuoPrice: number;
  darijaDescription: string;
  photos: string[];
  videoUrl?: string;
  videoCaption?: string;
  isAvailable: boolean;
  autoSendOnGreeting: boolean;
  order: number;
}

export interface WhatsAppBotScripts {
  greeting: string;
  catalogIntro: string;
  pricingOffer: string;
  askAddress: string;
  orderConfirmationPrompt: string;
  orderConfirmedSuccess: string;
  faqRealLeather: string;
  faqDeliveryTime: string;
  faqGuarantee: string;
}

export interface WhatsAppBotConfig {
  isConnected: boolean;
  connectionMethod: 'QR_CODE' | 'META_CLOUD_API';
  connectedNumber: string;
  connectedDeviceName?: string;
  connectedAt?: string;
  autoReplyEnabled: boolean;
  autoSendMediaOnAdArrival: boolean;
  darijaTone: 'FRIENDLY_SALES' | 'FORMAL' | 'CASUAL';
  aiProvider?: 'GEMINI_AI' | 'RULES_ONLY';
  aiModel?: string;
  aiCustomSystemPrompt?: string;
  scripts: WhatsAppBotScripts;
  metaCloudConfig?: {
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
    verifyToken: string;
    webhookUrl: string;
  };
}

export interface CustomerReview {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
  audioUrl?: string;
  audioDuration?: string;
  productSlug?: string;
  createdAt: string;
}


