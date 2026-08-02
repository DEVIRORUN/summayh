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

// module.exports = {
//   async rewrites() {
//     return [
//       {
//         source: "/api/:path*",
//         destination: "http://localhost:3001/api/:path*"
//       }
//     ]
//   }
// }

export default nextConfig;