"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import SWinOrLoss from "./card/SpinWinOrLoss";
import { useGameState } from "@/hooks/useGameState";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { SpinGame } from "./SpinGame";
import { useSound } from "@/hooks/useSound";
import { GameStakeModal } from "../GameStakeModal";
import { GameLoadingOverlay } from "../GameLoadingOverlay";
import { fromOARUnits } from "@/lib/contract";
import { APP_URL } from "@/utils/utils";

const EMPTY_ID = "3455654";

type Segment = {
  label: string;
  asset: string;
  color: string;
  strokeColor: string;
};

function formatDisplayAmount(val: number | string): string {
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return Math.round(num).toLocaleString("en-US");
}

export const SpinView = ({ roomId }: { roomId?: string }) => {
  const isEmptyState = !roomId || roomId === EMPTY_ID;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();

  const effectiveRoomId = isEmptyState ? EMPTY_ID : roomId!;
  const { addEntry, loading, lastSpinResult, error } = useGameState(
    effectiveRoomId,
    "spin",
  );
  const { playSound, playMusic, stopMusic, unlockAudio } = useSound();

  // Always-fresh ref so the VRF poller reads the current value rather than a
  // stale closure capture.
  const lastSpinResultRef = useRef(lastSpinResult);
  useEffect(() => {
    lastSpinResultRef.current = lastSpinResult;
  }, [lastSpinResult]);

  // Tracks the txHash of the last result we already acted on.
  const processedTxRef = useRef<string | null>(null);

  const [showWinLoss, setShowWinLoss] = useState(false);
  const [showPnl, setShowPnl] = useState(false);
  const [landedSegment, setLandedSegment] = useState<Segment | undefined>();
  const [landedAmount, setLandedAmount] = useState("0 OAR");
  const [stakeAmount, setStakeAmount] = useState("0 OAR");
  // Numeric stake of the most recent round — powers one-tap rebet.
  const [lastStake, setLastStake] = useState(0);
  // True after the stake tx confirms, until the VRF result event arrives.
  const [isWaitingForChain, setIsWaitingForChain] = useState(false);
  // True when we polled for the VRF result and gave up without an answer.
  const [vrfTimedOut, setVrfTimedOut] = useState(false);
  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
    isBreakeven?: boolean;
  } | null>(null);
  const [externalSpinTrigger, setExternalSpinTrigger] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);

  // Shows the settled result once the wheel animation completes.
  const presentResult = useCallback(
    (segment: Segment) => {
      const result = lastSpinResultRef.current;
      if (!result) return;
      const isLoss = result.payout === 0n;
      const rawStake = fromOARUnits(result.amount);
      const rawPayout = fromOARUnits(result.payout);
      const oarStake = formatDisplayAmount(rawStake);
      const oarPayout = formatDisplayAmount(isLoss ? rawStake : rawPayout);
      const displayAmount = `${isLoss ? oarStake : oarPayout} OAR`;

      setIsWaitingForChain(false);
      setIsSpinning(false);
      setVrfTimedOut(false);
      setLandedSegment(segment);
      setLandedAmount(displayAmount);
      setShowWinLoss(true);
      setExternalSpinTrigger(false);
      stopMusic();

      const label = segment.label.toLowerCase();
      if (label.includes("won") || label.includes("win")) playSound("win");
      else if (label.includes("lose") || label.includes("loss")) playSound("loss");
    },
    [playSound, stopMusic],
  );

  // Polls for the VRF result every 500ms (max 30s). On timeout, surfaces an
  // explicit timed-out state instead of silently resetting.
  const awaitVrfResult = useCallback(
    (segment: Segment) => {
      let attempts = 0;
      const MAX_ATTEMPTS = 60; // 30s
      const poll = setInterval(() => {
        attempts++;
        if (lastSpinResultRef.current) {
          clearInterval(poll);
          presentResult(segment);
        } else if (attempts >= MAX_ATTEMPTS) {
          clearInterval(poll);
          setIsWaitingForChain(false);
          setIsSpinning(false);
          setExternalSpinTrigger(false);
          stopMusic();
          setVrfTimedOut(true);
        }
      }, 500);
    },
    [presentResult, stopMusic],
  );

  // Called by SpinWheel once the CSS animation finishes (~8s after spin starts).
  const handleSpinResult = (segment: Segment) => {
    if (!lastSpinResultRef.current) {
      // VRF hasn't arrived yet — poll until it does.
      awaitVrfResult(segment);
      return;
    }
    presentResult(segment);
  };

  const handleSpinRequest = async (amount: number) => {
    setShowStakeModal(false);
    setVrfTimedOut(false);
    const ok = await addEntry(amount);
    if (!ok) return;
    // Tx confirmed — now waiting for the VRF result event from the contract.
    setIsWaitingForChain(true);
    setLastStake(amount);
    setStakeAmount(`${formatDisplayAmount(amount)} OAR`);
  };

  // Re-enters the waiting state after a VRF timeout. When the result event
  // eventually lands, the watcher effect below kicks the wheel automatically.
  const handleVrfRetry = () => {
    setVrfTimedOut(false);
    setIsWaitingForChain(true);
  };

  const targetIndex = lastSpinResult
    ? lastSpinResult.payout === 0n
      ? 0 // loss
      : lastSpinResult.payout <= (lastSpinResult.amount * 150n) / 100n
        ? 1 // win
        : 2 // big win
    : null;

  useEffect(() => {
    if (!lastSpinResult) return;
    // Skip if we already processed this exact result (stale data on mount or re-render).
    if (processedTxRef.current === lastSpinResult.transactionHash) return;
    processedTxRef.current = lastSpinResult.transactionHash;
    // VRF result arrived — clear waiting and timeout states, kick the wheel.
    setIsWaitingForChain(false);
    setVrfTimedOut(false);
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
    setLandedAmount("0 OAR");
    setStakeAmount("0 OAR");
    setIsWaitingForChain(false);
    setIsSpinning(false);
  };

  // One-tap rebet: same stake, straight back into the spin.
  const handleRunItBack = () => {
    const stake = lastStake;
    if (stake <= 0 || loading || isSpinning || isWaitingForChain) return;
    void handleSpinRequest(stake);
  };

  const handleChangeStake = () => {
    unlockAudio();
    void playMusic("spin");
    handleWinLossClose();
    setShowStakeModal(true);
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

  const isOverlayOpen = loading || (isWaitingForChain && !isSpinning);

  return (
    <div className="px-1 py-0 relative">
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      <GameLoadingOverlay
        key={`${isOverlayOpen}-${loading ? "tx" : "vrf"}`}
        isOpen={isOverlayOpen}
        gameType="spin"
        stage={loading ? "tx" : "vrf"}
      />

      {error && (
        <div
          role="alert"
          className="mx-auto mb-4 w-full max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {showWinLoss && (
        <SWinOrLoss
          segment={landedSegment}
          amount={landedAmount}
          stakeAmount={stakeAmount}
          canRebet={lastStake > 0}
          onRebet={handleRunItBack}
          onChangeStake={handleChangeStake}
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
          shareUrl={`${APP_URL}/spin`}
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
        vrfTimedOut={vrfTimedOut}
        onVrfRetry={handleVrfRetry}
      />

      <GameStakeModal
        key={showStakeModal ? "spin-stake-open" : "spin-stake-closed"}
        open={showStakeModal}
        gameName="Spin stake"
        actionLabel="Spin now"
        description="Set your OAR stake and confirm. The wheel launches once your transaction is confirmed on-chain."
        availableTokens={["OAR"]}
        feeNotice="Spin payouts are set by the live on-chain prize tiers."
        payoutNotice="Current tiers do not include breakeven. Results are loss, 1.5x, 3x, or 10x."
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
