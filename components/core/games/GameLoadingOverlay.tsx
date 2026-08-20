"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Sparkles, Cpu, CheckCircle2 } from "lucide-react";

interface GameLoadingOverlayProps {
  isOpen: boolean;
  gameType?: "flip" | "spin" | "draw";
  stage?: "tx" | "vrf" | "settle";
  title?: string;
  subtitle?: string;
}

export function GameLoadingOverlay({
  isOpen,
  gameType = "flip",
  stage = "vrf",
  title,
  subtitle,
}: GameLoadingOverlayProps) {
  const [progress, setProgress] = useState(15);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setProgress(15);
      setCurrentStep(1);
      return;
    }

    if (stage === "tx") {
      setCurrentStep(1);
      const timer = setInterval(() => {
        setProgress((prev) => (prev < 45 ? prev + 3 : prev));
      }, 200);
      return () => clearInterval(timer);
    } else if (stage === "vrf") {
      setCurrentStep(2);
      setProgress(50);
      const timer = setInterval(() => {
        setProgress((prev) => (prev < 92 ? prev + 2 : prev));
      }, 300);
      return () => clearInterval(timer);
    } else {
      setCurrentStep(3);
      setProgress(95);
    }
  }, [isOpen, stage]);

  if (!isOpen) return null;

  const defaultTitle =
    stage === "tx"
      ? "Broadcasting Transaction..."
      : stage === "vrf"
      ? "Chainlink VRF Generating Result..."
      : "Settling On-Chain Winner...";

  const defaultSubtitle =
    stage === "tx"
      ? "Please confirm the transaction in your wallet to lock in your stake."
      : "Your transaction is confirmed! Awaiting tamper-proof randomness from Chainlink VRF on Base Sepolia.";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/20 via-purple-600/20 to-emerald-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-neutral-950/90 p-6 md:p-8 text-center shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-scale-in">
        
        {/* Top Glow Accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-r from-amber-500/40 to-purple-500/40 blur-2xl rounded-full pointer-events-none" />

        {/* Game-specific Animated Graphic */}
        <div className="relative my-6 flex justify-center items-center">
          {gameType === "flip" && (
            <div className="relative flex items-center justify-center w-28 h-28">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-ping opacity-30" />
              <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-spin [animation-duration:6s]" />
              
              {/* 3D Spinning Coin Container */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-1 shadow-[0_0_30px_rgba(245,166,35,0.5)] animate-coin-flip">
                <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center border border-amber-300/40">
                  <span className="text-3xl font-extrabold text-amber-300 drop-shadow-[0_0_10px_rgba(245,166,35,0.8)]">
                    ⚡
                  </span>
                </div>
              </div>
            </div>
          )}

          {gameType === "spin" && (
            <div className="relative flex items-center justify-center w-28 h-28">
              {/* Rotating Wheel Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple-500/50 animate-spin [animation-duration:3s]" />
              <div className="absolute inset-2 rounded-full border border-amber-400/40 animate-ping opacity-25" />
              
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-indigo-600 to-amber-500 p-1 shadow-[0_0_35px_rgba(168,85,247,0.5)] animate-spin [animation-duration:1.5s]">
                <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center border border-purple-300/30">
                  <Sparkles className="h-8 w-8 text-amber-300 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {gameType === "draw" && (
            <div className="relative flex items-center justify-center w-28 h-28">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-spin [animation-duration:4s]" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-1 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-pulse">
                <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center">
                  <Cpu className="h-8 w-8 text-emerald-300 animate-spin [animation-duration:5s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title & Status Message */}
        <h3 className="text-xl font-bold text-[#F3F3F3] tracking-wide">
          {title ?? defaultTitle}
        </h3>
        <p className="mt-2 text-xs md:text-sm leading-relaxed text-[#A3A3A3] max-w-xs mx-auto">
          {subtitle ?? defaultSubtitle}
        </p>

        {/* Animated Smooth Progress Bar */}
        <div className="mt-6 w-full space-y-1.5">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-[#8A8A8A]">
            <span>{stage === "tx" ? "Broadcasting" : stage === "vrf" ? "VRF Request" : "Settling"}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(245,166,35,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage Steps Indicator */}
        <div className="mt-6 grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
          <div className="flex flex-col items-center gap-1 text-[10px]">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${currentStep >= 1 ? "bg-amber-500 text-black shadow-md shadow-amber-500/40" : "bg-white/10 text-white/40"}`}>
              {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            <span className={currentStep >= 1 ? "text-amber-300 font-semibold" : "text-[#737373]"}>Tx Signed</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-[10px]">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${currentStep >= 2 ? "bg-purple-500 text-white shadow-md shadow-purple-500/40 animate-pulse" : "bg-white/10 text-white/40"}`}>
              {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </div>
            <span className={currentStep >= 2 ? "text-purple-300 font-semibold" : "text-[#737373]"}>VRF Random</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-[10px]">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${currentStep >= 3 ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/40" : "bg-white/10 text-white/40"}`}>
              3
            </div>
            <span className={currentStep >= 3 ? "text-emerald-300 font-semibold" : "text-[#737373]"}>On-Chain Result</span>
          </div>
        </div>

        {/* Verified Badge Footer */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-[#A3A3A3]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Base Sepolia • Chainlink VRF Verified</span>
        </div>
      </div>
    </div>
  );
}
