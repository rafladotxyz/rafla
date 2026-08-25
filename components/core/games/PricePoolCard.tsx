"use client";

import { formatCurrency } from "@/utils/utils";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

interface PricePoolCardProps {
  amount: number;
  token?: string;
}

export function PricePoolCard({ amount, token = "USDC" }: PricePoolCardProps) {
  return (
    <SurfaceCard className="p-5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8A8A8A]">
        Prize pool
      </p>
      <p className="text-4xl font-bold tabular-nums tracking-tight text-[#F3F3F3]">
        {formatCurrency(amount)}{" "}
        <span className="text-xl font-semibold text-[#CBCBCB]">{token}</span>
      </p>
    </SurfaceCard>
  );
}
