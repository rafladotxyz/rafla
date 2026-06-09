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
}: {
  handleSpinResult: (segment: Segment) => void;
  externalSpinTrigger?: boolean;
  targetIndex?: number | null;
  onPlay: () => void;
  isLoading?: boolean;
  isWaitingForChain?: boolean;
}) => (
  <div className="w-full px-4 py-8 sm:py-12">
    <SpinWheel
      onResult={handleSpinResult}
      externalSpinTrigger={externalSpinTrigger}
      targetIndex={targetIndex}
      onPlay={onPlay}
      isLoading={isLoading}
      isWaitingForChain={isWaitingForChain}
    />
  </div>
);
