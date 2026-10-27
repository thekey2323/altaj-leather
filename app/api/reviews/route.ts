import { NextRequest, NextResponse } from "next/server";
import { getReviews, saveReview, deleteReview, saveServerReviews } from "@/lib/db/store";
import { CustomerReview } from "@/types";

export async function GET() {
  try {
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
    return NextResponse.json({ success: true, count: reviewsList.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
