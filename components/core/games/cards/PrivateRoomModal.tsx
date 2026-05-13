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
  const [customPrice, setCustomPrice] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [customPlayers, setCustomPlayers] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [roomStake, setRoomStake] = useState<number | null>(null);
  const [fetchingRoom, setFetchingRoom] = useState(false);

  const effectivePrice = customPrice ? Number(customPrice) : selectedPrice;
  const effectivePlayers = customPlayers ? Number(customPlayers) : selectedPlayers;

  // ── Create flow ───────────────────────────────────────────────────────────

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

  // Fetch room stake when joinRoomId changes
  const fetchRoomData = async (id: string) => {
    if (!id.trim()) return;
    setFetchingRoom(true);
    try {
      const res = await fetch(`/api/rooms/${id}`);
      if (res.ok) {
        const { room } = await res.json();
        if (room && room.stakeAmount) {
          setRoomStake(Number(room.stakeAmount) / 1_000_000);
        } else {
          setRoomStake(null);
        }
      }
    } catch (err) {
      console.error("fetchRoomData error:", err);
    } finally {
      setFetchingRoom(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    const finalRoomId = joinRoomId.trim();
    if (!finalRoomId) return;

    // We must have roomStake (fetched automatically)
    if (roomStake === null) {
      // Try one last fetch
      await fetchRoomData(finalRoomId);
    }

    // Wait, if still null, we might need a fallback or show error
    // But ideally it's already fetched.

    const ok = await joinRoom(finalRoomId, roomStake ?? 1);
    if (ok) {
      setJoinSuccess(true);
      setTimeout(() => {
        router.push(`/${gameType}/${finalRoomId}`);
      }, 1000);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[999] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative flex flex-col w-full max-w-[345px] rounded-3xl bg-[#141414] border-[1.5px] border-[#282828] p-5 gap-5">
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
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setSelectedPrice(opt.value);
                      setCustomPrice("");
                    }}
                    className={`flex-1 min-w-[60px] h-9 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
                      selectedPrice === opt.value
                        ? "border-[#CBCBCB] bg-[#1f1f1f]"
                        : "border-[#282828] bg-[#0A0A0A]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="flex-1 min-w-[100px] relative">
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customPrice}
                    onChange={(e) => {
                      setCustomPrice(e.target.value);
                      setSelectedPrice(null);
                    }}
                    className={`w-full h-9 px-3 rounded-lg border text-[14px] text-[#CBCBCB] bg-[#0A0A0A] outline-none transition-colors placeholder-[#444] ${
                      customPrice ? "border-[#CBCBCB]" : "border-[#282828]"
                    }`}
                  />
                  {customPrice && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#737373]">USDC</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#CBCBCB]">Minimum players</p>
              <div className="flex flex-wrap gap-2">
                {PLAYER_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setSelectedPlayers(count);
                      setCustomPlayers("");
                    }}
                    className={`flex-1 min-w-[60px] h-9 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
                      selectedPlayers === count
                        ? "border-[#CBCBCB] bg-[#1f1f1f]"
                        : "border-[#282828] bg-[#0A0A0A]"
                    }`}
                  >
                    {count}
                  </button>
                ))}
                <div className="flex-1 min-w-[100px]">
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customPlayers}
                    onChange={(e) => {
                      setCustomPlayers(e.target.value);
                      setSelectedPlayers(null);
                    }}
                    className={`w-full h-9 px-3 rounded-lg border text-[14px] text-[#CBCBCB] bg-[#0A0A0A] outline-none transition-colors placeholder-[#444] ${
                      customPlayers ? "border-[#CBCBCB]" : "border-[#282828]"
                    }`}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-[12px] text-red-400">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={!effectivePrice || !effectivePlayers || isCreating}
              className={`w-full h-11 rounded-xl text-[14px] font-medium transition-colors ${
                effectivePrice && effectivePlayers && !isCreating
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
                  ? "You've been invited. Deposit stake to join."
                  : "Enter a room ID to join your friend's game"}
              </p>
            </div>

            {/* Room ID input — hidden if passed from URL */}
            {!urlRoomId && (
              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[#CBCBCB]">Room ID</p>
                <input
                  value={joinRoomId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setJoinRoomId(id);
                    if (id.length >= 6) fetchRoomData(id);
                  }}
                  onBlur={() => fetchRoomData(joinRoomId)}
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

            {/* Stake display (Fixed) */}
            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#CBCBCB]">Required Stake</p>
              <div className="h-11 px-4 flex items-center justify-between rounded-xl bg-[#0A0A0A] border border-[#282828]">
                {fetchingRoom ? (
                  <div className="w-4 h-4 border-2 border-[#CBCBCB] border-t-transparent rounded-full animate-spin" />
                ) : roomStake !== null ? (
                  <>
                    <span className="text-[14px] text-[#CBCBCB] font-medium">${roomStake} USDC</span>
                    <span className="text-[11px] text-[#737373]">Fixed by creator</span>
                  </>
                ) : (
                  <span className="text-[13px] text-[#4a4a4a]">Enter valid Room ID</span>
                )}
              </div>
            </div>

            {error && <p className="text-[12px] text-red-400">{error}</p>}
            {joinSuccess && (
              <p className="text-[12px] text-green-400 text-center">
                Joined! Entering room...
              </p>
            )}

            <button
              onClick={handleJoin}
              disabled={
                (!joinRoomId.trim() && !urlRoomId) || isJoining || joinSuccess || roomStake === null
              }
              className={`w-full h-11 rounded-xl text-[14px] font-medium transition-colors ${
                (joinRoomId.trim() || urlRoomId) && !isJoining && !joinSuccess && roomStake !== null
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
