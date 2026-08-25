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
  vrfTimedOut,
  onVrfRetry,
}: {
  handleSpinResult: (segment: Segment) => void;
  externalSpinTrigger?: boolean;
  targetIndex?: number | null;
  onPlay: () => void;
  isLoading?: boolean;
  isWaitingForChain?: boolean;
  isSpinning?: boolean;
  vrfTimedOut?: boolean;
  onVrfRetry?: () => void;
}) => (
  <div className="w-full px-0 py-8 sm:py-12 lg:px-4">
    <SpinWheel
      onResult={handleSpinResult}
      externalSpinTrigger={externalSpinTrigger}
      targetIndex={targetIndex}
      onPlay={onPlay}
      isLoading={isLoading}
      isWaitingForChain={isWaitingForChain}
      isSpinning={isSpinning}
      vrfTimedOut={vrfTimedOut}
      onVrfRetry={onVrfRetry}
    />
  </div>
);
