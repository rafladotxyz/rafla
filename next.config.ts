/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  serverExternalPackages: ["siwe", "pusher"],
  transpilePackages: [
    "@coinbase/cdp-sdk",
    "@base-org/account",
    "@reown/appkit",
    "@reown/appkit-adapter-wagmi",
    "@wagmi/connectors",
  ],
};

module.exports = nextConfig;
