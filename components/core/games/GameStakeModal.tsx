"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Coins, DollarSign, ArrowRight } from "lucide-react";
import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";
import { ModalShell } from "@/components/ui/ModalShell";

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

  const amount = useMemo(() => {
    const custom = customAmount.trim();
    if (custom) {
      const parsed = Number(custom);
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
      className="max-w-[620px]"
    >
      <div className="flex flex-col gap-5 sm:gap-6">
        <div className="grid gap-3 sm:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8A8A]">
                  Stake preview
                </p>
                <h3 className="text-lg font-semibold text-[#F3F3F3] sm:text-xl">
                  Choose an amount, then confirm.
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-[#A3A3A3]">
                  Use a preset for speed or enter a custom USDC amount before the game starts.
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CBCBCB]">
                <Coins className="h-5 w-5" />
              </div>
            </div>
          </div>

          {showSideSelector ? (
            <div className="grid gap-3 sm:grid-cols-1">
              {[
                { side: "heads" as const, label: "Heads", image: head },
                { side: "tails" as const, label: "Tails", image: tail },
              ].map((item) => {
                const active = selectedSide === item.side;

                return (
                  <button
                    key={item.side}
                    type="button"
                    onClick={() => setSelectedSide(item.side)}
                    className={`group flex min-h-[124px] items-center justify-between gap-4 rounded-[26px] border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${active ? "border-white/30 bg-white/[0.12] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"}`}
                  >
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
                        Coin side
                      </p>
                      <p className="text-lg font-semibold text-[#F3F3F3]">
                        {item.label}
                      </p>
                      <p className="text-sm text-[#9A9A9A]">
                        {active ? "Selected to call" : "Tap to select this side"}
                      </p>
                    </div>
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border ${active ? "border-white/30 bg-white text-black" : "border-white/10 bg-white/5 text-[#CBCBCB]"}`}>
                      <Image src={item.image} height={64} width={64} alt={item.label} className="h-14 w-14 object-contain" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
                    Spin ready
                  </p>
                  <p className="mt-2 text-base font-medium text-[#F3F3F3]">
                    Set your stake before launching.
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CBCBCB]">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#9A9A9A]">
                The game will only start once the transaction flow is ready.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#E8E8E8]">Stake amount</p>
              <p className="mt-1 text-sm text-[#8A8A8A]">
                Minimum ${minAmount.toFixed(2)} USDC
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[#9A9A9A]">
              <DollarSign className="h-3.5 w-3.5" />
              {summary}
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {PRESETS.map((value) => {
              const active = preset === value && !customAmount.trim();
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setPreset(value);
                    setCustomAmount("");
                  }}
                  className={`h-12 rounded-2xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${active ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.03] text-[#CBCBCB] hover:border-white/20 hover:bg-white/[0.05]"}`}
                >
                  ${value.toFixed(2)}
                </button>
              );
            })}

            <label className="relative block sm:col-span-2 xl:col-span-2">
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
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 pr-16 text-sm text-[#F3F3F3] outline-none placeholder:text-[#666] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
                USDC
              </span>
            </label>
          </div>
        </div>

        <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 sm:items-center sm:p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A8A8A]">
              Final check
            </p>
            <p className="mt-2 text-base font-medium text-[#F3F3F3]">
              {summary} {showSideSelector ? `· ${selectedSide}` : ""}
            </p>
            <p className="mt-1 text-sm text-[#9A9A9A]">
              {amount >= minAmount
                ? "Ready to submit the transaction."
                : `Enter at least $${minAmount.toFixed(2)} to continue.`}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:justify-self-end">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() =>
                onConfirm(amount, showSideSelector ? selectedSide : undefined)
              }
              className={`h-12 rounded-2xl px-5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${canSubmit ? "bg-white text-black hover:-translate-y-0.5 hover:bg-[#F5F5F5]" : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"}`}
            >
              {isSubmitting ? "Preparing..." : `${actionLabel} ${summary}`}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
