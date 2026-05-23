"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useRoom } from "@/hooks/useRoom";

type GameType = "spin" | "flip" | "draw";

interface JoinRoomModalProps {
  gameType: GameType;
  roomId: string;
  onJoined: () => void;
}

export function JoinRoomModal({ gameType, roomId, onJoined }: JoinRoomModalProps) {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuthContext();
  const { joinRoom, isJoining, error } = useRoom();

  const [joined, setJoined] = useState(false);
  const [roomStake, setRoomStake] = useState<number | null>(null);
  const [fetchingRoom, setFetchingRoom] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRoom() {
      setFetchingRoom(true);
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (!cancelled) {
          if (res.ok) {
            const { room } = await res.json();
            setRoomStake(room && room.stakeAmount ? Number(room.stakeAmount) / 1_000_000 : null);
          } else {
            setRoomStake(null);
          }
        }
      } catch {
        if (!cancelled) setRoomStake(null);
      } finally {
        if (!cancelled) setFetchingRoom(false);
      }
    }

    void fetchRoom();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    if (roomStake === null) return;

    const ok = await joinRoom(roomId, roomStake);
    if (ok) {
      setJoined(true);
      setTimeout(() => onJoined(), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-[420px] flex-col gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium text-[#F3F3F3]">You’ve been invited</p>
          <p className="text-sm text-[#A3A3A3]">Join this private {gameType} room to play.</p>
        </div>

        <div className="grid gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#737373]">Room ID</p>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="truncate font-mono text-sm text-[#E8E8E8]">{roomId}</p>
          </div>
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
              <span className="text-sm text-[#737373]">Room not found</span>
            )}
          </div>
          <p className="text-xs text-[#8A8A8A]">USDC will be approved and deposited on-chain.</p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {joined && <p className="text-sm text-emerald-400 text-center">Joined! Loading game...</p>}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleJoin}
            disabled={fetchingRoom || roomStake === null || isJoining || joined}
            className={`h-12 rounded-full text-sm font-medium transition-colors ${
              !fetchingRoom && roomStake !== null && !isJoining && !joined
                ? "bg-white text-black hover:bg-[#F5F5F5]"
                : "cursor-not-allowed bg-white/5 text-[#4a4a4a]"
            }`}
          >
            {!isAuthenticated ? "Sign in to Join" : isJoining ? "Joining..." : joined ? "Joined!" : "Join & Pay"}
          </button>
          <button
            onClick={() => router.push(`/${gameType}`)}
            className="h-12 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-[#E8E8E8] transition-colors hover:bg-white/10 hover:text-white"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
