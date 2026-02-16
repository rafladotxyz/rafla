"use client";

import { Player } from "@/type/types";
import { memo } from "react";

interface PlayerRowProps {
  player: Player;
}

export const PlayerRow = memo(function PlayerRow({ player }: PlayerRowProps) {
  return (
    <div className="flex items-center w-66.25 h-10 border border-[#141414] justify-between rounded-lg py-2">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: player.color }}
        >
          {player.avatar}
        </div>

        {/* Address */}
        <span className="text-sm text-[#E8E8E8] font-mono">
          {player.address}
        </span>
      </div>

      {/* "You" Badge */}
      {player.isYou && (
        <span className="px-2 py-1 text-xs font-medium text-[#22C55E] bg-[#22C55E]/10 rounded border border-[#22C55E]/20">
          You
        </span>
      )}
    </div>
  );
});
