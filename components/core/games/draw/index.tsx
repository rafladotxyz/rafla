
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
import { GameStakeModal } from "@/components/core/games/GameStakeModal";
import type { StakeToken } from "@/components/core/games/GameStakeModal";

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
  const [showStakeModal, setShowStakeModal] = useState(false);

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

  /** Opens the token-selector stake modal */
  const handleAddEntry = () => setShowStakeModal(true);

  /** Called when the modal confirms — routes to the right on-chain deposit */
  const handleConfirmStake = async (
    amount: number,
    _side?: "heads" | "tails",
    token?: StakeToken,
  ) => {
    setShowStakeModal(false);
    await addEntry(amount, { token });
  };

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

      {/* Token-selector stake modal for Draw */}
      <GameStakeModal
        key={showStakeModal ? "draw-stake-open" : "draw-stake-closed"}
        open={showStakeModal}
        gameName="Rafla Draw — Enter"
        actionLabel="Enter draw"
        description="Choose the token you want to stake and set your entry amount. All three are accepted — your win-weight is proportional to your deposit value."
        availableTokens={["USDC", "OAR", "ETH"]}
        onClose={() => setShowStakeModal(false)}
        onConfirm={handleConfirmStake}
        isSubmitting={loading}
      />
    </div>
  );
};
