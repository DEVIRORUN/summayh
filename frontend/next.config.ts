import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hsfrsqsscahuvkakghab.supabase.co",
        pathname: "/**", // Allows any image path from your Supabase domain
      },
    ],
  },
};

export default nextConfig;