"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

interface RoomLinkCardProps {
  roomLink: string;
}

export function RoomLinkCard({ roomLink }: RoomLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
      window.setTimeout(() => setCopyFailed(false), 2500);
    }
  };

  const shareRoom = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Rafla Draw",
          text: "Join my Rafla Draw room — seats are limited.",
          url: roomLink,
        });
        return;
      } catch {
        // User dismissed the share sheet; fall back to doing nothing.
        return;
      }
    }
    void copyToClipboard();
  };

  return (
    <SurfaceCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
            Invite
          </p>
          <p className="text-sm leading-relaxed text-[#A3A3A3]">
            Share this link. The room fills up in the order friends join.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <p className="break-all font-mono text-[12px] leading-relaxed text-[#E8E8E8]">
          {roomLink}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={shareRoom}
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          type="button"
          onClick={copyToClipboard}
          aria-label={copied ? "Invite copied" : "Copy invite"}
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copyFailed
            ? "Copy failed"
            : copied
              ? "Copied"
              : "Copy link"}
        </button>
      </div>
    </SurfaceCard>
  );
}
