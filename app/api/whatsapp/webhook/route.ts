import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppConfig, receiveIncomingCustomerMessage } from "@/lib/whatsapp/store";

// Verification Endpoint for Meta WhatsApp Cloud API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const config = getWhatsAppConfig();
  const expectedToken = config.metaCloudConfig?.verifyToken || "altaj_wa_token_secret_2026";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[WhatsApp Webhook Verified]");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

// Inbound Message Webhook (supports Meta Cloud API and QR Webhook Gateway format)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Check if Meta Cloud API Payload format
    if (body.object === "whatsapp_business_account" && body.entry) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value?.messages) {
            for (const msg of value.messages) {
              const fromPhone = msg.from; // e.g. "212661234567"
              const senderName = value.contacts?.[0]?.profile?.name || "Client WhatsApp";
              const text = msg.text?.body || msg.button?.text || "";

              if (text) {
                await receiveIncomingCustomerMessage(
                  fromPhone,
                  senderName,
                  text,
                  "WhatsApp Cloud API",
                  "META_DIRECT"
                );
              }
            }
          }
        }
      }
      return NextResponse.json({ status: "success" });
    }

    // 2. Custom QR Gateway / Baileys format
    // e.g. { phone: "212661234567", name: "Hassan", message: "Salam bghit nchof" }
    if (body.phone && (body.message || body.text)) {
      const phone = body.phone;
      const name = body.name || "Client WhatsApp";
      const text = body.message || body.text;
      const utmSource = body.utmSource || "WhatsApp Web QR";

      const result = await receiveIncomingCustomerMessage(phone, name, text, utmSource);
      return NextResponse.json({ status: "success", data: result });
    }

    return NextResponse.json({ status: "ignored" });
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
