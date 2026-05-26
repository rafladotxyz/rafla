"use client";

import { useState, useEffect } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import SWinOrLoss from "./card/SpinWinOrLoss";
import { useGameState } from "@/hooks/useGameState";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { SpinGame } from "./SpinGame";
import { useSound } from "@/hooks/useSound";
import { GameStakeModal } from "../GameStakeModal";

const EMPTY_ID = "3455654";

type Segment = {
  label: string;
  asset: string;
  color: string;
  strokeColor: string;
};

const getAmountFromSegment = (segment: Segment): string => {
  if (segment.label === "Yaay $2 won!") return "$2.00";
  if (segment.label === "Breakeven!") return "$1.00";
  return "$1.00";
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

  const [showWinLoss, setShowWinLoss] = useState(false);
  const [showPnl, setShowPnl] = useState(false);
  const [landedSegment, setLandedSegment] = useState<Segment | undefined>();
  const [landedAmount, setLandedAmount] = useState("$0");
  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
  } | null>(null);
  const [externalSpinTrigger, setExternalSpinTrigger] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);

  const handleSpinResult = (segment: Segment) => {
    const amount = getAmountFromSegment(segment);
    setLandedSegment(segment);
    setLandedAmount(amount);
    setShowWinLoss(true);
    setExternalSpinTrigger(false);
    stopMusic();

    if (segment.label.toLowerCase().includes("win")) {
      playSound("win");
    } else if (segment.label.toLowerCase().includes("lose")) {
      playSound("loss");
    }
  };

  const handleSpinRequest = async (amount: number) => {
    setShowStakeModal(false);
    const ok = await addEntry(amount);
    if (!ok) return;
  };

  const targetIndex = lastSpinResult
    ? lastSpinResult.payout > lastSpinResult.amount
      ? 2
      : lastSpinResult.payout === lastSpinResult.amount
        ? 1
        : 0
    : null;

  useEffect(() => {
    if (!lastSpinResult) return;

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
    setLandedAmount("$0");
  };

  const handleShare = (amount: string, isWin: boolean) => {
    stopMusic();
    setPnlData({ amount, isWin });
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
          handleClick={handleWinLossClose}
          onShare={handleShare}
        />
      )}

      {showPnl && pnlData && (
        <PnL
          handleClick={() => setShowPnl(false)}
          amount={pnlData.amount}
          isWin={pnlData.isWin}
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
      />

      <GameStakeModal key={showStakeModal ? "spin-stake-open" : "spin-stake-closed"}
        open={showStakeModal}
        gameName="Spin stake"
        actionLabel="Spin now"
        description="Choose your stake, confirm the amount, and the wheel will launch once your transaction is ready."
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
