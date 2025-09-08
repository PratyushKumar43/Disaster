import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['framer-motion'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/**',
      }
    ],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['@tabler/icons-react', 'lucide-react']
  },
  // Simple configuration for Vercel
  trailingSlash: false
};

export default nextConfig;
