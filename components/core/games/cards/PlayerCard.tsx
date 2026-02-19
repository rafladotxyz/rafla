"use client";

import { Users } from "lucide-react";
import { Player } from "@/type/types";
import { PlayerRow } from "@/components/core/games/PlayerRow";
import { MinPlayersWarning } from "@/components/core/games/MinPlayersWarning";

interface PlayersCardProps {
  players: Player[];
  totalPlayers: number;
  minPlayers: number;
}

export function PlayersCard({
  players,
  totalPlayers,
  minPlayers,
}: PlayersCardProps) {
  return (
    <div className="relative bg-[#0A0A0A] py-6 px-4 rounded-xl border-2 border-[#141414] h-auto w-74.25 overflow-hidden">
      {/* Static Glass Shimmer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-xl" />

      {/* Radial Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-radial from-white/5 via-transparent to-transparent blur-xl pointer-events-none" />

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-white/20 rounded-tl-xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-white/20 rounded-br-xl" />

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center w-66.25 h-7.25 justify-between mb-6">
          <div className="flex items-center gap-2 text-[#E8E8E8]">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Total players</span>
          </div>

          {/* Player Count Badge */}
          <div className="w-8 h-8 rounded-full bg-[#78350F]/60 flex items-center justify-center">
            <span className="text-sm font-bold text-[#FCD34D]">
              {totalPlayers}
            </span>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-1">
          {players.map((player) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </div>

        {/* Min Players Warning */}
        <MinPlayersWarning current={totalPlayers} required={minPlayers} />
      </div>
    </div>
  );
}
