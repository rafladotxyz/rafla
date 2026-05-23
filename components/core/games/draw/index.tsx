
"use client";

import { useState } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { Disclaimer } from "../cards/DisclaimerCard";
import { EmptyStateCard } from "../cards/EmptyStateCard";
import { JoinRoomModal } from "../cards/JoinRoomModal";
import { useGameState } from "@/hooks/useGameState";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useContractGame, RoundStatus } from "@/hooks/useContractGame";
import { GameUI } from "./GameUi";

const EMPTY_ID = "3455654";
type TabType = "public" | "private";

export const DrawView = ({ roomId }: { roomId?: string }) => {
  const isEmptyState = !roomId || roomId === EMPTY_ID;
  const isPrivateRoom = !isEmptyState;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const { currentRound } = useContractGame();

  const [activeTab, setActiveTab] = useState<TabType>(
    isPrivateRoom ? "private" : "public",
  );
  const [hasJoined, setHasJoined] = useState(false);

  const effectiveRoomId = isEmptyState ? EMPTY_ID : roomId!;
  const { gameState, players, loading, addEntry, error } = useGameState(
    effectiveRoomId,
    "draw",
  );

  const isPublicGameOpen =
    currentRound !== null &&
    currentRound.status === RoundStatus.Active &&
    currentRound.playerCount > 0;

  const showJoinModal = isPrivateRoom && !hasJoined;

  const handleTabChange = (tab: TabType) => setActiveTab(tab);
  const handleAddEntry = async () => addEntry(gameState.yourEntry || 5.0);

  return (
    <div className="px-4 py-0">
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      {showJoinModal && (
        <JoinRoomModal
          gameType="draw"
          roomId={roomId!}
          onJoined={() => setHasJoined(true)}
        />
      )}

      <div className="w-full max-w-2xl mx-auto py-4">
        <GameHeader gameName="Rafla Draw" />
      </div>

      <GameTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Public tab */}
      {activeTab === "public" &&
        (isPublicGameOpen ? (
          <GameUI
            isPrivate={false}
            players={players}
            gameState={gameState}
            loading={loading}
            onAddEntry={handleAddEntry}
            roomId={effectiveRoomId}
            error={error}
          />
        ) : (
          <EmptyStateCard gameType="draw" isPublic />
        ))}

      {/* Private tab */}
      {activeTab === "private" &&
        (isEmptyState ? (
          <EmptyStateCard gameType="draw" isPublic={false} />
        ) : hasJoined ? (
          <GameUI
            isPrivate={true}
            players={players}
            gameState={gameState}
            loading={loading}
            onAddEntry={handleAddEntry}
            roomId={roomId}
            error={error}
          />
        ) : (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
          </div>
        ))}
    </div>
  );
};
