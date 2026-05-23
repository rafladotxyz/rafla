"use client";

import { useEffect, useState } from "react";
import { Medal, Trophy, Users } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GameHeader } from "@/components/core/games/GameHeader";

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
    <div className="min-h-screen px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center pt-6">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 animate-fade-up">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <GameHeader gameName="Leaderboard" />
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#8A8A8A]">
                Rankings
              </span>
              <h1 className="text-3xl font-medium text-[#F3F3F3] md:text-5xl">
                Who is leading the table.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#A3A3A3] md:text-base">
                Wins are ranked first. Prize totals are shown as a secondary stat so the board reads fast on mobile and desktop.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <StatPill label="Players" value={String(leaderboard.length)} icon={Users} />
              <StatPill label="Top rank" value="🥇" icon={Medal} />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <Trophy className="h-10 w-10 text-[#444]" />
              <div>
                <p className="text-lg font-medium text-[#F3F3F3]">No games settled yet</p>
                <p className="mt-1 text-sm text-[#A3A3A3]">Be the first player to show up here.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {leaderboard.length >= 3 && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
                    if (!entry) return null;
                    const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                    const short = `${entry.user.wallet.slice(0, 4)}...${entry.user.wallet.slice(-3)}`;

                    return (
                      <div
                        key={entry.user.id}
                        className={`rounded-[24px] border border-white/10 bg-black/20 p-4 ${actualRank === 1 ? "md:-translate-y-2" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{MEDAL[actualRank - 1]}</span>
                          <span className="text-xs uppercase tracking-[0.18em] text-[#737373]">Rank {actualRank}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-sm text-[#CBCBCB]">
                            {entry.user.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={entry.user.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              (entry.user.username ?? entry.user.wallet)[0].toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#F3F3F3]">
                              {entry.user.username ? `@${entry.user.username}` : short}
                            </p>
                            <p className="truncate font-mono text-[11px] text-[#8A8A8A]">{short}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-semibold text-[#F3F3F3]">{entry.wins}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-[#737373]">wins</p>
                          </div>
                          <p className="text-sm text-[#CBCBCB]">${(Number(entry.totalPrize) / 1_000_000).toFixed(2)} won</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {leaderboard.map((entry) => {
                  const short = `${entry.user.wallet.slice(0, 6)}...${entry.user.wallet.slice(-4)}`;
                  const prize = (Number(entry.totalPrize) / 1_000_000).toFixed(2);
                  const displayName = entry.user.username ? `@${entry.user.username}` : short;

                  return (
                    <div
                      key={entry.user.id}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-white/20"
                    >
                      <div className="w-8 text-center">
                        {entry.rank <= 3 ? (
                          <span className="text-[16px]">{MEDAL[entry.rank - 1]}</span>
                        ) : (
                          <span className="text-[14px] text-[#737373]">#{entry.rank}</span>
                        )}
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-[13px] text-[#CBCBCB]">
                        {entry.user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={entry.user.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (entry.user.username ?? entry.user.wallet)[0].toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-[#F3F3F3]">{displayName}</p>
                        {entry.user.username && <p className="truncate font-mono text-[11px] text-[#8A8A8A]">{short}</p>}
                      </div>

                      <div className="flex shrink-0 flex-col items-end">
                        <p className="text-sm font-medium text-[#F3F3F3]">{entry.wins} {entry.wins === 1 ? "win" : "wins"}</p>
                        <p className="text-[11px] text-[#8A8A8A]">${prize} won</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Users;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-[#E8E8E8]">
      <Icon size={16} className="text-[#A3A3A3]" />
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A8A8A]">{label}</p>
        <p className="text-sm font-medium text-[#F3F3F3]">{value}</p>
      </div>
    </div>
  );
}
