"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
// Privy's WagmiProvider ensures reconnectOnMount=false for embedded wallets.
import { WagmiProvider } from "@privy-io/wagmi";
import { type ReactNode } from "react";
import { config } from "@/config";
import { baseSepolia, base } from "viem/chains";

const queryClient = new QueryClient();

const privyAppId = process.env.PRIVY_APP_ID;

// Well-formed stand-in ID so the SDK initializes (and static prerendering
// works) even before real credentials land in the environment.
const FALLBACK_APP_ID = "00000000-0000-0000-0000-000000000000";

// Privy app IDs are either legacy UUIDs or the newer 24-char base62 format.
const hasValidAppId =
  !!privyAppId &&
  !privyAppId.includes("your-") &&
  (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    privyAppId,
  ) ||
    /^[a-z0-9]{24}$/.test(privyAppId));

export default function ContextProvider({ children }: { children: ReactNode }) {
  if (!hasValidAppId && typeof window !== "undefined") {
    console.error(
      "[providers] NEXT_PUBLIC_PRIVY_APP_ID is missing or invalid — sign-in is disabled.",
    );
  }

  return (
    <PrivyProvider
      appId={hasValidAppId ? privyAppId! : FALLBACK_APP_ID}
      config={{
        // Every login method Privy offers, so non-crypto friends can play.
        loginMethods: [
          "wallet",
          "email",
          "google",
          "apple",
          "twitter",
          "discord",
          "tiktok",
          "github",
          "linkedin",
          "telegram",
          "farcaster",
          "sms",
        ],
        appearance: {
          theme: "dark",
          accentColor: "#D946EF",
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia, base],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
