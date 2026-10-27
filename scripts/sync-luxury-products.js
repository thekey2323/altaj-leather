const fs = require('fs');

const prods = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

const luxuryProducts = [
  {
    id: 'prod-1793122106095',
    slug: 'passeport-holder',
    name: 'Passeport Holder',
    arabicName: 'غلاف جواز السفر — التاج الملكي',
    frenchName: 'Passeport Holder ALTAJ',
    subtitle: 'حماية أنيقة لجواز السفر وبطاقات السفر في جلد طبيعي 100%',
    frenchSubtitle: 'Protection élégante pour passeport et carte d’embarquement en cuir naturel',
    category: 'travel',
    categoryArabic: 'إكسسوارات السفر الفاخرة',
    categoryFrench: 'Accessoires de Voyage',
    price: 119,
    compareAtPrice: 169,
    featuredImage: '/images/products/passport-cover.jpg',
    galleryImages: [
      '/images/products/passport-cover.jpg',
      '/images/products/cognac-minimalist.jpg'
    ],
    color: 'بني هافان ملكي',
    frenchColor: 'Brun Havane',
    colorHex: '#8C522B',
    badge: '✈️ رفيق السفر',
    frenchBadge: '✈️ Compagnon de Voyage',
    stock: 20,
    rating: 4.98,
    reviewCount: 96,
    shortDescription: 'غلاف جواز السفر من الجلد الطبيعي المدبوغ نباتياً، يحمي وثائقك بلمسة مغربية راقية.',
    frenchShortDescription: 'Protège-passeport raffiné en cuir naturel pour préserver vos documents essentiels.',
    fullDescription: 'صُمم خصيصاً للمسافر العصري؛ جلد طبيعي سميك يحمي جواز سفرك، مع جيوب مخصصة لبطاقة الصعود وبطاقاتك البنكية.',
    frenchFullDescription: 'Spécialement pensé pour le voyageur moderne : cuir naturel protecteur, fentes cartes et passeport.',
    dimensions: '14.2 cm x 10.0 cm',
    leatherType: 'جلد طبيعي 100% مدبوغ نباتياً',
    frenchLeatherType: '100% Cuir Naturel Tannage Végétal',
    stitching: 'خياطة يدوية متقنة بالسراجة',
    frenchStitching: 'Couture sellier traditionnelle faite main',
    capacity: [
      'جيب مخصص لجواز السفر المغربي والدولي',
      'جيب لبطاقة الصعود إلى الطائرة',
      'فجوات للبطاقات البنكية وبطاقة الهوية'
    ],
    frenchCapacity: [
      'Emplacement dédié passeport international',
      'Poche pour carte d’embarquement',
      'Fentes pour cartes bancaires'
    ],
    features: [
      '100% جلد طبيعي متين وأصيل',
      'حجم مثالي للجيب الداخلي للسترة أو الحقيبة',
      'خياطة يدوية معززة تدوم لسنوات'
    ],
    frenchFeatures: [
      '100% cuir naturel robuste et noble',
      'Format idéal pour poche de veste',
      'Couture sellier renforcée'
    ],
    boxContents: [
      'غلاف جواز السفر التاج الملكي',
      'تغليف كرافت أنيق',
      'بطاقة ضمان الجلد الطبيعي'
    ],
    frenchBoxContents: [
      'Protège-passeport ALTAJ fait main',
      'Emballage kraft soigné',
      'Certificat de garantie cuir véritable'
    ],
    bundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'عرض قطعة واحدة',
        subtitle: 'قطعة واحدة بتغليف كرافت أنيق',
        price: 119,
        comparePrice: 169,
        savings: 50,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'عرض قطعتين (الأكثر طلباً)',
        subtitle: 'قطعتان من اختيارك — وفر 69 درهم',
        price: 189,
        comparePrice: 238,
        savings: 49,
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
        comparePrice: 357,
        savings: 108,
        badge: 'توصيل مجاني',
        freeShipping: true
      }
    ],
    frenchBundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'Offre 1 Pièce',
        subtitle: 'Une pièce sous emballage kraft soigné',
        price: 119,
        comparePrice: 169,
        savings: 50,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'Offre 2 Pièces (Meilleure Vente)',
        subtitle: 'Deux pièces au choix — Économisez 49 DH',
        price: 189,
        comparePrice: 238,
        savings: 49,
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
        comparePrice: 357,
        savings: 108,
        badge: 'Livraison Gratuite',
        freeShipping: true
      }
    ],
    seoTitle: 'غلاف جواز السفر التاج | جلد طبيعي 100% مغربي',
    seoDescription: 'غلاف جواز السفر من الجلد الطبيعي 100% الفاخر. دفع عند الاستلام وتوصيل بالمغرب.'
  },
  {
    id: 'prod-1',
    slug: 'altaj-classic-marron',
    name: 'ALTAJ CLASSIC — MARRON',
    arabicName: 'محفظة التاج كلاسيك — بني مارون',
    frenchName: 'ALTAJ CLASSIC — MARRON',
    subtitle: 'التحفة الكلاسيكية في جلد طبيعي أصيل باللون البني المارون الدافئ',
    frenchSubtitle: 'Le chef-d’œuvre intemporel en cuir patiné marron chaud',
    category: 'wallets',
    categoryArabic: 'محافظ الجيب الفاخرة',
    categoryFrench: 'Portefeuilles de Poche',
    price: 119,
    compareAtPrice: 169,
    featuredImage: '/images/products/altaj-classic-marron-custom-1.jpg',
    galleryImages: [
      '/images/products/altaj-classic-marron-custom-1.jpg',
      '/images/products/altaj-classic-marron-custom-2.jpg',
      '/images/products/altaj-classic-marron-custom-3.jpg'
    ],
    color: 'بني مارون أصيل',
    frenchColor: 'Marron Cuir Naturel',
    colorHex: '#5C381E',
    badge: '👑 الأكثر طلباً',
    frenchBadge: '👑 Plus Demandé',
    stock: 25,
    rating: 4.97,
    reviewCount: 142,
    shortDescription: 'محفظة كلاسيكية من الجلد الطبيعي تتسع لجميع بطاقاتك والنقود دون أي انتفاخ في الجيب.',
    frenchShortDescription: 'Portefeuille fin en cuir naturel marron, conçu pour cartes et billets sans encombrement.',
    fullDescription: 'صُنعت يدوياً من جلد طبيعي 100% مدبوغ بمستخلصات نباتية، مع خياطة سراجة يدوية متينة بخيط مشمع تدوم لسنوات طويلة.',
    frenchFullDescription: 'Confectionné à la main par nos maîtres artisans maroquiniers, le portefeuille ALTAJ Classic Marron marie raffinement et robustesse.',
    dimensions: '10.8 cm x 8.4 cm',
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
      'محفظة التاج كلاسيك مارون المصنوعة يدوياً',
      'تغليف كرافت أنيق',
      'بطاقة ضمان الأصالة والجلد الطبيعي'
    ],
    frenchBoxContents: [
      'Portefeuille ALTAJ Classic Marron fait main',
      'Emballage kraft soigné',
      'Certificat d’authenticité cuir naturel'
    ],
    bundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'عرض قطعة واحدة',
        subtitle: 'محفظة واحدة بتغليف كرافت أنيق',
        price: 119,
        comparePrice: 169,
        savings: 50,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'عرض قطعتين (الأكثر طلباً)',
        subtitle: 'قطعتان من اختيارك — وفر 69 درهم',
        price: 189,
        comparePrice: 238,
        savings: 49,
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
        comparePrice: 357,
        savings: 108,
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
        price: 119,
        comparePrice: 169,
        savings: 50,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'Offre 2 Pièces (Meilleure Vente)',
        subtitle: 'Deux pièces au choix — Économisez 49 DH',
        price: 189,
        comparePrice: 238,
        savings: 49,
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
        comparePrice: 357,
        savings: 108,
        badge: 'Livraison Gratuite',
        freeShipping: true
      }
    ],
    seoTitle: 'ALTAJ CLASSIC Marron | جلد طبيعي 100% — Altajleather',
    seoDescription: 'محفظة التاج كلاسيك بالجلد الطبيعي 100%. الدفع عند الاستلام والتوصيل بالمغرب.'
  },
  {
    id: 'prod-black-snap',
    slug: 'altaj-noir',
    name: 'ALTAJ NOIR',
    arabicName: 'محفظة التاج رويال — أسود فاخر',
    frenchName: 'ALTAJ NOIR',
    subtitle: 'جلد طبيعي أسود أنيق مع خياطة متينة وشعار التاج المنقوش',
    frenchSubtitle: 'Cuir naturel noir profond, finition artisanale et sceau royal gravé',
    category: 'wallets',
    categoryArabic: 'محافظ الجيب الفاخرة',
    categoryFrench: 'Portefeuilles de Poche',
    price: 119,
    compareAtPrice: 169,
    featuredImage: '/images/products/altaj-noir-front.jpg',
    galleryImages: [
      '/images/products/altaj-noir-front.jpg',
      '/images/products/altaj-noir-open.jpg'
    ],
    color: 'أسود ملكي فاخر',
    frenchColor: 'Noir Royal',
    colorHex: '#1A1A1A',
    badge: '✨ أناقة كلاسيكية',
    frenchBadge: '✨ Élégance Noire',
    stock: 18,
    rating: 4.95,
    reviewCount: 78,
    shortDescription: 'محفظة سوداء أنيقة من الجلد الطبيعي تتسع لجميع البطاقات والنقود دون أي انتفاخ.',
    frenchShortDescription: 'Portefeuille noir élégant en cuir véritable pleine fleur.',
    fullDescription: 'صُنعت يدوياً من جلد طبيعي 100% مدبوغ بمستخلصات نباتية، مع خياطة سراجة يدوية متينة بالخيط المشمع.',
    frenchFullDescription: 'Fait main en cuir véritable pleine fleur noir avec couture sellier artisanale.',
    dimensions: '10.8 cm x 8.4 cm',
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
      '100% cuir véritable développant une noble patine',
      'Couture sellier main inaltérable',
      'Ultra fin et discret en poche'
    ],
    boxContents: [
      'محفظة التاج رويال أسود المصنوعة يدوياً',
      'تغليف كرافت أنيق',
      'بطاقة ضمان الأصالة والجلد الطبيعي'
    ],
    frenchBoxContents: [
      'Portefeuille ALTAJ Noir fait main',
      'Emballage kraft soigné',
      'Certificat d’authenticité cuir naturel'
    ],
    bundleOffers: [
      {
        id: 'bundle-1',
        quantity: 1,
        title: 'عرض قطعة واحدة',
        subtitle: 'محفظة واحدة بتغليف كرافت أنيق',
        price: 119,
        comparePrice: 169,
        savings: 50,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'عرض قطعتين (الأكثر طلباً)',
        subtitle: 'قطعتان من اختيارك — وفر 69 درهم',
        price: 189,
        comparePrice: 238,
        savings: 49,
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
        comparePrice: 357,
        savings: 108,
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
        price: 119,
        comparePrice: 169,
        savings: 50,
        freeShipping: false
      },
      {
        id: 'bundle-2',
        quantity: 2,
        title: 'Offre 2 Pièces (Meilleure Vente)',
        subtitle: 'Deux pièces au choix — Économisez 49 DH',
        price: 189,
        comparePrice: 238,
        savings: 49,
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
        comparePrice: 357,
        savings: 108,
        badge: 'Livraison Gratuite',
        freeShipping: true
      }
    ],
    seoTitle: 'ALTAJ NOIR | جلد طبيعي 100% أسود فاخر',
    seoDescription: 'محفظة التاج رويال بالجلد الطبيعي 100% أسود فاخر. الدفع عند الاستلام والتوصيل بالمغرب.'
  }
];

let altajContent = fs.readFileSync('data/altajProducts.ts', 'utf8');
const startTag = 'export const LUXURY_PRODUCTS: LuxuryProduct[] = [';
const startIndex = altajContent.indexOf(startTag);
const endTag = 'export function adaptStoreProductToLuxury';
const endIndex = altajContent.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const newDeclaration = `export const LUXURY_PRODUCTS: LuxuryProduct[] = ${JSON.stringify(luxuryProducts, null, 2)};\n\n`;
  const updated = altajContent.substring(0, startIndex) + newDeclaration + altajContent.substring(endIndex);
  fs.writeFileSync('data/altajProducts.ts', updated, 'utf8');
  console.log('Successfully updated LUXURY_PRODUCTS in data/altajProducts.ts!');
} else {
  console.error('Indices not found', startIndex, endIndex);
}
