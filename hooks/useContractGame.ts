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
  FLIP_ADDRESS,
  SPIN_ADDRESS,
  USDC_ADDRESS,
  RAFFLE_ABI,
  FLIP_ABI,
  SPIN_ABI,
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

export interface FlipResultEvent {
  player: string;
  amount: number;
  choice: number;
  result: number;
  won: boolean;
  transactionHash: string;
}

export interface SpinResultEvent {
  player: string;
  amount: number;
  roll: bigint;
  multiplier: bigint;
  payout: number;
  transactionHash: string;
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
  const [isDepositing, setIsDepositing] = useState(false);
  const [lastWinner, setLastWinner] = useState<WinnerEvent | null>(null);
  const [lastFlipResult, setLastFlipResult] = useState<FlipResultEvent | null>(
    null,
  );
  const [lastSpinResult, setLastSpinResult] = useState<SpinResultEvent | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  // ── Read current round ────────────────────────────────────────────────────

  const { data: roundData, refetch: refetchRound } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "getCurrentRound",
  });

  const { data: minDepositRaw } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "MIN_DEPOSIT",
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

        // Check balance first
        const balance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });

        if (balance < rawAmount) {
          setError(`Insufficient USDC balance. You have ${fromUSDCUnits(balance)} but need ${dollarAmount}.`);
          return null;
        }

        // Check round status — allow if Active, regardless of timer (let contract decide)
        if (!currentRound || currentRound.status !== RoundStatus.Active) {
          setError("The raffle round is not active or is being settled.");
          return null;
        }

        // Check MIN_DEPOSIT
        if (minDepositRaw && rawAmount < minDepositRaw) {
          setError(`Amount too small. Minimum deposit is ${fromUSDCUnits(minDepositRaw)} USDC.`);
          return null;
        }

        // Step 1: Check allowance
        const allowance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, RAFFLE_ADDRESS],
        });

        if (allowance < rawAmount) {
          const approveTx = await writeContractAsync({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [RAFFLE_ADDRESS, rawAmount * 100n], // Approve more to save txs
          });
          setApproveTxHash(approveTx);
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        // Step 2: deposit
        const depositTx = await writeContractAsync({
          address: RAFFLE_ADDRESS,
          abi: RAFFLE_ABI,
          functionName: "depositUSDC",
          args: [rawAmount],
        });
        setDepositTxHash(depositTx);
        await publicClient.waitForTransactionReceipt({ hash: depositTx });

        refetchRound();
        return depositTx;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "transaction failed";
        if (!msg.toLowerCase().includes("user rejected") && !msg.toLowerCase().includes("denied")) {
          setError(msg);
        }
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [address, publicClient, writeContractAsync, refetchRound, currentRound, minDepositRaw],
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

  // ── playFlip ─────────────────────────────────────────────────────────────

  const playFlip = useCallback(
    async (choice: number, dollarAmount: number): Promise<`0x${string}` | null> => {
      if (!address || !publicClient) {
        setError("wallet not connected");
        return null;
      }

      setError(null);
      setIsDepositing(true);

      try {
        const rawAmount = toUSDCUnits(dollarAmount);

        // Check balance
        const balance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });

        if (balance < rawAmount) {
          setError(`Insufficient USDC balance. You have ${fromUSDCUnits(balance)} but need ${dollarAmount}.`);
          return null;
        }

        // Check allowance
        const allowance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, FLIP_ADDRESS],
        });

        if (allowance < rawAmount) {
          const approveTx = await writeContractAsync({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [FLIP_ADDRESS, rawAmount * 100n],
          });
          setApproveTxHash(approveTx);
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        // Step 2: flip
        const flipTx = await writeContractAsync({
          address: FLIP_ADDRESS,
          abi: FLIP_ABI,
          functionName: "flip",
          args: [choice, rawAmount],
        });
        await publicClient.waitForTransactionReceipt({ hash: flipTx });

        return flipTx;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "flip failed";
        if (!msg.toLowerCase().includes("user rejected") && !msg.toLowerCase().includes("denied")) {
          setError(msg);
        }
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [address, publicClient, writeContractAsync],
  );

  // ── playSpin ─────────────────────────────────────────────────────────────

  const playSpin = useCallback(
    async (dollarAmount: number): Promise<`0x${string}` | null> => {
      if (!address || !publicClient) {
        setError("wallet not connected");
        return null;
      }

      setError(null);
      setIsDepositing(true);

      try {
        const rawAmount = toUSDCUnits(dollarAmount);

        // Check balance
        const balance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });

        if (balance < rawAmount) {
          setError(`Insufficient USDC balance. You have ${fromUSDCUnits(balance)} but need ${dollarAmount}.`);
          return null;
        }

        // Check allowance
        const allowance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, SPIN_ADDRESS],
        });

        if (allowance < rawAmount) {
          const approveTx = await writeContractAsync({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [SPIN_ADDRESS, rawAmount * 100n],
          });
          setApproveTxHash(approveTx);
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        // Step 2: spin
        const spinTx = await writeContractAsync({
          address: SPIN_ADDRESS,
          abi: SPIN_ABI,
          functionName: "spin",
          args: [rawAmount],
        });
        await publicClient.waitForTransactionReceipt({ hash: spinTx });

        return spinTx;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "spin failed";
        if (!msg.toLowerCase().includes("user rejected") && !msg.toLowerCase().includes("denied")) {
          setError(msg);
        }
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [address, publicClient, writeContractAsync],
  );

  // ── Watch WinnerSelected ──────────────────────────────────────────────────

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "WinnerSelected",
    onLogs(logs) {
      const log = logs[0];
      if (!log?.args) return;
      const { roundId, winner, prizeAmount, fee } = log.args as any;
      setLastWinner({
        roundId,
        winner,
        prizeAmount: fromUSDCUnits(prizeAmount),
        fee: fromUSDCUnits(fee),
      });
      refetchRound();
    },
  });

  // ── Watch Flipped ─────────────────────────────────────────────────────────

  useWatchContractEvent({
    address: FLIP_ADDRESS,
    abi: FLIP_ABI,
    eventName: "Flipped",
    onLogs(logs) {
      const log = logs[0];
      if (!log?.args) return;
      const { player, amount, choice, result, won } = log.args as any;
      setLastFlipResult({
        player,
        amount: fromUSDCUnits(amount),
        choice: Number(choice),
        result: Number(result),
        won: Boolean(won),
        transactionHash: log.transactionHash,
      });
    },
  });

  // ── Watch Spun ────────────────────────────────────────────────────────────

  useWatchContractEvent({
    address: SPIN_ADDRESS,
    abi: SPIN_ABI,
    eventName: "Spun",
    onLogs(logs) {
      const log = logs[0];
      if (!log?.args) return;
      const { player, amount, roll, multiplier, payout } = log.args as any;
      setLastSpinResult({
        player,
        amount: fromUSDCUnits(amount),
        roll: BigInt(roll),
        multiplier: BigInt(multiplier),
        payout: fromUSDCUnits(payout),
        transactionHash: log.transactionHash,
      });
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
    playFlip,
    playSpin,
    endRound,
    selectWinnerManual,

    isApproving,
    isDepositing,
    isEndingRound,
    approveTxHash,
    depositTxHash,
    endRoundSuccess,

    lastWinner,
    lastFlipResult,
    lastSpinResult,
    error,
  };
}
