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
    // glow accent behind the illustration
    glow: string;
  }
> = {
  win: {
    image: Win,
    heading: "You won",
    amountColor: "text-[#1C9DF7]",
    amountPrefix: "+",
    buttonLabel: "Spin again",
    subLabel: "Payout",
    glow: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(28,157,247,0.18) 0%, transparent 70%)",
  },
  loss: {
    image: Loss,
    heading: "You lost",
    amountColor: "text-[#DF1C41]",
    amountPrefix: "-",
    buttonLabel: "Spin again",
    subLabel: "Staked",
    glow: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(223,28,65,0.14) 0%, transparent 70%)",
  },
  breakeven: {
    image: Breakeven,
    heading: "Breakeven",
    amountColor: "text-[#F5A623]",
    amountPrefix: "",
    buttonLabel: "Spin again",
    subLabel: "Returned",
    glow: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,166,35,0.15) 0%, transparent 70%)",
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
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .spin-result-enter {
          animation: spinResultIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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
    <SurfaceCard className="spin-result-enter w-full max-w-[480px] p-3 sm:p-4">
      <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/25 px-5 pb-6 pt-5 sm:px-6 sm:pt-6">

        {/* Decorative background elements */}
        <div className="absolute inset-x-0 top-0 h-48 pointer-events-none">
          <Group className="w-full h-full" />
        </div>
        {/* Per-result colour glow */}
        <div
          className="absolute inset-x-0 top-0 h-56 pointer-events-none"
          style={{ background: config.glow }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">

          {/* ── Illustration ──────────────────────────────────────────────── */}
          {/* Fixed bounding box so all three SVGs sit at the same visual height.
              object-contain keeps aspect ratio intact (critical for the square eq.svg). */}
          <div className="mb-4 flex h-[136px] w-[108px] items-end justify-center">
            <Image
              src={config.image}
              alt={config.heading}
              width={108}
              height={136}
              className="h-full w-full object-contain object-bottom drop-shadow-xl"
            />
          </div>

          {/* ── Text ─────────────────────────────────────────────────────── */}
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

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <div className="mt-6 grid w-full gap-2.5 sm:grid-cols-2">
            <button
              onClick={handleClick}
              className="h-12 rounded-2xl bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F0F0F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {config.buttonLabel}
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
  );
};

export default SWinOrLoss;
