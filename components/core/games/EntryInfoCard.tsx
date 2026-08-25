"use client";

import { formatCurrency } from "@/utils/utils";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

interface InfoRowProps {
  label: string;
  value: number;
  token?: string;
  highlight?: boolean;
}

function InfoRow({ label, value, token = "USDC", highlight }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[#737373]">{label}</span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          highlight ? "text-[#22C55E]" : "text-[#E8E8E8]"
        }`}
      >
        {formatCurrency(value)} {token}
      </span>
    </div>
  );
}

interface EntryInfoCardProps {
  yourEntry: number;
  potentialWin: number;
  token?: string;
}

export function EntryInfoCard({
  yourEntry,
  potentialWin,
  token = "USDC",
}: EntryInfoCardProps) {
  return (
    <SurfaceCard className="p-5">
      <InfoRow label="Your entry" value={yourEntry} token={token} />
      <InfoRow
        label="Potential win"
        value={potentialWin}
        token={token}
        highlight
      />
    </SurfaceCard>
  );
}
