import { FlipCard } from "./FlipCard";
import { FlipResultCard } from "./FlipResult";
import { FlippingScreen } from "./FlipScreen";

type CoinSide = "heads" | "tails";
type FlipResult = "win" | "loss";
type ViewState = "select" | "flipping" | "result";

type FlipData = {
  result: FlipResult;
  landedSide: CoinSide;
  amount: string;
  stakeAmount: string;
} | null;

export const FlipGame = ({
  viewState,
  selectedSide,
  onSelectSide,
  flipResult,
  handleFlipAgain,
  handleShare,
  onPlay,
  isLoading,
  isWaitingForChain,
}: {
  viewState: ViewState;
  selectedSide: CoinSide | null;
  onSelectSide: (side: CoinSide) => void;
  flipResult: FlipData;
  handleFlipAgain: () => void;
  handleShare: (amount: string, result: FlipResult) => void;
  onPlay: () => void;
  isLoading?: boolean;
  isWaitingForChain?: boolean;
}) => (
  <div className="flex w-full max-w-2xl mx-auto items-center justify-center px-4 py-8 sm:py-12">
    {viewState === "select" && (
      <FlipCard
        selectedSide={selectedSide}
        onSelectSide={onSelectSide}
        onPlay={onPlay}
        isLoading={isLoading}
      />
    )}
    {viewState === "flipping" && selectedSide && (
      <FlippingScreen side={selectedSide} isWaitingForChain={isWaitingForChain} />
    )}
    {viewState === "result" && flipResult && (
      <FlipResultCard
        result={flipResult.result}
        landedSide={flipResult.landedSide}
        amount={flipResult.amount}
        stakeAmount={flipResult.stakeAmount}
        onFlipAgain={handleFlipAgain}
        onShare={handleShare}
      />
    )}
  </div>
);
