"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface GameHeaderProps {
  chain?: string;
}

export function GameHeader({ chain = "Base" }: GameHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center mt-12 justify-between mb-6">
      {/* Go Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2A2A2A] bg-[#242628] hover:bg-[#252525] text-[#141414] text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Go Back</span>
      </button>

      {/* Title */}
      <h1 className="text-xl font-semibold text-[#E8E8E8]">Rafla Draw</h1>

      {/* Chain Badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
        <div className="w-4 h-4 rounded bg-blue-500" />
        <span className="text-sm text-[#E8E8E8]">{chain}</span>
      </div>
    </div>
  );
}
