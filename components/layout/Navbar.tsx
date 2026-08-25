"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/assets/Logo.svg";
import { SignInButton } from "../connector/SigninButton";

const NAV_LINKS = [
  { href: "/", label: "Play", shortLabel: "Play" },
  { href: "/leaderboard", label: "Leaderboard", shortLabel: "Board" },
  { href: "/profile", label: "Profile", shortLabel: "Profile" },
];

export const Navbar = () => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : (pathname?.startsWith(href) ?? false);

  return (
    <nav className="fixed top-4 left-1/2 z-50 w-[calc(100%-1.25rem)] max-w-[1120px] -translate-x-1/2 rounded-[22px] border border-white/10 bg-black/60 px-3.5 py-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl pointer-events-auto md:top-6 md:w-[95%] md:px-4 md:py-3">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center transition-transform hover:scale-[1.02] active:scale-95"
          aria-label="Rafla home"
        >
          <Image
            height={32}
            width={80}
            src={Logo}
            alt=""
            className="h-auto w-16 md:w-20"
          />
        </Link>

        <div
          className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-1"
          role="navigation"
          aria-label="Main"
        >
          {NAV_LINKS.map(({ href, label, shortLabel }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold transition-colors md:px-4 md:text-sm ${
                  active
                    ? "bg-white text-black"
                    : "text-[#A3A3A3] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <SignInButton />
        </div>
      </div>
    </nav>
  );
};
