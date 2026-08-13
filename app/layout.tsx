import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarix — AI Business Process Analyzer",
  description: "Analyze any business process and get a presentation-ready action plan powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
  <CookieBanner />
        {/* Cookie Consent by TermsFeed https://www.TermsFeed.com */}
        <Script
          src="https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js"
          strategy="afterInteractive"
        />
        <Script id="cookie-consent-init" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function () {
              cookieconsent.run({"notice_banner_type":"simple","consent_type":"express","palette":"dark","language":"en","page_load_consent_levels":["strictly-necessary"],"notice_banner_reject_button_hide":false,"preferences_center_close_button_hide":false,"page_refresh_confirmation_buttons":false,"website_name":"Clarix"});
            });
          `}
        </Script>
        <noscript>Free cookie consent management tool by <a href="https://www.termsfeed.com/">TermsFeed Generator</a></noscript>
        {/* End Cookie Consent by TermsFeed https://www.TermsFeed.com */}
      </body>
    </html>
  );
}
