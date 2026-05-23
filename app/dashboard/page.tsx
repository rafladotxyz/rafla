"use client";

import Link from "next/link";
import {
  ArrowRight,
  History,
  LayoutGrid,
  Medal,
  UserRound,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthContext } from "@/context/AuthContext";

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
  return <DashboardContent />;
}

function DashboardContent() {
  const { user, isAuthenticated, signIn, signOut } = useAuthContext();
  const displayName = user?.username ? `@${user.username}` : "Anonymous";
  const shortWallet = user?.wallet
    ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`
    : "Not connected";

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
              <Link
                href="/draw"
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
              >
                Enter draw
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-[#E8E8E8] transition-colors hover:bg-white/10 hover:text-white"
              >
                Rankings
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-xl animate-fade-up">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#737373]">Connected user</p>
                <h2 className="mt-2 text-xl font-medium text-[#F3F3F3]">Account overview</h2>
              </div>
              <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#CBCBCB]">
                <span className={`h-2 w-2 rounded-full ${isAuthenticated ? "bg-emerald-400" : "bg-amber-400"}`} />
                {isAuthenticated ? "Connected" : "Not connected"}
              </div>
            </div>

            {isAuthenticated && user ? (
              <div className="grid gap-4 sm:grid-cols-[auto_1fr] items-start">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 overflow-hidden text-2xl font-semibold text-white">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    displayName[0].toUpperCase()
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-medium text-[#F3F3F3]">{displayName}</p>
                    <p className="text-sm text-[#9A9A9A] font-mono">{shortWallet}</p>
                    {user.bio && <p className="mt-2 text-sm leading-relaxed text-[#B0B0B0]">{user.bio}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#737373]">Username</p>
                      <p className="mt-1 text-sm text-[#E8E8E8]">{user.username ? `@${user.username}` : "Not set"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#737373]">Wallet</p>
                      <p className="mt-1 text-sm text-[#E8E8E8]">Connected</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 col-span-2 sm:col-span-1">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#737373]">Actions</p>
                      <button onClick={signOut} className="mt-1 text-sm text-[#E8E8E8] hover:text-white transition-colors">
                        Exit account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm leading-relaxed text-[#A3A3A3]">
                  Connect and sign in to unlock your user details, profile, and game history.
                </p>
                <button
                  onClick={signIn}
                  className="rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
                >
                  Connect wallet
                </button>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-xl animate-fade-up">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#737373]">Quick stats</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Games", value: "3" },
                { label: "Modes", value: "Public / Private" },
                { label: "Network", value: "Base Sepolia" },
                { label: "Status", value: isAuthenticated ? "Signed in" : "Guest" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#737373]">{item.label}</p>
                  <p className="mt-2 text-sm text-[#F3F3F3]">{item.value}</p>
                </div>
              ))}
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
