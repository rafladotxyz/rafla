"use client";

import { formatCurrency } from "@/utils/utils";

interface InfoRowProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[#A3A3A3]">{label}</span>
      <div className="flex items-center gap-1.5">
        {/* USDC Icon Mini */}
        <div className="w-4 h-4 rounded-full bg-[#3B82F6] flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
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
    <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-5 space-y-1">
      <InfoRow label="Your Entry" value={yourEntry} />
      <InfoRow label="Potential Win" value={potentialWin} highlight />
    </div>
  );
}
