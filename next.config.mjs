/**
 * @file next.config.mjs
 * @description Main Next.js configuration loader for the Avolve platform.
 * 
 * This file serves as a configuration loader that:
 * 1. Attempts to import user-specific configurations from v0-user-next.config.mjs (ESM) or v0-user-next.config.js (CJS)
 * 2. Provides sensible defaults for development and production environments
 * 3. Merges user configurations with the default configurations
 * 
 * The configuration hierarchy is:
 * - Base defaults defined in this file
 * - User overrides from v0-user-next.config.mjs/js
 * - Environment-specific settings from next.config.js (for production optimizations)
 * 
 * @see v0-user-next.config.js - For user-specific configuration
 * @see next.config.js - For production-specific optimizations
 */

import withBundleAnalyzer from '@next/bundle-analyzer';

let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

const isProd = process.env.NODE_ENV === 'production';
const isAnalyze = process.env.ANALYZE_BUNDLE === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Enable Next.js image optimization
    domains: [
      'cloudinary.com',
      'res.cloudinary.com',
      'cdn.avolve.io',
      'images.avolve.io',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    optimizeCss: isProd, // Enable CSS optimization in production
    optimizePackageImports: [
      'react-icons',
      '@radix-ui/react-icons',
      'date-fns',
      'lodash',
    ],
  },
  compiler: {
    // Enable React Server Components optimizations
    reactRemoveProperties: isProd,
    removeConsole: isProd ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Enable gzip compression in production
  compress: isProd,
  // Configure Content Security Policy
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  // Configure redirects for SEO
  redirects: async () => {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  // Configure webpack for optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize bundle size in production
    if (!dev && !isServer) {
      // Split chunks more aggressively in production
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next|@next)[\\/]/,
            priority: 40,
            chunks: 'all',
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Safely extract package name with null check to prevent errors
              const match = module.context ? module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) : null;
              const packageName = match ? match[1] : 'unknown';
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          components: {
            name: 'components',
            test: /[\\/]components[\\/]/,
            priority: 20,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

// Wrap with bundle analyzer if ANALYZE_BUNDLE is true
const finalConfig = isAnalyze 
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig;

export default finalConfig;
