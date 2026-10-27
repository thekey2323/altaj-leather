import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Allows seamless local rendering of uploaded product images
  },
  async rewrites() {
    return [
      {
        source: "/product/:slug*",
        destination: "/products/:slug*",
      },
    ];
  },
};

export default nextConfig;
