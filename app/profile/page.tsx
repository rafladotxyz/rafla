"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  Copy,
  DollarSign,
  Edit3,
  Gamepad2,
  History,
  LogOut,
  Send,
  Trophy,
  UserRound,
  X,
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

  const formattedTotalWon = () => {
    const parts = [];
    if (totalWonUSDC > 0 || (totalWonOAR === 0 && totalWonETH === 0)) {
      parts.push(`$${formatDisplayAmount(totalWonUSDC)}`);
    }
    if (totalWonOAR > 0) {
      parts.push(`${formatDisplayAmount(totalWonOAR)} OAR`);
    }
    if (totalWonETH > 0) {
      parts.push(`${formatDisplayAmount(totalWonETH)} ETH`);
    }
    return parts.join(" + ");
  };

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
          className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
        >
          Connect wallet
        </button>
      </div>
    );
  }

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

  const statTiles = [
    { label: "Games played", value: history.length, icon: Gamepad2, color: "text-[#8B9DE8]", isWinnings: false },
    { label: "Rounds won", value: wins, icon: Trophy, color: "text-[#F5A623]", isWinnings: false },
    { label: "Win rate", value: `${winRate}%`, icon: History, color: "text-emerald-400", isWinnings: false },
    { label: "Total winnings", value: formattedTotalWon(), icon: DollarSign, color: "text-purple-400", isWinnings: true },
  ];

  const balanceTiles = [
    { label: "USDC Balance", value: loadingBalances ? "..." : formatDisplayAmount(balances.USDC.formatted), symbol: "USDC", color: "text-[#2775CA]", bg: "bg-[#2775CA]/10", icon: "$" },
    { label: "OAR Balance", value: loadingBalances ? "..." : formatDisplayAmount(balances.OAR.formatted), symbol: "OAR", color: "text-[#F5A623]", bg: "bg-[#F5A623]/10", icon: "◈" },
    { label: "ETH Balance", value: loadingBalances ? "..." : formatDisplayAmount(balances.ETH.formatted), symbol: "ETH", color: "text-[#8B9DE8]", bg: "bg-[#8B9DE8]/10", icon: "Ξ" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-up">
        {/* Hero Profile Card */}
        <SurfaceCard as="section" className="overflow-hidden p-0">
          {/* Cover Header */}
          <div className="relative h-28 w-full overflow-hidden sm:h-36">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-950/60 via-purple-900/40 to-slate-950" />
            <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-[70px]" />
            <div className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-pink-500/20 blur-[80px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:20px_20px]" />
            
            <div className="absolute left-5 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8E8E8] backdrop-blur-md">
              <UserRound className="h-3 w-3 text-violet-400" />
              Profile Overview
            </div>
          </div>

          {/* Profile Header Content */}
          <div className="relative z-10 px-5 pb-6 pt-0 md:px-8 md:pb-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              
              {/* Left: Avatar & Identity info */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {/* Avatar with Camera Trigger */}
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
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/30 to-purple-900/40 text-3xl font-semibold text-white">
                        {(user.username ?? user.wallet ?? "A")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={triggerPicker}
                    disabled={isUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-black/60 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Upload avatar"
                  >
                    {isUploading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={triggerPicker}
                    disabled={isUploading}
                    aria-label="Upload avatar"
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050505] bg-white text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
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
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
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
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </a>
                    ) : null}

                    {user.telegram ? (
                      <a
                        href={`https://t.me/${user.telegram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Telegram profile"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                      >
                        <Send className="h-3.5 w-3.5" />
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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:scale-98"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit profile
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-semibold text-red-300 transition-colors hover:border-red-500/30 hover:bg-red-500/20 active:scale-98"
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
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-red-200 transition-colors hover:bg-red-500/10"
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

        {/* Wallet Balances Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
              Token Balances
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {balanceTiles.map(({ label, value, symbol, color, bg, icon }) => (
              <SurfaceCard key={label} className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 text-[#8A8A8A]">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                    {label}
                  </span>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} ${color} text-xs font-bold`}>
                    {icon}
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-[#F3F3F3] sm:text-3xl">
                  {value} <span className="text-sm font-medium text-[#8A8A8A]">{symbol}</span>
                </p>
              </SurfaceCard>
            ))}
          </div>
        </section>

        {/* Game Stats Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
              Performance Stats
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statTiles.map(({ label, value, icon: Icon, color, isWinnings }) => (
              <SurfaceCard key={label} className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
                    {label}
                  </span>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                {isWinnings ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {winningBadges.map((b) => (
                      <span
                        key={b.symbol}
                        className={`inline-flex items-center rounded-lg border border-white/10 ${b.bg} ${b.color} px-2 py-1 text-xs sm:text-sm font-bold`}
                      >
                        {b.amount}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 break-words text-xl font-bold text-[#F3F3F3] sm:text-2xl">
                    {value}
                  </p>
                )}
              </SurfaceCard>
            ))}
          </div>
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
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#9A9A9A]">
                Last {Math.min(history.length, 10)} games
              </span>
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
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  Explore games
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
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
                    <div
                      key={item.id}
                      onClick={() => router.push(`/profile/history/${item.id}`)}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition-all hover:border-white/20 hover:bg-white/[0.06] cursor-pointer"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.isWin ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-[#737373]"}`}
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
                            })}
                            {' '}
                            · {item.roomId.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${item.isWin ? "text-emerald-400" : "text-[#9A9A9A]"}`}>
                          {formattedResultAmount}
                        </p>
                        <p className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${item.isWin ? "text-emerald-400/80" : "text-red-400/80"}`}>
                          {item.isWin ? "Won" : "Loss"}
                        </p>
                      </div>
                    </div>
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