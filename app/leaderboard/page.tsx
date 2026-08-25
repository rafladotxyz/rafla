"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, RefreshCw, Trophy } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
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

type Timeframe = "all" | "monthly" | "weekly";

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: "all", label: "All-time" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

const REFRESH_INTERVAL_MS = 30_000;

function shortWallet(wallet: string) {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function Avatar({
  src,
  name,
  className,
}: {
  src: string | null;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 font-bold text-[#CBCBCB] ${className ?? ""}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{(name ?? "?")[0].toUpperCase()}</span>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuthContext();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [reloadTick, setReloadTick] = useState(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const interval = window.setInterval(
      () => setReloadTick((v) => v + 1),
      REFRESH_INTERVAL_MS,
    );
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    fetch(`/api/leaderboard?range=${timeframe}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then(({ leaderboard }) => {
        if (cancelled) return;
        setEntries(Array.isArray(leaderboard) ? leaderboard : []);
        setStatus("ready");
        hasLoadedRef.current = true;
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError"))
          return;
        setStatus("error");
      })
      .finally(() => {
        if (!cancelled) setRefreshing(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [timeframe, reloadTick]);

  const retry = useCallback(() => {
    if (hasLoadedRef.current) {
      setRefreshing(true);
    } else {
      setStatus("loading");
    }
    setReloadTick((v) => v + 1);
  }, []);

  const selectTimeframe = useCallback(
    (value: Timeframe) => {
      if (value !== timeframe && hasLoadedRef.current) {
        setRefreshing(true);
      }
      setTimeframe(value);
    },
    [timeframe],
  );

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const userRankEntry = useMemo(() => {
    if (!user) return null;
    return entries.find(
      (entry) =>
        entry.user.id === user.id ||
        entry.user.wallet.toLowerCase() === user.wallet.toLowerCase(),
    );
  }, [user, entries]);

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-up">
        <h1 className="sr-only">Rafla leaderboard</h1>

        <div
          className="flex justify-center"
          role="group"
          aria-label="Leaderboard period"
        >
          <div className="inline-flex items-center rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur-xl">
            {TIMEFRAMES.map(({ value, label }) => {
              const active = timeframe === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectTimeframe(value)}
                  aria-pressed={active}
                  className={`focus-ring rounded-full px-4 py-2 text-xs font-bold transition-colors sm:px-5 ${
                    active
                      ? "bg-white text-black"
                      : "text-[#8A8A8A] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`transition-opacity duration-200 ${
            refreshing ? "opacity-50" : "opacity-100"
          }`}
        >
          {status === "loading" ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span className="sr-only">Loading leaderboard</span>
            </div>
          ) : status === "error" ? (
            <SurfaceCard className="flex flex-col items-center justify-center gap-4 p-12 text-center">
              <AlertCircle className="h-10 w-10 text-[#8A8A8A]" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-[#F3F3F3]">
                  Couldn&apos;t load the leaderboard
                </p>
                <p className="text-sm text-[#A3A3A3]">
                  Check your connection and try again.
                </p>
              </div>
              <button
                type="button"
                onClick={retry}
                className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </SurfaceCard>
          ) : entries.length === 0 ? (
            <SurfaceCard className="flex flex-col items-center justify-center gap-4 p-12 text-center">
              <Trophy className="h-10 w-10 text-[#444]" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-[#F3F3F3]">
                  No ranked rounds yet
                </p>
                <p className="text-sm text-[#A3A3A3]">
                  Play your first round to claim the top spot on the leaderboard!
                </p>
              </div>
            </SurfaceCard>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {/* Top 3 */}
              <section aria-label="Top three players">
                <SurfaceCard className="px-2 pb-5 pt-7 sm:px-4 md:px-6 md:pb-7 md:pt-9">
                  <div className="grid grid-cols-3 items-end gap-1.5 sm:gap-3">
                    {top3[1] ? (
                      <PodiumSlot entry={top3[1]} place="2nd" champion={false} />
                    ) : (
                      <div aria-hidden />
                    )}
                    {top3[0] ? (
                      <PodiumSlot entry={top3[0]} place="1st" champion />
                    ) : (
                      <div aria-hidden />
                    )}
                    {top3[2] ? (
                      <PodiumSlot entry={top3[2]} place="3rd" champion={false} />
                    ) : (
                      <div aria-hidden />
                    )}
                  </div>
                </SurfaceCard>
              </section>

              {/* Personal rank summary */}
              {user ? (
                <div className="flex justify-center" role="status">
                  <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center text-xs font-medium text-[#CBCBCB] sm:rounded-full sm:px-6">
                    <span className="text-[#8A8A8A]">Your rank</span>
                    {userRankEntry ? (
                      <>
                        <strong className="font-extrabold text-white">
                          #{userRankEntry.rank}
                        </strong>
                        <span aria-hidden>·</span>
                        <strong className="font-extrabold text-white">
                          {userRankEntry.wins}{" "}
                          {userRankEntry.wins === 1 ? "win" : "wins"}
                        </strong>
                        <span aria-hidden>·</span>
                        <strong className="font-extrabold text-emerald-400">
                          {formatCompactCurrency(Number(userRankEntry.totalPrize))}{" "}
                          won
                        </strong>
                      </>
                    ) : (
                      <span>
                        Not ranked in this period yet. Play a round to get listed.
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Ranks 4+ table */}
              {rest.length > 0 ? (
                <section aria-label="Full rankings">
                  <SurfaceCard className="space-y-3 p-3 sm:p-5 md:p-6">
                    <h2 className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A] sm:px-4">
                      Standings
                    </h2>
                    <div className="grid grid-cols-[36px_1fr_60px_80px] items-center gap-2 border-b border-white/10 px-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A] sm:grid-cols-[50px_1fr_100px_120px] sm:gap-4 sm:px-4">
                      <span className="text-center sm:text-left">Rank</span>
                      <span>Participant</span>
                      <span className="text-center">Wins</span>
                      <span className="text-right">Total won</span>
                    </div>

                    <div className="grid gap-2">
                      {rest.map((entry) => {
                        const short = shortWallet(entry.user.wallet);
                        const prize = formatCompactCurrency(Number(entry.totalPrize));
                        const displayName = entry.user.username
                          ? `@${entry.user.username}`
                          : short;
                        const isCurrentUser =
                          user &&
                          (entry.user.id === user.id ||
                            entry.user.wallet.toLowerCase() ===
                              user.wallet.toLowerCase());

                        return (
                          <div
                            key={entry.user.id}
                            className={`grid grid-cols-[36px_1fr_60px_80px] items-center gap-2 rounded-2xl border px-2.5 py-3 transition-colors sm:grid-cols-[50px_1fr_100px_120px] sm:gap-4 sm:px-4 ${
                              isCurrentUser
                                ? "border-[#D946EF]/40 bg-[#D946EF]/[0.07]"
                                : "border-white/10 bg-white/[0.02]"
                            }`}
                          >
                            <span className="text-center text-xs font-bold text-[#CBCBCB]">
                              #{entry.rank}
                            </span>

                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                              <Avatar
                                src={entry.user.avatar}
                                name={entry.user.username ?? entry.user.wallet}
                                className="h-9 w-9 rounded-xl text-xs"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-[#F3F3F3] sm:text-sm">
                                  {displayName}
                                  {isCurrentUser ? (
                                    <span className="ml-1.5 rounded-full bg-[#D946EF]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#E879F9]">
                                      You
                                    </span>
                                  ) : null}
                                </p>
                                <p className="truncate font-mono text-[11px] text-[#8A8A8A]">
                                  {short}
                                </p>
                              </div>
                            </div>

                            <div className="text-center text-xs font-bold text-[#F3F3F3] sm:text-sm">
                              {entry.wins}
                            </div>

                            <div className="min-w-0 text-right text-xs font-bold text-emerald-400 sm:text-sm">
                              <span className="truncate">{prize}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SurfaceCard>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PodiumSlot({
  entry,
  place,
  champion,
}: {
  entry: LeaderboardEntry;
  place: "1st" | "2nd" | "3rd";
  champion: boolean;
}) {
  const name = entry.user.username
    ? `@${entry.user.username}`
    : shortWallet(entry.user.wallet);

  return (
    <div
      className={`flex min-w-0 flex-col items-center rounded-[22px] text-center ${
        champion ? "bg-[#D946EF]/[0.05] px-1.5 pb-3 pt-4 sm:px-3 md:pb-5" : "px-1 pb-1"
      }`}
    >
      <span
        className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
          champion ? "text-[#E879F9]" : "text-[#8A8A8A]"
        }`}
      >
        {place}
      </span>

      <span
        aria-hidden
        className={`font-black leading-none tracking-tight tabular-nums ${
          champion
            ? "mt-2 text-6xl text-[#D946EF] sm:text-7xl md:text-8xl"
            : "mt-2 text-3xl text-[#5B5B5B] sm:text-4xl"
        }`}
      >
        {place.charAt(0)}
      </span>

      <Avatar
        src={entry.user.avatar}
        name={entry.user.username ?? entry.user.wallet}
        className={`mt-3 ${
          champion
            ? "h-16 w-16 ring-2 ring-[#D946EF]/60 sm:h-20 sm:w-20 md:h-24 md:w-24"
            : "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16"
        }`}
      />

      <h3
        className={`mt-2.5 max-w-full truncate font-bold text-[#F3F3F3] ${
          champion ? "text-sm sm:text-lg" : "text-xs sm:text-sm"
        }`}
      >
        {name}
      </h3>
      <p className="max-w-full truncate font-mono text-[10px] text-[#8A8A8A] sm:text-[11px]">
        {shortWallet(entry.user.wallet)}
      </p>

      <div className="mt-2 border-t border-white/10 pt-2">
        <p
          className={`truncate font-bold tabular-nums text-[#F3F3F3] ${
            champion ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
          }`}
        >
          {formatCompactCurrency(Number(entry.totalPrize))}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A8A] sm:text-[11px]">
          {entry.wins} {entry.wins === 1 ? "win" : "wins"}
        </p>
      </div>
    </div>
  );
}
