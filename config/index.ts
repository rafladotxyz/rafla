import { http } from "wagmi";
import { base, baseSepolia } from "viem/chains";
// Privy's createConfig wraps wagmi's and injects the Privy connector.
// Must come from @privy-io/wagmi, not wagmi directly.
import { createConfig } from "@privy-io/wagmi";

export const chains = [baseSepolia, base] as const;

export const config = createConfig({
  chains,
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
});

export type AppWagmiConfig = typeof config;
