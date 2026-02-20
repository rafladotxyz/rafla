"use client";
import Image from "next/image";
import { useState } from "react";
import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";

const PRICE_OPTIONS = ["$1", "$2", "$3", "$5"];

type CoinSide = "heads" | "tails";

export const FlipCard = ({
  onFlip,
}: {
  onFlip?: (side: CoinSide, amount: string) => void;
}) => {
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const canFlip = selectedSide !== null && selectedPrice !== null;

  const winValue = selectedPrice
    ? `$${parseInt(selectedPrice.replace("$", "")) * 2}`
    : "$10";

  return (
    <div className="flex flex-col backdrop-blur-md rounded-xl border border-[#141414] gap-3 w-101.25">
      {/* Title */}
      <p className="text-[16px] font-semibold text-[#D9D9D9]">Make your Call</p>

      {/* HEADS / TAILS row */}
      <div className="flex gap-2">
        {/* HEADS */}
        <button
          onClick={() => setSelectedSide("heads")}
          className={`flex-1 flex flex-col items-start rounded-2xl border p-4 gap-2 transition-colors ${
            selectedSide === "heads"
              ? "bg-[#0A0A0A] border-[#CBCBCB]"
              : "bg-[#0A0A0A] border-[#141414]"
          }`}
        >
          <div className="h-[79px] flex items-center">
            <Image src={head} height={79} width={64} alt="heads" />
          </div>
          <p className="text-[14px] text-[#CBCBCB]">HEADS</p>
        </button>

        {/* TAILS */}
        <button
          onClick={() => setSelectedSide("tails")}
          className={`flex-1 flex flex-col items-start rounded-2xl border p-4 gap-2 transition-colors ${
            selectedSide === "tails"
              ? "bg-[#0A0A0A] border-[#CBCBCB]"
              : "bg-[#0A0A0A] border-[#141414]"
          }`}
        >
          <div className="h-[79px] flex items-center">
            <Image src={tail} height={79} width={64} alt="tails" />
          </div>
          <p className="text-[14px] text-[#CBCBCB]">TAILS</p>
        </button>
      </div>

      {/* Price selector */}
      <div className="flex gap-2">
        {PRICE_OPTIONS.map((price) => (
          <button
            key={price}
            onClick={() => setSelectedPrice(price)}
            className={`flex-1 h-10 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
              selectedPrice === price
                ? "border-[#CBCBCB] bg-[#1f1f1f]"
                : "border-[#282828] bg-[#0A0A0A]"
            }`}
          >
            {price}
          </button>
        ))}
      </div>

      {/* Flip CTA */}
      <button
        disabled={!canFlip}
        onClick={() => canFlip && onFlip?.(selectedSide!, selectedPrice!)}
        className={`w-full h-12 rounded-2xl text-[15px] font-medium transition-colors ${
          canFlip
            ? "bg-white text-[#0A0A0A] cursor-pointer"
            : "bg-[#1A1A1A] text-[#4a4a4a] cursor-not-allowed"
        }`}
      >
        {canFlip
          ? `Flip ${selectedPrice} to Win ${winValue}`
          : "Flip $5 to Win $10"}
      </button>
    </div>
  );
};
