"use client";

import { useState } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { EmptyStateCard } from "../cards/EmptyStateCard";
import { JoinRoomModal } from "../cards/JoinRoomModal";
import { SpinWheel } from "./SpinerCard";
import SWinOrLoss from "./card/SpinWinOrLoss";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useContractGame, RoundStatus } from "@/hooks/useContractGame";
import { SpinGame } from "./SpinGame";

const EMPTY_ID = "3455654";
type TabType = "public" | "private";

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
  const isPrivateRoom = !isEmptyState;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const { currentRound } = useContractGame();

  const [activeTab, setActiveTab] = useState<TabType>(
    isPrivateRoom ? "private" : "public",
  );
  const [hasJoined, setHasJoined] = useState(false);

  // Spin result flow
  const [showWinLoss, setShowWinLoss] = useState(false);
  const [showPnl, setShowPnl] = useState(false);
  const [landedSegment, setLandedSegment] = useState<Segment | undefined>();
  const [landedAmount, setLandedAmount] = useState("$0");
  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
  } | null>(null);

  const isPublicGameOpen =
    currentRound !== null &&
    currentRound.status === RoundStatus.Active &&
    currentRound.playerCount > 0;

  const showJoinModal = isPrivateRoom && !hasJoined;

  const handleTabChange = (tab: TabType) => setActiveTab(tab);

  const handleSpinResult = (segment: Segment) => {
    const amount = getAmountFromSegment(segment);
    setLandedSegment(segment);
    setLandedAmount(amount);
    setShowWinLoss(true);
  };

  const handleWinLossClose = () => {
    setShowWinLoss(false);
    setLandedSegment(undefined);
    setLandedAmount("$0");
  };

  const handleShare = (amount: string, isWin: boolean) => {
    setPnlData({ amount, isWin });
    setShowWinLoss(false);
    setShowPnl(true);
  };

  return (
    <div className="px-4 py-0">
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

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
          shareUrl={`https://rafla.xyz/spin/${isPrivateRoom ? roomId : ""}`}
        />
      )}

      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Spin" />
      </div>

      <SpinGame handleSpinResult={handleSpinResult} />
    </div>
  );
};
