"use client";

import { wagmiAdapter, projectId } from "@/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { base, baseSepolia, monad, monadTestnet } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "Rafla",
  description: "Turn Chances into rare moments",
  url: "https://rafla.vercel.app/", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [baseSepolia, base, monadTestnet, monad],
  defaultNetwork: monadTestnet,
  metadata: metadata,
  enableNetworkSwitch: true,
  chainImages: {
    "base-sepolia": "https://cryptologos.cc/logos/base-sepolia-logo.png?v=025",
    base: "https://cryptologos.cc/logos/base-logo.png?v=025",
    monad: "https://cryptologos.cc/logos/monad-logo.png?v=025",
    "monad-testnet": "https://cryptologos.cc/logos/monad-logo.png?v=025",
  },
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
