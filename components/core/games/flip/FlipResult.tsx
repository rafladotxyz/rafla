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
  stakeAmount,
  onFlipAgain,
  onShare,
}: {
  result: FlipResult;
  landedSide: CoinSide;
  // headline figure: on-chain payout for win, stake for loss — already formatted
  amount: string;
  // what the user originally staked — shown as sub-label
  stakeAmount?: string;
  onFlipAgain: () => void;
  onShare: (amount: string, result: FlipResult) => void;
}) => {
  const isWin = result === "win";
  const isHeads = landedSide === "heads";

  const glowColor = isWin
    ? "rgba(28,157,247,0.18)"
    : "rgba(223,28,65,0.14)";

  return (
    <>
      <style>{`
        @keyframes flipResultIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .flip-result-enter {
          animation: flipResultIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
      <SurfaceCard className="flip-result-enter w-full max-w-[480px] p-3 sm:p-4">
        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/25 px-5 pb-6 pt-5 sm:px-6 sm:pt-6">
          <div className="absolute inset-x-0 top-0 h-48 pointer-events-none">
            <Group className="w-full h-full" />
          </div>
          <div
            className="absolute inset-x-0 top-0 h-56 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${glowColor} 0%, transparent 70%)` }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Fixed bounding box — both head and tail SVGs render at the same visual height */}
            <div className="mb-4 flex h-[120px] w-[108px] items-end justify-center">
              <Image
                src={isHeads ? head : tail}
                height={120}
                width={108}
                alt={landedSide}
                className="h-full w-full object-contain object-bottom drop-shadow-xl"
              />
            </div>

            <div className="flex flex-col items-center gap-0.5 text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.22em] text-[#737373]">
                {isWin ? "You won" : "You lost"}
              </p>
              <p
                className={`text-[42px] font-bold leading-tight sm:text-[52px] ${
                  isWin ? "text-[#1C9DF7]" : "text-[#DF1C41]"
                }`}
              >
                {isWin ? `+${amount}` : `-${amount}`}
              </p>
              {stakeAmount ? (
                <p className="mt-1 text-[13px] capitalize text-[#737373]">
                  It was {landedSide}&nbsp;&middot;&nbsp;Staked {stakeAmount}
                </p>
              ) : (
                <p className="mt-1 text-[13px] capitalize text-[#737373]">
                  It was {landedSide}
                </p>
              )}
            </div>

            <div className="mt-6 grid w-full gap-2.5 sm:grid-cols-2">
              <button
                onClick={onFlipAgain}
                className="h-12 rounded-2xl bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F0F0F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Flip again
              </button>
              <button
                onClick={() => onShare(amount, result)}
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Share result
              </button>
            </div>
          </div>
        </div>
      </SurfaceCard>
    </>
  );
};
