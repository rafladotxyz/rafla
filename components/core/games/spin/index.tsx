"use client";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { useState } from "react";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { CreateRoom } from "../cards/CreateRoomCard";
import { SpinWheel } from "./SpinerCard";
import SWinOrLoss from "./card/SpinWinOrLoss";

type Segment = {
  label: string;
  asset: string;
  color: string;
  strokeColor: string;
};

// ✅ Extract the money amount from each segment label
const getAmountFromSegment = (segment: Segment): string => {
  if (segment.label === "Yaay $2 won!") return "$2.00";
  if (segment.label === "Breakeven!") return "$1.00";
  return "$1.00";
};

export const SpinView = ({ roomId }: { roomId?: string }) => {
  const [isDisclaimer, setIsDisclaimer] = useState<boolean>(true);
  const [showWinLoss, setShowWinLoss] = useState<boolean>(false);
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);
  const [showPnl, setShowPnl] = useState<boolean>(false);

  const [landedSegment, setLandedSegment] = useState<Segment | undefined>(
    undefined,
  );
  const [landedAmount, setLandedAmount] = useState<string>("$0"); // ✅ track amount separately

  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
  } | null>(null);

  const toggleDisclaimer = () => setIsDisclaimer(false);

  const handleSpinResult = (segment: Segment) => {
    const amount = getAmountFromSegment(segment); // ✅ derive amount from segment
    setLandedSegment(segment);
    setLandedAmount(amount); // ✅ store so SWinOrLoss can receive it
    setShowWinLoss(true);
  };

  const handleWinLossClose = () => {
    setShowWinLoss(false);
    setLandedSegment(undefined);
    setLandedAmount("$0");
  };

  const handleShare = (amount: string, isWin: boolean) => {
    setPnlData({ amount, isWin }); // ✅ store for PnL card
    setShowWinLoss(false);
    setShowPnl(true);
  };

  const togglePnl = () => setShowPnl(false);
  const toggleCreateRoom = () => setShowCreateRoom(false);

  return (
    <div className="px-4 py-0">
      {isDisclaimer && <Disclaimer toggle={toggleDisclaimer} />}

      {showWinLoss && (
        <SWinOrLoss
          segment={landedSegment}
          amount={landedAmount} // ✅ now passed correctly
          handleClick={handleWinLossClose}
          onShare={handleShare}
        />
      )}

      {showPnl && (
        <PnL
          handleClick={togglePnl}
          amount={pnlData?.amount || "$0"} // ✅ correct amount in PnL
          isWin={pnlData?.isWin ?? false}
        />
      )}

      {showCreateRoom && <CreateRoom toggle={toggleCreateRoom} />}

      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Spin" />
      </div>

      <GameTabs />

      <div className="items-center justify-center flex w-312 gap-20 h-auto py-12 ml-auto mr-auto">
        <SpinWheel onResult={handleSpinResult} />
      </div>
    </div>
  );
};
