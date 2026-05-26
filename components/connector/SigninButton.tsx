"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
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
    router.push("/profile");
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

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <button
        type="button"
        onClick={navigateToProfile}
        className="group inline-flex h-11 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2.5 pr-3 text-left transition-all hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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

        <div className="hidden min-w-0 sm:flex sm:flex-col sm:items-start">
          <span className="truncate text-[13px] font-medium text-[#F3F3F3]">
            {displayName}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
            Profile
          </span>
        </div>

        <ChevronRight className="hidden h-4 w-4 text-[#8A8A8A] transition-transform group-hover:translate-x-0.5 sm:block" />
      </button>

      <button
        type="button"
        onClick={signOut}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </button>

      <button
        type="button"
        onClick={() => open()}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 p-1.5 text-[12px] text-[#888] transition-colors hover:border-white/20 hover:bg-white/10 hover:text-[#CBCBCB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label={`Open network switcher, current network ${caipNetwork?.name || "Base"}`}
      >
        <Image
          height={16}
          width={16}
          src={getNetworkIcon(caipNetwork?.name || "Base")}
          alt={caipNetwork?.name || "Base"}
          className="h-full w-full rounded-full object-contain"
        />
      </button>
    </div>
  );
}
