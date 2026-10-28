"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formObservedRef = useRef(false);

  useEffect(() => {
    // Never track admin back-office pages
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    try {
      // Manage persistent visitor ID
      let visitorId = localStorage.getItem("altaj_visitor_id");
      if (!visitorId) {
        visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem("altaj_visitor_id", visitorId);
      }

      // Manage session ID
      let sessionId = sessionStorage.getItem("altaj_session_id");
      if (!sessionId) {
        sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        sessionStorage.setItem("altaj_session_id", sessionId);
      }

      // Parse UTM parameters
      const utmSource = searchParams?.get("utm_source") || undefined;
      const utmCampaign = searchParams?.get("utm_campaign") || undefined;
      const utmMedium = searchParams?.get("utm_medium") || undefined;

      const payload = {
        visitorId,
        sessionId,
        eventType: "PAGE_VIEW",
        path: pathname,
        referrer: document.referrer || "",
        utmSource,
        utmCampaign,
        utmMedium,
      };

      // Send beacon
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});

      // Track scroll to COD order form
      formObservedRef.current = false;
      const checkFormVisible = () => {
        if (formObservedRef.current) return;
        const formEl = document.getElementById("product-cod-form") || document.querySelector("form");
        if (formEl) {
          const rect = formEl.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom >= 0) {
            formObservedRef.current = true;
            fetch("/api/analytics/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                visitorId,
                sessionId,
                eventType: "SCROLL_FORM",
                path: pathname,
              }),
              keepalive: true,
            }).catch(() => {});
          }
        }
      };

      window.addEventListener("scroll", checkFormVisible, { passive: true });
      setTimeout(checkFormVisible, 1500);

      return () => {
        window.removeEventListener("scroll", checkFormVisible);
      };
    } catch {
      // Silent fail
    }
  }, [pathname, searchParams]);

  return null;
}
