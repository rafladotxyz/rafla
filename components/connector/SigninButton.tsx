"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Globe,
  History,
  LogOut,
  Trophy,
  User,
} from "lucide-react";
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

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const handleSwitchNetwork = () => {
    setMenuOpen(false);
    open({ view: "Account" });
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
        className="inline-flex h-9 lg:h-10 items-center justify-center rounded-full bg-white px-4 text-xs font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5] active:translate-y-0"
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
          className={`inline-flex h-9 lg:h-10 items-center justify-center rounded-full border px-4 text-xs font-semibold transition-colors ${
            isLoading
              ? "cursor-not-allowed border-white/10 bg-white/5 text-[#4A4A4A]"
              : "border-white/10 bg-white text-black hover:bg-[#F5F5F5]"
          }`}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
        {error ? (
          <span className="max-w-[180px] text-right text-[11px] text-red-400">
            {error}
          </span>
        ) : null}
      </div>
    );
  }

  const displayName = user?.username
    ? `@${user.username}`
    : `${user?.wallet.slice(0, 6)}...${user?.wallet.slice(-4)}`;

  const networkName = caipNetwork?.name || "Base Sepolia";

  return (
    <div ref={menuRef} className="relative">
      {/* Navbar User Pill Trigger */}
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="group inline-flex h-9 lg:h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 pr-3 transition-all hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <div className="relative shrink-0">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user?.username ?? "Profile avatar"}
              className="h-7 w-7 rounded-full object-cover border border-white/10"
              width={28}
              height={28}
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-800 text-[11px] font-bold text-white shadow-sm">
              {(user?.username ?? user?.wallet ?? "?")[0].toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 border border-black" />
          </span>
        </div>

        <span className="hidden sm:inline-block max-w-[110px] truncate text-xs font-semibold text-[#F3F3F3]">
          {displayName}
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 text-[#8A8A8A] transition-transform duration-200 group-hover:text-white ${
            menuOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* User Dropdown Card */}
      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+12px)] w-64 origin-top-right animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50"
        >
          {/* User Identity Header */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="relative shrink-0">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user?.username ?? "Profile avatar"}
                  className="h-9 w-9 rounded-full object-cover border border-white/10"
                  width={36}
                  height={36}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-800 text-sm font-bold text-white">
                  {(user?.username ?? user?.wallet ?? "?")[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-bold text-[#F3F3F3]">
                {displayName}
              </span>
              <span className="font-mono text-[10px] text-[#8A8A8A]">
                {user?.wallet.slice(0, 6)}...{user?.wallet.slice(-4)}
              </span>
            </div>
          </div>

          <div className="my-1 h-px bg-white/10" />

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => navigateTo("/profile")}
              className="group/item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[#A3A3A3] group-hover/item:text-white">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="flex-1 text-xs font-semibold text-[#F3F3F3]">
                Profile Overview
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#737373] transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-white" />
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => navigateTo("/leaderboard")}
              className="group/item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Trophy className="h-3.5 w-3.5" />
              </div>
              <span className="flex-1 text-xs font-semibold text-[#F3F3F3]">
                Leaderboard
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#737373] transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-white" />
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => navigateTo("/history")}
              className="group/item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <History className="h-3.5 w-3.5" />
              </div>
              <span className="flex-1 text-xs font-semibold text-[#F3F3F3]">
                Game History
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#737373] transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-white" />
            </button>
          </div>

          <div className="my-1 h-px bg-white/10" />

          {/* Network Switcher Item */}
          <button
            type="button"
            role="menuitem"
            onClick={handleSwitchNetwork}
            className="group/item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1">
              <Image
                height={16}
                width={16}
                src={getNetworkIcon(networkName)}
                alt={networkName}
                className="h-full w-full rounded-full object-contain"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-semibold text-[#F3F3F3]">
                {networkName}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
          </button>

          <div className="my-1 h-px bg-white/10" />

          {/* Sign Out Item */}
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="group/item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-red-400 transition-colors hover:bg-red-500/10"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
              <LogOut className="h-3.5 w-3.5 text-red-400" />
            </div>
            <span className="flex-1 text-xs font-semibold text-red-300">
              Sign out
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}