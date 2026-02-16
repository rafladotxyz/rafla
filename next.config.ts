// next.config.js
/** @type {import('next').NextConfig} */
import type { Configuration } from "webpack";

const nextConfig = {
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      if (config.resolve) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
        };
      }
    }
    return config;
  },
  // Add this to help with ESM packages
  transpilePackages: [
    "@coinbase/cdp-sdk",
    "@base-org/account",
    "@reown/appkit",
    "@reown/appkit-adapter-wagmi",
    "@wagmi/connectors",
  ],
};

module.exports = nextConfig;
