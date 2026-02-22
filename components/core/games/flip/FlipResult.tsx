import Group from "@/components/base/Group";
import Image from "next/image";
type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";
type ViewState = "select" | "flipping" | "result";

import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";

export const FlipResultCard = ({
  result,
  landedSide,
  amount,
  onFlipAgain,
  onShare,
}: {
  result: FlipResult;
  landedSide: CoinSide;
  amount: string;
  onFlipAgain: () => void;
  onShare: () => void;
}) => {
  const isWin = result === "win";
  const winAmount = `$${parseInt(amount.replace("$", "")) * 2}.00`;
  const lossAmount = amount.replace("$", "$") + ".00";
  const isHeads = landedSide === "heads";

  return (
    <div className="relative w-[414px] bg-[#141414] flex flex-col items-center border-[1.5px] border-[#282828] rounded-3xl overflow-hidden px-6 pb-8 pt-8">
      {/* Background texture */}
      <div className="absolute top-0 left-0 w-full h-48 pointer-events-none">
        <Group className="w-full h-full" />
      </div>

      {/* Coin image */}
      <div className="z-10 mb-6">
        <Image
          src={isHeads ? head : tail}
          height={100}
          width={90}
          alt={landedSide}
          className="drop-shadow-xl"
        />
      </div>

      {/* Result text */}
      <div className="flex flex-col items-center gap-1 mb-8 z-10">
        <p className="text-[40px] font-semibold leading-tight text-[#737373]">
          {isWin ? "You won" : "You lost"}
        </p>
        <p
          className={`text-[48px] font-bold leading-tight ${
            isWin ? "text-[#1C9DF7]" : "text-[#DF1C41]"
          }`}
        >
          {isWin ? `+${winAmount}` : `-${lossAmount}`}
        </p>
        <p className="text-[13px] text-[#737373] mt-1 capitalize">
          It was {landedSide}
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full flex flex-col gap-3 z-10">
        <button
          onClick={onFlipAgain}
          className="w-full h-11 rounded-xl bg-white text-black text-sm font-medium flex items-center justify-center"
        >
          Flip Again
        </button>
        <button
          onClick={onShare}
          className="w-full h-11 rounded-xl border border-[#282828] text-white text-sm font-medium flex items-center justify-center"
        >
          Share
        </button>
      </div>
    </div>
  );
};
