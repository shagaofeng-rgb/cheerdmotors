import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHEERDMOTO | Intelligent Electric Mobility",
  description:
    "CHEERDMOTO electric dirt bikes, e-bikes, smart mobility platforms, and support programs.",
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
