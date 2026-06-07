"use client";

import { useState } from "react";
import { ArrowRight, Copy, Link2, Users } from "lucide-react";
import { useRoom } from "@/hooks/useRoom";
import { useAuthContext } from "@/context/AuthContext";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

type StakeToken = "USDC" | "OAR" | "ETH";

const TOKEN_PRESETS: Record<StakeToken, number[]> = {
  USDC: [1, 2, 3, 5],
  OAR: [0.5, 1, 5, 10],
  ETH: [0.0001, 0.001, 0.005, 0.01],
};

const TOKEN_SYMBOLS: Record<StakeToken, string> = {
  USDC: "$",
  OAR: "◈",
  ETH: "Ξ",
};

const PLAYER_OPTIONS = [2, 4, 6, 8];

type GameType = "spin" | "flip" | "draw";

export const CreateRoom = ({
  toggle,
  gameType = "draw",
}: {
  toggle?: () => void;
  gameType?: GameType;
}) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
      <CreateRoomCard toggle={toggle} gameType={gameType} />
    </div>
  );
};

const CreateRoomCard = ({
  toggle,
  gameType = "draw",
}: {
  toggle?: () => void;
  gameType?: GameType;
}) => {
  const { isAuthenticated, signIn } = useAuthContext();
  const { createRoom, copyRoomLink, createdRoom, isCreating, error } = useRoom();

  const availableTokens: StakeToken[] = gameType === "draw" ? ["USDC", "OAR", "ETH"] : ["OAR"];
  const [selectedToken, setSelectedToken] = useState<StakeToken>(availableTokens[0]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [customPlayers, setCustomPlayers] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"form" | "share">("form");

  const effectivePrice = customPrice ? Number(customPrice) : selectedPrice;
  const effectivePlayers = customPlayers ? Number(customPlayers) : selectedPlayers;
  const canCreate = !!effectivePrice && !!effectivePlayers && !isCreating;

  const currentPresets = TOKEN_PRESETS[selectedToken];

  const roomLink = createdRoom
    ? `${typeof window !== "undefined" ? window.location.origin : "https://rafla.xyz"}/${gameType}/${createdRoom.id}`
    : "";

  const handleCreate = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }

    if (!effectivePrice || !effectivePlayers) return;

    const room = await createRoom({
      gameType,
      stakeAmount: effectivePrice,
      token: selectedToken,
      minPlayers: effectivePlayers,
    });

    if (room) setView("share");
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (view === "share" && createdRoom) {
    return (
      <SurfaceCard className="relative flex w-full max-w-[520px] flex-col gap-5 p-5 md:p-6">
        <button
          type="button"
          onClick={toggle}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#CBCBCB] transition-colors hover:border-white/20 hover:bg-white/10"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="space-y-1 pr-10">
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
            Room created
          </p>
          <h2 className="text-xl font-semibold text-[#F3F3F3]">
            Share the invite and let the room fill up.
          </h2>
          <p className="text-sm leading-relaxed text-[#A3A3A3]">
            Send the room ID or copy the full link. The card stays within bounds on mobile.
          </p>
        </div>

        <div className="grid gap-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
            Room ID
          </p>
          <div className="flex items-center gap-2 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-[#E8E8E8]">
              {createdRoom.id}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(createdRoom.id)}
              className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
            Room link
          </p>
          <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
            <p className="break-all text-sm leading-relaxed text-[#CBCBCB]">
              {roomLink}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={async () => {
              await copyRoomLink(createdRoom.id, gameType);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Link copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
          >
            Enter later
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="relative flex w-full max-w-[520px] flex-col gap-5 p-5 md:p-6">
      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#CBCBCB] transition-colors hover:border-white/20 hover:bg-white/10"
        aria-label="Close"
      >
        ✕
      </button>

      <div className="space-y-1 pr-10">
        <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
          Private room
        </p>
        <h2 className="text-xl font-semibold text-[#F3F3F3]">
          Set the stake and the room size.
        </h2>
        <p className="text-sm leading-relaxed text-[#A3A3A3]">
          Pick a ticket price and minimum players, then create the invite in one step.
        </p>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[#E8E8E8]">Price per ticket</p>
          <div className="flex items-center gap-2">
            {availableTokens.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedToken(t);
                  setSelectedPrice(null);
                  setCustomPrice("");
                }}
                className={`rounded border px-2 py-1 text-xs font-semibold uppercase transition-colors ${
                  selectedToken === t
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-transparent text-[#8A8A8A] hover:text-[#CBCBCB]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {currentPresets.map((val) => {
            const active = selectedPrice === val && !customPrice;
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setSelectedPrice(val);
                  setCustomPrice("");
                }}
                className={`h-11 rounded-2xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${active ? "border-white bg-white text-black" : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"}`}
              >
                {TOKEN_SYMBOLS[selectedToken]}
                {val}
              </button>
            );
          })}
          <input
            type="number"
            inputMode="decimal"
            placeholder="Custom"
            value={customPrice}
            onChange={(e) => {
              setCustomPrice(e.target.value);
              setSelectedPrice(null);
            }}
            className="h-11 rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-[#CBCBCB] outline-none placeholder:text-[#555] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[#E8E8E8]">Minimum players</p>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">
            <Users className="h-3.5 w-3.5" /> Invite size
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLAYER_OPTIONS.map((count) => {
            const active = selectedPlayers === count && !customPlayers;
            return (
              <button
                key={count}
                type="button"
                onClick={() => {
                  setSelectedPlayers(count);
                  setCustomPlayers("");
                }}
                className={`h-11 rounded-2xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${active ? "border-white bg-white text-black" : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"}`}
              >
                {count}
              </button>
            );
          })}
          <input
            type="number"
            inputMode="numeric"
            placeholder="Custom"
            value={customPlayers}
            onChange={(e) => {
              setCustomPlayers(e.target.value);
              setSelectedPlayers(null);
            }}
            className="h-11 rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-[#CBCBCB] outline-none placeholder:text-[#555] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={!canCreate}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${canCreate ? "bg-white text-black hover:bg-[#F5F5F5]" : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"}`}
        >
          {!isAuthenticated ? "Sign in to create" : isCreating ? "Creating..." : "Create room"}
        </button>
        <button
          type="button"
          onClick={toggle}
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </SurfaceCard>
  );
};
