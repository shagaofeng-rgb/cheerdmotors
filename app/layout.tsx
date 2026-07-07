import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
