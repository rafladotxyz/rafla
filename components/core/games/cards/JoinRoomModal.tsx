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

type GameType = "spin" | "flip" | "draw";

interface JoinRoomModalProps {
  gameType: GameType;
  roomId: string;
  onJoined: () => void; // called when join is confirmed, shows the game
}

export function JoinRoomModal({
  gameType,
  roomId,
  onJoined,
}: JoinRoomModalProps) {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuthContext();
  const { joinRoom, isJoining, error } = useRoom();

  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [joined, setJoined] = useState(false);
  const [roomStake, setRoomStake] = useState<number | null>(null);
  const [fetchingRoom, setFetchingRoom] = useState(true);

  // Fetch room data on mount
  useState(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (res.ok) {
          const { room } = await res.json();
          if (room && room.stakeAmount) {
            setRoomStake(Number(room.stakeAmount) / 1_000_000);
          }
        }
      } catch (err) {
        console.error("JoinRoomModal fetch error:", err);
      } finally {
        setFetchingRoom(false);
      }
    }
    fetchRoom();
  });

  const handleJoin = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    if (roomStake === null) return;

    const ok = await joinRoom(roomId, roomStake);
    if (ok) {
      setJoined(true);
      setTimeout(() => {
        onJoined(); // reveal the game UI
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="flex flex-col w-full max-w-[345px] rounded-3xl bg-[#141414] border-[1.5px] border-[#282828] p-6 gap-5">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-[16px] font-semibold text-[#D9D9D9]">
            {`You've been invited 🎉`}
          </p>
          <p className="text-[13px] text-[#737373]">
            Join this private {gameType} room to play
          </p>
        </div>

        {/* Room ID display */}
        <div className="px-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#282828]">
          <p className="text-[11px] text-[#737373] mb-1">Room ID</p>
          <p className="text-[13px] text-[#CBCBCB] font-mono truncate">
            {roomId}
          </p>
        </div>

        {/* Stake display (Fixed) */}
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-[#CBCBCB]">Required Stake</p>
          <div className="h-11 px-4 flex items-center justify-between rounded-xl bg-[#0A0A0A] border border-[#282828]">
            {fetchingRoom ? (
              <div className="w-4 h-4 border-2 border-[#CBCBCB] border-t-transparent rounded-full animate-spin" />
            ) : roomStake !== null ? (
              <>
                <span className="text-[14px] text-[#CBCBCB] font-medium">${roomStake} USDC</span>
                <span className="text-[11px] text-[#737373]">Fixed by creator</span>
              </>
            ) : (
              <span className="text-[13px] text-[#EF4444]">Room not found</span>
            )}
          </div>
          <p className="text-[11px] text-[#737373]">
            USDC will be approved and deposited on-chain
          </p>
        </div>

        {error && <p className="text-[12px] text-red-400">{error}</p>}

        {joined && (
          <p className="text-[12px] text-green-400 text-center">
            Joined! Loading game...
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleJoin}
            disabled={fetchingRoom || roomStake === null || isJoining || joined}
            className={`w-full h-11 rounded-xl text-[14px] font-medium transition-colors ${
              !fetchingRoom && roomStake !== null && !isJoining && !joined
                ? "bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] cursor-pointer"
                : "bg-[#1A1A1A] text-[#4a4a4a] cursor-not-allowed"
            }`}
          >
            {!isAuthenticated
              ? "Sign in to Join"
              : isJoining
                ? "Joining..."
                : joined
                  ? "Joined!"
                  : "Join & Pay"}
          </button>
          <button
            onClick={() => router.push(`/${gameType}`)}
            className="w-full h-11 rounded-xl border border-[#282828] text-[#737373] text-[14px] hover:border-[#444] hover:text-[#CBCBCB] transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
