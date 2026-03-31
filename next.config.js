const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };
    return config;
  },
  turbopack: {
    root: __dirname,
    resolveAlias: {
      "@": __dirname,
    },
  },
};

module.exports = nextConfig;