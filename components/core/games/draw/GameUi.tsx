"use client";

import { GameState, Player } from "@/hooks/useGameState";
import { useBalances } from "@/hooks/useBalances";
import { Wallet } from "lucide-react";
import { PlayersCard } from "../cards/PlayerCard";
import { PricePoolCard } from "../PricePoolCard";
import { EntryInfoCard } from "../EntryInfoCard";
import { RoomLinkCard } from "../RoomLinkCard";
import { GameLoadingOverlay } from "../GameLoadingOverlay";
import { DrawTimer } from "./DrawTimer";
import { APP_URL } from "@/utils/utils";

type StakeToken = "USDC" | "OAR" | "ETH";

function humanStake(rawStake: string | null, token: string): number | null {
  if (!rawStake) return null;
  const decimals = token === "USDC" ? 1_000_000 : 1e18;
  const value = Number(rawStake) / decimals;
  return Number.isFinite(value) && value > 0 ? value : null;
}

interface GameUIProps {
  roomId: string;
  gameState: GameState;
  players: Player[];
  roomToken: string;
  roomStakeRaw: string | null;
  /** Deposit in progress (wallet signing / broadcasting). */
  isJoining: boolean;
  onJoin: () => void;
}

export const GameUI = ({
  roomId,
  gameState,
  players,
  roomToken,
  roomStakeRaw,
  isJoining,
  onJoin,
}: GameUIProps) => {
  const { balances, isLoading: loadingBalances } = useBalances();

  // The creator fixed the stake; the API stores it in raw token units.
  const stake = humanStake(roomStakeRaw, roomToken);
  const hasJoined = gameState.yourEntry > 0;

  const balanceNum = Number(
    balances[roomToken as StakeToken]?.formatted ?? NaN,
  );
  const insufficientBalance =
    stake !== null &&
    !loadingBalances &&
    Number.isFinite(balanceNum) &&
    balanceNum < stake;

  const joinDisabled =
    !hasJoined &&
    (isJoining || stake === null || loadingBalances || insufficientBalance);

  const joinLabel = !hasJoined
    ? isJoining
      ? "Confirming in wallet…"
      : stake === null
        ? "Stake unavailable"
        : loadingBalances
          ? "Checking balance…"
          : insufficientBalance
            ? `Not enough ${roomToken}`
            : `Stake ${stake} ${roomToken} to join`
    : "You're in";

  const roomLink = `${APP_URL}/draw/${roomId}`;

  return (
    <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-6 px-1 py-4 md:gap-8 lg:flex-row lg:items-start md:py-6">
      <GameLoadingOverlay
        key={`${isJoining}-tx`}
        isOpen={isJoining}
        gameType="draw"
        stage="tx"
      />

      {/* Timer — the hero, top of the mobile stack */}
      <div className="order-1 flex w-full flex-col items-center gap-5 lg:w-auto">
        <DrawTimer drawTime={gameState.drawTime} isLive={gameState.isLive} />

        <p
          className="text-center text-sm text-[#8A8A8A]"
          role="status"
          aria-live="polite"
        >
          {gameState.totalPlayers >= gameState.minPlayers
            ? "Room is full — drawing now."
            : `${gameState.totalPlayers} of ${gameState.minPlayers} seats filled`}
        </p>

        {/* Join CTA sits under the timer for thumb reach */}
        {!hasJoined ? (
          <button
            type="button"
            onClick={onJoin}
            disabled={joinDisabled}
            aria-live="polite"
            className={`focus-ring inline-flex h-14 w-full max-w-[320px] items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all sm:max-w-[384px] ${
              !joinDisabled
                ? "bg-white text-black hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:scale-[0.98]"
                : "cursor-not-allowed bg-white/5 text-[#737373]"
            }`}
          >
            {!insufficientBalance || isJoining ? null : (
              <Wallet className="h-4 w-4" />
            )}
            {joinLabel}
          </button>
        ) : null}

        {insufficientBalance && !hasJoined ? (
          <p className="max-w-[320px] text-center text-xs text-red-300 sm:max-w-[384px]">
            Your {roomToken} balance is below this room&apos;s fixed stake.
          </p>
        ) : null}
      </div>

      {/* Side info */}
      <div className="order-2 flex w-full max-w-sm flex-col gap-4">
        <PricePoolCard amount={gameState.pricePool} />
        <EntryInfoCard
          yourEntry={gameState.yourEntry}
          potentialWin={gameState.potentialWin}
          token={roomToken}
        />
        <PlayersCard
          players={players}
          totalPlayers={gameState.totalPlayers}
          minPlayers={gameState.minPlayers}
        />
        <RoomLinkCard roomLink={roomLink} />
      </div>
    </div>
  );
};
