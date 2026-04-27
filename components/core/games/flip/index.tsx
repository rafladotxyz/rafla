"use client";

import { useState } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { EmptyStateCard } from "../cards/EmptyStateCard";
import { JoinRoomModal } from "../cards/JoinRoomModal";
import { FlipCard } from "./FlipCard";
import { FlippingScreen } from "./FlipScreen";
import { FlipResultCard } from "./FlipResult";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useContractGame, RoundStatus } from "@/hooks/useContractGame";
import { FlipGame } from "./FlipGame";

const EMPTY_ID = "3455654";
type TabType = "public" | "private";
type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";
type ViewState = "select" | "flipping" | "result";

const FLIP_DURATION = 2500;

export const FlipView = ({ roomId }: { roomId?: string }) => {
  const isEmptyState = !roomId || roomId === EMPTY_ID;
  const isPrivateRoom = !isEmptyState;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();

  const [activeTab, setActiveTab] = useState<TabType>(
    isPrivateRoom ? "private" : "public",
  );

  // Flip game state
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

  const handleTabChange = (tab: TabType) => setActiveTab(tab);

  const handleFlip = (side: CoinSide, amount: string) => {
    setSelectedSide(side);
    setViewState("flipping");
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

      {showPnl && pnlData && (
        <PnL
          amount={pnlData.amount}
          isWin={pnlData.isWin}
          handleClick={() => setShowPnl(false)}
          shareUrl={`https://rafla.xyz/flip/${isPrivateRoom ? roomId : ""}`}
        />
      )}

      <div className="w-312 h-auto ml-auto py-4 mr-auto">
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
