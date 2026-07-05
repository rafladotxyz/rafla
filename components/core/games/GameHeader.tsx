"use client";

import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSound } from "@/hooks/useSound";
import Base from "@/assets/base.png";
import BaseSepolia from "@/assets/baseSepolia.png";
import Monad from "@/assets/monad.svg";
import Image from "next/image";

export function GameHeader({ gameName }: { gameName?: string }) {
  const router = useRouter();
  const { open } = useAppKit();
  const { caipNetwork } = useAppKitNetwork();
  const { isSoundEnabled, toggleSound } = useSound();

  const getNetworkIcon = (name: string) => {
    switch (name) {
      case "Base Sepolia": return BaseSepolia;
      case "Base":         return Base;
      case "Monad":
      case "Monad Testnet": return Monad;
      default:             return Base;
    }
  };

  return (
    <div className="flex items-center justify-between py-1">

      {/* ── Back button ─────────────────────────────────────────────── */}
      <button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
        }}
        className="group flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm font-medium text-[#D4D4D4] backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        <ArrowLeft
          className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          strokeWidth={2.2}
        />
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* ── Title ───────────────────────────────────────────────────── */}
      {gameName && (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-[#E8E8E8] tracking-[-0.01em] pointer-events-none select-none">
          {gameName}
        </h1>
      )}

      {/* ── Right controls ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? "Mute sound" : "Unmute sound"}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#A3A3A3] backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          {isSoundEnabled
            ? <Volume2 className="h-[17px] w-[17px]" strokeWidth={2} />
            : <VolumeX  className="h-[17px] w-[17px]" strokeWidth={2} />
          }
        </button>

        {/* Network pill */}
        <button
          onClick={() => open()}
          className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <Image
            height={20}
            width={20}
            src={
              caipNetwork?.assets?.imageUrl ||
              getNetworkIcon(caipNetwork?.name || "Base")
            }
            alt="Network"
            className="h-[18px] w-[18px] rounded-full object-cover"
          />
          <span className="hidden text-[13px] font-medium text-[#D4D4D4] xs:inline">
            {caipNetwork?.name ?? "Base"}
          </span>
        </button>
      </div>
    </div>
  );
}
