"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { useAuthContext } from "@/context/AuthContext";
import { useContractGame } from "./useContractGame";
import { PUSHER_EVENTS } from "@/lib/pusher";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GameState {
  roomId: string;
  pricePool: number;
  players: Player[];
  totalPlayers: number;
  minPlayers: number;
  yourEntry: number;
  potentialWin: number;
  drawTime: number; // unix ms
  isLive: boolean;
  status: "waiting" | "active" | "completed" | "cancelled";
}

export interface Player {
  id: string;
  address: string;
  username?: string | null;
  avatar?: string | null;
  isYou?: boolean;
  color: string;
}

const PLAYER_COLORS = [
  "#8B5CF6",
  "#EAB308",
  "#EF4444",
  "#10B981",
  "#3B82F6",
  "#F97316",
  "#EC4899",
  "#14B8A6",
];

const MIN_PLAYERS = 3;
const FEE_PERCENT = 0.05;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGameState(roomId: string) {
  const { user, authHeaders } = useAuthContext();
  const {
    currentRound,
    yourDeposit,
    depositUSDC,
    isApproving,
    isDepositing,
    lastWinner,
  } = useContractGame();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomStatus, setRoomStatus] = useState<GameState["status"]>("waiting");
  const pusherRef = useRef<Pusher | null>(null);

  // ── Fetch initial room state from API ─────────────────────────────────────

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms/${roomId}`, {
          headers: authHeaders(),
        });
        if (!res.ok) return;

        const { room } = await res.json();
        setRoomStatus(room.status);

        // Map DB participants to Player[]
        const mapped: Player[] = room.participants.map(
          (
            p: {
              user: {
                id: string;
                wallet: string;
                username?: string;
                avatar?: string;
              };
            },
            i: number,
          ) => ({
            id: p.user.id,
            address: p.user.wallet,
            username: p.user.username,
            avatar: p.user.avatar,
            isYou: p.user.id === user?.id,
            color: PLAYER_COLORS[i % PLAYER_COLORS.length],
          }),
        );
        setPlayers(mapped);
      } catch (err) {
        console.error("[useGameState] fetchRoom error:", err);
      }
    }

    fetchRoom();
  }, [roomId]);

  // ── Pusher real-time subscription ─────────────────────────────────────────

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    pusherRef.current = pusher;
    const channel = pusher.subscribe(`room-${roomId}`);

    // New player joined
    channel.bind(
      PUSHER_EVENTS.PLAYER_JOINED,
      (data: {
        participant: {
          userId: string;
          wallet: string;
          username?: string;
          avatar?: string;
        };
        totalPlayers: number;
      }) => {
        setPlayers((prev) => {
          // Avoid duplicates
          if (prev.find((p) => p.id === data.participant.userId)) return prev;
          return [
            ...prev,
            {
              id: data.participant.userId,
              address: data.participant.wallet,
              username: data.participant.username,
              avatar: data.participant.avatar,
              isYou: data.participant.userId === user?.id,
              color: PLAYER_COLORS[prev.length % PLAYER_COLORS.length],
            },
          ];
        });
      },
    );

    // Game started
    channel.bind(PUSHER_EVENTS.GAME_STARTED, () => {
      setRoomStatus("active");
    });

    // Result revealed
    channel.bind(PUSHER_EVENTS.RESULT_REVEALED, () => {
      setRoomStatus("completed");
    });

    // Round cancelled
    channel.bind(PUSHER_EVENTS.ROUND_CANCELLED, () => {
      setRoomStatus("cancelled");
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`room-${roomId}`);
      pusher.disconnect();
    };
  }, [roomId, user?.id]);

  // ── Handle WinnerSelected on-chain event → call /settle ──────────────────

  useEffect(() => {
    if (!lastWinner) return;

    async function settle() {
      try {
        await fetch(`/api/rooms/${roomId}/settle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({
            winnerWallet: lastWinner!.winner,
            prizeAmount: lastWinner!.prizeAmount.toString(),
            vrfRequestId: lastWinner!.roundId.toString(),
            txHash: `vrf-${lastWinner!.roundId}`,
          }),
        });
      } catch (err) {
        console.error("[useGameState] settle error:", err);
      }
    }

    settle();
  }, [lastWinner]);

  // ── Derived game state from contract data ─────────────────────────────────

  const gameState: GameState = {
    roomId,
    players,
    pricePool: currentRound?.prizePool ?? 0,
    totalPlayers: currentRound?.playerCount ?? players.length,
    minPlayers: MIN_PLAYERS,
    yourEntry: yourDeposit,
    potentialWin: (currentRound?.prizePool ?? 0) * (1 - FEE_PERCENT),
    drawTime: currentRound
      ? Number(currentRound.endTime) * 1000
      : Date.now() + 180000,
    isLive: roomStatus === "active" || roomStatus === "waiting",
    status: roomStatus,
  };

  // ── addEntry — approve USDC + deposit + record in API ────────────────────

  const addEntry = useCallback(
    async (amount: number) => {
      if (!user) return;
      setLoading(true);

      try {
        const txHash = await depositUSDC(amount);
        if (!txHash) return;

        // Record participant in DB
        await fetch(`/api/rooms/${roomId}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({ txHash }),
        });
      } catch (err) {
        console.error("[useGameState] addEntry error:", err);
      } finally {
        setLoading(false);
      }
    },
    [user, roomId, depositUSDC, authHeaders],
  );

  return {
    gameState,
    players,
    loading: loading || isApproving || isDepositing,
    addEntry,
    lastWinner,
  };
}
