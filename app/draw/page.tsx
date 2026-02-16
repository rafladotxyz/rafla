"use client";

import { DrawTimer } from "@/components/ui/DrawTimer";
import { GameHeader } from "@/components/ui/GameHeader";
import { GameTabs } from "@/components/ui/GameTabs";
import { PlayersCard } from "@/components/ui/PlayerCard";
import { RightPanel } from "@/components/ui/RightPanelCard";
import { useGameState } from "@/hooks/useGameState";

interface DrawGamePageProps {
  params: {
    roomId: string;
  };
}

export default function DrawGamePage({ params }: DrawGamePageProps) {
  const { gameState, players, loading, addEntry } = useGameState(params.roomId);

  const handleAddEntry = async () => {
    await addEntry(5.0);
  };

  return (
    <div className="px-4 py-0">
      <GameHeader chain="Base" />

      {/* Tabs */}
      <GameTabs />
      <div className=" bg-white/0 items-center justify-between flex w-312 gap-20 h-229.5 ml-auto mr-auto ">
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
          roomLink={`https://rafla.xyz/draw/${params.roomId}`}
          entryAmount={5.0}
          loading={loading}
          onAddEntry={handleAddEntry}
        />
      </div>
    </div>
  );
}
