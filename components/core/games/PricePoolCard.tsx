"use client";

import { formatCurrency } from "@/utils/utils";
import Image from "next/image";
import USD from "@/assets/USD.svg";

interface PricePoolCardProps {
  amount: number;
}

export function PricePoolCard({ amount }: PricePoolCardProps) {
  return (
    <div className="relative bg-[#0A0A0A] rounded-xl border-2 border-[#141414] p-6 overflow-hidden">
      {/* Static Glass Shimmer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-xl" />

      {/* Radial Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-radial from-white/5 via-transparent to-transparent blur-xl pointer-events-none" />

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-white/20 rounded-tl-xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-white/20 rounded-br-xl" />

      {/* Content */}
      <div className="relative z-10">
        <p className="text-[14px] font-medium text-[#CBCBCB] mb-3">
          Price Pool
        </p>
        <div className="flex items-center gap-3">
          <Image src={USD} height={40} width={40} alt="USDC" />
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] font-bold text-[#D9D9D9]">
              {formatCurrency(amount)}
            </span>
            <span className="text-[40px] font-semibold text-[#D9D9D9]">
              USDC
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
