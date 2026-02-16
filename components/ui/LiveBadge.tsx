"use client";

export function LiveBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 mb-2">
      <div className="relative flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
        <div className="absolute w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
      </div>
      <span className="text-xs font-medium text-[#22C55E]">Live</span>
    </div>
  );
}
