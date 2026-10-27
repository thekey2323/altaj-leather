import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Allows seamless local rendering of uploaded product images
  },
};

export default nextConfig;
