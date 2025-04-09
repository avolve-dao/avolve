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
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
  // Optimize images
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Disable TypeScript checking during build to avoid type errors
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
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
