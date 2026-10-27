-- ==============================================================================
-- ALTAJ LEATHER — SUPABASE DATABASE SCHEMA & INITIAL SEED
-- ==============================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  tagline TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 119,
  compare_at_price NUMERIC DEFAULT 169,
  cost NUMERIC DEFAULT 50,
  promotion_badge TEXT DEFAULT '👑 PLUS DEMANDÉ',
  featured_image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  stock INTEGER DEFAULT 20,
  low_stock_threshold INTEGER DEFAULT 5,
  category TEXT DEFAULT 'Portefeuilles',
  tags JSONB DEFAULT '["100% Cuir Naturel"]'::jsonb,
  status TEXT DEFAULT 'ACTIVE',
  materials JSONB DEFAULT '["100% Cuir Naturel Tannage Végétal", "Fil ciré haute résistance"]'::jsonb,
  dimensions TEXT DEFAULT '10.8 cm x 8.4 cm',
  handmade_in TEXT DEFAULT 'Atelier ALTAJ — Maroc',
  bundle_offers JSONB DEFAULT '[]'::jsonb,
  related_product_slugs JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORDERS TABLE (Cash On Delivery Morocco Engine)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  courier_cost NUMERIC DEFAULT 35,
  notes TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'NEW',
  payment_method TEXT DEFAULT 'COD',
  utm_source TEXT DEFAULT 'Direct',
  utm_campaign TEXT DEFAULT 'Organic',
  internal_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REVIEWS TABLE (With WhatsApp Voice Note Support)
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  comment TEXT NOT NULL,
  date TEXT DEFAULT 'Aujourd''hui',
  is_verified BOOLEAN DEFAULT true,
  audio_url TEXT,
  audio_duration TEXT DEFAULT '0:15',
  product_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- POLICIES: Allow public read & write access for anon key
CREATE POLICY "Public Read Access Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Access Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Access Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- 4. STORAGE BUCKET FOR PRODUCT PHOTOS & WHATSAPP AUDIO
INSERT INTO storage.buckets (id, name, public)
VALUES ('altaj-media', 'altaj-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Media Access" ON storage.objects
FOR SELECT USING (bucket_id = 'altaj-media');

CREATE POLICY "Public Media Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'altaj-media');

CREATE POLICY "Public Media Update/Delete" ON storage.objects
FOR ALL USING (bucket_id = 'altaj-media');

-- 5. INITIAL SEED FOR PRODUCTS
INSERT INTO public.products (
  id, slug, name, sku, price, compare_at_price, cost, promotion_badge,
  featured_image, images, stock, category, dimensions, handmade_in, rating
) VALUES
(
  'prod-1793122106095',
  'passeport-holder',
  'Passeport Holder',
  'ALTAJ-229',
  119,
  169,
  50,
  'PROMO',
  '/images/products/passport-cover.jpg',
  '[{"id":"img-1","url":"/images/products/passport-cover.jpg","isFeatured":true,"order":1},{"id":"img-2","url":"/images/products/cognac-minimalist.jpg","isFeatured":false,"order":2}]'::jsonb,
  20,
  'Portefeuilles',
  '10.8 cm x 8.4 cm',
  'Atelier ALTAJ — Maroc',
  5.0
),
(
  'prod-1',
  'altaj-classic-marron',
  'ALTAJ CLASSIC — MARRON',
  'ALTAJ-CLS-BRN',
  119,
  169,
  50,
  'PROMO',
  '/images/products/altaj-classic-marron-custom-1.jpg',
  '[{"id":"img-1","url":"/images/products/altaj-classic-marron-custom-1.jpg","isFeatured":true,"order":1},{"id":"img-2","url":"/images/products/altaj-classic-marron-custom-2.jpg","isFeatured":false,"order":2},{"id":"img-3","url":"/images/products/altaj-classic-marron-custom-3.jpg","isFeatured":false,"order":3}]'::jsonb,
  25,
  'Portefeuilles',
  '10.8 cm x 8.4 cm',
  'Atelier ALTAJ — Maroc',
  5.0
),
(
  'prod-black-snap',
  'altaj-noir',
  'ALTAJ NOIR',
  'ALTAJ-NOIR-01',
  119,
  169,
  50,
  'NOUVEAU',
  '/images/products/altaj-noir-front.jpg',
  '[{"id":"img-1","url":"/images/products/altaj-noir-front.jpg","isFeatured":true,"order":1},{"id":"img-2","url":"/images/products/altaj-noir-open.jpg","isFeatured":false,"order":2}]'::jsonb,
  18,
  'Portefeuilles',
  '10.8 cm x 8.4 cm',
  'Atelier ALTAJ — Maroc',
  5.0
)
ON CONFLICT (id) DO UPDATE SET
  featured_image = EXCLUDED.featured_image,
  images = EXCLUDED.images;

-- 6. INITIAL SEED FOR REVIEWS
INSERT INTO public.reviews (
  id, name, city, rating, comment, date, is_verified, product_slug
) VALUES
(
  'rev-1',
  'Soufiane Bennani',
  'Casablanca',
  5,
  'تبارك الله، جودة الجلد الطبيعي ممتازة وخياطة متقونة بزاف. فحصت السلعة قبل ما نخلص الموزع والجلد رائحته نقية.',
  'Il y a 2 jours',
  true,
  'altaj-classic-marron'
),
(
  'rev-2',
  'Omar Tazi',
  'Rabat',
  5,
  'شريت عرض قطعتين بـ 189 درهم، تغليف كرافت أنيق وتوصيل سريع في 24 ساعة. تعامل راقي جداً.',
  'Il y a 4 jours',
  true,
  'all'
),
(
  'rev-3',
  'Yassine El Moden',
  'Tanger',
  5,
  'غلاف جواز السفر فخم وعملي في السفر. ملمس الجلد الطبيعي فاخر وسميك، شكراً دار التاج.',
  'Il y a 1 semaine',
  true,
  'passeport-holder'
),
(
  'rev-4',
  'Mehdi Skalli',
  'Marrakech',
  5,
  'أول تجربة ممتازة، جودة الجلد الطبيعي عالية والسعر مناسب جداً مقارنة بالإتقان والتغليف الممتاز.',
  'Il y a 2 semaines',
  true,
  'all'
)
ON CONFLICT (id) DO NOTHING;
