"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  ExternalLink,
  Gamepad2,
  Trophy,
  UserRound,
  ArrowLeft,
  History,
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

export default function GameDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading, authHeaders, signIn } = useAuthContext();

  const [item, setItem] = useState<GameHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedItemField, setCopiedItemField] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchItem() {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/history/${id}`, {
          headers: authHeaders(),
        });
        if (res.ok) {
          const { item } = await res.json();
          setItem(item);
        } else {
          setError("Game details not found");
        }
      } catch {
        setError("Could not load game details");
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id, isAuthenticated, authHeaders]);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItemField(field);
    window.setTimeout(() => setCopiedItemField(null), 2000);
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#050505] px-4">
        <div className="h-10 w-10 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[#050505] px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5">
          <UserRound className="h-9 w-9 text-[#9A9A9A]" />
        </div>
        <div className="space-y-2">
          <p className="text-[22px] font-semibold text-[#F3F3F3]">
            Game Details
          </p>
          <p className="max-w-[280px] text-sm leading-relaxed text-[#9A9A9A]">
            Sign in with your wallet to view round details.
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

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <Navbar />
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center animate-fade-up">
          <GameHeader gameName="Game Details" />
          <SurfaceCard className="w-full p-8">
            <div className="space-y-3">
              <p className="text-xl font-semibold text-[#F3F3F3]">
                {error || "Game details not found"}
              </p>
              <p className="text-sm text-[#9A9A9A]">
                The round history item could not be retrieved.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/history")}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-black hover:bg-[#F5F5F5]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </button>
          </SurfaceCard>
        </main>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 animate-fade-up">

        <SurfaceCard as="section" className="overflow-hidden p-0">
          {/* Cover Header */}
          <div className="relative h-28 w-full overflow-hidden sm:h-36">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-950/60 via-purple-900/40 to-slate-950" />
            <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-[70px]" />
            <div className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-pink-500/20 blur-[80px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:20px_20px]" />

            <div className="absolute left-5 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8E8E8] backdrop-blur-md">
              <History className="h-3.5 w-3.5 text-violet-400" />
              Round Receipt
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Outcome Banner */}
            <div
              className={`flex flex-col items-center justify-center rounded-2xl border p-6 text-center ${
                item.isWin
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : "border-white/10 bg-white/[0.02] text-[#9A9A9A]"
              }`}
            >
              <div
                className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  item.isWin ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-[#737373]"
                }`}
              >
                {item.isWin ? (
                  <Trophy className="h-7 w-7" />
                ) : (
                  <Gamepad2 className="h-7 w-7" />
                )}
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
                Outcome
              </p>
              <h1 className="mt-1 text-3xl font-bold">
                {item.isWin ? "Won" : "Loss"}
              </h1>
              <p className="mt-2 text-base text-[#CBCBCB]">
                {item.isWin ? (
                  <>
                    You won{" "}
                    <span className="font-bold text-emerald-400">
                      {formatTokenAmount(prizeAmount, token)}
                    </span>
                  </>
                ) : (
                  <>
                    You lost{" "}
                    <span className="font-bold text-red-300">
                      {formatTokenAmount(stakeAmount, token)}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Details Table */}
            <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-2">
              <div className="flex items-center justify-between py-3.5">
                <span className="text-xs text-[#8A8A8A]">Game type</span>
                <span className="text-sm font-semibold text-[#F3F3F3] capitalize">
                  Rafla {item.gameType}
                </span>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <span className="text-xs text-[#8A8A8A]">Stake amount</span>
                <span className="text-sm font-semibold text-[#F3F3F3]">
                  {formatTokenAmount(stakeAmount, token)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <span className="text-xs text-[#8A8A8A]">Won amount</span>
                <span
                  className={`text-sm font-semibold ${
                    item.isWin ? "text-emerald-400" : "text-[#9A9A9A]"
                  }`}
                >
                  {item.isWin
                    ? formatTokenAmount(prizeAmount, token)
                    : formatTokenAmount(0, token)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <span className="text-xs text-[#8A8A8A]">Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    item.status === "completed" || item.isWin
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-white/10 text-[#A3A3A3]"
                  }`}
                >
                  {item.status || "Settled"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <span className="text-xs text-[#8A8A8A]">Date & time</span>
                <span className="text-sm font-medium text-[#F3F3F3]">
                  {new Date(item.settledAt).toLocaleString(undefined, {
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
                    {item.roomId}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.roomId, "roomId")}
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

              {item.txHash ? (
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <span className="text-xs text-[#8A8A8A]">Transaction</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate font-mono text-xs text-[#CBCBCB]">
                      {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.txHash!, "txHash")}
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
                      href={`https://sepolia.basescan.org/tx/${item.txHash}`}
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

            <button
              type="button"
              onClick={() => router.push("/history")}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </button>
          </div>
        </SurfaceCard>
      </main>
    </div>
  );
}
