import { NextRequest, NextResponse } from "next/server";
import { purgeOrders, getOrders } from "@/lib/db/store";
import { getWhatsAppConversations, saveWhatsAppConversations } from "@/lib/whatsapp/store";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keepDays = typeof body.keepDays === "number" ? body.keepDays : undefined;
    const onlySamples = Boolean(body.onlySamples);
    const all = Boolean(body.all);

    const result = purgeOrders({ keepDays, onlySamples, all });

    // Sync deletion to Supabase
    try {
      if (all) {
        await supabase.from("orders").delete().gte("created_at", "1970-01-01T00:00:00Z");
      } else if (keepDays && keepDays > 0) {
        const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("orders").delete().lt("created_at", cutoffDate);
      }
    } catch (e) {
      console.warn("Supabase purge error:", e);
    }

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
