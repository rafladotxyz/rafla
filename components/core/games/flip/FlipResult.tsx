import Image from "next/image";
import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";

type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";

export const FlipResultCard = ({
  result,
  landedSide,
  calledSide,
  amount,
  stakeAmount,
  onRunItBack,
  onChangeStake,
  onClose,
  onShare,
}: {
  result: FlipResult;
  landedSide: CoinSide;
  // what the user called before the flip — reused by quick-rebet
  calledSide?: CoinSide;
  // headline figure: on-chain payout for win, stake for loss — already formatted
  amount: string;
  // what the user originally staked — shown as sub-label and reused by quick-rebet
  stakeAmount?: string;
  onRunItBack: () => void;
  onChangeStake: () => void;
  onClose: () => void;
  onShare: (amount: string, result: FlipResult) => void;
}) => {
  const isWin = result === "win";
  const isHeads = landedSide === "heads";

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/25 px-5 pb-6 pt-5 sm:px-6 sm:pt-6">
      <div className="relative z-10 flex flex-col items-center">
        {/* Fixed bounding box — both head and tail SVGs render at the same visual height */}
        <div className="mb-4 flex h-[120px] w-[108px] items-end justify-center">
          <Image
            src={isHeads ? head : tail}
            height={120}
            width={108}
            alt={landedSide}
            className="h-full w-full object-contain object-bottom"
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
          <p className="mt-1 text-[13px] capitalize text-[#737373]">
            It was {landedSide}
            {stakeAmount ? (
              <>
                &nbsp;&middot;&nbsp;Staked {stakeAmount}
              </>
            ) : null}
          </p>
        </div>

        <div className="mt-6 grid w-full gap-2.5">
          <button
            type="button"
            onClick={onRunItBack}
            disabled={!stakeAmount || !calledSide}
            className="focus-ring h-12 rounded-full bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {stakeAmount && calledSide
              ? `Run it back · ${stakeAmount} on ${calledSide}`
              : "Flip again"}
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onChangeStake}
              className="focus-ring h-12 rounded-full border border-white/10 bg-white/[0.05] text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.10]"
            >
              Change stake
            </button>
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
            onClick={onClose}
            className="focus-ring mx-auto mt-1 rounded-full px-3 py-1 text-xs font-medium text-[#8A8A8A] transition-colors hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
