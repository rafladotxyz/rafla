"use client";

import { formatCurrency } from "@/utils/utils";
import Image from "next/image";
import USD from "@/assets/USD.svg";
import { GlassCard } from "@/components/ui/GlassCard";

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
        {/* USDC Icon Mini */}
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
    <GlassCard className="border-2 bg-[#0A0A0A] p-5 space-y-1">
      <InfoRow label="Your Entry" value={yourEntry} />
      <InfoRow label="Potential Win" value={potentialWin} highlight />
      {/* Corner Accents */}
    </GlassCard>
  );
}
