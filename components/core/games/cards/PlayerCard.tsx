"use client";

import { Users } from "lucide-react";
import { Player } from "@/type/types";
import { MinPlayersWarning } from "@/components/core/games/MinPlayersWarning";
import { GlassCard } from "@/components/ui/GlassCard";

interface PlayersCardProps {
  players: Player[];
  totalPlayers: number;
  minPlayers: number;
}

function PlayerAvatar({ player }: { player: Player }) {
  const initial = (player.username ?? player.address ?? "?")[0].toUpperCase();

  return (
    <div className="flex items-center gap-3 py-1.5">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[13px] font-semibold text-white"
        style={{
          backgroundColor: player.avatar ? "transparent" : player.color,
        }}
      >
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={player.username ?? player.address}
            className="w-full h-full object-cover"
          />
        ) : (
          initial
        )}
      </div>

      {/* Address / username */}
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] text-[#E8E8E8] truncate font-mono">
          {player.username
            ? player.username
            : `${player.address.slice(0, 6)}...${player.address.slice(-4)}`}
        </span>
        {player.isYou && (
          <span className="text-[10px] text-[#737373]">You</span>
        )}
      </div>
    </div>
  );
}

export function PlayersCard({
  players,
  totalPlayers,
  minPlayers,
}: PlayersCardProps) {
  return (
    <GlassCard className="bg-[#0A0A0A] py-6 px-4 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[#E8E8E8]">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">Total players</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#78350F]/60 flex items-center justify-center">
          <span className="text-sm font-bold text-[#FCD34D]">
            {totalPlayers}
          </span>
        </div>
      </div>

      {/* Players list */}
      <div className="space-y-1">
        {players.length === 0 ? (
          <p className="text-[13px] text-[#737373] py-4 text-center">
            No players yet
          </p>
        ) : (
          players.map((player) => (
            <PlayerAvatar key={player.id} player={player} />
          ))
        )}
      </div>

      <MinPlayersWarning current={totalPlayers} required={minPlayers} />
    </GlassCard>
  );
}
