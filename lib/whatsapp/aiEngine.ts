import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  WhatsAppConversation,
  WhatsAppCapturedOrder,
  WhatsAppFunnelState,
  WhatsAppModelMedia,
} from "@/types";

if (typeof process !== "undefined" && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const DEFAULT_SYSTEM_PROMPT = `
أنت المساعد التجاري الذكي لمتجر "ALTAJ LEATHER" المتخصص في البزاطم الرجالية المصنوعة 100% يدوياً بجلد البقر الطبيعي الأصيل (Vachette pleine fleur) بمدينة فاس.

طريقة الكلام والأسلوب:
1. تكلم بالدارجة المغربية الحقيقية اليومية المهذبة والذكية (مثل بائع محترف ودود في واتساب).
2. افهم بذكاء كل أشكال الدارجة: سواء كتبت بالحروف العربية، أو بالعرنسية/أرابيزي (ch, kh, 3, 7, 9 مثل: "shem loun kyn", "wax jeld hor", "fin kaynin f casa", "3afak bchhal zoj").
3. ردودك يجب أن تكون قصيرة جداً (جملة أو جملتين فقط كحد أقصى)! لا ترسل فقرات طويلة أبداً لكي تبدو إنساناً حقيقياً.
4. اذهب مع الزبون خطوة بخطوة:
   - عند التحية ("سلام", "Salam"): رحب به باختصار وسله إن كان يريد رؤية صور الموديلات. لا ترسل الصور ولا الأثمنة الآن (shouldSendPhotos = false).
   - عند طلب رؤية الصور أو الموديلات صراحة ("وريني التصاور", "صيفط الصور", "bghit nchof tsawer", "photos", "وريني", "شوف"): أخبره باللونين واطلب اختياره، واجعل shouldSendPhotos = true.
   - إذا سأل عن التوصيل أو ثمن التوصيل ("livraison", "شحال التوصيل", "فوقاش يوصل"): أجب عن التوصيل فقط واجعل shouldSendPhotos = false قطعياً!
   - عند السؤال عن الثمن أو اختيار اللون ("بشحال", "taman", "عجبني المارون"): اعرض عليه الأسعار باختصار واجعل shouldSendPhotos = false:
     • حبة واحدة: 119 درهم (+25 درهم توصيل).
     • 🔥 أحسن عرض (Pack Duo): 2 بزاطم بـ 200 درهم فقط والتوصيل بالمجان (0 درهم).
     واسأله هل يريد حبة واحدة أم العرض ديال جوج (Pack Duo).
   - عند اختيار العرض: اطلب الاسم الكامل والمدينة.
   - بعد المدينة: اطلب العنوان أو اسم الحي.
   - بعد العنوان: لخص له الطلبية واسأله للتأكيد (جاوب بـ نعم أو Oui).
   - عند التأكيد ("نعم", "oui", "صافي", "أكد"): شكره وأخبره أن الطلبية تسجلت وسيتصل به الموزع في 24-48 ساعة، واجعل isConfirmed = true.
5. الأجوبة السريعة (FAQ - دائماً shouldSendPhotos = false):
   - الجلد: جلد بقر طبيعي حر 100%، ويقلب السلعة عند الاستلام عاد يخلص.
   - التوصيل وثمنه: التوصيل 25 درهم للحبة الواحدة، ومجاني فابور (0 درهم) مع عرض Pack Duo (2 بزاطم)، وكياخد من 24 لـ 48 ساعة فقط.
   - المحل: المعمل في فاس وكنصيفطو ديريكت للدار في جميع المدن والدفع عند الاستلام بعد المعاينة.
`;

export interface GeminiProcessResult {
  reply: string;
  intent:
    | "GREETING"
    | "SHOW_PHOTOS"
    | "ASK_PRICE"
    | "CHOOSE_COLOR"
    | "CHOOSE_PACK"
    | "PROVIDE_DETAILS"
    | "CONFIRM_ORDER"
    | "FAQ"
    | "OTHER";
  shouldSendPhotos: boolean;
  detectedCity?: string | null;
  detectedName?: string | null;
  detectedAddress?: string | null;
  chosenPack?: "DUO" | "SINGLE_MARRON" | "SINGLE_NOIR" | null;
  isConfirmed?: boolean;
}

export async function askGeminiDarija(
  incomingMessage: string,
  conversation: WhatsAppConversation,
  customInstructions?: string,
  modelName: string = "gemini-flash-latest"
): Promise<GeminiProcessResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[Gemini AI] No GEMINI_API_KEY configured.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [modelName, "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite"];

  // Deduplicate model names while preserving order
  const uniqueModels = Array.from(new Set(modelsToTry));

  // Build context
  const currentCaptured = conversation.capturedOrder || {};
  const recentHistory = conversation.messages
    .slice(-4)
    .map((m) => `${m.sender === "CUSTOMER" ? "Customer" : "Assistant"}: ${m.text}`)
    .join("\n");

  const prompt = `
${customInstructions && customInstructions.trim().length > 10 ? customInstructions : DEFAULT_SYSTEM_PROMPT}

CURRENT STATE CONTEXT:
- Funnel State: ${conversation.funnelState}
- Captured Customer Name: ${currentCaptured.customerName || "Unknown"}
- Captured City: ${currentCaptured.customerCity || "Unknown"}
- Captured Address: ${currentCaptured.customerAddress || "Unknown"}
- Chosen Model: ${currentCaptured.modelChosen || "None"}
- Quantity: ${currentCaptured.quantity || 1}
- Total Price: ${currentCaptured.totalPrice || 119} DH

RECENT CHAT HISTORY:
${recentHistory}

NEW INCOMING MESSAGE FROM CUSTOMER:
"${incomingMessage}"

OUTPUT REQUIREMENT:
Respond strictly in JSON format matching this schema:
{
  "reply": "string (natural Moroccan Darija response, 1-2 short sentences maximum, human and friendly)",
  "intent": "GREETING | SHOW_PHOTOS | ASK_PRICE | CHOOSE_COLOR | CHOOSE_PACK | PROVIDE_DETAILS | CONFIRM_ORDER | FAQ | OTHER",
  "shouldSendPhotos": true | false,
  "detectedCity": "City name if mentioned (e.g. Casablanca, Rabat, Marrakech, Tanger, etc.) or null",
  "detectedName": "Customer full name if given or null",
  "detectedAddress": "Customer address or neighborhood if given or null",
  "chosenPack": "DUO | SINGLE_MARRON | SINGLE_NOIR | null",
  "isConfirmed": true | false
}
`;

  for (const modelToUse of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelToUse,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.6,
          maxOutputTokens: 300,
        },
      });

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout 4.5s")), 4500)
        ),
      ]);

      const text = result.response.text();
      const parsed = JSON.parse(text) as GeminiProcessResult;
      if (parsed && parsed.reply) {
        console.log(`[Gemini AI Success] Model: ${modelToUse} | Intent: ${parsed.intent}`);
        return parsed;
      }
    } catch (err: any) {
      console.warn(`[Gemini AI Warning] Model ${modelToUse} failed: ${err.message}`);
    }
  }

  console.error("[Gemini AI Error] All models failed or timed out. Falling back to rule engine.");
  return null;
}
