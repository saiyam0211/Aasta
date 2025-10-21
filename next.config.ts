import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable image optimization for mobile
  images: {
    unoptimized: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  compiler: {
    removeConsole: false, // Keep console for mobile debugging
  },
};

export default nextConfig;
