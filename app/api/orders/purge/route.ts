import { NextRequest, NextResponse } from "next/server";
import { purgeOrders, getOrders } from "@/lib/db/store";
import { getWhatsAppConversations, saveWhatsAppConversations } from "@/lib/whatsapp/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keepDays = typeof body.keepDays === "number" ? body.keepDays : undefined;
    const onlySamples = Boolean(body.onlySamples);
    const all = Boolean(body.all);

    const result = purgeOrders({ keepDays, onlySamples, all });

    // Also unconfirm purged orders in WhatsApp conversations so they are not re-injected
    const remainingOrders = getOrders();
    const remainingIds = new Set(remainingOrders.map((o) => o.id));
    const remainingNumbers = new Set(remainingOrders.map((o) => o.orderNumber));

    const waConvs = getWhatsAppConversations();
    let modified = false;
    const updatedConvs = waConvs.map((c) => {
      if (c.capturedOrder && c.capturedOrder.isConfirmed) {
        const isRemaining =
          Boolean(c.capturedOrder.orderId && remainingIds.has(c.capturedOrder.orderId)) ||
          Boolean(c.capturedOrder.orderNumber && remainingNumbers.has(c.capturedOrder.orderNumber));
        if (!isRemaining) {
          modified = true;
          return {
            ...c,
            capturedOrder: {
              ...c.capturedOrder,
              isConfirmed: false,
            },
          };
        }
      }
      return c;
    });

    if (modified) {
      saveWhatsAppConversations(updatedConvs);
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      remainingCount: result.remainingCount,
      orders: remainingOrders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
