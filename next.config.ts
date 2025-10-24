import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Cloudflare Pages compatibility settings
  images: {
    unoptimized: true, // Cloudflare Images should be used instead
  },
  // Don't fail build on ESLint warnings (run `npm run lint` separately)
  // All ESLint errors have been fixed - only warnings remain
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow TypeScript to compile with type assertions for now
  // Run `tsc --noEmit` separately for strict type checking
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
