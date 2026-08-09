import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hsfrsqsscahuvkakghab.supabase.co",
        pathname: "/**", // Allows any image path from your Supabase domain
      },
      {
        protocol: "https",
        hostname: "pub-7a5f3654ed9f4e12ad67aa55c2f897a6.r2.dev",
        pathname: "/**", // Allows any image path from your Supabase domain
      },
    ],
  },
};


export default nextConfig;