import Group from "@/components/base/Group";
import Image from "next/image";
type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";

import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

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
  onShare: (amount: string, isWin: boolean) => void;
}) => {
  const isWin = result === "win";
  const winAmount = `$${parseInt(amount.replace("$", "")) * 2}.00`;
  const lossAmount = amount.replace("$", "") + ".00";
  const isHeads = landedSide === "heads";
  const displayAmount = isWin ? winAmount : lossAmount;

  return (
    <SurfaceCard className="w-full max-w-[520px] p-4 sm:p-6">
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/20 px-5 pb-6 pt-6 sm:px-6 sm:pt-7">
        <div className="absolute inset-x-0 top-0 h-44 pointer-events-none">
          <Group className="w-full h-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-5 sm:mb-6">
            <Image
              src={isHeads ? head : tail}
              height={100}
              width={90}
              alt={landedSide}
              className="drop-shadow-xl"
            />
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-4xl font-semibold leading-tight text-[#737373] sm:text-[48px]">
              {isWin ? "You won" : "You lost"}
            </p>
            <p
              className={`text-4xl font-bold leading-tight sm:text-[48px] ${
                isWin ? "text-[#1C9DF7]" : "text-[#DF1C41]"
              }`}
            >
              {isWin ? `+${winAmount}` : `-${lossAmount}`}
            </p>
            <p className="mt-1 text-[13px] capitalize text-[#737373]">
              It was {landedSide}
            </p>
          </div>

          <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
            <button
              onClick={onFlipAgain}
              className="h-12 rounded-2xl bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Flip again
            </button>
            <button
              onClick={() => onShare(displayAmount, isWin)}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
};
