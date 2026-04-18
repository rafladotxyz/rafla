"use client";

import { useState } from "react";
import { useRoom } from "@/hooks/useRoom";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const PRICE_OPTIONS = [
  { label: "$1", value: 1 },
  { label: "$2", value: 2 },
  { label: "$3", value: 3 },
  { label: "$5", value: 5 },
];
const PLAYER_OPTIONS = [2, 4, 6, 8];

type GameType = "spin" | "flip" | "draw";
type Mode = "choose" | "create" | "join" | "created";

interface PrivateRoomModalProps {
  gameType: GameType;
  roomId?: string; // if passed from URL, skip straight to join
  onClose: () => void;
}

export function PrivateRoomModal({
  gameType,
  roomId: urlRoomId,
  onClose,
}: PrivateRoomModalProps) {
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

  // If roomId came from URL → skip straight to join screen
  const [mode, setMode] = useState<Mode>(urlRoomId ? "join" : "choose");
  const [joinRoomId, setJoinRoomId] = useState(urlRoomId ?? "");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // ── Create flow ───────────────────────────────────────────────────────────

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

  const handleCopy = async () => {
    if (!createdRoom) return;
    await copyRoomLink(createdRoom.id, gameType);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roomLink = createdRoom
    ? `${typeof window !== "undefined" ? window.location.origin : "https://rafla.xyz"}/${gameType}/${createdRoom.id}`
    : "";

  // ── Join flow ─────────────────────────────────────────────────────────────

  const handleJoin = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    if (!joinRoomId.trim()) return;

    const ok = await joinRoom(joinRoomId.trim(), selectedPrice ?? 1);
    if (ok) {
      setJoinSuccess(true);
      setTimeout(() => {
        router.push(`/${gameType}/${joinRoomId.trim()}`);
      }, 1000);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[999] backdrop-blur-sm flex items-center justify-center">
      <div className="relative flex flex-col w-[345px] rounded-3xl bg-[#141414] border-[1.5px] border-[#282828] p-5 gap-5">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#737373] hover:text-[#CBCBCB] transition-colors text-lg leading-none"
        >
          ✕
        </button>

        {/* ── Choose mode ── */}
        {mode === "choose" && (
          <>
            <div className="flex flex-col gap-1">
              <p className="text-[16px] font-semibold text-[#D9D9D9]">
                Private Room
              </p>
              <p className="text-[14px] text-[#737373]">
                Create a new room or join an existing one
              </p>
            </div>
            <button
              onClick={() => setMode("create")}
              className="w-full h-11 rounded-xl bg-white text-[#0A0A0A] text-[14px] font-medium hover:bg-[#E8E8E8] transition-colors"
            >
              Create Private Room
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full h-11 rounded-xl border border-[#282828] text-[#CBCBCB] text-[14px] font-medium hover:border-[#444] transition-colors"
            >
              Join with Room ID
            </button>
          </>
        )}

        {/* ── Create mode ── */}
        {mode === "create" && (
          <>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setMode("choose")}
                className="text-[12px] text-[#737373] hover:text-[#CBCBCB] text-left mb-1"
              >
                ← Back
              </button>
              <p className="text-[16px] font-semibold text-[#D9D9D9]">
                Create Private Room
              </p>
              <p className="text-[14px] text-[#737373]">
                Set your stake and player count
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#CBCBCB]">Price per ticket</p>
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

            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#CBCBCB]">Minimum players</p>
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
          </>
        )}

        {/* ── Created — share screen ── */}
        {mode === "created" && createdRoom && (
          <>
            <div className="flex flex-col gap-1">
              <p className="text-[16px] font-semibold text-[#D9D9D9]">
                Room Created! 🎉
              </p>
              <p className="text-[14px] text-[#737373]">
                Share the link or ID with friends
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-[#737373] uppercase tracking-wider">
                Room ID
              </p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#282828]">
                <span className="flex-1 text-[13px] text-[#CBCBCB] font-mono truncate">
                  {createdRoom.id}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdRoom.id);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-[12px] text-[#737373] hover:text-[#CBCBCB] transition-colors shrink-0"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-[#737373] uppercase tracking-wider">
                Room Link
              </p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#282828]">
                <span className="flex-1 text-[13px] text-[#CBCBCB] truncate">
                  {roomLink}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 h-11 rounded-xl bg-white text-[#0A0A0A] text-[14px] font-medium hover:bg-[#E8E8E8] transition-colors"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={() => router.push(`/${gameType}/${createdRoom.id}`)}
                className="flex-1 h-11 rounded-xl border border-[#282828] text-[#CBCBCB] text-[14px] font-medium hover:border-[#444] transition-colors"
              >
                Enter Room
              </button>
            </div>
          </>
        )}

        {/* ── Join mode ── */}
        {mode === "join" && (
          <>
            <div className="flex flex-col gap-1">
              {!urlRoomId && (
                <button
                  onClick={() => setMode("choose")}
                  className="text-[12px] text-[#737373] hover:text-[#CBCBCB] text-left mb-1"
                >
                  ← Back
                </button>
              )}
              <p className="text-[16px] font-semibold text-[#D9D9D9]">
                {urlRoomId ? "Join Room" : "Join Private Room"}
              </p>
              <p className="text-[14px] text-[#737373]">
                {urlRoomId
                  ? "You've been invited. Select stake and join."
                  : "Enter a room ID to join your friend's game"}
              </p>
            </div>

            {/* Room ID input — hidden if passed from URL */}
            {!urlRoomId && (
              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[#CBCBCB]">Room ID</p>
                <input
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Paste room ID here"
                  className="h-10 px-3 rounded-xl bg-[#0A0A0A] border border-[#282828] text-[14px] text-[#CBCBCB] placeholder-[#444] outline-none focus:border-[#555] transition-colors"
                />
              </div>
            )}

            {/* Show room ID if from URL */}
            {urlRoomId && (
              <div className="px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#282828]">
                <p className="text-[12px] text-[#737373] mb-1">Room ID</p>
                <p className="text-[13px] text-[#CBCBCB] font-mono truncate">
                  {urlRoomId}
                </p>
              </div>
            )}

            {/* Stake selection */}
            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#CBCBCB]">Your stake</p>
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

            {error && <p className="text-[12px] text-red-400">{error}</p>}
            {joinSuccess && (
              <p className="text-[12px] text-green-400">
                Joined! Entering room...
              </p>
            )}

            <button
              onClick={handleJoin}
              disabled={
                (!joinRoomId.trim() && !urlRoomId) || isJoining || joinSuccess
              }
              className={`w-full h-11 rounded-xl text-[14px] font-medium transition-colors ${
                (joinRoomId.trim() || urlRoomId) && !isJoining && !joinSuccess
                  ? "bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] cursor-pointer"
                  : "bg-[#1A1A1A] text-[#4a4a4a] cursor-not-allowed"
              }`}
            >
              {!isAuthenticated
                ? "Sign in to Join"
                : isJoining
                  ? "Joining..."
                  : joinSuccess
                    ? "Joined!"
                    : "Join Room"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
