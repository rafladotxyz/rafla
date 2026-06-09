"use client";
import Group from "@/components/base/Group";
import Image from "next/image";
import Win from "@/assets/won.svg";
import Loss from "@/assets/loss.svg";
import Breakeven from "@/assets/eq.svg";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

type Segment = {
  label: string;
  asset: string;
  color: string;
};

type ResultState = "win" | "loss" | "breakeven";

interface WinOrLossProps {
  handleClick: () => void;
  onShare: (amount: string, result: ResultState) => void;
  segment?: Segment;
  amount?: string;
  stakeAmount?: string;
  winnerAddress?: string;
}

const getResultState = (segment?: Segment): ResultState => {
  if (!segment) return "loss";
  const label = segment.label.toLowerCase();
  if (label.includes("won") || label.includes("win")) return "win";
  if (label.includes("breakeven")) return "breakeven";
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
    subLabel: string;
  }
> = {
  win: {
    image: Win,
    heading: "You won",
    amountColor: "text-[#1C9DF7]",
    amountPrefix: "+",
    buttonLabel: "Spin again",
    subLabel: "Payout",
  },
  loss: {
    image: Loss,
    heading: "You lost",
    amountColor: "text-[#DF1C41]",
    amountPrefix: "-",
    buttonLabel: "Spin again",
    subLabel: "Staked",
  },
  breakeven: {
    image: Breakeven,
    heading: "Breakeven",
    amountColor: "text-[#F5A623]",
    amountPrefix: "",
    buttonLabel: "Spin again",
    subLabel: "Returned",
  },
};

export const SWinOrLoss = ({
  handleClick,
  onShare,
  segment,
  amount = "—",
  stakeAmount,
  winnerAddress = "0x9i0j...1k21",
}: WinOrLossProps) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-3 py-3 backdrop-blur-xl">
      <style>{`
        @keyframes spinResultIn {
          from { opacity: 0; transform: scale(0.94) translateY(14px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .spin-result-enter {
          animation: spinResultIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
      <WinOrLossCard
        handleClick={handleClick}
        onShare={onShare}
        segment={segment}
        amount={amount}
        stakeAmount={stakeAmount}
        winnerAddress={winnerAddress}
      />
    </div>
  );
};

const WinOrLossCard = ({
  handleClick,
  onShare,
  segment,
  amount = "—",
  stakeAmount,
}: WinOrLossProps) => {
  const result = getResultState(segment);
  const config = RESULT_CONFIG[result];

  return (
    <SurfaceCard className="spin-result-enter w-full max-w-[520px] p-4 sm:p-6">
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/20 px-5 pb-6 pt-7 sm:px-6">
        <div className="absolute inset-x-0 top-0 h-44 pointer-events-none">
          <Group className="w-full h-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-5">
            <Image src={config.image} height={149} width={94} alt={config.heading} />
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-4xl font-semibold leading-tight text-[#737373] sm:text-[48px]">
              {config.heading}
            </p>
            <p className={`text-4xl font-bold leading-tight sm:text-[48px] ${config.amountColor}`}>
              {config.amountPrefix}
              {amount}
            </p>

            {/* Contextual sub-label */}
            {result === "breakeven" ? (
              <p className="mt-1 text-[13px] text-[#737373]">
                Your entry has been refunded
              </p>
            ) : stakeAmount ? (
              <p className="mt-1 text-[13px] text-[#737373]">
                {config.subLabel} · Staked {stakeAmount}
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
            <button
              onClick={handleClick}
              className="h-12 rounded-2xl bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {config.buttonLabel}
            </button>
            <button
              onClick={() => onShare(amount, result)}
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

export default SWinOrLoss;
