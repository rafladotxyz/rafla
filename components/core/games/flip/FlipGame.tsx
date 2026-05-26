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
} | null;

export const FlipGame = ({
  viewState,
  selectedSide,
  flipResult,
  handleFlipAgain,
  handleShare,
  onPlay,
}: {
  viewState: ViewState;
  selectedSide: CoinSide | null;
  flipResult: FlipData;
  handleFlipAgain: () => void;
  handleShare: (amount: string, isWin: boolean) => void;
  onPlay: () => void;
}) => (
  <div className="flex w-full max-w-2xl mx-auto items-center justify-center px-4 py-8 sm:py-12">
    {viewState === "select" && <FlipCard onPlay={onPlay} />}
    {viewState === "flipping" && selectedSide && (
      <FlippingScreen side={selectedSide} />
    )}
    {viewState === "result" && flipResult && (
      <FlipResultCard
        result={flipResult.result}
        landedSide={flipResult.landedSide}
        amount={flipResult.amount}
        onFlipAgain={handleFlipAgain}
        onShare={handleShare}
      />
    )}
  </div>
);
