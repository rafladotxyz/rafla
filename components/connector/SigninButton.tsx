"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
    router.push(`/profile`);
  };

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="h-10 px-5 rounded-full bg-[#E8E8E8] text-[#0a0a0a] text-[14px] font-medium hover:bg-white transition-colors"
      >
        Connect Wallet
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={signIn}
          disabled={isLoading}
          className={`h-10 px-5 rounded-full text-[14px] font-medium transition-colors border ${
            isLoading
              ? "bg-[#1a1a1a] text-[#4a4a4a] border-[#282828] cursor-not-allowed"
              : "bg-[#E8E8E8] text-[#0a0a0a] border-transparent hover:bg-white cursor-pointer"
          }`}
        >
          {isLoading ? "Signing..." : "Sign In"}
        </button>
        {error && <span className="text-[12px] text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <button
        onClick={navigateToProfile}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 transition-colors hover:bg-white/10"
      >
        {user?.avatar ? (
          <Image
            src={user?.avatar}
            alt={user?.username ?? "avatar"}
            className="w-7 h-7 rounded-full object-cover"
            width={28}
            height={28}
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#282828] flex items-center justify-center text-[11px] text-[#CBCBCB]">
            {(user?.username ?? user?.wallet ?? "?")[0].toUpperCase()}
          </div>
        )}
        <span className="text-[13px] text-[#CBCBCB] hidden sm:inline">
          {user?.username
            ? `@${user.username}`
            : `${user?.wallet.slice(0, 6)}...${user?.wallet.slice(-4)}`}
        </span>
      </button>

      <button
        onClick={signOut}
        className="h-9 px-3 rounded-full border border-white/10 bg-white/5 text-[13px] text-[#E8E8E8] hover:bg-white/10 hover:text-white transition-colors"
      >
        <span className="hidden xs:inline">Exit</span>
        <span className="xs:hidden">Out</span>
      </button>

      <button
        type="button"
        onClick={() => open()}
        className="h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-[12px] text-[#888] hover:text-[#CBCBCB] hover:border-[#444] transition-colors overflow-hidden p-1.5"
      >
        <Image
          height={16}
          width={16}
          src={getNetworkIcon(caipNetwork?.name || "Base")}
          alt={caipNetwork?.name || "Base"}
          className="rounded-full h-full w-full object-contain"
        />
      </button>
    </div>
  );
}
