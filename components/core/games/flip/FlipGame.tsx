import { FlipCard } from "./FlipCard";
import { FlipResultCard } from "./FlipResult";
import { FlippingScreen } from "./FlipScreen";
import { RevealStage } from "../RevealStage";

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
  handleRunItBack,
  handleChangeStake,
  handleCloseResult,
  handleShare,
  onPlay,
  isLoading,
  isWaitingForChain,
}: {
  viewState: ViewState;
  selectedSide: CoinSide | null;
  onSelectSide: (side: CoinSide) => void;
  flipResult: FlipData;
  handleRunItBack: () => void;
  handleChangeStake: () => void;
  handleCloseResult: () => void;
  handleShare: (amount: string, result: FlipResult) => void;
  onPlay: () => void;
  isLoading?: boolean;
  isWaitingForChain?: boolean;
}) => (
  <div className="flex w-full max-w-2xl mx-auto items-center justify-center px-1 lg:px-4 py-8 sm:py-12">
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
      <RevealStage label="Flip result" onClose={handleCloseResult}>
        <FlipResultCard
          result={flipResult.result}
          landedSide={flipResult.landedSide}
          calledSide={selectedSide ?? undefined}
          amount={flipResult.amount}
          stakeAmount={flipResult.stakeAmount}
          onRunItBack={handleRunItBack}
          onChangeStake={handleChangeStake}
          onClose={handleCloseResult}
          onShare={handleShare}
        />
      </RevealStage>
    )}
  </div>
);
