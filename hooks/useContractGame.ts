"use client";

import { useState, useCallback } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useReadContract,
  useAccount,
} from "wagmi";
import { parseUnits } from "viem";
import {
  RAFFLE_ADDRESS,
  USDC_ADDRESS,
  RAFFLE_ABI,
  ERC20_ABI,
  toUSDCUnits,
  fromUSDCUnits,
  RoundStatus,
} from "@/lib/contract";

// Re-export so views only need one import
export { RoundStatus };

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CurrentRound {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  prizePool: number; // in USDC dollars
  playerCount: number;
  winner: string;
  status: RoundStatus;
  timeRemaining: number; // seconds
}

interface WinnerEvent {
  roundId: bigint;
  winner: string;
  prizeAmount: number;
  fee: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useContractGame() {
  const { address } = useAccount();

  const [approveTxHash, setApproveTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [depositTxHash, setDepositTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [endRoundTxHash, setEndRoundTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [lastWinner, setLastWinner] = useState<WinnerEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Read current round ────────────────────────────────────────────────────

  const { data: roundData, refetch: refetchRound } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "getCurrentRound",
  });

  const currentRound: CurrentRound | null = roundData
    ? {
        id: roundData[0],
        startTime: roundData[1],
        endTime: roundData[2],
        prizePool: fromUSDCUnits(roundData[3]),
        playerCount: Number(roundData[4]),
        winner: roundData[5],
        status: roundData[6] as RoundStatus,
        timeRemaining: Number(roundData[7]),
      }
    : null;

  // ── Read player deposit for current round ─────────────────────────────────

  const { data: playerDepositRaw } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "getPlayerDeposit",
    args: currentRound && address ? [currentRound.id, address] : undefined,
    query: { enabled: !!currentRound && !!address },
  });

  const yourDeposit = playerDepositRaw ? fromUSDCUnits(playerDepositRaw) : 0;

  // ── Write contracts ───────────────────────────────────────────────────────

  const { writeContractAsync } = useWriteContract();

  // Wait for approve tx
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // Wait for deposit tx
  const { isLoading: isDepositing, isSuccess: depositSuccess } =
    useWaitForTransactionReceipt({ hash: depositTxHash });

  // Wait for endRound tx
  const { isLoading: isEndingRound, isSuccess: endRoundSuccess } =
    useWaitForTransactionReceipt({ hash: endRoundTxHash });

  // ── depositUSDC (approve → deposit) ──────────────────────────────────────

  const depositUSDC = useCallback(
    async (dollarAmount: number): Promise<`0x${string}` | null> => {
      if (!address) {
        setError("wallet not connected");
        return null;
      }

      setError(null);

      try {
        const rawAmount = toUSDCUnits(dollarAmount);

        // Step 1: approve USDC spend
        const approveTx = await writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [RAFFLE_ADDRESS, rawAmount],
        });
        setApproveTxHash(approveTx);

        // Step 2: deposit USDC — wagmi waits for approval receipt automatically
        // because the wallet queues these, but we add a small delay for safety
        await new Promise((r) => setTimeout(r, 2000));

        const depositTx = await writeContractAsync({
          address: RAFFLE_ADDRESS,
          abi: RAFFLE_ABI,
          functionName: "depositUSDC",
          args: [rawAmount],
        });
        setDepositTxHash(depositTx);

        return depositTx;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "transaction failed";
        const isRejected = msg.includes("rejected") || msg.includes("denied");
        if (!isRejected) setError(msg);
        return null;
      }
    },
    [address, writeContractAsync],
  );

  // ── endRound ─────────────────────────────────────────────────────────────

  const endRound = useCallback(async (): Promise<`0x${string}` | null> => {
    setError(null);
    try {
      const tx = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "endRound",
      });
      setEndRoundTxHash(tx);
      return tx;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "endRound failed";
      setError(msg);
      return null;
    }
  }, [writeContractAsync]);

  // ── Watch WinnerSelected event ────────────────────────────────────────────

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "WinnerSelected",
    onLogs(logs) {
      const log = logs[0];
      if (!log?.args) return;

      const { roundId, winner, prizeAmount, fee } = log.args as {
        roundId: bigint;
        winner: string;
        prizeAmount: bigint;
        fee: bigint;
      };

      setLastWinner({
        roundId,
        winner,
        prizeAmount: fromUSDCUnits(prizeAmount),
        fee: fromUSDCUnits(fee),
      });

      // Refresh round data after winner is selected
      refetchRound();
    },
  });

  // ── Watch Deposited event — refetch round on new deposit ─────────────────

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "Deposited",
    onLogs() {
      refetchRound();
    },
  });

  // ── Watch RoundStarted — refetch when a new round begins ─────────────────

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "RoundStarted",
    onLogs() {
      refetchRound();
    },
  });

  return {
    // Round state
    currentRound,
    yourDeposit,
    refetchRound,

    // Actions
    depositUSDC,
    endRound,

    // TX state
    isApproving,
    isDepositing,
    isEndingRound,
    depositTxHash,
    depositSuccess,
    endRoundSuccess,

    // Events
    lastWinner,

    // Error
    error,
  };
}
