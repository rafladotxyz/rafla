import Image from "next/image";
import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";
type CoinSide = "heads" | "tails";
export const FlippingScreen = ({ side }: { side: CoinSide }) => {
  const isHeads = side === "heads";

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[32px] font-semibold text-[#D9D9D9] animate-pulse">
        Flipping...
      </p>
      <div className="animate-bounce" style={{ animationDuration: "0.6s" }}>
        <Image
          src={isHeads ? head : tail}
          height={180}
          width={160}
          alt={side}
          className="drop-shadow-2xl"
          style={{
            animation: `spin3d ${0.6}s ease-in-out infinite`,
          }}
        />
      </div>
      <p className="text-[16px] text-[#737373]">
        You called:{" "}
        <span className="text-[#D9D9D9] font-semibold capitalize">{side}</span>
      </p>

      <style>{`
        @keyframes spin3d {
          0%   { transform: rotateY(0deg); }
          50%  { transform: rotateY(90deg) scale(0.8); }
          100% { transform: rotateY(0deg); }
        }
      `}</style>
    </div>
  );
};
