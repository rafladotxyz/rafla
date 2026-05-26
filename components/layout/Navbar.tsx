"use client";

import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import { SignInButton } from "../connector/SigninButton";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="fixed top-4 left-1/2 z-50 w-[calc(100%-1rem)] max-w-[1120px] -translate-x-1/2 rounded-[22px] border border-white/10 bg-black/55 px-3 py-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:top-6 md:w-[95%] md:px-4 md:py-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex shrink-0 items-center transition-transform hover:scale-[1.02] active:scale-95"
          aria-label="Go to home"
        >
          <Image
            height={32}
            width={80}
            src={Logo}
            alt="Rafla logo"
            className="h-auto w-16 md:w-20"
          />
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <SignInButton />
        </div>
      </div>
    </nav>
  );
};
