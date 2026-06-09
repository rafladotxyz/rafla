"use client";

import { useState, useRef, useEffect } from "react";
import Yay from "@/assets/yay.svg";
import Breakeven from "@/assets/eq.svg";
import Nay from "@/assets/nay.svg";
import Image from "next/image";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

type Segment = {
  label: string;
  asset: string;
  color: string;
  strokeColor: string;
};

const SEGMENTS: Segment[] = [
  { label: "You Lose!", asset: Nay, color: "#161616", strokeColor: "#2a2a2a" },
  {
    label: "Breakeven!",
    asset: Breakeven,
    color: "#1e1e1e",
    strokeColor: "#2a2a2a",
  },
  {
    label: "Yaay you won!",
    asset: Yay,
    color: "#121212",
    strokeColor: "#2a2a2a",
  },
];

const SPIN_DURATION = 8000;
const MIN_SPINS = 5;

const SIZE = 500;
const cx = SIZE / 2;
const cy = SIZE / 2;
const r = SIZE / 2 - 4;
const IMG_SIZE = 64;

export const SpinWheel = ({
  onResult,
  externalSpinTrigger,
  targetIndex,
  onPlay,
  isLoading,
  isWaitingForChain,
}: {
  onResult?: (segment: Segment) => void;
  externalSpinTrigger?: boolean;
  targetIndex?: number | null;
  onPlay: () => void;
  isLoading?: boolean;
  isWaitingForChain?: boolean;
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const currentRotation = useRef(0);

  const spin = (forcedIndex?: number) => {
    if (spinning) return;
    setSpinning(true);

    const segmentIndex =
      forcedIndex !== undefined
        ? forcedIndex
        : Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    const targetOffset = segmentIndex * segmentAngle + segmentAngle / 2;
    const extraSpins = MIN_SPINS * 360;
    const newRotation =
      currentRotation.current +
      extraSpins +
      (360 - (currentRotation.current % 360)) +
      (360 - targetOffset);

    currentRotation.current = newRotation;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      onResult?.(SEGMENTS[segmentIndex]);
    }, SPIN_DURATION);
  };

  useEffect(() => {
    if (externalSpinTrigger && targetIndex !== undefined && targetIndex !== null) {
      spin(targetIndex);
    }
  }, [externalSpinTrigger, targetIndex]);

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <SurfaceCard className="mx-auto w-full max-w-[560px] p-4 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8A8A]">
              Spin
            </p>
            <h2 className="text-2xl font-semibold text-[#F3F3F3] sm:text-3xl">
              One wheel. Three outcomes.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-[#A3A3A3]">
              Pick your stake, hit play, and let the wheel settle the result.
            </p>
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CBCBCB]">
            <span className="text-xs uppercase tracking-[0.24em]">Live</span>
          </div>
        </div>

        <div className="relative w-full aspect-square max-w-[500px] self-center">
          <div
            className="absolute left-1/2 z-20"
            style={{
              top: -10,
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "clamp(10px, 3vw, 14px) solid transparent",
              borderRight: "clamp(10px, 3vw, 14px) solid transparent",
              borderTop: "clamp(18px, 5vw, 24px) solid #D9D9D9",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))",
            }}
          />

          <div
            className="h-full w-full rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                : "none",
            }}
          >
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="6"
              />

              {SEGMENTS.map((seg, i) => {
                const angle = 360 / SEGMENTS.length;
                const startAngle = i * angle - 90;
                const endAngle = startAngle + angle;

                const x1 = cx + r * Math.cos(toRad(startAngle));
                const y1 = cy + r * Math.sin(toRad(startAngle));
                const x2 = cx + r * Math.cos(toRad(endAngle));
                const y2 = cy + r * Math.sin(toRad(endAngle));

                const midAngle = toRad(startAngle + angle / 2);
                const imgR = r * 0.45;
                const ix = cx + imgR * Math.cos(midAngle);
                const iy = cy + imgR * Math.sin(midAngle);
                const labelR = r * 0.72;
                const lx = cx + labelR * Math.cos(midAngle);
                const ly = cy + labelR * Math.sin(midAngle);
                const textRotation = startAngle + angle / 2 + 90;

                return (
                  <g key={i}>
                    <path
                      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                      fill={seg.color}
                      stroke={seg.strokeColor}
                      strokeWidth="1"
                    />
                    <foreignObject
                      x={ix - IMG_SIZE / 2}
                      y={iy - IMG_SIZE / 2}
                      width={IMG_SIZE}
                      height={IMG_SIZE}
                      transform={`rotate(${textRotation}, ${ix}, ${iy})`}
                      style={{ overflow: "visible" }}
                    >
                      <Image
                        src={seg.asset}
                        alt={seg.label}
                        width={IMG_SIZE}
                        height={IMG_SIZE}
                        style={{ objectFit: "contain" }}
                      />
                    </foreignObject>
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="13"
                      fill="#CBCBCB"
                      fontWeight="500"
                      fontFamily="sans-serif"
                      letterSpacing="0.3"
                      transform={`rotate(${textRotation}, ${lx}, ${ly})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}

              {SEGMENTS.map((_, i) => {
                const angle = (360 / SEGMENTS.length) * i - 90;
                const x2 = cx + r * Math.cos(toRad(angle));
                const y2 = cy + r * Math.sin(toRad(angle));
                return (
                  <line
                    key={`div-${i}`}
                    x1={cx}
                    y1={cy}
                    x2={x2}
                    y2={y2}
                    stroke="#2a2a2a"
                    strokeWidth="1.5"
                  />
                );
              })}

              <circle
                cx={cx}
                cy={cy}
                r="16"
                fill="#1a1a1a"
                stroke="#333"
                strokeWidth="2"
              />
              <circle cx={cx} cy={cy} r="7" fill="#333" />
            </svg>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
          {isWaitingForChain ? (
            /* Waiting for VRF result from chain */
            <div className="flex items-center gap-4">
              <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/20" />
                <span className="relative inline-flex h-5 w-5 rounded-full bg-white/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F3F3F3]">
                  Waiting for on-chain result&hellip;
                </p>
                <p className="mt-0.5 text-xs text-[#8A8A8A]">
                  The VRF is resolving your spin. The wheel will launch automatically.
                </p>
              </div>
            </div>
          ) : (
            /* Default: prompt user to stake */
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-[#8A8A8A]">
                    Stake first
                  </p>
                  <p className="mt-2 text-base font-medium text-[#F3F3F3]">
                    Pick your amount before spinning.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onPlay}
                  disabled={isLoading}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Confirming…" : "Set stake"}
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#9A9A9A]">
                The wheel starts as soon as your transaction is confirmed on-chain.
              </p>
            </>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
};
