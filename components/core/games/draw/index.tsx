import { DrawTimer } from "@/components/core/games/draw/DrawTimer";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { PlayersCard } from "@/components/core/games/cards/PlayerCard";
import { RightPanel } from "@/components/core/games/RightPanelCard";
import { useGameState } from "@/hooks/useGameState";
import { useState } from "react";
import { Disclaimer } from "../cards/DisclaimerCard";
import { Toast } from "@/components/ui/Toast";
import { WinOrLoss } from "../cards/WinOrLossCard";

export const DrawView = ({ roomId }: { roomId?: string }) => {
  const [isDisclaimer, setIsDisclaimer] = useState<boolean>(true);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [showWinLoss, setShowWinLoss] = useState<boolean>(false);
  const { gameState, players, loading, addEntry } = useGameState(
    roomId || "3455654",
  );

  const handleAddEntry = async () => {
    await addEntry(5.0);
  };

  const toggleDisclaimer = () => {
    setIsDisclaimer(false);
    setShowToast(true);
  };

  const toggleToast = () => {
    setShowToast(false);
    setShowWinLoss(true);
  };

  const toggleWinLoss = () => {
    setShowWinLoss(false);
  };

  return (
    <div className="px-4 py-0">
      {isDisclaimer && <Disclaimer toggle={toggleDisclaimer} />}
      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader chain="Base" />
        {showToast && (
          <Toast message="Hello Toast" isSuccess handleClick={toggleToast} />
        )}
      </div>

      {showWinLoss && <WinOrLoss handleClick={toggleWinLoss} />}
      {/* Tabs */}
      <GameTabs />
      <div className="items-center justify-between flex w-312 gap-20 h-229.5 ml-auto mr-auto ">
        <PlayersCard
          players={players}
          totalPlayers={gameState.totalPlayers}
          minPlayers={gameState.minPlayers}
        />
        <DrawTimer drawTime={gameState.drawTime} isLive={gameState.isLive} />
        <RightPanel
          pricePool={gameState.pricePool}
          yourEntry={gameState.yourEntry}
          potentialWin={gameState.potentialWin}
          roomLink={`https://rafla.xyz/draw/${roomId || "3455654"}`}
          entryAmount={5.0}
          loading={loading}
          onAddEntry={handleAddEntry}
        />
      </div>
    </div>
  );
};
