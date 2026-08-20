
"use client";

import Link from "next/link";
import { GameHeader } from "@/components/core/games/GameHeader";
import { Disclaimer } from "../cards/DisclaimerCard";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { Sparkles, Clock, ArrowRight, ShieldCheck, Coins } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export const DrawView = ({ roomId }: { roomId?: string }) => {
  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();

  return (
    <div className="px-4 py-0 relative min-h-[70vh] flex flex-col items-center">
      {showDisclaimer && <Disclaimer toggle={acceptDisclaimer} />}

      <div className="w-full max-w-2xl mx-auto py-4">
        <GameHeader gameName="Rafla Draw" />
      </div>

      <div className="w-full max-w-2xl mx-auto my-6 animate-fade-up">
        <SurfaceCard className="relative overflow-hidden p-6 md:p-10 text-center border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-black/80 to-black/95 shadow-2xl backdrop-blur-xl">
          {/* Ambient Glow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-300 shadow-lg mb-6">
            <Clock className="h-4 w-4 animate-spin [animation-duration:8s]" />
            <span>Coming Soon • Phase 2</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-[#F3F3F3] tracking-tight">
            Rafla Draw is Under Construction
          </h2>

          <p className="mt-4 text-sm md:text-base leading-relaxed text-[#A3A3A3] max-w-lg mx-auto">
            Our multi-player pooled raffle contracts and Chainlink VRF Phase 2 infrastructure are currently undergoing final auditing. The Draw mode will launch shortly!
          </p>

          {/* Feature Highlights Grid */}
          <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Sparkles className="h-5 w-5 text-amber-400 mb-2" />
              <p className="text-xs font-bold text-white">Pooled Multi-Player</p>
              <p className="text-[11px] text-[#8A8A8A] mt-1">Join shared rooms with tiered tickets.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="text-xs font-bold text-white">Chainlink VRF</p>
              <p className="text-[11px] text-[#8A8A8A] mt-1">100% tamper-proof on-chain random winner.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Coins className="h-5 w-5 text-purple-400 mb-2" />
              <p className="text-xs font-bold text-white">Multi-Token Staking</p>
              <p className="text-[11px] text-[#8A8A8A] mt-1">Stake USDC, OAR, or ETH to win the pool.</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-white/10">
            <p className="text-xs font-semibold text-[#8A8A8A]">In the meantime, try live games:</p>
            <div className="flex items-center gap-3">
              <Link
                href="/flip"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                <span>Play Rafla Flip</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/spin"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
              >
                <span>Play Rafla Spin</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};
