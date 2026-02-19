"use client";

import { formatCurrency } from "@/utils/utils";
import Image from "next/image";
import USD from "@/assets/USD.svg";

interface InfoRowProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[#737373]">{label}</span>
      <div className="flex items-center gap-1.5">
        <Image src={USD} height={16} width={16} alt="USD" />
        <span
          className={`text-sm font-semibold ${
            highlight ? "text-[#22C55E]" : "text-[#E8E8E8]"
          }`}
        >
          {formatCurrency(value)} USDC
        </span>
      </div>
    </div>
  );
}

interface EntryInfoCardProps {
  yourEntry: number;
  potentialWin: number;
}

export function EntryInfoCard({ yourEntry, potentialWin }: EntryInfoCardProps) {
  return (
    <div className="relative border-[#1A1A1A] rounded-xl border-2 bg-[#2A2A2A] p-5 space-y-1 overflow-hidden">
      {/* Static Glass Shimmer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-xl" />

      {/* Radial Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-radial from-white/5 via-transparent to-transparent blur-xl pointer-events-none" />

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-white/20 rounded-tl-xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-white/20 rounded-br-xl" />

      {/* Content */}
      <div className="relative z-10">
        <InfoRow label="Your Entry" value={yourEntry} />
        <InfoRow label="Potential Win" value={potentialWin} highlight />
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
