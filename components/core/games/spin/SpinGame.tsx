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
  onSpinRequest,
  isLoading,
}: {
  handleSpinResult: (segment: Segment) => void;
  externalSpinTrigger?: boolean;
  targetIndex?: number | null;
  onSpinRequest?: (amount: number) => void;
  isLoading?: boolean;
}) => (
  <div className="flex items-center justify-center w-full max-w-2xl mx-auto py-12 px-4">
    <SpinWheel
      onResult={handleSpinResult}
      externalSpinTrigger={externalSpinTrigger}
      targetIndex={targetIndex}
      onSpinRequest={onSpinRequest}
      isLoading={isLoading}
    />
  </div>
);
