import Image from "next/image";
import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

type CoinSide = "heads" | "tails";

export const FlipCard = ({
  onPlay,
}: {
  onPlay: () => void;
}) => {
  return (
    <SurfaceCard className="mx-auto w-full max-w-[520px] p-4 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8A8A]">
              Flip
            </p>
            <h2 className="text-2xl font-semibold text-[#F3F3F3] sm:text-3xl">
              Call the coin.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-[#A3A3A3]">
              Pick heads or tails, enter your stake, and let the coin decide.
            </p>
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CBCBCB]">
            <span className="text-sm font-semibold">50/50</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Heads", image: head },
            { label: "Tails", image: tail },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4"
            >
              <Image src={item.image} height={72} width={72} alt={item.label} className="h-16 w-16 shrink-0 object-contain" />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#8A8A8A]">
                  {item.label}
                </p>
                <p className="mt-1 text-base font-medium text-[#F3F3F3]">
                  2x payout if you call it right.
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="h-14 rounded-2xl bg-white text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Choose stake and flip
        </button>
      </div>
    </SurfaceCard>
  );
};
