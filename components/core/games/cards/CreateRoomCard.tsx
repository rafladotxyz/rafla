"use client";
import { useState } from "react";

export const CreateRoom = ({ toggle }: { toggle?: () => void }) => {
  return (
    <div className="fixed inset-0 z-[999] backdrop-blur-sm flex items-center justify-center">
      <CreateRoomCard toggle={toggle} />
    </div>
  );
};

const PRICE_OPTIONS = ["$1", "$2", "$3", "$5"];
const PLAYER_OPTIONS = [2, 4, 6, 8];

const CreateRoomCard = ({ toggle }: { toggle?: () => void }) => {
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);

  const canCreate = selectedPrice !== null && selectedPlayers !== null;

  return (
    <div className="relative flex flex-col w-[345px] rounded-3xl bg-[#141414] border-[1.5px] border-[#282828] p-5 gap-5">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-semibold text-[#D9D9D9]">
          Create Private room
        </p>
        <p className="text-[14px] text-[#737373]">
          Create a private room, play with friends
        </p>
      </div>

      {/* Price per ticket */}
      <div className="flex flex-col gap-2">
        <p className="text-[16px] text-[#CBCBCB]">Price per ticket</p>
        <div className="flex gap-2">
          {PRICE_OPTIONS.map((price) => (
            <button
              key={price}
              onClick={() => setSelectedPrice(price)}
              className={`flex-1 h-9 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
                selectedPrice === price
                  ? "border-[#CBCBCB] bg-[#1f1f1f]"
                  : "border-[#282828] bg-[#0A0A0A]"
              }`}
            >
              {price}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum number of players */}
      <div className="flex flex-col gap-2">
        <p className="text-[16px] text-[#CBCBCB]">Minimum Number of players</p>
        <div className="flex gap-2">
          {PLAYER_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => setSelectedPlayers(count)}
              className={`flex-1 h-9 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
                selectedPlayers === count
                  ? "border-[#CBCBCB] bg-[#1f1f1f]"
                  : "border-[#282828] bg-[#0A0A0A]"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={canCreate ? toggle : undefined}
        disabled={!canCreate}
        className={`w-full h-11 rounded-xl text-[14px] font-medium transition-colors ${
          canCreate
            ? "bg-white text-[#0A0A0A] cursor-pointer"
            : "bg-[#1A1A1A] text-[#4a4a4a] cursor-not-allowed"
        }`}
      >
        Create Private Room
      </button>
    </div>
  );
};
