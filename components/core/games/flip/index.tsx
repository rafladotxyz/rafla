"use client";

import { useEffect, useState, useRef } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { FlipGame } from "./FlipGame";
import { useGameState } from "@/hooks/useGameState";
import { useSound } from "@/hooks/useSound";
import { GameStakeModal } from "../GameStakeModal";
import { fromOARUnits } from "@/lib/contract";

const EMPTY_ID = "3455654";
type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";
type ViewState = "select" | "flipping" | "result";

export const FlipView = ({ roomId }: { roomId?: string }) => {
  const isEmptyState = !roomId || roomId === EMPTY_ID;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const effectiveRoomId = isEmptyState ? EMPTY_ID : roomId!;
  const { addEntry, loading, lastFlipResult, error } = useGameState(
    effectiveRoomId,
    "flip",
  );
  const { playSound, playMusic, stopMusic, unlockAudio } = useSound();

  const [viewState, setViewState] = useState<ViewState>("select");
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [flipResult, setFlipResult] = useState<{
    result: FlipResult;
    landedSide: CoinSide;
    amount: string;
    stakeAmount: string;
  } | null>(null);
  const [showPnl, setShowPnl] = useState(false);
  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
  } | null>(null);
  const [showStakeModal, setShowStakeModal] = useState(false);
  // Tracks what the user staked so the result card can show it.
  const stakedAmountRef = useRef<number>(0);
  // True while tx is confirmed on-chain but the contract event hasn't arrived yet.
  const [isWaitingForChain, setIsWaitingForChain] = useState(false);
  // Prevents re-firing the result flow for a stale lastFlipResult already in state on mount.
  const processedTxRef = useRef<string | null>(null);

  const handleFlip = async (side: CoinSide, amount: number) => {
    setSelectedSide(side);
    setShowStakeModal(false);
    stakedAmountRef.current = amount;
    const ok = await addEntry(amount, { choice: side });
    if (!ok) {
      setSelectedSide(null);
      stopMusic();
      return;
    }
    // Tx confirmed — show the flipping animation and wait for the contract event.
    setViewState("flipping");
    setIsWaitingForChain(true);
    playSound("flip");
  };

  useEffect(() => {
    if (!lastFlipResult) return;
    // Skip if we already processed this exact result (stale data on mount).
    if (processedTxRef.current === lastFlipResult.transactionHash) return;
    processedTxRef.current = lastFlipResult.transactionHash;
    if (viewState !== "flipping") return;
    setIsWaitingForChain(false);
    const timer = window.setTimeout(() => {
      const landedSide: CoinSide = lastFlipResult.result === 0 ? "heads" : "tails";
      const result: FlipResult = lastFlipResult.won ? "win" : "loss";
      const oarStake = fromOARUnits(lastFlipResult.amount).toFixed(4);
      const oarPayout = lastFlipResult.won
        ? (fromOARUnits(lastFlipResult.amount) * 2 * 0.97).toFixed(4)
        : oarStake;
      setFlipResult({
        result,
        landedSide,
        amount: result === "win" ? `${oarPayout} OAR` : `${oarStake} OAR`,
        stakeAmount: `${oarStake} OAR`,
      });
      setViewState("result");
      stopMusic();
      playSound(lastFlipResult.won ? "win" : "loss");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [lastFlipResult, viewState, playSound, stopMusic]);

  const handleFlipAgain = () => {
    stopMusic();
    setViewState("select");
    setFlipResult(null);
    setSelectedSide(null);
    stakedAmountRef.current = 0;
  };

  const handleShare = (amount: string, resultType: FlipResult) => {
    stopMusic();
    setViewState("select");
    setFlipResult(null);
    setPnlData({ amount, isWin: resultType === "win" });
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

      {showPnl && pnlData && (
        <PnL
          amount={pnlData.amount}
          isWin={pnlData.isWin}
          gameType="flip"
          handleClick={() => setShowPnl(false)}
          shareUrl={`https://rafla.xyz/flip/${isEmptyState ? "" : roomId}`}
        />
      )}

      <div className="mx-auto w-full max-w-2xl py-4">
        <GameHeader gameName="Rafla Flip" />
      </div>

      <FlipGame
        viewState={viewState}
        selectedSide={selectedSide}
        onSelectSide={setSelectedSide}
        handleShare={handleShare}
        flipResult={flipResult}
        handleFlipAgain={handleFlipAgain}
        isLoading={loading}
        isWaitingForChain={isWaitingForChain}
        onPlay={() => {
          unlockAudio();
          void playMusic("flip");
          setShowStakeModal(true);
        }}
      />

      <GameStakeModal
        key={showStakeModal ? "flip-stake-open" : "flip-stake-closed"}
        open={showStakeModal}
        gameName="Flip stake"
        actionLabel="Flip now"
        description="Pick a side, set your OAR stake, and confirm to launch the flip. The result is settled on-chain instantly."
        showSideSelector
        availableTokens={["OAR"]}
        defaultSide={selectedSide ?? undefined}
        onClose={() => setShowStakeModal(false)}
        onConfirm={(amount, side) => {
          if (!side) return;
          playSound("click");
          void handleFlip(side, amount);
        }}
        isSubmitting={loading || viewState === "flipping"}
      />
    </div>
  );
};
