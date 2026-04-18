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

  const handleJoin = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    if (!selectedPrice) return;

    const ok = await joinRoom(roomId, selectedPrice);
    if (ok) {
      setJoined(true);
      setTimeout(() => {
        onJoined(); // reveal the game UI
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col w-[345px] rounded-3xl bg-[#141414] border-[1.5px] border-[#282828] p-6 gap-5">
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

        {/* Stake selection */}
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-[#CBCBCB]">Select your stake</p>
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
            disabled={!selectedPrice || isJoining || joined}
            className={`w-full h-11 rounded-xl text-[14px] font-medium transition-colors ${
              selectedPrice && !isJoining && !joined
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
