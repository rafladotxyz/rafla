"use client";
import Group from "@/components/base/Group";
import Image from "next/image";
import Win from "@/assets/won.svg";
import Loss from "@/assets/loss.svg";

interface WinOrLossProps {
  handleClick: () => void;
  isWin?: boolean;
  amount?: string;
  winnerAddress?: string;
}

export const WinOrLoss = ({
  handleClick,
  isWin = true,
  amount = "$109.25",
  winnerAddress = "0x9i0j...1k21",
}: WinOrLossProps) => {
  return (
    <div className="fixed inset-0 z-999 backdrop-blur-sm flex items-center justify-center">
      <WinOrLossCard
        handleClick={handleClick}
        isWin={isWin}
        amount={amount}
        winnerAddress={winnerAddress}
      />
    </div>
  );
};

const WinOrLossCard = ({
  handleClick,
  isWin,
  amount,
  winnerAddress,
}: WinOrLossProps) => {
  return (
    <div className="relative w-103.5 bg-[#0A0A0A] flex flex-col items-center border-[1.5px] border-[#282828] rounded-3xl overflow-hidden px-6 pb-8 pt-0">
      {/* Background texture — relative to card, not fixed */}

      {/* Texture sits on top of a dark bg in the top section only */}
      <div className="absolute top-0 left-0 w-full h-44">
        <Group className="w-full h-full" /> {/* no z-index fighting */}
      </div>
      {/* Trophy / loss icon */}
      <div className="mt-8 mb-6">
        <Image
          src={isWin ? Win : Loss}
          height={149}
          width={94}
          alt={isWin ? "You won" : "You lost"}
        />
      </div>

      {/* Text section */}
      <div className="flex flex-col items-center gap-1 mb-8">
        <p className="text-[48px] font-semibold leading-tight text-[#737373]">
          {isWin ? "You won" : "You Lost"}
        </p>
        <p
          className={`text-[48px] font-bold leading-tight ${
            isWin ? "text-[#1C9DF7]" : "text-[#DF1C41]"
          }`}
        >
          {isWin ? `+${amount}` : `-${amount}`}
        </p>
        <p className="text-[13px] text-[#737373] mt-1">
          Winner: {winnerAddress}
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleClick}
          className="w-full h-11 rounded-xl bg-white text-black text-sm font-medium flex items-center justify-center"
        >
          Enter {isWin ? "another" : "next"} draw
        </button>
        <button className="w-full h-11 rounded-xl border border-[#282828] text-white text-sm font-medium flex items-center justify-center backdrop-blur-lg">
          Share
        </button>
      </div>
    </div>
  );
};

export default WinOrLoss;
