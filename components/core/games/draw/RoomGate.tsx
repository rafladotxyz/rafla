"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Copy, Link2, Share2, Users, Wallet } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useBalances } from "@/hooks/useBalances";
import { useRoom } from "@/hooks/useRoom";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { APP_URL } from "@/utils/utils";

type StakeToken = "USDC" | "OAR" | "ETH";

const TOKEN_PRESETS: Record<StakeToken, number[]> = {
  USDC: [1, 2, 3, 5],
  OAR: [50, 100, 500, 1000],
  ETH: [0.0001, 0.001, 0.005, 0.01],
};

const PLAYER_OPTIONS = [2, 4, 6, 8];

type Mode = "idle" | "create" | "created" | "join";

function formatStake(amount: number | null, token: string): string {
  if (amount === null) return "";
  if (token === "USDC") return `$${amount}`;
  return `${amount} ${token}`;
}

// Accepts a bare ID or a full invite URL and extracts the room ID.
export function extractRoomId(input: string, gameType: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] === gameType && segments[1]) return segments[1];
  } catch {
    // Not a URL — treat as a raw ID.
  }
  return trimmed;
}

interface RoomGateProps {
  gameType: "draw";
}

export function RoomGate({ gameType }: RoomGateProps) {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuthContext();
  const { createRoom, joinRoom, createdRoom, isCreating, isJoining, error } =
    useRoom();
  const { balances, isLoading: loadingBalances } = useBalances();

  const [mode, setMode] = useState<Mode>("idle");
  const [selectedToken, setSelectedToken] = useState<StakeToken>("USDC");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [customPlayers, setCustomPlayers] = useState<string>("");
  const [joinInput, setJoinInput] = useState("");
  const [roomStake, setRoomStake] = useState<number | null>(null);
  const [roomToken, setRoomToken] = useState<string>("USDC");
  const [roomMissing, setRoomMissing] = useState(false);
  const [fetchingRoom, setFetchingRoom] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const effectivePrice = customPrice ? Number(customPrice) : selectedPrice;
  const effectivePlayers = customPlayers ? Number(customPlayers) : selectedPlayers;
  const priceValid =
    !!effectivePrice && Number.isFinite(effectivePrice) && effectivePrice > 0;
  const playersValid =
    !!effectivePlayers &&
    Number.isInteger(effectivePlayers) &&
    effectivePlayers >= 2 &&
    effectivePlayers <= 20;

  const roomId = createdRoom?.id ?? null;
  const roomLink = roomId ? `${APP_URL}/${gameType}/${roomId}` : "";

  const fetchRoomData = async (input: string) => {
    const id = extractRoomId(input, gameType);
    if (!id) return;
    setFetchingRoom(true);
    setRoomMissing(false);
    try {
      const res = await fetch(`/api/rooms/${id}`);
      if (!res.ok) {
        setRoomStake(null);
        setRoomMissing(true);
        return;
      }
      const { room } = await res.json();
      const token: string = room?.token ?? "USDC";
      const decimals = token === "USDC" ? 1_000_000 : 1e18;
      const stake = room?.stakeAmount
        ? Number(room.stakeAmount) / decimals
        : null;
      setRoomToken(token);
      setRoomStake(stake);
      setRoomMissing(stake === null);
    } catch {
      setRoomStake(null);
      setRoomMissing(true);
    } finally {
      setFetchingRoom(false);
    }
  };

  // Debounced stake lookup while typing/pasting.
  useEffect(() => {
    if (mode !== "join") return;
    const timer = window.setTimeout(() => {
      const id = extractRoomId(joinInput, gameType);
      if (!id || id.length < 6) {
        setRoomStake(null);
        setRoomMissing(false);
        return;
      }
      void fetchRoomData(joinInput);
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinInput, mode, gameType]);

  const requireAuth = async (): Promise<boolean> => {
    if (isAuthenticated) return true;
    await signIn();
    return isAuthenticated;
  };

  const handleCreate = async () => {
    if (!(await requireAuth())) return;
    if (!priceValid || !playersValid) return;
    const room = await createRoom({
      gameType,
      stakeAmount: effectivePrice!,
      token: selectedToken,
      minPlayers: effectivePlayers!,
    });
    if (room) setMode("created");
  };

  const handleJoin = async () => {
    if (!(await requireAuth())) return;
    const id = extractRoomId(joinInput, gameType);
    if (!id || roomStake === null) return;

    // Balance check before asking the wallet for a signature.
    const balanceNum = Number(balances[roomToken as StakeToken]?.formatted ?? NaN);
    if (Number.isFinite(balanceNum) && balanceNum < roomStake) return;

    const ok = await joinRoom(id, roomToken, roomStake);
    if (ok) router.push(`/${gameType}/${id}`);
  };

  const insufficientBalance =
    roomStake !== null &&
    !loadingBalances &&
    Number.isFinite(Number(balances[roomToken as StakeToken]?.formatted)) &&
    Number(balances[roomToken as StakeToken].formatted) < roomStake;

  const copyText = async (
    text: string,
    setFlag: (value: boolean) => void,
  ): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setFlag(true);
      window.setTimeout(() => setFlag(false), 2000);
      return true;
    } catch {
      return false;
    }
  };

  const toggleId = () => copyText(roomId ?? "", setCopiedId);
  const toggleLink = () => copyText(roomLink, setCopiedLink);

  const shareRoom = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Rafla Draw",
          text: "Join my Rafla Draw room — seats are limited.",
          url: roomLink,
        });
        return;
      } catch {
        return;
      }
    }
    void toggleLink();
  };

  if (mode === "idle") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 py-12 md:py-16">
        <SurfaceCard className="w-full max-w-[560px] p-5 text-center md:p-8">
          <p className="text-xl font-semibold text-[#F3F3F3]">
            Pool a stake with friends.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#9A9A9A]">
            Create a room with your own stake and seat count, or join one with
            an invite. When the room fills, the contract picks one winner.
          </p>
        </SurfaceCard>

        <div className="flex w-full max-w-[560px] flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setMode("create")}
            className="focus-ring inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
          >
            Create room
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className="focus-ring inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
          >
            Join room
            <Link2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <SurfaceCard className="mx-auto flex w-full max-w-[560px] flex-col gap-5 p-5 md:p-6">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="focus-ring rounded text-left text-xs text-[#8A8A8A] transition-colors hover:text-[#E8E8E8]"
          >
            Back
          </button>
          <h2 className="pt-1 text-xl font-semibold text-[#F3F3F3]">
            Create a room in seconds.
          </h2>
          <p className="text-sm leading-relaxed text-[#A3A3A3]">
            Set the stake and the minimum players required to start the draw.
          </p>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#E8E8E8]">Price per ticket</p>
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Ticket token"
            >
              {(["USDC", "OAR", "ETH"] as StakeToken[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setSelectedToken(t);
                    setSelectedPrice(null);
                    setCustomPrice("");
                  }}
                  aria-pressed={selectedToken === t}
                  className={`focus-ring rounded-full border px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                    selectedToken === t
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-transparent text-[#8A8A8A] hover:text-[#CBCBCB]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TOKEN_PRESETS[selectedToken].map((val) => {
              const active = selectedPrice === val && !customPrice;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setSelectedPrice(val);
                    setCustomPrice("");
                  }}
                  aria-pressed={active}
                  className={`focus-ring h-11 rounded-full border text-sm font-medium transition-colors ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"
                  }`}
                >
                  {val} {selectedToken === "USDC" ? "$" : ""}
                </button>
              );
            })}
            <label className="relative block">
              <span className="sr-only">Custom ticket price</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="Custom"
                value={customPrice}
                onChange={(e) => {
                  setCustomPrice(e.target.value);
                  setSelectedPrice(null);
                }}
                className="focus-ring h-11 w-full rounded-full border border-white/10 bg-black/20 px-4 text-sm text-[#CBCBCB] outline-none placeholder:text-[#666]"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#E8E8E8]">Minimum players</p>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">
              <Users className="h-3.5 w-3.5" /> Room size
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PLAYER_OPTIONS.map((count) => {
              const active = selectedPlayers === count && !customPlayers;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setSelectedPlayers(count);
                    setCustomPlayers("");
                  }}
                  aria-pressed={active}
                  className={`focus-ring h-11 rounded-full border text-sm font-medium transition-colors ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"
                  }`}
                >
                  {count}
                </button>
              );
            })}
            <label className="relative block">
              <span className="sr-only">Custom player count</span>
              <input
                type="number"
                inputMode="numeric"
                min={2}
                max={20}
                placeholder="Custom"
                value={customPlayers}
                onChange={(e) => {
                  setCustomPlayers(e.target.value);
                  setSelectedPlayers(null);
                }}
                className="focus-ring h-11 w-full rounded-full border border-white/10 bg-black/20 px-4 text-sm text-[#CBCBCB] outline-none placeholder:text-[#666]"
              />
            </label>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleCreate}
          disabled={!priceValid || !playersValid || isCreating}
          className={`focus-ring inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
            priceValid && playersValid && !isCreating
              ? "bg-white text-black hover:bg-[#F5F5F5]"
              : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"
          }`}
        >
          {!isAuthenticated
            ? "Sign in to create"
            : isCreating
              ? "Creating..."
              : "Create room"}
        </button>
      </SurfaceCard>
    );
  }

  if (mode === "created" && createdRoom) {
    return (
      <SurfaceCard className="mx-auto flex w-full max-w-[560px] flex-col gap-5 p-5 md:p-6">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
            Room created
          </p>
          <h2 className="pt-1 text-xl font-semibold text-[#F3F3F3]">
            Share the invite with friends.
          </h2>
          <p className="text-sm leading-relaxed text-[#A3A3A3]">
            The draw starts once {extractMinPlayers(createdRoom.minPlayers)}{" "}
            players have joined.
          </p>
        </div>

        <div className="grid gap-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
            Room ID
          </p>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 py-2 pl-4 pr-2">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-[#E8E8E8]">
              {roomId}
            </span>
            <button
              type="button"
              onClick={() => void toggleId()}
              aria-label={copiedId ? "Room ID copied" : "Copy room ID"}
              className="focus-ring inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
            >
              {copiedId ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedId ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void shareRoom()}
            className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
          >
            <Share2 className="h-4 w-4" />
            Share invite
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${gameType}/${roomId}`)}
            className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
          >
            Enter room
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => void toggleLink()}
          aria-label={copiedLink ? "Invite link copied" : "Copy invite link"}
          className="focus-ring mx-auto inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[#8A8A8A] transition-colors hover:text-[#E8E8E8]"
        >
          {copiedLink ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Link2 className="h-3 w-3" />
          )}
          {copiedLink ? "Link copied" : "Copy link instead"}
        </button>
      </SurfaceCard>
    );
  }

  if (mode === "join") {
    return (
      <SurfaceCard className="mx-auto flex w-full max-w-[560px] flex-col gap-5 p-5 md:p-6">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="focus-ring rounded text-left text-xs text-[#8A8A8A] transition-colors hover:text-[#E8E8E8]"
          >
            Back
          </button>
          <h2 className="pt-1 text-xl font-semibold text-[#F3F3F3]">
            Paste an invite link or room ID.
          </h2>
          <p className="text-sm leading-relaxed text-[#A3A3A3]">
            We&apos;ll look up the stake. It&apos;s fixed by whoever created the
            room.
          </p>
        </div>

        <div className="grid gap-2">
          <label htmlFor="join-room-input" className="text-sm font-medium text-[#E8E8E8]">
            Invite
          </label>
          <input
            id="join-room-input"
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            placeholder="https://rafla.xyz/draw/… or room ID"
            autoComplete="off"
            spellCheck={false}
            className="focus-ring h-12 rounded-full border border-white/10 bg-black/20 px-4 text-sm text-[#CBCBCB] outline-none placeholder:text-[#666]"
          />
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-medium text-[#E8E8E8]">Required stake</p>
          <div
            className="flex h-12 items-center justify-between rounded-full border border-white/10 bg-black/20 px-4"
            role="status"
            aria-live="polite"
          >
            {fetchingRoom ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            ) : roomStake !== null ? (
              <>
                <span className="text-sm tabular-nums text-[#E8E8E8]">
                  {formatStake(roomStake, roomToken)}
                </span>
                <span className="text-xs text-[#8A8A8A]">Fixed by creator</span>
              </>
            ) : roomMissing ? (
              <span className="text-sm text-[#737373]">
                No open room found for that ID
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-[#737373]">
                <Wallet className="h-3.5 w-3.5" /> Waiting for an invite…
              </span>
            )}
          </div>
          {insufficientBalance ? (
            <p className="text-xs text-red-300">
              Your balance is too low for this room&apos;s stake.
            </p>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleJoin}
          disabled={
            !extractRoomId(joinInput, gameType) ||
            isJoining ||
            roomStake === null ||
            insufficientBalance
          }
          className={`focus-ring inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
            extractRoomId(joinInput, gameType) &&
            !isJoining &&
            roomStake !== null &&
            !insufficientBalance
              ? "bg-white text-black hover:bg-[#F5F5F5]"
              : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"
          }`}
        >
          {!isAuthenticated
            ? "Sign in to join"
            : isJoining
              ? "Confirming in wallet…"
              : insufficientBalance
                ? "Not enough balance"
                : "Join room"}
        </button>
      </SurfaceCard>
    );
  }

  return null;
}

function extractMinPlayers(value: unknown): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 2 ? n : 2;
}
