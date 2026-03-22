import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GeoAttend — Geo attendance for Kerala teams",
  description:
    "Geo-tagged attendance for jewellery counters, gold trading desks, and field sales across Kerala. Trusted map pins, photos, and payroll-ready reports.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "GeoAttend",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B4332",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
