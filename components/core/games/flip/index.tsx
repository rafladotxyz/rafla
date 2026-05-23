"use client";

import { useState, useEffect } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { FlipGame } from "./FlipGame";
import { useGameState } from "@/hooks/useGameState";
import { useSound } from "@/hooks/useSound";

const EMPTY_ID = "3455654";
type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";
type ViewState = "select" | "flipping" | "result";

export const FlipView = ({ roomId }: { roomId?: string }) => {
  const isEmptyState = !roomId || roomId === EMPTY_ID;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const effectiveRoomId = isEmptyState ? EMPTY_ID : roomId!;
  const { addEntry, lastFlipResult, error } = useGameState(
    effectiveRoomId,
    "flip",
  );
  const { playSound } = useSound();

  const [viewState, setViewState] = useState<ViewState>("select");
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [flipResult, setFlipResult] = useState<{
    result: FlipResult;
    landedSide: CoinSide;
    amount: string;
  } | null>(null);
  const [showPnl, setShowPnl] = useState(false);
  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
  } | null>(null);

  const handleFlip = async (side: CoinSide, amount: string) => {
    setSelectedSide(side);
    const numAmount = Number(amount.replace("$", ""));
    const ok = await addEntry(numAmount, { choice: side });
    if (!ok) return;
    setViewState("flipping");
    playSound("flip");
  };

  useEffect(() => {
    if (lastFlipResult && viewState === "flipping") {
      const timer = setTimeout(() => {
        const landedSide: CoinSide = lastFlipResult.result === 0 ? "heads" : "tails";
        const result: FlipResult = lastFlipResult.won ? "win" : "loss";
        setFlipResult({
          result,
          landedSide,
          amount: `$${lastFlipResult.amount}`,
        });
        setViewState("result");
        playSound(lastFlipResult.won ? "win" : "loss");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lastFlipResult, viewState, playSound]);

  const handleFlipAgain = () => {
    setViewState("select");
    setFlipResult(null);
    setSelectedSide(null);
  };

  const handleShare = (amount: string, isWin: boolean) => {
    setViewState("select");
    setFlipResult(null);
    setPnlData({ amount, isWin });
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
          handleClick={() => setShowPnl(false)}
          shareUrl={`https://rafla.xyz/flip/${isEmptyState ? "" : roomId}`}
        />
      )}

      <div className="w-full max-w-2xl mx-auto py-4">
        <GameHeader gameName="Rafla Flip" />
      </div>

      <FlipGame
        viewState={viewState}
        selectedSide={selectedSide}
        handleFlip={handleFlip}
        handleFlipAgain={handleFlipAgain}
        handleShare={handleShare}
        flipResult={flipResult}
      />
    </div>
  );
};
