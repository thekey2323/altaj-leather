import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvent, AnalyticsEvent } from "@/lib/analytics/tracker";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract geo headers (Vercel automatic geolocation)
    const countryCode = req.headers.get("x-vercel-ip-country") || "MA";
    const cityFromHeader = req.headers.get("x-vercel-ip-city");
    
    // Fallback Moroccan cities if on local/dev
    const clientCity = cityFromHeader
      ? decodeURIComponent(cityFromHeader)
      : (body.city || "Casablanca");

    const country = countryCode === "MA" ? "Maroc" : countryCode === "FR" ? "France" : "International";

    const userAgent = req.headers.get("user-agent") || "";
    const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);
    const device: "Mobile" | "Desktop" | "Tablet" = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";

    let browser = "Autre";
    if (/instagram/i.test(userAgent)) browser = "Instagram In-App";
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Mobile Safari";
    else if (/chrome/i.test(userAgent)) browser = "Chrome";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";

    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      visitorId: body.visitorId || `vis-${Date.now()}`,
      sessionId: body.sessionId || `sess-${Date.now()}`,
      eventType: body.eventType || "PAGE_VIEW",
      path: body.path || "/",
      referrer: body.referrer || req.headers.get("referer") || "",
      country,
      countryCode,
      city: clientCity,
      device,
      os: /iphone|ipad/i.test(userAgent) ? "iOS" : /android/i.test(userAgent) ? "Android" : "Windows/Mac",
      browser,
      utmSource: body.utmSource,
      utmCampaign: body.utmCampaign,
      utmMedium: body.utmMedium,
      timeOnPage: body.timeOnPage,
      timestamp: new Date().toISOString(),
    };

    recordAnalyticsEvent(event);

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
