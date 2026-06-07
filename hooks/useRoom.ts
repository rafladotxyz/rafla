"use client";

import { useState, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useContractGame } from "./useContractGame";

export interface CreatedRoom {
  id: string;
  gameType: string;
  stakeAmount: string;
  token: string;
  status: string;
  drawTime: string | null;
  contractRound: string | null;
}

export function useRoom() {
  const { authHeaders, isAuthenticated } = useAuthContext();
  const {
    currentRound,
    depositUSDC,
    depositOARCOIN,
    depositETH,
    isDepositing,
    isApproving,
    error: contractError,
  } = useContractGame();

  const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Create a room ─────────────────────────────────────────────────────────

  const createRoom = useCallback(
    async (params: {
      gameType: "spin" | "flip" | "draw";
      stakeAmount: number;
      token: "USDC" | "OAR" | "ETH";
      minPlayers: number;
    }): Promise<CreatedRoom | null> => {
      if (!isAuthenticated) {
        setError("please sign in first");
        return null;
      }

      setIsCreating(true);
      setError(null);

      try {
        // Draw time = current round end time, or 3 min from now
        const drawTime = currentRound
          ? new Date(Number(currentRound.endTime) * 1000).toISOString()
          : new Date(Date.now() + 3 * 60 * 1000).toISOString();

        let rawAmount = "";
        if (params.token === "USDC") rawAmount = String(Math.round(params.stakeAmount * 1_000_000));
        else if (params.token === "ETH" || params.token === "OAR") {
          const [whole, frac = ""] = params.stakeAmount.toString().split(".");
          const padded = frac.padEnd(18, "0").slice(0, 18);
          rawAmount = (BigInt(whole) * BigInt(10 ** 18) + BigInt(padded)).toString();
        }

        const res = await fetch("/api/rooms/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({
            gameType: params.gameType,
            stakeAmount: rawAmount,
            token: params.token,
            minPlayers: params.minPlayers,
            drawTime,
            contractRound: currentRound?.id?.toString() ?? null,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "failed to create room");
          return null;
        }

        setCreatedRoom(json.room);
        return json.room;
      } catch {
        setError("network error");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [isAuthenticated, authHeaders, currentRound],
  );

  // ── Join a room (deposit on-chain + record in DB) ─────────────────────────

  const joinRoom = useCallback(
    async (roomId: string, token: string, stakeAmount: number): Promise<boolean> => {
      if (!isAuthenticated) {
        setError("please sign in first");
        return false;
      }

      setIsJoining(true);
      setError(null);

      try {
        let txHash: `0x${string}` | null = null;
        if (token === "USDC") {
          txHash = await depositUSDC(stakeAmount);
        } else if (token === "OAR") {
          txHash = await depositOARCOIN(stakeAmount);
        } else if (token === "ETH") {
          txHash = await depositETH(stakeAmount);
        }

        if (!txHash) {
          // Error is already set in useContractGame
          return false;
        }

        // 2. Record in DB + trigger Pusher broadcast
        const res = await fetch(`/api/rooms/${roomId}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({ txHash }),
        });

        if (!res.ok) {
          const json = await res.json();
          setError(json.error ?? "failed to join room");
          return false;
        }

        return true;
      } catch {
        setError("failed to join room");
        return false;
      } finally {
        setIsJoining(false);
      }
    },
    [isAuthenticated, authHeaders, depositUSDC, depositOARCOIN, depositETH],
  );

  // ── Room share helpers ────────────────────────────────────────────────────

  const getRoomLink = useCallback(
    (roomId: string, gameType: string) =>
      `${window.location.origin}/${gameType}/${roomId}`,
    [],
  );

  const copyRoomLink = useCallback(
    async (roomId: string, gameType: string) => {
      const link = getRoomLink(roomId, gameType);
      await navigator.clipboard.writeText(link);
    },
    [getRoomLink],
  );

  return {
    createRoom,
    joinRoom,
    getRoomLink,
    copyRoomLink,
    createdRoom,
    isCreating,
    isJoining: isJoining || isDepositing || isApproving,
    error: error || contractError,
  };
}
