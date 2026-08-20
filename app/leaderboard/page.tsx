"use client";

import { useEffect, useState, useMemo } from "react";
import { Medal, Trophy, Users, Award, Crown, Sparkles, UserCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GameHeader } from "@/components/core/games/GameHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useAuthContext } from "@/context/AuthContext";
import { formatCompactCurrency } from "@/utils/utils";

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
  const { user } = useAuthContext();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"all" | "monthly" | "weekly">("all");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(({ leaderboard }) => setLeaderboard(leaderboard ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // User's personal rank entry if logged in
  const userRankEntry = useMemo(() => {
    if (!user) return null;
    return leaderboard.find(
      (entry) =>
        entry.user.id === user.id ||
        entry.user.wallet.toLowerCase() === user.wallet.toLowerCase(),
    );
  }, [user, leaderboard]);

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-up">

        {/* Timeframe Filter Tab Bar (Reference UI style) */}
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-black/60 p-1 shadow-2xl backdrop-blur-xl">
            {(["all", "monthly", "weekly"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`rounded-full px-5 py-2 text-xs font-bold capitalize transition-all ${
                  timeframe === t
                    ? "bg-white text-black shadow-md"
                    : "text-[#8A8A8A] hover:text-white"
                }`}
              >
                {t === "all" ? "All-Time" : t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
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
            {/* 3D Stage Podium Section (Reference UI Style) */}
            {top3.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-end pt-4">
                
                {/* #2 Left Podium (Runner-Up) - order-2 on mobile, md:order-1 on desktop */}
                {top3[1] ? (
                  <div className="order-2 md:order-1 relative flex flex-col items-center rounded-[28px] border border-slate-300/30 bg-gradient-to-b from-slate-300/10 via-slate-300/[0.03] to-black/90 p-5 md:p-6 text-center shadow-[0_12px_40px_rgba(203,203,203,0.12)] backdrop-blur-xl min-h-[240px] md:min-h-[260px] justify-between">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/30 bg-slate-300/10 px-3 py-1 text-xs font-bold text-slate-200">
                      🥈 2nd Place
                    </div>

                    <div className="my-3 md:my-4 flex flex-col items-center">
                      <div className="h-16 w-16 md:h-20 md:w-20 p-1 rounded-[24px] bg-gradient-to-br from-slate-300 to-slate-500 shadow-xl">
                        <div className="h-full w-full overflow-hidden rounded-[20px] bg-neutral-900">
                          {top3[1].user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={top3[1].user.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl md:text-2xl font-bold text-slate-200">
                              {(top3[1].user.username ?? top3[1].user.wallet)[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-[#F3F3F3] truncate max-w-[160px]">
                        {top3[1].user.username ? `@${top3[1].user.username}` : `${top3[1].user.wallet.slice(0, 6)}...`}
                      </h3>
                      <p className="font-mono text-[11px] text-[#8A8A8A]">
                        {top3[1].user.wallet.slice(0, 6)}...{top3[1].user.wallet.slice(-4)}
                      </p>
                    </div>

                    <div className="w-full rounded-2xl border border-white/10 bg-black/50 p-3">
                      <p className="text-xl font-extrabold text-[#F3F3F3] truncate">
                        ${formatCompactCurrency(Number(top3[1].totalPrize) / 1_000_000)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                        {top3[1].wins} {top3[1].wins === 1 ? "win" : "wins"}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* #1 Center Champion Podium (Tallest Stage) - order-1 on mobile, md:order-2 on desktop */}
                {top3[0] ? (
                  <div className="order-1 md:order-2 relative flex flex-col items-center rounded-[32px] border border-amber-500/40 bg-gradient-to-b from-amber-500/20 via-amber-500/[0.05] to-black/95 p-6 md:p-7 text-center shadow-[0_20px_60px_rgba(245,166,35,0.25)] backdrop-blur-xl md:-translate-y-4 min-h-[270px] md:min-h-[310px] justify-between">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-4 py-1 text-xs font-extrabold text-amber-300">
                      👑 #1 Champion
                    </div>

                    <div className="my-3 md:my-4 flex flex-col items-center">
                      <div className="h-20 w-20 md:h-24 md:w-24 p-1 rounded-[28px] bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-2xl">
                        <div className="h-full w-full overflow-hidden rounded-[24px] bg-neutral-900">
                          {top3[0].user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={top3[0].user.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl md:text-3xl font-bold text-amber-300">
                              {(top3[0].user.username ?? top3[0].user.wallet)[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-3 text-lg font-extrabold text-amber-200 truncate max-w-[180px]">
                        {top3[0].user.username ? `@${top3[0].user.username}` : `${top3[0].user.wallet.slice(0, 6)}...`}
                      </h3>
                      <p className="font-mono text-xs text-[#8A8A8A]">
                        {top3[0].user.wallet.slice(0, 6)}...{top3[0].user.wallet.slice(-4)}
                      </p>
                    </div>

                    <div className="w-full rounded-2xl border border-amber-500/30 bg-black/60 p-3.5">
                      <p className="text-2xl font-black text-amber-300 truncate">
                        ${formatCompactCurrency(Number(top3[0].totalPrize) / 1_000_000)}
                      </p>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400/80">
                        {top3[0].wins} {top3[0].wins === 1 ? "win" : "wins"}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* #3 Right Podium (Third Place) - order-3 on mobile, md:order-3 on desktop */}
                {top3[2] ? (
                  <div className="order-3 md:order-3 relative flex flex-col items-center rounded-[28px] border border-amber-700/40 bg-gradient-to-b from-amber-700/15 via-amber-700/[0.03] to-black/90 p-5 md:p-6 text-center shadow-[0_12px_40px_rgba(180,83,9,0.15)] backdrop-blur-xl min-h-[240px] justify-between">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/40 bg-amber-700/15 px-3 py-1 text-xs font-bold text-amber-400">
                      🥉 3rd Place
                    </div>

                    <div className="my-3 md:my-4 flex flex-col items-center">
                      <div className="h-16 w-16 md:h-20 md:w-20 p-1 rounded-[24px] bg-gradient-to-br from-amber-700 to-amber-900 shadow-xl">
                        <div className="h-full w-full overflow-hidden rounded-[20px] bg-neutral-900">
                          {top3[2].user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={top3[2].user.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl md:text-2xl font-bold text-amber-400">
                              {(top3[2].user.username ?? top3[2].user.wallet)[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-[#F3F3F3] truncate max-w-[160px]">
                        {top3[2].user.username ? `@${top3[2].user.username}` : `${top3[2].user.wallet.slice(0, 6)}...`}
                      </h3>
                      <p className="font-mono text-[11px] text-[#8A8A8A]">
                        {top3[2].user.wallet.slice(0, 6)}...{top3[2].user.wallet.slice(-4)}
                      </p>
                    </div>

                    <div className="w-full rounded-2xl border border-white/10 bg-black/50 p-3">
                      <p className="text-xl font-extrabold text-[#F3F3F3] truncate">
                        ${formatCompactCurrency(Number(top3[2].totalPrize) / 1_000_000)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                        {top3[2].wins} {top3[2].wins === 1 ? "win" : "wins"}
                      </p>
                    </div>
                  </div>
                ) : null}

              </div>
            ) : null}

            {/* Personal User Rank Summary Banner (Reference UI style) */}
            {user ? (
              <div className="flex justify-center">
                <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-2xl sm:rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 sm:px-6 text-xs font-semibold text-violet-300 shadow-xl backdrop-blur-xl text-center">
                  <UserCheck className="h-4 w-4 shrink-0 text-violet-400" />
                  {userRankEntry ? (
                    <span>
                      Your Personal Rank:{" "}
                      <strong className="text-white">#{userRankEntry.rank}</strong> ·{" "}
                      <strong className="text-white">{userRankEntry.wins} wins</strong> ·{" "}
                      <strong className="text-emerald-400">${formatCompactCurrency(Number(userRankEntry.totalPrize) / 1_000_000)} won</strong>
                    </span>
                  ) : (
                    <span>
                      You haven’t ranked yet. Play a round to get listed!
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {/* Sleek Leaderboard Table (Ranks #4+) */}
            {rest.length > 0 ? (
              <SurfaceCard className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                {/* Table Header Row */}
                <div className="grid grid-cols-[36px_1fr_60px_80px] sm:grid-cols-[50px_1fr_100px_120px] items-center gap-2 sm:gap-4 border-b border-white/10 px-2 sm:px-4 pb-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-[0.18em] text-[#8A8A8A]">
                  <span className="text-center sm:text-left">Rank</span>
                  <span>Participant</span>
                  <span className="text-center">Wins</span>
                  <span className="text-right">Total Won</span>
                </div>

                {/* Table List Items */}
                <div className="grid gap-2">
                  {rest.map((entry) => {
                    const short = `${entry.user.wallet.slice(0, 6)}...${entry.user.wallet.slice(-4)}`;
                    const prize = formatCompactCurrency(Number(entry.totalPrize) / 1_000_000);
                    const displayName = entry.user.username ? `@${entry.user.username}` : short;
                    const isCurrentUser =
                      user &&
                      (entry.user.id === user.id ||
                        entry.user.wallet.toLowerCase() === user.wallet.toLowerCase());

                    return (
                      <div
                        key={entry.user.id}
                        className={`grid grid-cols-[36px_1fr_60px_80px] sm:grid-cols-[50px_1fr_100px_120px] items-center gap-2 sm:gap-4 rounded-2xl border px-2.5 sm:px-4 py-2.5 sm:py-3 transition-colors ${
                          isCurrentUser
                            ? "border-violet-500/40 bg-violet-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="text-center text-xs font-bold text-[#8A8A8A]">
                          #{entry.rank}
                        </span>

                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-xs font-bold text-[#CBCBCB]">
                            {entry.user.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={entry.user.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              (entry.user.username ?? entry.user.wallet)[0].toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#F3F3F3]">
                              {displayName}
                              {isCurrentUser ? (
                                <span className="ml-1 sm:ml-1.5 rounded-full bg-violet-500/30 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-extrabold text-violet-300">
                                  You
                                </span>
                              ) : null}
                            </p>
                            <p className="font-mono text-[10px] sm:text-[11px] text-[#8A8A8A] truncate">
                              {short}
                            </p>
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="text-xs font-bold text-[#F3F3F3]">
                            {entry.wins}
                          </span>
                        </div>

                        <div className="text-right min-w-0">
                          <span className="text-xs font-bold text-emerald-400 truncate block">
                            ${prize}
                          </span>
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
