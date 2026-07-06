
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden px-4 pt-36 md:pt-40">
      <div className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-8 top-24 h-24 w-24 rounded-full bg-[#D946EF]/20 blur-3xl animate-float [animation-delay:1.4s]" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center animate-fade-up">
        

        <div className="space-y-1 md:space-y-2">
          <h1 className="text-4xl font-medium leading-tight text-[#F3F3F3] md:text-6xl lg:text-7xl">
            Simple games.
          </h1>
          <h1 className="text-4xl font-medium leading-tight bg-linear-to-r from-[#D946EF] via-[#f1b4ff] to-[#d9addf] bg-clip-text text-transparent md:text-6xl lg:text-7xl">
            Real suspense.
          </h1>
        </div>

        <p className="max-w-2xl text-sm leading-relaxed text-[#A3A3A3] md:text-base">
          Rafla turns chance into shared moments. Spin, flip, and draw in real time with wallet-native flow and room-based play.
        </p>

       
      </div>
    </section>
  );
};
