"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getVisitorId() {
  const key = "cheerdmotors_visitor_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = `v_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, created);
  return created;
}

function getSessionId() {
  const key = "cheerdmotors_session_id";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const created = `s_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  window.sessionStorage.setItem(key, created);
  return created;
}

function deviceType() {
  const width = window.innerWidth;
  if (width < 720) return "Mobile";
  if (width < 1024) return "Tablet";
  return "Desktop";
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const page = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: pathname.includes("electric") || pathname.includes("accessories") ? "product_view" : "page_view",
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        page,
        pageTitle: document.title,
        referrer: document.referrer,
        device: deviceType(),
        browser: navigator.userAgent,
        os: navigator.platform,
        payload: {},
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}
