import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder, deleteOrder } from "@/lib/db/store";
import { getWhatsAppConversations, saveWhatsAppConversations } from "@/lib/whatsapp/store";
import { Order } from "@/types";

export async function GET() {
  try {
    const orders = getOrders();
    const waConvs = getWhatsAppConversations();

    const waOrders: Order[] = [];
    for (const c of waConvs) {
      if (c.capturedOrder && c.capturedOrder.isConfirmed) {
        const o = c.capturedOrder;
        const exists = orders.some(
          (ex) => ex.orderNumber === o.orderNumber || (ex.id && ex.id === o.orderId)
        );
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
                productImage: "/images/products/altaj-classic-brown-front.jpg",
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

    return NextResponse.json([...waOrders, ...orders]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrder = createOrder(body);
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

    // 2. Also unconfirm / remove from WhatsApp conversation capturedOrder
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
