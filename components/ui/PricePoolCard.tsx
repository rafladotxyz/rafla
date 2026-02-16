"use client";

import { formatCurrency } from "@/utils/utils";

interface PricePoolCardProps {
  amount: number;
}

export function PricePoolCard({ amount }: PricePoolCardProps) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-6">
      <h3 className="text-sm font-medium text-[#A3A3A3] mb-3">Price Pool</h3>

      <div className="flex items-center gap-3">
        {/* USDC Icon */}
        <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center flex-shrink-0">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" fill="white" />
            <path
              d="M12 6v12M9 9h6M9 15h6"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Amount */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#E8E8E8]">
            {formatCurrency(amount)}
          </span>
          <span className="text-xl font-semibold text-[#A3A3A3]">USDC</span>
        </div>
      </div>
    </div>
  );
}
