import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteTitle = "GeoAttend — Geo attendance for field teams";
const siteDescription =
  "GPS-backed check-ins, map pins, and optional photo proof for teams on the road, at sites, or across locations. Payroll-friendly reports and offline-tolerant mobile flow.";

function siteOrigin(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: siteOrigin(),
  title: {
    default: siteTitle,
    template: "%s · GeoAttend",
  },
  description: siteDescription,
  applicationName: "GeoAttend",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "512x512" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "GeoAttend",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: "GeoAttend",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "GeoAttend" }],
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
    images: ["/icon.svg"],
  },
  other: {
    "msapplication-TileColor": "#0D281E",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D281E" },
    { media: "(prefers-color-scheme: dark)", color: "#0D281E" },
  ],
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
