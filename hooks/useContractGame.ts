"use client";

import { useState, useCallback, useRef } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useReadContract,
  useAccount,
  usePublicClient,
} from "wagmi";
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
  prizePool: number; // dollars
  playerCount: number;
  winner: string;
  status: RoundStatus;
  timeRemaining: number; // seconds
}

export interface WinnerEvent {
  roundId: bigint;
  winner: string;
  prizeAmount: number;
  fee: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useContractGame() {
  const { address } = useAccount();
  const publicClient = usePublicClient();

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
  const [isDepositing, setIsDepositing] = useState(false);

  const { writeContractAsync } = useWriteContract();

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
    // Only run when both values are defined to avoid type errors
    args:
      currentRound?.id !== undefined && address
        ? [currentRound.id, address]
        : undefined,
    query: { enabled: !!currentRound?.id && !!address },
  });

  const yourDeposit = playerDepositRaw ? fromUSDCUnits(playerDepositRaw) : 0;

  // ── Wait for approve tx (used to gate deposit) ────────────────────────────

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { isLoading: isEndingRound, isSuccess: endRoundSuccess } =
    useWaitForTransactionReceipt({ hash: endRoundTxHash });

  // ── depositUSDC — approve then wait for receipt, then deposit ─────────────
  // Fixes the flaky 2s setTimeout approach by using publicClient.waitForTransactionReceipt

  const depositUSDC = useCallback(
    async (dollarAmount: number): Promise<`0x${string}` | null> => {
      if (!address || !publicClient) {
        setError("wallet not connected");
        return null;
      }

      setError(null);
      setIsDepositing(true);

      try {
        const rawAmount = toUSDCUnits(dollarAmount);

        // Step 1: approve
        const approveTx = await writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [RAFFLE_ADDRESS, rawAmount],
        });
        setApproveTxHash(approveTx);

        // Step 2: wait for approval to be mined on-chain before depositing
        await publicClient.waitForTransactionReceipt({ hash: approveTx });

        // Step 3: deposit
        const depositTx = await writeContractAsync({
          address: RAFFLE_ADDRESS,
          abi: RAFFLE_ABI,
          functionName: "depositUSDC",
          args: [rawAmount],
        });
        setDepositTxHash(depositTx);

        // Step 4: wait for deposit confirmation
        await publicClient.waitForTransactionReceipt({ hash: depositTx });

        refetchRound();
        return depositTx;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "transaction failed";
        const isRejected = msg.includes("rejected") || msg.includes("denied");
        if (!isRejected) setError(msg);
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [address, publicClient, writeContractAsync, refetchRound],
  );

  // ── endRound ──────────────────────────────────────────────────────────────

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

  // ── selectWinnerManual (dev/testing only) ─────────────────────────────────

  const selectWinnerManual = useCallback(
    async (roundId: bigint): Promise<`0x${string}` | null> => {
      setError(null);
      try {
        const tx = await writeContractAsync({
          address: RAFFLE_ADDRESS,
          abi: RAFFLE_ABI,
          functionName: "selectWinnerManual",
          args: [roundId],
        });
        return tx;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "selectWinnerManual failed";
        setError(msg);
        return null;
      }
    },
    [writeContractAsync],
  );

  // ── Watch WinnerSelected ──────────────────────────────────────────────────

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
      refetchRound();
    },
  });

  // ── Watch Deposited ───────────────────────────────────────────────────────

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "Deposited",
    onLogs() {
      refetchRound();
    },
  });

  // ── Watch RoundStarted ────────────────────────────────────────────────────

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "RoundStarted",
    onLogs() {
      refetchRound();
    },
  });

  // ── Watch RoundCancelled ──────────────────────────────────────────────────

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "RoundCancelled",
    onLogs() {
      refetchRound();
    },
  });

  return {
    currentRound,
    yourDeposit,
    refetchRound,

    depositUSDC,
    endRound,
    selectWinnerManual,

    isApproving,
    isDepositing,
    isEndingRound,
    approveTxHash,
    depositTxHash,
    endRoundSuccess,

    lastWinner,
    error,
  };
}
