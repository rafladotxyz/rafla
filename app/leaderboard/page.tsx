"use client";

import { useState, useEffect } from "react";
import { GameTabs } from "@/components/core/games/GameTabs";

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    wallet: string;
    username: string | null;
    avatar: string | null;
  };
  wins: number;
  totalPrize: string;
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(({ leaderboard }) => setLeaderboard(leaderboard ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 py-0 font-sans">
      {/* Header */}
      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <p className="text-[20px] font-semibold text-[#D9D9D9]">Leaderboard</p>
        <p className="text-[14px] text-[#737373]">Top Rafla players by wins</p>
      </div>

      <div className="w-312 ml-auto mr-auto mt-6 flex flex-col gap-3">
        {/* Top 3 podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map(
              (entry, i) => {
                if (!entry) return null;
                const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                const heights = ["h-24", "h-32", "h-20"];
                const short = `${entry.user.wallet.slice(0, 4)}...${entry.user.wallet.slice(-3)}`;

                return (
                  <div
                    key={entry.user.id}
                    className={`flex flex-col items-center justify-end gap-2 ${heights[i]} p-3 rounded-2xl bg-[#141414] border border-[#282828]`}
                  >
                    <span className="text-[20px]">{MEDAL[actualRank - 1]}</span>
                    <div className="w-8 h-8 rounded-full bg-[#1f1f1f] border border-[#282828] flex items-center justify-center text-[12px] text-[#CBCBCB] overflow-hidden">
                      {entry.user.avatar ? (
                        <img
                          src={entry.user.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (entry.user.username ??
                          entry.user.wallet)[0].toUpperCase()
                      )}
                    </div>
                    <p className="text-[11px] text-[#CBCBCB] truncate w-full text-center">
                      {entry.user.username ?? short}
                    </p>
                    <p className="text-[11px] text-[#737373]">{entry.wins}W</p>
                  </div>
                );
              },
            )}
          </div>
        )}

        {/* Full list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex items-center justify-center py-16 rounded-2xl bg-[#141414] border border-[#282828]">
            <p className="text-[14px] text-[#737373]">
              No games settled yet — be the first!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {leaderboard.map((entry) => {
              const short = `${entry.user.wallet.slice(0, 6)}...${entry.user.wallet.slice(-4)}`;
              const prize = (Number(entry.totalPrize) / 1_000_000).toFixed(2);

              return (
                <div
                  key={entry.user.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-[#141414] border border-[#282828] hover:border-[#333] transition-colors"
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-[16px]">
                        {MEDAL[entry.rank - 1]}
                      </span>
                    ) : (
                      <span className="text-[14px] text-[#737373]">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#1f1f1f] border border-[#282828] flex items-center justify-center text-[13px] text-[#CBCBCB] overflow-hidden shrink-0">
                    {entry.user.avatar ? (
                      <img
                        src={entry.user.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (entry.user.username ??
                        entry.user.wallet)[0].toUpperCase()
                    )}
                  </div>

                  {/* Name + wallet */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-[14px] text-[#CBCBCB] truncate">
                      {entry.user.username ?? short}
                    </p>
                    {entry.user.username && (
                      <p className="text-[11px] text-[#737373] font-mono truncate">
                        {short}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col items-end shrink-0">
                    <p className="text-[14px] font-medium text-[#D9D9D9]">
                      {entry.wins} {entry.wins === 1 ? "win" : "wins"}
                    </p>
                    <p className="text-[11px] text-[#737373]">${prize} won</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
