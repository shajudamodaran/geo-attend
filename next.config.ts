import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "osm-tiles",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "cloudinary-images",
          expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 },
        },
      },
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/api/attendance"),
        handler: "NetworkFirst",
        options: {
          cacheName: "attendance-api",
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "**.tile.openstreetmap.org", pathname: "/**" },
    ],
  },
};

export default withPWA(nextConfig);
