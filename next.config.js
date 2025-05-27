/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for hosting environments without Node.js
  output: 'export',
  trailingSlash: true,
  images: {
    // Set unoptimized to true for static export (required for static hosting)
    unoptimized: true,
    // Add domains for image sources
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
      "img.icons8.com",
      "photos.zillowstatic.com",
      "cdn.listingphotos.sierrastatic.com",
      "ssl.cdn-redfin.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
        pathname: "/**",
      },
    ],
    // Image optimization settings
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  // Add output caching for better performance
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // Enable optimizations
    optimizeCss: true,
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
