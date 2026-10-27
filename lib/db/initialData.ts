import { Product, Order, Customer, InventoryLog, StoreSettings, MarketingCampaign } from "@/types";

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "ALTAJLEATHER",
  tagline: "Maroquinerie Artisanale d'Exception — Façonné au Maroc",
  currency: "DH",
  country: "Maroc",
  whatsappNumber: "212693148230",
  whatsappPrefilledMessage: "Bonjour ALTAJLEATHER, je souhaite avoir plus d'informations sur votre collection en cuir naturel.",
  supportPhone: "+212 6 93 14 82 30",
  supportEmail: "contact@altajleather.ma",
  shippingFeeStandard: 25,
  freeShippingThreshold: 200,
  instagramUrl: "https://instagram.com/altajleather",
  tiktokUrl: "https://tiktok.com/@altajleather",
  facebookUrl: "https://facebook.com/altajleather",
  heroTitle: "CRAFTED TO LAST",
  heroSubtitle: "Portefeuilles en cuir véritable pleine fleur, cousus à la main au fil ciré dans les règles de l'artisanat marocain.",
  heroCtaText: "DÉCOUVRIR LA COLLECTION",
  announcementText: "✨ LIVRAISON GRATUITE DÈS 200 DH (2 PORTEFEUILLES) PARTOUT AU MAROC • PAIEMENT À LA LIVRAISON (COD)",
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-1793122106095",
    "slug": "passeport-holder",
    "name": "Passeport Holder",
    "sku": "ALTAJ-229",
    "tagline": "",
    "description": "",
    "price": 119,
    "compareAtPrice": 169,
    "cost": 50,
    "promotionBadge": "PROMO",
    "images": [
      {
        "id": "img-1793122085418",
        "url": "/images/products/passport-cover.jpg",
        "alt": "",
        "isFeatured": true,
        "order": 1
      },
      {
        "id": "img-1793122176526",
        "url": "/images/products/cognac-minimalist.jpg",
        "alt": "Passeport Holder",
        "isFeatured": false,
        "order": 1
      }
    ],
    "featuredImage": "/images/products/passport-cover.jpg",
    "stock": 20,
    "lowStockThreshold": 5,
    "category": "Portefeuilles",
    "tags": [
      "100% Cuir Naturel"
    ],
    "status": "ACTIVE",
    "materials": [
      "100% Cuir Naturel Tannage Végétal",
      "Fil ciré haute résistance"
    ],
    "dimensions": "10.8 cm x 8.4 cm",
    "handmadeIn": "Atelier ALTAJ — Maroc",
    "bundleOffers": [
      {
        "id": "b-1793122082517-1",
        "name": "1 Portefeuille",
        "quantity": 1,
        "price": 129,
        "badge": "PRIX UNITAIRE",
        "savings": 60
      },
      {
        "id": "b-1793122082517-2",
        "name": "2 Portefeuilles (Pack Duo)",
        "quantity": 2,
        "price": 189,
        "badge": "MEILLEURE OFFRE — LIVRAISON GRATUITE",
        "savings": 189,
        "isPopular": true
      }
    ],
    "relatedProductSlugs": [],
    "seoTitle": "",
    "seoDescription": "",
    "rating": 5,
    "reviewCount": 1,
    "createdAt": "2026-10-27T17:28:26.095Z",
    "updatedAt": "2026-10-27T17:30:05.388Z"
  },
  {
    "id": "prod-1",
    "slug": "altaj-classic-marron",
    "name": "ALTAJ CLASSIC — MARRON",
    "sku": "ALTAJ-CLS-BRN",
    "tagline": "Le chef-d'œuvre intemporel en cuir patiné marron chaud",
    "description": "Confectionné à la main par nos maîtres artisans maroquiniers, le portefeuille ALTAJ Classic Marron marie le raffinement du cuir de vachette pleine fleur à une robustesse incomparable. Doté d'une finition biseautée au fil de lin ciré écru et du sceau royal Taj embossé à chaud, il est conçu pour traverser les décennies en développant une somptueuse patine naturelle.",
    "price": 119,
    "compareAtPrice": 169,
    "cost": 50,
    "promotionBadge": "PROMO",
    "images": [
      {
        "id": "img-1793115538324",
        "url": "/images/products/altaj-classic-marron-custom-1.jpg",
        "alt": "ALTAJ CLASSIC — MARRON",
        "isFeatured": true,
        "order": 1
      },
      {
        "id": "img-1793115569292",
        "url": "/images/products/altaj-classic-marron-custom-2.jpg",
        "alt": "ALTAJ CLASSIC — MARRON",
        "isFeatured": false,
        "order": 1
      },
      {
        "id": "img-1793115561568",
        "url": "/images/products/altaj-classic-marron-custom-3.jpg",
        "alt": "ALTAJ CLASSIC — MARRON",
        "isFeatured": false,
        "order": 1
      }
    ],
    "featuredImage": "/images/products/altaj-classic-marron-custom-1.jpg",
    "stock": 6,
    "lowStockThreshold": 5,
    "category": "Portefeuilles",
    "tags": [
      "Best-Seller",
      "Cuir Vachette",
      "Marron"
    ],
    "status": "ACTIVE",
    "materials": [
      "Cuir de vachette pleine fleur tannage végétal",
      "Fil ciré haute ténacité écru",
      "Tranches lissées à la cire d'abeille"
    ],
    "dimensions": "10.8 cm x 8.4 cm x 1.2 cm",
    "handmadeIn": "Atelier ALTAJ — Fès, Maroc",
    "bundleOffers": [
      {
        "id": "b-1",
        "name": "1 Portefeuille",
        "quantity": 1,
        "price": 119,
        "badge": "PRIX UNITAIRE",
        "savings": 50,
        "isPopular": false
      },
      {
        "id": "b-2",
        "name": "2 Portefeuilles (Pack Duo)",
        "quantity": 2,
        "price": 200,
        "badge": "MEILLEURE OFFRE — LIVRAISON GRATUITE",
        "savings": 138,
        "isPopular": true
      },
      {
        "id": "b-3",
        "name": "3 Portefeuilles (Pack Famille)",
        "quantity": 3,
        "price": 289,
        "badge": "PACK 3 — LIVRAISON GRATUITE",
        "savings": 218,
        "isPopular": false
      }
    ],
    "relatedProductSlugs": [
      "altaj-noir",
      "altaj-classic-open",
      "altaj-signature"
    ],
    "seoTitle": "ALTAJ Classic Marron — Portefeuille Artisanal en Cuir Véritable au Maroc",
    "seoDescription": "Achetez le portefeuille ALTAJ Classic Marron fait main au Maroc. Cuir de vachette pleine fleur, finitions soignées, paiement à la livraison partout au Maroc.",
    "rating": 4.95,
    "reviewCount": 42,
    "createdAt": "2026-10-27T16:53:08.977Z",
    "updatedAt": "2026-10-27T16:53:08.977Z"
  },
  {
    "id": "prod-black-snap",
    "slug": "altaj-noir",
    "name": "ALTAJ NOIR",
    "sku": "ALTAJ-CLS-BLK",
    "tagline": "Cuir naturel noir, surpiqûre soignée et fermoir sécurisé",
    "description": "Confectionné en cuir 100% naturel noir avec finition soignée et format ultra pratique pour cartes et billets.",
    "price": 119,
    "compareAtPrice": 169,
    "cost": 50,
    "promotionBadge": "PROMO",
    "images": [
      {
        "id": "img-noir-1",
        "url": "/images/products/altaj-noir-front.jpg",
        "alt": "ALTAJ NOIR — Face",
        "isFeatured": true,
        "order": 1
      },
      {
        "id": "img-noir-2",
        "url": "/images/products/altaj-noir-open.jpg",
        "alt": "ALTAJ NOIR — Vue Ouverte",
        "isFeatured": false,
        "order": 2
      }
    ],
    "featuredImage": "/images/products/altaj-noir-front.jpg",
    "stock": 4,
    "lowStockThreshold": 2,
    "category": "Portefeuilles",
    "tags": [
      "100% Cuir Naturel",
      "Noir"
    ],
    "status": "ACTIVE",
    "materials": [
      "100% Cuir Naturel Noir",
      "Fil haute résistance"
    ],
    "dimensions": "10.2 cm x 7.5 cm x 0.9 cm",
    "handmadeIn": "Atelier ALTAJ — Maroc",
    "bundleOffers": [
      {
        "id": "b-noir-1",
        "name": "Offre 1 Pièce",
        "quantity": 1,
        "price": 119,
        "badge": "PRIX UNITAIRE",
        "savings": 50
      },
      {
        "id": "b-noir-2",
        "name": "Offre 2 Pièces (Duo)",
        "quantity": 2,
        "price": 189,
        "badge": "🔥 PLUS DEMANDÉ — LIVRAISON GRATUITE",
        "savings": 149,
        "isPopular": true
      }
    ],
    "relatedProductSlugs": [
      "altaj-classic-marron"
    ],
    "seoTitle": "ALTAJ NOIR — 100% Cuir Naturel",
    "seoDescription": "Portefeuille ALTAJ Noir en cuir naturel 100%. Livraison partout au Maroc.",
    "rating": 5,
    "reviewCount": 48,
    "createdAt": "2026-10-27T17:00:59.949Z",
    "updatedAt": "2026-10-27T17:00:59.961Z"
  }
];

// Helper function to create relative ISO dates
const daysAgo = (days: number, hoursOffset: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hoursOffset);
  return d.toISOString();
};

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Amine Chraibi",
    phone: "0661984521",
    city: "Casablanca",
    address: "Résidence Les Iris, Apt 14, Boulevard d'Anfa",
    totalOrders: 1,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalSpent: 199,
    firstOrderDate: "2026-09-08",
    lastOrderDate: "2026-09-08",
    reliabilityScore: 95,
  },
  {
    id: "cust-2",
    name: "Mehdi Benjelloun",
    phone: "0663451298",
    city: "Rabat",
    address: "12 Rue des Consuls, Quartier Hassan",
    totalOrders: 2,
    deliveredOrders: 1,
    cancelledOrders: 0,
    totalSpent: 303,
    firstOrderDate: "2026-08-10",
    lastOrderDate: "2026-09-08",
    reliabilityScore: 100,
  },
  {
    id: "cust-3",
    name: "Yassine Tazi",
    phone: "0770234190",
    city: "Tanger",
    address: "Villa 24, Lotissement Al Boughaz, Malabata",
    totalOrders: 1,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalSpent: 278,
    firstOrderDate: "2026-09-07",
    lastOrderDate: "2026-09-07",
    reliabilityScore: 90,
  },
  {
    id: "cust-4",
    name: "Fatima Ezzahra Idrissi",
    phone: "0668901234",
    city: "Marrakech",
    address: "Rue Ibn Toumert, Guéliz",
    totalOrders: 3,
    deliveredOrders: 3,
    cancelledOrders: 0,
    totalSpent: 582,
    firstOrderDate: "2026-07-15",
    lastOrderDate: "2026-09-07",
    reliabilityScore: 100,
    notes: "Cliente VIP, apprécie les emballages cadeaux soignés.",
  },
  {
    id: "cust-5",
    name: "Hamza Berrada",
    phone: "0664551122",
    city: "Rabat",
    address: "Hay Riad, Secteur 14",
    totalOrders: 1,
    deliveredOrders: 0,
    cancelledOrders: 1,
    totalSpent: 0,
    firstOrderDate: "2026-09-07",
    lastOrderDate: "2026-09-07",
    reliabilityScore: 35,
    notes: "Injoignable au téléphone. Vérifier systématiquement avant envoi.",
  },
  {
    id: "cust-6",
    name: "Driss El Ouafi",
    phone: "0667341209",
    city: "Fès",
    address: "Avenue Mohammed V, Centre Ville",
    totalOrders: 2,
    deliveredOrders: 2,
    cancelledOrders: 0,
    totalSpent: 348,
    firstOrderDate: "2026-08-01",
    lastOrderDate: "2026-09-06",
    reliabilityScore: 100,
  },
];

export const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: "log-1",
    productId: "prod-1",
    productName: "ALTAJ CLASSIC — MARRON",
    sku: "ALTAJ-CLS-BRN",
    action: "ADD",
    quantityChange: 40,
    newStock: 36,
    reason: "Nouvel arrivage atelier maroquinerie Fès",
    createdAt: "2026-09-05T09:00:00Z",
    performedBy: "Othmane (Owner)",
  },
  {
    id: "log-2",
    productId: "prod-1",
    productName: "ALTAJ CLASSIC — MARRON",
    sku: "ALTAJ-CLS-BRN",
    action: "ORDER_FULFILL",
    quantityChange: -2,
    newStock: 34,
    reason: "Expédition commande #ALTAJ-1024",
    createdAt: "2026-09-08T11:46:00Z",
    performedBy: "Système",
  },
  {
    id: "log-3",
    productId: "prod-2",
    productName: "ALTAJ NOIR",
    sku: "ALTAJ-CLS-BLK",
    action: "ADD",
    quantityChange: 25,
    newStock: 23,
    reason: "Production série coutures rouges",
    createdAt: "2026-09-06T14:00:00Z",
    performedBy: "Othmane (Owner)",
  },
  {
    id: "log-4",
    productId: "prod-4",
    productName: "ALTAJ SIGNATURE",
    sku: "ALTAJ-SIG-EDT",
    action: "ADJUST",
    quantityChange: -1,
    newStock: 9,
    reason: "Pièce réservée pour exposition showroom",
    createdAt: "2026-09-07T16:20:00Z",
    performedBy: "Othmane (Owner)",
  },
];

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: "cmp-1",
    name: "Reels Artisans Fès — Polissage & Cire d'Abeille",
    platform: "META",
    status: "ACTIVE",
    budget: 150,
    budgetType: "DAILY",
    spent: 1850,
    targetAudience: "Hommes 24-48 ans • Casablanca, Rabat, Marrakech • Intérêts: Maroquinerie, Luxe, Accessoires",
    utmCampaign: "Reels_Craftsmanship_V2",
    utmSource: "Meta Ads (Instagram)",
    creativeType: "VIDEO_REELS",
    startDate: "2026-09-01",
    notes: "Vidéo macro montrant le travail artisanal et les coutures sellier. Fort taux de conversion sur Casablanca.",
    createdAt: "2026-09-01T09:00:00Z",
    updatedAt: "2026-09-14T10:00:00Z",
  },
  {
    id: "cmp-2",
    name: "TikTok Spark Hook — Test Résistance Couteau & Eau",
    platform: "TIKTOK",
    status: "ACTIVE",
    budget: 120,
    budgetType: "DAILY",
    spent: 1450,
    targetAudience: "Jeunes actifs 20-35 ans • Villes nationales • Hook Darija test solidité cuir véritable",
    utmCampaign: "Moroccan_Leather_Hook",
    utmSource: "TikTok Ads (Spark)",
    creativeType: "TIKTOK_UGC",
    startDate: "2026-09-03",
    notes: "Format UGC dynamique avec l'artisan qui griffe le cuir pour prouver qu'il est 100% pleine fleur.",
    createdAt: "2026-09-03T11:30:00Z",
    updatedAt: "2026-09-14T11:00:00Z",
  },
  {
    id: "cmp-3",
    name: "Facebook Feed Homme Élégance — Pack Duo",
    platform: "META",
    status: "ACTIVE",
    budget: 100,
    budgetType: "DAILY",
    spent: 1150,
    targetAudience: "Hommes 30-55 ans • Cadres & Entrepreneurs • Villes du Nord & Centre (Tanger, Fès, Meknès)",
    utmCampaign: "Men_Accessories_Feed",
    utmSource: "Meta Ads (Facebook)",
    creativeType: "CAROUSEL_PHOTO",
    startDate: "2026-09-05",
    notes: "Carrousel studio mettant en avant l'offre Duo à 200 DH avec livraison gratuite.",
    createdAt: "2026-09-05T14:00:00Z",
    updatedAt: "2026-09-12T16:00:00Z",
  },
  {
    id: "cmp-4",
    name: "Storytelling Héritage de la Médina de Fès",
    platform: "META",
    status: "PAUSED",
    budget: 80,
    budgetType: "DAILY",
    spent: 450,
    targetAudience: "Passionnés de patrimoine marocain et d'artisanat fait main",
    utmCampaign: "Atlas_Tannery_Story",
    utmSource: "Meta Ads (Instagram)",
    creativeType: "VIDEO_REELS",
    startDate: "2026-09-07",
    notes: "Campagne de notoriété et de crédibilité. En pause temporaire au profit des formats conversion.",
    createdAt: "2026-09-07T08:00:00Z",
    updatedAt: "2026-09-13T18:00:00Z",
  },
  {
    id: "cmp-5",
    name: "Relance WhatsApp VIP & Paniers Non Finalisés",
    platform: "WHATSAPP",
    status: "ACTIVE",
    budget: 0,
    budgetType: "DAILY",
    spent: 0,
    targetAudience: "Clients fidèles et prospects ayant demandé des informations par message",
    utmCampaign: "WhatsApp_VIP_Retargeting",
    utmSource: "WhatsApp Direct",
    creativeType: "WHATSAPP_BROADCAST",
    startDate: "2026-09-01",
    notes: "Campagne 0 DH de retargeting direct en Darija courtoise avec suivi personnalisé.",
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-15T07:00:00Z",
  },
  {
    id: "cmp-6",
    name: "Google Search Brand & Mots-Clés Portefeuille Maroc",
    platform: "GOOGLE",
    status: "ACTIVE",
    budget: 30,
    budgetType: "DAILY",
    spent: 350,
    targetAudience: "Recherches Google: 'portefeuille cuir homme maroc', 'artisanat cuir fes'",
    utmCampaign: "Google_Brand_Search",
    utmSource: "Google Search",
    creativeType: "IMAGE_STATIC",
    startDate: "2026-09-02",
    notes: "Capture le trafic intentionniste cherchant activement de la maroquinerie cuir au Maroc.",
    createdAt: "2026-09-02T12:00:00Z",
    updatedAt: "2026-09-14T09:00:00Z",
  },
];
