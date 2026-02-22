import Image from "next/image";
import { useState } from "react";
import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";

type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";
type ViewState = "select" | "flipping" | "result";

const PRICE_OPTIONS = ["$1", "$2", "$3", "$5"];
const FLIP_DURATION = 2500; // ms

export const FlipCard = ({
  onFlip,
}: {
  onFlip: (side: CoinSide, amount: string) => void;
}) => {
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const canFlip = selectedSide !== null && selectedPrice !== null;
  const winValue = selectedPrice
    ? `$${parseInt(selectedPrice.replace("$", "")) * 2}`
    : "$10";

  return (
    <div className="flex flex-col gap-3 w-[405px]">
      <p className="text-[16px] font-semibold text-[#D9D9D9]">Make your Call</p>

      <div className="flex gap-2">
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

      <button
        disabled={!canFlip}
        onClick={() => canFlip && onFlip(selectedSide!, selectedPrice!)}
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
