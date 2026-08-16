"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Gamepad2,
  History as HistoryIcon,
  Search,
  Trophy,
  UserRound,
  Filter,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { GameHeader } from "@/components/core/games/GameHeader";

interface GameHistoryItem {
  id: string;
  roomId: string;
  gameType: string;
  prizeAmount: string;
  settledAt: string;
  isWin: boolean;
  token?: string;
  stakeAmount?: string | number;
  joinedAt?: string;
  txHash?: string | null;
  status?: string;
}

function formatDisplayAmount(val: number | string): string {
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return parseFloat(num.toFixed(6)).toString();
}

function getHistoryToken(item: Pick<GameHistoryItem, "gameType" | "token">) {
  if (item.token) return item.token;
  return item.gameType === "flip" || item.gameType === "spin" ? "OAR" : "USDC";
}

function getTokenDecimals(token: string) {
  return token === "USDC" ? 6 : 18;
}

function toDisplayTokenAmount(
  value: string | number | null | undefined,
  token: string,
  legacyDisplayUnits = false,
) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 0;
  if (legacyDisplayUnits) return amount;
  return amount / 10 ** getTokenDecimals(token);
}

function formatTokenAmount(amount: number, token: string, sign = "") {
  const formatted = formatDisplayAmount(amount);
  if (token === "USDC") return `${sign}$${formatted}`;
  return `${sign}${formatted} ${token}`;
}

function isLegacyInstantHistoryItem(item: Pick<GameHistoryItem, "gameType" | "token">) {
  return !item.token && (item.gameType === "flip" || item.gameType === "spin");
}

export default function FullHistoryPage() {
  const { user, isAuthenticated, isLoading, authHeaders, signIn } = useAuthContext();
  const router = useRouter();

  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameType, setSelectedGameType] = useState<string>("all");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("all");

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/user/history", { headers: authHeaders() });
      if (res.ok) {
        const { history } = await res.json();
        setHistory(history);
      }
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (!user) return;
    void fetchHistory();
  }, [user, fetchHistory]);

  const wins = history.filter((h) => h.isWin).length;
  const winRate = history.length > 0 ? ((wins / history.length) * 100).toFixed(0) : "0";

  const totalWonUSDC = history
    .filter((h) => h.isWin && getHistoryToken(h) === "USDC")
    .reduce(
      (acc, h) => acc + toDisplayTokenAmount(h.prizeAmount, "USDC", isLegacyInstantHistoryItem(h)),
      0,
    );

  const totalWonOAR = history
    .filter((h) => h.isWin && getHistoryToken(h) === "OAR")
    .reduce(
      (acc, h) => acc + toDisplayTokenAmount(h.prizeAmount, "OAR", isLegacyInstantHistoryItem(h)),
      0,
    );

  const totalWonETH = history
    .filter((h) => h.isWin && getHistoryToken(h) === "ETH")
    .reduce(
      (acc, h) => acc + toDisplayTokenAmount(h.prizeAmount, "ETH", isLegacyInstantHistoryItem(h)),
      0,
    );

  interface WinningBadge {
    symbol: string;
    amount: string;
    color: string;
    bg: string;
  }

  const winningBadges: WinningBadge[] = [];
  if (totalWonUSDC > 0 || (totalWonOAR === 0 && totalWonETH === 0)) {
    winningBadges.push({ symbol: "USDC", amount: `$${formatDisplayAmount(totalWonUSDC)}`, color: "text-[#2775CA]", bg: "bg-[#2775CA]/10" });
  }
  if (totalWonOAR > 0) {
    winningBadges.push({ symbol: "OAR", amount: `${formatDisplayAmount(totalWonOAR)} OAR`, color: "text-[#F5A623]", bg: "bg-[#F5A623]/10" });
  }
  if (totalWonETH > 0) {
    winningBadges.push({ symbol: "ETH", amount: `${formatDisplayAmount(totalWonETH)} ETH`, color: "text-[#8B9DE8]", bg: "bg-[#8B9DE8]/10" });
  }

  // Filtered History
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Game type filter
      if (selectedGameType !== "all" && item.gameType.toLowerCase() !== selectedGameType.toLowerCase()) {
        return false;
      }
      // Outcome filter
      if (selectedOutcome === "wins" && !item.isWin) return false;
      if (selectedOutcome === "losses" && item.isWin) return false;

      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesRoom = item.roomId.toLowerCase().includes(query);
        const matchesTx = item.txHash?.toLowerCase().includes(query);
        const matchesGame = item.gameType.toLowerCase().includes(query);
        if (!matchesRoom && !matchesTx && !matchesGame) return false;
      }

      return true;
    });
  }, [history, selectedGameType, selectedOutcome, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#050505] px-4">
        <div className="h-10 w-10 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[#050505] px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5">
          <UserRound className="h-9 w-9 text-[#9A9A9A]" />
        </div>
        <div className="space-y-2">
          <p className="text-[22px] font-semibold text-[#F3F3F3]">
            Full Game History
          </p>
          <p className="max-w-[280px] text-sm leading-relaxed text-[#9A9A9A]">
            Sign in with your wallet to view your complete activity history.
          </p>
        </div>
        <button
          type="button"
          onClick={signIn}
          className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
        >
          Connect wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-up">
        <GameHeader gameName="Full History" />

        {/* Hero Feature Box */}
        <SurfaceCard as="section" className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8E8E8]">
                <HistoryIcon className="h-3.5 w-3.5 text-violet-400" />
                Player Activity Records
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F3F3F3] sm:text-3xl">
                Full Game History
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#A3A3A3]">
                Comprehensive ledger of all your game entries, round outcomes, stakes, and payouts across Rafla Draw, Flip, and Spin.
              </p>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:items-center lg:gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center min-w-[100px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
                  Games
                </p>
                <p className="mt-1 text-lg font-bold text-[#F3F3F3]">
                  {history.length}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center min-w-[100px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
                  Wins
                </p>
                <p className="mt-1 text-lg font-bold text-[#F5A623]">
                  {wins}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center min-w-[100px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
                  Win Rate
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-400">
                  {winRate}%
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center min-w-[120px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
                  Winnings
                </p>
                <div className="mt-1 flex flex-wrap justify-center gap-1">
                  {winningBadges.map((b) => (
                    <span key={b.symbol} className={`text-xs font-bold ${b.color}`}>
                      {b.amount}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        {/* Section Toolbar & Filters (Reference UI layout style) */}
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            
            {/* Left: Counter & Title */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
                Game Ledger
              </p>
              <p className="text-sm font-semibold text-[#F3F3F3]">
                Showing {filteredHistory.length} of {history.length} games
              </p>
            </div>

            {/* Right: Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search room ID or tx hash..."
                className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-xs text-[#F3F3F3] outline-none placeholder:text-[#666] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A8A8A] hover:text-white"
                >
                  Clear
                </button>
              ) : null}
            </div>

          </div>

          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
            {/* Game Type Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#737373]">
                Game:
              </span>
              {["all", "draw", "flip", "spin"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedGameType(type)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    selectedGameType === type
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-[#A3A3A3] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Outcome Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#737373]">
                Outcome:
              </span>
              {["all", "wins", "losses"].map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => setSelectedOutcome(outcome)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    selectedOutcome === outcome
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-[#A3A3A3] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {outcome}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History Feed Cards Grid */}
        <SurfaceCard as="section" className="p-5 md:p-6">
          {historyLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse"
                />
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-16 text-center">
              <Gamepad2 className="h-8 w-8 text-[#737373]" />
              <div className="space-y-1.5">
                <p className="text-base font-medium text-[#F3F3F3]">
                  No matching games found
                </p>
                <p className="text-sm text-[#9A9A9A]">
                  Try adjusting your search query or filter criteria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGameType("all");
                  setSelectedOutcome("all");
                }}
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold text-[#E8E8E8] transition-colors hover:bg-white/10"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredHistory.map((item) => {
                const token = getHistoryToken(item);
                const stakeAmount = toDisplayTokenAmount(
                  item.stakeAmount,
                  token,
                  isLegacyInstantHistoryItem(item),
                );
                const prizeAmount = toDisplayTokenAmount(
                  item.prizeAmount,
                  token,
                  isLegacyInstantHistoryItem(item),
                );
                const formattedResultAmount = item.isWin
                  ? formatTokenAmount(prizeAmount, token, "+")
                  : formatTokenAmount(stakeAmount, token, "-");

                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/profile/history/${item.id}`)}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition-all hover:border-white/20 hover:bg-white/[0.06] cursor-pointer"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          item.isWin
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-[#737373]"
                        }`}
                      >
                        {item.isWin ? (
                          <Trophy className="h-4 w-4" />
                        ) : (
                          <Gamepad2 className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#F3F3F3] capitalize">
                          Rafla {item.gameType}
                        </p>
                        <p className="mt-0.5 text-xs text-[#8A8A8A]">
                          {new Date(item.settledAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {' '}
                          · Room: {item.roomId.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          item.isWin ? "text-emerald-400" : "text-[#9A9A9A]"
                        }`}
                      >
                        {formattedResultAmount}
                      </p>
                      <p
                        className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                          item.isWin ? "text-emerald-400/80" : "text-red-400/80"
                        }`}
                      >
                        {item.isWin ? "Won" : "Loss"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SurfaceCard>
      </main>
    </div>
  );
}
