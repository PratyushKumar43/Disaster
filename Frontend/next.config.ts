import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['framer-motion'],
  images: {
    domains: ['openweathermap.org'],
  },
};

export default nextConfig;
