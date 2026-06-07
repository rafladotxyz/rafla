"use client";

import { useState, useCallback } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useReadContract,
  useAccount,
  useChainId,
  usePublicClient,
} from "wagmi";
import {
  RAFFLE_ADDRESS,
  FLIP_ADDRESS,
  SPIN_ADDRESS,
  USDC_ADDRESS,
  OAR_COIN_ADDRESS,
  RAFFLE_ABI,
  FLIP_ABI,
  SPIN_ABI,
  ERC20_ABI,
  toUSDCUnits,
  fromUSDCUnits,
  toOARUnits,
  fromOARUnits,
  RoundStatus,
} from "@/lib/contract";
import { normalizeContractError } from "@/lib/contract-errors";

// Re-export so views only need one import
export { RoundStatus };

// ─── Base Sepolia gas cap ─────────────────────────────────────────────────────
// Base Sepolia enforces a per-tx gas ceiling of ~15 000 000 at the RPC level.
// We cap every write at a safe budget that covers all contract paths while
// staying well under that ceiling.
const BASE_SEPOLIA_GAS_LIMIT = 500_000n;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Render a raw OAR bigint as a readable string (18 dec) */
function fmtOAR(raw: bigint): string {
  return fromOARUnits(raw).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

/** Render a raw USDC bigint as a readable string (6 dec) */
function fmtUSDC(raw: bigint): string {
  return fromUSDCUnits(raw).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CurrentRound {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  /** Raw weighted prizePool as returned by the contract (mixed units — display only) */
  prizePoolRaw: bigint;
  playerCount: number;
  winner: string;
  status: RoundStatus;
  timeRemaining: number; // seconds
}

/**
 * WinnerSelected now carries three separate prize buckets (ETH / USDC / OAR).
 * All values are stored as raw bigints; convert for display.
 */
export interface WinnerEvent {
  roundId: bigint;
  winner: string;
  ethPrize: bigint;
  usdcPrize: bigint;
  oarPrize: bigint;
}

export interface FlipResultEvent {
  player: string;
  amount: bigint;  // raw OAR (18 dec)
  choice: number;  // 0 = Heads, 1 = Tails
  result: number;
  won: boolean;
  transactionHash: string;
}

export interface SpinResultEvent {
  player: string;
  amount: bigint;      // raw OAR (18 dec)
  roll: bigint;        // 0-99
  multiplier: bigint;  // percentage points (e.g. 150 = 1.5×)
  payout: bigint;      // raw OAR (18 dec)
  transactionHash: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useContractGame() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const isSupportedChain = chainId === 84532; // Base Sepolia
  const unsupportedChainMessage =
    "Please switch to Base Sepolia before joining or paying.";

  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [depositTxHash, setDepositTxHash] = useState<`0x${string}` | undefined>();
  const [endRoundTxHash, setEndRoundTxHash] = useState<`0x${string}` | undefined>();
  const [isDepositing, setIsDepositing] = useState(false);
  const [lastWinner, setLastWinner] = useState<WinnerEvent | null>(null);
  const [lastFlipResult, setLastFlipResult] = useState<FlipResultEvent | null>(null);
  const [lastSpinResult, setLastSpinResult] = useState<SpinResultEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  // ── Read current round ──────────────────────────────────────────────────────

  const { data: roundData, refetch: refetchRound } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "getCurrentRound",
    query: { enabled: isSupportedChain },
  });

  // ── Read min deposits (Raffle) ──────────────────────────────────────────────

  const { data: minUsdcDepositRaw } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "MIN_USDC_DEPOSIT",
    query: { enabled: isSupportedChain },
  });

  const { data: minEthDepositRaw } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "MIN_ETH_DEPOSIT",
    query: { enabled: isSupportedChain },
  });

  const { data: minOarDepositRaw } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "MIN_OAR_DEPOSIT",
    query: { enabled: isSupportedChain },
  });

  // ── Read min bets (Flip / Spin — OAR, 18 dec) ──────────────────────────────

  const { data: minBetFlipRaw } = useReadContract({
    address: FLIP_ADDRESS,
    abi: FLIP_ABI,
    functionName: "minBet",
    query: { enabled: isSupportedChain },
  });

  const { data: minBetSpinRaw } = useReadContract({
    address: SPIN_ADDRESS,
    abi: SPIN_ABI,
    functionName: "minBet",
    query: { enabled: isSupportedChain },
  });

  // ── Derive round shape ──────────────────────────────────────────────────────

  const currentRound: CurrentRound | null = roundData
    ? {
        id: roundData[0],
        startTime: roundData[1],
        endTime: roundData[2],
        prizePoolRaw: roundData[3],
        playerCount: Number(roundData[4]),
        winner: roundData[5],
        status: roundData[6] as RoundStatus,
        timeRemaining: Number(roundData[7]),
      }
    : null;

  const currentRoundId = currentRound?.id;
  const currentRoundStatus = currentRound?.status;

  // ── Read per-player per-token deposits ─────────────────────────────────────

  const { data: playerDepositRaw } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: "getPlayerDeposit",
    args:
      currentRound?.id !== undefined && address
        ? [currentRound.id, address]
        : undefined,
    query: { enabled: isSupportedChain && !!currentRound?.id && !!address },
  });

  /** Raw weighted deposit (mixed units — for win-chance display only) */
  const yourDepositRaw: bigint = playerDepositRaw ?? 0n;

  // ── Wait for approve tx ─────────────────────────────────────────────────────

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { isLoading: isEndingRound, isSuccess: endRoundSuccess } =
    useWaitForTransactionReceipt({ hash: endRoundTxHash });

  // ── Internal: ERC-20 approve helper ────────────────────────────────────────

  /**
   * Checks current allowance and submits an approve tx only if needed.
   * Waits for on-chain confirmation before returning.
   */
  async function ensureAllowance(
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    rawAmount: bigint,
  ): Promise<void> {
    if (!address || !publicClient) throw new Error("Wallet not connected");

    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [address, spender],
    });

    if (allowance < rawAmount) {
      const approveTx = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        // Approve 100× the amount to batch future txs and avoid re-approvals
        args: [spender, rawAmount * 100n],
        gas: BASE_SEPOLIA_GAS_LIMIT,
      });
      setApproveTxHash(approveTx);
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
    }
  }

  // ── depositUSDC ─────────────────────────────────────────────────────────────

  const depositUSDC = useCallback(
    async (dollarAmount: number): Promise<`0x${string}` | null> => {
      if (!address || !publicClient) { setError("Wallet not connected"); return null; }
      if (!isSupportedChain) { setError(unsupportedChainMessage); return null; }
      if (!currentRoundId || currentRoundStatus !== RoundStatus.Active) {
        setError("The raffle round is not active or is being settled.");
        return null;
      }

      if (currentRound && Date.now() >= Number(currentRound.endTime) * 1000) {
        setError("Previous round ended — settling it now, please hold on...");
        setIsDepositing(true);
        try {
          const endTx = await writeContractAsync({
            address: RAFFLE_ADDRESS,
            abi: RAFFLE_ABI,
            functionName: "endRound",
            gas: BASE_SEPOLIA_GAS_LIMIT,
          });
          await publicClient.waitForTransactionReceipt({ hash: endTx });
          await refetchRound();
          // Small delay so the contract state settles
          await new Promise((r) => setTimeout(r, 1500));
        } catch (e) {
          console.error("Auto endRound failed", e);
          setError("Could not settle the previous round. Please try again.");
          setIsDepositing(false);
          return null;
        }
        // Clear the settling message and proceed with deposit below
        setError(null);
      } else {
        setError(null);
      }

      setIsDepositing(true);

      try {
        const rawAmount = toUSDCUnits(dollarAmount);

        // Gate: minimum deposit check
        if (minUsdcDepositRaw && (minUsdcDepositRaw as bigint) > 0n) {
          if (rawAmount < (minUsdcDepositRaw as bigint)) {
            setError(`Minimum USDC deposit is ${fmtUSDC(minUsdcDepositRaw as bigint)} USDC.`);
            return null;
          }
        }

        // Gate: balance check
        const balance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        if (balance < rawAmount) {
          setError(
            `Insufficient USDC balance. You have ${fmtUSDC(balance)} but need ${dollarAmount}.`,
          );
          return null;
        }

        // Step 1: ensure approval
        await ensureAllowance(USDC_ADDRESS, RAFFLE_ADDRESS, rawAmount);

        // Step 2: deposit
        const depositTx = await writeContractAsync({
          address: RAFFLE_ADDRESS,
          abi: RAFFLE_ABI,
          functionName: "depositUSDC",
          args: [rawAmount],
          gas: BASE_SEPOLIA_GAS_LIMIT,
        });
        setDepositTxHash(depositTx);
        await publicClient.waitForTransactionReceipt({ hash: depositTx });

        refetchRound();
        return depositTx;
      } catch (err: unknown) {
        const normalized = normalizeContractError(err);
        if (!normalized.isUserRejected) setError(normalized.message);
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [
      address, publicClient, writeContractAsync, refetchRound,
      currentRound, currentRoundId, currentRoundStatus, minUsdcDepositRaw, isSupportedChain,
    ],
  );

  // ── depositOARCOIN ──────────────────────────────────────────────────────────

  const depositOARCOIN = useCallback(
    async (oarAmount: number): Promise<`0x${string}` | null> => {
      if (!address || !publicClient) { setError("Wallet not connected"); return null; }
      if (!isSupportedChain) { setError(unsupportedChainMessage); return null; }
      if (!currentRoundId || currentRoundStatus !== RoundStatus.Active) {
        setError("The raffle round is not active or is being settled.");
        return null;
      }

      if (currentRound && Date.now() >= Number(currentRound.endTime) * 1000) {
        setError("Previous round ended — settling it now, please hold on...");
        setIsDepositing(true);
        try {
          const endTx = await writeContractAsync({
            address: RAFFLE_ADDRESS,
            abi: RAFFLE_ABI,
            functionName: "endRound",
            gas: BASE_SEPOLIA_GAS_LIMIT,
          });
          await publicClient.waitForTransactionReceipt({ hash: endTx });
          await refetchRound();
          await new Promise((r) => setTimeout(r, 1500));
        } catch (e) {
          console.error("Auto endRound failed", e);
          setError("Could not settle the previous round. Please try again.");
          setIsDepositing(false);
          return null;
        }
        setError(null);
      } else {
        setError(null);
      }

      setIsDepositing(true);

      try {
        const rawAmount = toOARUnits(oarAmount);

        if (minOarDepositRaw && (minOarDepositRaw as bigint) > 0n) {
          if (rawAmount < (minOarDepositRaw as bigint)) {
            setError(`Minimum OAR deposit is ${fmtOAR(minOarDepositRaw as bigint)} OAR.`);
            return null;
          }
        }

        const balance = await publicClient.readContract({
          address: OAR_COIN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        if (balance < rawAmount) {
          setError(`Insufficient OAR balance. You have ${fmtOAR(balance)} but need ${oarAmount}.`);
          return null;
        }

        await ensureAllowance(OAR_COIN_ADDRESS, RAFFLE_ADDRESS, rawAmount);

        const depositTx = await writeContractAsync({
          address: RAFFLE_ADDRESS,
          abi: RAFFLE_ABI,
          functionName: "depositOARCOIN",
          args: [rawAmount],
          gas: BASE_SEPOLIA_GAS_LIMIT,
        });
        setDepositTxHash(depositTx);
        await publicClient.waitForTransactionReceipt({ hash: depositTx });

        refetchRound();
        return depositTx;
      } catch (err: unknown) {
        const normalized = normalizeContractError(err);
        if (!normalized.isUserRejected) setError(normalized.message);
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [
      address, publicClient, writeContractAsync, refetchRound,
      currentRound, currentRoundId, currentRoundStatus, minOarDepositRaw, isSupportedChain,
    ],
  );

  // ── depositETH ──────────────────────────────────────────────────────────────

  const depositETH = useCallback(
    async (ethAmount: number): Promise<`0x${string}` | null> => {
      if (!address || !publicClient) { setError("Wallet not connected"); return null; }
      if (!isSupportedChain) { setError(unsupportedChainMessage); return null; }
      if (!currentRoundId || currentRoundStatus !== RoundStatus.Active) {
        setError("The raffle round is not active or is being settled.");
        return null;
      }

      if (currentRound && Date.now() >= Number(currentRound.endTime) * 1000) {
        setError("Previous round ended — settling it now, please hold on...");
        setIsDepositing(true);
        try {
          const endTx = await writeContractAsync({
            address: RAFFLE_ADDRESS,
            abi: RAFFLE_ABI,
            functionName: "endRound",
            gas: BASE_SEPOLIA_GAS_LIMIT,
          });
          await publicClient.waitForTransactionReceipt({ hash: endTx });
          await refetchRound();
          await new Promise((r) => setTimeout(r, 1500));
        } catch (e) {
          console.error("Auto endRound failed", e);
          setError("Could not settle the previous round. Please try again.");
          setIsDepositing(false);
          return null;
        }
        setError(null);
      } else {
        setError(null);
      }

      setIsDepositing(true);

      try {
        // Convert ETH to wei
        const rawWei = BigInt(Math.round(ethAmount * 1e18));

        if (minEthDepositRaw && (minEthDepositRaw as bigint) > 0n) {
          if (rawWei < (minEthDepositRaw as bigint)) {
            const minEth = Number(minEthDepositRaw as bigint) / 1e18;
            setError(`Minimum ETH deposit is ${minEth} ETH.`);
            return null;
          }
        }

        const depositTx = await writeContractAsync({
          address: RAFFLE_ADDRESS,
          abi: RAFFLE_ABI,
          functionName: "depositETH",
          value: rawWei,
          gas: BASE_SEPOLIA_GAS_LIMIT,
        });
        setDepositTxHash(depositTx);
        await publicClient.waitForTransactionReceipt({ hash: depositTx });

        refetchRound();
        return depositTx;
      } catch (err: unknown) {
        const normalized = normalizeContractError(err);
        if (!normalized.isUserRejected) setError(normalized.message);
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [
      address, publicClient, writeContractAsync, refetchRound,
      currentRound, currentRoundId, currentRoundStatus, minEthDepositRaw, isSupportedChain,
    ],
  );

  // ── endRound ────────────────────────────────────────────────────────────────

  const endRound = useCallback(async (): Promise<`0x${string}` | null> => {
    setError(null);
    try {
      const tx = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "endRound",
        gas: BASE_SEPOLIA_GAS_LIMIT,
      });
      setEndRoundTxHash(tx);
      return tx;
    } catch (err: unknown) {
      const normalized = normalizeContractError(err, "Could not end round.");
      if (!normalized.isUserRejected) setError(normalized.message);
      return null;
    }
  }, [writeContractAsync]);

  // ── playFlip — OAR (18 dec) ─────────────────────────────────────────────────

  const playFlip = useCallback(
    async (
      choice: 0 | 1, // 0 = Heads, 1 = Tails  (matches Flip.Side enum)
      oarAmount: number,
    ): Promise<`0x${string}` | null> => {
      if (!address || !publicClient) { setError("Wallet not connected"); return null; }
      if (!isSupportedChain) { setError(unsupportedChainMessage); return null; }

      setError(null);
      setIsDepositing(true);

      try {
        const rawAmount = toOARUnits(oarAmount);

        // Min-bet guard
        if (minBetFlipRaw && rawAmount < (minBetFlipRaw as bigint)) {
          setError(`Bet too small. Minimum is ${fmtOAR(minBetFlipRaw as bigint)} OAR.`);
          return null;
        }

        // Balance guard
        const balance = await publicClient.readContract({
          address: OAR_COIN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        if (balance < rawAmount) {
          setError(`Insufficient OAR balance. You have ${fmtOAR(balance)} but need ${oarAmount}.`);
          return null;
        }

        // Approve if needed
        await ensureAllowance(OAR_COIN_ADDRESS, FLIP_ADDRESS, rawAmount);

        // Flip — Flip.Side is a uint8 enum (0 | 1)
        const flipTx = await writeContractAsync({
          address: FLIP_ADDRESS,
          abi: FLIP_ABI,
          functionName: "flip",
          args: [choice, rawAmount],
          gas: BASE_SEPOLIA_GAS_LIMIT,
        });
        await publicClient.waitForTransactionReceipt({ hash: flipTx });

        return flipTx;
      } catch (err: unknown) {
        const normalized = normalizeContractError(err, "Flip transaction failed.");
        if (!normalized.isUserRejected) setError(normalized.message);
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [address, publicClient, writeContractAsync, minBetFlipRaw, isSupportedChain],
  );

  // ── playSpin — OAR (18 dec) ─────────────────────────────────────────────────

  const playSpin = useCallback(
    async (oarAmount: number): Promise<`0x${string}` | null> => {
      if (!address || !publicClient) { setError("Wallet not connected"); return null; }
      if (!isSupportedChain) { setError(unsupportedChainMessage); return null; }

      setError(null);
      setIsDepositing(true);

      try {
        const rawAmount = toOARUnits(oarAmount);

        if (minBetSpinRaw && rawAmount < (minBetSpinRaw as bigint)) {
          setError(`Bet too small. Minimum is ${fmtOAR(minBetSpinRaw as bigint)} OAR.`);
          return null;
        }

        const balance = await publicClient.readContract({
          address: OAR_COIN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        if (balance < rawAmount) {
          setError(`Insufficient OAR balance. You have ${fmtOAR(balance)} but need ${oarAmount}.`);
          return null;
        }

        await ensureAllowance(OAR_COIN_ADDRESS, SPIN_ADDRESS, rawAmount);

        const spinTx = await writeContractAsync({
          address: SPIN_ADDRESS,
          abi: SPIN_ABI,
          functionName: "spin",
          args: [rawAmount],
          gas: BASE_SEPOLIA_GAS_LIMIT,
        });
        await publicClient.waitForTransactionReceipt({ hash: spinTx });

        return spinTx;
      } catch (err: unknown) {
        const normalized = normalizeContractError(err, "Spin transaction failed.");
        if (!normalized.isUserRejected) setError(normalized.message);
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [address, publicClient, writeContractAsync, minBetSpinRaw, isSupportedChain],
  );

  // ── Watch WinnerSelected ────────────────────────────────────────────────────
  // New event shape: WinnerSelected(roundId, winner, ethPrize, usdcPrize, oarPrize)

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "WinnerSelected",
    onLogs(logs: Array<{ args?: unknown; transactionHash: `0x${string}` }>) {
      const log = logs[0];
      if (!log?.args) return;
      const { roundId, winner, ethPrize, usdcPrize, oarPrize } = log.args as {
        roundId: bigint;
        winner: `0x${string}`;
        ethPrize: bigint;
        usdcPrize: bigint;
        oarPrize: bigint;
      };
      setLastWinner({ roundId, winner, ethPrize, usdcPrize, oarPrize });
      refetchRound();
    },
  });

  // ── Watch Flipped ───────────────────────────────────────────────────────────

  useWatchContractEvent({
    address: FLIP_ADDRESS,
    abi: FLIP_ABI,
    eventName: "Flipped",
    onLogs(logs: Array<{ args?: unknown; transactionHash: `0x${string}` }>) {
      const log = logs[0];
      if (!log?.args) return;
      const { player, amount, choice, result, won } = log.args as {
        player: `0x${string}`;
        amount: bigint;   // raw OAR
        choice: bigint;   // enum uint8
        result: bigint;
        won: boolean;
      };
      setLastFlipResult({
        player,
        amount,
        choice: Number(choice),
        result: Number(result),
        won: Boolean(won),
        transactionHash: log.transactionHash,
      });
    },
  });

  // ── Watch Spun ──────────────────────────────────────────────────────────────

  useWatchContractEvent({
    address: SPIN_ADDRESS,
    abi: SPIN_ABI,
    eventName: "Spun",
    onLogs(logs: Array<{ args?: unknown; transactionHash: `0x${string}` }>) {
      const log = logs[0];
      if (!log?.args) return;
      const { player, amount, roll, multiplier, payout } = log.args as {
        player: `0x${string}`;
        amount: bigint;
        roll: bigint;
        multiplier: bigint;
        payout: bigint;
      };
      setLastSpinResult({
        player,
        amount,
        roll,
        multiplier,
        payout,
        transactionHash: log.transactionHash,
      });
    },
  });

  // ── Watch Deposited / RoundStarted / RoundCancelled ────────────────────────

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "Deposited",
    onLogs() { refetchRound(); },
  });

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "RoundStarted",
    onLogs() { refetchRound(); },
  });

  useWatchContractEvent({
    address: RAFFLE_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: "RoundCancelled",
    onLogs() { refetchRound(); },
  });

  // ── Public surface ──────────────────────────────────────────────────────────

  return {
    // Round state
    currentRound,
    yourDepositRaw,
    refetchRound,

    // Raffle actions
    depositUSDC,
    depositOARCOIN,
    depositETH,
    endRound,

    // Game actions
    playFlip,
    playSpin,

    // Tx state
    isApproving,
    isDepositing,
    isEndingRound,
    approveTxHash,
    depositTxHash,
    endRoundSuccess,

    // Events
    lastWinner,
    lastFlipResult,
    lastSpinResult,

    // Error
    error,
  };
}
