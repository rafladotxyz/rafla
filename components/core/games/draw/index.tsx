"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameHeader } from "@/components/core/games/GameHeader";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { RevealStage } from "../RevealStage";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useGameState } from "@/hooks/useGameState";
import { useAuthContext } from "@/context/AuthContext";
import { RoomGate } from "./RoomGate";
import { GameUI } from "./GameUi";
import { Trophy } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

type StakeToken = "USDC" | "OAR" | "ETH";

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 100 || value % 1 === 0) return Math.round(value).toLocaleString("en-US");
  return parseFloat(value.toFixed(4)).toLocaleString("en-US");
}

interface WinnerPrize {
  parts: string[];
  totalLabel: string;
}

function formatWinnerPrizes(prizes: {
  usdcPrize: bigint;
  oarPrize: bigint;
  ethPrize: bigint;
}): WinnerPrize {
  const parts: string[] = [];
  if (prizes.usdcPrize > 0n)
    parts.push(`$${formatAmount(Number(prizes.usdcPrize) / 1_000_000)}`);
  if (prizes.oarPrize > 0n)
    parts.push(`${formatAmount(Number(prizes.oarPrize) / 1e18)} OAR`);
  if (prizes.ethPrize > 0n)
    parts.push(`${formatAmount(Number(prizes.ethPrize) / 1e18)} ETH`);
  return { parts, totalLabel: parts.join(" + ") };
}

export const DrawView = ({ roomId }: { roomId?: string }) => {
  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();

  // ── Solo path: create or join a room ───────────────────────────────────────
  if (!roomId) {
    return (
      <div className="relative min-h-[70vh] flex flex-col items-center px-4 py-0">
        {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}
        <div className="mx-auto w-full max-w-2xl py-4">
          <GameHeader gameName="Rafla Draw" />
        </div>
        <RoomGate gameType="draw" />
      </div>
    );
  }

  // ── Live room path ──────────────────────────────────────────────────────────
  return (
    <LiveDrawRoom key={roomId} roomId={roomId} />
  );
};

const LiveDrawRoom = ({ roomId }: { roomId: string }) => {
  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const router = useRouter();
  const { user } = useAuthContext();
  const {
    gameState,
    players,
    roomToken,
    roomStakeRaw,
    loading,
    addEntry,
    lastPrivateWinner,
    error,
  } = useGameState(roomId, "draw");

  const [showPnl, setShowPnl] = useState(false);
  const [pnlData, setPnlData] = useState<{ amount: string; isWin: boolean } | null>(null);
  // Reveal each winner event exactly once, even after refreshes/re-renders.
  const revealedRoundRef = useRef<string | null>(null);
  const [reveal, setReveal] = useState<{
    youWon: boolean;
    winnerShort: string;
    prizeLabel: string;
  } | null>(null);

  useEffect(() => {
    if (!lastPrivateWinner || !user) return;
    const roundKey = `${lastPrivateWinner.roomId}:${lastPrivateWinner.winner}`;
    if (revealedRoundRef.current === roundKey) return;
    revealedRoundRef.current = roundKey;

    // Defer one frame so the reveal state update doesn't run synchronously
    // inside the effect body.
    const winnerShort = `${lastPrivateWinner.winner.slice(0, 6)}...${lastPrivateWinner.winner.slice(-4)}`;
    const raf = requestAnimationFrame(() => {
      setReveal({
        youWon:
          !!user.wallet &&
          lastPrivateWinner.winner.toLowerCase() === user.wallet.toLowerCase(),
        winnerShort,
        prizeLabel: formatWinnerPrizes(lastPrivateWinner).totalLabel,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [lastPrivateWinner, user]);

  const stake =
    Number(roomStakeRaw ?? 0) /
    (roomToken === "USDC" ? 1_000_000 : 1e18);

  const handleJoin = () => {
    if (!Number.isFinite(stake) || stake <= 0) return;
    void addEntry(stake, { token: roomToken as StakeToken });
  };

  const handleCloseReveal = () => {
    setReveal(null);
  };

  const handleShareResult = () => {
    if (!reveal) return;
    setPnlData({
      amount: reveal.prizeLabel,
      isWin: reveal.youWon,
    });
    setShowPnl(true);
  };

  const isNewRoundAvailable = gameState.status !== "completed";
  const isCancelled = gameState.status === "cancelled" && !reveal;

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center px-4 py-0">
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      {error ? (
        <div
          role="alert"
          className="mx-auto mt-4 w-full max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-2xl py-4">
        <GameHeader gameName="Rafla Draw" />
      </div>

      {isCancelled ? (
        <SurfaceCard className="mx-auto mt-8 flex w-full max-w-[560px] flex-col items-center gap-4 p-8 text-center animate-fade-up">
          <p className="text-xl font-semibold text-[#F3F3F3]">
            This room was cancelled
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-[#9A9A9A]">
            It didn&apos;t reach its minimum player count before closing, so no
            draw ran. Check your profile history for how your deposit settled.
          </p>
          <button
            type="button"
            onClick={() => router.push("/history")}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
          >
            View history
          </button>
        </SurfaceCard>
      ) : (
        <GameUI
          roomId={roomId}
          gameState={gameState}
          players={players}
          roomToken={roomToken}
          roomStakeRaw={roomStakeRaw}
          isJoining={loading}
          onJoin={handleJoin}
        />
      )}

      {showPnl && pnlData && (
        <PnL
          amount={pnlData.amount}
          isWin={pnlData.isWin}
          gameType="draw"
          handleClick={() => setShowPnl(false)}
          shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/draw/${roomId}`}
        />
      )}

      {reveal ? (
        <RevealStage label="Draw result" onClose={handleCloseReveal}>
          <div className="flex flex-col items-center px-5 pb-6 pt-5 text-center sm:px-6 sm:pt-6">
            <div className="mb-4 flex h-24 w-24 items-end justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <Trophy
                className={`h-full w-full ${reveal.youWon ? "text-[#D9D9D9]" : "text-[#737373]"}`}
              />
            </div>

            <p className="text-[15px] font-medium uppercase tracking-[0.22em] text-[#737373]">
              {reveal.youWon ? "You won the pool" : "The pot went to"}
            </p>
            {reveal.youWon ? (
              <p className="mt-1 text-[42px] font-bold leading-tight text-[#1C9DF7] sm:text-[52px]">
                +{reveal.prizeLabel || "the pool"}
              </p>
            ) : (
              <p className="mt-2 font-mono text-lg font-semibold text-[#E8E8E8]">
                {reveal.winnerShort}
              </p>
            )}
            {!reveal.youWon && reveal.prizeLabel ? (
              <p className="mt-1 text-[13px] text-[#737373]">
                Winning share: {reveal.prizeLabel}
              </p>
            ) : null}

            <div className="mt-6 grid w-full gap-2.5">
              {isNewRoundAvailable ? (
                <button
                  type="button"
                  onClick={() => router.push("/draw")}
                  className="focus-ring h-12 rounded-full bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:scale-[0.98]"
                >
                  Start a new room
                </button>
              ) : null}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleShareResult}
                  className="focus-ring h-12 rounded-full border border-white/10 bg-white/[0.05] text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.10]"
                >
                  Share result
                </button>
                <button
                  type="button"
                  onClick={handleCloseReveal}
                  className="focus-ring h-12 rounded-full border border-white/10 bg-white/[0.05] text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.10]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </RevealStage>
      ) : null}
    </div>
  );
};
