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
    id: 'prod-cognac-royal',
    slug: 'cognac-royal',
    name: 'ALTAJ Royal Cognac',
    arabicName: 'محفظة التاج الملكية — كونياك',
    frenchName: 'Portefeuille Royal Cognac',
    subtitle: 'تصميم عمودي نحيف بخياطة يدوية وشعار التاج المنقوش',
    frenchSubtitle: 'Design vertical fin, couture sellier main et sceau royal gravé',
    category: 'wallets',
    categoryArabic: 'محافظ الجيب الفاخرة',
    categoryFrench: 'Portefeuilles de Poche',
    price: 129,
    compareAtPrice: 189,
    featuredImage: '/images/products/cognac-minimalist.jpg',
    galleryImages: [
      '/images/products/cognac-minimalist.jpg'
    ],
    color: 'بني كونياك دافئ',
    frenchColor: 'Brun Cognac Chaud',
    colorHex: '#8C522B',
    badge: '👑 الأكثر طلباً',
    frenchBadge: '👑 Plus Demandé',
    stock: 19,
    rating: 4.96,
    reviewCount: 128,
    shortDescription: 'محفظة نحيفة من الجلد الطبيعي تتسع لجميع بطاقاتك والنقود دون أي انتفاخ في الجيب.',
    frenchShortDescription: 'Portefeuille fin en cuir naturel, conçu pour vos cartes et billets sans encombrement.',
    fullDescription: 'صُنعت يدوياً من جلد طبيعي 100% مدبوغ بمستخلصات نباتية، مع خياطة سراجة يدوية متينة بخيط مشمع.',
    frenchFullDescription: 'Fait main en cuir 100% naturel tanné végétalement, avec couture sellier robuste au fil ciré.',
    dimensions: '10.5 سم × 8.2 سم × 1.0 سم',
    leatherType: 'جلد طبيعي 100% مدبوغ نباتياً',
    frenchLeatherType: '100% Cuir Naturel Tannage Végétal',
    stitching: 'خياطة يدوية متقنة بالسراجة',
    frenchStitching: 'Couture sellier traditionnelle faite main',
    capacity: [
      'تتسع لـ 6 إلى 8 بطاقات بنكية وشخصية',
      'جيب خارجي سريع السحب للبطاقة اليومية',
      'جيب داخلي للنقود الورقية المغربية'
    ],
    frenchCapacity: [
      'Capacité de 6 à 8 cartes bancaires et d’identité',
      'Poche extérieure à accès rapide',
      'Compartiment intérieur pour billets de banque'
    ],
    features: [
      '100% جلد طبيعي أصلي يكتسب بريقاً مع الاستخدام',
      'خياطة يدوية متينة لا تنقطع',
      'نحيفة ومريحة تماماً في الجيب'
    ],
    frenchFeatures: [
      '100% cuir naturel véritable développant une noble patine',
      'Couture sellier main inaltérable',
      'Ultra fin et discret en poche'
    ],
    boxContents: [
      'محفظة التاج الملكية المصنوعة يدوياً',
      'تغليف كرافت أنيق',
      'بطاقة ضمان الأصالة والجلد الطبيعي'
    ],
    frenchBoxContents: [
      'Portefeuille Royal ALTAJ fait main',
      'Emballage kraft soigné',
      'Certificat d’authenticité cuir naturel'
    ],
    bundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'عرض قطعة واحدة',
        subtitle: 'محفظة واحدة بتغليف كرافت أنيق',
        price: 129,
        comparePrice: 189,
        savings: 60,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'عرض قطعتين (الأكثر طلباً)',
        subtitle: 'قطعتان من اختيارك — وفر 69 درهم',
        price: 189,
        comparePrice: 378,
        savings: 189,
        badge: '🔥 الأكثر طلباً — توصيل مجاني',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'عرض 3 قطع',
        subtitle: '3 قطع من اختيارك — توصيل مجاني',
        price: 249,
        comparePrice: 567,
        savings: 318,
        badge: 'توصيل مجاني',
        freeShipping: true
      }
    ],
    frenchBundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'Offre 1 Pièce',
        subtitle: 'Un portefeuille sous emballage kraft soigné',
        price: 129,
        comparePrice: 189,
        savings: 60,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'Offre 2 Pièces (Meilleure Vente)',
        subtitle: 'Deux pièces au choix — Économisez 69 DH',
        price: 189,
        comparePrice: 378,
        savings: 189,
        badge: '🔥 Meilleure Vente — Livraison Gratuite',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'Offre 3 Pièces',
        subtitle: 'Trois pièces au choix — Livraison Gratuite',
        price: 249,
        comparePrice: 567,
        savings: 318,
        badge: 'Livraison Gratuite',
        freeShipping: true
      }
    ],
    seoTitle: 'محفظة التاج الملكية | جلد طبيعي 100% — Altajleather',
    seoDescription: 'محفظة مصنوعة يدوياً من الجلد الطبيعي 100%. نحيفة وعملية، توصيل لكافة مدن المغرب والدفع عند الاستلام.'
  },
  {
    id: 'prod-passport-cover',
    slug: 'passport-cover',
    name: 'ALTAJ Passport Cover',
    arabicName: 'غلاف جواز السفر — هافانا',
    frenchName: 'Protège-Passeport Havana',
    subtitle: 'حماية أنيقة لجواز السفر وتذكرة الطيران بجلد طبيعي فاخر',
    frenchSubtitle: 'Protection élégante pour passeport et carte d’embarquement en cuir naturel',
    category: 'travel',
    categoryArabic: 'إكسسوارات السفر',
    categoryFrench: 'Accessoires de Voyage',
    price: 129,
    compareAtPrice: 189,
    featuredImage: '/images/products/passport-cover.jpg',
    galleryImages: [
      '/images/products/passport-cover.jpg'
    ],
    color: 'بني هافانا دافئ',
    frenchColor: 'Brun Havane',
    colorHex: '#6E4326',
    badge: '🇲🇦 رفيق السفر',
    frenchBadge: '🇲🇦 Compagnon Voyage',
    stock: 14,
    rating: 4.98,
    reviewCount: 94,
    shortDescription: 'يحمي جواز سفرك وتذاكر الطيران وبطاقاتك في غلاف جلد طبيعي أنيق ومتين.',
    frenchShortDescription: 'Protège votre passeport, billets et cartes dans un étui en cuir naturel robuste et raffiné.',
    fullDescription: 'مصنوع يدوياً من قطعة واحدة من الجلد الطبيعي لحماية صفحات الجواز من الطي والرطوبة.',
    frenchFullDescription: 'Fabriqué à la main d’une seule pièce de cuir naturel pour préserver votre passeport avec style.',
    dimensions: '14.2 سم × 10.0 سم (مغلق)',
    leatherType: 'جلد طبيعي متين مقاوم للاحتكاك',
    frenchLeatherType: 'Cuir naturel résistant et durable',
    stitching: 'خياطة يدوية مع تعزيز الزوايا',
    frenchStitching: 'Couture sellier avec coins renforcés',
    capacity: [
      'جيب مخصص لجواز السفر المغربي أو الدولي',
      'جيب مائل لتذكرة الطيران وبطاقة الصعود',
      'فتحتان للبطاقات البنكية الدولية'
    ],
    frenchCapacity: [
      'Emplacement dédié au passeport',
      'Fente inclinée pour carte d’embarquement',
      'Deux fentes pour cartes bancaires'
    ],
    features: [
      'حماية ممتازة لسنوات من السفر',
      'جلد طبيعي عالي المتانة',
      'تصميم مريح وخفيف في اليد'
    ],
    frenchFeatures: [
      'Protection optimale pour vos voyages',
      'Cuir naturel résistant',
      'Format pratique et élégant'
    ],
    boxContents: [
      'غلاف جواز السفر المصنوع يدوياً',
      'تغليف كرافت أنيق',
      'بطاقة ضمان الجلد الطبيعي'
    ],
    frenchBoxContents: [
      'Protège-passeport fait main',
      'Emballage kraft soigné',
      'Garantie cuir naturel'
    ],
    bundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'عرض قطعة واحدة',
        subtitle: 'غلاف جواز سفر واحد بتغليف كرافت',
        price: 129,
        comparePrice: 189,
        savings: 60,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'عرض قطعتين (الأكثر طلباً)',
        subtitle: 'غلافان أو غلاف مع محفظة — وفر 69 درهم',
        price: 189,
        comparePrice: 378,
        savings: 189,
        badge: '🔥 الأكثر طلباً — شحن مجاني',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'عرض 3 قطع',
        subtitle: '3 قطع للسفر والعائلة — شحن مجاني',
        price: 249,
        comparePrice: 567,
        savings: 318,
        badge: 'توصيل مجاني',
        freeShipping: true
      }
    ],
    frenchBundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'Offre 1 Pièce',
        subtitle: 'Un protège-passeport sous emballage kraft',
        price: 129,
        comparePrice: 189,
        savings: 60,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'Offre 2 Pièces (Meilleure Vente)',
        subtitle: 'Deux pièces au choix — Économisez 69 DH',
        price: 189,
        comparePrice: 378,
        savings: 189,
        badge: '🔥 Meilleure Vente — Livraison Gratuite',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'Offre 3 Pièces',
        subtitle: 'Trois pièces au choix — Livraison Gratuite',
        price: 249,
        comparePrice: 567,
        savings: 318,
        badge: 'Livraison Gratuite',
        freeShipping: true
      }
    ],
    seoTitle: 'غلاف جواز السفر من الجلد الطبيعي | Altajleather',
    seoDescription: 'غلاف جواز سفر من الجلد الطبيعي 100%. توصيل مجاني بالمغرب والدفع عند الاستلام بعد المعاينة.'
  },
  {
    id: 'prod-moroccan-bifold',
    slug: 'moroccan-bifold',
    name: 'ALTAJ Classic Bifold',
    arabicName: 'المحفظة الكلاسيكية ثنائية الطي',
    frenchName: 'Portefeuille Bifold Classique',
    subtitle: 'سعة واسعة للنقود المغربية (200 درهم ممدودة) والبطاقات',
    frenchSubtitle: 'Grande capacité pour billets marocains et cartes bancaires',
    category: 'wallets',
    categoryArabic: 'محافظ الجيب الكلاسيكية',
    categoryFrench: 'Portefeuilles Classiques',
    price: 129,
    compareAtPrice: 189,
    featuredImage: '/images/products/bifold-morocco.jpg',
    galleryImages: [
      '/images/products/bifold-morocco.jpg',
      '/images/products/altaj-classic-brown-open.jpg',
      '/images/products/altaj-classic-brown-interior.jpg',
      '/images/products/altaj-classic-brown-front.jpg'
    ],
    color: 'كستنائي كلاسيكي عتيق',
    frenchColor: 'Châtaigne Vintage',
    colorHex: '#5C361E',
    badge: '⭐ سعة واسعة',
    frenchBadge: '⭐ Grande Capacité',
    stock: 25,
    rating: 4.95,
    reviewCount: 164,
    shortDescription: 'تتسع لأوراق 200 درهم ممدودة دون طي، مع 6 فتحات مخصصة لبطاقاتك وجيوب سرية.',
    frenchShortDescription: 'Conçu pour accueillir les billets de banque à plat, avec 6 fentes pour cartes et poches secrètes.',
    fullDescription: 'تصميم تقليدي أصيل بأبعاد ملليمترية مدروسة للنقود والبطاقات البنكية، من الجلد الطبيعي المرن.',
    frenchFullDescription: 'Design traditionnel taillé avec précision pour la monnaie marocaine et les cartes, en cuir naturel souple.',
    dimensions: '11.0 سم × 8.8 سم × 1.2 سم',
    leatherType: 'جلد طبيعي أصلي ناعم الملمس',
    frenchLeatherType: 'Cuir naturel souple et authentique',
    stitching: 'سراجة يدوية متقنة بخيط متين',
    frenchStitching: 'Couture sellier traditionnelle robuste',
    capacity: [
      'جيب نقدي يتسع لأوراق 200 درهم ممدودة',
      '6 فتحات رئيسية لبطاقات الأبناك وبطاقة التعريف',
      'جيبان داخليان إضافيان'
    ],
    frenchCapacity: [
      'Compartiment pour billets à plat',
      '6 fentes pour cartes bancaires et CIN',
      'Deux poches intérieures discrètes'
    ],
    features: [
      'النقود تدخل ممدودة دون الحاجة لطيها',
      'جلد طبيعي مرن يلائم الجيب مع الوقت',
      'خياطة متينة ومقاومة للاهتراء'
    ],
    frenchFeatures: [
      'Les billets entrent à plat sans être pliés',
      'Cuir naturel souple s’adaptant à votre poche',
      'Coutures renforcées inusables'
    ],
    boxContents: [
      'المحفظة الكلاسيكية ثنائية الطي',
      'تغليف كرافت أنيق',
      'شهادة الضمان للجلد الطبيعي'
    ],
    frenchBoxContents: [
      'Portefeuille Bifold fait main',
      'Emballage kraft soigné',
      'Certificat de garantie cuir naturel'
    ],
    bundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'عرض قطعة واحدة',
        subtitle: 'المحفظة الكلاسيكية بتغليف كرافت',
        price: 129,
        comparePrice: 189,
        savings: 60,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'عرض قطعتين (الأكثر طلباً)',
        subtitle: 'قطعتان من اختيارك — وفر 69 درهم',
        price: 189,
        comparePrice: 378,
        savings: 189,
        badge: '🔥 الأكثر طلباً — شحن مجاني',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'عرض 3 قطع',
        subtitle: '3 قطع من اختيارك — شحن مجاني',
        price: 249,
        comparePrice: 567,
        savings: 318,
        badge: 'توصيل مجاني',
        freeShipping: true
      }
    ],
    frenchBundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'Offre 1 Pièce',
        subtitle: 'Portefeuille classique sous emballage kraft',
        price: 129,
        comparePrice: 189,
        savings: 60,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'Offre 2 Pièces (Meilleure Vente)',
        subtitle: 'Deux pièces au choix — Économisez 69 DH',
        price: 189,
        comparePrice: 378,
        savings: 189,
        badge: '🔥 Meilleure Vente — Livraison Gratuite',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'Offre 3 Pièces',
        subtitle: 'Trois pièces au choix — Livraison Gratuite',
        price: 249,
        comparePrice: 567,
        savings: 318,
        badge: 'Livraison Gratuite',
        freeShipping: true
      }
    ],
    seoTitle: 'المحفظة الكلاسيكية ثنائية الطي بجلد طبيعي | Altajleather',
    seoDescription: 'محفظة كلاسيكية من الجلد الطبيعي 100%. سعة لأوراق 200 درهم، الدفع عند الاستلام والتوصيل مجاني.'
  },
  {
    id: 'prod-black-snap',
    slug: 'black-snap',
    name: 'ALTAJ Snap Cardholder',
    arabicName: 'حافظة البطاقات بالزر — أسود',
    frenchName: 'Porte-Cartes à Bouton Snap',
    subtitle: 'جلد طبيعي أسود مع تطريز أحمر يدوي وزر ضاغط آمن',
    frenchSubtitle: 'Cuir naturel noir, surpiqûre rouge main et bouton pression sécurisé',
    category: 'cardholders',
    categoryArabic: 'حاملات البطاقات',
    categoryFrench: 'Porte-Cartes',
    price: 129,
    compareAtPrice: 189,
    featuredImage: '/images/products/black-snap-wallet.jpg',
    galleryImages: [
      '/images/products/black-snap-wallet.jpg',
      '/images/products/altaj-noir-front.jpg',
      '/images/products/altaj-noir-open.jpg'
    ],
    color: 'أسود مع تطريز أحمر',
    frenchColor: 'Noir & Surpiqûre Rouge',
    colorHex: '#1C1B1A',
    badge: '💎 أمان مدمج',
    frenchBadge: '💎 Sécurité Snap',
    stock: 21,
    rating: 4.93,
    reviewCount: 88,
    shortDescription: 'إغلاق محكم بزر ضاغط مع تطريز أحمر يدوي. حجم مدمج مثالي للجيب الأمامي.',
    frenchShortDescription: 'Fermeture par bouton pression avec broderie rouge main. Format compact idéal en poche avant.',
    fullDescription: 'صُممت من جلد طبيعي أسود متين، مع قفل زر ضاغط معدني يضمن ثبات البطاقات والنقود.',
    frenchFullDescription: 'Fabriqué en cuir naturel noir résistant, avec bouton pression métallique assurant un maintien parfait.',
    dimensions: '10.2 سم × 7.5 سم × 0.9 سم',
    leatherType: 'جلد طبيعي أسود مقاوم للاحتكاك',
    frenchLeatherType: 'Cuir naturel noir haute résistance',
    stitching: 'تطريز يدوي متقاطع بخيط أحمر',
    frenchStitching: 'Point de croix fait main au fil rouge',
    capacity: [
      'تتسع لـ 8 إلى 10 بطاقات بنكية وشخصية',
      'جيب مدمج للنقود الورقية المطوية'
    ],
    frenchCapacity: [
      'Capacité de 8 à 10 cartes bancaires et pièces d’identité',
      'Compartiment pour billets pliés'
    ],
    features: [
      'إغلاق آمن بزر ضاغط معدني',
      'تطريز يدوي أحمر متميز',
      'حجم صغير ومريح جداً'
    ],
    frenchFeatures: [
      'Fermeture sécurisée par bouton pression',
      'Détail brodé main rouge contrasté',
      'Format ultra compact et ergonomique'
    ],
    boxContents: [
      'حافظة البطاقات بالزر المعدني',
      'تغليف كرافت أنيق',
      'بطاقة ضمان الجلد الطبيعي'
    ],
    frenchBoxContents: [
      'Porte-cartes fait main',
      'Emballage kraft soigné',
      'Garantie cuir naturel'
    ],
    bundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'عرض قطعة واحدة',
        subtitle: 'حافظة بطاقات بتغليف كرافت',
        price: 129,
        comparePrice: 189,
        savings: 60,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'عرض قطعتين (الأكثر طلباً)',
        subtitle: 'قطعتان من اختيارك — وفر 69 درهم',
        price: 189,
        comparePrice: 378,
        savings: 189,
        badge: '🔥 الأكثر طلباً — شحن مجاني',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'عرض 3 قطع',
        subtitle: '3 قطع من اختيارك — شحن مجاني',
        price: 249,
        comparePrice: 567,
        savings: 318,
        badge: 'توصيل مجاني',
        freeShipping: true
      }
    ],
    frenchBundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'Offre 1 Pièce',
        subtitle: 'Porte-cartes sous emballage kraft',
        price: 129,
        comparePrice: 189,
        savings: 60,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'Offre 2 Pièces (Meilleure Vente)',
        subtitle: 'Deux pièces au choix — Économisez 69 DH',
        price: 189,
        comparePrice: 378,
        savings: 189,
        badge: '🔥 Meilleure Vente — Livraison Gratuite',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'Offre 3 Pièces',
        subtitle: 'Trois pièces au choix — Livraison Gratuite',
        price: 249,
        comparePrice: 567,
        savings: 318,
        badge: 'Livraison Gratuite',
        freeShipping: true
      }
    ],
    seoTitle: 'حافظة البطاقات بالزر من الجلد الطبيعي | Altajleather',
    seoDescription: 'حافظة بطاقات من الجلد الطبيعي 100% بزر ضاغط. توصيل لجميع مدن المغرب والدفع عند الاستلام.'
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
    bundleOffers: luxuryBase?.bundleOffers || [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'عرض قطعة واحدة',
        subtitle: 'محفظة واحدة بتغليف كرافت أنيق',
        price: unitPrice,
        comparePrice: comparePrice,
        savings: comparePrice - unitPrice,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'عرض قطعتين (الأكثر طلباً)',
        subtitle: 'قطعتان من اختيارك — وفر 69 درهم',
        price: 189,
        comparePrice: unitPrice * 2,
        savings: Math.max(49, unitPrice * 2 - 189),
        badge: '🔥 الأكثر طلباً — توصيل مجاني',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'عرض 3 قطع',
        subtitle: '3 قطع من اختيارك — توصيل مجاني',
        price: 249,
        comparePrice: unitPrice * 3,
        savings: Math.max(90, unitPrice * 3 - 249),
        badge: 'توصيل مجاني',
        freeShipping: true
      }
    ],
    frenchBundleOffers: luxuryBase?.frenchBundleOffers || [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'Offre 1 Pièce',
        subtitle: 'Un portefeuille sous emballage kraft soigné',
        price: unitPrice,
        comparePrice: comparePrice,
        savings: comparePrice - unitPrice,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'Offre 2 Pièces (Meilleure Vente)',
        subtitle: 'Deux pièces au choix — Économisez 69 DH',
        price: 189,
        comparePrice: unitPrice * 2,
        savings: Math.max(49, unitPrice * 2 - 189),
        badge: '🔥 Meilleure Vente — Livraison Gratuite',
        isPopular: true,
        freeShipping: true
      },
      {
        id: 'bundle-3',
        quantity: 3,
        title: 'Offre 3 Pièces',
        subtitle: 'Trois pièces au choix — Livraison Gratuite',
        price: 249,
        comparePrice: unitPrice * 3,
        savings: Math.max(90, unitPrice * 3 - 249),
        badge: 'Livraison Gratuite',
        freeShipping: true
      }
    ],
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

