/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  serverExternalPackages: ["siwe", "pusher"],
  transpilePackages: [
    "@coinbase/cdp-sdk",
    "@base-org/account",
  ],
};

module.exports = nextConfig;
