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
    <div className="flex items-center mt-6 justify-between mb-6">
      {/* Go Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#141414] cursor-pointer backdrop-blur-sm hover:bg-[#252525] text-[#E8E8E8] text-sm"
      >
        <ArrowLeft color="#E8E8E8" className="w-4 h-4" />
        <span className="text-[#E8E8E8]">Go Back</span>
      </button>

      {/* Title */}
      <h1 className="text-xl font-semibold text-[#E8E8E8]">{gameName}</h1>

      {/* Chain Badge & Sound Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSound}
          className="p-2.5 rounded-xl border border-[#141414] backdrop-blur-sm hover:bg-[#252525] text-[#E8E8E8] transition-colors"
          title={isSoundEnabled ? "Disable Sound" : "Enable Sound"}
        >
          {isSoundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>

        <div
          onClick={() => open()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#141414] backdrop-blur-sm cursor-pointer"
        >
          <Image
            height={20}
            width={20}
            src={
              caipNetwork?.assets?.imageUrl ||
              getNetworkIcon(caipNetwork?.name || "Base")
            }
            alt="Base logo"
            className="rounded-full"
          />
          <span className="text-sm text-[#E8E8E8]">
            {caipNetwork?.name || "Base"}
          </span>
        </div>
      </div>
    </div>
  );
}
