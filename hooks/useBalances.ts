"use client";

import { useBalance, useReadContract, useAccount } from "wagmi";
import { formatUnits } from "viem";
import { USDC_ADDRESS, OAR_COIN_ADDRESS, ERC20_ABI } from "@/lib/contract";

export function useBalances() {
  const { address } = useAccount();

  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
  });

  const { data: usdcBalanceValue, isLoading: usdcLoading } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: oarBalanceValue, isLoading: oarLoading } = useReadContract({
    address: OAR_COIN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const ethVal = ethBalance?.value ?? 0n;
  const usdcVal = (usdcBalanceValue as bigint) ?? 0n;
  const oarVal = (oarBalanceValue as bigint) ?? 0n;

  return {
    balances: {
      ETH: {
        value: ethVal,
        formatted: formatUnits(ethVal, 18),
      },
      USDC: {
        value: usdcVal,
        formatted: formatUnits(usdcVal, 6),
      },
      OAR: {
        value: oarVal,
        formatted: formatUnits(oarVal, 18),
      },
    },
    isLoading: ethLoading || usdcLoading || oarLoading,
  };
}
