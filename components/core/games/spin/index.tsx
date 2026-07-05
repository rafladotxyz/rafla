"use client";

import { useState, useEffect, useRef } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import SWinOrLoss from "./card/SpinWinOrLoss";
import { useGameState } from "@/hooks/useGameState";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { SpinGame } from "./SpinGame";
import { useSound } from "@/hooks/useSound";
import { GameStakeModal } from "../GameStakeModal";
import { fromOARUnits } from "@/lib/contract";

const EMPTY_ID = "3455654";

type Segment = {
  label: string;
  asset: string;
  color: string;
  strokeColor: string;
};

export const SpinView = ({ roomId }: { roomId?: string }) => {
  const isEmptyState = !roomId || roomId === EMPTY_ID;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();

  const effectiveRoomId = isEmptyState ? EMPTY_ID : roomId!;
  const { addEntry, loading, lastSpinResult, error } = useGameState(
    effectiveRoomId,
    "spin",
  );
  const { playSound, playMusic, stopMusic, unlockAudio } = useSound();

  // Always-fresh ref so handleSpinResult (called 8 s after animation starts)
  // reads the current value rather than a stale closure capture.
  const lastSpinResultRef = useRef(lastSpinResult);
  useEffect(() => {
    lastSpinResultRef.current = lastSpinResult;
  }, [lastSpinResult]);

  // Tracks the txHash of the last result we already acted on, so we never
  // re-trigger the wheel for a stale result that was in state on mount.
  const processedTxRef = useRef<string | null>(null);

  const [showWinLoss, setShowWinLoss] = useState(false);
  const [showPnl, setShowPnl] = useState(false);
  const [landedSegment, setLandedSegment] = useState<Segment | undefined>();
  const [landedAmount, setLandedAmount] = useState("0.0000 OAR");
  const [stakeAmount, setStakeAmount] = useState("0.0000 OAR");
  // True after the stake tx confirms, until the VRF result event arrives.
  const [isWaitingForChain, setIsWaitingForChain] = useState(false);
  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
    isBreakeven?: boolean;
  } | null>(null);
  const [externalSpinTrigger, setExternalSpinTrigger] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);

  // Called by SpinWheel once the CSS animation finishes (~8 s after spin starts).
  // Uses a ref so it always sees the latest lastSpinResult, not a stale capture.
  const handleSpinResult = (segment: Segment) => {
    const result = lastSpinResultRef.current;

    if (!result) {
      // VRF hasn't arrived yet — poll every 500 ms until it does (max 30 s).
      let attempts = 0;
      const MAX_ATTEMPTS = 60; // 30 s
      const poll = setInterval(() => {
        attempts++;
        const polledResult = lastSpinResultRef.current;
        if (polledResult || attempts >= MAX_ATTEMPTS) {
          clearInterval(poll);
          const isLoss = polledResult ? polledResult.payout < polledResult.amount : true;
          const oarStake = polledResult ? fromOARUnits(polledResult.amount).toFixed(4) : "0.0000";
          const oarPayout = polledResult ? fromOARUnits(polledResult.payout).toFixed(4) : "0.0000";
          const displayAmount = isLoss ? `${oarStake} OAR` : `${oarPayout} OAR`;
          setIsWaitingForChain(false);
          setIsSpinning(false);
          setLandedSegment(segment);
          setLandedAmount(displayAmount);
          setShowWinLoss(true);
          setExternalSpinTrigger(false);
          stopMusic();
          const label = segment.label.toLowerCase();
          if (label.includes("won") || label.includes("win")) playSound("win");
          else if (label.includes("lose") || label.includes("loss")) playSound("loss");
        }
      }, 500);
      return;
    }

    const isLoss = result.payout < result.amount;
    const oarStake = fromOARUnits(result.amount).toFixed(4);
    const oarPayout = fromOARUnits(result.payout).toFixed(4);
    const displayAmount = isLoss ? `${oarStake} OAR` : `${oarPayout} OAR`;

    setIsWaitingForChain(false);
    setIsSpinning(false);
    setLandedSegment(segment);
    setLandedAmount(displayAmount);
    setShowWinLoss(true);
    setExternalSpinTrigger(false);
    stopMusic();

    const label = segment.label.toLowerCase();
    if (label.includes("won") || label.includes("win")) {
      playSound("win");
    } else if (label.includes("lose") || label.includes("loss")) {
      playSound("loss");
    }
  };

  const handleSpinRequest = async (amount: number) => {
    setShowStakeModal(false);
    const ok = await addEntry(amount);
    if (!ok) return;
    // Tx confirmed — now waiting for the VRF result event from the contract.
    setIsWaitingForChain(true);
    // Track staked amount so the result card can show "Staked: X OAR".
    setStakeAmount(`${amount.toFixed(4)} OAR`);
  };

  const targetIndex = lastSpinResult
    ? lastSpinResult.payout > lastSpinResult.amount
      ? 2 // win
      : lastSpinResult.payout === lastSpinResult.amount
        ? 1 // breakeven
        : 0 // loss
    : null;

  useEffect(() => {
    if (!lastSpinResult) return;
    // Skip if we already processed this exact result (stale data on mount or re-render).
    if (processedTxRef.current === lastSpinResult.transactionHash) return;
    processedTxRef.current = lastSpinResult.transactionHash;
    // VRF result arrived — clear waiting state, kick the wheel.
    setIsWaitingForChain(false);
    setIsSpinning(true);
    const timer = window.setTimeout(() => {
      setExternalSpinTrigger(true);
    }, 0);
    playSound("spin");
    return () => window.clearTimeout(timer);
  }, [lastSpinResult, playSound]);

  const handleWinLossClose = () => {
    stopMusic();
    setShowWinLoss(false);
    setLandedSegment(undefined);
    setLandedAmount("0.0000 OAR");
    setStakeAmount("0.0000 OAR");
    setIsWaitingForChain(false);
    setIsSpinning(false);
  };

  const handleShare = (amount: string, resultType: "win" | "loss" | "breakeven") => {
    stopMusic();
    setPnlData({
      amount,
      isWin: resultType === "win",
      isBreakeven: resultType === "breakeven",
    });
    setShowWinLoss(false);
    setShowPnl(true);
  };

  return (
    <div className="px-4 py-0">
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      {error && (
        <div className="mx-auto mb-4 w-full max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {showWinLoss && (
        <SWinOrLoss
          segment={landedSegment}
          amount={landedAmount}
          stakeAmount={stakeAmount}
          handleClick={handleWinLossClose}
          onShare={handleShare}
        />
      )}

      {showPnl && pnlData && (
        <PnL
          handleClick={() => setShowPnl(false)}
          amount={pnlData.amount}
          isWin={pnlData.isWin}
          isBreakeven={pnlData.isBreakeven}
          gameType="spin"
          shareUrl={`https://rafla.xyz/spin/${isEmptyState ? "" : roomId}`}
        />
      )}

      <div className="mx-auto w-full max-w-2xl py-4">
        <GameHeader gameName="Rafla Spin" />
      </div>

      <SpinGame
        handleSpinResult={handleSpinResult}
        externalSpinTrigger={externalSpinTrigger}
        targetIndex={targetIndex}
        onPlay={() => {
          unlockAudio();
          void playMusic("spin");
          setShowStakeModal(true);
        }}
        isLoading={loading}
        isWaitingForChain={isWaitingForChain}
        isSpinning={isSpinning}
      />

      <GameStakeModal
        key={showStakeModal ? "spin-stake-open" : "spin-stake-closed"}
        open={showStakeModal}
        gameName="Spin stake"
        actionLabel="Spin now"
        description="Set your OAR stake and confirm. The wheel launches once your transaction is confirmed on-chain."
        availableTokens={["OAR"]}
        onClose={() => setShowStakeModal(false)}
        onConfirm={(amount) => {
          playSound("click");
          void handleSpinRequest(amount);
        }}
        isSubmitting={loading}
      />
    </div>
  );
};
