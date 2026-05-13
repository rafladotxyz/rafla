"use client";
import { useState, useRef, useEffect } from "react";
import Yay from "@/assets/yay.svg";
import Breakeven from "@/assets/eq.svg";
import Nay from "@/assets/nay.svg";
import Image from "next/image";

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

const PRICE_OPTIONS = ["$1", "$2", "$3", "$5"];

const SPIN_DURATION = 8000;
const MIN_SPINS = 5;

const SIZE = 500;
const cx = SIZE / 2;
const cy = SIZE / 2;
const r = SIZE / 2 - 4;
const IMG_SIZE = 64;

export const SpinWheel = ({
  //betAmount = "$1",
  onResult,
  externalSpinTrigger,
  targetIndex,
  onSpinRequest,
  isLoading,
}: {
  betAmount?: string;
  onResult?: (segment: Segment) => void;
  externalSpinTrigger?: boolean;
  targetIndex?: number | null;
  onSpinRequest?: (amount: number) => void;
  isLoading?: boolean;
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<Segment | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const currentRotation = useRef(0);

  const spin = (forcedIndex?: number) => {
    if (spinning) return;
    setSpinning(true);
    setLanded(null);

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
      setLanded(SEGMENTS[segmentIndex]);
      onResult?.(SEGMENTS[segmentIndex]);
    }, SPIN_DURATION);
  };

  // Sync with external trigger
  useEffect(() => {
    if (externalSpinTrigger && targetIndex !== undefined && targetIndex !== null) {
      spin(targetIndex);
    }
  }, [externalSpinTrigger, targetIndex]);

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <div className="flex flex-col items-center gap-8 select-none w-full max-w-[500px] mx-auto">
      {/* Wheel wrapper */}
      <div className="relative w-full aspect-square">
        {/* Pointer — fixed above wheel center */}
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

        {/* Spinning container */}
        <div
          className="w-full h-full rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
              : "none",
          }}
        >
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer ring */}
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

              // Image center — closer to middle
              const imgR = r * 0.45;
              const ix = cx + imgR * Math.cos(midAngle);
              const iy = cy + imgR * Math.sin(midAngle);

              // Label — further out toward edge
              const labelR = r * 0.72;
              const lx = cx + labelR * Math.cos(midAngle);
              const ly = cy + labelR * Math.sin(midAngle);

              const textRotation = startAngle + angle / 2 + 90;

              return (
                <g key={i}>
                  {/* Segment */}
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke={seg.strokeColor}
                    strokeWidth="1"
                  />

                  {/* Asset image */}
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

                  {/* Label */}
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

            {/* Divider lines */}
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

            {/* Center hub */}
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
      {/** To do Price Selection Tab */}
      <div className="flex gap-2 w-full px-2">
        {PRICE_OPTIONS.map((price) => (
          <button
            key={price}
            onClick={() => setSelectedPrice(price)}
            className={`flex-1 h-12 rounded-xl border text-[15px] font-medium transition-all ${
              selectedPrice === price
                ? "border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                : "border-white/5 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            {price}
          </button>
        ))}
      </div>

      {/* Spin button */}
      <div className="w-full px-2">
        <button
          onClick={() => {
            if (onSpinRequest) {
              const amount = selectedPrice ? Number(selectedPrice.replace("$", "")) : 1;
              onSpinRequest(amount);
            } else {
              spin();
            }
          }}
          disabled={spinning || isLoading}
          className={`w-full h-14 rounded-2xl text-[16px] font-bold transition-all border shadow-xl ${
            spinning || isLoading
              ? "bg-[#1a1a1a] text-[#4a4a4a] cursor-not-allowed border-[#282828]"
              : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-transparent"
          }`}
        >
          {spinning
            ? "Spinning..."
            : isLoading
              ? "Waiting for Tx..."
              : `Spin ${selectedPrice ? "with " + selectedPrice : ""} to find out`}
        </button>
      </div>


     
    </div>
  );
};
