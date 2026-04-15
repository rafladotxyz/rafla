"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useAppKit } from "@reown/appkit/react";

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

  // Not connected — show wallet connect
  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="h-10 px-5 rounded-xl bg-[#E8E8E8] text-[#0a0a0a] text-[14px] font-medium hover:bg-white transition-colors"
      >
        Connect Wallet
      </button>
    );
  }

  // Connected but not signed in
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={signIn}
          disabled={isLoading}
          className={`h-10 px-5 rounded-xl text-[14px] font-medium transition-colors border ${
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

  // Authenticated — show user info + sign out
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.username ?? "avatar"}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#282828] flex items-center justify-center text-[11px] text-[#CBCBCB]">
            {(user?.username ?? user?.wallet ?? "?")[0].toUpperCase()}
          </div>
        )}
        <span className="text-[13px] text-[#CBCBCB]">
          {user?.username ??
            `${user?.wallet.slice(0, 6)}...${user?.wallet.slice(-4)}`}
        </span>
      </div>
      <button
        onClick={signOut}
        className="h-8 px-3 rounded-lg border border-[#282828] text-[12px] text-[#888] hover:text-[#CBCBCB] hover:border-[#444] transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
