"use client";
import { useState } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { CreateRoom } from "../cards/CreateRoomCard";
import { FlipCard } from "./FlipCard";
import { FlippingScreen } from "./FlipScreen";
import { FlipResultCard } from "./FlipResult";

// ─── Types ───────────────────────────────────────────────────────────────────

type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";
type ViewState = "select" | "flipping" | "result";

const PRICE_OPTIONS = ["$1", "$2", "$3", "$5"];
const FLIP_DURATION = 2500; // ms

// ─── FlipView (parent) ───────────────────────────────────────────────────────

export const FlipView = ({ roomId }: { roomId?: string }) => {
  const [isDisclaimer, setIsDisclaimer] = useState(true);
  const [showPnl, setShowPnl] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  // Game state
  const [viewState, setViewState] = useState<ViewState>("select");
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [flipResult, setFlipResult] = useState<{
    result: FlipResult;
    landedSide: CoinSide;
    amount: string;
  } | null>(null);

  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
  } | null>(null);
  const handleFlip = (side: CoinSide, amount: string) => {
    setSelectedSide(side);
    setSelectedPrice(amount);
    setViewState("flipping");

    // Simulate flip — replace with real contract call
    setTimeout(() => {
      const landedSide: CoinSide = Math.random() > 0.5 ? "heads" : "tails";
      const result: FlipResult = landedSide === side ? "win" : "loss";
      setFlipResult({ result, landedSide, amount });
      setViewState("result");
    }, FLIP_DURATION);
  };

  const handleFlipAgain = () => {
    setViewState("select");
    setFlipResult(null);
    setSelectedSide(null);
    setSelectedPrice(null);
  };

  const handleShare = (amount: string, isWin: boolean) => {
    setViewState("select");
    setFlipResult(null);
    setPnlData({ amount, isWin }); // ✅ store result data for PnL card
    setShowPnl(true);
  };

  return (
    <div className="px-4 py-0">
      {isDisclaimer && <Disclaimer toggle={() => setIsDisclaimer(false)} />}
      {showPnl && (
        <PnL
          amount={pnlData?.amount || "$0"}
          isWin={pnlData?.isWin || false}
          handleClick={() => {
            setShowPnl(false);
            setShowCreateRoom(true);
          }}
        />
      )}
      {showCreateRoom && <CreateRoom toggle={() => setShowCreateRoom(false)} />}

      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Flip" />
      </div>

      <GameTabs />

      <div className="flex items-center justify-center w-312 ml-auto mr-auto py-12">
        {viewState === "select" && <FlipCard onFlip={handleFlip} />}
        {viewState === "flipping" && selectedSide && (
          <FlippingScreen side={selectedSide} />
        )}
        {viewState === "result" && flipResult && (
          <FlipResultCard
            result={flipResult.result}
            landedSide={flipResult.landedSide}
            amount={flipResult.amount}
            onFlipAgain={handleFlipAgain}
            onShare={handleShare}
          />
        )}
      </div>
    </div>
  );
};
