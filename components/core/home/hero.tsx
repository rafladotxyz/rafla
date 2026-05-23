
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden px-4 pt-28 md:pt-36">
      <div className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-8 top-24 h-24 w-24 rounded-full bg-[#D946EF]/20 blur-3xl animate-float [animation-delay:1.4s]" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center animate-fade-up">
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#A3A3A3] backdrop-blur-sm">
          Base-native social games
        </span>

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

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:translate-y-0"
          >
            Open dashboard
          </Link>
          <Link
            href="/draw"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#E8E8E8] transition-colors hover:bg-white/10 hover:text-white"
          >
            Play draw
          </Link>
        </div>
      </div>
    </section>
  );
};
