"use client";

import { useState } from "react";
import { useRoom } from "@/hooks/useRoom";
import { useAuthContext } from "@/context/AuthContext";

const PRICE_OPTIONS = [
  { label: "$1", value: 1 },
  { label: "$2", value: 2 },
  { label: "$3", value: 3 },
  { label: "$5", value: 5 },
];
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-sm p-4">
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

  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [customPlayers, setCustomPlayers] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"form" | "share">("form");

  const effectivePrice = customPrice ? Number(customPrice) : selectedPrice;
  const effectivePlayers = customPlayers ? Number(customPlayers) : selectedPlayers;
  const canCreate = !!effectivePrice && !!effectivePlayers && !isCreating;

  const handleCreate = async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    if (!effectivePrice || !effectivePlayers) return;

    const room = await createRoom({
      gameType,
      stakeAmountDollars: effectivePrice,
      minPlayers: effectivePlayers,
    });

    if (room) setView("share");
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roomLink = createdRoom
    ? `${typeof window !== "undefined" ? window.location.origin : "https://rafla.xyz"}/${gameType}/${createdRoom.id}`
    : "";

  if (view === "share" && createdRoom) {
    return (
      <div className="relative flex w-full max-w-[420px] flex-col gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
        <button onClick={toggle} className="absolute right-4 top-4 text-[#8A8A8A] transition-colors hover:text-white">✕</button>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium text-[#F3F3F3]">Room created! 🎉</p>
          <p className="text-sm text-[#A3A3A3]">Share the link or room ID with friends.</p>
        </div>

        <div className="grid gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#737373]">Room ID</p>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-[#E8E8E8]">{createdRoom.id}</span>
            <button onClick={() => handleCopy(createdRoom.id)} className="text-xs text-[#9A9A9A] hover:text-white transition-colors">{copied ? "Copied!" : "Copy"}</button>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#737373]">Room Link</p>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <span className="block truncate text-sm text-[#CBCBCB]">{roomLink}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              await copyRoomLink(createdRoom.id, gameType);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex-1 h-12 rounded-full bg-white text-black text-sm font-medium hover:bg-[#F5F5F5] transition-colors"
          >
            {copied ? "Link Copied!" : "Copy Link"}
          </button>
          <button onClick={toggle} className="flex-1 h-12 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-[#E8E8E8] hover:bg-white/10 hover:text-white transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full max-w-[420px] flex-col gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
      <button onClick={toggle} className="absolute right-4 top-4 text-[#8A8A8A] transition-colors hover:text-white">✕</button>

      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium text-[#F3F3F3]">Create Private Room</p>
        <p className="text-sm text-[#A3A3A3]">Set your stake and the minimum players required to unlock it.</p>
      </div>

      <div className="grid gap-2">
        <p className="text-sm text-[#CBCBCB]">Price per ticket</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                setSelectedPrice(opt.value);
                setCustomPrice("");
              }}
              className={`h-11 rounded-2xl border text-sm transition-colors ${selectedPrice === opt.value ? "border-white bg-white text-black" : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"}`}
            >
              {opt.label}
            </button>
          ))}
          <input
            type="number"
            placeholder="Custom"
            value={customPrice}
            onChange={(e) => {
              setCustomPrice(e.target.value);
              setSelectedPrice(null);
            }}
            className={`h-11 rounded-2xl border bg-black/20 px-3 text-sm text-[#CBCBCB] outline-none placeholder:text-[#444] ${customPrice ? "border-white" : "border-white/10"}`}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm text-[#CBCBCB]">Minimum players</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLAYER_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => {
                setSelectedPlayers(count);
                setCustomPlayers("");
              }}
              className={`h-11 rounded-2xl border text-sm transition-colors ${selectedPlayers === count ? "border-white bg-white text-black" : "border-white/10 bg-black/20 text-[#CBCBCB] hover:bg-white/5"}`}
            >
              {count}
            </button>
          ))}
          <input
            type="number"
            placeholder="Custom"
            value={customPlayers}
            onChange={(e) => {
              setCustomPlayers(e.target.value);
              setSelectedPlayers(null);
            }}
            className={`h-11 rounded-2xl border bg-black/20 px-3 text-sm text-[#CBCBCB] outline-none placeholder:text-[#444] ${customPlayers ? "border-white" : "border-white/10"}`}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleCreate}
        disabled={!canCreate}
        className={`h-12 rounded-full text-sm font-medium transition-colors ${canCreate ? "bg-white text-black hover:bg-[#F5F5F5]" : "cursor-not-allowed bg-white/5 text-[#4a4a4a]"}`}
      >
        {!isAuthenticated ? "Sign in to Create Room" : isCreating ? "Creating..." : "Create Private Room"}
      </button>
    </div>
  );
};
