"use client";

import { Users } from "lucide-react";
import { Player } from "@/type/types";
import { PlayerRow } from "./PlayerRow";
import { MinPlayersWarning } from "./MinPlayersWarning";

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
    <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-6 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[#E8E8E8]">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">Total players</span>
        </div>

        {/* Player Count Badge */}
        <div className="w-8 h-8 rounded-full bg-[#78350F] flex items-center justify-center">
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
  );
}
