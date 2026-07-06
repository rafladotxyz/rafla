"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Base from "@/assets/base.png";
import BaseSepolia from "@/assets/baseSepolia.png";
import Monad from "@/assets/monad.svg";

export function SignInButton() {
  const {
    isConnected,
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signOut,
    error,
  } = useAuthContext();
  const { open } = useAppKit();
  const { caipNetwork } = useAppKitNetwork();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const getNetworkIcon = (name: string) => {
    switch (name) {
      case "Base Sepolia":
        return BaseSepolia;
      case "Base":
        return Base;
      case "Monad":
        return Monad;
      case "Monad Testnet":
        return Monad;
      default:
        return Base;
    }
  };

  const navigateToProfile = () => {
    setMenuOpen(false);
    router.push("/profile");
  };

  const handleSwitchNetwork = () => {
    setMenuOpen(false);
    open({ view: "Networks" });
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    signOut();
  };

  if (!isConnected) {
    return (
      <button
        type="button"
        onClick={() => open()}
        className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white px-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:translate-y-0"
      >
        Connect wallet
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={signIn}
          disabled={isLoading}
          className={`inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors ${isLoading ? "cursor-not-allowed border-white/10 bg-white/5 text-[#4A4A4A]" : "border-white/10 bg-white text-black hover:bg-[#F5F5F5]"}`}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
        {error ? <span className="max-w-[180px] text-right text-[12px] text-red-400">{error}</span> : null}
      </div>
    );
  }

  const displayName = user?.username
    ? `@${user.username}`
    : `${user?.wallet.slice(0, 6)}...${user?.wallet.slice(-4)}`;

  const networkName = caipNetwork?.name || "Base";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-2 pl-2 pr-2 transition-all hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt={user?.username ?? "Profile avatar"}
            className="h-8 w-8 rounded-full object-cover"
            width={32}
            height={32}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[12px] font-semibold text-[#F3F3F3]">
            {(user?.username ?? user?.wallet ?? "?")[0].toUpperCase()}
          </div>
        )}

       

        <ChevronDown
          className={`h-4 w-4 text-[#8A8A8A] transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] w-[min(16rem,calc(100vw-2rem))] origin-top-right animate-[fadeIn_0.15s_ease-out] overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={navigateToProfile}
            className="group/item flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5"
          >
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user?.username ?? "Profile avatar"}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
                width={36}
                height={36}
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-[#F3F3F3]">
                {(user?.username ?? user?.wallet ?? "?")[0].toUpperCase()}
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col items-start">
         
              <span className="flex items-center gap-1 text-[11px tracking-[0.2em] text-[#8A8A8A]">
                Profile
              </span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#8A8A8A] transition-transform group-hover/item:translate-x-0.5" />
          </button>

          <div className="mx-4 h-px bg-white/10" />

          <button
            type="button"
            role="menuitem"
            onClick={handleSwitchNetwork}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 p-1.5">
              <Image
                height={18}
                width={18}
                src={getNetworkIcon(networkName)}
                alt={networkName}
                className="h-full w-full rounded-full object-contain"
              />
            </span>
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span className="truncate text-[13px] font-medium text-[#F3F3F3]">
                {networkName}
              </span>
             
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#8A8A8A]" />
          </button>

          <div className="mx-4 h-px bg-white/10" />

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-red-400 transition-colors hover:bg-red-500/10"
          >
           
            <span className="text-[13px] font-medium">Sign out</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}