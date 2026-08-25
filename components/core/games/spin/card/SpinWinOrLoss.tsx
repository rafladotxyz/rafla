"use client";

import Image from "next/image";
import Win from "@/assets/won.svg";
import Loss from "@/assets/loss.svg";
import Breakeven from "@/assets/eq.svg";
import { RevealStage } from "../../RevealStage";

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
  canRebet?: boolean;
  onRebet?: () => void;
  onChangeStake?: () => void;
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
    subLabel: string;
  }
> = {
  win: {
    image: Win,
    heading: "You won",
    amountColor: "text-[#1C9DF7]",
    amountPrefix: "+",
    subLabel: "Payout",
  },
  loss: {
    image: Loss,
    heading: "You lost",
    amountColor: "text-[#DF1C41]",
    amountPrefix: "-",
    subLabel: "Staked",
  },
  breakeven: {
    image: Breakeven,
    heading: "Breakeven",
    amountColor: "text-[#F5A623]",
    amountPrefix: "",
    subLabel: "Returned",
  },
};

export const SWinOrLoss = ({
  handleClick,
  onShare,
  segment,
  amount = "—",
  stakeAmount,
  canRebet = false,
  onRebet,
  onChangeStake,
}: WinOrLossProps) => {
  return (
    <RevealStage label="Spin result" onClose={handleClick}>
      <WinOrLossCard
        handleClick={handleClick}
        onShare={onShare}
        segment={segment}
        amount={amount}
        stakeAmount={stakeAmount}
        canRebet={canRebet}
        onRebet={onRebet}
        onChangeStake={onChangeStake}
      />
    </RevealStage>
  );
};

const WinOrLossCard = ({
  handleClick,
  onShare,
  segment,
  amount = "—",
  stakeAmount,
  canRebet,
  onRebet,
  onChangeStake,
}: WinOrLossProps) => {
  const result = getResultState(segment);
  const config = RESULT_CONFIG[result];

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/25 px-5 pb-6 pt-5 sm:px-6 sm:pt-6">
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Fixed bounding box so all three SVGs sit at the same visual height.
            object-contain keeps aspect ratio intact (critical for the square eq.svg). */}
        <div className="mb-4 flex h-[136px] w-[108px] items-end justify-center">
          <Image
            src={config.image}
            alt={config.heading}
            width={108}
            height={136}
            className="h-full w-full object-contain object-bottom"
          />
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <p className="text-[15px] font-medium uppercase tracking-[0.22em] text-[#737373]">
            {config.heading}
          </p>
          <p className={`text-[42px] font-bold leading-tight sm:text-[52px] ${config.amountColor}`}>
            {config.amountPrefix}{amount}
          </p>

          {result === "breakeven" ? (
            <p className="mt-1 text-[13px] text-[#737373]">
              Your entry has been refunded
            </p>
          ) : stakeAmount ? (
            <p className="mt-1 text-[13px] text-[#737373]">
              {config.subLabel}&nbsp;&middot;&nbsp;Staked {stakeAmount}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid w-full gap-2.5">
          {canRebet && onRebet ? (
            <button
              type="button"
              onClick={onRebet}
              className="focus-ring h-12 rounded-full bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:scale-[0.98]"
            >
              Run it back · {stakeAmount ?? "same stake"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClick}
              className="focus-ring h-12 rounded-full bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:scale-[0.98]"
            >
              Spin again
            </button>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            {onChangeStake ? (
              <button
                type="button"
                onClick={onChangeStake}
                className="focus-ring h-12 rounded-full border border-white/10 bg-white/[0.05] text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.10]"
              >
                Change stake
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onShare(amount, result)}
              className="focus-ring h-12 rounded-full border border-white/10 bg-white/[0.05] text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.10]"
            >
              Share result
            </button>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="focus-ring mx-auto mt-1 rounded-full px-3 py-1 text-xs font-medium text-[#8A8A8A] transition-colors hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SWinOrLoss;
