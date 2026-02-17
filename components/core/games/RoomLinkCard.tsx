"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface RoomLinkCardProps {
  roomLink: string;
}

export function RoomLinkCard({ roomLink }: RoomLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-2xl border border-[#1A1A1A] p-5">
      <label className="text-sm font-medium text-[#A3A3A3] block mb-3">
        Room Link
      </label>

      <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg p-3 border border-[#2A2A2A]">
        <input
          type="text"
          value={roomLink}
          readOnly
          className="flex-1 bg-transparent text-sm text-[#E8E8E8] outline-none font-mono"
        />

        <button
          onClick={copyToClipboard}
          className="shrink-0 p-2 hover:bg-[#2A2A2A] rounded transition-colors"
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <Check className="w-4 h-4 text-[#22C55E]" />
          ) : (
            <Copy className="w-4 h-4 text-[#A3A3A3]" />
          )}
        </button>
      </div>
    </div>
  );
}
