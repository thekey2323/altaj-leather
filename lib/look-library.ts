export interface CuratedLook {
  id: string;
  style: 'quiet_luxury' | 'old_money' | 'smart_casual' | 'minimalist' | 'streetwear' | 'classic' | string;
  occasions: string[];
  pieces: {
    top: string;
    bottom: string;
    footwear: string;
    accessories?: string;
  };
  colors: string[]; // e.g. ['beige', 'navy', 'white']
  keywords: string[];
  imageUrl: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const CURATED_MENSWEAR_LOOKS: CuratedLook[] = [
  // 1. Quiet Luxury — Linen & Chinos
  {
    id: 'look_linen_navy_white',
    style: 'quiet_luxury',
    occasions: ['daily_casual', 'summer', 'weekend', 'brunch', 'travel'],
    pieces: {
      top: 'Linen button-down shirt',
      bottom: 'Tailored navy chinos',
      footwear: 'Clean white leather sneakers',
      accessories: 'Minimal leather strap watch',
    },
    colors: ['beige', 'sand', 'navy', 'blue', 'white'],
    keywords: ['linen', 'beige', 'sand', 'navy', 'chinos', 'white', 'sneakers', 'summer', 'casual'],
    imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'فخامة هادئة — قميص كتان بيج وتشينو كحلي',
    titleEn: 'Quiet Luxury — Beige Linen & Navy Chinos',
    descriptionAr: 'قميص كتان بيج بياقة مريحة مع بنطال تشينو كحلي وسنيكرز أبيض ناصع لمظهر متوسطي صيفي جذاب.',
    descriptionEn: 'Tailored beige linen button-down with deep navy chinos and pristine white leather sneakers.',
  },

  // 2. Old Money — Sand Blazer & Knit Tee
  {
    id: 'look_sand_blazer_loafers',
    style: 'old_money',
    occasions: ['date_night', 'dinner', 'smart_casual', 'business_meeting'],
    pieces: {
      top: 'Unstructured sand tailored blazer layered over off-white knit tee',
      bottom: 'Tailored neutral trousers',
      footwear: 'Taupe suede penny loafers',
      accessories: 'Classic dress watch',
    },
    colors: ['sand', 'beige', 'off-white', 'cream', 'taupe', 'brown'],
    keywords: ['blazer', 'sand', 'beige', 'loafers', 'suede', 'knit', 'old money', 'formal', 'smart'],
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'أولد موني — بليزر رملي غير مبطن ولوفر سويد',
    titleEn: 'Modern Old Money — Sand Blazer & Suede Loafers',
    descriptionAr: 'بليزر رملي إيطالي غير مبطن فوق تيشيرت تريكو عاجي، مع بنطال متناسق ولوفر سويد راقٍ.',
    descriptionEn: 'Unstructured sand Italian blazer over an ivory knit tee, tailored trousers, and taupe suede loafers.',
  },

  // 3. Smart Casual — Olive Safari Overshirt
  {
    id: 'look_olive_overshirt_utility',
    style: 'smart_casual',
    occasions: ['daily_casual', 'work', 'weekend', 'outdoor', 'travel'],
    pieces: {
      top: 'Olive utility overshirt over clean off-white crewneck',
      bottom: 'Tailored dark navy or khaki chinos',
      footwear: 'White leather minimalist sneakers',
      accessories: 'Field watch',
    },
    colors: ['olive', 'green', 'white', 'off-white', 'navy', 'khaki'],
    keywords: ['overshirt', 'olive', 'green', 'jacket', 'safari', 'utility', 'chinos', 'white', 'smart casual'],
    imageUrl: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'سمارت كاجوال — أوفرشيرت زيتي وتيشيرت أوف وايت',
    titleEn: 'Smart Casual — Olive Utility Overshirt & Neutral Chinos',
    descriptionAr: 'أوفرشيرت زيتي بجيوب عملية مع تيشيرت ثقيل أوف وايت وتشينو كحلي متناسق.',
    descriptionEn: 'Olive green utility overshirt paired with a heavy knit off-white tee and tailored chinos.',
  },

  // 4. Minimalist — Monochrome Charcoal & Black
  {
    id: 'look_minimalist_black_charcoal',
    style: 'minimalist',
    occasions: ['evening', 'date_night', 'gallery', 'daily_casual'],
    pieces: {
      top: 'Premium black knit crewneck or mock-neck',
      bottom: 'Charcoal grey pleated wool trousers',
      footwear: 'Minimal black leather Chelsea boots or sleek sneakers',
      accessories: 'Matte black watch',
    },
    colors: ['black', 'charcoal', 'grey', 'monochrome'],
    keywords: ['black', 'charcoal', 'grey', 'knit', 'minimalist', 'boots', 'trousers', 'monochrome'],
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'مينيماليست — تريكو أسود وبنطال رمادي فحمي',
    titleEn: 'Minimalist — Black Knit & Charcoal Tailored Trousers',
    descriptionAr: 'إطلالة مونوكرومية نقية بتريكو أسود فاخر وبنطال صوف رمادي بتكسيرات ناعمة وحذاء أنيق.',
    descriptionEn: 'Refined monochrome aesthetic featuring fine black knitwear, pleated charcoal trousers, and sleek footwear.',
  },

  // 5. Classic Formal — Bespoke Navy / Charcoal Suit
  {
    id: 'look_classic_formal_suit',
    style: 'classic',
    occasions: ['formal', 'wedding', 'gala', 'business_meeting', 'official'],
    pieces: {
      top: 'Tailored double-breasted or two-button suit jacket with crisp white shirt',
      bottom: 'Matching tailored suit trousers with sharp crease',
      footwear: 'Dark brown or black Oxford dress shoes',
      accessories: 'Silk tie & pocket square',
    },
    colors: ['navy', 'charcoal', 'black', 'white', 'brown'],
    keywords: ['suit', 'blazer', 'formal', 'wedding', 'classic', 'oxford', 'tie', 'business'],
    imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'كلاسيك رسمي — بدلة مفصلة أنيقة للمناسبات',
    titleEn: 'Classic Formal — Bespoke Tailored Suit',
    descriptionAr: 'بدلة رجالية مفصلة بكتف ناعم وياقة كلاسيكية مع قميص ناصع وحذاء أوكسفورد رسمي للمناسبات الكبرى.',
    descriptionEn: 'Sharp bespoke tailoring with a crisp formal shirt, matching trousers, and polished Oxford shoes.',
  },

  // 6. Elevated Streetwear — Neutral Boxy Hoodie & Retro Runners
  {
    id: 'look_streetwear_neutral',
    style: 'streetwear',
    occasions: ['weekend', 'hangout', 'travel', 'daily_casual', 'airport'],
    pieces: {
      top: 'Oversized sand/taupe heavyweight hoodie or boxy overshirt',
      bottom: 'Relaxed fit carpenter pants or dark washed denim',
      footwear: 'Retro designer sneakers',
      accessories: 'Crossbody bag or cap',
    },
    colors: ['sand', 'taupe', 'beige', 'grey', 'black', 'white'],
    keywords: ['hoodie', 'oversized', 'streetwear', 'sneakers', 'denim', 'relaxed', 'casual'],
    imageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'ستريت وير راقٍ — هودي رملي وبنطال بقصة مستقيمة',
    titleEn: 'Elevated Streetwear — Boxy Sand Hoodie & Clean Denim',
    descriptionAr: 'ستريت وير معاصر بقصات مريحة متقنة وألوان محايدة هادئة تبتعد عن الصخب والمبالغة.',
    descriptionEn: 'Contemporary elevated streetwear in subdued earth tones with premium fabric weight and retro footwear.',
  },

  // 7. Old Money Summer — Knit Polo & Cream Trousers
  {
    id: 'look_knit_polo_cream_trousers',
    style: 'old_money',
    occasions: ['summer', 'weekend', 'brunch', 'resort', 'vacation'],
    pieces: {
      top: 'Open-collar textured knit polo in caramel or sage',
      bottom: 'Cream or off-white pleated linen-blend trousers',
      footwear: 'Leather horsebit loafers or espadrilles',
      accessories: 'Tortoiseshell sunglasses',
    },
    colors: ['cream', 'off-white', 'beige', 'brown', 'green', 'caramel'],
    keywords: ['polo', 'knit', 'cream', 'trousers', 'loafers', 'summer', 'resort', 'old money'],
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'ريفييرا كلاسيك — بولو تريكو وبنطال كريمي مريح',
    titleEn: 'Old Money Resort — Knit Polo & Cream Pleated Trousers',
    descriptionAr: 'بولو تريكو إيطالي بياقة مفتوحة مع بنطال كتان كريمي مطوي ونظارة شمسية هورن كلاسيكية.',
    descriptionEn: 'Textured open-collar knit polo tucked into cream pleated trousers with classic leather loafers.',
  },

  // 8. Smart Casual — Navy Blazer & Khaki Chinos
  {
    id: 'look_navy_blazer_khaki_chinos',
    style: 'smart_casual',
    occasions: ['work', 'office', 'business_casual', 'dinner', 'presentation'],
    pieces: {
      top: 'Navy unstructured hopsack blazer over light blue shirt',
      bottom: 'British khaki tailored chinos',
      footwear: 'Dark brown suede loafers or brogues',
      accessories: 'Brown leather belt & watch',
    },
    colors: ['navy', 'blue', 'khaki', 'beige', 'brown', 'white'],
    keywords: ['blazer', 'navy', 'khaki', 'shirt', 'blue', 'loafers', 'smart casual', 'office'],
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'سمارت كاجوال أيقوني — بليزر كحلي مع تشينو خاكي',
    titleEn: 'Iconic Smart Casual — Navy Blazer & Khaki Chinos',
    descriptionAr: 'التنسيق الكلاسيكي الأكثر موثوقية في عالم الأناقة الرجالية، يجمع بين بليزر الكحلي والتشينو الخاكي.',
    descriptionEn: 'The gold standard of smart casual: tailored navy blazer, light blue shirt, and sharp khaki chinos.',
  },

  // 9. Modern Minimalist — Denim Jacket & Tailored Pants
  {
    id: 'look_denim_jacket_tailored',
    style: 'minimalist',
    occasions: ['daily_casual', 'weekend', 'coffee', 'city_walk'],
    pieces: {
      top: 'Clean raw denim jacket over white crewneck tee',
      bottom: 'Black or charcoal tapered chinos',
      footwear: 'Low-top minimalist leather sneakers',
      accessories: 'Silver ring & leather bracelet',
    },
    colors: ['blue', 'denim', 'white', 'black', 'charcoal'],
    keywords: ['denim', 'jacket', 't-shirt', 'white', 'black', 'sneakers', 'casual'],
    imageUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'كاجوال عصري — جاكيت جينز مع تيشيرت أبيض وسروال مريح',
    titleEn: 'Modern Everyday — Raw Denim Jacket & White Tee',
    descriptionAr: 'جاكيت جينز خام نقي فوق تيشيرت قطني أبيض وبنطال أسود قماشي مع سنيكرز جلدي بسيط.',
    descriptionEn: 'Raw indigo denim jacket layered over a crisp white tee with tapered dark chinos and sneakers.',
  },

  // 10. Winter Quiet Luxury — Camel Coat & Rollneck
  {
    id: 'look_camel_coat_rollneck',
    style: 'quiet_luxury',
    occasions: ['winter', 'evening', 'date_night', 'travel', 'dinner'],
    pieces: {
      top: 'Camel wool overcoat over black or off-white cashmere rollneck',
      bottom: 'Tailored dark trousers',
      footwear: 'Leather Chelsea boots',
      accessories: 'Cashmere scarf',
    },
    colors: ['camel', 'beige', 'black', 'off-white', 'brown'],
    keywords: ['coat', 'camel', 'rollneck', 'turtleneck', 'sweater', 'boots', 'winter', 'quiet luxury'],
    imageUrl: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'فخامة شتوية — معطف كشمير جملي ورولنك فاخر',
    titleEn: 'Winter Quiet Luxury — Camel Overcoat & Rollneck',
    descriptionAr: 'معطف صوف جملي بقصة مستقيمة مع كنزة رولنك كشمير سوداء وبنطال رسمي مع حذاء تشيلسي أنيق.',
    descriptionEn: 'Single-breasted camel wool coat layered over a black rollneck sweater and tailored wool trousers.',
  },

  // 11. Casual Elegance — White Oxford & Dark Denim
  {
    id: 'look_oxford_dark_denim',
    style: 'smart_casual',
    occasions: ['daily_casual', 'weekend', 'brunch', 'office'],
    pieces: {
      top: 'Crisp white Oxford cotton button-down shirt',
      bottom: 'Slim-straight dark raw denim',
      footwear: 'Brown suede desert boots or clean sneakers',
      accessories: 'Leather watch with olive strap',
    },
    colors: ['white', 'blue', 'navy', 'brown'],
    keywords: ['oxford', 'shirt', 'white', 'denim', 'jeans', 'boots', 'smart casual'],
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'أناقة يومية — قميص أوكسفورد أبيض وجينز داكن',
    titleEn: 'Everyday Classic — White Oxford Shirt & Dark Denim',
    descriptionAr: 'قميص أكسفورد أبيض ناصع بأكمام مطوية مع بنطال جينز داكن مستقيم وحذاء مريح.',
    descriptionEn: 'Classic white Oxford cotton button-down tucked or untucked with raw dark denim and desert boots.',
  },

  // 12. Summer Linen Monochrome — Sand Linen Set
  {
    id: 'look_sand_linen_monochrome',
    style: 'quiet_luxury',
    occasions: ['summer', 'vacation', 'beach_club', 'brunch', 'weekend'],
    pieces: {
      top: 'Sand/Beige breathable linen shirt',
      bottom: 'Matching tailored sand linen trousers',
      footwear: 'Taupe suede loafers or leather sandals',
      accessories: 'Woven leather belt & sunglasses',
    },
    colors: ['sand', 'beige', 'neutral', 'taupe', 'white'],
    keywords: ['linen', 'sand', 'beige', 'monochrome', 'summer', 'vacation', 'trousers', 'loafers'],
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=85',
    titleAr: 'صيف الكتان المونوكرومي — طقم كتان رملي راقٍ',
    titleEn: 'Monochrome Linen — Sand Shirt & Tailored Linen Trousers',
    descriptionAr: 'تنسيق كتان رملي ناعم متجانس، يعكس أقصى درجات الراحة والانتعاش بأسلوب إيطالي هادئ.',
    descriptionEn: 'Relaxed yet tailored tone-on-tone sand linen ensemble for warm-weather sophistication.',
  },
];
