"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Copy, Link2, Users } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useRoom } from "@/hooks/useRoom";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const PRICE_OPTIONS = [
  { label: "$1", value: 1 },
  { label: "$2", value: 2 },
  { label: "$3", value: 3 },
  { label: "$5", value: 5 },
];
const PLAYER_OPTIONS = [2, 4, 6, 8];

type GameType = "spin" | "flip" | "draw";
type Mode = "idle" | "create" | "created" | "join";

interface EmptyStateCardProps {
  gameType: GameType;
  isPublic?: boolean;
}

export function EmptyStateCard({ gameType, isPublic }: EmptyStateCardProps) {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuthContext();
  const { createRoom, joinRoom, createdRoom, isCreating, isJoining, error } = useRoom();

  const [mode, setMode] = useState<Mode>("idle");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [customPlayers, setCustomPlayers] = useState<string>("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [roomStake, setRoomStake] = useState<number | null>(null);
  const [fetchingRoom, setFetchingRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  const effectivePrice = customPrice ? Number(customPrice) : selectedPrice;
  const effectivePlayers = customPlayers ? Number(customPlayers) : selectedPlayers;

  const roomLink = createdRoom
    ? `${typeof window !== "undefined" ? window.location.origin : "https://rafla.xyz"}/${gameType}/${createdRoom.id}`
    : "";

  const fetchRoomData = async (id: string): Promise<number | null> => {
    const trimmed = id.trim();
    if (!trimmed) return null;

    setFetchingRoom(true);
    try {
      const res = await fetch(`/api/rooms/${trimmed}`);
      if (!res.ok) {
        setRoomStake(null);
        return null;
      }

      const { room } = await res.json();
      const stake = room?.stakeAmount ? Number(room.stakeAmount) / 1_000_000 : null;
      setRoomStake(stake);
      return stake;
    } catch {
      setRoomStake(null);
      return null;
    } finally {
      setFetchingRoom(false);
    }
  };

  const handleCreate = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }

    if (!effectivePrice || !effectivePlayers) return;

    const room = await createRoom({
      gameType,
      stakeAmountDollars: effectivePrice,
      minPlayers: effectivePlayers,
    });

    if (room) setMode("created");
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }

    const trimmed = joinRoomId.trim();
    if (!trimmed) return;

    const stake = roomStake ?? (await fetchRoomData(trimmed));
    if (stake === null) return;

    const ok = await joinRoom(trimmed, stake);
    if (ok) {
      router.push(`/${gameType}/${trimmed}`);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (mode === "join" && joinRoomId.trim().length >= 6) {
      void fetchRoomData(joinRoomId);
    }
  }, [joinRoomId, mode]);

  if (mode === "idle") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 py-12 md:py-20">
        <SurfaceCard className="w-full max-w-[560px] p-5 text-center md:p-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/5 text-3xl">
            {isPublic ? "🕐" : "🔒"}
          </div>
          <p className="text-xl font-semibold text-[#F3F3F3]">
            {isPublic ? "No open game right now" : "No active room"}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#9A9A9A]">
            {isPublic
              ? "The public room is not live yet. Create a private room or join one by ID while you wait."
              : "Create a private room, set the stake and minimum players, then share the invite link."}
          </p>
        </SurfaceCard>

        <div className="flex w-full max-w-[560px] flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setMode("create")}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
          >
            Create room
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
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
            className="text-left text-xs text-[#8A8A8A] transition-colors hover:text-[#E8E8E8]"
          >
            ← Back
          </button>
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
            Private room
          </p>
          <h2 className="text-xl font-semibold text-[#F3F3F3]">
            Create a room in seconds.
          </h2>
          <p className="text-sm leading-relaxed text-[#A3A3A3]">
            Choose a stake and the minimum players required to unlock it.
          </p>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#E8E8E8]">Price per ticket</p>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">
              <Link2 className="h-3.5 w-3.5" /> USDC
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRICE_OPTIONS.map((opt) => {
              const active = selectedPrice === opt.value && !customPrice;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setSelectedPrice(opt.value);
                    setCustomPrice("");
                  }}
                  className={`h-11 rounded-2xl border text-sm font-medium transition-colors ${active ? "border-white bg-white text-black" : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"}`}
                >
                  {opt.label}
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
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#E8E8E8]">Minimum players</p>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">
              <Users className="h-3.5 w-3.5" /> Invite size
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
          className={`inline-flex h-12 items-center justify-center rounded-2xl text-sm font-semibold transition-colors ${effectivePrice && effectivePlayers && !isCreating ? "bg-white text-black hover:bg-[#F5F5F5]" : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"}`}
        >
          {!isAuthenticated ? "Sign in to create" : isCreating ? "Creating..." : "Create room"}
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
          <h2 className="text-xl font-semibold text-[#F3F3F3]">
            Share the invite with friends.
          </h2>
          <p className="text-sm leading-relaxed text-[#A3A3A3]">
            The link and room ID stay contained inside the card on mobile.
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
                void handleCopy(createdRoom.id);
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
            onClick={async () => {
              await handleCopy(roomLink);
            }}
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
            className="text-left text-xs text-[#8A8A8A] transition-colors hover:text-[#E8E8E8]"
          >
            ← Back
          </button>
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
            Join room
          </p>
          <h2 className="text-xl font-semibold text-[#F3F3F3]">
            Paste a room ID and we’ll fetch the stake.
          </h2>
          <p className="text-sm leading-relaxed text-[#A3A3A3]">
            Join a friend’s invite without leaving this screen.
          </p>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#E8E8E8]">Room ID</label>
          <input
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            onBlur={() => void fetchRoomData(joinRoomId)}
            placeholder="Paste room ID here"
            className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-[#CBCBCB] outline-none placeholder:text-[#555] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
          />
        </div>

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

        <button
          type="button"
          onClick={handleJoin}
          disabled={!joinRoomId.trim() || isJoining || roomStake === null}
          className={`inline-flex h-12 items-center justify-center rounded-2xl text-sm font-semibold transition-colors ${joinRoomId.trim() && !isJoining && roomStake !== null ? "bg-white text-black hover:bg-[#F5F5F5]" : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"}`}
        >
          {!isAuthenticated ? "Sign in to join" : isJoining ? "Joining..." : "Join room"}
        </button>
      </SurfaceCard>
    );
  }

  return null;
}
