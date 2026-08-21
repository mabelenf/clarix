// Single source of truth for cookie consent.
// Any future tracking script (Reddit Pixel, GA, etc.) must check
// hasMarketingConsent() before it loads or fires — never load it
// unconditionally in layout.tsx or page.tsx.

const CONSENT_KEY = "clarix_cookie_consent";

export type ConsentValue = "accepted" | "declined" | null;

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY) as ConsentValue;
}

export function hasMarketingConsent(): boolean {
  return getConsent() === "accepted";
}

export function setConsent(value: "accepted" | "declined") {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, value);
  // Notify any listeners in this tab (e.g. a pixel loader) that consent changed.
  window.dispatchEvent(new CustomEvent("clarix-consent-changed", { detail: value }));
}
