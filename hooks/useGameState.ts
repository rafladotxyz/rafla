"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useContractGame } from "./useContractGame";
import { usePusherRoom } from "./usePusherRoom";
import type { PlayerJoinedPayload } from "@/lib/pusher";
import type { StakeToken } from "@/components/core/games/GameStakeModal";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GameState {
  roomId: string;
  pricePool: number;
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

const DEFAULT_MIN_PLAYERS = 3;
const FEE_PERCENT = 0.05;
const EMPTY_ID = "3455654";

// ─── Hook ────────────────────────────────────────────────────────────────────
export type GameType = "draw" | "flip" | "spin";

export function useGameState(roomId: string, gameType: GameType = "draw") {
  const { user, authHeaders } = useAuthContext();
  const {
    currentRound,
    yourDepositRaw,
    depositUSDC,
    depositOARCOIN,
    depositETH,
    playFlip,
    playSpin,
    isApproving,
    isDepositing,
    lastWinner,
    lastFlipResult,
    lastSpinResult,
    error: contractError,
  } = useContractGame();

  const recordedTxs = useRef<Set<string>>(new Set());

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomStatus, setRoomStatus] = useState<GameState["status"]>("waiting");
  const [roomMinPlayers, setRoomMinPlayers] = useState(DEFAULT_MIN_PLAYERS);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  const isEmptyState = roomId === EMPTY_ID;

  // ── Fetch initial room + participants from API ─────────────────────────────

  useEffect(() => {
    if (isEmptyState) return;

    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms/${roomId}`, {
          headers: authHeaders(),
        });
        if (!res.ok) return;

        const { room } = await res.json();
        setRoomStatus(room.status);
        setRoomMinPlayers(room.minPlayers ?? DEFAULT_MIN_PLAYERS);

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
  }, [roomId, user?.id, authHeaders, isEmptyState]);

  // ── Pusher real-time ──────────────────────────────────────────────────────

  usePusherRoom({
    roomId,

    onPlayerJoined(data: PlayerJoinedPayload) {
      setPlayers((prev) => {
        // Deduplicate
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

    onGameStarted() {
      setRoomStatus("active");
    },

    onResultRevealed() {
      setRoomStatus("completed");
    },

    onRoundCancelled() {
      setRoomStatus("cancelled");
    },
  });

  // ── Settle on WinnerSelected contract event ───────────────────────────────

  useEffect(() => {
    if (!lastWinner || isEmptyState) return;

    async function settle() {
      try {
        const res = await fetch(`/api/rooms/${roomId}/settle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({
            winnerWallet: lastWinner!.winner,
            // Send the USDC prize (most human-readable). ETH + OAR are also available.
            prizeAmount: lastWinner!.usdcPrize.toString(),
            vrfRequestId: lastWinner!.roundId.toString(),
            txHash: `vrf-${lastWinner!.roundId}`,
          }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(
            json?.error || "Failed to save the settled round in the database",
          );
        }
      } catch (err) {
        console.error("[useGameState] settle error:", err);
        setPersistenceError("Settlement synced on-chain, but saving it to the app failed.");
      }
    }

    settle();
  }, [lastWinner, roomId, authHeaders, isEmptyState]);

  // ── Record Instant Games (Flip/Spin) ──────────────────────────────────────

  useEffect(() => {
    if (!isEmptyState) return;

    const recordGame = async (payload: {
      gameType: "flip" | "spin";
      stakeAmount: number;
      txHash: string;
      won: boolean;
      prizeAmount: number;
    }) => {
      try {
        const res = await fetch("/api/games/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.error || "Failed to save the game result");
        }
      } catch (err) {
        console.error("[useGameState] record error:", err);
        setPersistenceError("The on-chain game finished, but saving the result failed.");
      }
    };

    if (lastFlipResult && !recordedTxs.current.has(lastFlipResult.transactionHash)) {
      recordedTxs.current.add(lastFlipResult.transactionHash);
      // amount / payout are raw OAR bigints — convert to float for the API
      const stakeOAR = Number(lastFlipResult.amount) / 1e18;
      void recordGame({
        gameType: "flip",
        stakeAmount: stakeOAR,
        txHash: lastFlipResult.transactionHash,
        won: lastFlipResult.won,
        prizeAmount: lastFlipResult.won ? stakeOAR * 2 * 0.97 : 0, // 3% fee
      });
    } else if (lastSpinResult && !recordedTxs.current.has(lastSpinResult.transactionHash)) {
      recordedTxs.current.add(lastSpinResult.transactionHash);
      const stakeOAR = Number(lastSpinResult.amount) / 1e18;
      const payoutOAR = Number(lastSpinResult.payout) / 1e18;
      void recordGame({
        gameType: "spin",
        stakeAmount: stakeOAR,
        txHash: lastSpinResult.transactionHash,
        won: lastSpinResult.payout > 0n,
        prizeAmount: payoutOAR,
      });
    }
  }, [lastFlipResult, lastSpinResult, isEmptyState, authHeaders]);

  // ── Derived game state ────────────────────────────────────────────────────

  const gameState: GameState = {
    roomId,
    // prizePoolRaw is a mixed-unit weighted sum — display as raw bigint converted to number
    pricePool: currentRound ? Number(currentRound.prizePoolRaw) : 0,
    totalPlayers: currentRound?.playerCount ?? players.length,
    minPlayers: roomMinPlayers,
    // yourDepositRaw is a bigint — convert to number for the UI
    yourEntry: Number(yourDepositRaw),
    potentialWin: currentRound ? Number(currentRound.prizePoolRaw) * (1 - FEE_PERCENT) : 0,
    drawTime: currentRound
      ? Number(currentRound.endTime) * 1000
      : Date.now() + 180_000,
    isLive: roomStatus === "active" || roomStatus === "waiting",
    status: roomStatus,
  };

  // ── addEntry — approve + deposit on-chain + record in API ─────────────────

  const addEntry = useCallback(
    async (
      amount: number,
      extra?: { choice?: "heads" | "tails"; token?: StakeToken },
    ): Promise<boolean> => {
      if (!user) return false;

      setPersistenceError(null);

      // For 'draw' (Raffle), we need a roomId
      if (gameType === "draw" && isEmptyState) return false;

      setLoading(true);

      let txSucceeded = false;

      try {
        let txHash: `0x${string}` | null = null;

        if (gameType === "draw") {
          // Route to the right deposit based on chosen token (default USDC)
          const token = extra?.token ?? "USDC";
          if (token === "ETH") {
            txHash = await depositETH(amount);
          } else if (token === "OAR") {
            txHash = await depositOARCOIN(amount);
          } else {
            txHash = await depositUSDC(amount);
          }
        } else if (gameType === "flip") {
          // Flip always uses OAR
          const choice = (extra?.choice === "tails" ? 1 : 0) as 0 | 1;
          txHash = await playFlip(choice, amount);
        } else if (gameType === "spin") {
          // Spin always uses OAR
          txHash = await playSpin(amount);
        }

        if (!txHash) return false;

        txSucceeded = true;

        // Record in API (if room exists)
        if (!isEmptyState) {
          const res = await fetch(`/api/rooms/${roomId}/join`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders(),
            },
            body: JSON.stringify({ txHash }),
          });

          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || "Failed to save the room join");
          }
        }

        return true;
      } catch (err) {
        console.error("[useGameState] addEntry error:", err);
        setPersistenceError(
          "The on-chain transaction succeeded, but saving it in the app failed.",
        );
        return txSucceeded;
      } finally {
        setLoading(false);
      }
    },
    [user, roomId, gameType, depositUSDC, depositOARCOIN, depositETH, playFlip, playSpin, authHeaders, isEmptyState],
  );

  return {
    gameState,
    players,
    loading: loading || isApproving || isDepositing,
    addEntry,
    lastWinner,
    lastFlipResult,
    lastSpinResult,
    error: contractError || persistenceError,
  };
}
