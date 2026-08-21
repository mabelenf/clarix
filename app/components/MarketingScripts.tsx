"use client";

import { useEffect, useState } from "react";
import { hasMarketingConsent } from "../lib/consent";

/**
 * Loads marketing/tracking scripts (Reddit Pixel, GA, etc.) ONLY after
 * the user has accepted cookies. Nothing here fires on page load by
 * default — it fires only once consent is "accepted".
 *
 * To wire up the Reddit Pixel later:
 * 1. Get your pixel ID from Reddit Ads Manager > Events Manager.
 * 2. Uncomment the block below and drop in the official snippet,
 *    replacing YOUR_PIXEL_ID.
 * 3. Add <MarketingScripts /> in layout.tsx, after <CookieBanner />.
 */
export default function MarketingScripts() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasMarketingConsent());

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setConsented(detail === "accepted");
    };
    window.addEventListener("clarix-consent-changed", onChange);
    return () => window.removeEventListener("clarix-consent-changed", onChange);
  }, []);

  useEffect(() => {
    if (!consented) return;

    // --- Reddit Pixel (uncomment and fill in when ready) ---
    // !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
    // window.rdt("init", "YOUR_PIXEL_ID");
    // window.rdt("track", "PageVisit");
  }, [consented]);

  return null;
}
