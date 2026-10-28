import { NextRequest, NextResponse } from "next/server";
import { computeAnalyticsSummary } from "@/lib/analytics/tracker";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") as any) || "all";
    const data = computeAnalyticsSummary(range);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
