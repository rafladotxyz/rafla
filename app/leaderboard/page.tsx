"use client";

import { useEffect, useState } from "react";
import { Medal, Trophy, Users, Award, Crown, Sparkles } from "lucide-react";
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

  const totalPrizeDistributed = leaderboard.reduce(
    (acc, curr) => acc + Number(curr.totalPrize ?? 0) / 1_000_000,
    0,
  );

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-up">
        <GameHeader gameName="Leaderboard" />

        {/* Hero Feature Banner */}
        <SurfaceCard as="section" className="overflow-hidden p-0 border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent shadow-2xl">
          <div className="relative p-6 md:p-8">
            <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-[80px]" />
            <div className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-violet-500/15 blur-[90px]" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300 backdrop-blur-md">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  Global Standings
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#F3F3F3] sm:text-4xl">
                  Rafla Champions Hall
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-[#A3A3A3]">
                  Real-time victory leaderboard ranking top players by round wins and total prize earnings.
                </p>
              </div>

              {/* Metrics Strip */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
                  <Users className="h-5 w-5 text-[#8A8A8A]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A8A8A]">
                      Players
                    </p>
                    <p className="text-base font-bold text-[#F3F3F3]">
                      {leaderboard.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 backdrop-blur-md">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/80">
                      Prize Won
                    </p>
                    <p className="text-base font-bold text-amber-300">
                      ${totalPrizeDistributed.toFixed(2)}
                    </p>
                  </div>
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
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-end">
                
                {/* 2nd Place Silver Card */}
                {top3[1] ? (
                  <SurfaceCard className="relative overflow-hidden border-slate-300/30 bg-gradient-to-b from-slate-300/10 via-slate-300/5 to-black/70 p-6 text-center shadow-[0_12px_40px_rgba(203,203,203,0.12)] md:order-1">
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-slate-300/30 bg-slate-300/10 px-3 py-1 text-xs font-bold text-slate-200">
                      🥈 2nd Place
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                      <div className="h-20 w-20 overflow-hidden rounded-[24px] border-2 border-slate-300/40 bg-white/5 shadow-xl p-0.5">
                        {top3[1].user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={top3[1].user.avatar} alt="" className="h-full w-full rounded-[20px] object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-slate-800 text-2xl font-bold text-slate-200">
                            {(top3[1].user.username ?? top3[1].user.wallet)[0].toUpperCase()}
                          </div>
                        )}
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-[#F3F3F3] truncate max-w-[180px]">
                        {top3[1].user.username ? `@${top3[1].user.username}` : `${top3[1].user.wallet.slice(0, 6)}...`}
                      </h3>
                      <p className="font-mono text-xs text-[#8A8A8A]">
                        {top3[1].user.wallet.slice(0, 6)}...{top3[1].user.wallet.slice(-4)}
                      </p>

                      <div className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs">
                        <div className="text-left">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Wins</p>
                          <p className="text-base font-bold text-[#F3F3F3]">{top3[1].wins}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Prize Won</p>
                          <p className="text-base font-bold text-slate-200">${(Number(top3[1].totalPrize) / 1_000_000).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </SurfaceCard>
                ) : null}

                {/* 1st Place Gold Champion Card (Elevated Center) */}
                {top3[0] ? (
                  <SurfaceCard className="relative overflow-hidden border-amber-500/40 bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-black/80 p-6 text-center md:-translate-y-3 md:order-2 shadow-[0_16px_50px_rgba(245,166,35,0.25)]">
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300">
                      👑 #1 Champion
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                      <div className="h-24 w-24 p-1 rounded-[28px] bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-2xl">
                        <div className="h-full w-full overflow-hidden rounded-[24px] bg-neutral-900">
                          {top3[0].user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={top3[0].user.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-amber-300">
                              {(top3[0].user.username ?? top3[0].user.wallet)[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-4 text-xl font-bold text-amber-200 truncate max-w-[200px]">
                        {top3[0].user.username ? `@${top3[0].user.username}` : `${top3[0].user.wallet.slice(0, 6)}...`}
                      </h3>
                      <p className="font-mono text-xs text-[#8A8A8A]">
                        {top3[0].user.wallet.slice(0, 6)}...{top3[0].user.wallet.slice(-4)}
                      </p>

                      <div className="mt-5 flex w-full items-center justify-between rounded-xl border border-amber-500/30 bg-black/60 px-4 py-3 text-xs">
                        <div className="text-left">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Wins</p>
                          <p className="text-xl font-extrabold text-amber-300">{top3[0].wins}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Prize Won</p>
                          <p className="text-xl font-extrabold text-amber-300">${(Number(top3[0].totalPrize) / 1_000_000).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </SurfaceCard>
                ) : null}

                {/* 3rd Place Bronze Card */}
                {top3[2] ? (
                  <SurfaceCard className="relative overflow-hidden border-amber-700/40 bg-gradient-to-b from-amber-700/15 via-amber-700/5 to-black/70 p-6 text-center shadow-[0_12px_40px_rgba(180,83,9,0.15)] md:order-3">
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-amber-700/40 bg-amber-700/15 px-3 py-1 text-xs font-bold text-amber-400">
                      🥉 3rd Place
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                      <div className="h-20 w-20 overflow-hidden rounded-[24px] border-2 border-amber-700/40 bg-white/5 shadow-xl p-0.5">
                        {top3[2].user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={top3[2].user.avatar} alt="" className="h-full w-full rounded-[20px] object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-amber-950 text-2xl font-bold text-amber-400">
                            {(top3[2].user.username ?? top3[2].user.wallet)[0].toUpperCase()}
                          </div>
                        )}
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-[#F3F3F3] truncate max-w-[180px]">
                        {top3[2].user.username ? `@${top3[2].user.username}` : `${top3[2].user.wallet.slice(0, 6)}...`}
                      </h3>
                      <p className="font-mono text-xs text-[#8A8A8A]">
                        {top3[2].user.wallet.slice(0, 6)}...{top3[2].user.wallet.slice(-4)}
                      </p>

                      <div className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs">
                        <div className="text-left">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Wins</p>
                          <p className="text-base font-bold text-[#F3F3F3]">{top3[2].wins}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Prize Won</p>
                          <p className="text-base font-bold text-amber-400">${(Number(top3[2].totalPrize) / 1_000_000).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </SurfaceCard>
                ) : null}
              </div>
            ) : null}

            {/* Remaining Rankings Table (#4+) */}
            {rest.length > 0 ? (
              <SurfaceCard className="p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A8A8A]">
                    Rankings Ledger (#4 - #{leaderboard.length})
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
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition-all hover:border-white/20 hover:bg-white/[0.06]"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-8 text-center text-xs font-bold text-[#8A8A8A]">
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
                          <p className="text-xs font-medium text-[#8A8A8A]">
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
