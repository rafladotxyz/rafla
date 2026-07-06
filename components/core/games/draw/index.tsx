
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

import { useRouter } from "next/navigation";
import { Sparkles, Lock, ArrowLeft, LucideClockFading } from "lucide-react";

const EMPTY_ID = "3455654";
type TabType = "public" | "private";

export const DrawView = ({ roomId }: { roomId?: string }) => {
  const router = useRouter();
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
  const { gameState, players, loading, isSettling, addEntry, error } = useGameState(
    effectiveRoomId,
    "draw",
  );

  const isPublicGameOpen =
    currentRound !== null &&
    currentRound.status === RoundStatus.Active;

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
    <div className="px-4 py-0 relative min-h-[70vh]">
      {/* Coming Soon & Upgrading Overlay */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
        {/* Glow behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-[460px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0E0E11]/90 p-6 md:p-8 text-center shadow-2xl backdrop-blur-2xl">
          {/* Subtle animated gradient line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] border border-violet-500/20 bg-violet-500/10 text-violet-400">
            <LucideClockFading className="h-7 w-7" />
          </div>

          

          {/* Title */}
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Draw Game is Coming Soon
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-[#9A9A9A]">
            We are preparing the next evolution of the Draw game with an improved on chain engine
          </p>

          {/* Features Preview */}
          <div className="my-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 text-left">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">What's coming next:</h3>
            <ul className="space-y-2.5 text-xs text-[#CBCBCB]">
              <li className="flex items-center gap-2">
               <span className="text-violet-400">✦</span> Fully isolated on-chain game rooms
</li>
<li className="flex items-center gap-2">
  <span className="text-violet-400">✦</span> Dynamic stakeholder settings
</li>
<li className="flex items-center gap-2">
  <span className="text-violet-400">✦</span> Multi-token entry tickets
</li>
<li className="flex items-center gap-2">
  <span className="text-violet-400">✦</span> Enhanced VRF randomness
</li>
<li className="flex items-center gap-2">
  <span className="text-violet-400">✦</span> Circular countdown & live win probabilities
</li>
            </ul>
          </div>
          <button
            onClick={() => router.push("/")}
            className="inline-flex w-full h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-black transition-all hover:bg-[#F5F5F5] active:scale-98"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>

      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      {/* Settling overlay — shown when auto-endRound tx is in flight */}
      {isSettling && (
        <div className="fixed inset-0 z-[998] flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-[#E8E8E8]">Settling previous round…</p>
          <p className="text-xs text-[#737373]">Please wait. The new round will start automatically.</p>
        </div>
      )}

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
