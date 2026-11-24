import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { sk } from "@/i18n/sk";
import "./globals.css";

export const metadata: Metadata = {
  title: sk.meta.title,
  description: sk.meta.description,
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sk">
      <body className="antialiased">
        {children}
        {plausibleDomain && (
          <>
            {/* Queue events fired before the script loads (e.g. landing_view on mount). */}
            <Script id="plausible-queue" strategy="beforeInteractive">
              {"window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}"}
            </Script>
            <Script
              defer
              data-domain={plausibleDomain}
              src="https://plausible.io/js/script.js"
              strategy="afterInteractive"
            />
          </>
        )}
      </body>
    </html>
  );
}
