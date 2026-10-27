import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProduct, deleteProduct, saveServerProducts } from "@/lib/db/store";
import { Product } from "@/types";
import { supabase } from "@/lib/supabaseClient";

function mapFromSupabase(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku || "",
    tagline: row.tagline || "",
    description: row.description || "",
    price: Number(row.price),
    compareAtPrice: Number(row.compare_at_price ?? 169),
    cost: Number(row.cost ?? 50),
    promotionBadge: row.promotion_badge || "PROMO",
    featuredImage: row.featured_image,
    images: Array.isArray(row.images) ? row.images : [],
    stock: Number(row.stock ?? 20),
    lowStockThreshold: Number(row.low_stock_threshold ?? 5),
    category: row.category || "Portefeuilles",
    tags: Array.isArray(row.tags) ? row.tags : ["100% Cuir Naturel"],
    status: row.status || "ACTIVE",
    materials: Array.isArray(row.materials) ? row.materials : [],
    dimensions: row.dimensions || "10.8 cm x 8.4 cm",
    handmadeIn: row.handmade_in || "Atelier ALTAJ — Maroc",
    bundleOffers: Array.isArray(row.bundle_offers) ? row.bundle_offers : [],
    relatedProductSlugs: Array.isArray(row.related_product_slugs) ? row.related_product_slugs : [],
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
    rating: Number(row.rating ?? 5.0),
    reviewCount: Number(row.review_count ?? 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToSupabase(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku || "",
    tagline: p.tagline || "",
    description: p.description || "",
    price: p.price,
    compare_at_price: p.compareAtPrice || null,
    cost: p.cost || null,
    promotion_badge: p.promotionBadge || "PROMO",
    featured_image: p.featuredImage,
    images: p.images || [],
    stock: p.stock ?? 20,
    low_stock_threshold: p.lowStockThreshold ?? 5,
    category: p.category || "Portefeuilles",
    tags: p.tags || [],
    status: p.status || "ACTIVE",
    materials: p.materials || [],
    dimensions: p.dimensions || "10.8 cm x 8.4 cm",
    handmade_in: p.handmadeIn || "Atelier ALTAJ — Maroc",
    bundle_offers: p.bundleOffers || [],
    related_product_slugs: p.relatedProductSlugs || [],
    rating: p.rating ?? 5.0,
    review_count: p.reviewCount ?? 1,
    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    // 1. Try reading from Supabase
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapFromSupabase);
        return NextResponse.json(mapped);
      }
    } catch {}

    // 2. Fallback to local store
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

    // 1. Save to local fallback store
    const saved = saveProduct(body);

    // 2. Upsert to Supabase
    try {
      await supabase.from("products").upsert(mapToSupabase(body));
    } catch {}

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

    // 1. Delete from local store
    deleteProduct(id);

    // 2. Delete from Supabase
    try {
      await supabase.from("products").delete().eq("id", id);
    } catch {}

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

    try {
      const mapped = productsList.map(mapToSupabase);
      await supabase.from("products").upsert(mapped);
    } catch {}

    return NextResponse.json({ success: true, count: productsList.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
