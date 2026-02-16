/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  transpilePackages: [
    "@coinbase/cdp-sdk",
    "@base-org/account",
    "@reown/appkit",
    "@reown/appkit-adapter-wagmi",
    "@wagmi/connectors",
  ],
};

module.exports = nextConfig;
