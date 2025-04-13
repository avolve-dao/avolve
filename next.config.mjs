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

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
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

export default nextConfig
