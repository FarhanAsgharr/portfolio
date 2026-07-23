"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Records a page view on each route change.
 *
 * The visitor id is a random value kept in localStorage — first-party, never
 * sent anywhere but this site's own API, and only used server-side to count
 * uniques via a day-salted hash. `keepalive` lets the beacon complete even if
 * the visitor navigates away immediately, and every failure is swallowed: a
 * missed count is not worth a console error on someone's portfolio.
 */
export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    // Never count the owner looking at their own admin panel.
    if (pathname.startsWith("/admin")) return;

    let visitorId = "";
    try {
      visitorId = localStorage.getItem("pf_vid") ?? "";
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("pf_vid", visitorId);
      }
    } catch {
      visitorId = "anon";
    }

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer,
      visitorId,
    });

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
