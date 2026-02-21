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

  console.log("Room ID:", roomId); //
  // ✅ Store the landed segment so we can pass it to SWinOrLoss
  const [landedSegment, setLandedSegment] = useState<Segment | undefined>(
    undefined,
  );

  const toggleDisclaimer = () => {
    setIsDisclaimer(false);
  };

  // ✅ Receive the segment from SpinWheel, store it, then show the result card
  const handleSpinResult = (segment: Segment) => {
    setLandedSegment(segment);
    setShowWinLoss(true);
  };

  const handleWinLossClose = () => {
    setShowWinLoss(false);
    setLandedSegment(undefined);
  };

  const togglePnl = () => {
    setShowPnl(false);
    setShowCreateRoom(true);
  };

  const toggleCreateRoom = () => {
    setShowCreateRoom(false);
  };

  return (
    <div className="px-4 py-0">
      {isDisclaimer && <Disclaimer toggle={toggleDisclaimer} />}

      {/* ✅ Pass landedSegment to SWinOrLoss */}
      {showWinLoss && (
        <SWinOrLoss segment={landedSegment} handleClick={handleWinLossClose} />
      )}

      {showPnl && <PnL handleClick={togglePnl} />}
      {showCreateRoom && <CreateRoom toggle={toggleCreateRoom} />}

      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Spin" />
      </div>

      <GameTabs />

      <div className="items-center justify-center flex w-312 gap-20 h-229.5 ml-auto mr-auto">
        {/* ✅ Pass handleSpinResult as onResult */}
        <SpinWheel onResult={handleSpinResult} />
      </div>
    </div>
  );
};
