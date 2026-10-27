import { NextRequest, NextResponse } from "next/server";
import {
  getWhatsAppConversations,
  getWhatsAppModels,
  getWhatsAppConfig,
  getWhatsAppMetrics,
  receiveIncomingCustomerMessage,
  sendAgentMessage,
  toggleBotForConversation,
  saveWhatsAppConfig,
  saveWhatsAppModels,
} from "@/lib/whatsapp/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "metrics") {
      return NextResponse.json(getWhatsAppMetrics());
    }

    if (action === "models") {
      return NextResponse.json(getWhatsAppModels());
    }

    if (action === "config") {
      return NextResponse.json(getWhatsAppConfig());
    }

    const conversations = getWhatsAppConversations();
    const metrics = getWhatsAppMetrics();
    const config = getWhatsAppConfig();
    const models = getWhatsAppModels();

    return NextResponse.json({
      conversations,
      metrics,
      config,
      models,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Simulating or receiving a customer incoming message
    if (action === "customer_message") {
      const { phone, name, text, utmSource, utmCampaign } = body;
      const result = await receiveIncomingCustomerMessage(
        phone || "212600123456",
        name || "Prospect Ad",
        text,
        utmSource || "Facebook Ads",
        utmCampaign || "PROMO_WALLET_DARIJA"
      );
      return NextResponse.json({ success: true, ...result });
    }

    // 2. Manual Agent Reply
    if (action === "agent_reply") {
      const { conversationId, text, mediaUrl, mediaType } = body;
      const updatedConv = sendAgentMessage(conversationId, text, mediaUrl, mediaType);
      return NextResponse.json({ success: true, conversation: updatedConv });
    }

    // 3. Toggle Bot takeover
    if (action === "toggle_bot") {
      const { conversationId, botActive } = body;
      const updatedConv = toggleBotForConversation(conversationId, botActive);
      return NextResponse.json({ success: true, conversation: updatedConv });
    }

    // 4. Update Settings / Scripts
    if (action === "update_config") {
      const { config } = body;
      saveWhatsAppConfig(config);
      return NextResponse.json({ success: true, config });
    }

    // 5. Update Models
    if (action === "update_models") {
      const { models } = body;
      saveWhatsAppModels(models);
      return NextResponse.json({ success: true, models });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
