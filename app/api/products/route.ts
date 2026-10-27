import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProduct, deleteProduct, saveServerProducts } from "@/lib/db/store";
import { Product } from "@/types";

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Product = await req.json();
    if (!body || !body.id) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }
    const saved = saveProduct(body);
    return NextResponse.json({ success: true, product: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }
    deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const productsList: Product[] = Array.isArray(body) ? body : body?.products;
    if (!Array.isArray(productsList)) {
      return NextResponse.json({ error: "Expected an array of products" }, { status: 400 });
    }
    saveServerProducts(productsList);
    return NextResponse.json({ success: true, count: productsList.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

