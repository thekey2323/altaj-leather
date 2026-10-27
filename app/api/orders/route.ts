import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder, deleteOrder, deleteOrders, purgeOrders, saveServerOrders } from "@/lib/db/store";
import { getWhatsAppConversations, saveWhatsAppConversations } from "@/lib/whatsapp/store";
import { Order } from "@/types";
import { supabase } from "@/lib/supabaseClient";

function mapFromSupabaseOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    customerCity: row.customer_city,
    courierCost: Number(row.courier_cost ?? 35),
    notes: row.notes || "",
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount ?? 0),
    shippingFee: Number(row.shipping_fee ?? 0),
    total: Number(row.total),
    status: row.status || "NEW",
    paymentMethod: row.payment_method || "COD",
    utmSource: row.utm_source || "Direct",
    utmCampaign: row.utm_campaign || "Organic",
    internalNotes: Array.isArray(row.internal_notes) ? row.internal_notes : [],
    createdAt: row.created_at,
  };
}

function mapToSupabaseOrder(o: Order) {
  return {
    id: o.id,
    order_number: o.orderNumber,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    customer_address: o.customerAddress,
    customer_city: o.customerCity,
    courier_cost: o.courierCost ?? 35,
    notes: o.notes || "",
    items: o.items || [],
    subtotal: o.subtotal,
    discount: o.discount ?? 0,
    shipping_fee: o.shippingFee ?? 0,
    total: o.total,
    status: o.status || "NEW",
    payment_method: o.paymentMethod || "COD",
    utm_source: o.utmSource || "Direct",
    utm_campaign: o.utmCampaign || "Organic",
    internal_notes: o.internalNotes || [],
    created_at: o.createdAt || new Date().toISOString(),
  };
}

export async function GET() {
  try {
    let cloudOrders: Order[] = [];
    let isCloudAvailable = false;

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        isCloudAvailable = true;
        cloudOrders = data.map(mapFromSupabaseOrder);
      }
    } catch {}

    // If Supabase Cloud is connected, it is the single source of truth!
    // If cloudOrders is empty, it means all orders were deleted - do NOT revive mock demo orders!
    if (isCloudAvailable) {
      return NextResponse.json(cloudOrders);
    }

    const localOrders = getOrders();
    return NextResponse.json(localOrders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const customerName = (rawBody.customerName || rawBody.name || "Client ALTAJ").trim();
    const customerPhone = (rawBody.customerPhone || rawBody.phone || "").trim();
    const customerAddress = (rawBody.customerAddress || rawBody.address || "Adresse non spécifiée").trim();
    const customerCity = (rawBody.customerCity || rawBody.city || "Casablanca").trim();

    let orderToSave: Order;

    if (rawBody.id && rawBody.orderNumber) {
      orderToSave = {
        ...rawBody,
        customerName,
        customerPhone,
        customerAddress,
        customerCity,
        courierCost: rawBody.courierCost ?? 35,
        subtotal: Number(rawBody.subtotal ?? rawBody.total ?? rawBody.price ?? 0),
        total: Number(rawBody.total ?? rawBody.subtotal ?? rawBody.price ?? 0),
        status: rawBody.status || "NEW",
        paymentMethod: rawBody.paymentMethod || "COD",
        createdAt: rawBody.createdAt || new Date().toISOString(),
      };
    } else {
      orderToSave = createOrder({
        ...rawBody,
        customerName,
        customerPhone,
        customerAddress,
        customerCity,
        phone: customerPhone,
        address: customerAddress,
        city: customerCity,
      });
    }

    // Save to Supabase Cloud
    try {
      const sbPayload = mapToSupabaseOrder(orderToSave);
      const { data: sbData, error: sbError } = await supabase
        .from("orders")
        .upsert(sbPayload, { onConflict: "id" })
        .select();

      if (sbError) {
        console.error("Supabase order upsert error:", sbError);
      } else {
        console.log("Supabase order saved successfully:", orderToSave.orderNumber);
      }
    } catch (sbEx) {
      console.error("Supabase exception on order save:", sbEx);
    }

    // Also update server orders cache
    try {
      const currentOrders = getOrders();
      const exists = currentOrders.some((o) => o.id === orderToSave.id);
      const updatedOrders = exists
        ? currentOrders.map((o) => (o.id === orderToSave.id ? orderToSave : o))
        : [orderToSave, ...currentOrders];
      saveServerOrders(updatedOrders);
    } catch {}

    return NextResponse.json({ success: true, order: orderToSave });
  } catch (err: any) {
    console.error("Error in POST /api/orders:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");
    const isAll = searchParams.get("all") === "true";

    let bodyData: any = null;
    try {
      bodyData = await req.json();
    } catch {}

    const targetAll = isAll || Boolean(bodyData?.all);
    const targetIds: string[] = [];

    if (id) {
      targetIds.push(id);
    }
    if (idsParam) {
      idsParam.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => targetIds.push(s));
    }
    if (Array.isArray(bodyData?.ids)) {
      bodyData.ids.map((s: any) => String(s).trim()).filter(Boolean).forEach((s: string) => targetIds.push(s));
    }

    // CASE 1: DELETE ALL ORDERS
    if (targetAll) {
      purgeOrders({ all: true });

      try {
        await supabase.from("orders").delete().gte("created_at", "1970-01-01T00:00:00Z");
      } catch (e) {
        console.warn("Supabase purge all warning:", e);
      }

      // Unconfirm all WhatsApp orders
      const waConvs = getWhatsAppConversations();
      const resetConvs = waConvs.map((c) => ({
        ...c,
        capturedOrder: c.capturedOrder ? { ...c.capturedOrder, isConfirmed: false } : undefined,
      }));
      saveWhatsAppConversations(resetConvs);

      return NextResponse.json({ success: true, all: true, message: "Toutes les commandes ont été supprimées." });
    }

    // CASE 2: DELETE SELECTED ORDERS
    if (targetIds.length > 0) {
      deleteOrders(targetIds);

      try {
        await supabase.from("orders").delete().in("id", targetIds);
        await supabase.from("orders").delete().in("order_number", targetIds);
      } catch (e) {
        console.warn("Supabase bulk delete warning:", e);
      }

      // Unconfirm matching WhatsApp convs
      const idSet = new Set(targetIds);
      const waConvs = getWhatsAppConversations();
      let modified = false;
      const updatedConvs = waConvs.map((c) => {
        if (
          c.capturedOrder &&
          (idSet.has(c.capturedOrder.orderId || "") ||
            idSet.has(c.capturedOrder.orderNumber || "") ||
            idSet.has(c.id))
        ) {
          modified = true;
          return {
            ...c,
            capturedOrder: {
              ...c.capturedOrder,
              isConfirmed: false,
            },
          };
        }
        return c;
      });

      if (modified) {
        saveWhatsAppConversations(updatedConvs);
      }

      return NextResponse.json({ success: true, deletedCount: targetIds.length, deletedIds: targetIds });
    }

    return NextResponse.json({ error: "Missing id, ids, or all=true" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
