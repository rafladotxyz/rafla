"use client";

import { useEffect, useState, useRef } from "react";
import { GameHeader } from "@/components/core/games/GameHeader";
import { Disclaimer } from "../cards/DisclaimerCard";
import { PnL } from "../cards/PnLCard";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { FlipGame } from "./FlipGame";
import { useGameState } from "@/hooks/useGameState";
import { useSound } from "@/hooks/useSound";
import { GameStakeModal } from "../GameStakeModal";
import { GameLoadingOverlay } from "../GameLoadingOverlay";
import { fromOARUnits } from "@/lib/contract";
import { APP_URL } from "@/utils/utils";

const EMPTY_ID = "3455654";
const PENDING_KEY = "rafla:pending-flip";
// Pending sessions older than this are considered abandoned.
const PENDING_MAX_AGE_MS = 10 * 60_000;

type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";
type ViewState = "select" | "flipping" | "result";

interface PendingFlip {
  roomId: string;
  side: CoinSide;
  stake: number;
  ts: number;
}

function readPendingFlip(roomId: string): PendingFlip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingFlip;
    if (
      parsed.roomId !== roomId ||
      !parsed.side ||
      typeof parsed.stake !== "number" ||
      Date.now() - parsed.ts > PENDING_MAX_AGE_MS
    ) {
      window.localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const FlipView = ({ roomId }: { roomId?: string }) => {
  const isEmptyState = !roomId || roomId === EMPTY_ID;

  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const effectiveRoomId = isEmptyState ? EMPTY_ID : roomId!;
  const { addEntry, loading, lastFlipResult, error } = useGameState(
    effectiveRoomId,
    "flip",
  );
  const { playSound, playMusic, stopMusic, unlockAudio } = useSound();

  // Resume an interrupted session (refresh mid-flip) during the first render,
  // so no effect-time setState is needed and the reveal can never be dropped.
  const [initialPending] = useState(() => readPendingFlip(effectiveRoomId));

  const [viewState, setViewState] = useState<ViewState>(
    initialPending ? "flipping" : "select",
  );
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(
    initialPending?.side ?? null,
  );
  const [resumedFrom, setResumedFrom] = useState(!!initialPending);
  const [flipResult, setFlipResult] = useState<{
    result: FlipResult;
    landedSide: CoinSide;
    amount: string;
    stakeAmount: string;
  } | null>(null);
  const [showPnl, setShowPnl] = useState(false);
  const [pnlData, setPnlData] = useState<{
    amount: string;
    isWin: boolean;
  } | null>(null);
  const [showStakeModal, setShowStakeModal] = useState(false);
  // Tracks what the user staked so the result card can show it and quick-rebet can reuse it.
  const stakedAmountRef = useRef<number>(initialPending?.stake ?? 0);
  // True while tx is confirmed on-chain but the contract event hasn't arrived yet.
  const [isWaitingForChain, setIsWaitingForChain] = useState(!!initialPending);
  // True between tx confirmation (or resume) and reveal processing. Unlike a
  // viewState check, this survives refreshes and menu exits so a late result
  // can never be silently dropped.
  const awaitingResultRef = useRef(!!initialPending);
  // Prevents processing the same contract event twice.
  const processedTxRef = useRef<string | null>(null);

  const handleFlip = async (side: CoinSide, amount: number) => {
    setSelectedSide(side);
    setShowStakeModal(false);
    stakedAmountRef.current = amount;
    try {
      window.localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({
          roomId: effectiveRoomId,
          side,
          stake: amount,
          ts: Date.now(),
        } satisfies PendingFlip),
      );
    } catch {
      // Storage unavailable — the in-session flow still works.
    }
    awaitingResultRef.current = true;
    const ok = await addEntry(amount, { choice: side });
    if (!ok) {
      awaitingResultRef.current = false;
      window.localStorage.removeItem(PENDING_KEY);
      setSelectedSide(null);
      stopMusic();
      return;
    }
    // Tx confirmed — show the flipping animation and wait for the contract event.
    setViewState("flipping");
    setIsWaitingForChain(true);
    playSound("flip");
  };

  useEffect(() => {
    if (!lastFlipResult) return;
    // Only process while a stake is actually outstanding.
    if (!awaitingResultRef.current) return;
    if (processedTxRef.current === lastFlipResult.transactionHash) return;
    processedTxRef.current = lastFlipResult.transactionHash;
    awaitingResultRef.current = false;
    window.localStorage.removeItem(PENDING_KEY);
    const timer = window.setTimeout(() => {
      setIsWaitingForChain(false);
      setResumedFrom(false);
      const landedSide: CoinSide = lastFlipResult.result === 0 ? "heads" : "tails";
      const result: FlipResult = lastFlipResult.won ? "win" : "loss";
      const oarStake = Math.round(fromOARUnits(lastFlipResult.amount));
      const oarPayout = lastFlipResult.won
        ? Math.round(fromOARUnits(lastFlipResult.amount) * 2 * 0.97)
        : oarStake;
      setFlipResult({
        result,
        landedSide,
        amount: result === "win" ? `${oarPayout.toLocaleString()} OAR` : `${oarStake.toLocaleString()} OAR`,
        stakeAmount: `${oarStake.toLocaleString()} OAR`,
      });
      setViewState("result");
      stopMusic();
      playSound(lastFlipResult.won ? "win" : "loss");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [lastFlipResult, playSound, stopMusic]);

  const resetToSelect = () => {
    stopMusic();
    setViewState("select");
    setFlipResult(null);
    setSelectedSide(null);
    setResumedFrom(false);
    stakedAmountRef.current = 0;
  };

  // One-tap rebet: same side, same stake, straight back into the flip.
  const handleRunItBack = () => {
    const side = selectedSide ?? "heads";
    const stake = stakedAmountRef.current;
    if (stake <= 0 || loading) return;
    void handleFlip(side, stake);
  };

  const handleChangeStake = () => {
    unlockAudio();
    void playMusic("flip");
    setShowStakeModal(true);
  };

  const handleShare = (amount: string, resultType: FlipResult) => {
    stopMusic();
    setViewState("select");
    setFlipResult(null);
    setPnlData({ amount, isWin: resultType === "win" });
    setShowPnl(true);
  };

  const handleCloseResult = () => {
    resetToSelect();
  };

  const isOverlayOpen = loading || (isWaitingForChain && viewState === "flipping");

  return (
    <div className="px-1 lg:px-4 py-0 relative">
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      <GameLoadingOverlay
        key={`${isOverlayOpen}-${loading ? "tx" : "vrf"}`}
        isOpen={isOverlayOpen}
        gameType="flip"
        stage={loading ? "tx" : "vrf"}
        resumed={resumedFrom}
      />

      {error && (
        <div
          role="alert"
          className="mx-auto mb-4 w-full max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {showPnl && pnlData && (
        <PnL
          amount={pnlData.amount}
          isWin={pnlData.isWin}
          gameType="flip"
          handleClick={() => setShowPnl(false)}
          shareUrl={`${APP_URL}/flip`}
        />
      )}

      <div className="mx-auto w-full max-w-2xl py-4">
        <GameHeader gameName="Rafla Flip" />
      </div>

      <FlipGame
        viewState={viewState}
        selectedSide={selectedSide}
        onSelectSide={setSelectedSide}
        handleShare={handleShare}
        handleCloseResult={handleCloseResult}
        flipResult={flipResult}
        handleRunItBack={handleRunItBack}
        handleChangeStake={handleChangeStake}
        isLoading={loading}
        isWaitingForChain={isWaitingForChain}
        onPlay={() => {
          unlockAudio();
          void playMusic("flip");
          setShowStakeModal(true);
        }}
      />

      <GameStakeModal
        key={showStakeModal ? "flip-stake-open" : "flip-stake-closed"}
        open={showStakeModal}
        gameName="Flip stake"
        actionLabel={`Flip ${selectedSide ?? ""}`}
        description={
          selectedSide
            ? `You called ${selectedSide}. Set your OAR stake and confirm to launch the flip. The result settles on-chain instantly.`
            : "Pick a side, set your OAR stake, and confirm to launch the flip."
        }
        availableTokens={["OAR"]}
        feeNotice="Rafla takes a 3% fee from winning flip payouts."
        payoutNotice="A winning flip pays 1.94x your stake after the fee. A loss pays 0."
        onClose={() => setShowStakeModal(false)}
        onConfirm={(amount, side) => {
          playSound("click");
          void handleFlip(side ?? selectedSide ?? "heads", amount);
        }}
        isSubmitting={loading || viewState === "flipping"}
      />
    </div>
  );
};
