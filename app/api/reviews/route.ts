import { NextRequest, NextResponse } from "next/server";
import { getReviews, saveReview, deleteReview, saveServerReviews } from "@/lib/db/store";
import { CustomerReview } from "@/types";
import { supabase } from "@/lib/supabaseClient";

function mapFromSupabaseReview(row: any): CustomerReview {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    rating: Number(row.rating ?? 5),
    comment: row.comment,
    date: row.date || "Aujourd'hui",
    isVerified: row.is_verified ?? true,
    audioUrl: row.audio_url || undefined,
    audioDuration: row.audio_duration || "0:15",
    productSlug: row.product_slug || undefined,
    createdAt: row.created_at,
  };
}

function mapToSupabaseReview(r: CustomerReview) {
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    rating: r.rating || 5,
    comment: r.comment,
    date: r.date || "Aujourd'hui",
    is_verified: r.isVerified ?? true,
    audio_url: r.audioUrl || null,
    audio_duration: r.audioDuration || "0:15",
    product_slug: r.productSlug || null,
  };
}

export async function GET() {
  try {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data.map(mapFromSupabaseReview));
      }
    } catch {}

    const reviews = getReviews();
    return NextResponse.json(reviews);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CustomerReview = await req.json();
    if (!body || !body.name || !body.comment) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
    }

    const saved = saveReview(body);

    try {
      await supabase.from("reviews").upsert(mapToSupabaseReview(saved));
    } catch {}

    return NextResponse.json({ success: true, review: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing review id" }, { status: 400 });
    }

    deleteReview(id);

    try {
      await supabase.from("reviews").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const reviewsList: CustomerReview[] = Array.isArray(body) ? body : body?.reviews;
    if (!Array.isArray(reviewsList)) {
      return NextResponse.json({ error: "Expected an array of reviews" }, { status: 400 });
    }

    saveServerReviews(reviewsList);

    try {
      await supabase.from("reviews").upsert(reviewsList.map(mapToSupabaseReview));
    } catch {}

    return NextResponse.json({ success: true, count: reviewsList.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
