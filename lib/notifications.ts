import { Order } from "@/types";

/**
 * Format Moroccan phone number for direct WhatsApp link
 */
function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return "212" + cleaned.substring(1);
  }
  if (!cleaned.startsWith("212") && cleaned.length === 9) {
    return "212" + cleaned;
  }
  return cleaned;
}

/**
 * Send instant Telegram notification to the store owner
 */
export async function sendTelegramOrderNotification(order: Order): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  try {
    const waPhone = formatPhoneForWhatsApp(order.customerPhone);
    const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(
      `Bonjour ${order.customerName}, nous confirmons votre commande #${order.orderNumber} chez ALTAJ LEATHER d'un montant de ${order.total} DH.`
    )}`;

    const itemsSummary = (order.items || [])
      .map((it) => `• ${it.quantity}x ${it.productName || "Article"} (${it.totalPrice} DH)`)
      .join("\n") || "• 1x Article";

    const message = `👑 *NOUVELLE COMMANDE ALTAJ !*
━━━━━━━━━━━━━━━━━━━━
📦 *N° Commande :* \`#${order.orderNumber}\`
👤 *Client :* ${order.customerName}
📱 *Téléphone :* \`${order.customerPhone}\`
📍 *Ville :* ${order.customerCity}
🏠 *Adresse :* ${order.customerAddress || "Non spécifiée"}
${order.notes ? `📝 *Notes :* ${order.notes}\n` : ""}
💰 *Total à encaisser :* *${order.total} DH* (COD)
🛍️ *Articles :*
${itemsSummary}
━━━━━━━━━━━━━━━━━━━━
💬 [Ouvrir discussion WhatsApp](${waLink})
📞 Tél : \`${order.customerPhone}\``;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[Telegram] Notification failed:", errData);
      return false;
    }

    console.log("[Telegram] Notification sent successfully for order:", order.orderNumber);
    return true;
  } catch (error) {
    console.error("[Telegram] Error sending notification:", error);
    return false;
  }
}

/**
 * Optional Discord Webhook fallback
 */
export async function sendDiscordOrderNotification(order: Order): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const waPhone = formatPhoneForWhatsApp(order.customerPhone);
    const waLink = `https://wa.me/${waPhone}`;

    const itemsSummary = (order.items || [])
      .map((it) => `• ${it.quantity}x ${it.productName || "Article"} (${it.totalPrice} DH)`)
      .join("\n") || "• 1x Article";

    const payload = {
      content: "👑 **NOUVELLE COMMANDE REÇUE SUR ALTAJ.MA !**",
      embeds: [
        {
          title: `Commande #${order.orderNumber} — ${order.total} DH`,
          color: 0x8c5e35, // Altaj royal leather color
          fields: [
            { name: "Client", value: order.customerName, inline: true },
            { name: "Téléphone", value: order.customerPhone, inline: true },
            { name: "Ville", value: order.customerCity, inline: true },
            { name: "Adresse", value: order.customerAddress || "Non spécifiée", inline: false },
            { name: "Articles", value: itemsSummary, inline: false },
            { name: "WhatsApp Client", value: `[Cliquer pour contacter](${waLink})`, inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "Altaj Moroccan Luxury Leather" },
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.error("[Discord] Notification error:", err);
    return false;
  }
}

/**
 * Dispatch notification to all configured channels
 */
export async function notifyNewOrder(order: Order): Promise<void> {
  await Promise.allSettled([
    sendTelegramOrderNotification(order),
    sendDiscordOrderNotification(order),
  ]);
}
