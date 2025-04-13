/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental Turbo settings that are causing issues
  // Keep other existing settings
  reactStrictMode: true,
  swcMinify: true,
  // Add any other configuration options you need here
}

module.exports = nextConfig

