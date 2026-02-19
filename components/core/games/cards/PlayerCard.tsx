"use client";

import { Users } from "lucide-react";
import { Player } from "@/type/types";
import { PlayerRow } from "@/components/core/games/PlayerRow";
import { MinPlayersWarning } from "@/components/core/games/MinPlayersWarning";
import { GlassCard } from "@/components/ui/GlassCard";

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
    <GlassCard className="bg-[#0A0A0A]  py-6 px-4 w-74.25 ">
      {/* Header */}
      <div className="flex items-center  w-66.25 h-7.25 justify-between mb-6">
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
    </GlassCard>
  );
}
