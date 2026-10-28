import { Product } from '@/types';
import { getProducts } from '@/lib/db/store';

export interface ProductBundleOffer {
  id: string;
  quantity: number;
  title: string;
  subtitle: string;
  price: number;
  comparePrice: number;
  savings: number;
  badge?: string;
  isPopular?: boolean;
  freeShipping: boolean;
}

export interface ProductColorVariant {
  name: string;
  frenchName: string;
  colorHex: string;
  slug: string;
  image: string;
}

export interface LuxuryProduct {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  frenchName: string;
  subtitle: string;
  frenchSubtitle: string;
  category: 'wallets' | 'travel' | 'cardholders' | string;
  categoryArabic: string;
  categoryFrench: string;
  price: number;
  compareAtPrice: number;
  featuredImage: string;
  galleryImages: string[];
  color: string;
  frenchColor: string;
  colorHex: string;
  colorVariants?: ProductColorVariant[];
  badge: string;
  frenchBadge: string;
  stock: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  frenchShortDescription: string;
  fullDescription: string;
  frenchFullDescription: string;
  dimensions: string;
  leatherType: string;
  frenchLeatherType: string;
  stitching: string;
  frenchStitching: string;
  capacity: string[];
  frenchCapacity: string[];
  features: string[];
  frenchFeatures: string[];
  boxContents: string[];
  frenchBoxContents: string[];
  bundleOffers: ProductBundleOffer[];
  frenchBundleOffers: ProductBundleOffer[];
  seoTitle: string;
  seoDescription: string;
}

export const LUXURY_PRODUCTS: LuxuryProduct[] = [
  {
    "id": "prod-1793122106095",
    "slug": "passeport-holder",
    "name": "Passeport Holder",
    "arabicName": "غلاف جواز السفر — التاج الملكي",
    "frenchName": "Passeport Holder ALTAJ",
    "subtitle": "حماية أنيقة لجواز السفر وبطاقات السفر في جلد طبيعي 100%",
    "frenchSubtitle": "Protection élégante pour passeport et carte d’embarquement en cuir naturel",
    "category": "travel",
    "categoryArabic": "إكسسوارات السفر الفاخرة",
    "categoryFrench": "Accessoires de Voyage",
    "price": 119,
    "compareAtPrice": 169,
    "featuredImage": "/images/products/passport-cover.jpg",
    "galleryImages": [
      "/images/products/passport-cover.jpg",
      "/images/products/cognac-minimalist.jpg"
    ],
    "color": "بني هافان ملكي",
    "frenchColor": "Brun Havane",
    "colorHex": "#8C522B",
    "badge": "✈️ رفيق السفر",
    "frenchBadge": "✈️ Compagnon de Voyage",
    "stock": 20,
    "rating": 4.98,
    "reviewCount": 96,
    "shortDescription": "غلاف جواز السفر من الجلد الطبيعي المدبوغ نباتياً، يحمي وثائقك بلمسة مغربية راقية.",
    "frenchShortDescription": "Protège-passeport raffiné en cuir naturel pour préserver vos documents essentiels.",
    "fullDescription": "صُمم خصيصاً للمسافر العصري؛ جلد طبيعي سميك يحمي جواز سفرك، مع جيوب مخصصة لبطاقة الصعود وبطاقاتك البنكية.",
    "frenchFullDescription": "Spécialement pensé pour le voyageur moderne : cuir naturel protecteur, fentes cartes et passeport.",
    "dimensions": "14.2 cm x 10.0 cm",
    "leatherType": "جلد طبيعي 100% مدبوغ نباتياً",
    "frenchLeatherType": "100% Cuir Naturel Tannage Végétal",
    "stitching": "خياطة يدوية متقنة بالسراجة",
    "frenchStitching": "Couture sellier traditionnelle faite main",
    "capacity": [
      "جيب مخصص لجواز السفر المغربي والدولي",
      "جيب لبطاقة الصعود إلى الطائرة",
      "فجوات للبطاقات البنكية وبطاقة الهوية"
    ],
    "frenchCapacity": [
      "Emplacement dédié passeport international",
      "Poche pour carte d’embarquement",
      "Fentes pour cartes bancaires"
    ],
    "features": [
      "100% جلد طبيعي متين وأصيل",
      "حجم مثالي للجيب الداخلي للسترة أو الحقيبة",
      "خياطة يدوية معززة تدوم لسنوات"
    ],
    "frenchFeatures": [
      "100% cuir naturel robuste et noble",
      "Format idéal pour poche de veste",
      "Couture sellier renforcée"
    ],
    "boxContents": [
      "غلاف جواز السفر التاج الملكي",
      "تغليف كرافت أنيق",
      "بطاقة ضمان الجلد الطبيعي"
    ],
    "frenchBoxContents": [
      "Protège-passeport ALTAJ fait main",
      "Emballage kraft soigné",
      "Certificat de garantie cuir véritable"
    ],
    "bundleOffers": [
      {
        "id": "bundle-1",
        "quantity": 1,
        "title": "عرض قطعة واحدة",
        "subtitle": "قطعة واحدة بتغليف كرافت أنيق",
        "price": 119,
        "comparePrice": 169,
        "savings": 50,
        "freeShipping": false
      },
      {
        "id": "bundle-2",
        "quantity": 2,
        "title": "عرض قطعتين (الأكثر طلباً)",
        "subtitle": "قطعتان من اختيارك — وفر 69 درهم",
        "price": 189,
        "comparePrice": 238,
        "savings": 49,
        "badge": "🔥 الأكثر طلباً — توصيل مجاني",
        "isPopular": true,
        "freeShipping": true
      },
      {
        "id": "bundle-3",
        "quantity": 3,
        "title": "عرض 3 قطع",
        "subtitle": "3 قطع من اختيارك — توصيل مجاني",
        "price": 249,
        "comparePrice": 357,
        "savings": 108,
        "badge": "توصيل مجاني",
        "freeShipping": true
      }
    ],
    "frenchBundleOffers": [
      {
        "id": "bundle-1",
        "quantity": 1,
        "title": "Offre 1 Pièce",
        "subtitle": "Une pièce sous emballage kraft soigné",
        "price": 119,
        "comparePrice": 169,
        "savings": 50,
        "freeShipping": false
      },
      {
        "id": "bundle-2",
        "quantity": 2,
        "title": "Offre 2 Pièces (Meilleure Vente)",
        "subtitle": "Deux pièces au choix — Économisez 49 DH",
        "price": 189,
        "comparePrice": 238,
        "savings": 49,
        "badge": "🔥 Meilleure Vente — Livraison Gratuite",
        "isPopular": true,
        "freeShipping": true
      },
      {
        "id": "bundle-3",
        "quantity": 3,
        "title": "Offre 3 Pièces",
        "subtitle": "Trois pièces au choix — Livraison Gratuite",
        "price": 249,
        "comparePrice": 357,
        "savings": 108,
        "badge": "Livraison Gratuite",
        "freeShipping": true
      }
    ],
    "seoTitle": "غلاف جواز السفر التاج | جلد طبيعي 100% مغربي",
    "seoDescription": "غلاف جواز السفر من الجلد الطبيعي 100% الفاخر. دفع عند الاستلام وتوصيل بالمغرب."
  },
  {
    "id": "prod-1",
    "slug": "altaj-classic-marron",
    "name": "ALTAJ CLASSIC — MARRON",
    "arabicName": "محفظة التاج كلاسيك — بني مارون",
    "frenchName": "ALTAJ CLASSIC — MARRON",
    "subtitle": "التحفة الكلاسيكية في جلد طبيعي أصيل باللون البني المارون الدافئ",
    "frenchSubtitle": "Le chef-d’œuvre intemporel en cuir patiné marron chaud",
    "category": "wallets",
    "categoryArabic": "محافظ الجيب الفاخرة",
    "categoryFrench": "Portefeuilles de Poche",
    "price": 119,
    "compareAtPrice": 169,
    "featuredImage": "/images/products/altaj-classic-marron-custom-1.jpg",
    "galleryImages": [
      "/images/products/altaj-classic-marron-custom-1.jpg",
      "/images/products/altaj-classic-marron-custom-2.jpg",
      "/images/products/altaj-classic-marron-custom-3.jpg"
    ],
    "color": "بني مارون أصيل",
    "frenchColor": "Marron Cuir Naturel",
    "colorHex": "#5C381E",
    "colorVariants": [
      {
        "name": "بني مارون أصيل",
        "frenchName": "Marron Cuir Naturel",
        "colorHex": "#5C381E",
        "slug": "altaj-classic-marron",
        "image": "/images/products/altaj-classic-marron-custom-1.jpg"
      },
      {
        "name": "أسود ملكي فاخر",
        "frenchName": "Noir Royal",
        "colorHex": "#1A1A1A",
        "slug": "altaj-noir",
        "image": "/images/products/altaj-noir-front.jpg"
      }
    ],
    "badge": "👑 الأكثر طلباً",
    "frenchBadge": "👑 Plus Demandé",
    "stock": 25,
    "rating": 4.97,
    "reviewCount": 142,
    "shortDescription": "محفظة كلاسيكية من الجلد الطبيعي تتسع لجميع بطاقاتك والنقود دون أي انتفاخ في الجيب.",
    "frenchShortDescription": "Portefeuille fin en cuir naturel marron, conçu pour cartes et billets sans encombrement.",
    "fullDescription": "صُنعت يدوياً من جلد طبيعي 100% مدبوغ بمستخلصات نباتية، مع خياطة سراجة يدوية متينة بخيط مشمع تدوم لسنوات طويلة.",
    "frenchFullDescription": "Confectionné à la main par nos maîtres artisans maroquiniers, le portefeuille ALTAJ Classic Marron marie raffinement et robustesse.",
    "dimensions": "10.8 cm x 8.4 cm",
    "leatherType": "جلد طبيعي 100% مدبوغ نباتياً",
    "frenchLeatherType": "100% Cuir Naturel Tannage Végétal",
    "stitching": "خياطة يدوية متقنة بالسراجة",
    "frenchStitching": "Couture sellier traditionnelle faite main",
    "capacity": [
      "تتسع لـ 6 إلى 8 بطاقات بنكية وشخصية",
      "جيب خارجي سريع السحب للبطاقة اليومية",
      "جيب داخلي للنقود الورقية المغربية"
    ],
    "frenchCapacity": [
      "Capacité de 6 à 8 cartes bancaires et d’identité",
      "Poche extérieure à accès rapide",
      "Compartiment intérieur pour billets de banque"
    ],
    "features": [
      "100% جلد طبيعي أصلي يكتسب بريقاً مع الاستخدام",
      "خياطة يدوية متينة لا تنقطع",
      "نحيفة ومريحة تماماً في الجيب"
    ],
    "frenchFeatures": [
      "100% cuir naturel véritable développant une noble patine",
      "Couture sellier main inaltérable",
      "Ultra fin et discret en poche"
    ],
    "boxContents": [
      "محفظة التاج كلاسيك مارون المصنوعة يدوياً",
      "تغليف كرافت أنيق",
      "بطاقة ضمان الأصالة والجلد الطبيعي"
    ],
    "frenchBoxContents": [
      "Portefeuille ALTAJ Classic Marron fait main",
      "Emballage kraft soigné",
      "Certificat d’authenticité cuir naturel"
    ],
    "bundleOffers": [
      {
        "id": "bundle-1",
        "quantity": 1,
        "title": "عرض قطعة واحدة",
        "subtitle": "محفظة واحدة بتغليف كرافت أنيق",
        "price": 119,
        "comparePrice": 169,
        "savings": 50,
        "freeShipping": false
      },
      {
        "id": "bundle-2",
        "quantity": 2,
        "title": "عرض قطعتين (الأكثر طلباً)",
        "subtitle": "قطعتان من اختيارك — وفر 69 درهم",
        "price": 189,
        "comparePrice": 238,
        "savings": 49,
        "badge": "🔥 الأكثر طلباً — توصيل مجاني",
        "isPopular": true,
        "freeShipping": true
      },
      {
        "id": "bundle-3",
        "quantity": 3,
        "title": "عرض 3 قطع",
        "subtitle": "3 قطع من اختيارك — توصيل مجاني",
        "price": 249,
        "comparePrice": 357,
        "savings": 108,
        "badge": "توصيل مجاني",
        "freeShipping": true
      }
    ],
    "frenchBundleOffers": [
      {
        "id": "bundle-1",
        "quantity": 1,
        "title": "Offre 1 Pièce",
        "subtitle": "Un portefeuille sous emballage kraft soigné",
        "price": 119,
        "comparePrice": 169,
        "savings": 50,
        "freeShipping": false
      },
      {
        "id": "bundle-2",
        "quantity": 2,
        "title": "Offre 2 Pièces (Meilleure Vente)",
        "subtitle": "Deux pièces au choix — Économisez 49 DH",
        "price": 189,
        "comparePrice": 238,
        "savings": 49,
        "badge": "🔥 Meilleure Vente — Livraison Gratuite",
        "isPopular": true,
        "freeShipping": true
      },
      {
        "id": "bundle-3",
        "quantity": 3,
        "title": "Offre 3 Pièces",
        "subtitle": "Trois pièces au choix — Livraison Gratuite",
        "price": 249,
        "comparePrice": 357,
        "savings": 108,
        "badge": "Livraison Gratuite",
        "freeShipping": true
      }
    ],
    "seoTitle": "ALTAJ CLASSIC Marron | جلد طبيعي 100% — Altajleather",
    "seoDescription": "محفظة التاج كلاسيك بالجلد الطبيعي 100%. الدفع عند الاستلام والتوصيل بالمغرب."
  },
  {
    "id": "prod-black-snap",
    "slug": "altaj-noir",
    "name": "ALTAJ NOIR",
    "arabicName": "محفظة التاج رويال — أسود فاخر",
    "frenchName": "ALTAJ NOIR",
    "subtitle": "جلد طبيعي أسود أنيق مع خياطة متينة وشعار التاج المنقوش",
    "frenchSubtitle": "Cuir naturel noir profond, finition artisanale et sceau royal gravé",
    "category": "wallets",
    "categoryArabic": "محافظ الجيب الفاخرة",
    "categoryFrench": "Portefeuilles de Poche",
    "price": 119,
    "compareAtPrice": 169,
    "featuredImage": "/images/products/altaj-noir-front.jpg",
    "galleryImages": [
      "/images/products/altaj-noir-front.jpg",
      "/images/products/altaj-noir-open.jpg"
    ],
    "color": "أسود ملكي فاخر",
    "frenchColor": "Noir Royal",
    "colorHex": "#1A1A1A",
    "colorVariants": [
      {
        "name": "أسود ملكي فاخر",
        "frenchName": "Noir Royal",
        "colorHex": "#1A1A1A",
        "slug": "altaj-noir",
        "image": "/images/products/altaj-noir-front.jpg"
      },
      {
        "name": "بني مارون أصيل",
        "frenchName": "Marron Cuir Naturel",
        "colorHex": "#5C381E",
        "slug": "altaj-classic-marron",
        "image": "/images/products/altaj-classic-marron-custom-1.jpg"
      }
    ],
    "badge": "✨ أناقة كلاسيكية",
    "frenchBadge": "✨ Élégance Noire",
    "stock": 18,
    "rating": 4.95,
    "reviewCount": 78,
    "shortDescription": "محفظة سوداء أنيقة من الجلد الطبيعي تتسع لجميع البطاقات والنقود دون أي انتفاخ.",
    "frenchShortDescription": "Portefeuille noir élégant en cuir véritable pleine fleur.",
    "fullDescription": "صُنعت يدوياً من جلد طبيعي 100% مدبوغ بمستخلصات نباتية، مع خياطة سراجة يدوية متينة بالخيط المشمع.",
    "frenchFullDescription": "Fait main en cuir véritable pleine fleur noir avec couture sellier artisanale.",
    "dimensions": "10.8 cm x 8.4 cm",
    "leatherType": "جلد طبيعي 100% مدبوغ نباتياً",
    "frenchLeatherType": "100% Cuir Naturel Tannage Végétal",
    "stitching": "خياطة يدوية متقنة بالسراجة",
    "frenchStitching": "Couture sellier traditionnelle faite main",
    "capacity": [
      "تتسع لـ 6 إلى 8 بطاقات بنكية وشخصية",
      "جيب خارجي سريع السحب للبطاقة اليومية",
      "جيب داخلي للنقود الورقية المغربية"
    ],
    "frenchCapacity": [
      "Capacité de 6 à 8 cartes bancaires et d’identité",
      "Poche extérieure à accès rapide",
      "Compartiment intérieur pour billets de banque"
    ],
    "features": [
      "100% جلد طبيعي أصلي يكتسب بريقاً مع الاستخدام",
      "خياطة يدوية متينة لا تنقطع",
      "نحيفة ومريحة تماماً في الجيب"
    ],
    "frenchFeatures": [
      "100% cuir véritable développant une noble patine",
      "Couture sellier main inaltérable",
      "Ultra fin et discret en poche"
    ],
    "boxContents": [
      "محفظة التاج رويال أسود المصنوعة يدوياً",
      "تغليف كرافت أنيق",
      "بطاقة ضمان الأصالة والجلد الطبيعي"
    ],
    "frenchBoxContents": [
      "Portefeuille ALTAJ Noir fait main",
      "Emballage kraft soigné",
      "Certificat d’authenticité cuir naturel"
    ],
    "bundleOffers": [
      {
        "id": "bundle-1",
        "quantity": 1,
        "title": "عرض قطعة واحدة",
        "subtitle": "محفظة واحدة بتغليف كرافت أنيق",
        "price": 119,
        "comparePrice": 169,
        "savings": 50,
        "freeShipping": false
      },
      {
        "id": "bundle-2",
        "quantity": 2,
        "title": "عرض قطعتين (الأكثر طلباً)",
        "subtitle": "قطعتان من اختيارك — وفر 69 درهم",
        "price": 189,
        "comparePrice": 238,
        "savings": 49,
        "badge": "🔥 الأكثر طلباً — توصيل مجاني",
        "isPopular": true,
        "freeShipping": true
      },
      {
        "id": "bundle-3",
        "quantity": 3,
        "title": "عرض 3 قطع",
        "subtitle": "3 قطع من اختيارك — توصيل مجاني",
        "price": 249,
        "comparePrice": 357,
        "savings": 108,
        "badge": "توصيل مجاني",
        "freeShipping": true
      }
    ],
    "frenchBundleOffers": [
      {
        "id": "bundle-1",
        "quantity": 1,
        "title": "Offre 1 Pièce",
        "subtitle": "Un portefeuille sous emballage kraft soigné",
        "price": 119,
        "comparePrice": 169,
        "savings": 50,
        "freeShipping": false
      },
      {
        "id": "bundle-2",
        "quantity": 2,
        "title": "Offre 2 Pièces (Meilleure Vente)",
        "subtitle": "Deux pièces au choix — Économisez 49 DH",
        "price": 189,
        "comparePrice": 238,
        "savings": 49,
        "badge": "🔥 Meilleure Vente — Livraison Gratuite",
        "isPopular": true,
        "freeShipping": true
      },
      {
        "id": "bundle-3",
        "quantity": 3,
        "title": "Offre 3 Pièces",
        "subtitle": "Trois pièces au choix — Livraison Gratuite",
        "price": 249,
        "comparePrice": 357,
        "savings": 108,
        "badge": "Livraison Gratuite",
        "freeShipping": true
      }
    ],
    "seoTitle": "ALTAJ NOIR | جلد طبيعي 100% أسود فاخر",
    "seoDescription": "محفظة التاج رويال بالجلد الطبيعي 100% أسود فاخر. الدفع عند الاستلام والتوصيل بالمغرب."
  }
];

export function adaptStoreProductToLuxury(p: Product): LuxuryProduct {
  // Check if we have base luxury metadata (descriptions, translations, etc.) by slug or id
  const luxuryBase = LUXURY_PRODUCTS.find(
    (lp) =>
      lp.slug === p.slug ||
      lp.id === p.id ||
      lp.name.toLowerCase() === p.name.toLowerCase()
  );

  // Strictly use images belonging to this product!
  const pImages: string[] = [];
  if (p.featuredImage) {
    pImages.push(p.featuredImage);
  }
  if (Array.isArray(p.images)) {
    p.images.forEach((img) => {
      if (img?.url && !pImages.includes(img.url)) {
        pImages.push(img.url);
      }
    });
  }
  if (pImages.length === 0) {
    if (luxuryBase?.featuredImage) pImages.push(luxuryBase.featuredImage);
    else pImages.push('/images/products/altaj-classic-brown-front.jpg');
  }

  const featImg = p.featuredImage || pImages[0];
  const unitPrice = p.price || 119;
  const comparePrice = p.compareAtPrice || 169;

  return {
    id: p.id,
    slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: p.name,
    arabicName: luxuryBase?.arabicName || p.name,
    frenchName: p.name,
    subtitle: p.tagline || luxuryBase?.subtitle || '100% Cuir Naturel Fait Main',
    frenchSubtitle: p.tagline || luxuryBase?.frenchSubtitle || '100% Cuir Naturel Fait Main',
    category: (luxuryBase?.category || 'wallets') as any,
    categoryArabic: luxuryBase?.categoryArabic || 'محافظ الجيب الفاخرة',
    categoryFrench: luxuryBase?.categoryFrench || 'Portefeuilles de Poche',
    price: unitPrice,
    compareAtPrice: comparePrice,
    featuredImage: featImg,
    galleryImages: pImages,
    color: luxuryBase?.color || 'بني طبيعي فاخر',
    frenchColor: luxuryBase?.frenchColor || 'Cuir Naturel Brun',
    colorHex: luxuryBase?.colorHex || '#6E4326',
    badge: p.promotionBadge || luxuryBase?.badge || '👑 الأكثر طلباً',
    frenchBadge: p.promotionBadge || luxuryBase?.frenchBadge || '👑 Plus Demandé',
    stock: p.stock !== undefined ? p.stock : 10,
    rating: p.rating || 5.0,
    reviewCount: p.reviewCount || 48,
    shortDescription: p.description || luxuryBase?.shortDescription || '100% Cuir Naturel Fait Main.',
    frenchShortDescription: p.description || luxuryBase?.frenchShortDescription || '100% Cuir Naturel Fait Main.',
    fullDescription: p.description || luxuryBase?.fullDescription || '100% Cuir Naturel Fait Main.',
    frenchFullDescription: p.description || luxuryBase?.frenchFullDescription || '100% Cuir Naturel Fait Main.',
    dimensions: p.dimensions || luxuryBase?.dimensions || '10.8 cm x 8.4 cm',
    leatherType: '100% جلد طبيعي مدبوغ نباتياً',
    frenchLeatherType: '100% Cuir Naturel Tannage Végétal',
    stitching: 'خياطة يدوية متقنة بالسراجة',
    frenchStitching: 'Couture sellier traditionnelle faite main',
    capacity: luxuryBase?.capacity || [
      'تتسع لـ 6 إلى 8 بطاقات بنكية وشخصية',
      'جيب خارجي سريع السحب للبطاقة اليومية',
      'جيب داخلي للنقود الورقية المغربية'
    ],
    frenchCapacity: luxuryBase?.frenchCapacity || [
      'Capacité de 6 à 8 cartes bancaires et d’identité',
      'Poche extérieure à accès rapide',
      'Compartiment intérieur pour billets de banque'
    ],
    features: luxuryBase?.features || [
      '100% جلد طبيعي أصلي يكتسب بريقاً مع الاستخدام',
      'خياطة يدوية متينة لا تنقطع',
      'نحيفة ومريحة تماماً في الجيب'
    ],
    frenchFeatures: luxuryBase?.frenchFeatures || [
      '100% cuir naturel véritable développant une noble patine',
      'Couture sellier main inaltérable',
      'Ultra fin et discret en poche'
    ],
    boxContents: luxuryBase?.boxContents || [
      'محفظة التاج الملكية المصنوعة يدوياً',
      'تغليف كرافت أنيق',
      'بطاقة ضمان الأصالة والجلد الطبيعي'
    ],
    frenchBoxContents: luxuryBase?.frenchBoxContents || [
      'Portefeuille ALTAJ fait main',
      'Emballage kraft soigné',
      'Certificat d’authenticité cuir naturel'
    ],
    bundleOffers: (() => {
      const customDuo = p.bundleOffers?.find((b) => b.quantity === 2 || b.id === 'bundle-2');
      const customTrio = p.bundleOffers?.find((b) => b.quantity === 3 || b.id === 'bundle-3');
      const duoPrice = customDuo?.price !== undefined && Number(customDuo.price) > 0
        ? Number(customDuo.price)
        : (unitPrice === 119 ? 189 : Math.round((unitPrice * 2) * 0.8));
      const trioPrice = customTrio?.price !== undefined && Number(customTrio.price) > 0
        ? Number(customTrio.price)
        : (unitPrice === 119 ? 249 : Math.round((unitPrice * 3) * 0.72));
      const duoSavings = Math.max(0, (unitPrice * 2) - duoPrice);
      const trioSavings = Math.max(0, (unitPrice * 3) - trioPrice);

      return [
        {
          id: 'bundle-1',
          quantity: 1,
          title: 'عرض قطعة واحدة',
          subtitle: 'محفظة واحدة بتغليف كرافت أنيق',
          price: unitPrice,
          comparePrice: comparePrice,
          savings: Math.max(0, comparePrice - unitPrice),
          freeShipping: false
        },
        {
          id: 'bundle-2',
          quantity: 2,
          title: 'عرض قطعتين (الأكثر طلباً)',
          subtitle: `قطعتان من اختيارك — وفر ${duoSavings} درهم`,
          price: duoPrice,
          comparePrice: unitPrice * 2,
          savings: duoSavings,
          badge: '🔥 الأكثر طلباً — توصيل مجاني',
          isPopular: true,
          freeShipping: true
        },
        {
          id: 'bundle-3',
          quantity: 3,
          title: 'عرض 3 قطع',
          subtitle: '3 قطع من اختيارك — توصيل مجاني',
          price: trioPrice,
          comparePrice: unitPrice * 3,
          savings: trioSavings,
          badge: 'توصيل مجاني',
          freeShipping: true
        }
      ];
    })(),
    frenchBundleOffers: (() => {
      const customDuo = p.bundleOffers?.find((b) => b.quantity === 2 || b.id === 'bundle-2');
      const customTrio = p.bundleOffers?.find((b) => b.quantity === 3 || b.id === 'bundle-3');
      const duoPrice = customDuo?.price !== undefined && Number(customDuo.price) > 0
        ? Number(customDuo.price)
        : (unitPrice === 119 ? 189 : Math.round((unitPrice * 2) * 0.8));
      const trioPrice = customTrio?.price !== undefined && Number(customTrio.price) > 0
        ? Number(customTrio.price)
        : (unitPrice === 119 ? 249 : Math.round((unitPrice * 3) * 0.72));
      const duoSavings = Math.max(0, (unitPrice * 2) - duoPrice);
      const trioSavings = Math.max(0, (unitPrice * 3) - trioPrice);

      return [
        {
          id: 'bundle-1',
          quantity: 1,
          title: 'Offre 1 Pièce',
          subtitle: 'Un portefeuille sous emballage kraft soigné',
          price: unitPrice,
          comparePrice: comparePrice,
          savings: Math.max(0, comparePrice - unitPrice),
          freeShipping: false
        },
        {
          id: 'bundle-2',
          quantity: 2,
          title: 'Offre 2 Pièces (Meilleure Vente)',
          subtitle: `Deux pièces au choix — Économisez ${duoSavings} DH`,
          price: duoPrice,
          comparePrice: unitPrice * 2,
          savings: duoSavings,
          badge: '🔥 Meilleure Vente — Livraison Gratuite',
          isPopular: true,
          freeShipping: true
        },
        {
          id: 'bundle-3',
          quantity: 3,
          title: 'Offre 3 Pièces',
          subtitle: 'Trois pièces au choix — Livraison Gratuite',
          price: trioPrice,
          comparePrice: unitPrice * 3,
          savings: trioSavings,
          badge: 'Livraison Gratuite',
          freeShipping: true
        }
      ];
    })(),
    seoTitle: p.seoTitle || luxuryBase?.seoTitle || `${p.name} | جلد طبيعي 100% — Altajleather`,
    seoDescription: p.seoDescription || luxuryBase?.seoDescription || `${p.name} مصنوع يدوياً من الجلد الطبيعي 100%. الدفع عند الاستلام والتوصيل بالمغرب.`
  };
}

export function getAllProducts(): LuxuryProduct[] {
  try {
    const storeProducts = getProducts();
    if (Array.isArray(storeProducts) && storeProducts.length > 0) {
      return storeProducts.map(adaptStoreProductToLuxury);
    }
  } catch {}
  return LUXURY_PRODUCTS;
}

export function getProductBySlug(slug: string): LuxuryProduct | undefined {
  try {
    const storeProducts = getProducts();
    if (Array.isArray(storeProducts) && storeProducts.length > 0) {
      const found = storeProducts.find((p) => p.slug === slug || p.id === slug);
      if (found) {
        return adaptStoreProductToLuxury(found);
      }
    }
  } catch {}
  return LUXURY_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}

export async function getProductBySlugAsync(slug: string): Promise<LuxuryProduct | undefined> {
  const local = getProductBySlug(slug);
  if (local) return local;

  try {
    const { supabase } = await import('@/lib/supabaseClient');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .maybeSingle();

    if (data && !error) {
      const mapped: Product = {
        id: data.id,
        slug: data.slug,
        name: data.name,
        sku: data.sku || '',
        tagline: data.tagline || '',
        description: data.description || '',
        price: Number(data.price),
        compareAtPrice: Number(data.compare_at_price ?? 169),
        cost: Number(data.cost ?? 50),
        promotionBadge: data.promotion_badge || 'PROMO',
        featuredImage: data.featured_image || '/images/products/cognac-minimalist.jpg',
        images: Array.isArray(data.images) ? data.images : [],
        stock: Number(data.stock ?? 20),
        lowStockThreshold: Number(data.low_stock_threshold ?? 5),
        category: data.category || 'Portefeuilles',
        tags: Array.isArray(data.tags) ? data.tags : ['100% Cuir Naturel'],
        status: data.status || 'ACTIVE',
        materials: Array.isArray(data.materials) ? data.materials : [],
        dimensions: data.dimensions || '10.8 cm x 8.4 cm',
        handmadeIn: data.handmade_in || 'Atelier ALTAJ — Maroc',
        bundleOffers: Array.isArray(data.bundle_offers) ? data.bundle_offers : [],
        relatedProductSlugs: Array.isArray(data.related_product_slugs) ? data.related_product_slugs : [],
        seoTitle: data.seo_title || '',
        seoDescription: data.seo_description || '',
        rating: Number(data.rating ?? 5.0),
        reviewCount: Number(data.review_count ?? 1),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return adaptStoreProductToLuxury(mapped);
    }
  } catch (err) {
    console.error('Error fetching product from Supabase:', err);
  }

  return undefined;
}

export async function getAllProductsAsync(): Promise<LuxuryProduct[]> {
  try {
    const { supabase } = await import('@/lib/supabaseClient');
    const { data, error } = await supabase.from('products').select('*');
    if (data && !error && data.length > 0) {
      return data.map((row: any) => {
        const mapped: Product = {
          id: row.id,
          slug: row.slug,
          name: row.name,
          sku: row.sku || '',
          tagline: row.tagline || '',
          description: row.description || '',
          price: Number(row.price),
          compareAtPrice: Number(row.compare_at_price ?? 169),
          cost: Number(row.cost ?? 50),
          promotionBadge: row.promotion_badge || 'PROMO',
          featuredImage: row.featured_image || '/images/products/cognac-minimalist.jpg',
          images: Array.isArray(row.images) ? row.images : [],
          stock: Number(row.stock ?? 20),
          lowStockThreshold: Number(row.low_stock_threshold ?? 5),
          category: row.category || 'Portefeuilles',
          tags: Array.isArray(row.tags) ? row.tags : ['100% Cuir Naturel'],
          status: row.status || 'ACTIVE',
          materials: Array.isArray(row.materials) ? row.materials : [],
          dimensions: row.dimensions || '10.8 cm x 8.4 cm',
          handmadeIn: row.handmade_in || 'Atelier ALTAJ — Maroc',
          bundleOffers: Array.isArray(row.bundle_offers) ? row.bundle_offers : [],
          relatedProductSlugs: Array.isArray(row.related_product_slugs) ? row.related_product_slugs : [],
          seoTitle: row.seo_title || '',
          seoDescription: row.seo_description || '',
          rating: Number(row.rating ?? 5.0),
          reviewCount: Number(row.review_count ?? 1),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
        return adaptStoreProductToLuxury(mapped);
      });
    }
  } catch {}

  return getAllProducts();
}

