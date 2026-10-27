import {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppModelMedia,
  WhatsAppBotConfig,
  WhatsAppCapturedOrder,
  Order,
} from "@/types";
import { createOrder, getOrders } from "@/lib/db/store";
import { processDarijaMessage, processDarijaMessageAsync } from "./darijaEngine";

const STORAGE_KEYS = {
  WA_CONVERSATIONS: "altaj_wa_conversations_v3_clean",
  WA_MODELS: "altaj_wa_models_v3_clean",
  WA_CONFIG: "altaj_wa_config_v3_clean",
};

export function purgeAllWhatsAppSampleData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("altaj_wa_conversations_v2");
    localStorage.removeItem("altaj_wa_conversations_v3_clean");
    localStorage.removeItem("altaj_wa_config_v2");
    localStorage.removeItem("altaj_wa_config_v3_clean");
  }
}


export const INITIAL_WA_MODELS: WhatsAppModelMedia[] = [
  {
    id: "wa-mod-1",
    name: "ALTAJ CLASSIC — MARRON",
    slug: "altaj-classic-marron",
    badge: "BEST-SELLER ⭐",
    price: 119,
    compareAtPrice: 169,
    packDuoPrice: 200,
    darijaDescription: "جلد البقر طبيعي 100% ممتاز (Vachette pleine fleur) تاناج نباتي حر في فاس، خياطة يدوية متقونة بالخيط المشمع، كايصبر لسنوات طويلة وفيه بلاصة مخصصة للأوراق النقدية 200 درهم وبطاقات البنك.",
    photos: [
      "/images/products/altaj-classic-brown-front.jpg",
      "/images/products/altaj-classic-brown-open.jpg",
      "/images/products/altaj-classic-brown-interior.jpg",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoCaption: "فيديو توضيحي: جودة الجلد الطبيعي وتفاصيل الخياطة اليدوية لبزطام ALTAJ",
    isAvailable: true,
    autoSendOnGreeting: true,
    order: 1,
  },
  {
    id: "wa-mod-2",
    name: "ALTAJ SIGNATURE — NOIR",
    slug: "altaj-signature-noir",
    badge: "ÉLÉGANT & MODERNE",
    price: 119,
    compareAtPrice: 169,
    packDuoPrice: 200,
    darijaDescription: "اللون الأسود الملكي مع خياطة حمراء راقية، جلد رطب وصحيح بزاف، كايعطي هيبة وأناقة خاصة. مقاوم للخدوش ومثالي للاستعمال اليومي.",
    photos: [
      "/images/products/altaj-noir-front.jpg",
      "/images/products/altaj-noir-open.jpg",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    videoCaption: "استعراض البزطام الأسود الفاخر من الداخل والخارج",
    isAvailable: true,
    autoSendOnGreeting: true,
    order: 2,
  },
  {
    id: "wa-mod-3",
    name: "PACK DUO PRESTIGE (2 Portefeuilles)",
    slug: "pack-duo-altaj",
    badge: "🔥 العرض الأكثر طلباً — توصيل مجاني",
    price: 200,
    compareAtPrice: 338,
    packDuoPrice: 200,
    darijaDescription: "خيار الأغلبية: كاتاخد 2 ببياسات (1 مارون كلاسيك + 1 كحل أنيق) أو لونين حسب اختيارك بـ 200 درهم فقط عوض 338 درهم، والتوصيل فابور حتى لدارك مع إمكانية المعاينة قبل الدفع!",
    photos: [
      "/images/products/altaj-classic-brown-front.jpg",
      "/images/products/altaj-noir-front.jpg",
      "/images/products/altaj-classic-brown-open.jpg",
    ],
    isAvailable: true,
    autoSendOnGreeting: true,
    order: 3,
  },
];

export const INITIAL_WA_CONFIG: WhatsAppBotConfig = {
  isConnected: false,
  connectionMethod: "QR_CODE",
  connectedNumber: "",
  connectedDeviceName: "WhatsApp Mobile",
  autoReplyEnabled: true,
  autoSendMediaOnAdArrival: true,
  darijaTone: "FRIENDLY_SALES",
  aiProvider: "GEMINI_AI",
  aiModel: "gemini-flash-latest",
  aiCustomSystemPrompt: `أنت المساعد التجاري الذكي لمتجر "ALTAJ LEATHER" المتخصص في البزاطم الرجالية المصنوعة 100% يدوياً بجلد البقر الطبيعي الأصيل (Vachette pleine fleur) بمدينة فاس.

طريقة الكلام والأسلوب:
1. تكلم بالدارجة المغربية الحقيقية اليومية المهذبة (مثل بائع محترف ودود في واتساب).
2. افهم كل أشكال الدارجة: سواء كتبت بالحروف العربية، أو بالعرنسية/أرابيزي (ch, kh, 3, 7, 9 مثل: "shem loun kyn", "wax jeld hor", "fin kaynin f casa", "3afak bchhal zoj").
3. ردودك يجب أن تكون قصيرة جداً (جملة أو جملتين فقط كحد أقصى)! لا ترسل فقرات طويلة أبداً لتبدو إنساناً حقيقياً.
4. اذهب مع الزبون خطوة بخطوة:
   - عند التحية ("سلام", "Salam"): رحب به باختصار وسله إن كان يريد رؤية صور الموديلات (بدون صور).
   - إرسال الصور: يتم إرسال صور الموديلات فقط وفقط إذا طلب الزبون صراحة رؤية الصور أو الموديلات ("وريني التصاور", "صيفط الصور", "bghit nchof tsawer", "photos", "وريني", "شوف").
   - ممنوع إرسال الصور إذا سأل الزبون عن التوصيل أو ثمن التوصيل ("livraison", "شحال التوصيل") أو الثمن العام أو الجلد، أجب فقط عن سؤاله كتابياً باختصار!
   - عند السؤال عن الثمن أو اختيار اللون ("بشحال", "taman", "عجبني المارون"): اعرض عليه الأسعار باختصار:
     • حبة واحدة: 119 درهم (+25 درهم توصيل).
     • 🔥 أحسن عرض (Pack Duo): 2 بزاطم بـ 200 درهم فقط والتوصيل بالمجان (0 درهم).
     واسأله هل يريد حبة واحدة أم العرض ديال جوج (Pack Duo).
   - عند اختيار العرض: اطلب الاسم الكامل والمدينة.
   - بعد المدينة: اطلب العنوان أو اسم الحي.
   - بعد العنوان: لخص له الطلبية واسأله للتأكيد (جاوب بـ نعم أو Oui).
   - عند التأكيد ("نعم", "oui", "صافي", "أكد"): شكره وأخبره أن الطلبية تسجلت وسيتصل به الموزع في 24-48 ساعة.
5. الأجوبة السريعة (FAQ - بدون إرسال صور نهائياً):
   - الجلد: جلد بقر طبيعي حر 100%، ويقلب السلعة عند الاستلام عاد يخلص.
   - التوصيل وثمنه: التوصيل 25 درهم للحبة الواحدة، ومجاني فابور (0 درهم) مع عرض Pack Duo (2 بزاطم)، وكياخد من 24 لـ 48 ساعة فقط حتى لباب الدار.
   - المحل: المعمل في فاس وكنصيفطو ديريكت للدار في جميع المدن والدفع عند الاستلام بعد المعاينة.`,
  scripts: {
    greeting: "مرحباً بك أخي الكريم عند *ALTAJ LEATHER* 👑 الصانع المغربي للبزاطم المصنوعة 100% يدوياً بالجلد الطبيعي الأصيل.",
    catalogIntro: "📸 ها هما الموديلات المتوفرة حالياً اللي شفتي في الإعلان ديالنا بالصور الواضحة وتفاصيل الجلد من الداخل:",
    pricingOffer: "💰 *أثمنة العروض الخاصة بالإعلان:*\n• 1 بزطام جلد طبيعي: *119 درهم* (+25 درهم مصاريف التوصيل)\n🔥 *أحسن عرض (PACK DUO)*: خذ 2 بزاطم بـ *200 درهم فقط* وربح *التوصيل بالمجان* لجميع مدن المغرب! 🚚\n\nالدفع عند الاستلام كايتم بعدما تقلب البياسة ديالك وتأكد من الجلد بنفسك! 🤝",
    askAddress: "باش نوجدو ليك الإرسالية ونحجزو ليك العرض، عافاك صيفط لينا غير:\n1️⃣ الاسم الكامل\n2️⃣ المدينة\n3️⃣ العنوان أو اسم الحي",
    orderConfirmationPrompt: "واش نأكدو ليك الإرسالية دابا؟ (جاوب بـ نعم أو Oui)",
    orderConfirmedSuccess: "تم تأكيد طلبيتك بنجاح أخي الكريم!",
    faqRealLeather: "نعم أخي الكريم، كاضمنو ليك بلي الجلد *طبيعي 100% حر* (Vachette pleine fleur) مدبوغ في مدينة فاس. عند الاستلام، كتقلب البزطام على خاطرك وتشوف ريحة الجلد وملمسه عاد تخلص الموزع! 🛡️✨",
    faqDeliveryTime: "🚚 مدة التوصيل سريعة جداً: من *24 إلى 48 ساعة* فقط كايوصلك حتى لباب دارك أو المقر ديالك أينما كنت في المغرب، والموزع كايتاصل بيك في الهاتف قبل ما يجي لعندك.",
    faqGuarantee: "🤝 عندنا *ضمان الرضا 100%*: كتقلب السلعة ديالك فاش يوصلك الموزع، وإلا ما عجبكش البزطام أو ما لقيتيش فيه المواصفات كترجعو بدون أي مصاريف إضافية!",
  },
  metaCloudConfig: {
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    verifyToken: "altaj_wa_token_secret_2026",
    webhookUrl: "https://altajleather.ma/api/whatsapp/webhook",
  },
};

// Start with 100% real empty conversations (NO SAMPLE / MOCK DATA)
export const INITIAL_WA_CONVERSATIONS: WhatsAppConversation[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStored<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

function getFs() {
  if (typeof window === "undefined") {
    try {
      return eval("require")("fs");
    } catch {}
  }
  return null;
}

function getPath() {
  if (typeof window === "undefined") {
    try {
      return eval("require")("path");
    } catch {}
  }
  return null;
}

function loadServerJson<T>(filename: string, fallback: T): T {
  if (isBrowser()) return fallback;
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) return fallback;
  try {
    const filePath = path.join(process.cwd(), "data", filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {}
  return fallback;
}

function saveServerJson<T>(filename: string, data: T): void {
  if (isBrowser()) return;
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) return;
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving server json:", e);
  }
}

// -------------------------------------------------------------
// WHATSAPP REPOSITORY & METHODS
// -------------------------------------------------------------
let memoryConversations: WhatsAppConversation[] = [];
let memoryModels = [...INITIAL_WA_MODELS];
let memoryConfig = { ...INITIAL_WA_CONFIG };

export function getWhatsAppConversations(): WhatsAppConversation[] {
  if (isBrowser()) {
    return getStored<WhatsAppConversation[]>(STORAGE_KEYS.WA_CONVERSATIONS, INITIAL_WA_CONVERSATIONS);
  }
  if (memoryConversations.length === 0) {
    memoryConversations = loadServerJson<WhatsAppConversation[]>("whatsapp-conversations.json", [...INITIAL_WA_CONVERSATIONS]);
  }
  return memoryConversations;
}

export function saveWhatsAppConversations(conversations: WhatsAppConversation[]): void {
  if (isBrowser()) {
    setStored(STORAGE_KEYS.WA_CONVERSATIONS, conversations);
  }
  memoryConversations = conversations;
  if (!isBrowser()) {
    saveServerJson("whatsapp-conversations.json", conversations);
  }
}

export function getWhatsAppModels(): WhatsAppModelMedia[] {
  if (isBrowser()) {
    return getStored<WhatsAppModelMedia[]>(STORAGE_KEYS.WA_MODELS, INITIAL_WA_MODELS);
  }
  return loadServerJson<WhatsAppModelMedia[]>("whatsapp-models.json", memoryModels);
}

export function saveWhatsAppModels(models: WhatsAppModelMedia[]): void {
  if (isBrowser()) {
    setStored(STORAGE_KEYS.WA_MODELS, models);
  }
  memoryModels = models;
  if (!isBrowser()) {
    saveServerJson("whatsapp-models.json", models);
  }
}

export function getWhatsAppConfig(): WhatsAppBotConfig {
  if (isBrowser()) {
    return getStored<WhatsAppBotConfig>(STORAGE_KEYS.WA_CONFIG, INITIAL_WA_CONFIG);
  }
  return memoryConfig;
}

export function saveWhatsAppConfig(config: WhatsAppBotConfig): void {
  if (isBrowser()) {
    setStored(STORAGE_KEYS.WA_CONFIG, config);
  }
  memoryConfig = config;
}

// -------------------------------------------------------------
// LIVE MESSAGE RECEIVER & DARIJA BOT PROCESSING
// -------------------------------------------------------------
export async function receiveIncomingCustomerMessage(
  phone: string,
  customerName: string,
  messageText: string,
  utmSource = "Meta Ads",
  utmCampaign = "CAMPAIGN_WALLET_DARIJA"
): Promise<{ conversation: WhatsAppConversation; botReplyMessage?: WhatsAppMessage; createdOrder?: Order }> {
  const conversations = getWhatsAppConversations();
  const models = getWhatsAppModels();
  const config = getWhatsAppConfig();

  let conversation = conversations.find((c) => c.customerPhone === phone);

  if (!conversation) {
    conversation = {
      id: `conv-${Date.now()}`,
      customerPhone: phone,
      customerName: customerName || "Prospect WhatsApp",
      lastMessage: messageText,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      botActive: true,
      funnelState: "GREETING",
      tags: [utmSource, "Nouveau Lead"],
      utmSource,
      utmCampaign,
      messages: [],
    };
  }

  // Append user message
  const userMsg: WhatsAppMessage = {
    id: `msg-${Date.now()}`,
    conversationId: conversation.id,
    sender: "CUSTOMER",
    text: messageText,
    timestamp: new Date().toISOString(),
    status: "READ",
  };
  conversation.messages.push(userMsg);
  conversation.lastMessage = messageText;
  conversation.lastMessageAt = new Date().toISOString();

  let botReplyMessage: WhatsAppMessage | undefined;
  let createdOrder: Order | undefined;

  // Process through Darija Bot (Gemini AI + Rule Fallback)
  if (config.autoReplyEnabled && conversation.botActive) {
    const processResult = await processDarijaMessageAsync(
      messageText,
      conversation,
      models,
      config.scripts,
      {
        enabled: config.aiProvider !== "RULES_ONLY",
        customPrompt: config.aiCustomSystemPrompt,
        modelName: config.aiModel || "gemini-flash-latest",
      }
    );

    // Update conversation state
    conversation.funnelState = processResult.newFunnelState;
    if (processResult.updatedCapturedOrder) {
      conversation.capturedOrder = processResult.updatedCapturedOrder;
      if (processResult.updatedCapturedOrder.customerName) {
        conversation.customerName = processResult.updatedCapturedOrder.customerName;
      }
    }

    // Did the bot confirm and place an order?
    if (processResult.orderShouldBeCreated && conversation.capturedOrder) {
      const captured = conversation.capturedOrder;
      const isDuo = (captured.quantity || 1) >= 2;

      // Call store's createOrder
      try {
        const orderData = {
          customerName: captured.customerName || conversation.customerName,
          customerPhone: captured.customerPhone || conversation.customerPhone,
          customerAddress: captured.customerAddress || "Adresse à confirmer",
          customerCity: captured.customerCity || "Casablanca",
          notes: `[Commande Capturée WhatsApp Bot] Modèle: ${captured.modelChosen || "ALTAJ Cuir"}`,
          items: [
            {
              productId: isDuo ? "prod-1" : "prod-1",
              productName: captured.modelChosen || "Portefeuille ALTAJ Cuir Véritable",
              productImage: "/images/products/altaj-classic-brown-front.jpg",
              quantity: captured.quantity || 1,
              unitPrice: isDuo ? 100 : 119,
              totalPrice: captured.totalPrice || (isDuo ? 200 : 119),
              bundleName: isDuo ? "Pack Duo (2 Portefeuilles)" : undefined,
            },
          ],
          subtotal: captured.totalPrice || 200,
          shippingFee: captured.shippingFee ?? (isDuo ? 0 : 25),
          utmSource: conversation.utmSource || "WhatsApp Bot",
          utmCampaign: conversation.utmCampaign || "Organic",
        };

        const newOrder = createOrder(orderData);
        createdOrder = newOrder;

        captured.orderId = newOrder.id;
        captured.orderNumber = newOrder.orderNumber;
        conversation.tags = Array.from(new Set([...conversation.tags, "Commande-Confirmée", captured.customerCity || "Maroc"]));
      } catch (e) {
        console.error("Error creating order from WhatsApp:", e);
      }
    }

    // Build bot reply message
    botReplyMessage = {
      id: `msg-${Date.now() + 1}`,
      conversationId: conversation.id,
      sender: "BOT",
      text: processResult.replyText,
      mediaType: processResult.mediaType,
      mediaUrl: processResult.mediaUrl,
      mediaItems: processResult.mediaItems,
      timestamp: new Date().toISOString(),
      status: "SENT",
    };

    conversation.messages.push(botReplyMessage);
    conversation.lastMessage = botReplyMessage.text.slice(0, 70) + "...";
    conversation.lastMessageAt = new Date().toISOString();
  }

  // Update storage
  const updatedConversations = [
    conversation,
    ...conversations.filter((c) => c.id !== conversation!.id),
  ];
  saveWhatsAppConversations(updatedConversations);

  return { conversation, botReplyMessage, createdOrder };
}

// -------------------------------------------------------------
// AGENT / MANUAL MESSAGE SEND
// -------------------------------------------------------------
export function sendAgentMessage(
  conversationId: string,
  text: string,
  mediaUrl?: string,
  mediaType?: "image" | "video"
): WhatsAppConversation | null {
  const conversations = getWhatsAppConversations();
  const convIndex = conversations.findIndex((c) => c.id === conversationId);
  if (convIndex === -1) return null;

  const conv = conversations[convIndex];
  const newMsg: WhatsAppMessage = {
    id: `msg-${Date.now()}`,
    conversationId: conv.id,
    sender: "AGENT",
    text,
    mediaUrl,
    mediaType,
    timestamp: new Date().toISOString(),
    status: "SENT",
  };

  conv.messages.push(newMsg);
  conv.lastMessage = text;
  conv.lastMessageAt = new Date().toISOString();

  conversations[convIndex] = conv;
  saveWhatsAppConversations(conversations);
  return conv;
}

export function toggleBotForConversation(conversationId: string, botActive: boolean): WhatsAppConversation | null {
  const conversations = getWhatsAppConversations();
  const conv = conversations.find((c) => c.id === conversationId);
  if (!conv) return null;

  conv.botActive = botActive;
  if (!botActive) {
    conv.funnelState = "HUMAN_TAKEOVER";
  }
  saveWhatsAppConversations(conversations);
  return conv;
}

// -------------------------------------------------------------
// METRICS & KPIS CALCULATOR
// -------------------------------------------------------------
export function getWhatsAppMetrics() {
  const conversations = getWhatsAppConversations();
  const orders = getOrders();

  // Find all orders linked to WhatsApp
  const waOrders = orders.filter(
    (o) =>
      o.utmSource === "WhatsApp" ||
      o.utmSource === "WhatsApp Bot" ||
      o.utmSource?.includes("Facebook") ||
      o.utmSource?.includes("TikTok") ||
      o.notes?.includes("WhatsApp") ||
      o.orderNumber?.startsWith("ALTAJ-1029") ||
      o.orderNumber?.startsWith("ALTAJ-1030")
  );

  const totalConversations = conversations.length;
  const capturedConfirmedOrders = conversations.filter(
    (c) => c.capturedOrder && c.capturedOrder.isConfirmed
  ).length;

  const totalWhatsAppRevenue = conversations.reduce((acc, c) => {
    if (c.capturedOrder && c.capturedOrder.isConfirmed) {
      return acc + (c.capturedOrder.totalPrice || 0);
    }
    return acc;
  }, 0);

  const conversionRate = totalConversations > 0 ? (capturedConfirmedOrders / totalConversations) * 100 : 0;
  const averageOrderValue = capturedConfirmedOrders > 0 ? totalWhatsAppRevenue / capturedConfirmedOrders : 0;

  // City breakdown
  const cityCounts: Record<string, { count: number; revenue: number }> = {};
  conversations.forEach((c) => {
    if (c.capturedOrder && c.capturedOrder.isConfirmed && c.capturedOrder.customerCity) {
      const city = c.capturedOrder.customerCity;
      if (!cityCounts[city]) {
        cityCounts[city] = { count: 0, revenue: 0 };
      }
      cityCounts[city].count += 1;
      cityCounts[city].revenue += c.capturedOrder.totalPrice || 0;
    }
  });

  const cityBreakdown = Object.entries(cityCounts).map(([city, data]) => ({
    city,
    orders: data.count,
    revenue: data.revenue,
  })).sort((a, b) => b.orders - a.orders);

  // Model Popularity
  const modelStats: Record<string, number> = {
    "Pack Duo (2 Portefeuilles)": 0,
    "ALTAJ Classic Marron": 0,
    "ALTAJ Signature Noir": 0,
  };

  conversations.forEach((c) => {
    if (c.capturedOrder?.isConfirmed) {
      const model = c.capturedOrder.modelChosen || "";
      if (model.includes("PACK") || model.includes("Duo") || (c.capturedOrder.quantity || 1) >= 2) {
        modelStats["Pack Duo (2 Portefeuilles)"] += 1;
      } else if (model.includes("NOIR") || model.includes("Noir")) {
        modelStats["ALTAJ Signature Noir"] += 1;
      } else {
        modelStats["ALTAJ Classic Marron"] += 1;
      }
    }
  });

  return {
    totalConversations,
    capturedConfirmedOrders,
    totalWhatsAppRevenue,
    conversionRate: Math.round(conversionRate * 10) / 10,
    averageOrderValue: Math.round(averageOrderValue),
    cityBreakdown,
    modelStats,
    waOrders,
  };
}
