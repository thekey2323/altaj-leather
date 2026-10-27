import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProduct } from "@/lib/db/store";
import { getWhatsAppModels, saveWhatsAppModels } from "@/lib/whatsapp/store";
import { BundleOffer } from "@/types";

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, name, quantity, price, savings, badge, isPopular } = body;

    const products = getProducts();
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newOffer: BundleOffer = {
      id: `bundle-${Date.now()}`,
      name: (name || "").trim(),
      quantity: Number(quantity) || 1,
      price: Number(price) || 0,
      savings: Number(savings) || 0,
      badge: (badge || "").trim(),
      isPopular: Boolean(isPopular),
    };

    const updatedOffers = [...(targetProduct.bundleOffers || []), newOffer];
    const updatedProduct = { ...targetProduct, bundleOffers: updatedOffers };
    saveProduct(updatedProduct);

    // Sync pack duo price to WhatsApp models if quantity is 2
    if (newOffer.quantity === 2) {
      const waModels = getWhatsAppModels();
      const updatedModels = waModels.map((m) => ({
        ...m,
        packDuoPrice: newOffer.price,
      }));
      saveWhatsAppModels(updatedModels);
    }

    return NextResponse.json({ success: true, offer: newOffer, product: updatedProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, offerId, name, quantity, price, savings, badge, isPopular } = body;

    if (!productId || !offerId) {
      return NextResponse.json({ error: "Missing productId or offerId" }, { status: 400 });
    }

    const products = getProducts();
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedOffers = (targetProduct.bundleOffers || []).map((o) => {
      if (o.id === offerId) {
        return {
          ...o,
          name: name !== undefined ? name.trim() : o.name,
          quantity: quantity !== undefined ? Number(quantity) : o.quantity,
          price: price !== undefined ? Number(price) : o.price,
          savings: savings !== undefined ? Number(savings) : o.savings,
          badge: badge !== undefined ? badge.trim() : o.badge,
          isPopular: isPopular !== undefined ? Boolean(isPopular) : o.isPopular,
        };
      }
      return o;
    });

    const updatedProduct = { ...targetProduct, bundleOffers: updatedOffers };
    saveProduct(updatedProduct);

    // Sync pack duo price to WhatsApp models if quantity is 2
    const editedOffer = updatedOffers.find((o) => o.id === offerId);
    if (editedOffer && editedOffer.quantity === 2) {
      const waModels = getWhatsAppModels();
      const updatedModels = waModels.map((m) => ({
        ...m,
        packDuoPrice: editedOffer.price,
      }));
      saveWhatsAppModels(updatedModels);
    }

    return NextResponse.json({ success: true, offer: editedOffer, product: updatedProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const offerId = searchParams.get("offerId");

    if (!productId || !offerId) {
      return NextResponse.json({ error: "Missing productId or offerId" }, { status: 400 });
    }

    const products = getProducts();
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedOffers = (targetProduct.bundleOffers || []).filter((o) => o.id !== offerId);
    const updatedProduct = { ...targetProduct, bundleOffers: updatedOffers };
    saveProduct(updatedProduct);

    return NextResponse.json({ success: true, deletedOfferId: offerId, product: updatedProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
