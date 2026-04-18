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
  <div className="items-center justify-center flex w-312 gap-20 h-auto py-12 ml-auto mr-auto">
    <SpinWheel onResult={handleSpinResult} />
  </div>
);
