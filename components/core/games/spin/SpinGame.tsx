import { SpinWheel } from "./SpinerCard";

type Segment = {
  label: string;
  asset: string;
  color: string;
  strokeColor: string;
};

export const SpinGame = ({
  handleSpinResult,
  externalSpinTrigger,
  targetIndex,
  onPlay,
  isLoading,
  isWaitingForChain,
  isSpinning,
}: {
  handleSpinResult: (segment: Segment) => void;
  externalSpinTrigger?: boolean;
  targetIndex?: number | null;
  onPlay: () => void;
  isLoading?: boolean;
  isWaitingForChain?: boolean;
  isSpinning?: boolean;
}) => (
  <div className="w-full px-0 py-8 lg:px-4sm:py-12">
    <SpinWheel
      onResult={handleSpinResult}
      externalSpinTrigger={externalSpinTrigger}
      targetIndex={targetIndex}
      onPlay={onPlay}
      isLoading={isLoading}
      isWaitingForChain={isWaitingForChain}
      isSpinning={isSpinning}
    />
  </div>
);
