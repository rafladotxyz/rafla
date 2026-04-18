"use client";

import { useState } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { PlayersCard } from "@/components/core/games/cards/PlayerCard";
import { RightPanel } from "@/components/core/games/RightPanelCard";
import { DrawTimer } from "@/components/core/games/draw/DrawTimer";
import { Disclaimer } from "../cards/DisclaimerCard";
import { WinOrLoss } from "../cards/WinOrLossCard";
import { PnL } from "../cards/PnLCard";
import { PrivateRoomModal } from "../cards/PrivateRoomModal";
import { useGameState } from "@/hooks/useGameState";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useContractGame, RoundStatus } from "@/hooks/useContractGame";

type TabType = "public" | "private";

interface DrawViewProps {
  roomId?: string; // present when arriving via /draw/[roomId]
}

export const DrawView = ({ roomId }: DrawViewProps) => {
  const isPrivateRoom = !!roomId;

  // Disclaimer — first visit only
  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();

  // Tab state — if roomId in URL, force private tab
  const [activeTab, setActiveTab] = useState<TabType>(
    isPrivateRoom ? "private" : "public",
  );

  // Private room modal — show when user clicks Private tab (not when roomId from URL, that goes straight to game)
  const [showPrivateModal, setShowPrivateModal] = useState(false);

  // Result flow state
  const [showWinLoss, setShowWinLoss] = useState(false);
  const [showPnl, setShowPnl] = useState(false);
  const [resultData, setResultData] = useState<{
    isWin: boolean;
    amount: string;
    winnerAddress: string;
  } | null>(null);

  // Game data — use roomId if private, otherwise use current contract round
  const effectiveRoomId = roomId ?? "global";
  const { gameState, players, loading, addEntry } =
    useGameState(effectiveRoomId);

  // Contract round for public game status check
  const { currentRound } = useContractGame();

  const isPublicGameOpen =
    currentRound !== null &&
    currentRound.status === RoundStatus.Active &&
    currentRound.playerCount > 0;

  // Handle tab switching
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "private" && !isPrivateRoom) {
      setShowPrivateModal(true);
    }
  };

  // Handle WinOrLoss from lastWinner event
  // In real usage, this would be triggered by the WinnerSelected contract event
  const handleWinnerResult = (
    isWin: boolean,
    amount: string,
    winnerAddress: string,
  ) => {
    setResultData({ isWin, amount, winnerAddress });
    setShowWinLoss(true);
  };

  const handleWinLossClose = () => {
    setShowWinLoss(false);
  };

  const handleShare = (amount: string, isWin: boolean) => {
    setShowWinLoss(false);
    setResultData((prev) => (prev ? { ...prev, amount, isWin } : null));
    setShowPnl(true);
  };

  const handleAddEntry = async () => {
    await addEntry(5.0);
  };

  return (
    <div className="px-4 py-0">
      {/* ── Step 1: Disclaimer (first visit only) ── */}
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      {/* ── Step 2: WinOrLoss (Draw game only, after result) ── */}
      {showWinLoss && resultData && (
        <WinOrLoss
          handleClick={handleWinLossClose}
          isWin={resultData.isWin}
          amount={resultData.amount}
          winnerAddress={resultData.winnerAddress}
        />
      )}

      {/* ── Step 3: PnL share card ── */}
      {showPnl && resultData && (
        <PnL
          isWin={resultData.isWin}
          amount={resultData.amount}
          handleClick={() => setShowPnl(false)}
          shareUrl={`https://rafla.xyz/draw/${roomId ?? ""}`}
        />
      )}

      {/* ── Private room modal (create or join) ── */}
      {showPrivateModal && (
        <PrivateRoomModal
          gameType="draw"
          roomId={isPrivateRoom ? roomId : undefined}
          onClose={() => setShowPrivateModal(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Draw" />
      </div>

      {/* ── Tabs ── */}
      <GameTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── Public tab content ── */}
      {activeTab === "public" && (
        <>
          {!isPublicGameOpen ? (
            /* No active public game */
            <div className="flex flex-col items-center justify-center gap-4 py-24 w-312 ml-auto mr-auto">
              <div className="w-14 h-14 rounded-full bg-[#141414] border border-[#282828] flex items-center justify-center text-2xl">
                🕐
              </div>
              <p className="text-[18px] font-medium text-[#D9D9D9]">
                No open game right now
              </p>
              <p className="text-[14px] text-[#737373] text-center max-w-xs">
                {`The Rafla team hasn't opened a public draw yet. Check back soon or create a private room to play with friends.`}
              </p>
              <button
                onClick={() => handleTabChange("private")}
                className="h-10 px-5 rounded-xl border border-[#282828] text-[14px] text-[#CBCBCB] hover:border-[#444] transition-colors"
              >
                Create Private Room
              </button>
            </div>
          ) : (
            /* Active public game */
            <div className="items-center justify-between flex w-312 gap-20 h-229.5 ml-auto mr-auto">
              <PlayersCard
                players={players}
                totalPlayers={gameState.totalPlayers}
                minPlayers={gameState.minPlayers}
              />
              <DrawTimer
                drawTime={gameState.drawTime}
                isLive={gameState.isLive}
              />
              <RightPanel
                pricePool={gameState.pricePool}
                yourEntry={gameState.yourEntry}
                potentialWin={gameState.potentialWin}
                isPrivate={false}
                roomLink={`https://rafla.xyz/draw/${roomId ?? ""}`}
                entryAmount={5.0}
                loading={loading}
                onAddEntry={handleAddEntry}
              />
            </div>
          )}
        </>
      )}

      {/* ── Private tab content ── */}
      {activeTab === "private" && (
        <>
          {isPrivateRoom ? (
            /* Arrived via /draw/[roomId] — show the actual game */
            <div className="items-center justify-between flex w-312 gap-20 h-229.5 ml-auto mr-auto">
              <PlayersCard
                players={players}
                totalPlayers={gameState.totalPlayers}
                minPlayers={gameState.minPlayers}
              />
              <DrawTimer
                drawTime={gameState.drawTime}
                isLive={gameState.isLive}
              />
              <RightPanel
                pricePool={gameState.pricePool}
                yourEntry={gameState.yourEntry}
                potentialWin={gameState.potentialWin}
                isPrivate={true}
                roomLink={`https://rafla.xyz/draw/${roomId}`}
                entryAmount={5.0}
                loading={loading}
                onAddEntry={handleAddEntry}
              />
            </div>
          ) : (
            /* No roomId — prompt to create or join */
            <div className="flex flex-col items-center justify-center gap-4 py-24 w-312 ml-auto mr-auto">
              <div className="w-14 h-14 rounded-full bg-[#141414] border border-[#282828] flex items-center justify-center text-2xl">
                🔒
              </div>
              <p className="text-[18px] font-medium text-[#D9D9D9]">
                Private Rooms
              </p>
              <p className="text-[14px] text-[#737373] text-center max-w-xs">
                Create a private room and share the link with friends, or join
                an existing room with a room ID.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPrivateModal(true)}
                  className="h-10 px-5 rounded-xl bg-white text-[#0A0A0A] text-[14px] font-medium hover:bg-[#E8E8E8] transition-colors"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setShowPrivateModal(true)}
                  className="h-10 px-5 rounded-xl border border-[#282828] text-[14px] text-[#CBCBCB] hover:border-[#444] transition-colors"
                >
                  Join Room
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
