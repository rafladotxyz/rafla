"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

interface RoomLinkCardProps {
  roomLink: string;
}

export function RoomLinkCard({ roomLink }: RoomLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <SurfaceCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
            Room link
          </p>
          <p className="text-sm leading-relaxed text-[#A3A3A3]">
            Share this invite with friends. The full URL stays wrapped inside the card.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CBCBCB]">
          <Link2 className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
        <p className="break-all font-mono text-[12px] leading-relaxed text-[#E8E8E8] sm:text-sm">
          {roomLink}
        </p>
      </div>

      <button
        type="button"
        onClick={copyToClipboard}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </SurfaceCard>
  );
}
