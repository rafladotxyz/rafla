"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import Logo from "@/assets/Logo.svg";
import { SignInButton } from "../connector/SigninButton";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1100px] h-14 md:h-16 border border-white/10 rounded-2xl bg-black/45 backdrop-blur-2xl shadow-2xl shadow-black/40 px-3 md:px-5">
      <div className="flex h-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex shrink-0 items-center transition-transform hover:scale-105 active:scale-95"
          aria-label="Go to home"
        >
          <Image height={32} width={70} src={Logo} alt="Rafla logo" className="h-auto w-16 md:w-20" />
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-medium text-[#E8E8E8] transition-colors hover:bg-white/10 hover:text-white md:px-4 md:text-sm"
            aria-label="Open dashboard"
          >
            <LayoutDashboard size={16} className="md:hidden" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <SignInButton />
        </div>
      </div>
    </nav>
  );
};
