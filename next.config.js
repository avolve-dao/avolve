/**
 * @file next.config.js
 * @description Production-optimized Next.js configuration for the Avolve platform.
 * 
 * This file contains performance optimizations and production-specific settings.
 * It works in conjunction with next.config.mjs, which handles configuration loading.
 * 
 * Key features:
 * - Performance optimizations for production builds
 * - Image optimization settings
 * - Webpack customizations for better caching and code splitting
 * - TypeScript type checking enforcement for code quality
 * 
 * @see next.config.mjs - For configuration loading logic
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use the standalone output format which is more suitable for deployment
  output: 'standalone',
  // Disable static generation by setting a very low timeout
  staticPageGenerationTimeout: 1,
  // Configure dynamic rendering for all pages
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Enable optimizations for improved build performance
    optimizeCss: true,
    // Enable memory optimizations
    memoryBasedWorkersCount: true,
    // These options are now default or removed in Next.js 15
    // runtime: 'edge', - removed
    // optimizeFonts: true, - now default
    // appDir: true, - now default
    // serverComponents: true, - now default
  },
  // swcMinify is now default in Next.js 15
  // swcMinify: true,
  // Optimize images
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable TypeScript checking during build to ensure code quality
  typescript: {
    // Enable type checking to catch errors early
    ignoreBuildErrors: false,
  },
  // Configure webpack for better performance
  webpack: (config, { dev, isServer }) => {
    // Only enable these optimizations for production builds
    if (!dev) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
      };
      
      // Enable persistent caching
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
