"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface GameLoadingOverlayProps {
  isOpen: boolean;
  gameType?: "flip" | "spin" | "draw";
  stage?: "tx" | "vrf" | "settle";
  title?: string;
  subtitle?: string;
  /** True when this wait resumed an interrupted session after a refresh. */
  resumed?: boolean;
}

export function GameLoadingOverlay({
  isOpen,
  gameType = "flip",
  stage = "vrf",
  title,
  subtitle,
  resumed = false,
}: GameLoadingOverlayProps) {
  const currentStep = stage === "tx" ? 1 : stage === "vrf" ? 2 : 3;
  // Callers remount this component per open/stage (key prop), so the lazy
  // initializer always starts from the right point and the interval below is
  // the only thing that ever updates progress.
  const [progress, setProgress] = useState(
    stage === "tx" ? 15 : stage === "vrf" ? 50 : 95,
  );

  useEffect(() => {
    if (!isOpen) return;

    if (stage === "tx") {
      const timer = setInterval(() => {
        setProgress((prev) => (prev < 45 ? prev + 3 : prev));
      }, 200);
      return () => clearInterval(timer);
    } else if (stage === "vrf") {
      const timer = setInterval(() => {
        setProgress((prev) => (prev < 92 ? prev + 2 : prev));
      }, 300);
      return () => clearInterval(timer);
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

  const stepLabel =
    stage === "tx" ? "Broadcasting" : stage === "vrf" ? "VRF Request" : "Settling";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-neutral-950/90 p-6 md:p-8 text-center animate-fade-up">
        {/* Game-specific Animated Graphic */}
        <div className="relative my-6 flex justify-center items-center">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/15 animate-spin [animation-duration:6s]" />
            <div
              className={`relative flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-neutral-900 ${
                gameType === "spin" ? "animate-spin [animation-duration:3s]" : ""
              }`}
            >
              <span className="text-xl font-bold tracking-tight text-[#CBCBCB]">
                R
              </span>
            </div>
          </div>
        </div>

        {/* Title & Status Message */}
        <h3 className="text-xl font-bold text-[#F3F3F3] tracking-wide">
          {title ?? defaultTitle}
        </h3>
        <p className="mt-2 text-xs md:text-sm leading-relaxed text-[#A3A3A3] max-w-xs mx-auto">
          {subtitle ?? defaultSubtitle}
        </p>

        {resumed && stage !== "tx" ? (
          <p className="mx-auto mt-3 max-w-xs rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[#CBCBCB]">
            Picking up where you left off — your stake was already confirmed.
          </p>
        ) : null}

        {/* Progress Bar */}
        <div className="mt-6 w-full space-y-1.5">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-[#8A8A8A]">
            <span>{stepLabel}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-[#E8E8E8] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage Steps Indicator */}
        <ol className="mt-6 grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
          {[
            { label: "Tx Signed", step: 1 },
            { label: "VRF Random", step: 2 },
            { label: "On-Chain Result", step: 3 },
          ].map(({ label, step }) => {
            const done = currentStep > step;
            const current = currentStep === step;
            return (
              <li key={label} className="flex flex-col items-center gap-1 text-[10px]">
                <span
                  aria-current={current ? "step" : undefined}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                    done
                      ? "border-white bg-white text-black"
                      : current
                        ? "border-white/60 text-white"
                        : "border-white/10 text-[#737373]"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : step}
                </span>
                <span
                  className={
                    done || current ? "text-[#D9D9D9] font-semibold" : "text-[#737373]"
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Verified Badge Footer */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-[#A3A3A3]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#CBCBCB]" />
          <span>Base Sepolia • Chainlink VRF Verified</span>
        </div>
      </div>
    </div>
  );
}
