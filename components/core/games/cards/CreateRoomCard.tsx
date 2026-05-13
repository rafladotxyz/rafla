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

// ─── Overlay wrapper ─────────────────────────────────────────────────────────

export const CreateRoom = ({
  toggle,
  gameType = "draw",
}: {
  toggle?: () => void;
  gameType?: GameType;
}) => {
  return (
    <div className="fixed inset-0 z-[999] backdrop-blur-sm flex items-center justify-center">
      <CreateRoomCard toggle={toggle} gameType={gameType} />
    </div>
  );
};

// ─── Card ────────────────────────────────────────────────────────────────────

const CreateRoomCard = ({
  toggle,
  gameType = "draw",
}: {
  toggle?: () => void;
  gameType?: GameType;
}) => {
  const { isAuthenticated, signIn } = useAuthContext();
  const { createRoom, copyRoomLink, createdRoom, isCreating, error } =
    useRoom();

  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [customPlayers, setCustomPlayers] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"form" | "share">("form");

  const effectivePrice = customPrice ? Number(customPrice) : selectedPrice;
  const effectivePlayers = customPlayers ? Number(customPlayers) : selectedPlayers;

  const canCreate =
    effectivePrice !== null && 
    effectivePrice > 0 &&
    effectivePlayers !== null && 
    effectivePlayers >= 2 &&
    !isCreating;

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

  const handleCopy = async () => {
    if (!createdRoom) return;
    await copyRoomLink(createdRoom.id, gameType);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roomLink = createdRoom
    ? `${typeof window !== "undefined" ? window.location.origin : "https://rafla.xyz"}/${gameType}/${createdRoom.id}`
    : "";

  // ── Share view ───────────────────────────────────────────────────────────

  if (view === "share" && createdRoom) {
    return (
      <div className="relative flex flex-col w-[345px] rounded-3xl bg-[#141414] border-[1.5px] border-[#282828] p-5 gap-5">
        {/* Close */}
        <button
          onClick={toggle}
          className="absolute top-4 right-4 text-[#737373] hover:text-[#CBCBCB] transition-colors text-lg leading-none"
        >
          ✕
        </button>

        <div className="flex flex-col gap-1">
          <p className="text-[16px] font-semibold text-[#D9D9D9]">
            Room created! 🎉
          </p>
          <p className="text-[14px] text-[#737373]">
            Share the link or room ID with friends
          </p>
        </div>

        {/* Room ID */}
        <div className="flex flex-col gap-2">
          <p className="text-[12px] text-[#737373] uppercase tracking-wider">
            Room ID
          </p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#282828]">
            <span className="flex-1 text-[13px] text-[#CBCBCB] font-mono truncate">
              {createdRoom.id}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdRoom.id);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-[12px] text-[#737373] hover:text-[#CBCBCB] transition-colors shrink-0"
            >
              {copied ? "Copied!" : "Copy ID"}
            </button>
          </div>
        </div>

        {/* Room link */}
        <div className="flex flex-col gap-2">
          <p className="text-[12px] text-[#737373] uppercase tracking-wider">
            Room Link
          </p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#282828]">
            <span className="flex-1 text-[13px] text-[#CBCBCB] truncate">
              {roomLink}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 h-11 rounded-xl bg-white text-[#0A0A0A] text-[14px] font-medium hover:bg-[#E8E8E8] transition-colors"
          >
            {copied ? "Link Copied!" : "Copy Link"}
          </button>
          <button
            onClick={toggle}
            className="flex-1 h-11 rounded-xl border border-[#282828] text-[#CBCBCB] text-[14px] font-medium hover:border-[#444] transition-colors"
          >
            Done
          </button>
        </div>

        {/* Stake info */}
        <div className="flex justify-between text-[12px] text-[#737373] border-t border-[#282828] pt-3">
          <span>Stake per player</span>
          <span className="text-[#CBCBCB]">${effectivePrice} USDC</span>
        </div>
      </div>
    );
  }

  // ── Form view ────────────────────────────────────────────────────────────

  return (
    <div className="relative flex flex-col w-[345px] rounded-3xl bg-[#141414] border-[1.5px] border-[#282828] p-5 gap-5">
      {/* Close */}
      <button
        onClick={toggle}
        className="absolute top-4 right-4 text-[#737373] hover:text-[#CBCBCB] transition-colors text-lg leading-none"
      >
        ✕
      </button>

      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-semibold text-[#D9D9D9]">
          Create Private Room
        </p>
        <p className="text-[14px] text-[#737373]">
          Create a private room, play with friends
        </p>
      </div>

      {/* Price per ticket */}
      <div className="flex flex-col gap-2">
        <p className="text-[14px] text-[#CBCBCB]">Price per ticket</p>
        <div className="flex flex-wrap gap-2">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                setSelectedPrice(opt.value);
                setCustomPrice("");
              }}
              className={`flex-1 min-w-[60px] h-9 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
                selectedPrice === opt.value
                  ? "border-[#CBCBCB] bg-[#1f1f1f]"
                  : "border-[#282828] bg-[#0A0A0A]"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <div className="flex-1 min-w-[100px] relative">
            <input
              type="number"
              placeholder="Custom"
              value={customPrice}
              onChange={(e) => {
                setCustomPrice(e.target.value);
                setSelectedPrice(null);
              }}
              className={`w-full h-9 px-3 rounded-lg border text-[14px] text-[#CBCBCB] bg-[#0A0A0A] outline-none transition-colors placeholder-[#444] ${
                customPrice ? "border-[#CBCBCB]" : "border-[#282828]"
              }`}
            />
            {customPrice && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#737373]">USDC</span>
            )}
          </div>
        </div>
      </div>

      {/* Minimum players */}
      <div className="flex flex-col gap-2">
        <p className="text-[14px] text-[#CBCBCB]">Minimum number of players</p>
        <div className="flex flex-wrap gap-2">
          {PLAYER_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => {
                setSelectedPlayers(count);
                setCustomPlayers("");
              }}
              className={`flex-1 min-w-[60px] h-9 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
                selectedPlayers === count
                  ? "border-[#CBCBCB] bg-[#1f1f1f]"
                  : "border-[#282828] bg-[#0A0A0A]"
              }`}
            >
              {count}
            </button>
          ))}
          <div className="flex-1 min-w-[100px]">
            <input
              type="number"
              placeholder="Custom"
              value={customPlayers}
              onChange={(e) => {
                setCustomPlayers(e.target.value);
                setSelectedPlayers(null);
              }}
              className={`w-full h-9 px-3 rounded-lg border text-[14px] text-[#CBCBCB] bg-[#0A0A0A] outline-none transition-colors placeholder-[#444] ${
                customPlayers ? "border-[#CBCBCB]" : "border-[#282828]"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-[12px] text-red-400 -mt-2">{error}</p>}

      {/* CTA */}
      <button
        onClick={handleCreate}
        disabled={!canCreate}
        className={`w-full h-11 rounded-xl text-[14px] font-medium transition-colors ${
          canCreate
            ? "bg-white text-[#0A0A0A] cursor-pointer hover:bg-[#E8E8E8]"
            : "bg-[#1A1A1A] text-[#4a4a4a] cursor-not-allowed"
        }`}
      >
        {!isAuthenticated
          ? "Sign in to Create Room"
          : isCreating
            ? "Creating..."
            : "Create Private Room"}
      </button>
    </div>
  );
};
