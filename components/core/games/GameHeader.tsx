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
      case "Base Sepolia":
        return BaseSepolia;
      case "Base":
        return Base;
      case "Monad":
        return Monad;
      case "Monad Testnet":
        return Monad;

      default:
        return Base; // Fallback icon
    }
  };
  return (
    <div className="flex items-center mt-4 md:mt-6 justify-between mb-4 md:mb-6 px-2 md:px-0">
      {/* Go Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border border-[#141414] cursor-pointer backdrop-blur-sm hover:bg-[#252525] text-[#E8E8E8] text-sm"
      >
        <ArrowLeft color="#E8E8E8" className="w-4 h-4" />
        <span className="text-[#E8E8E8] hidden sm:inline">Go Back</span>
      </button>

      {/* Title */}
      <h1 className="text-lg md:text-xl font-semibold text-[#E8E8E8] truncate max-w-[150px] sm:max-w-none">{gameName}</h1>

      {/* Chain Badge & Sound Toggle */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={toggleSound}
          className="p-2 md:p-2.5 rounded-xl border border-[#141414] backdrop-blur-sm hover:bg-[#252525] text-[#E8E8E8] transition-colors"
          title={isSoundEnabled ? "Disable Sound" : "Enable Sound"}
        >
          {isSoundEnabled ? (
            <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>

        <div
          onClick={() => open()}
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border border-[#141414] backdrop-blur-sm cursor-pointer"
        >
          <Image
            height={20}
            width={20}
            src={
              caipNetwork?.assets?.imageUrl ||
              getNetworkIcon(caipNetwork?.name || "Base")
            }
            alt="Network logo"
            className="rounded-full w-4 h-4 md:w-5 md:h-5"
          />
          <span className="text-xs md:text-sm text-[#E8E8E8] hidden xs:inline">
            {caipNetwork?.name || "Base"}
          </span>
        </div>
      </div>
    </div>
  );
}
