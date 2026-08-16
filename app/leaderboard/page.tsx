"use client";

import { useEffect, useState } from "react";
import { Medal, Trophy, Users, Award, Crown } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GameHeader } from "@/components/core/games/GameHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

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

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-up">
        <GameHeader gameName="Leaderboard" />

        {/* Hero Feature Card */}
        <SurfaceCard as="section" className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">
                <Crown className="h-3.5 w-3.5" />
                Global Standings
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F3F3F3] sm:text-4xl">
                Rafla Leaderboard
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#A3A3A3]">
                Top players ranked by victory count and total prize earnings across all game modes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Users className="h-5 w-5 text-[#8A8A8A]" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
                    Total Players
                  </p>
                  <p className="text-base font-bold text-[#F3F3F3]">
                    {leaderboard.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                <Trophy className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400/80">
                    Top Champion
                  </p>
                  <p className="text-base font-bold text-amber-300 truncate max-w-[100px]">
                    {leaderboard[0]?.user.username
                      ? `@${leaderboard[0].user.username}`
                      : leaderboard[0]
                      ? `${leaderboard[0].user.wallet.slice(0, 4)}...`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <SurfaceCard className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <Trophy className="h-10 w-10 text-[#444]" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-[#F3F3F3]">
                No Leaderboard Entries Yet
              </p>
              <p className="text-sm text-[#A3A3A3]">
                Play your first round to claim the top spot on the leaderboard!
              </p>
            </div>
          </SurfaceCard>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium Cards */}
            {top3.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* 2nd Place */}
                {top3[1] ? (
                  <SurfaceCard className="relative overflow-hidden border-slate-300/20 bg-gradient-to-b from-slate-300/10 via-slate-300/5 to-transparent p-6 text-center md:order-1">
                    <span className="absolute left-4 top-4 rounded-full border border-slate-300/30 bg-slate-300/10 px-3 py-1 text-xs font-bold text-slate-300">
                      🥈 2nd Place
                    </span>
                    <div className="mt-8 flex flex-col items-center">
                      <div className="h-20 w-20 overflow-hidden rounded-[24px] border-2 border-slate-300/30 bg-white/5 shadow-xl">
                        {top3[1].user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={top3[1].user.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-200">
                            {(top3[1].user.username ?? top3[1].user.wallet)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-[#F3F3F3] truncate max-w-[180px]">
                        {top3[1].user.username ? `@${top3[1].user.username}` : `${top3[1].user.wallet.slice(0, 6)}...`}
                      </h3>
                      <p className="font-mono text-xs text-[#8A8A8A]">
                        {top3[1].user.wallet.slice(0, 6)}...{top3[1].user.wallet.slice(-4)}
                      </p>

                      <div className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-4 text-xs">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#8A8A8A]">Wins</p>
                          <p className="text-base font-bold text-[#F3F3F3]">{top3[1].wins}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-[#8A8A8A]">Won</p>
                          <p className="text-base font-bold text-slate-300">${(Number(top3[1].totalPrize) / 1_000_000).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </SurfaceCard>
                ) : null}

                {/* 1st Place Gold */}
                {top3[0] ? (
                  <SurfaceCard className="relative overflow-hidden border-amber-500/30 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent p-6 text-center md:-translate-y-2 md:order-2 shadow-[0_10px_30px_rgba(245,166,35,0.15)]">
                    <span className="absolute left-4 top-4 rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                      🥇 1st Place Champion
                    </span>
                    <div className="mt-8 flex flex-col items-center">
                      <div className="h-24 w-24 overflow-hidden rounded-[28px] border-4 border-amber-500/40 bg-white/5 shadow-2xl">
                        {top3[0].user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={top3[0].user.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-amber-300">
                            {(top3[0].user.username ?? top3[0].user.wallet)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h3 className="mt-3 text-xl font-bold text-amber-200 truncate max-w-[200px]">
                        {top3[0].user.username ? `@${top3[0].user.username}` : `${top3[0].user.wallet.slice(0, 6)}...`}
                      </h3>
                      <p className="font-mono text-xs text-[#8A8A8A]">
                        {top3[0].user.wallet.slice(0, 6)}...{top3[0].user.wallet.slice(-4)}
                      </p>

                      <div className="mt-5 flex w-full items-center justify-between border-t border-amber-500/20 pt-4 text-xs">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-amber-400/80">Wins</p>
                          <p className="text-xl font-extrabold text-amber-300">{top3[0].wins}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-amber-400/80">Total Won</p>
                          <p className="text-xl font-extrabold text-amber-300">${(Number(top3[0].totalPrize) / 1_000_000).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </SurfaceCard>
                ) : null}

                {/* 3rd Place */}
                {top3[2] ? (
                  <SurfaceCard className="relative overflow-hidden border-amber-700/30 bg-gradient-to-b from-amber-700/10 via-amber-700/5 to-transparent p-6 text-center md:order-3">
                    <span className="absolute left-4 top-4 rounded-full border border-amber-700/30 bg-amber-700/10 px-3 py-1 text-xs font-bold text-amber-500">
                      🥉 3rd Place
                    </span>
                    <div className="mt-8 flex flex-col items-center">
                      <div className="h-20 w-20 overflow-hidden rounded-[24px] border-2 border-amber-700/30 bg-white/5 shadow-xl">
                        {top3[2].user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={top3[2].user.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-amber-500">
                            {(top3[2].user.username ?? top3[2].user.wallet)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-[#F3F3F3] truncate max-w-[180px]">
                        {top3[2].user.username ? `@${top3[2].user.username}` : `${top3[2].user.wallet.slice(0, 6)}...`}
                      </h3>
                      <p className="font-mono text-xs text-[#8A8A8A]">
                        {top3[2].user.wallet.slice(0, 6)}...{top3[2].user.wallet.slice(-4)}
                      </p>

                      <div className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-4 text-xs">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#8A8A8A]">Wins</p>
                          <p className="text-base font-bold text-[#F3F3F3]">{top3[2].wins}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-[#8A8A8A]">Won</p>
                          <p className="text-base font-bold text-amber-500">${(Number(top3[2].totalPrize) / 1_000_000).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </SurfaceCard>
                ) : null}
              </div>
            ) : null}

            {/* Remaining Rankings List (#4+) */}
            {rest.length > 0 ? (
              <SurfaceCard className="p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
                    Rankings Table (#4 - #{leaderboard.length})
                  </p>
                </div>

                <div className="grid gap-2.5">
                  {rest.map((entry) => {
                    const short = `${entry.user.wallet.slice(0, 6)}...${entry.user.wallet.slice(-4)}`;
                    const prize = (Number(entry.totalPrize) / 1_000_000).toFixed(2);
                    const displayName = entry.user.username ? `@${entry.user.username}` : short;

                    return (
                      <div
                        key={entry.user.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-8 text-center text-sm font-bold text-[#8A8A8A]">
                            #{entry.rank}
                          </span>
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-xs font-bold text-[#CBCBCB]">
                            {entry.user.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={entry.user.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              (entry.user.username ?? entry.user.wallet)[0].toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#F3F3F3]">
                              {displayName}
                            </p>
                            <p className="font-mono text-xs text-[#8A8A8A]">
                              {short}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-[#F3F3F3]">
                            {entry.wins} {entry.wins === 1 ? "win" : "wins"}
                          </p>
                          <p className="text-xs text-[#8A8A8A]">
                            ${prize} won
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SurfaceCard>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
