import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { useGameState } from "@/hooks/useGameState";
import { useState } from "react";
import { Disclaimer } from "../cards/DisclaimerCard";
import { WinOrLoss } from "../cards/WinOrLossCard";
import { PnL } from "../cards/PnLCard";
import { CreateRoom } from "../cards/CreateRoomCard";
import { SpinWheel } from "./SpinerCard";

export const SpinView = ({ roomId }: { roomId?: string }) => {
  const [isDisclaimer, setIsDisclaimer] = useState<boolean>(true);
  const [showWinLoss, setShowWinLoss] = useState<boolean>(false);
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);
  const [showPnl, setShowPnl] = useState<boolean>(false);
  const { gameState, players, loading, addEntry } = useGameState(
    roomId || "3455654",
  );

  const handleAddEntry = async () => {
    await addEntry(5.0);
  };

  const toggleDisclaimer = () => {
    setIsDisclaimer(false);
  };

  const toggleWinLoss = () => {
    setShowWinLoss(true);
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
      {showWinLoss && <WinOrLoss handleClick={toggleWinLoss} />}
      {showPnl && <PnL handleClick={togglePnl} />}
      {showCreateRoom && <CreateRoom toggle={toggleCreateRoom} />}
      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Spin" />
      </div>

      {/* Tabs */}
      <GameTabs />
      <div className="items-center justify-center flex w-312 gap-20 h-229.5 ml-auto mr-auto ">
        <SpinWheel onResult={toggleWinLoss} />
      </div>
    </div>
  );
};
