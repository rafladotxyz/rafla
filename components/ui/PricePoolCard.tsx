"use client";

import { formatCurrency } from "@/utils/utils";
import Image from "next/image";
import USD from "@/assets/USD.svg";
interface PricePoolCardProps {
  amount: number;
}

export function PricePoolCard({ amount }: PricePoolCardProps) {
  return (
    <div className="bg-[#0A0A0A] rounded-2xl border border-[#141414] p-6">
      <p className="text-[14px] font-medium text-[#CBCBCB] mb-3">Price Pool</p>

      <div className="flex items-center gap-3">
        {/* USDC Icon */}
        <Image src={USD} height={40} width={40} alt="USDC" />

        {/* Amount */}
        <div className="flex items-baseline gap-2">
          <span className="text-[40px] font-bold text-[#D9D9D9]">
            {formatCurrency(amount)}
          </span>
          <span className="text-[40px] font-semibold text-[#D9D9D9]">USDC</span>
        </div>
      </div>
    </div>
  );
}
