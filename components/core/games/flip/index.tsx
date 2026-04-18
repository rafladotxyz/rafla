"use client";

import { useState } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { PrivateRoomModal } from "../cards/PrivateRoomModal";
import { FlipCard } from "./FlipCard";
import { FlippingScreen } from "./FlipScreen";
import { FlipResultCard } from "./FlipResult";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useContractGame, RoundStatus } from "@/hooks/useContractGame";

type TabType = "public" | "private";
type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";
type ViewState = "select" | "flipping" | "result";

const FLIP_DURATION = 2500;

interface FlipViewProps {
  roomId?: string;
}

interface FlipGameContentProps {
  viewState: ViewState;
  selectedSide: CoinSide | null;
  flipResult: {
    result: FlipResult;
    landedSide: CoinSide;
    amount: string;
  } | null;
  handleFlip: (side: CoinSide, amount: string) => void;
  handleFlipAgain: () => void;
  handleShare: (amount: string, isWin: boolean) => void;
}

// The actual flip game UI — shared between public and private
const FlipGameContent = ({
  viewState,
  selectedSide,
  flipResult,
  handleFlip,
  handleFlipAgain,
  handleShare,
}: FlipGameContentProps) => (
  <div className="flex items-center justify-center w-312 ml-auto mr-auto py-12">
    {viewState === "select" && <FlipCard onFlip={handleFlip} />}
    {viewState === "flipping" && selectedSide && (
      <FlippingScreen side={selectedSide} />
    )}
    {viewState === "result" && flipResult && (
      <FlipResultCard
        result={flipResult.result}
        landedSide={flipResult.landedSide}
        amount={flipResult.amount}
        onFlipAgain={handleFlipAgain}
        onShare={handleShare}
      />
    )}
  </div>
);

export const FlipView = ({ roomId }: FlipViewProps) => {
  const isPrivateRoom = !!roomId;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const { currentRound } = useContractGame();

  const [activeTab, setActiveTab] = useState<TabType>(
    isPrivateRoom ? "private" : "public",
  );
  const [showPrivateModal, setShowPrivateModal] = useState(false);

  // Flip game state
  const [viewState, setViewState] = useState<ViewState>("select");
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [flipResult, setFlipResult] = useState<{
    result: FlipResult;
    landedSide: CoinSide;
    amount: string;
  } | null>(null);
  const [showPnl, setShowPnl] = useState(false);
  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
  } | null>(null);

  const isPublicGameOpen =
    currentRound !== null &&
    currentRound.status === RoundStatus.Active &&
    currentRound.playerCount > 0;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "private" && !isPrivateRoom) {
      setShowPrivateModal(true);
    }
  };

  const handleFlip = (side: CoinSide, amount: string) => {
    setSelectedSide(side);
    setViewState("flipping");

    setTimeout(() => {
      const landedSide: CoinSide = Math.random() > 0.5 ? "heads" : "tails";
      const result: FlipResult = landedSide === side ? "win" : "loss";
      setFlipResult({ result, landedSide, amount });
      setViewState("result");
    }, FLIP_DURATION);
  };

  const handleFlipAgain = () => {
    setViewState("select");
    setFlipResult(null);
    setSelectedSide(null);
  };

  const handleShare = (amount: string, isWin: boolean) => {
    setViewState("select");
    setFlipResult(null);
    setPnlData({ amount, isWin });
    setShowPnl(true);
  };

  return (
    <div className="px-4 py-0">
      {/* Disclaimer — first visit only */}
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      {/* PnL share card */}
      {showPnl && pnlData && (
        <PnL
          amount={pnlData.amount}
          isWin={pnlData.isWin}
          handleClick={() => setShowPnl(false)}
          shareUrl={`https://rafla.xyz/flip/${roomId ?? ""}`}
        />
      )}

      {/* Private room modal */}
      {showPrivateModal && (
        <PrivateRoomModal
          gameType="flip"
          roomId={isPrivateRoom ? roomId : undefined}
          onClose={() => setShowPrivateModal(false)}
        />
      )}

      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Flip" />
      </div>

      <GameTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── Public tab ── */}
      {activeTab === "public" && (
        <>
          {!isPublicGameOpen ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 w-312 ml-auto mr-auto">
              <div className="w-14 h-14 rounded-full bg-[#141414] border border-[#282828] flex items-center justify-center text-2xl">
                🕐
              </div>
              <p className="text-[18px] font-medium text-[#D9D9D9]">
                No open game right now
              </p>
              <p className="text-[14px] text-[#737373] text-center max-w-xs">
                {` The Rafla team hasn't opened a public flip yet. Check back soon
                or create a private room.`}
              </p>
              <button
                onClick={() => handleTabChange("private")}
                className="h-10 px-5 rounded-xl border border-[#282828] text-[14px] text-[#CBCBCB] hover:border-[#444] transition-colors"
              >
                Create Private Room
              </button>
            </div>
          ) : (
            <FlipGameContent
              viewState={viewState}
              selectedSide={selectedSide}
              flipResult={flipResult}
              handleFlip={handleFlip}
              handleFlipAgain={handleFlipAgain}
              handleShare={handleShare}
            />
          )}
        </>
      )}

      {/* ── Private tab ── */}
      {activeTab === "private" && (
        <>
          {isPrivateRoom ? (
            <FlipGameContent
              viewState={viewState}
              selectedSide={selectedSide}
              flipResult={flipResult}
              handleFlip={handleFlip}
              handleFlipAgain={handleFlipAgain}
              handleShare={handleShare}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-24 w-312 ml-auto mr-auto">
              <div className="w-14 h-14 rounded-full bg-[#141414] border border-[#282828] flex items-center justify-center text-2xl">
                🔒
              </div>
              <p className="text-[18px] font-medium text-[#D9D9D9]">
                Private Rooms
              </p>
              <p className="text-[14px] text-[#737373] text-center max-w-xs">
                Create a private flip room or join one with a room ID.
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
