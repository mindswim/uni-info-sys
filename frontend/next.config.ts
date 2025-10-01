import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to complete even with ESLint warnings
    // We'll fix these incrementally
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Keep type checking strict
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
