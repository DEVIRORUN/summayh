import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hsfrsqsscahuvkakghab.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-7a5f3654ed9f4e12ad67aa55c2f897a6.r2.dev",
        pathname: "/**",
      },
    ],
  },
  // Use Turbopack's native rule system instead of the webpack() function
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
