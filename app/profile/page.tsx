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
  Twitter,
  UserRound,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useBalances } from "@/hooks/useBalances";
import { Navbar } from "@/components/layout/Navbar";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ModalShell } from "@/components/ui/ModalShell";

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

const PROFILE_FIELDS = [
  {
    key: "username" as const,
    label: "Username",
    placeholder: "rafla_player",
    autoComplete: "username",
  },
  {
    key: "bio" as const,
    label: "Bio",
    placeholder: "Tell people what you’re about.",
    autoComplete: "off",
  },
  {
    key: "twitter" as const,
    label: "Twitter / X",
    placeholder: "@handle",
    autoComplete: "off",
  },
  {
    key: "telegram" as const,
    label: "Telegram",
    placeholder: "@handle",
    autoComplete: "off",
  },
];

function formatDisplayAmount(val: number | string): string {
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return parseFloat(num.toFixed(6)).toString();
}

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    updateProfile,
    authHeaders,
    signIn,
    signOut,
  } = useAuthContext();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<GameHistoryItem | null>(null);
  const [copiedItemField, setCopiedItemField] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    twitter: "",
    telegram: "",
  });

  const { balances, isLoading: loadingBalances } = useBalances();

  const {
    inputRef,
    preview: avatarPreview,
    isUploading,
    error: uploadError,
    triggerPicker,
    handleFileChange,
    clearError,
  } = useAvatarUpload(user?.avatar, () => {
    setSaveSuccess(true);
    window.setTimeout(() => setSaveSuccess(false), 3000);
  });

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

    setForm({
      username: user.username ?? "",
      bio: user.bio ?? "",
      twitter: user.twitter ?? "",
      telegram: user.telegram ?? "",
    });
    void fetchHistory();
  }, [user, fetchHistory]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    const result = await updateProfile({
      username: form.username || undefined,
      bio: form.bio || undefined,
      twitter: form.twitter || undefined,
      telegram: form.telegram || undefined,
    });

    setSaving(false);

    if (result && "error" in result) {
      setSaveError(result.error as string);
      return;
    }

    setSaveSuccess(true);
    setEditing(false);
    window.setTimeout(() => setSaveSuccess(false), 3000);
  };

  const copyWallet = async () => {
    if (!user?.wallet) return;
    await navigator.clipboard.writeText(user.wallet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItemField(field);
    window.setTimeout(() => setCopiedItemField(null), 2000);
  };

  const wins = history.filter((h) => h.isWin).length;

  const totalWonUSDC = history
    .filter((h) => h.isWin && (!h.token || h.token === "USDC"))
    .reduce((acc, h) => acc + Number(h.prizeAmount) / 1_000_000, 0);

  const totalWonOAR = history
    .filter((h) => h.isWin && h.token === "OAR")
    .reduce((acc, h) => acc + Number(h.prizeAmount) / 1e18, 0);

  const totalWonETH = history
    .filter((h) => h.isWin && h.token === "ETH")
    .reduce((acc, h) => acc + Number(h.prizeAmount) / 1e18, 0);

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
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="h-10 w-10 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
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

  const statTiles = [
    { label: "Games", value: history.length, icon: Gamepad2 },
    { label: "Wins", value: wins, icon: Trophy },
    { label: "Win rate", value: `${winRate}%`, icon: History },
    { label: "Total won", value: formattedTotalWon(), icon: DollarSign },
  ];

  return (
    <div className="min-h-screen px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed left-0 right-0 top-4 z-50 flex justify-center pt-6 md:top-6">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-up">
        <SurfaceCard as="section" className="overflow-hidden">
          {/* Cover */}
          <div className="relative h-24 w-full overflow-hidden sm:h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-[#171226] via-[#100e1c] to-[#0a0a0f]" />
            <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-[70px]" />
            <div className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-violet-500/25 blur-[80px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[length:18px_18px]" />
            <div className="absolute left-5 top-4 inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#C9C9C9] backdrop-blur-sm">
              Profile
            </div>
          </div>

          <div className="relative z-10 px-5 pb-5 md:px-8 md:pb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="relative -mt-12 shrink-0 sm:-mt-14">
                    <div className="h-24 w-24 overflow-hidden rounded-[28px] border-4 border-white/10 bg-black/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:h-28 sm:w-28">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Profile avatar"
                          width={112}
                          height={112}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/5 text-[34px] font-semibold text-[#F3F3F3]">
                          {(user.username ?? user.wallet ?? "A")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={triggerPicker}
                      disabled={isUploading}
                      className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-black/55 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
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
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black/60 bg-white text-black shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 active:scale-95"
                    >
                      {isUploading ? (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2 pt-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-2xl font-semibold tracking-tight text-[#F3F3F3] sm:text-3xl">
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
                      <button
                        type="button"
                        onClick={copyWallet}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        <span className="font-mono text-[12px] text-[#CBCBCB]">
                          {shortWallet}
                        </span>
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {user.twitter ? (
                        <a
                          href={`https://twitter.com/${user.twitter.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Twitter profile"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      ) : null}

                      {user.telegram ? (
                        <a
                          href={`https://t.me/${user.telegram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Telegram profile"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                        >
                          <Send className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                {user.bio ? (
                  <p className="max-w-3xl rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-relaxed text-[#CBCBCB]">
                    {user.bio}
                  </p>
                ) : null}

                {/* Details */}
                <div className="grid gap-x-6 gap-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 sm:p-5">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#737373]">
                      Wallet address
                    </p>
                    <p className="truncate font-mono text-[13px] text-[#E8E8E8]">
                      {shortWallet}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#737373]">
                       X
                    </p>
                    <p className="text-[13px] text-[#E8E8E8]">
                      {user.twitter || (
                        <span className="text-[#666]">Not linked</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#737373]">
                      Telegram
                    </p>
                    <p className="text-[13px] text-[#E8E8E8]">
                      {user.telegram || (
                        <span className="text-[#E8E8E8]">Not linked</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#737373]">
                      Games played
                    </p>
                    <p className="text-[13px] text-[#E8E8E8]">
                      {history.length} games · {winRate}% win rate
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white px-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit profile
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 text-sm font-semibold text-red-300 transition-colors hover:border-red-500/30 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-3 xl:max-w-[420px]">
                {statTiles.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Icon className="h-4 w-4 text-[#8A8A8A]" />
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#737373]">
                        {label}
                      </span>
                    </div>
                    <p className="mt-4 break-words text-xl font-semibold text-[#F3F3F3] sm:text-2xl">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SurfaceCard>

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

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "USDC Balance", value: loadingBalances ? "..." : formatDisplayAmount(balances.USDC.formatted), symbol: "USDC", color: "text-[#2775CA]", bg: "bg-[#2775CA]/10", icon: "$" },
            { label: "OAR Balance", value: loadingBalances ? "..." : formatDisplayAmount(balances.OAR.formatted), symbol: "OAR", color: "text-[#F5A623]", bg: "bg-[#F5A623]/10", icon: "◈" },
            { label: "ETH Balance", value: loadingBalances ? "..." : formatDisplayAmount(balances.ETH.formatted), symbol: "ETH", color: "text-[#8B9DE8]", bg: "bg-[#8B9DE8]/10", icon: "Ξ" },
          ].map(({ label, value, symbol, color, bg, icon }) => (
            <SurfaceCard key={label} className="p-4">
              <div className="flex items-center gap-2 text-[#8A8A8A]">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${bg} ${color} text-xs font-bold`}>
                  {icon}
                </div>
                <span className="text-[11px] uppercase tracking-[0.18em]">
                  {label}
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-[#F3F3F3]">
                {value} <span className="text-sm font-medium text-[#8A8A8A]">{symbol}</span>
              </p>
            </SurfaceCard>
          ))}
        </section>

        <SurfaceCard as="section" className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A8A8A]">
                Game history
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#F3F3F3]">
                Recent rounds
              </h2>
            </div>
            {history.length > 0 ? (
              <p className="text-sm text-[#9A9A9A]">
                Last {Math.min(history.length, 10)} games
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            {historyLoading ? (
              <div className="grid gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-[22px] border border-white/10 bg-white/[0.04] animate-pulse"
                  />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-[26px] border border-white/10 bg-black/20 px-4 py-16 text-center">
                <Gamepad2 className="h-8 w-8 text-[#737373]" />
                <div className="space-y-2">
                  <p className="text-base font-medium text-[#F3F3F3]">
                    No games yet
                  </p>
                  <p className="text-sm text-[#9A9A9A]">
                    Join a room to start building your history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  Browse games
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {history.slice(0, 10).map((item) => {
                  const formattedPrize = () => {
                    if (!item.isWin) return "—";
                    const token = item.token || "USDC";
                    const decimals = token === "USDC" ? 6 : 18;
                    const amount = Number(item.prizeAmount) / (10 ** decimals);
                    const formatted = formatDisplayAmount(amount);
                    return token === "USDC" ? `+$${formatted}` : `+${formatted} ${token}`;
                  };

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedHistoryItem(item)}
                      className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 transition-colors hover:border-white/20 hover:bg-white/[0.06] cursor-pointer"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${item.isWin ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-[#737373]"}`}
                        >
                          {item.isWin ? (
                            <Trophy className="h-4 w-4" />
                          ) : (
                            <Gamepad2 className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#F3F3F3] capitalize">
                            Rafla {item.gameType}
                          </p>
                          <p className="mt-1 text-xs text-[#8A8A8A]">
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
                        <p className={`text-sm font-semibold ${item.isWin ? "text-emerald-400" : "text-[#9A9A9A]"}`}>
                          {formattedPrize()}
                        </p>
                        <p className={`mt-1 text-[10px] uppercase tracking-[0.24em] ${item.isWin ? "text-emerald-400/70" : "text-red-400/70"}`}>
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

        {editing ? (
          <ModalShell
            onClose={() => setEditing(false)}
            title="Edit profile"
            description="Update your username, bio, and social handles."
            className="max-w-[640px]"
          >
            <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A8A8A]">
                  Avatar
                </p>
                <div className="mt-4 flex flex-col items-center gap-4 text-center">
                  <div className="relative h-28 w-28 overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="avatar preview"
                        width={112}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[38px] font-semibold text-[#F3F3F3]">
                        {(user.username ?? "A")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={triggerPicker}
                    disabled={isUploading}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-[#4A4A4A]"
                  >
                    <Camera className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Change avatar"}
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {PROFILE_FIELDS.map(({ key, label, placeholder, autoComplete }) => {
                  const isBio = key === "bio";
                  return (
                    <div key={key} className="grid gap-2">
                      <label className="text-[11px] uppercase tracking-[0.24em] text-[#8A8A8A]">
                        {label}
                      </label>
                      {isBio ? (
                        <textarea
                          value={form[key]}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              [key]: e.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          autoComplete={autoComplete}
                          rows={4}
                          className="min-h-[120px] rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#F3F3F3] outline-none placeholder:text-[#666] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
                        />
                      ) : (
                        <input
                          value={form[key]}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              [key]: e.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          autoComplete={autoComplete}
                          className="h-12 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 text-sm text-[#F3F3F3] outline-none placeholder:text-[#666] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
                        />
                      )}
                    </div>
                  );
                })}

                {saveError ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {saveError}
                  </div>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex h-12 items-center justify-center rounded-2xl text-sm font-semibold transition-colors ${saving ? "cursor-not-allowed bg-white/5 text-[#4A4A4A]" : "bg-white text-black hover:bg-[#F5F5F5]"}`}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </ModalShell>
        ) : null}

        {saveSuccess ? (
          <div className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0F1410] px-4 py-3 text-sm text-emerald-400 shadow-2xl shadow-black/30">
            <Check className="h-4 w-4" />
            Profile updated
          </div>
        ) : null}

        {selectedHistoryItem ? (
          <ModalShell
            onClose={() => setSelectedHistoryItem(null)}
            title="Game details"
            description="Overview of your round outcome and transaction status."
            className="max-w-[480px]"
          >
            <div className="space-y-6">
              {/* Outcome Banner */}
              <div className={`flex flex-col items-center justify-center rounded-[24px] border p-6 text-center ${selectedHistoryItem.isWin ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-white/10 bg-white/[0.02] text-[#9A9A9A]"}`}>
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${selectedHistoryItem.isWin ? "bg-emerald-500/10" : "bg-white/5"}`}>
                  {selectedHistoryItem.isWin ? (
                    <Trophy className="h-6 w-6" />
                  ) : (
                    <Gamepad2 className="h-6 w-6" />
                  )}
                </div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A8A8A]">
                  Outcome
                </p>
                <h3 className="mt-1 text-3xl font-bold">
                  {selectedHistoryItem.isWin ? "Won" : "Loss"}
                </h3>
                <p className="mt-2 text-sm text-[#CBCBCB]">
                  {selectedHistoryItem.isWin ? (
                    <>
                      You won{" "}
                      <span className="font-semibold text-emerald-400">
                        {(() => {
                          const token = selectedHistoryItem.token || "USDC";
                          const decimals = token === "USDC" ? 6 : 18;
                          const amount = Number(selectedHistoryItem.prizeAmount) / (10 ** decimals);
                          const formatted = formatDisplayAmount(amount);
                          return token === "USDC" ? `$${formatted}` : `${formatted} ${token}`;
                        })()}
                      </span>
                    </>
                  ) : (
                    "Better luck next time!"
                  )}
                </p>
              </div>

              {/* Details List */}
              <div className="divide-y divide-white/5 rounded-[24px] border border-white/10 bg-white/[0.02] px-4 py-2">
                <div className="flex items-center justify-between py-3.5">
                  <span className="text-xs text-[#8A8A8A]">Game type</span>
                  <span className="text-sm font-medium text-[#F3F3F3] capitalize">
                    Rafla {selectedHistoryItem.gameType}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <span className="text-xs text-[#8A8A8A]">Stake amount</span>
                  <span className="text-sm font-medium text-[#F3F3F3]">
                    {(() => {
                      const token = selectedHistoryItem.token || "USDC";
                      const decimals = token === "USDC" ? 6 : 18;
                      const amount = Number(selectedHistoryItem.stakeAmount || 0) / (10 ** decimals);
                      const formatted = formatDisplayAmount(amount);
                      return token === "USDC" ? `$${formatted}` : `${formatted} ${token}`;
                    })()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <span className="text-xs text-[#8A8A8A]">Status</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${selectedHistoryItem.status === "completed" || selectedHistoryItem.isWin ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-[#A3A3A3]"}`}>
                    {selectedHistoryItem.status || "Settled"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <span className="text-xs text-[#8A8A8A]">Date & time</span>
                  <span className="text-sm font-medium text-[#F3F3F3]">
                    {new Date(selectedHistoryItem.settledAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3.5">
                  <span className="text-xs text-[#8A8A8A]">Room ID</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate font-mono text-xs text-[#CBCBCB]">
                      {selectedHistoryItem.roomId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedHistoryItem.roomId, "roomId")}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#E8E8E8] transition-colors hover:bg-white/10"
                      aria-label="Copy Room ID"
                    >
                      {copiedItemField === "roomId" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {selectedHistoryItem.txHash ? (
                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <span className="text-xs text-[#8A8A8A]">Transaction</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate font-mono text-xs text-[#CBCBCB]">
                        {selectedHistoryItem.txHash.slice(0, 6)}...{selectedHistoryItem.txHash.slice(-4)}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedHistoryItem.txHash!, "txHash")}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#E8E8E8] transition-colors hover:bg-white/10"
                        aria-label="Copy Tx Hash"
                      >
                        {copiedItemField === "txHash" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <a
                        href={`https://sepolia.basescan.org/tx/${selectedHistoryItem.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#E8E8E8] transition-colors hover:bg-white/10"
                        aria-label="View on BaseScan"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedHistoryItem(null)}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-semibold text-black transition-colors hover:bg-[#F5F5F5]"
              >
                Close details
              </button>
            </div>
          </ModalShell>
        ) : null}
      </main>
    </div>
  );
}