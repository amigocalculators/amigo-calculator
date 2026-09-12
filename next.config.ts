import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "kfaylkuiufrarlrrfhow.supabase.co" },
    ],
    // Vercel's Image Optimization quota (Transformations + Cache Reads) is currently
    // exceeded on the Hobby plan — that's a separate quota from Supabase's and applies
    // to ANY image (local or remote) run through next/image's resize pipeline. Disabling
    // it here stops using that quota entirely: images are served as-is, unresized.
    unoptimized: true,
  },
};

export default nextConfig;
