"use client";

import { useAppKitNetwork } from "@reown/appkit/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Base from "@/assets/base.png";
import BaseSepolia from "@/assets/baseSepolia.png";
import Image from "next/image";

export function GameHeader({ gameName }: { gameName?: string }) {
  const router = useRouter();
  const { caipNetwork } = useAppKitNetwork();

  const getNetworkIcon = (name: string) => {
    switch (name) {
      case "Base Sepolia":
        return BaseSepolia;
      case "Base":
        return Base;
      default:
        return Base; // Fallback icon
    }
  };
  return (
    <div className="flex items-center mt-6 justify-between mb-6">
      {/* Go Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#141414] backdrop-blur-sm hover:bg-[#252525] text-[#E8E8E8] text-sm"
      >
        <ArrowLeft color="#E8E8E8" className="w-4 h-4" />
        <span className="text-[#E8E8E8]">Go Back</span>
      </button>

      {/* Title */}
      <h1 className="text-xl font-semibold text-[#E8E8E8]">{gameName}</h1>

      {/* Chain Badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#141414] backdrop-blur-sm">
        <Image
          height={20}
          width={20}
          src={getNetworkIcon(caipNetwork?.name || "Base")}
          alt="Base logo"
          className="rounded-full"
        />
        <span className="text-sm text-[#E8E8E8]">
          {caipNetwork?.name || "Base"}
        </span>
      </div>
    </div>
  );
}
