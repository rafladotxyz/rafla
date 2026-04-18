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
  handleFlip,
  handleFlipAgain,
  handleShare,
}: {
  viewState: ViewState;
  selectedSide: CoinSide | null;
  flipResult: FlipData;
  handleFlip: (side: CoinSide, amount: string) => void;
  handleFlipAgain: () => void;
  handleShare: (amount: string, isWin: boolean) => void;
}) => (
  <div className="flex items-center justify-center w-312 ml-auto mr-auto py-12">
    {viewState === "select" && <FlipCard onFlip={handleFlip} />}
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
