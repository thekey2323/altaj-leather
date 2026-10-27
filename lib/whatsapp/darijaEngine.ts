import {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppModelMedia,
  WhatsAppBotScripts,
  WhatsAppFunnelState,
  WhatsAppCapturedOrder,
} from "@/types";
import { askGeminiDarija } from "./aiEngine";

// Moroccan Cities dictionary (Latin & Arabic forms)
export const MOROCCAN_CITIES_DICT: Record<string, string[]> = {
  "Casablanca": ["casablanca", "casa", "dar baida", "الدار البيضاء", "كازا", "البيضاء"],
  "Rabat": ["rabat", "الرباط", "rbat"],
  "Marrakech": ["marrakech", "marrakesh", "kech", "مراكش"],
  "Fès": ["fes", "fez", "فاس"],
  "Tanger": ["tanger", "tangier", "طنجة"],
  "Agadir": ["agadir", "أكادير", "اكادير"],
  "Meknès": ["meknes", "مكناس"],
  "Oujda": ["oujda", "وجدة"],
  "Kénitra": ["kenitra", "knitra", "القنيطرة", "قنيطرة"],
  "Tétouan": ["tetouan", "titouan", "تطوان"],
  "Safi": ["safi", "آسفي", "اسفي"],
  "Mohammédia": ["mohammedia", "mohammadia", "المحمدية"],
  "El Jadida": ["el jadida", "jadida", "mazagan", "الجديدة"],
  "Béni Mellal": ["beni mellal", "بني ملال"],
  "Nador": ["nador", "الناظور", "ناضور"],
  "Taza": ["taza", "تازة"],
  "Settat": ["settat", "سطات"],
  "Berrechid": ["berrechid", "برشيد"],
  "Khémisset": ["khemisset", "الخميسات", "خميسات"],
  "Larache": ["larache", "العرائش", "عرائش"],
  "Ksar El Kebir": ["ksar el kebir", "القصر الكبير"],
  "Guelmim": ["guelmim", "كلميم"],
  "Berkane": ["berkane", "بركان"],
  "Taourirt": ["taourirt", "تاوريرت"],
  "Taroudant": ["taroudant", "تارودانت"],
  "Errachidia": ["errachidia", "الرشيدية", "راشيدية"],
  "Ouarzazate": ["ouarzazate", "ورزازات"],
  "Laâyoune": ["laayoune", "layoune", "العيون"],
  "Dakhla": ["dakhla", "الداخلة"],
  "Salé": ["sale", "sla", "سلا"],
  "Témara": ["temara", "تمارة"],
  "Essaouira": ["essaouira", "الصويرة"],
  "Al Hoceïma": ["al hoceima", "hoceima", "الحسيمة"],
};

export function detectMoroccanCity(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const [canonicalCity, aliases] of Object.entries(MOROCCAN_CITIES_DICT)) {
    for (const alias of aliases) {
      const regex = new RegExp(`(^|[\\s,.;:!?])${alias}([\\s,.;:!?]|$)`, "i");
      if (regex.test(normalized)) {
        return canonicalCity;
      }
    }
  }
  return null;
}

export function detectMoroccanPhone(text: string): string | null {
  const phoneRegex = /(?:\+?212|0)[5-7]\d{8}/g;
  const matches = text.replace(/[\s-]/g, "").match(phoneRegex);
  if (matches && matches.length > 0) {
    let num = matches[0];
    if (num.startsWith("0")) {
      num = "212" + num.slice(1);
    } else if (num.startsWith("+")) {
      num = num.slice(1);
    }
    return num;
  }
  return null;
}

export function detectPackOrQuantity(text: string): { quantity: number; modelName: string; price: number; isDuo: boolean } {
  const lower = text.toLowerCase();
  if (
    lower.includes("duo") ||
    lower.includes("pack") ||
    lower.includes("2") ||
    lower.includes("joj") ||
    lower.includes("deux") ||
    lower.includes("زوج") ||
    lower.includes("جوج") ||
    lower.includes("باك")
  ) {
    return {
      quantity: 2,
      modelName: "PACK DUO — ALTAJ (2 Portefeuilles Cuir)",
      price: 200,
      isDuo: true,
    };
  }

  if (lower.includes("noir") || lower.includes("كحل") || lower.includes("اسود") || lower.includes("أسود") || lower.includes("black")) {
    return {
      quantity: 1,
      modelName: "ALTAJ SIGNATURE — NOIR",
      price: 119,
      isDuo: false,
    };
  }

  return {
    quantity: 1,
    modelName: "ALTAJ CLASSIC — MARRON",
    price: 119,
    isDuo: false,
  };
}

export function isConfirmation(text: string): boolean {
  const cleaned = text.trim().toLowerCase();
  const confirmWords = [
    "oui", "ui", "ouais", "yes", "ok", "daccord", "d'accord", "wakha", "waha",
    "safi", "safii", "akadha", "aked", "akid", "confirm", "confirme", "confirmé",
    "tamam", "mzyan", "mezyan", "marhba", "نعم", "واخا", "صافي", "أكد", "اكد",
    "مزيان", "تمام", "موافق", "صيفط", "سيفط", "ارسل", "اه", "أه", "يه"
  ];
  return confirmWords.some((w) => cleaned === w || cleaned.startsWith(w + " ") || cleaned.endsWith(" " + w));
}

export function isGreeting(text: string): boolean {
  const lower = text.trim().toLowerCase();
  const greetings = [
    "salam", "slm", "salamo", "salut", "bonjour", "salamou", "ahlan", "salamo3laykom",
    "salam alaikom", "sbah lkhir", "msa lkhir", "cv", "ca va", "labas", "salam alaykom",
    "سلام", "السلام", "سلام عليكم", "السلام عليكم", "أهلا", "اهلا", "صباح الخير", "مساء الخير", "لاباس", "كي داير"
  ];
  return greetings.some((g) => lower === g || lower.startsWith(g + " ") || lower.endsWith(" " + g));
}

export function isExplicitPhotoRequest(text: string): boolean {
  const lower = text.trim().toLowerCase();

  // If asking about delivery, price, FAQ, location, etc. without asking for photos -> NEVER send photos!
  const nonPhotoTopics = [
    "livraison", "توصيل", "taman", "bchhal", "prix", "شحال", "ثمن", "délai",
    "wa9t", "we9tach", "fin kaynin", "fin jito", "فين كاينين", "المحل", "cuir",
    "jeld", "جلد", "hor", "naturel", "pack", "باك", "adresse", "عنوان", "مدينة"
  ];

  const hasNonPhotoTopic = nonPhotoTopics.some((topic) => lower.includes(topic));
  const hasExplicitPhotoWord = [
    "tsawer", "tasawer", "tsawr", "tsawar", "photo", "photos", "image", "images",
    "تصاور", "صور", "صيفط الصور", "صيفط التصاور"
  ].some((pw) => lower.includes(pw));

  // If asking about delivery or price, only send photos if they specifically asked for photos in that sentence
  if (hasNonPhotoTopic && !hasExplicitPhotoWord) {
    return false;
  }

  const explicitTriggers = [
    "tsawer", "tasawer", "tsawr", "tsawar", "photo", "photos", "image", "images",
    "warini", "chof", "chouf", "bghit nchof", "ari nchof", "ara nchof",
    "وريني", "شوف", "تصاور", "صور", "صيفط الصور", "صيفط التصاور", "بغيت نشوف",
    "وريني الموديلات", "وريني التصاور", "واخا وريني", "اه وريني", "ارني"
  ];

  return explicitTriggers.some((t) => lower === t || lower.includes(t));
}

export function isAskingToSeeModels(text: string): boolean {
  return isExplicitPhotoRequest(text);
}

export function isAskingPrice(text: string): boolean {
  const lower = text.toLowerCase();
  const triggers = ["taman", "prix", "chhal", "bchhal", "combien", "بشحال", "الثمن", "شحال", "ثمن"];
  return triggers.some((t) => lower.includes(t));
}

export interface BotProcessResult {
  replyText: string;
  mediaType?: "image" | "video" | "catalog";
  mediaUrl?: string;
  mediaItems?: {
    title: string;
    imageUrl: string;
    price: number;
    description?: string;
  }[];
  newFunnelState: WhatsAppFunnelState;
  updatedCapturedOrder?: WhatsAppCapturedOrder;
  orderShouldBeCreated?: boolean;
}

export function processDarijaMessage(
  incomingText: string,
  currentConversation: WhatsAppConversation,
  availableModels: WhatsAppModelMedia[],
  scripts: WhatsAppBotScripts
): BotProcessResult {
  const lowerText = incomingText.trim().toLowerCase();
  const currentCaptured = { ...(currentConversation.capturedOrder || {}) };
  const currentState = currentConversation.funnelState;

  // 1. FAQ INTERRUPTIONS (Short & human)
  if (
    lowerText.includes("cuir") ||
    lowerText.includes("jeld") ||
    lowerText.includes("jild") ||
    lowerText.includes("hor") ||
    lowerText.includes("naturel") ||
    lowerText.includes("جلد") ||
    lowerText.includes("طبيعي") ||
    lowerText.includes("واش جلد")
  ) {
    return {
      replyText: "نعم أخي، جلد البقر طبيعي 100% حر (Vachette pleine fleur). وفاش كيوصلك كتقلبو على خاطرك عاد كتخلص! 🤝",
      newFunnelState: currentState === "GREETING" ? "SHOWING_MODELS" : currentState,
      updatedCapturedOrder: currentCaptured,
    };
  }

  if (
    lowerText.includes("livraison") ||
    lowerText.includes("wa9t") ||
    lowerText.includes("we9tach") ||
    lowerText.includes("délai") ||
    lowerText.includes("توصيل") ||
    lowerText.includes("شحال الوقت") ||
    lowerText.includes("امتى")
  ) {
    return {
      replyText: "التوصيل كياخد من 24 لـ 48 ساعة فقط حتى لباب دارك، والموزع كيعيط ليك فالهاتف قبل ما يجي. 🚚",
      newFunnelState: currentState,
      updatedCapturedOrder: currentCaptured,
    };
  }

  // 2. CHECK IF CLIENT GIVES FULL ORDER IN ONE SHOT
  const detectedCity = detectMoroccanCity(incomingText);
  const detectedPhone = detectMoroccanPhone(incomingText);
  const packInfo = detectPackOrQuantity(incomingText);

  if (detectedCity) {
    currentCaptured.customerCity = detectedCity;
  }
  if (detectedPhone) {
    currentCaptured.customerPhone = detectedPhone;
  } else if (!currentCaptured.customerPhone) {
    currentCaptured.customerPhone = currentConversation.customerPhone;
  }

  // 3. STEP-BY-STEP HUMAN CONVERSATION FLOW

  // State: ORDER PLACED
  if (currentState === "ORDER_PLACED") {
    return {
      replyText: `مرحبا بك أخي ${currentCaptured.customerName || ""}! طلبك رقم #${currentCaptured.orderNumber || "ALTAJ"} راه مسجل وكيوجد دابا. إلا بغيتي أي حاجة أخرى أنا في الخدمة! 🤝`,
      newFunnelState: "ORDER_PLACED",
      updatedCapturedOrder: currentCaptured,
    };
  }

  // State: CONFIRMING ORDER (Waiting for "Oui" / "نعم")
  if (currentState === "CONFIRMING_ORDER") {
    if (isConfirmation(incomingText)) {
      currentCaptured.isConfirmed = true;
      currentCaptured.confirmedAt = new Date().toISOString();

      return {
        replyText: `🎉 صافي تم تأكيد طلبيتك بنجاح أخي ${currentCaptured.customerName || ""}!\n\nغايتصل بيك الموزع فالهاتف ديالك قبل ما يوصلك فـ 24-48 ساعة. شكراً بزاف على ثقتك أخي 🇲🇦✨`,
        newFunnelState: "ORDER_PLACED",
        updatedCapturedOrder: currentCaptured,
        orderShouldBeCreated: true,
      };
    } else {
      return {
        replyText: `واخا أخي، إلا بغيتي تبدل شي حاجة كتبها ليا، أو جاوب بـ *نعم* لتأكيد الإرسالية فوراً 🚚.`,
        newFunnelState: "CONFIRMING_ORDER",
        updatedCapturedOrder: currentCaptured,
      };
    }
  }

  // State: ASKING DETAILS (Step-by-step: Name + City first, then Address)
  if (currentState === "ASKING_DETAILS") {
    let lines = incomingText.split(/[\n,]+/).map((l) => l.trim()).filter(Boolean);

    // Check if client picked model or pack
    if (!currentCaptured.modelChosen || packInfo.isDuo) {
      currentCaptured.modelChosen = packInfo.modelName;
      currentCaptured.quantity = packInfo.quantity;
      currentCaptured.totalPrice = packInfo.price;
      currentCaptured.shippingFee = packInfo.isDuo ? 0 : 25;
    }

    if (!currentCaptured.customerCity && detectedCity) {
      currentCaptured.customerCity = detectedCity;
    }

    // Try extract name
    if (!currentCaptured.customerName || currentCaptured.customerName.includes("بغيت") || currentCaptured.customerName.includes("باك")) {
      const excludedWords = ["bghit", "pack", "rue", "زنقة", "حي", "شارع", "بغيت", "باك", "ديو", "جوج", "حبة", "واحد", "سلام", "شكرا", "oui", "نعم", "واخا", "مزيان", "أه", "اه", "مارون", "كحل", "اسود"];
      const potentialName = lines.find(
        (l) =>
          l.length > 2 &&
          l.length < 30 &&
          !detectMoroccanCity(l) &&
          !detectMoroccanPhone(l) &&
          !excludedWords.some((w) => l.toLowerCase().includes(w))
      );
      if (potentialName) {
        currentCaptured.customerName = potentialName;
      } else if (currentConversation.customerName && currentConversation.customerName !== "Client WhatsApp" && currentConversation.customerName !== "Prospect WhatsApp" && !excludedWords.some((w) => currentConversation.customerName.toLowerCase().includes(w))) {
        currentCaptured.customerName = currentConversation.customerName;
      }
    }

    // Address
    if (!currentCaptured.customerAddress && (lowerText.includes("rue") || lowerText.includes("hay") || lowerText.includes("زنقة") || lowerText.includes("حي") || lowerText.includes("شارع") || lines.length > 1)) {
      const addressLine = lines.find((l) => l !== currentCaptured.customerName && l !== currentCaptured.customerCity);
      if (addressLine) {
        currentCaptured.customerAddress = addressLine;
      } else {
        currentCaptured.customerAddress = incomingText;
      }
    }

    // If we have City AND Address -> Ready for confirmation
    if (currentCaptured.customerCity && currentCaptured.customerAddress) {
      const name = currentCaptured.customerName || "أخي الكريم";
      const city = currentCaptured.customerCity;
      const addr = currentCaptured.customerAddress;
      const model = currentCaptured.modelChosen || "Pack Duo ALTAJ";
      const total = currentCaptured.totalPrice || 200;
      const shipping = (currentCaptured.shippingFee || 0) === 0 ? "مجاني (0 درهم)" : "25 درهم";

      return {
        replyText: `📦 ها تفاصيل طلبيتك أخي:\n👤 الاسم: ${name}\n📍 المدينة: ${city}\n🏠 العنوان: ${addr}\n💼 الطلبية: ${model}\n💰 المجموع: ${total} درهم (الدفع عند الاستلام)\n🚚 التوصيل: ${shipping}\n\n👉 *واش نأكدو ليك الإرسالية دابا؟* (جاوب بـ *نعم* أو *Oui*) 🤝`,
        newFunnelState: "CONFIRMING_ORDER",
        updatedCapturedOrder: currentCaptured,
      };
    } else if (!currentCaptured.customerCity) {
      return {
        replyText: `الله يحفظك أخي! عافاك صيفط ليا غير *الاسم الكامل* ديالك و*المدينة* فين كاين؟ 📍`,
        newFunnelState: "ASKING_DETAILS",
        updatedCapturedOrder: currentCaptured,
      };
    } else {
      return {
        replyText: `مرحبا بناس ${currentCaptured.customerCity}! 📍 بقى لينا غير *العنوان أو اسم الحي* فين باغي يوصلك البزطام؟ 🏠`,
        newFunnelState: "ASKING_DETAILS",
        updatedCapturedOrder: currentCaptured,
      };
    }
  }

  // State: OFFER PITCH (Client asks price or picked a color)
  const isColorChoice =
    lowerText.includes("marron") ||
    lowerText.includes("noir") ||
    lowerText.includes("كحل") ||
    lowerText.includes("اسود") ||
    lowerText.includes("أسود") ||
    lowerText.includes("بني") ||
    lowerText.includes("black");

  if (currentState === "OFFER_PITCH" || isAskingPrice(incomingText) || isColorChoice) {
    currentCaptured.modelChosen = packInfo.modelName;
    currentCaptured.quantity = packInfo.quantity;
    currentCaptured.totalPrice = packInfo.price;
    currentCaptured.shippingFee = packInfo.isDuo ? 0 : 25;

    // If client already gave city or address or explicitly asked for pack
    if (detectedCity || lowerText.includes("pack") || lowerText.includes("joj") || lowerText.includes("bghit")) {
      return {
        replyText: `اختيار ممتاز أخي! 🎉\n\nعافاك صيفط ليا غير *الاسم ديالك* و*المدينة* باش نوجدو ليك الإرسالية؟ 📍`,
        newFunnelState: "ASKING_DETAILS",
        updatedCapturedOrder: currentCaptured,
      };
    }

    // Short pitch
    return {
      replyText: `بصحتك أخي! 👌\n• حبة واحدة: *119 درهم* (+25 درهم توصيل)\n🔥 *أحسن عرض (PACK DUO)*: كاتاخد 2 بزاطم بـ *200 درهم فقط* والتوصيل *مجاني فابور* لدارك! 🚚\n\nواش نوجدو ليك حبة وحدة ولا العرض ديال جوج (Pack Duo)؟`,
      newFunnelState: "ASKING_DETAILS",
      updatedCapturedOrder: currentCaptured,
    };
  }

  // State: SHOWING MODELS (Only when client explicitly asks to see models or photos)
  if (isAskingToSeeModels(incomingText)) {
    const catalogItems = availableModels.slice(0, 2).map((m) => ({
      title: m.name,
      imageUrl: m.photos[0] || "/images/products/altaj-classic-brown-front.jpg",
      price: m.price,
      description: m.name.includes("NOIR") ? "أسود ملكي فاخر" : "مارون كلاسيك أصيل",
    }));

    return {
      replyText: `مرحبا بك أخي! عندنا 2 ألوان كيحمقو مخدومين باليد بجلد البقر الحر 100%: مارون كلاسيك وأسود ملكي. هاهما الصور ديالهم 👇\n\nشمن لون عجبك فيهم؟`,
      mediaType: "catalog",
      mediaItems: catalogItems,
      newFunnelState: "OFFER_PITCH",
      updatedCapturedOrder: currentCaptured,
    };
  }

  // Initial Greeting or Any Repeated Greeting (Keep it strictly short and human, 0 photos, 0 price spam)
  if (isGreeting(incomingText)) {
    return {
      replyText: `وعليكم السلام ورحمة الله أخي مرحبا بك عند ALTAJ LEATHER 👑! شفتي الإعلان ديال البزطام جلد طبيعي؟ واش بغيتي تشوف صور الموديلات ولا عندك شي سؤال؟`,
      newFunnelState: "SHOWING_MODELS",
      updatedCapturedOrder: currentCaptured,
    };
  }

  // Default: Fallback short human prompt
  return {
    replyText: `مرحبا بك أخي عند ALTAJ LEATHER 👑! واش بغيتي تشوف صور الموديلات ولا نوجدو ليك الطلبية ديالك؟`,
    newFunnelState: "SHOWING_MODELS",
    updatedCapturedOrder: currentCaptured,
  };
}

export async function processDarijaMessageAsync(
  incomingText: string,
  currentConversation: WhatsAppConversation,
  availableModels: WhatsAppModelMedia[],
  scripts: WhatsAppBotScripts,
  aiConfig?: {
    enabled?: boolean;
    customPrompt?: string;
    modelName?: string;
  }
): Promise<BotProcessResult> {
  // If AI is enabled (default is true if GEMINI_API_KEY is present)
  if (aiConfig?.enabled !== false && process.env.GEMINI_API_KEY) {
    try {
      const geminiResult = await askGeminiDarija(
        incomingText,
        currentConversation,
        aiConfig?.customPrompt,
        aiConfig?.modelName || "gemini-flash-latest"
      );

      if (geminiResult && geminiResult.reply) {
        const currentCaptured: WhatsAppCapturedOrder = { ...(currentConversation.capturedOrder || {}) };

        // Update details if Gemini detected them
        if (geminiResult.detectedCity) {
          currentCaptured.customerCity = geminiResult.detectedCity;
        }
        if (
          geminiResult.detectedName &&
          !geminiResult.detectedName.includes("بغيت") &&
          !geminiResult.detectedName.includes("باك")
        ) {
          currentCaptured.customerName = geminiResult.detectedName;
        }
        if (geminiResult.detectedAddress) {
          currentCaptured.customerAddress = geminiResult.detectedAddress;
        }

        if (geminiResult.chosenPack === "DUO") {
          currentCaptured.modelChosen = "PACK DUO — ALTAJ (2 Portefeuilles Cuir)";
          currentCaptured.quantity = 2;
          currentCaptured.totalPrice = 200;
          currentCaptured.shippingFee = 0;
        } else if (geminiResult.chosenPack === "SINGLE_NOIR") {
          currentCaptured.modelChosen = "ALTAJ SIGNATURE — NOIR";
          currentCaptured.quantity = 1;
          currentCaptured.totalPrice = 119;
          currentCaptured.shippingFee = 25;
        } else if (geminiResult.chosenPack === "SINGLE_MARRON") {
          currentCaptured.modelChosen = "ALTAJ CLASSIC — MARRON";
          currentCaptured.quantity = 1;
          currentCaptured.totalPrice = 119;
          currentCaptured.shippingFee = 25;
        }

        // Determine funnel state from intent
        let nextState: WhatsAppFunnelState = currentConversation.funnelState;
        if (geminiResult.intent === "GREETING") nextState = "SHOWING_MODELS";
        else if (geminiResult.intent === "SHOW_PHOTOS") nextState = "OFFER_PITCH";
        else if (geminiResult.intent === "ASK_PRICE" || geminiResult.intent === "CHOOSE_COLOR") nextState = "ASKING_DETAILS";
        else if (geminiResult.intent === "PROVIDE_DETAILS") nextState = "CONFIRMING_ORDER";
        else if (geminiResult.intent === "CONFIRM_ORDER" || geminiResult.isConfirmed) nextState = "ORDER_PLACED";

        const orderShouldBeCreated = Boolean(geminiResult.isConfirmed || geminiResult.intent === "CONFIRM_ORDER");
        if (orderShouldBeCreated) {
          currentCaptured.isConfirmed = true;
          currentCaptured.confirmedAt = new Date().toISOString();
        }

        let mediaItems: any[] | undefined;
        let mediaType: "catalog" | undefined;

        // CRITICAL RULE: Photos sent ONLY if explicitly requested by client!
        const clientAskedForPhotos = isExplicitPhotoRequest(incomingText);
        if (clientAskedForPhotos) {
          mediaType = "catalog";
          mediaItems = availableModels.slice(0, 2).map((m) => ({
            title: m.name,
            imageUrl: m.photos[0] || "/images/products/altaj-classic-brown-front.jpg",
            price: m.price,
            description: m.name.includes("NOIR") ? "أسود ملكي فاخر" : "مارون كلاسيك أصيل",
          }));
        }

        return {
          replyText: geminiResult.reply,
          mediaType,
          mediaItems,
          newFunnelState: nextState,
          updatedCapturedOrder: currentCaptured,
          orderShouldBeCreated,
        };
      }
    } catch (e: any) {
      console.warn("[DarijaEngine] Gemini AI failed, falling back to rule engine:", e.message);
    }
  }

  // Fallback to deterministic rule engine
  return processDarijaMessage(incomingText, currentConversation, availableModels, scripts);
}
