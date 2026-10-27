import { NextRequest, NextResponse } from "next/server";
import { getOrders, getOrderById, deleteOrder, updateOrder } from "@/lib/db/store";
import { getWhatsAppConversations, saveWhatsAppConversations } from "@/lib/whatsapp/store";
import { Order } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // 1. Check local DB store first
    const local = getOrderById(id) || getOrders().find((o) => o.orderNumber === id || o.id === id);
    if (local) {
      return NextResponse.json(local);
    }

    // 2. Check WhatsApp captured orders
    const waConvs = getWhatsAppConversations();
    for (const c of waConvs) {
      if (c.capturedOrder && c.capturedOrder.isConfirmed) {
        const o = c.capturedOrder;
        if (o.orderId === id || o.orderNumber === id || c.id === id) {
          const isDuo = (o.quantity || 1) >= 2;
          const fullOrder: Order = {
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
          };
          return NextResponse.json(fullOrder);
        }
      }
    }

    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // 1. Delete from local DB store if exists
    deleteOrder(id);

    // 2. Also check and remove or unconfirm from WhatsApp conversations
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }
    const body = await req.json();
    const existing =
      getOrderById(id) ||
      getOrders().find((o) => o.id === id || o.orderNumber === id);
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated: Order = {
      ...existing,
      ...body,
      id: existing.id,
      orderNumber: existing.orderNumber,
    };

    updateOrder(updated);
    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}