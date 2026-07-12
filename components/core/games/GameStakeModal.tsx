"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Coins, ArrowRight, Wallet } from "lucide-react";
import head from "@/assets/head1.svg";
import tail from "@/assets/tail.svg";
import { ModalShell } from "@/components/ui/ModalShell";
import { useBalances } from "@/hooks/useBalances";

// ─── Token Types ─────────────────────────────────────────────────────────────

export type StakeToken = "USDC" | "OAR" | "ETH";

export interface TokenMeta {
  id: StakeToken;
  label: string;
  symbol: string;
  color: string;        // tailwind text color
  bgColor: string;      // tailwind bg color
  borderColor: string;  // tailwind border color
  description: string;
  presets: number[];
  minAmount: number;
  step: string;
}

export const TOKEN_META: Record<StakeToken, TokenMeta> = {
  USDC: {
    id: "USDC",
    label: "USD Coin",
    symbol: "USDC",
    color: "text-[#2775CA]",
    bgColor: "bg-[#2775CA]/10",
    borderColor: "border-[#2775CA]/30",
    description: "Stable 1:1 USD coin",
    presets: [1, 2, 5, 10],
    minAmount: 0.1,
    step: "0.01",
  },
  OAR: {
    id: "OAR",
    label: "OARCOIN",
    symbol: "OAR",
    color: "text-[#F5A623]",
    bgColor: "bg-[#F5A623]/10",
    borderColor: "border-[#F5A623]/30",
    description: "Native platform token",
    presets: [50, 100, 500, 1000],
    minAmount: 10,
    step: "0.001",
  },
  ETH: {
    id: "ETH",
    label: "Ethereum",
    symbol: "ETH",
    color: "text-[#8B9DE8]",
    bgColor: "bg-[#8B9DE8]/10",
    borderColor: "border-[#8B9DE8]/30",
    description: "Native gas token",
    presets: [0.0001, 0.001, 0.005, 0.01],
    minAmount: 0.0001,
    step: "0.0001",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type CoinSide = "heads" | "tails";

type GameStakeModalProps = {
  open: boolean;
  gameName: string;
  actionLabel: string;
  description: string;
  showSideSelector?: boolean;
  /** Which tokens the player may choose from. Defaults to ["OAR"] */
  availableTokens?: StakeToken[];
  onClose: () => void;
  onConfirm: (amount: number, side?: CoinSide, token?: StakeToken) => void;
  isSubmitting?: boolean;
  defaultAmount?: number;
  defaultSide?: CoinSide;
  feeNotice?: string;
  payoutNotice?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function GameStakeModal({
  open,
  gameName,
  actionLabel,
  description,
  showSideSelector = false,
  availableTokens = ["OAR"],
  onClose,
  onConfirm,
  isSubmitting = false,
  defaultAmount,
  defaultSide,
  feeNotice,
  payoutNotice,
}: GameStakeModalProps) {
  const [selectedSide, setSelectedSide] = useState<CoinSide>(defaultSide ?? "heads");
  const [selectedToken, setSelectedToken] = useState<StakeToken>(availableTokens[0]);
  const [preset, setPreset] = useState<number | null>(
    defaultAmount ?? TOKEN_META[availableTokens[0]].presets[0],
  );
  const [customAmount, setCustomAmount] = useState("");

  const { balances, isLoading: loadingBalances } = useBalances();

  const meta = TOKEN_META[selectedToken];

  // Reset preset when token changes
  const handleTokenChange = (token: StakeToken) => {
    setSelectedToken(token);
    setPreset(TOKEN_META[token].presets[0]);
    setCustomAmount("");
  };

  const amount = useMemo(() => {
    const custom = customAmount.trim();
    if (custom) {
      const parsed = Number(custom);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return preset ?? 0;
  }, [customAmount, preset]);

  const canSubmit = amount >= meta.minAmount && !isSubmitting;

  const formatAmount = (n: number) => {
    if (selectedToken === "ETH") return n.toFixed(4);
    if (selectedToken === "OAR") return n % 1 === 0 ? n.toFixed(0) : n.toFixed(3);
    return n.toFixed(2);
  };

  const summary = `${formatAmount(amount)} ${meta.symbol}`;

  if (!open) return null;

  return (
    <ModalShell
      onClose={onClose}
      title={gameName}
      description={description}
      className="max-w-[640px]"
    >
      <div className="flex flex-col gap-5">

        {/* ── Token selector (only shown when multiple options exist) ─────────── */}
        {availableTokens.length > 1 && (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8A8A]">
              Select token to stake
            </p>
            <div className="grid grid-cols-3 gap-2">
              {availableTokens.map((id) => {
                const m = TOKEN_META[id];
                const active = selectedToken === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTokenChange(id)}
                    className={`relative flex flex-col gap-1.5 rounded-[20px] border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      active
                        ? `${m.borderColor} ${m.bgColor}`
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    {/* Token icon badge */}
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border text-[13px] font-bold ${
                        active ? `${m.borderColor} ${m.bgColor} ${m.color}` : "border-white/10 bg-white/5 text-[#9A9A9A]"
                      }`}
                    >
                      {id === "ETH" ? "Ξ" : id === "USDC" ? "$" : "◈"}
                    </span>
                    <p className={`text-sm font-semibold ${active ? m.color : "text-[#CBCBCB]"}`}>
                      {m.symbol}
                    </p>
                    <p className="text-[11px] text-[#8A8A8A]">{m.description}</p>
                    {active && (
                      <span className={`absolute right-3 top-3 h-2 w-2 rounded-full ${m.bgColor} border ${m.borderColor}`}>
                        <span className={`block h-full w-full rounded-full ${active ? m.color.replace("text-", "bg-") : ""}`} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Top cards row ───────────────────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-[1.08fr_0.92fr]">
          {/* Info card */}
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
                  {availableTokens.length > 1
                    ? `Pick your preferred token and set a stake before the game starts.`
                    : `Use a preset or enter a custom ${meta.symbol} amount.`}
                </p>
              </div>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold transition-colors ${meta.borderColor} ${meta.bgColor} ${meta.color}`}>
                {selectedToken === "ETH" ? "Ξ" : selectedToken === "USDC" ? "$" : "◈"}
              </div>
            </div>
          </div>

          {/* Side selector (Flip) OR token info card */}
          {showSideSelector ? (
            <div className="grid gap-3 sm:grid-cols-1">
              {(["heads", "tails"] as const).map((side) => {
                const active = selectedSide === side;
                return (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setSelectedSide(side)}
                    className={`group flex min-h-[124px] items-center justify-between gap-4 rounded-[26px] border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      active
                        ? "border-white/30 bg-white/[0.12] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
                        Coin side
                      </p>
                      <p className="text-lg font-semibold capitalize text-[#F3F3F3]">{side}</p>
                      <p className="text-sm text-[#9A9A9A]">
                        {active ? "Selected to call" : "Tap to select"}
                      </p>
                    </div>
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border ${
                        active ? "border-white/30 bg-white text-black" : "border-white/10 bg-white/5"
                      }`}
                    >
                      <Image
                        src={side === "heads" ? head : tail}
                        height={64}
                        width={64}
                        alt={side}
                        className="h-14 w-14 object-contain"
                      />
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
                    {gameName} ready
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
                The game starts once your transaction is confirmed on-chain.
              </p>
            </div>
          )}
        </div>

        {/* ── Amount selector ─────────────────────────────────────────────────── */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#E8E8E8]">Stake amount</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-[#8A8A8A]">
                  Min: {formatAmount(meta.minAmount)}
                </p>
                <span className="text-[#4A4A4A]">·</span>
                <p className="flex items-center gap-1 text-sm text-[#8A8A8A]">
                  <Wallet className="h-3 w-3" />
                  {loadingBalances ? "..." : formatAmount(Number(balances[selectedToken].formatted))} {meta.symbol}
                </p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.24em] ${meta.borderColor} ${meta.bgColor} ${meta.color}`}>
              <Coins className="h-3.5 w-3.5" />
              {summary}
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {meta.presets.map((value) => {
              const active = preset === value && !customAmount.trim();
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setPreset(value);
                    setCustomAmount("");
                  }}
                  className={`h-12 rounded-2xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/[0.03] text-[#CBCBCB] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  {formatAmount(value)}
                </button>
              );
            })}

            <label className="relative block sm:col-span-2 xl:col-span-2">
              <span className="sr-only">Custom amount</span>
              <input
                type="number"
                inputMode="decimal"
                min={meta.minAmount}
                step={meta.step}
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setPreset(null);
                }}
                placeholder="Custom amount"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 pr-16 text-sm text-[#F3F3F3] outline-none placeholder:text-[#666] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
              />
              <span className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-[0.2em] ${meta.color}`}>
                {meta.symbol}
              </span>
            </label>
          </div>
        </div>

        {/* ── Final check + CTA ───────────────────────────────────────────────── */}
        <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 sm:items-center sm:p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8A8A8A]">
              Final check
            </p>
            <p className="mt-2 text-base font-medium text-[#F3F3F3]">
              {summary}
              {showSideSelector && ` · ${selectedSide}`}
              {availableTokens.length > 1 && ` via ${meta.label}`}
            </p>
            <p className="mt-1 text-sm text-[#9A9A9A]">
              {canSubmit
                ? "Ready to submit the transaction."
                : `Enter at least ${formatAmount(meta.minAmount)} ${meta.symbol} to continue.`}
            </p>
            {feeNotice || payoutNotice ? (
              <div className="mt-3 space-y-1.5 rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
                {feeNotice ? (
                  <p className="text-xs leading-relaxed text-[#BDBDBD]">
                    {feeNotice}
                  </p>
                ) : null}
                {payoutNotice ? (
                  <p className="text-xs leading-relaxed text-[#8A8A8A]">
                    {payoutNotice}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:justify-self-end">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() =>
                onConfirm(
                  amount,
                  showSideSelector ? selectedSide : undefined,
                  selectedToken,
                )
              }
              className={`h-12 rounded-2xl px-5 text-sm font-semibold transition-all focus-visible:outline-none ${
                canSubmit
                  ? "bg-white text-black hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
                  : "cursor-not-allowed bg-white/5 text-[#4A4A4A]"
              }`}
            >
              {isSubmitting ? "Preparing…" : `${actionLabel}`}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
