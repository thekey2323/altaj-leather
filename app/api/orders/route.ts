import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder, deleteOrder } from "@/lib/db/store";
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
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        cloudOrders = data.map(mapFromSupabaseOrder);
      }
    } catch {}

    const localOrders = getOrders();
    const waConvs = getWhatsAppConversations();

    const waOrders: Order[] = [];
    for (const c of waConvs) {
      if (c.capturedOrder && c.capturedOrder.isConfirmed) {
        const o = c.capturedOrder;
        const exists =
          localOrders.some((ex) => ex.orderNumber === o.orderNumber || (ex.id && ex.id === o.orderId)) ||
          cloudOrders.some((ex) => ex.orderNumber === o.orderNumber || (ex.id && ex.id === o.orderId));

        if (!exists) {
          const isDuo = (o.quantity || 1) >= 2;
          waOrders.push({
            id: o.orderId || `ord-${Date.now()}`,
            orderNumber: o.orderNumber || "ALTAJ-COD",
            customerName: o.customerName || c.customerName,
            customerPhone: o.customerPhone || c.customerPhone,
            customerAddress: o.customerAddress || "Adresse WhatsApp",
            customerCity: o.customerCity || "Casablanca",
            status: "CONFIRMED",
            paymentMethod: "COD",
            createdAt: o.confirmedAt || c.lastMessageAt,
            notes: `[Commande Capturée WhatsApp Bot] Modèle: ${o.modelChosen || "Pack Duo ALTAJ"}`,
            internalNotes: [],
            items: [
              {
                id: `item-${o.orderId || Date.now()}`,
                productId: "prod-1",
                productName: o.modelChosen || "PACK DUO — ALTAJ (2 Portefeuilles Cuir)",
                productImage: "/images/products/altaj-classic-marron-custom-1.jpg",
                quantity: o.quantity || 2,
                unitPrice: isDuo ? 100 : 119,
                totalPrice: o.totalPrice || 200,
                bundleName: isDuo ? "Pack Duo (2 Portefeuilles)" : undefined,
              },
            ],
            subtotal: o.totalPrice || 200,
            shippingFee: o.shippingFee ?? 0,
            courierCost: 30,
            discount: 0,
            total: o.totalPrice || 200,
            utmSource: c.utmSource || "WhatsApp",
            utmCampaign: c.utmCampaign || "Organic",
          });
        }
      }
    }

    if (cloudOrders.length > 0) {
      // Merge unique orders
      const combined = [...cloudOrders];
      localOrders.forEach((lo) => {
        if (!combined.some((co) => co.orderNumber === lo.orderNumber || co.id === lo.id)) {
          combined.push(lo);
        }
      });
      return NextResponse.json([...waOrders, ...combined]);
    }

    return NextResponse.json([...waOrders, ...localOrders]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrder = createOrder(body);

    // Save to Supabase Cloud
    try {
      await supabase.from("orders").insert(mapToSupabaseOrder(newOrder));
    } catch (e) {
      console.warn("Supabase order insert warning:", e);
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    // 1. Delete from local DB store
    deleteOrder(id);

    // 2. Delete from Supabase
    try {
      await supabase.from("orders").delete().or(`id.eq.${id},order_number.eq.${id}`);
    } catch {}

    // 3. Unconfirm WhatsApp conv if matching
    const waConvs = getWhatsAppConversations();
    let modified = false;
    const updatedConvs = waConvs.map((c) => {
      if (
        c.capturedOrder &&
        (c.capturedOrder.orderId === id ||
          c.capturedOrder.orderNumber === id ||
          c.id === id)
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

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
