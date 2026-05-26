"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useRoom } from "@/hooks/useRoom";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

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
        if (cancelled) return;

        if (res.ok) {
          const { room } = await res.json();
          setRoomStake(room && room.stakeAmount ? Number(room.stakeAmount) / 1_000_000 : null);
        } else {
          setRoomStake(null);
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
      window.setTimeout(() => onJoined(), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
      <SurfaceCard className="w-full max-w-[520px] p-5 md:p-6">
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
              You’re invited
            </p>
            <h2 className="text-xl font-semibold text-[#F3F3F3]">
              Join this private {gameType} room.
            </h2>
            <p className="text-sm leading-relaxed text-[#A3A3A3]">
              Deposit the required stake to enter and load the game.
            </p>
          </div>

          <div className="grid gap-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
              Room ID
            </p>
            <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
              <p className="truncate font-mono text-sm text-[#E8E8E8]">{roomId}</p>
            </div>
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
                <span className="text-sm text-[#737373]">Room not found</span>
              )}
            </div>
            <p className="text-xs text-[#8A8A8A]">
              USDC will be approved and deposited on-chain.
            </p>
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {joined ? (
            <p className="text-center text-sm text-emerald-400">
              Joined. Loading game...
            </p>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleJoin}
              disabled={fetchingRoom || roomStake === null || isJoining || joined}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors ${!fetchingRoom && roomStake !== null && !isJoining && !joined ? "bg-white text-black hover:bg-[#F5F5F5]" : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"}`}
            >
              {!isAuthenticated ? "Sign in to join" : isJoining ? "Joining..." : joined ? "Joined" : "Join & pay"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${gameType}`)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
            >
              Maybe later
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
