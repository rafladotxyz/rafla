import PnlGroup from "@/components/base/PnlGroup";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
interface PnLProps {
  isWin?: boolean;
  amount?: string;
  handleClick?: () => void;
}

export const PnL = ({
  isWin = true,
  amount = "$109.25",
  handleClick,
}: PnLProps) => {
  return (
    <div className="fixed inset-0 z-[999] backdrop-blur-sm flex items-center justify-center">
      <PnLCard isWin={isWin} amount={amount} handleClick={handleClick} />
    </div>
  );
};

// Dummy QR code as inline SVG — replace with real QR lib when ready
const DummyQR = () => (
  <svg
    width="96"
    height="96"
    viewBox="0 0 90 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="90" height="90" fill="white" rx="4" />
    {/* Top-left finder */}
    <rect x="6" y="6" width="24" height="24" rx="2" fill="black" />
    <rect x="10" y="10" width="16" height="16" rx="1" fill="white" />
    <rect x="13" y="13" width="10" height="10" rx="1" fill="black" />
    {/* Top-right finder */}
    <rect x="60" y="6" width="24" height="24" rx="2" fill="black" />
    <rect x="64" y="10" width="16" height="16" rx="1" fill="white" />
    <rect x="67" y="13" width="10" height="10" rx="1" fill="black" />
    {/* Bottom-left finder */}
    <rect x="6" y="60" width="24" height="24" rx="2" fill="black" />
    <rect x="10" y="64" width="16" height="16" rx="1" fill="white" />
    <rect x="13" y="67" width="10" height="10" rx="1" fill="black" />
    {/* Data modules */}
    {[36, 42, 48, 54, 63, 69, 75].map((x, i) => (
      <rect key={`r1${i}`} x={x} y="6" width="3" height="3" fill="black" />
    ))}
    {[39, 45, 57, 66, 72, 78].map((x, i) => (
      <rect key={`r2${i}`} x={x} y="12" width="3" height="3" fill="black" />
    ))}
    {[36, 51, 60, 63, 75, 81].map((x, i) => (
      <rect key={`r3${i}`} x={x} y="18" width="3" height="3" fill="black" />
    ))}
    {[39, 48, 54, 69, 78].map((x, i) => (
      <rect key={`r4${i}`} x={x} y="24" width="3" height="3" fill="black" />
    ))}
    {[6, 12, 18, 36, 45, 54, 60, 66, 75, 81].map((x, i) => (
      <rect key={`r5${i}`} x={x} y="36" width="3" height="3" fill="black" />
    ))}
    {[9, 15, 39, 48, 57, 63, 72, 78].map((x, i) => (
      <rect key={`r6${i}`} x={x} y="42" width="3" height="3" fill="black" />
    ))}
    {[6, 18, 36, 42, 51, 60, 69, 75].map((x, i) => (
      <rect key={`r7${i}`} x={x} y="48" width="3" height="3" fill="black" />
    ))}
    {[12, 45, 54, 63, 72, 81].map((x, i) => (
      <rect key={`r8${i}`} x={x} y="54" width="3" height="3" fill="black" />
    ))}
    {[36, 39, 48, 57, 66, 75].map((x, i) => (
      <rect key={`r9${i}`} x={x} y="60" width="3" height="3" fill="black" />
    ))}
    {[42, 51, 60, 69, 78, 81].map((x, i) => (
      <rect key={`r10${i}`} x={x} y="66" width="3" height="3" fill="black" />
    ))}
    {[39, 45, 54, 63, 72].map((x, i) => (
      <rect key={`r11${i}`} x={x} y="72" width="3" height="3" fill="black" />
    ))}
    {[36, 48, 57, 66, 75, 81].map((x, i) => (
      <rect key={`r12${i}`} x={x} y="78" width="3" height="3" fill="black" />
    ))}
  </svg>
);

const PnLCard = ({
  isWin = true,
  amount = "$109.25",
  handleClick,
}: PnLProps) => {
  return (
    <div className="relative flex flex-col w-[714px] bg-[#0A0A0A] rounded-2xl overflow-hidden">
      {/* Background texture — absolute, fills entire card */}
      <PnlGroup className="absolute inset-0 w-full h-full" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col flex-1 px-14 pt-16 pb-8 gap-8 ml-auto mr-auto">
        {/* Win/Loss text + amount */}
        <div className="flex flex-col gap-1">
          <p className="text-[24px] text-[#737373]">
            You {isWin ? "won" : "lost"}
          </p>
          <p
            className="text-[64px] font-bold leading-none"
            style={{ color: isWin ? "#229EFF" : "#DF1C41" }}
          >
            {isWin ? "+" : "-"}
            {amount}
          </p>
        </div>

        {/* Tagline */}
        <div className="flex flex-col gap-0.5">
          <p className="text-[14px] text-[#636363]">Chance made social</p>
          <p className="text-[14px] font-semibold text-[#636363]">RAFLA.XYZ</p>
        </div>

        {/* Bottom row: QR left, Logo right */}
        <div className="flex items-end justify-between mt-4">
          <div className="rounded-lg overflow-hidden border border-[#2a2a2a]">
            <DummyQR />
          </div>
          <div className="flex flex-col items-center gap-1">
            <Image src={Logo} height={43.88} width={96} alt="logo" />
            <p className="text-white text-[16px] font-semibold tracking-wide">
              Draw
            </p>
          </div>
        </div>
      </div>

      {/* Download button strip */}
      <div className="relative z-10 w-full bg-[#0f0f0f] border-t border-[#1f1f1f] px-8 py-3">
        <button
          onClick={handleClick}
          className="w-full h-12 flex items-center justify-center gap-2 text-white text-[15px] font-medium rounded-xl hover:bg-white/5 transition-colors"
        >
          Download PnL Card
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
