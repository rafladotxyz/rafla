"use client";

import { useState, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useContractGame } from "./useContractGame";

export interface CreatedRoom {
  id: string;
  gameType: string;
  stakeAmount: string;
  status: string;
  drawTime: string | null;
  contractRound: string | null;
}

export function useRoom() {
  const { authHeaders, isAuthenticated } = useAuthContext();
  const { currentRound, depositUSDC, isDepositing, isApproving } =
    useContractGame();

  const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Create a room ─────────────────────────────────────────────────────────

  const createRoom = useCallback(
    async (params: {
      gameType: "spin" | "flip" | "draw";
      stakeAmountDollars: number;
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

        const res = await fetch("/api/rooms/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({
            gameType: params.gameType,
            stakeAmount: String(params.stakeAmountDollars * 1_000_000), // USDC 6 decimals
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
      } catch (err) {
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
    async (roomId: string, stakeAmountDollars: number): Promise<boolean> => {
      if (!isAuthenticated) {
        setError("please sign in first");
        return false;
      }

      setIsJoining(true);
      setError(null);

      try {
        // 1. Approve + deposit USDC on-chain
        const txHash = await depositUSDC(stakeAmountDollars);
        if (!txHash) {
          setError("transaction cancelled");
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
      } catch (err) {
        setError("failed to join room");
        return false;
      } finally {
        setIsJoining(false);
      }
    },
    [isAuthenticated, authHeaders, depositUSDC],
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
    error,
  };
}
