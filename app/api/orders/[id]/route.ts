import { NextRequest, NextResponse } from "next/server";
import { deleteOrder, updateOrder, getOrders } from "@/lib/db/store";
import { getWhatsAppConversations, saveWhatsAppConversations } from "@/lib/whatsapp/store";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateOrder({ ...body, id });

    // Update in Supabase
    try {
      await supabase
        .from("orders")
        .update({
          customer_name: body.customerName,
          customer_phone: body.customerPhone,
          customer_city: body.customerCity,
          customer_address: body.customerAddress,
          status: body.status,
          total: body.total,
          notes: body.notes,
        })
        .or(`id.eq.${id},order_number.eq.${id}`);
    } catch (e) {
      console.warn("Supabase order patch warning:", e);
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}