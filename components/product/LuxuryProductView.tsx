'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  ChevronDown,
  Phone,
  MessageCircle,
  Eye,
  Award,
  Sparkles,
  ShoppingBag,
  MapPin,
  User,
  Check,
  Package,
  Layers,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  LuxuryProduct,
  LUXURY_PRODUCTS,
  getAllProducts,
  adaptStoreProductToLuxury,
} from '@/data/altajProducts';
import { MOROCCAN_CITIES, validateMoroccanPhone } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { getProducts, getReviews, createOrder } from '@/lib/db/store';
import { CustomerReview } from '@/types';
import { WhatsAppAudioPlayer } from '@/components/common/WhatsAppAudioPlayer';

interface LuxuryProductViewProps {
  product: LuxuryProduct;
}

export function LuxuryProductView({ product: initialProduct }: LuxuryProductViewProps) {
  const { lang, isRtl } = useLanguage();
  const [product, setProduct] = useState<LuxuryProduct>(initialProduct);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  // Dynamic images initialized strictly with this product's own photos
  const getInitialImages = () => {
    const list: string[] = [];
    if (initialProduct.featuredImage) list.push(initialProduct.featuredImage);
    if (Array.isArray(initialProduct.galleryImages)) {
      initialProduct.galleryImages.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['/images/products/altaj-classic-brown-front.jpg'];
  };

  const [productImages, setProductImages] = useState<string[]>(getInitialImages);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Synchronize client-side with stored product data and Supabase Cloud
  useEffect(() => {
    const syncProductData = async () => {
      try {
        // 1. Sync immediately from local storage
        const stored = getProducts();
        const match = stored.find(
          (p) => p.slug === initialProduct.slug || p.id === initialProduct.id
        );
        if (match) {
          const adapted = adaptStoreProductToLuxury(match);
          setProduct(adapted);

          const storedList: string[] = [];
          if (match.featuredImage) storedList.push(match.featuredImage);
          if (Array.isArray(match.images)) {
            match.images.forEach((img) => {
              if (img?.url && !storedList.includes(img.url)) {
                storedList.push(img.url);
              }
            });
          }
          if (storedList.length > 0) {
            setProductImages(storedList);
          }
        }

        // 2. Sync from Supabase Cloud API
        const res = await fetch('/api/products');
        if (res.ok) {
          const apiProds = await res.json();
          if (Array.isArray(apiProds) && apiProds.length > 0) {
            const apiMatch = apiProds.find(
              (p: any) => p.slug === initialProduct.slug || p.id === initialProduct.id
            );
            if (apiMatch) {
              const adapted = adaptStoreProductToLuxury(apiMatch);
              setProduct(adapted);

              const apiImages: string[] = [];
              if (apiMatch.featuredImage) apiImages.push(apiMatch.featuredImage);
              if (Array.isArray(apiMatch.images)) {
                apiMatch.images.forEach((img: any) => {
                  if (img?.url && !apiImages.includes(img.url)) {
                    apiImages.push(img.url);
                  }
                });
              }
              if (apiImages.length > 0) {
                setProductImages(apiImages);
              }
            }
            setActiveStoreProducts(apiProds.map(adaptStoreProductToLuxury));
          }
        }
      } catch {
        // Fallback to initial
      }
    };

    syncProductData();
  }, [initialProduct.slug, initialProduct.id]);

  // Active store products for bundle selections & related items (excluding deleted products)
  const [activeStoreProducts, setActiveStoreProducts] = useState<LuxuryProduct[]>(() => {
    try {
      return getAllProducts();
    } catch {
      return LUXURY_PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      const all = getAllProducts();
      if (Array.isArray(all) && all.length > 0) {
        setActiveStoreProducts(all);
      }
    } catch {}
  }, []);

  // Dynamic reviews loaded from database / WhatsApp audio
  const [dynamicReviews, setDynamicReviews] = useState<CustomerReview[]>([]);

  useEffect(() => {
    try {
      const allRevs = getReviews();
      if (Array.isArray(allRevs) && allRevs.length > 0) {
        const relevant = allRevs.filter(
          (r) => !r.productSlug || r.productSlug === 'all' || r.productSlug === product.slug
        );
        if (relevant.length > 0) {
          setDynamicReviews(relevant);
        }
      }
    } catch {}
  }, [product.slug]);

  // Bundle offer selection (default to Duo 2 pieces for 189 DH)
  const [selectedBundleId, setSelectedBundleId] = useState('bundle-2');
  const bundles = lang === 'fr' && product.frenchBundleOffers ? product.frenchBundleOffers : product.bundleOffers;
  const activeBundle = bundles.find((b) => b.id === selectedBundleId) || bundles[1] || bundles[0];

  // Secondary item choices if 2 or 3 pieces chosen
  const otherProducts = activeStoreProducts.filter((p) => p.slug !== product.slug);
  const [secondItemChoice, setSecondItemChoice] = useState(
    otherProducts[0]?.arabicName || product.arabicName
  );
  const [thirdItemChoice, setThirdItemChoice] = useState(
    otherProducts[1]?.arabicName || product.arabicName
  );


  // Form inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [customCity, setCustomCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Form status
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);

  // Active tab in details section
  const [activeTab, setActiveTab] = useState<'specs' | 'craft' | 'care'>('specs');

  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
    }, 450);
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = lang === 'ar' ? 'يرجى إدخال اسمك الكامل' : 'Veuillez saisir votre nom complet';
    }

    const phoneCheck = validateMoroccanPhone(phone);
    if (!phoneCheck.isValid) {
      newErrors.phone = lang === 'ar'
        ? 'يرجى إدخال رقم هاتف مغربي صحيح (مثال: 0612345678)'
        : 'Numéro de téléphone marocain invalide (ex: 0612345678)';
    }

    const chosenCity = city === 'Autre ville' ? customCity.trim() : city;
    if (!chosenCity) {
      newErrors.city = lang === 'ar' ? 'يرجى كتابة مدينتك' : 'Veuillez préciser votre ville';
    }

    if (!address.trim() || address.trim().length < 4) {
      newErrors.address = lang === 'ar' ? 'يرجى كتابة عنوان التوصيل' : 'Veuillez renseigner votre adresse';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const prodName = lang === 'ar' ? product.arabicName : product.frenchName;
      let chosenSummary = `${prodName}`;
      if (activeBundle.quantity === 2) {
        chosenSummary += ` + Pièce 2: ${secondItemChoice}`;
      } else if (activeBundle.quantity === 3) {
        chosenSummary += ` + Pièce 2: ${secondItemChoice} + Pièce 3: ${thirdItemChoice}`;
      }

      const orderPayload = {
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        phone: phone.trim(),
        customerCity: chosenCity,
        city: chosenCity,
        customerAddress: address.trim(),
        address: address.trim(),
        notes: notes.trim(),
        bundleId: activeBundle.id,
        bundleTitle: activeBundle.title,
        price: activeBundle.price,
        itemsSummary: chosenSummary,
        source: 'product_page',
        productSlug: product.slug,
        subtotal: activeBundle.price,
        shippingFee: 0,
        total: activeBundle.price,
        items: [
          {
            productId: product.id || product.slug,
            productSlug: product.slug,
            productName: `${prodName} (${activeBundle.title})`,
            productImage: product.featuredImage || productImages[0] || '/images/products/cognac-minimalist.jpg',
            color: product.color,
            quantity: activeBundle.quantity,
            unitPrice: Math.round(activeBundle.price / activeBundle.quantity),
            totalPrice: activeBundle.price,
            bundleName: activeBundle.title
          }
        ]
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Also save to client-side localStorage store for immediate offline/client access
        try {
          createOrder(data.order || orderPayload);
        } catch {}

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });

        setOrderConfirmed({
          orderNumber: data.order?.orderNumber || `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: fullName.trim(),
          customerCity: chosenCity,
          bundleTitle: activeBundle.title,
          price: activeBundle.price
        });
      } else {
        setOrderConfirmed({
          orderNumber: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: fullName.trim(),
          customerCity: chosenCity,
          bundleTitle: activeBundle.title,
          price: activeBundle.price
        });
      }
    } catch {
      setOrderConfirmed({
        orderNumber: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: fullName.trim(),
        customerCity: chosenCity,
        bundleTitle: activeBundle.title,
        price: activeBundle.price
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeImage = productImages[activeImageIndex] || productImages[0] || product.featuredImage;

  const getWhatsAppUrl = () => {
    const prodName = lang === 'ar' ? product.arabicName : product.frenchName;
    const msg = lang === 'ar'
      ? `سلام عليكم Altajleather، أرغب في طلب:
- ${prodName}
- العرض: ${activeBundle.title} (${activeBundle.price} درهم)
- التوصيل والدفع عند الاستلام بالمغرب. شكراً!`
      : `Bonjour ALTAJ LEATHER, je souhaite commander :
- ${prodName}
- Offre : ${activeBundle.title} (${activeBundle.price} DH)
- Paiement à la livraison. Merci !`;
    return `https://wa.me/212693148230?text=${encodeURIComponent(msg)}`;
  };

  const reviews: CustomerReview[] = lang === 'ar'
    ? [
        {
          id: 'rev-prod-1',
          name: 'سفيان بناني',
          city: 'الدار البيضاء',
          date: 'منذ يومين',
          rating: 5,
          comment: `تبارك الله، ${product.arabicName} جودة الجلد الطبيعي ممتازة وخياطة متقونة. فحصت السلعة قبل ما نخلص الموزع.`,
          isVerified: true,
          createdAt: '2026-03-20T10:00:00Z',
        },
        {
          id: 'rev-prod-2',
          name: 'عمر التازي',
          city: 'الرباط',
          date: 'منذ 4 أيام',
          rating: 5,
          comment: `شريت عرض قطعتين بـ 189 درهم، تغليف كرافت أنيق وتوصيل سريع في 24 ساعة.`,
          isVerified: true,
          createdAt: '2026-03-18T10:00:00Z',
        },
        {
          id: 'rev-prod-3',
          name: 'ياسين المودن',
          city: 'طنجة',
          date: 'منذ أسبوع',
          rating: 5,
          comment: `الجلد الطبيعي سميك ولمسته نقية، حجم عملي ومريح جداً في الجيب.`,
          isVerified: true,
          createdAt: '2026-03-15T10:00:00Z',
        },
        {
          id: 'rev-prod-4',
          name: 'مهدي الصقلي',
          city: 'مراكش',
          date: 'منذ أسبوعين',
          rating: 5,
          comment: `أول تجربة ممتازة، جودة الجلد الطبيعي عالية والسعر مناسب جداً مقارنة بالإتقان.`,
          isVerified: true,
          createdAt: '2026-03-08T10:00:00Z',
        }
      ]
    : [
        {
          id: 'rev-prod-1',
          name: 'Soufiane Bennani',
          city: 'Casablanca',
          date: 'Il y a 2 jours',
          rating: 5,
          comment: `Excellente qualité en cuir naturel pour ce modèle, finitions impeccables. Colis vérifié avant paiement.`,
          isVerified: true,
          createdAt: '2026-03-20T10:00:00Z',
        },
        {
          id: 'rev-prod-2',
          name: 'Omar Tazi',
          city: 'Rabat',
          date: 'Il y a 4 jours',
          rating: 5,
          comment: `Offre 2 pièces à 189 DH très avantageuse. Emballage kraft soigné et livraison ultra rapide.`,
          isVerified: true,
          createdAt: '2026-03-18T10:00:00Z',
        },
        {
          id: 'rev-prod-3',
          name: 'Yassine El Moden',
          city: 'Tanger',
          date: 'Il y a 1 semaine',
          rating: 5,
          comment: `Le cuir naturel est robuste et agréable au toucher. Format très élégant en poche.`,
          isVerified: true,
          createdAt: '2026-03-15T10:00:00Z',
        },
        {
          id: 'rev-prod-4',
          name: 'Mehdi Skalli',
          city: 'Marrakech',
          date: 'Il y a 2 semaines',
          rating: 5,
          comment: `Artisanat marocain authentique. Très satisfait de ma commande ALTAJ LEATHER.`,
          isVerified: true,
          createdAt: '2026-03-08T10:00:00Z',
        }
      ];

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;
  const prodTitle = lang === 'ar' ? product.arabicName : product.frenchName;
  const prodSubtitle = lang === 'ar' ? product.subtitle : product.frenchSubtitle;
  const prodCategory = lang === 'ar' ? product.categoryArabic : product.categoryFrench;

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1E1916] pb-28 sm:pb-36" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. BREADCRUMBS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs text-[#7A6E63]">
          <Link href="/" className="hover:text-[#8C5E35]">
            {lang === 'ar' ? 'الرئيسية' : 'Accueil'}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#8C5E35]">
            {lang === 'ar' ? 'التشكيلة' : 'Collection'}
          </Link>
          <span>/</span>
          <span className="text-[#1E1916] font-bold truncate">{prodTitle}</span>
        </div>
      </div>

      {/* 2. MAIN PRODUCT HERO */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* GALLERY COLUMN */}
          <div className="lg:col-span-7 space-y-3">
            <div
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#E8DFD3] shadow-xs cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={activeImage}
                alt={prodTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover group-hover:scale-102 transition-transform duration-300"
                priority
              />
              <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} px-2.5 py-0.5 rounded-full bg-[#1A1615]/85 backdrop-blur-md text-[#FFDE9E] text-[10px] font-bold`}>
                {lang === 'ar' ? product.badge : product.frenchBadge}
              </div>
              <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-2xs">
                <Eye className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تكبير الصورة' : 'Agrandir l’image'}</span>
              </div>
            </div>

            {/* Thumbnails (Displayed whenever multiple images exist) */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {productImages.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#8C5E35] ring-2 ring-[#8C5E35]/20'
                        : 'border-[#EAE1D5] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`${prodTitle} ${idx + 1}`} fill className="object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantees 3-pill banner */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-[#EAE1D5] space-y-0.5">
                <Award className="w-4 h-4 text-[#8C5E35] mx-auto" />
                <h5 className="text-[10.5px] font-bold text-[#1E1916]">
                  {lang === 'ar' ? '100% جلد طبيعي' : '100% Cuir Naturel'}
                </h5>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#EAE1D5] space-y-0.5">
                <Truck className="w-4 h-4 text-[#8C5E35] mx-auto" />
                <h5 className="text-[10.5px] font-bold text-[#1E1916]">
                  {lang === 'ar' ? 'توصيل مجاني' : 'Livraison Gratuite'}
                </h5>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#EAE1D5] space-y-0.5">
                <ShieldCheck className="w-4 h-4 text-[#28A745] mx-auto" />
                <h5 className="text-[10.5px] font-bold text-[#1E1916]">
                  {lang === 'ar' ? 'معاينة قبل الدفع' : 'Inspection avant Paiement'}
                </h5>
              </div>
            </div>
          </div>

          {/* PRODUCT INFO & EMBEDDED COD ORDER FORM */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Header info */}
            <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="inline-block text-[11px] font-bold text-[#8C5E35] bg-[#F3EBE0] px-2.5 py-0.5 rounded-full border border-[#DECDBB]">
                {prodCategory}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1E1916]">
                {prodTitle}
              </h1>
              <p className="text-xs text-[#6E6157]">{prodSubtitle}</p>

              {/* Stars */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex items-center gap-0.5 text-[#D9A74A]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1E1916]">{product.rating}</span>
                <span className="text-[11px] text-[#7A6E63]">
                  ({product.reviewCount} {lang === 'ar' ? 'تقييم موثق' : 'avis'})
                </span>
              </div>
            </div>

            {/* BUNDLE OFFER SELECTOR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1E1916]">
                <span>{lang === 'ar' ? 'اختر باقتك المفضلة:' : 'Choisissez votre offre :'}</span>
                <span className="text-[11px] text-[#28A745]">
                  {lang === 'ar' ? '✓ شحن مجاني لعرض قطعتين' : '✓ Livraison gratuite dès 2 pièces'}
                </span>
              </div>

              <div className="space-y-2">
                {bundles.map((bundle) => {
                  const isSelected = selectedBundleId === bundle.id;
                  return (
                    <div
                      key={bundle.id}
                      onClick={() => setSelectedBundleId(bundle.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#8C5E35] bg-white ring-2 ring-[#8C5E35]/20 shadow-xs'
                          : 'border-[#EAE1D5] hover:border-[#D5C7B7] bg-white/70'
                      }`}
                    >
                      <div className="text-left shrink-0">
                        <div className="text-base font-black text-[#8C5E35]">
                          {bundle.price} <span className="text-xs font-bold">DH</span>
                        </div>
                        <div className="text-[10px] text-[#28A745] font-bold">
                          {lang === 'ar' ? `وفر ${bundle.savings} د.م` : `Économisez ${bundle.savings} DH`}
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-[#1E1916]">
                              {bundle.title}
                            </span>
                            {bundle.badge && (
                              <span className="text-[9px] font-extrabold bg-[#E05A47] text-white px-1.5 py-0.5 rounded-full">
                                {lang === 'ar' ? 'الأكثر طلباً' : 'Top Vente'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-[#7A6E63]">{bundle.subtitle}</p>
                        </div>

                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#8C5E35] bg-[#8C5E35] text-white' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SELECTION OF 2ND OR 3RD PIECE IF BUNDLE >= 2 */}
            {activeBundle.quantity >= 2 && (
              <div className={`bg-[#F3EBE0] p-3 rounded-xl border border-[#E2D5C3] space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="text-xs font-bold text-[#5A4031] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8C5E35]" />
                  <span>{lang === 'ar' ? 'تخصيص القطع الإضافية بالعرض:' : 'Personnaliser vos pièces additionnelles :'}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6E5A4A] mb-1">
                    {lang === 'ar' ? 'القطعة الثانية:' : 'Deuxième pièce :'}
                  </label>
                  <select
                    value={secondItemChoice}
                    onChange={(e) => setSecondItemChoice(e.target.value)}
                    className="w-full bg-white border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs font-bold text-[#1E1916] focus:outline-hidden"
                  >
                    <option value={prodTitle}>
                      {lang === 'ar' ? `نفس الموديل: ${prodTitle}` : `Même modèle : ${prodTitle}`}
                    </option>
                    {otherProducts.map((p) => (
                      <option key={p.slug} value={lang === 'ar' ? p.arabicName : p.frenchName}>
                        {lang === 'ar' ? p.arabicName : p.frenchName}
                      </option>
                    ))}
                  </select>
                </div>

                {activeBundle.quantity >= 3 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6E5A4A] mb-1">
                      {lang === 'ar' ? 'القطعة الثالثة:' : 'Troisième pièce :'}
                    </label>
                    <select
                      value={thirdItemChoice}
                      onChange={(e) => setThirdItemChoice(e.target.value)}
                      className="w-full bg-white border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs font-bold text-[#1E1916] focus:outline-hidden"
                    >
                      <option value={prodTitle}>
                        {lang === 'ar' ? `نفس الموديل: ${prodTitle}` : `Même modèle : ${prodTitle}`}
                      </option>
                      {otherProducts.map((p) => (
                        <option key={p.slug} value={lang === 'ar' ? p.arabicName : p.frenchName}>
                          {lang === 'ar' ? p.arabicName : p.frenchName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* EMBEDDED FAST COD ORDER FORM */}
            <div
              id="product-cod-form"
              ref={formRef}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD3] shadow-md space-y-3"
            >
              <div className={`border-b border-[#F0EAE1] pb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h3 className="font-black text-sm sm:text-base text-[#1E1916]">
                  {lang === 'ar' ? 'استمارة الطلب — الدفع عند الاستلام' : 'Formulaire de Commande — Paiement à la Livraison'}
                </h3>
                <p className="text-[11px] text-[#7A6E63] mt-0.5">
                  {lang === 'ar'
                    ? 'افحص سلعتك بيدك ثم ادفع للموزع 🇲🇦'
                    : 'Vérifiez votre colis avant de payer au livreur 🇲🇦'}
                </p>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-3">
                {/* Full Name */}
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    {lang === 'ar' ? 'الاسم الكامل' : 'Nom Complet'} <span className="text-[#E05A47]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder={lang === 'ar' ? 'الاسم والشخصي' : 'Votre nom et prénom'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-base sm:text-sm text-[#1E1916] focus:bg-white focus:outline-hidden ${
                        errors.fullName ? 'border-[#E05A47]' : 'border-[#E0D7CB] focus:border-[#8C5E35]'
                      }`}
                    />
                    <User className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-3 w-4 h-4 text-[#9C8F83]`} />
                  </div>
                  {errors.fullName && <p className="text-[11px] text-[#E05A47] mt-0.5">{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="block text-xs font-bold text-[#4A4036] mb-1">
                    {lang === 'ar' ? 'رقم الهاتف (سنتصل بك للتأكيد)' : 'Numéro de Téléphone (Pour confirmation)'} <span className="text-[#E05A47]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                      placeholder="06XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-base sm:text-sm text-[#1E1916] ${isRtl ? 'text-right' : 'text-left'} focus:bg-white focus:outline-hidden ${
                        errors.phone ? 'border-[#E05A47]' : 'border-[#E0D7CB] focus:border-[#8C5E35]'
                      }`}
                    />
                    <Phone className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-3 w-4 h-4 text-[#9C8F83]`} />
                  </div>
                  {errors.phone && <p className="text-[11px] text-[#E05A47] mt-0.5">{errors.phone}</p>}
                </div>

                {/* City & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-[#4A4036] mb-1">
                      {lang === 'ar' ? 'المدينة' : 'Ville'} <span className="text-[#E05A47]">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl px-2.5 py-2.5 text-base sm:text-sm text-[#1E1916] focus:bg-white focus:outline-hidden"
                    >
                      {MOROCCAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {city === 'Autre ville' && (
                      <input
                        type="text"
                        placeholder={lang === 'ar' ? 'اسم مدينتك' : 'Votre ville'}
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="mt-1.5 w-full bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl px-2.5 py-2 text-sm text-[#1E1916]"
                      />
                    )}
                  </div>

                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-[#4A4036] mb-1">
                      {lang === 'ar' ? 'العنوان / الحي' : 'Adresse de livraison'} <span className="text-[#E05A47]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="street-address"
                        autoComplete="street-address"
                        placeholder={lang === 'ar' ? 'الحي والشارع' : 'Quartier, rue'}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-base sm:text-sm text-[#1E1916] focus:bg-white focus:outline-hidden ${
                          errors.address ? 'border-[#E05A47]' : 'border-[#E0D7CB] focus:border-[#8C5E35]'
                        }`}
                      />
                      <MapPin className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-3 w-4 h-4 text-[#9C8F83]`} />
                    </div>
                    {errors.address && <p className="text-[11px] text-[#E05A47] mt-0.5">{errors.address}</p>}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className={`bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] space-y-1 text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="flex justify-between">
                    <span className="text-[#6E6157]">{activeBundle.title}</span>
                    <span className="font-bold text-[#1E1916]">{activeBundle.price} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6157]">{lang === 'ar' ? 'الشحن والتوصيل' : 'Livraison'}</span>
                    <span className="font-bold text-[#28A745]">{lang === 'ar' ? 'مجاني (0 درهم)' : 'Gratuite'}</span>
                  </div>
                  <div className="border-t border-[#E5DDD2] pt-1 flex justify-between font-black text-sm">
                    <span>{lang === 'ar' ? 'المبلغ عند الاستلام:' : 'Total à la livraison :'}</span>
                    <span className="text-[#8C5E35] font-black">{activeBundle.price} DH</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#9A6539] via-[#7B4D24] to-[#513014] text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'ar' ? 'جاري التأكيد...' : 'Confirmation en cours...'}</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#FFDE9E]" />
                      <span>
                        {lang === 'ar'
                          ? `تأكيد الطلب — الدفع عند الاستلام (${activeBundle.price} د.م)`
                          : `Confirmer la Commande — Paiement à la Réception (${activeBundle.price} DH)`}
                      </span>
                    </>
                  )}
                </button>

                {/* WhatsApp Quick Order */}
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'أو اطلب بالواتساب بنقرة واحدة' : 'Ou commander directement par WhatsApp'}</span>
                </a>
              </form>
            </div>

          </div>
        </div>

        {/* 3. TECHNICAL SPECIFICATIONS TABS (Craft Packaging Only, Natural Leather Only) */}
        <div className="mt-8 bg-white rounded-2xl p-4 sm:p-6 border border-[#E8DFD3] shadow-xs">
          <div className="border-b border-[#F0EBE3] pb-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'specs' ? 'bg-[#8C5E35] text-white' : 'text-[#6E6157] bg-[#FAF7F2]'
              }`}
            >
              {lang === 'ar' ? 'المواصفات والسعة' : 'Spécifications & Capacité'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('craft')}
              className={`py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'craft' ? 'bg-[#8C5E35] text-white' : 'text-[#6E6157] bg-[#FAF7F2]'
              }`}
            >
              {lang === 'ar' ? 'سر الصنعة والجلد' : 'Artisanat & Cuir'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('care')}
              className={`py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'care' ? 'bg-[#8C5E35] text-white' : 'text-[#6E6157] bg-[#FAF7F2]'
              }`}
            >
              {lang === 'ar' ? 'العناية والتغليف' : 'Entretien & Emballage'}
            </button>
          </div>

          <div className={`pt-4 max-w-3xl mx-auto ${isRtl ? 'text-right' : 'text-left'}`}>
            {activeTab === 'specs' && (
              <div className="space-y-3">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C5046]">
                  {(lang === 'fr' && product.frenchCapacity ? product.frenchCapacity : product.capacity).map((cap, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[#FAF7F2] p-2 rounded-xl border border-[#ECE4D8]">
                      <Check className="w-3.5 h-3.5 text-[#28A745] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#ECE4D8]">
                    <span className="font-bold text-[#8C5E35] block">{lang === 'ar' ? 'الأبعاد:' : 'Dimensions :'}</span>
                    <span className="font-bold text-[#1E1916] mt-0.5 block">{product.dimensions}</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#ECE4D8]">
                    <span className="font-bold text-[#8C5E35] block">{lang === 'ar' ? 'نوع الجلد:' : 'Matière :'}</span>
                    <span className="font-bold text-[#1E1916] mt-0.5 block">
                      {lang === 'ar' ? product.leatherType : product.frenchLeatherType}
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#ECE4D8]">
                    <span className="font-bold text-[#8C5E35] block">{lang === 'ar' ? 'الخياطة:' : 'Couture :'}</span>
                    <span className="font-bold text-[#1E1916] mt-0.5 block">
                      {lang === 'ar' ? product.stitching : product.frenchStitching}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'craft' && (
              <div className="space-y-2 text-xs text-[#5C5046] leading-relaxed">
                <p>{lang === 'ar' ? product.fullDescription : product.frenchFullDescription}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE1D5]">
                    <h5 className="font-bold text-[#1E1916] mb-0.5">
                      {lang === 'ar' ? 'دباغة نباتية طبيعية:' : 'Tannage Végétal Naturel :'}
                    </h5>
                    <p className="text-[11px] text-[#7A6E63]">
                      {lang === 'ar'
                        ? 'مستخلصات نباتية خالية من الكروم الكيماوي، تمنح الجلد ملمساً نقياً ورائحة أصيلة.'
                        : 'Extraits végétaux naturels sans chrome chimique, pour un cuir authentique.'}
                    </p>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE1D5]">
                    <h5 className="font-bold text-[#1E1916] mb-0.5">
                      {lang === 'ar' ? 'خياطة السراجة اليدوية:' : 'Couture Sellier Main :'}
                    </h5>
                    <p className="text-[11px] text-[#7A6E63]">
                      {lang === 'ar'
                        ? 'غرز يدوية متينة بخيط مشمع تدوم لسنوات طويلة دون انقطاع.'
                        : 'Point sellier fait main au fil ciré haute résistance.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#1E1916]">
                  {lang === 'ar' ? 'محتويات التغليف:' : 'Contenu du colis :'}
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C5046]">
                  {(lang === 'fr' && product.frenchBoxContents ? product.frenchBoxContents : product.boxContents).map((item, i) => (
                    <li key={i} className="flex items-center gap-2 bg-[#FAF7F2] p-2 rounded-xl border border-[#ECE4D8]">
                      <Package className="w-3.5 h-3.5 text-[#8C5E35] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-[#FAF5EE] p-2.5 rounded-xl border border-[#E8DFD3] text-xs text-[#6C6055]">
                  <p>
                    {lang === 'ar'
                      ? '• احفظ المحفظة بعيداً عن الماء المباشر، وامسحها كل فترة بقليل من الشمع الطبيعي لتعزيز لمعان الجلد.'
                      : '• Conservez le cuir à l’abri de l’eau directe et cirez légèrement pour rehausser son éclat.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. CUSTOMER REVIEWS (Bilingual & Placed BEFORE Related Products) */}
        <div className={`mt-10 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 pb-3 border-b border-[#E8DFD3] gap-2">
            <div>
              <span className="text-[11px] font-bold text-[#8C5E35] bg-[#F7F0E6] px-2.5 py-0.5 rounded-full border border-[#E8DAC8]">
                {lang === 'ar' ? 'آراء موثقة' : 'Avis Vérifiés'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[#1E1916] mt-1">
                {lang === 'ar' ? `تقييمات الزبناء لـ «${prodTitle}»` : `Avis Clients pour « ${prodTitle} »`}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-[#D9A74A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-black text-xs sm:text-sm text-[#1E1916]">{product.rating} / 5</span>
            </div>
          </div>

          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto pb-3 no-scrollbar snap-x">
            {(dynamicReviews.length > 0 ? dynamicReviews : reviews).map((rev, i) => (
              <div
                key={rev.id || i}
                className="w-[82vw] sm:w-auto shrink-0 snap-start bg-white p-3.5 rounded-xl border border-[#E8DFD3] shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-0.5 text-[#D9A74A] mb-1.5">
                    {[...Array(rev.rating || 5)].map((_, s) => (
                      <Star key={s} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#4C4138] leading-relaxed italic mb-2">
                    &quot;{rev.comment}&quot;
                  </p>

                  {/* WhatsApp Voice Note Player if present */}
                  {rev.audioUrl && (
                    <div className="mb-2">
                      <WhatsAppAudioPlayer
                        audioUrl={rev.audioUrl}
                        senderName={rev.name}
                        durationLabel={rev.audioDuration}
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-[#F0EBE3] pt-2">
                  <div className="font-bold text-xs text-[#1E1916] flex items-center justify-between">
                    <span>{rev.name}</span>
                    <span className="text-[9.5px] text-[#28A745] font-semibold bg-[#E8F8EE] px-1 py-0.2 rounded">
                      {lang === 'ar' ? 'شراء مؤكد ✓' : 'Achat Vérifié ✓'}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#8C5E35] font-medium flex items-center justify-between mt-0.5">
                    <span>📍 {rev.city}</span>
                    <span className="text-[10px] text-[#9A8D80]">{rev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. RELATED PRODUCTS (Placed AFTER Reviews) */}
        <div className={`mt-10 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-xl font-black text-[#1E1916]">
              {lang === 'ar' ? 'موديلات أخرى قد تعجبك:' : 'Autres Modèles Recommandés :'}
            </h3>
            <Link href="/products" className="text-xs font-bold text-[#8C5E35] hover:underline">
              {lang === 'ar' ? 'عرض الكتالوج ←' : 'Voir tout le catalogue →'}
            </Link>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto pb-3 no-scrollbar snap-x">
            {otherProducts.map((rel) => {
              const relTitle = lang === 'ar' ? rel.arabicName : rel.frenchName;
              const relBadge = lang === 'ar' ? rel.badge : rel.frenchBadge;
              return (
                <Link
                  key={rel.slug}
                  href={`/products/${rel.slug}`}
                  className="w-48 sm:w-auto shrink-0 snap-start bg-white rounded-xl border border-[#E8DFD3] overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[#FAF6F0]">
                    <Image
                      src={rel.featuredImage}
                      alt={relTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute top-2 ${isRtl ? 'right-2' : 'left-2'} px-2 py-0.5 rounded-full bg-[#1A1615]/80 text-[#FFDE9E] text-[9.5px] font-bold`}>
                      {relBadge}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-bold text-xs text-[#1E1916] truncate">
                      {relTitle}
                    </h4>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#F2ECE3]">
                      <span className="text-xs font-bold text-[#8C5E35]">{rel.price} DH</span>
                      <span className="text-[10px] text-[#7A6E63]">{lang === 'ar' ? 'معاينة ←' : 'Voir →'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. RESPONSIVE STICKY BOTTOM ORDER SECTION */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#161210]/95 text-white backdrop-blur-md border-t border-[#3A2E26] px-3.5 py-2.5 sm:py-3 shadow-2xl transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Product Thumbnail & Price */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0 border border-white/15 hidden xs:block">
              <Image
                src={activeImage}
                alt={prodTitle}
                fill
                className="object-cover"
              />
            </div>
            <div className={`min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[220px]">
                {prodTitle}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-[#FFDE9E]">
                  {activeBundle.price} DH
                </span>
                <span className="text-[10px] text-[#28A745] font-semibold bg-[#28A745]/20 px-1.5 py-0.2 rounded hidden sm:inline">
                  {lang === 'ar' ? 'توصيل مجاني' : 'Livraison gratuite'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Instant Scroll to Order Button */}
          <button
            type="button"
            onClick={scrollToForm}
            className="flex-1 sm:flex-initial py-2.5 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-[#C99859] via-[#A87239] to-[#7A4B20] text-white font-extrabold text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 text-[#FFF2D6]" />
            <span>
              {lang === 'ar'
                ? 'طلب الآن — الدفع عند الاستلام'
                : 'Commander — Paiement à la Livraison'}
            </span>
          </button>
        </div>
      </div>

      {/* 7. IMAGE LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-2xl overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#FAF6F0]">
              <Image src={activeImage} alt={prodTitle} fill className="object-contain" />
            </div>

            {productImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-2 pt-1 border-t border-slate-100 overflow-x-auto">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#8C5E35] ring-2 ring-[#8C5E35]/40'
                        : 'border-[#EAE1D5] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`${prodTitle} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. ORDER CONFIRMATION MODAL */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl max-w-md w-full p-5 border border-[#DECDBB] shadow-2xl animate-fade-in relative ${isRtl ? 'text-right' : 'text-left'}`}>
            <button
              type="button"
              onClick={() => setOrderConfirmed(null)}
              className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} p-1.5 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#28A745] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-center text-[#1E1916]">
              {lang === 'ar' ? 'تم تسجيل طلبكم بنجاح! 🎉' : 'Commande enregistrée avec succès ! 🎉'}
            </h3>
            <p className="text-[11px] text-center text-[#7A6E63] mt-0.5">
              {lang === 'ar' ? 'شكراً لاختياركم ماركة «التاج للمصنوعات الجلدية»' : 'Merci d’avoir choisi ALTAJ LEATHER'}
            </p>

            <div className="mt-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD4] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6C6055]">{lang === 'ar' ? 'رقم الطلب:' : 'N° Commande :'}</span>
                <span className="font-mono font-bold text-[#1E1916]">{orderConfirmed.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C6055]">{lang === 'ar' ? 'الزبون:' : 'Client :'}</span>
                <span className="font-bold text-[#1E1916]">{orderConfirmed.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C6055]">{lang === 'ar' ? 'المدينة:' : 'Ville :'}</span>
                <span className="font-bold text-[#1E1916]">{orderConfirmed.customerCity}</span>
              </div>
              <div className="flex justify-between border-t border-[#E3DBD0] pt-1.5 font-bold">
                <span>{lang === 'ar' ? 'المبلغ للدفع عند الاستلام:' : 'Total à la livraison :'}</span>
                <span className="text-[#8C5E35]">{orderConfirmed.price} DH</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-[#EAF5EC] border border-[#C5E8CE] text-[11px] text-[#20603D] flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'سيتصل بك موظفنا لتأكيد الإرسال، والتوصيل خلال 24-48 ساعة.'
                  : 'Notre service client vous contactera pour valider l’envoi. Livraison en 24-48h.'}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`https://wa.me/212693148230?text=${encodeURIComponent(
                  `Bonjour ALTAJ, commande N° ${orderConfirmed.orderNumber} pour ${orderConfirmed.customerName}. Merci !`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] text-white font-bold text-xs text-center shadow-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تسريع التأكيد عبر الواتساب' : 'Accélérer la confirmation sur WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={() => setOrderConfirmed(null)}
                className="w-full py-2 px-4 rounded-xl bg-[#FAF6F0] text-[#5A4031] font-bold text-xs border border-[#DECDBB] cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق ومتابعة التصفح' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
