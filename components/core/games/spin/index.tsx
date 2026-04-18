"use client";

import { useState } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { GameTabs } from "@/components/core/games/GameTabs";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { PrivateRoomModal } from "../cards/PrivateRoomModal";
import { SpinWheel } from "./SpinerCard";
import SWinOrLoss from "./card/SpinWinOrLoss";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useContractGame, RoundStatus } from "@/hooks/useContractGame";

type TabType = "public" | "private";

type Segment = {
  label: string;
  asset: string;
  color: string;
  strokeColor: string;
};

const getAmountFromSegment = (segment: Segment): string => {
  if (segment.label === "Yaay $2 won!") return "$2.00";
  if (segment.label === "Breakeven!") return "$1.00";
  return "$1.00";
};

interface SpinViewProps {
  roomId?: string;
}

export const SpinView = ({ roomId }: SpinViewProps) => {
  const isPrivateRoom = !!roomId;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const { currentRound } = useContractGame();

  const [activeTab, setActiveTab] = useState<TabType>(
    isPrivateRoom ? "private" : "public",
  );
  const [showPrivateModal, setShowPrivateModal] = useState(false);

  // Spin result flow
  const [showWinLoss, setShowWinLoss] = useState(false);
  const [showPnl, setShowPnl] = useState(false);
  const [landedSegment, setLandedSegment] = useState<Segment | undefined>();
  const [landedAmount, setLandedAmount] = useState("$0");
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

  const handleSpinResult = (segment: Segment) => {
    const amount = getAmountFromSegment(segment);
    setLandedSegment(segment);
    setLandedAmount(amount);
    setShowWinLoss(true);
  };

  const handleWinLossClose = () => {
    setShowWinLoss(false);
    setLandedSegment(undefined);
    setLandedAmount("$0");
  };

  const handleShare = (amount: string, isWin: boolean) => {
    setPnlData({ amount, isWin });
    setShowWinLoss(false);
    setShowPnl(true);
  };

  return (
    <div className="px-4 py-0">
      {/* Disclaimer — first visit only */}
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      {/* Spin result card */}
      {showWinLoss && (
        <SWinOrLoss
          segment={landedSegment}
          amount={landedAmount}
          handleClick={handleWinLossClose}
          onShare={handleShare}
        />
      )}

      {/* PnL share card */}
      {showPnl && pnlData && (
        <PnL
          handleClick={() => setShowPnl(false)}
          amount={pnlData.amount}
          isWin={pnlData.isWin}
          shareUrl={`https://rafla.xyz/spin/${roomId ?? ""}`}
        />
      )}

      {/* Private room modal */}
      {showPrivateModal && (
        <PrivateRoomModal
          gameType="spin"
          roomId={isPrivateRoom ? roomId : undefined}
          onClose={() => setShowPrivateModal(false)}
        />
      )}

      <div className="w-312 h-auto ml-auto py-4 mr-auto">
        <GameHeader gameName="Rafla Spin" />
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
                {` The Rafla team hasn't opened a public spin yet. Check back soon
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
            <div className="items-center justify-center flex w-312 gap-20 h-auto py-12 ml-auto mr-auto">
              <SpinWheel onResult={handleSpinResult} />
            </div>
          )}
        </>
      )}

      {/* ── Private tab ── */}
      {activeTab === "private" && (
        <>
          {isPrivateRoom ? (
            /* Has roomId — show the spin game */
            <div className="items-center justify-center flex w-312 gap-20 h-auto py-12 ml-auto mr-auto">
              <SpinWheel onResult={handleSpinResult} />
            </div>
          ) : (
            /* No roomId — prompt */
            <div className="flex flex-col items-center justify-center gap-4 py-24 w-312 ml-auto mr-auto">
              <div className="w-14 h-14 rounded-full bg-[#141414] border border-[#282828] flex items-center justify-center text-2xl">
                🔒
              </div>
              <p className="text-[18px] font-medium text-[#D9D9D9]">
                Private Rooms
              </p>
              <p className="text-[14px] text-[#737373] text-center max-w-xs">
                Create a private spin room or join one with a room ID.
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
