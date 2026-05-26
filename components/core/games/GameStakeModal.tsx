"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";
import { ModalShell } from "@/components/ui/ModalShell";
import { Coin } from "lucide-react";

type CoinSide = "heads" | "tails";

type GameStakeModalProps = {
  open: boolean;
  gameName: string;
  actionLabel: string;
  description: string;
  showSideSelector?: boolean;
  onClose: () => void;
  onConfirm: (amount: number, side?: CoinSide) => void;
  isSubmitting?: boolean;
  defaultAmount?: number;
  minAmount?: number;
};

const PRESETS = [1, 2, 3, 5];

export function GameStakeModal({
  open,
  gameName,
  actionLabel,
  description,
  showSideSelector = false,
  onClose,
  onConfirm,
  isSubmitting = false,
  defaultAmount = 1,
  minAmount = 1,
}: GameStakeModalProps) {
  const [selectedSide, setSelectedSide] = useState<CoinSide>("heads");
  const [preset, setPreset] = useState<number | null>(defaultAmount);
  const [customAmount, setCustomAmount] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedSide("heads");
    setPreset(defaultAmount);
    setCustomAmount("");
  }, [open, defaultAmount]);

  const amount = useMemo(() => {
    if (customAmount.trim()) {
      const parsed = Number(customAmount);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return preset ?? 0;
  }, [customAmount, preset]);

  const canSubmit = amount >= minAmount && !isSubmitting;
  const summary = `$${amount.toFixed(2)} USDC`;

  if (!open) return null;

  return (
    <ModalShell
      onClose={onClose}
      title={gameName}
      description={description}
      className="max-w-[560px]"
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
          {showSideSelector ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedSide("heads")}
                className={`group flex min-h-[150px] flex-col items-start justify-between rounded-[24px] border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${selectedSide === "heads" ? "border-white/30 bg-white/12 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"}`}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
                      Side
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#F3F3F3]">
                      Heads
                    </p>
                  </div>
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${selectedSide === "heads" ? "border-white/30 bg-white text-black" : "border-white/10 bg-white/5 text-[#CBCBCB]"}`}>
                    H
                  </span>
                </div>
                <Image src={head} height={92} width={92} alt="Heads" className="h-20 w-20 object-contain opacity-95" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedSide("tails")}
                className={`group flex min-h-[150px] flex-col items-start justify-between rounded-[24px] border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${selectedSide === "tails" ? "border-white/30 bg-white/12 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"}`}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
                      Side
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#F3F3F3]">
                      Tails
                    </p>
                  </div>
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${selectedSide === "tails" ? "border-white/30 bg-white text-black" : "border-white/10 bg-white/5 text-[#CBCBCB]"}`}>
                    T
                  </span>
                </div>
                <Image src={tail} height={92} width={92} alt="Tails" className="h-20 w-20 object-contain opacity-95" />
              </button>
            </>
          ) : (
            <div className="sm:col-span-2 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
                    Stake
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#F3F3F3]">
                    Choose your amount
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CBCBCB]">
                  <Coin className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#9A9A9A]">
                Pick a preset or enter a custom stake before you play.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#E8E8E8]">Stake amount</p>
            <span className="text-sm text-[#8A8A8A]">Minimum ${minAmount.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPreset(value);
                  setCustomAmount("");
                }}
                className={`h-12 rounded-2xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${preset === value && !customAmount.trim() ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.03] text-[#CBCBCB] hover:border-white/20 hover:bg-white/[0.05]"}`}
              >
                ${value}
              </button>
            ))}
            <label className="relative block sm:col-span-2">
              <span className="sr-only">Custom amount</span>
              <input
                type="number"
                inputMode="decimal"
                min={minAmount}
                step="0.01"
                value={customAmount}
                onChange={(event) => {
                  setCustomAmount(event.target.value);
                  setPreset(null);
                }}
                placeholder="Custom amount"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 pr-16 text-sm text-[#F3F3F3] outline-none placeholder:text-[#555] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-[#737373]">
                USDC
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[#8A8A8A]">Preview</span>
            <span className="font-medium text-[#F3F3F3]">{summary}</span>
          </div>
          {showSideSelector ? (
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-[#8A8A8A]">Selected side</span>
              <span className="font-medium capitalize text-[#F3F3F3]">{selectedSide}</span>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onConfirm(amount, showSideSelector ? selectedSide : undefined)}
            className={`h-12 rounded-2xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${canSubmit ? "bg-white text-black hover:-translate-y-0.5 hover:bg-[#F5F5F5]" : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"}`}
          >
            {isSubmitting ? "Preparing..." : `${actionLabel} ${summary}`}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
