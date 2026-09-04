import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { SITE_URL } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "COWIN | Intelligent Electric Mobility", template: "%s" },
  description:
    "COWIN electric dirt bikes, e-bikes, smart mobility platforms, and support programs.",
  openGraph: { siteName: "COWIN", type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </body>
    </html>
  );
}
