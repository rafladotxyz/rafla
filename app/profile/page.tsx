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

  const wins = history.filter((h) => h.isWin).length;
  const totalWon = history
    .filter((h) => h.isWin)
    .reduce((acc, h) => acc + Number(h.prizeAmount) / 1_000_000, 0);
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

  return (
    <div className="min-h-screen px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed left-0 right-0 top-4 z-50 flex justify-center pt-6 md:top-6">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-up">
        <SurfaceCard as="section" className="overflow-hidden">
          <div className="absolute inset-0" />
          <div className="relative z-10 p-5 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#8A8A8A]">
                  Profile
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative shrink-0">
                    <div className="h-24 w-24 overflow-hidden rounded-[28px] border border-white/10 bg-black/20 sm:h-28 sm:w-28">
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
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <h1 className="text-3xl font-semibold tracking-tight text-[#F3F3F3] md:text-4xl">
                        {displayName}
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#9A9A9A] md:text-base">
                        Your wallet identity, wins, and activity live here. Update your profile once, and it stays consistent across Rafla.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={copyWallet}
                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                        >
                          <Twitter className="h-4 w-4" />
                          <span className="hidden sm:inline">Twitter</span>
                        </a>
                      ) : null}

                      {user.telegram ? (
                        <a
                          href={`https://t.me/${user.telegram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                        >
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Telegram</span>
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

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:max-w-[420px]">
                {[
                  { label: "Games", value: history.length, icon: Gamepad2 },
                  { label: "Wins", value: wins, icon: Trophy },
                  { label: "Win rate", value: `${winRate}%`, icon: History },
                  { label: "Total won", value: `$${totalWon.toFixed(2)}`, icon: DollarSign },
                ].map(({ label, value, icon: Icon }) => (
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
                    <p className="mt-4 text-2xl font-semibold text-[#F3F3F3]">
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

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "USDC Balance", value: loadingBalances ? "..." : Number(balances.USDC.formatted).toFixed(2), symbol: "USDC", color: "text-[#2775CA]", bg: "bg-[#2775CA]/10", icon: "$" },
            { label: "OAR Balance", value: loadingBalances ? "..." : Number(balances.OAR.formatted).toFixed(4), symbol: "OAR", color: "text-[#F5A623]", bg: "bg-[#F5A623]/10", icon: "◈" },
            { label: "ETH Balance", value: loadingBalances ? "..." : Number(balances.ETH.formatted).toFixed(4), symbol: "ETH", color: "text-[#8B9DE8]", bg: "bg-[#8B9DE8]/10", icon: "Ξ" },
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

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Games played", value: history.length, icon: Gamepad2 },
            { label: "Wins", value: wins, icon: Trophy },
            { label: "Win rate", value: `${winRate}%`, icon: History },
            { label: "Total won", value: `$${totalWon.toFixed(2)}`, icon: DollarSign },
          ].map(({ label, value, icon: Icon }) => (
            <SurfaceCard key={label} className="p-4">
              <Icon className="h-4 w-4 text-[#8A8A8A]" />
              <p className="mt-4 text-2xl font-semibold text-[#F3F3F3]">
                {value}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#737373]">
                {label}
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
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
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
                        {item.isWin
                          ? `+$${(Number(item.prizeAmount) / 1_000_000).toFixed(2)}`
                          : "—"}
                      </p>
                      <p className={`mt-1 text-[10px] uppercase tracking-[0.24em] ${item.isWin ? "text-emerald-400/70" : "text-[#737373]"}`}>
                        {item.isWin ? "Won" : "Played"}
                      </p>
                    </div>
                  </div>
                ))}
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
      </main>
    </div>
  );
}
