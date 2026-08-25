"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  Copy,
  Edit3,
  Gamepad2,
  LogOut,
  Send,
  Trophy,
  UserRound,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useBalances } from "@/hooks/useBalances";
import { Navbar } from "@/components/layout/Navbar";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

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

interface WinningBadge {
  symbol: string;
  amount: string;
  color: string;
  bg: string;
}

function formatHistoryDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function formatDisplayAmount(val: number | string, token?: string): string {
  const num = Number(val);
  if (isNaN(num)) return String(val);
  if (token === "OAR" || Math.abs(num) >= 100) {
    return Math.round(num).toLocaleString("en-US");
  }
  if (token === "ETH") {
    if (num === 0) return "0";
    if (Math.abs(num) < 0.001) return num.toFixed(6);
    return parseFloat(num.toFixed(4)).toString();
  }
  const rounded = Math.round(num * 100) / 100;
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
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
  const formatted = formatDisplayAmount(amount, token);
  if (token === "USDC") return `${sign}$${formatted}`;
  return `${sign}${formatted} ${token}`;
}

function isLegacyInstantHistoryItem(item: Pick<GameHistoryItem, "gameType" | "token">) {
  return !item.token && (item.gameType === "flip" || item.gameType === "spin");
}

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    authHeaders,
    signIn,
    signOut,
  } = useAuthContext();
  const router = useRouter();

  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { balances, isLoading: loadingBalances } = useBalances();

  const {
    inputRef,
    preview: avatarPreview,
    isUploading,
    error: uploadError,
    triggerPicker,
    handleFileChange,
    clearError,
  } = useAvatarUpload(user?.avatar);

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

  const copyWallet = async () => {
    if (!user?.wallet) return;
    await navigator.clipboard.writeText(user.wallet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const wins = history.filter((h) => h.isWin).length;

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

  const winRate = history.length > 0 ? ((wins / history.length) * 100).toFixed(0) : "0";
  const shortWallet = user?.wallet
    ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`
    : "Not connected";
  const displayName = user?.username ? `@${user.username}` : "Anonymous";

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
            Your Profile
          </p>
          <p className="max-w-[280px] text-sm leading-relaxed text-[#9A9A9A]">
            Sign in with your wallet to view your stats and game history.
          </p>
        </div>
        <button
          type="button"
          onClick={signIn}
          className="focus-ring inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
        >
          Connect wallet
        </button>
      </div>
    );
  }

  const winningBadges: WinningBadge[] = [];
  if (totalWonUSDC > 0 || (totalWonOAR === 0 && totalWonETH === 0)) {
    winningBadges.push({ symbol: "USDC", amount: `$${formatDisplayAmount(totalWonUSDC, "USDC")}`, color: "text-[#2775CA]", bg: "bg-[#2775CA]/10" });
  }
  if (totalWonOAR > 0) {
    winningBadges.push({ symbol: "OAR", amount: `${formatDisplayAmount(totalWonOAR, "OAR")} OAR`, color: "text-[#F5A623]", bg: "bg-[#F5A623]/10" });
  }
  if (totalWonETH > 0) {
    winningBadges.push({ symbol: "ETH", amount: `${formatDisplayAmount(totalWonETH, "ETH")} ETH`, color: "text-[#8B9DE8]", bg: "bg-[#8B9DE8]/10" });
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-up">
        {/* Hero Profile Card */}
        <SurfaceCard as="section" className="overflow-hidden p-0">
          {/* Cover Header */}
          <div className="relative h-24 w-full overflow-hidden sm:h-28">
            <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_50%_0%,rgba(217,70,239,0.10),transparent_62%)]" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          {/* Profile Header Content */}
          <div className="relative z-10 px-5 pb-6 pt-0 md:px-8 md:pb-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              
              {/* Left: Avatar & Identity info */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {/* Avatar with upload trigger */}
                <div className="relative -mt-14 shrink-0 sm:-mt-16">
                  <div className="h-24 w-24 overflow-hidden rounded-[28px] border-4 border-[#050505] bg-neutral-900 shadow-[0_10px_30px_rgba(0,0,0,0.6)] sm:h-28 sm:w-28">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Profile avatar"
                        width={112}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-3xl font-semibold text-[#F3F3F3]">
                        {(user.username ?? user.wallet ?? "A")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={triggerPicker}
                    disabled={isUploading}
                    aria-label="Upload avatar"
                    title="Upload avatar"
                    className="focus-ring absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#050505] bg-white text-black shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-70"
                  >
                    {isUploading ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Identity Header */}
                <div className="min-w-0 space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl font-bold tracking-tight text-[#F3F3F3] sm:text-3xl">
                      {displayName}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      Connected
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Wallet Copy Button */}
                    <button
                      type="button"
                      onClick={copyWallet}
                      aria-label={copied ? "Wallet address copied" : "Copy wallet address"}
                      className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 text-xs font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                    >
                      <span className="font-mono text-[#CBCBCB]">
                        {shortWallet}
                      </span>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-[#8A8A8A]" />
                      )}
                    </button>

                    {/* Social Links */}
                    {user.twitter ? (
                      <a
                        href={`https://twitter.com/${user.twitter.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter profile"
                        className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </a>
                    ) : null}

                    {user.telegram ? (
                      <a
                        href={`https://t.me/${user.telegram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Telegram profile"
                        className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                      >
                        <Send className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => router.push("/profile/edit")}
                  className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:scale-[0.98]"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit profile
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-5 text-sm font-medium text-[#A3A3A3] transition-colors hover:border-white/20 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>

            </div>

            {/* Bio text if provided */}
            {user.bio ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm leading-relaxed text-[#CBCBCB]">
                  {user.bio}
                </p>
              </div>
            ) : null}
          </div>
        </SurfaceCard>

        {/* Upload error banner if any */}
        {uploadError ? (
          <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
            <button
              type="button"
              onClick={clearError}
              className="focus-ring ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-red-200 transition-colors hover:bg-red-500/10"
              aria-label="Dismiss upload error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Game Performance */}
        <section aria-labelledby="performance-heading" className="space-y-3">
          <h2
            id="performance-heading"
            className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]"
          >
            Performance
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <SurfaceCard className="p-4 sm:col-span-3 sm:p-5">
              <dl className="grid grid-cols-3 divide-x divide-white/10">
                <div className="pr-2 text-center sm:pr-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
                    Games played
                  </dt>
                  <dd className="mt-2.5 text-xl font-bold tabular-nums text-[#F3F3F3] sm:text-2xl">
                    {history.length}
                  </dd>
                </div>
                <div className="px-2 text-center sm:px-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
                    Rounds won
                  </dt>
                  <dd className="mt-2.5 text-xl font-bold tabular-nums text-[#F3F3F3] sm:text-2xl">
                    {wins}
                  </dd>
                </div>
                <div className="pl-2 text-center sm:pl-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
                    Win rate
                  </dt>
                  <dd className="mt-2.5 text-xl font-bold tabular-nums text-[#F3F3F3] sm:text-2xl">
                    {winRate}%
                  </dd>
                </div>
              </dl>
            </SurfaceCard>

            <SurfaceCard className="flex flex-col justify-center p-4 sm:col-span-2 sm:p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
                Total winnings
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {winningBadges.map((b) => (
                  <span
                    key={b.symbol}
                    className={`inline-flex items-center rounded-lg border border-white/10 px-2 py-1 text-xs font-bold sm:text-sm ${b.bg} ${b.color}`}
                  >
                    {b.amount}
                  </span>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </section>

        {/* Token Balances */}
        <section aria-labelledby="balances-heading" className="space-y-3">
          <h2
            id="balances-heading"
            className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]"
          >
            Token balances
          </h2>
          <SurfaceCard className="p-1.5 sm:p-2">
            <ul className="divide-y divide-white/[0.06]">
              {(["USDC", "OAR", "ETH"] as const).map((symbol) => {
                const chip =
                  symbol === "USDC"
                    ? "bg-[#2775CA]/10 text-[#5BA7E8]"
                    : symbol === "OAR"
                      ? "bg-[#F5A623]/10 text-[#F5A623]"
                      : "bg-[#8B9DE8]/10 text-[#8B9DE8]";
                return (
                  <li
                    key={symbol}
                    className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4"
                  >
                    <span
                      className={`flex h-8 min-w-14 items-center justify-center rounded-lg px-2 text-xs font-bold tracking-wide ${chip}`}
                    >
                      {symbol}
                    </span>
                    {loadingBalances ? (
                      <span className="block h-5 w-20 animate-pulse rounded bg-white/10" />
                    ) : (
                      <p className="truncate font-mono text-base font-bold tabular-nums text-[#F3F3F3]">
                        {formatDisplayAmount(balances[symbol].formatted)}
                        <span className="ml-1.5 text-xs font-medium text-[#8A8A8A]">
                          {symbol}
                        </span>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </SurfaceCard>
        </section>

        {/* Game History Feed */}
        <SurfaceCard as="section" className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
                Activity
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#F3F3F3]">
                Recent Rounds
              </h2>
            </div>
            {history.length > 0 ? (
              <button
                type="button"
                onClick={() => router.push("/history")}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
              >
                View All History
                <ChevronRight className="h-3.5 w-3.5 text-[#8A8A8A]" />
              </button>
            ) : null}
          </div>

          <div className="mt-5">
            {historyLoading ? (
              <div className="grid gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse"
                  />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-16 text-center">
                <Gamepad2 className="h-8 w-8 text-[#737373]" />
                <div className="space-y-1.5">
                  <p className="text-base font-medium text-[#F3F3F3]">
                    No games played yet
                  </p>
                  <p className="text-sm text-[#9A9A9A]">
                    Join a Spin, Flip, or Draw room to build your activity history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  Explore games
                </button>
              </div>
            ) : (
              <div className="grid gap-2">
                {history.slice(0, 10).map((item) => {
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
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => router.push(`/profile/history/${item.id}`)}
                      className="focus-ring flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition-all hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.isWin ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-[#737373]"}`}
                        >
                          {item.isWin ? (
                            <Trophy className="h-4 w-4" />
                          ) : (
                            <Gamepad2 className="h-4 w-4" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold capitalize text-[#F3F3F3]">
                            Rafla {item.gameType}
                          </span>
                          <span className="mt-0.5 block text-xs text-[#8A8A8A]">
                            {formatHistoryDate(item.settledAt)}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className={`block text-sm font-bold ${item.isWin ? "text-emerald-400" : "text-[#9A9A9A]"}`}>
                          {formattedResultAmount}
                        </span>
                        <span className={`mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.18em] ${item.isWin ? "text-emerald-400" : "text-red-400"}`}>
                          {item.isWin ? "Won" : "Loss"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </SurfaceCard>
      </main>
    </div>
  );
}