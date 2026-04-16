import { DrawTimer } from "@/components/core/games/draw/DrawTimer";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { PlayersCard } from "@/components/core/games/cards/PlayerCard";
import { RightPanel } from "@/components/core/games/RightPanelCard";
import { useGameState } from "@/hooks/useGameState";
import { useEffect, useState } from "react";
import { Disclaimer } from "../cards/DisclaimerCard";
import { WinOrLoss } from "../cards/WinOrLossCard";
import { PnL } from "../cards/PnLCard";
import { CreateRoom } from "../cards/CreateRoomCard";

export const DrawView = ({ roomId }: { roomId?: string }) => {
  const [isDisclaimer, setIsDisclaimer] = useState<boolean>(true);
  const [showWinLoss, setShowWinLoss] = useState<boolean>(false);
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);
  const [showPnl, setShowPnl] = useState<boolean>(false);
  const { gameState, loading, addEntry } = useGameState(roomId || "3455654");

  // 1. Keep a state for manual closing (if the user clicks "X")
  const [userClosedCreate, setUserClosedCreate] = useState(false);

  // 2. Derive the visibility logic
  // Show it if: not loading, no players, and the user hasn't manually closed it
  const shouldShowCreateRoom =
    !loading && gameState.players.length === 0 && !userClosedCreate;

  const handleAddEntry = async () => {
    await addEntry(5.0);
  };

  const toggleDisclaimer = () => {
    setIsDisclaimer(false);
    setShowWinLoss(true);
  };

  const toggleWinLoss = () => {
    setShowWinLoss(false);
    setShowPnl(true);
  };

  const togglePnl = () => {
    setShowPnl(false);
    setShowCreateRoom(true);
  };

  return (
    <div className="px-4 py-0">
      {isDisclaimer && <Disclaimer toggle={toggleDisclaimer} />}
      {showWinLoss && <WinOrLoss handleClick={toggleWinLoss} />}
      {showPnl && <PnL handleClick={togglePnl} />}

      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Draw" />
      </div>
      {shouldShowCreateRoom && (
        <CreateRoom toggle={() => setUserClosedCreate(true)} gameType="draw" />
      )}
      {/* Tabs */}
      <GameTabs />
      <div className="items-center justify-between flex w-312 gap-20 h-229.5 ml-auto mr-auto ">
        <PlayersCard
          players={gameState.players}
          totalPlayers={gameState.totalPlayers}
          minPlayers={gameState.minPlayers}
        />
        <DrawTimer drawTime={gameState.drawTime} isLive={gameState.isLive} />
        <RightPanel
          pricePool={gameState.pricePool}
          yourEntry={gameState.yourEntry}
          potentialWin={gameState.potentialWin}
          roomLink={`https://rafla.xyz/draw/${roomId}`}
          entryAmount={5.0}
          loading={loading}
          onAddEntry={handleAddEntry}
        />
      </div>
    </div>
  );
};
