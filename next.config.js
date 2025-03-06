/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable webpack caching in development to prevent caching issues
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images from these domains
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // Enable SWC minification instead of Terser for better performance
  swcMinify: true,

  // Configure powered by header
  poweredByHeader: false,

  // Configure compression
  compress: true,

  // Configure async storage
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 