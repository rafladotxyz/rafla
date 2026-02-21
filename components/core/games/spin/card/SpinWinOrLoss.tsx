"use client";
import Group from "@/components/base/Group";
import Image from "next/image";
import Win from "@/assets/won.svg";
import Loss from "@/assets/loss.svg";
import Breakeven from "@/assets/eq.svg";

type Segment = {
  label: string;
  asset: string;
  color: string;
};

type ResultState = "win" | "loss" | "breakeven";

interface WinOrLossProps {
  handleClick: () => void;
  onShare?: () => void; // ✅ new prop
  segment?: Segment;
  amount?: string;
  winnerAddress?: string;
}

const getResultState = (segment?: Segment): ResultState => {
  if (!segment) return "loss";
  if (segment.label === "Yaay $2 won!") return "win";
  if (segment.label === "Breakeven!") return "breakeven";
  return "loss";
};

const RESULT_CONFIG: Record<
  ResultState,
  {
    image: string;
    heading: string;
    amountColor: string;
    amountPrefix: string;
    buttonLabel: string;
  }
> = {
  win: {
    image: Win,
    heading: "You Won",
    amountColor: "text-[#1C9DF7]",
    amountPrefix: "+",
    buttonLabel: "Spin Again",
  },
  loss: {
    image: Loss,
    heading: "You Lost",
    amountColor: "text-[#DF1C41]",
    amountPrefix: "-",
    buttonLabel: "Spin Again",
  },
  breakeven: {
    image: Breakeven,
    heading: "Breakeven",
    amountColor: "text-[#F5A623]",
    amountPrefix: "",
    buttonLabel: "Spin Again",
  },
};

export const SWinOrLoss = ({
  handleClick,
  onShare,
  segment,
  amount = "$2.00",
  winnerAddress = "0x9i0j...1k21",
}: WinOrLossProps) => {
  return (
    <div className="fixed inset-0 z-999 backdrop-blur-sm flex items-center justify-center">
      <WinOrLossCard
        handleClick={handleClick}
        onShare={onShare}
        segment={segment}
        amount={amount}
        winnerAddress={winnerAddress}
      />
    </div>
  );
};

const WinOrLossCard = ({
  handleClick,
  onShare,
  segment,
  amount,
  winnerAddress,
}: WinOrLossProps) => {
  const result = getResultState(segment);
  const config = RESULT_CONFIG[result];

  return (
    <div className="relative w-103.5 bg-[#0A0A0A] flex flex-col items-center border-[1.5px] border-[#282828] rounded-3xl overflow-hidden px-6 pb-8 pt-0">
      {/* Background texture */}
      <div className="absolute top-0 left-0 w-full h-44">
        <Group className="w-full h-full" />
      </div>

      {/* Result icon */}
      <div className="mt-8 mb-6 z-10">
        <Image
          src={config.image}
          height={149}
          width={94}
          alt={config.heading}
        />
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1 mb-8 z-10">
        <p className="text-[48px] font-semibold leading-tight text-[#737373]">
          {config.heading}
        </p>
        <p
          className={`text-[48px] font-bold leading-tight ${config.amountColor}`}
        >
          {config.amountPrefix}
          {amount}
        </p>
        {result !== "breakeven" ? (
          <p className="text-[13px] text-[#737373] mt-1">
            Winner: {winnerAddress}
          </p>
        ) : (
          <p className="text-[13px] text-[#737373] mt-1">
            Your entry has been refunded
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="w-full flex flex-col gap-3 z-10">
        <button
          onClick={handleClick}
          className="w-full h-11 rounded-xl bg-white text-black text-sm font-medium flex items-center justify-center"
        >
          {config.buttonLabel}
        </button>
        {/* ✅ Share button now calls onShare */}
        <button
          onClick={onShare}
          className="w-full h-11 rounded-xl border border-[#282828] text-white text-sm font-medium flex items-center justify-center backdrop-blur-lg"
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default SWinOrLoss;
