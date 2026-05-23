
import Link from "next/link";
import { ArrowRight, History, LayoutGrid, Medal, UserRound } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const shortcuts = [
  {
    title: "Profile",
    description: "Review your wallet identity, wins, and recent activity.",
    href: "/profile",
    icon: UserRound,
  },
  {
    title: "Leaderboard",
    description: "See who is leading across wins and prize totals.",
    href: "/leaderboard",
    icon: Medal,
  },
  {
    title: "Game history",
    description: "Track rooms, rounds, and settled outcomes.",
    href: "/draw",
    icon: History,
  },
  {
    title: "Play now",
    description: "Jump back into Spin, Flip, or Draw.",
    href: "/",
    icon: LayoutGrid,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center pt-6">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="animate-fade-up rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#8A8A8A]">
                Dashboard
              </span>
              <h1 className="text-3xl font-medium text-[#F3F3F3] md:text-5xl">
                Your control center for Rafla.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#A3A3A3] md:text-base">
                Keep track of your profile, rankings, and game history from one place. Use this page as the main launch point after sign-in.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Link href="/draw" className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5">
                Enter draw
              </Link>
              <Link href="/leaderboard" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-[#E8E8E8] transition-colors hover:bg-white/10 hover:text-white">
                Rankings
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                style={{ animationDelay: `${index * 90}ms` }}
                className="group animate-fade-up rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-black/30"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors group-hover:bg-white group-hover:text-black">
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={18} className="text-[#737373] transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <h2 className="text-lg font-medium text-[#F3F3F3]">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#9A9A9A]">{item.description}</p>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
