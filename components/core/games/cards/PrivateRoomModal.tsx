"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Copy, Link2 } from "lucide-react";
import { useRoom } from "@/hooks/useRoom";
import { useAuthContext } from "@/context/AuthContext";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

type StakeToken = "USDC" | "OAR" | "ETH";

const TOKEN_PRESETS: Record<StakeToken, number[]> = {
  USDC: [1, 2, 3, 5],
  OAR: [0.5, 1, 5, 10],
  ETH: [0.0001, 0.001, 0.005, 0.01],
};

const TOKEN_SYMBOLS: Record<StakeToken, string> = {
  USDC: "$",
  OAR: "◈",
  ETH: "Ξ",
};

const PLAYER_OPTIONS = [2, 4, 6, 8];

type GameType = "spin" | "flip" | "draw";
type Mode = "choose" | "create" | "join" | "created";

interface PrivateRoomModalProps {
  gameType: GameType;
  roomId?: string;
  onClose: () => void;
}

export function PrivateRoomModal({ gameType, roomId: urlRoomId, onClose }: PrivateRoomModalProps) {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuthContext();
  const {
    createRoom,
    joinRoom,
    copyRoomLink,
    createdRoom,
    isCreating,
    isJoining,
    error,
  } = useRoom();

  const [mode, setMode] = useState<Mode>(urlRoomId ? "join" : "choose");
  const availableTokens: StakeToken[] = gameType === "draw" ? ["USDC", "OAR", "ETH"] : ["OAR"];
  const [selectedToken, setSelectedToken] = useState<StakeToken>(availableTokens[0]);
  const [joinRoomId, setJoinRoomId] = useState(urlRoomId ?? "");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [customPlayers, setCustomPlayers] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [roomStake, setRoomStake] = useState<number | null>(null);
  const [fetchingRoom, setFetchingRoom] = useState(false);

  const effectivePrice = customPrice ? Number(customPrice) : selectedPrice;
  const effectivePlayers = customPlayers ? Number(customPlayers) : selectedPlayers;
  const currentPresets = TOKEN_PRESETS[selectedToken];

  const roomLink = createdRoom
    ? `${typeof window !== "undefined" ? window.location.origin : "https://rafla.xyz"}/${gameType}/${createdRoom.id}`
    : "";

  const fetchRoomData = async (id: string): Promise<number | null> => {
    if (!id.trim()) return null;
    setFetchingRoom(true);
    try {
      const res = await fetch(`/api/rooms/${id}`);
      if (res.ok) {
        const { room } = await res.json();
        if (room && room.stakeAmount) {
          const stake = Number(room.stakeAmount) / 1_000_000;
          setRoomStake(stake);
          return stake;
        }
      }
      setRoomStake(null);
      return null;
    } catch (err) {
      console.error("fetchRoomData error:", err);
      setRoomStake(null);
      return null;
    } finally {
      setFetchingRoom(false);
    }
  };

  useEffect(() => {
    if (urlRoomId) {
      void fetchRoomData(urlRoomId);
    }
  }, [urlRoomId]);

  const handleCreate = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }

    if (!effectivePrice || !effectivePlayers) return;

    const room = await createRoom({
      gameType,
      stakeAmount: effectivePrice,
      token: selectedToken,
      minPlayers: effectivePlayers,
    });

    if (room) setMode("created");
  };

  const handleCopy = async () => {
    if (!createdRoom) return;
    await copyRoomLink(createdRoom.id, gameType);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }

    const finalRoomId = joinRoomId.trim();
    if (!finalRoomId) return;

    const stake = roomStake ?? (await fetchRoomData(finalRoomId));
    if (stake === null) return;

    const ok = await joinRoom(finalRoomId, stake);
    if (ok) {
      setJoinSuccess(true);
      window.setTimeout(() => {
        router.push(`/${gameType}/${finalRoomId}`);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
      <SurfaceCard className="relative w-full max-w-[560px] p-5 md:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#CBCBCB] transition-colors hover:border-white/20 hover:bg-white/10"
          aria-label="Close"
        >
          ✕
        </button>

        {mode === "choose" ? (
          <div className="space-y-5 pr-10">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
                Private room
              </p>
              <h2 className="text-xl font-semibold text-[#F3F3F3]">
                Create a room or join by ID.
              </h2>
              <p className="text-sm leading-relaxed text-[#A3A3A3]">
                Pick the flow that matches how you want to play.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("create")}
                className="flex min-h-[140px] flex-col justify-between rounded-[26px] border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A8A8A]">
                    Create
                  </p>
                  <p className="text-lg font-semibold text-[#F3F3F3]">
                    Start a new invite
                  </p>
                  <p className="text-sm text-[#9A9A9A]">
                    Set stake and minimum players.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#CBCBCB]" />
              </button>

              <button
                type="button"
                onClick={() => setMode("join")}
                className="flex min-h-[140px] flex-col justify-between rounded-[26px] border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A8A8A]">
                    Join
                  </p>
                  <p className="text-lg font-semibold text-[#F3F3F3]">
                    Enter a room ID
                  </p>
                  <p className="text-sm text-[#9A9A9A]">
                    Paste the invite and we’ll fetch the stake.
                  </p>
                </div>
                <Link2 className="h-5 w-5 text-[#CBCBCB]" />
              </button>
            </div>
          </div>
        ) : null}

        {mode === "create" ? (
          <div className="space-y-5 pr-10">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="text-left text-xs text-[#8A8A8A] transition-colors hover:text-[#E8E8E8]"
              >
                ← Back
              </button>
              <h2 className="text-xl font-semibold text-[#F3F3F3]">
                Create private room
              </h2>
              <p className="text-sm text-[#A3A3A3]">
                Set your ticket price and invite size.
              </p>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#E8E8E8]">Price per ticket</p>
                <div className="flex items-center gap-2">
                  {availableTokens.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedToken(t);
                        setSelectedPrice(null);
                        setCustomPrice("");
                      }}
                      className={`rounded border px-2 py-1 text-xs font-semibold uppercase transition-colors ${
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
                {currentPresets.map((val) => {
                  const active = selectedPrice === val && !customPrice;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setSelectedPrice(val);
                        setCustomPrice("");
                      }}
                      className={`h-11 rounded-2xl border text-sm font-medium transition-colors ${active ? "border-white bg-white text-black" : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"}`}
                    >
                      {TOKEN_SYMBOLS[selectedToken]}
                      {val}
                    </button>
                  );
                })}
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Custom"
                  value={customPrice}
                  onChange={(e) => {
                    setCustomPrice(e.target.value);
                    setSelectedPrice(null);
                  }}
                  className="h-11 rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-[#CBCBCB] outline-none placeholder:text-[#555] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <p className="text-sm font-medium text-[#E8E8E8]">Minimum players</p>
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
                      className={`h-11 rounded-2xl border text-sm font-medium transition-colors ${active ? "border-white bg-white text-black" : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"}`}
                    >
                      {count}
                    </button>
                  );
                })}
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Custom"
                  value={customPlayers}
                  onChange={(e) => {
                    setCustomPlayers(e.target.value);
                    setSelectedPlayers(null);
                  }}
                  className="h-11 rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-[#CBCBCB] outline-none placeholder:text-[#555] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
                />
              </div>
            </div>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <button
              type="button"
              onClick={handleCreate}
              disabled={!effectivePrice || !effectivePlayers || isCreating}
              className={`inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-colors ${effectivePrice && effectivePlayers && !isCreating ? "bg-white text-black hover:bg-[#F5F5F5]" : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"}`}
            >
              {!isAuthenticated ? "Sign in to create" : isCreating ? "Creating..." : "Create room"}
            </button>
          </div>
        ) : null}

        {mode === "created" && createdRoom ? (
          <div className="space-y-5 pr-10">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
                Room created
              </p>
              <h2 className="text-xl font-semibold text-[#F3F3F3]">
                Share the room with friends.
              </h2>
              <p className="text-sm leading-relaxed text-[#A3A3A3]">
                The link and room ID are contained inside the card on every screen size.
              </p>
            </div>

            <div className="grid gap-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
                Room ID
              </p>
              <div className="flex items-center gap-2 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
                <span className="min-w-0 flex-1 truncate font-mono text-sm text-[#E8E8E8]">
                  {createdRoom.id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void handleCopy();
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
                Room link
              </p>
              <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
                <p className="break-all text-sm leading-relaxed text-[#CBCBCB]">
                  {roomLink}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Link copied" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/${gameType}/${createdRoom.id}`)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
              >
                Enter room
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        {mode === "join" ? (
          <div className="space-y-5 pr-10">
            <div className="space-y-1">
              {!urlRoomId ? (
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="text-left text-xs text-[#8A8A8A] transition-colors hover:text-[#E8E8E8]"
                >
                  ← Back
                </button>
              ) : null}
              <h2 className="text-xl font-semibold text-[#F3F3F3]">
                {urlRoomId ? "Join room" : "Join private room"}
              </h2>
              <p className="text-sm text-[#A3A3A3]">
                {urlRoomId
                  ? "Deposit the required stake to enter."
                  : "Paste a room ID and we’ll fetch the stake before you join."}
              </p>
            </div>

            {!urlRoomId ? (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#E8E8E8]">Room ID</label>
                <input
                  value={joinRoomId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setJoinRoomId(id);
                    if (id.length >= 6) {
                      void fetchRoomData(id);
                    }
                  }}
                  onBlur={() => void fetchRoomData(joinRoomId)}
                  placeholder="Paste room ID here"
                  className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-[#CBCBCB] outline-none placeholder:text-[#555] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
                />
              </div>
            ) : (
              <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
                  Room ID
                </p>
                <p className="mt-2 truncate font-mono text-sm text-[#E8E8E8]">
                  {urlRoomId}
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <p className="text-sm font-medium text-[#E8E8E8]">Required stake</p>
              <div className="flex h-12 items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4">
                {fetchingRoom ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                ) : roomStake !== null ? (
                  <>
                    <span className="text-sm text-[#E8E8E8]">${roomStake} USDC</span>
                    <span className="text-xs text-[#8A8A8A]">Fixed by creator</span>
                  </>
                ) : (
                  <span className="text-sm text-[#737373]">Enter a valid room ID</span>
                )}
              </div>
            </div>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            {joinSuccess ? (
              <p className="text-sm text-emerald-400 text-center">
                Joined. Entering room...
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleJoin}
              disabled={((!joinRoomId.trim() && !urlRoomId) || isJoining || joinSuccess || roomStake === null)}
              className={`inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-colors ${((joinRoomId.trim() || urlRoomId) && !isJoining && !joinSuccess && roomStake !== null) ? "bg-white text-black hover:bg-[#F5F5F5]" : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"}`}
            >
              {!isAuthenticated ? "Sign in to join" : isJoining ? "Joining..." : joinSuccess ? "Joined" : "Join room"}
            </button>
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}
