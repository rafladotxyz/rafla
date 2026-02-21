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
};

export const SpinView = ({ roomId }: { roomId?: string }) => {
  const [isDisclaimer, setIsDisclaimer] = useState<boolean>(true);
  const [showWinLoss, setShowWinLoss] = useState<boolean>(false);
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);
  const [showPnl, setShowPnl] = useState<boolean>(false);
  const [landedSegment, setLandedSegment] = useState<Segment | undefined>(
    undefined,
  );

  const toggleDisclaimer = () => setIsDisclaimer(false);

  const handleSpinResult = (segment: Segment) => {
    setLandedSegment(segment);
    setShowWinLoss(true);
  };

  const handleWinLossClose = () => {
    setShowWinLoss(false);
    setLandedSegment(undefined);
  };

  // ✅ Closes win/loss card and opens PnL card
  const handleShare = () => {
    setShowWinLoss(false);
    setShowPnl(true);
  };

  const togglePnl = () => {
    setShowPnl(false);
  };

  const toggleCreateRoom = () => setShowCreateRoom(false);

  return (
    <div className="px-4 py-0">
      {isDisclaimer && <Disclaimer toggle={toggleDisclaimer} />}

      {showWinLoss && (
        <SWinOrLoss
          segment={landedSegment}
          handleClick={handleWinLossClose}
          onShare={handleShare} // ✅ wired up here
        />
      )}

      {showPnl && <PnL handleClick={togglePnl} />}
      {showCreateRoom && <CreateRoom toggle={toggleCreateRoom} />}

      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Spin" />
      </div>

      <GameTabs />

      <div className="items-center justify-center bg-white  flex w-312 gap-20 h-auto py-20  ml-auto mr-auto">
        <SpinWheel onResult={handleSpinResult} />
      </div>
    </div>
  );
};
