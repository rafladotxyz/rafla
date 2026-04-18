"use client";

import { useState } from "react";
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
  isPublic?: boolean; // true = public tab, false = private tab
}

export function EmptyStateCard({ gameType, isPublic }: EmptyStateCardProps) {
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

  const [mode, setMode] = useState<Mode>("idle");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinPrice, setJoinPrice] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const roomLink = createdRoom
    ? `${typeof window !== "undefined" ? window.location.origin : "https://rafla.xyz"}/${gameType}/${createdRoom.id}`
    : "";

  // ── Create ────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    if (!selectedPrice || !selectedPlayers) return;

    const room = await createRoom({
      gameType,
      stakeAmountDollars: selectedPrice,
      minPlayers: selectedPlayers,
    });

    if (room) setMode("created");
  };

  // ── Join ──────────────────────────────────────────────────────────────────

  const handleJoin = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    if (!joinRoomId.trim()) return;

    const ok = await joinRoom(joinRoomId.trim(), joinPrice ?? 1);
    if (ok) {
      router.push(`/${gameType}/${joinRoomId.trim()}`);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Idle screen ───────────────────────────────────────────────────────────

  if (mode === "idle") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 w-full">
        <div className="flex flex-col items-center gap-3 max-w-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#282828] flex items-center justify-center text-3xl">
            {isPublic ? "🕐" : "🔒"}
          </div>
          <p className="text-[20px] font-semibold text-[#D9D9D9]">
            {isPublic ? "No open game right now" : "No active room"}
          </p>
          <p className="text-[14px] text-[#737373] leading-relaxed">
            {isPublic
              ? "The Rafla team hasn't opened a public game yet. Create a private room to play with friends while you wait."
              : "Create a private room and invite friends, or join an existing room with a room ID."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setMode("create")}
            className="h-11 px-6 rounded-xl bg-white text-[#0A0A0A] text-[14px] font-medium hover:bg-[#E8E8E8] transition-colors"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode("join")}
            className="h-11 px-6 rounded-xl border border-[#282828] text-[#CBCBCB] text-[14px] font-medium hover:border-[#444] transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  // ── Create screen ─────────────────────────────────────────────────────────

  if (mode === "create") {
    return (
      <div className="flex items-center justify-center py-16 w-full">
        <div className="flex flex-col w-[360px] rounded-3xl bg-[#141414] border border-[#282828] p-6 gap-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode("idle")}
              className="text-[#737373] hover:text-[#CBCBCB] transition-colors text-sm"
            >
              ← Back
            </button>
            <div className="flex flex-col">
              <p className="text-[16px] font-semibold text-[#D9D9D9]">
                Create Private Room
              </p>
              <p className="text-[13px] text-[#737373]">
                Set your stake and player count
              </p>
            </div>
          </div>

          {/* Price per ticket */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-[#CBCBCB]">Price per ticket</p>
            <div className="flex gap-2">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSelectedPrice(opt.value)}
                  className={`flex-1 h-9 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
                    selectedPrice === opt.value
                      ? "border-[#CBCBCB] bg-[#1f1f1f]"
                      : "border-[#282828] bg-[#0A0A0A]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Min players */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-[#CBCBCB]">Minimum players</p>
            <div className="flex gap-2">
              {PLAYER_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedPlayers(count)}
                  className={`flex-1 h-9 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
                    selectedPlayers === count
                      ? "border-[#CBCBCB] bg-[#1f1f1f]"
                      : "border-[#282828] bg-[#0A0A0A]"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={!selectedPrice || !selectedPlayers || isCreating}
            className={`w-full h-11 rounded-xl text-[14px] font-medium transition-colors ${
              selectedPrice && selectedPlayers && !isCreating
                ? "bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] cursor-pointer"
                : "bg-[#1A1A1A] text-[#4a4a4a] cursor-not-allowed"
            }`}
          >
            {!isAuthenticated
              ? "Sign in to Create"
              : isCreating
                ? "Creating..."
                : "Create Room"}
          </button>
        </div>
      </div>
    );
  }

  // ── Created — share screen ────────────────────────────────────────────────

  if (mode === "created" && createdRoom) {
    return (
      <div className="flex items-center justify-center py-16 w-full">
        <div className="flex flex-col w-[360px] rounded-3xl bg-[#141414] border border-[#282828] p-6 gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-[#D9D9D9]">
              Room Created! 🎉
            </p>
            <p className="text-[13px] text-[#737373]">
              Share the link or ID with friends to invite them
            </p>
          </div>

          {/* Room ID */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-[#737373] uppercase tracking-wider">
              Room ID
            </p>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#282828]">
              <span className="flex-1 text-[13px] text-[#CBCBCB] font-mono truncate">
                {createdRoom.id}
              </span>
              <button
                onClick={() => handleCopy(createdRoom.id)}
                className="text-[11px] text-[#737373] hover:text-[#CBCBCB] transition-colors shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Room Link */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-[#737373] uppercase tracking-wider">
              Invite Link
            </p>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#282828]">
              <span className="flex-1 text-[12px] text-[#CBCBCB] truncate">
                {roomLink}
              </span>
              <button
                onClick={() => handleCopy(roomLink)}
                className="text-[11px] text-[#737373] hover:text-[#CBCBCB] transition-colors shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Stake summary */}
          <div className="flex justify-between text-[12px] text-[#737373] border-t border-[#282828] pt-3">
            <span>Stake per player</span>
            <span className="text-[#CBCBCB]">${selectedPrice} USDC</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/${gameType}/${createdRoom.id}`)}
              className="flex-1 h-11 rounded-xl bg-white text-[#0A0A0A] text-[14px] font-medium hover:bg-[#E8E8E8] transition-colors"
            >
              Enter Room
            </button>
            <button
              onClick={() => handleCopy(roomLink)}
              className="flex-1 h-11 rounded-xl border border-[#282828] text-[#CBCBCB] text-[14px] font-medium hover:border-[#444] transition-colors"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Join screen ───────────────────────────────────────────────────────────

  if (mode === "join") {
    return (
      <div className="flex items-center justify-center py-16 w-full">
        <div className="flex flex-col w-[360px] rounded-3xl bg-[#141414] border border-[#282828] p-6 gap-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode("idle")}
              className="text-[#737373] hover:text-[#CBCBCB] transition-colors text-sm"
            >
              ← Back
            </button>
            <div className="flex flex-col">
              <p className="text-[16px] font-semibold text-[#D9D9D9]">
                Join Private Room
              </p>
              <p className="text-[13px] text-[#737373]">
                Enter the room ID from your friend
              </p>
            </div>
          </div>

          {/* Room ID input */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-[#CBCBCB]">Room ID</p>
            <input
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Paste room ID here..."
              className="h-11 px-4 rounded-xl bg-[#0A0A0A] border border-[#282828] text-[14px] text-[#CBCBCB] placeholder-[#444] outline-none focus:border-[#555] transition-colors"
            />
          </div>

          {/* Stake amount */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-[#CBCBCB]">Your stake</p>
            <div className="flex gap-2">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setJoinPrice(opt.value)}
                  className={`flex-1 h-9 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
                    joinPrice === opt.value
                      ? "border-[#CBCBCB] bg-[#1f1f1f]"
                      : "border-[#282828] bg-[#0A0A0A]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={!joinRoomId.trim() || isJoining}
            className={`w-full h-11 rounded-xl text-[14px] font-medium transition-colors ${
              joinRoomId.trim() && !isJoining
                ? "bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] cursor-pointer"
                : "bg-[#1A1A1A] text-[#4a4a4a] cursor-not-allowed"
            }`}
          >
            {!isAuthenticated
              ? "Sign in to Join"
              : isJoining
                ? "Joining..."
                : "Join Room"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
