import { SpinWheel } from "./SpinerCard";
type Segment = {
  label: string;
  asset: string;
  color: string;
  strokeColor: string;
};
export const SpinGame = ({
  handleSpinResult,
}: {
  handleSpinResult: (segment: Segment) => void;
}) => (
  <div className="flex items-center justify-center w-full max-w-2xl mx-auto py-12 px-4">
    <SpinWheel onResult={handleSpinResult} />
  </div>
);
