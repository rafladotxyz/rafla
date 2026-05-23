"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useRoom } from "@/hooks/useRoom";

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
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (mode === "join" && joinRoomId.trim().length >= 6) {
      void fetchRoomData(joinRoomId);
    }
  }, [joinRoomId, mode]);

  if (mode === "idle") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 py-16 md:py-20">
        <div className="max-w-md rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-xl shadow-2xl shadow-black/20">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl">
            {isPublic ? "🕐" : "🔒"}
          </div>
          <p className="text-xl font-medium text-[#F3F3F3]">
            {isPublic ? "No open game right now" : "No active room"}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#9A9A9A]">
            {isPublic
              ? "The public room is not live yet. Create a private room or join one by ID while you wait."
              : "Create a private room, set the stake and minimum players, then share the invite link."}
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setMode("create")}
            className="h-12 flex-1 rounded-full bg-white text-black text-sm font-medium transition-transform hover:-translate-y-0.5"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode("join")}
            className="h-12 flex-1 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-[#E8E8E8] transition-colors hover:bg-white/10 hover:text-white"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-1">
          <button onClick={() => setMode("idle")} className="text-left text-xs text-[#8A8A8A] hover:text-[#E8E8E8]">
            ← Back
          </button>
          <p className="text-lg font-medium text-[#F3F3F3]">Create Private Room</p>
          <p className="text-sm text-[#A3A3A3]">Choose a stake and the minimum players required to unlock the room.</p>
        </div>

        <div className="grid gap-2">
          <p className="text-sm text-[#CBCBCB]">Price per ticket</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRICE_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  setSelectedPrice(opt.value);
                  setCustomPrice("");
                }}
                className={`h-11 rounded-2xl border text-sm transition-colors ${
                  selectedPrice === opt.value
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <input
              type="number"
              placeholder="Custom"
              value={customPrice}
              onChange={(e) => {
                setCustomPrice(e.target.value);
                setSelectedPrice(null);
              }}
              className={`h-11 rounded-2xl border bg-black/20 px-3 text-sm text-[#CBCBCB] outline-none placeholder:text-[#444] ${
                customPrice ? "border-white" : "border-white/10"
              }`}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-sm text-[#CBCBCB]">Minimum players</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PLAYER_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => {
                  setSelectedPlayers(count);
                  setCustomPlayers("");
                }}
                className={`h-11 rounded-2xl border text-sm transition-colors ${
                  selectedPlayers === count
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"
                }`}
              >
                {count}
              </button>
            ))}
            <input
              type="number"
              placeholder="Custom"
              value={customPlayers}
              onChange={(e) => {
                setCustomPlayers(e.target.value);
                setSelectedPlayers(null);
              }}
              className={`h-11 rounded-2xl border bg-black/20 px-3 text-sm text-[#CBCBCB] outline-none placeholder:text-[#444] ${
                customPlayers ? "border-white" : "border-white/10"
              }`}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={!effectivePrice || !effectivePlayers || isCreating}
          className={`h-12 rounded-full text-sm font-medium transition-colors ${
            effectivePrice && effectivePlayers && !isCreating
              ? "bg-white text-black hover:bg-[#F5F5F5]"
              : "cursor-not-allowed bg-white/5 text-[#4a4a4a]"
          }`}
        >
          {!isAuthenticated ? "Sign in to Create" : isCreating ? "Creating..." : "Create Room"}
        </button>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-1">
          <button onClick={() => setMode("idle")} className="text-left text-xs text-[#8A8A8A] hover:text-[#E8E8E8]">
            ← Back
          </button>
          <p className="text-lg font-medium text-[#F3F3F3]">Join Room</p>
          <p className="text-sm text-[#A3A3A3]">Paste a room ID and we’ll fetch the stake before you join.</p>
        </div>

        <div className="grid gap-2">
          <p className="text-sm text-[#CBCBCB]">Room ID</p>
          <input
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            onBlur={() => void fetchRoomData(joinRoomId)}
            placeholder="Paste room ID here"
            className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-[#CBCBCB] outline-none placeholder:text-[#444]"
          />
        </div>

        <div className="grid gap-2">
          <p className="text-sm text-[#CBCBCB]">Required Stake</p>
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

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={!joinRoomId.trim() || isJoining || roomStake === null}
          className={`h-12 rounded-full text-sm font-medium transition-colors ${
            joinRoomId.trim() && !isJoining && roomStake !== null
              ? "bg-white text-black hover:bg-[#F5F5F5]"
              : "cursor-not-allowed bg-white/5 text-[#4a4a4a]"
          }`}
        >
          {!isAuthenticated ? "Sign in to Join" : isJoining ? "Joining..." : "Join Room"}
        </button>
      </div>
    );
  }

  if (mode === "created" && createdRoom) {
    return (
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium text-[#F3F3F3]">Room created! 🎉</p>
          <p className="text-sm text-[#A3A3A3]">Share the room ID or link with friends.</p>
        </div>

        <div className="grid gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#737373]">Room ID</p>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-[#E8E8E8]">{createdRoom.id}</span>
            <button onClick={() => handleCopy(createdRoom.id)} className="text-xs text-[#9A9A9A] hover:text-white transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#737373]">Room Link</p>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <span className="block truncate text-sm text-[#CBCBCB]">{roomLink}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => handleCopy(roomLink)} className="flex-1 h-12 rounded-full bg-white text-black text-sm font-medium hover:bg-[#F5F5F5] transition-colors">
            Copy Link
          </button>
          <button onClick={() => router.push(`/${gameType}/${createdRoom.id}`)} className="flex-1 h-12 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-[#E8E8E8] hover:bg-white/10 hover:text-white transition-colors">
            Enter Room
          </button>
        </div>
      </div>
    );
  }

  return null;
}
