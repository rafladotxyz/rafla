"use client";
import { useState, useRef } from "react";
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
}: {
  betAmount?: string;
  onResult?: (segment: Segment) => void;
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<Segment | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const currentRotation = useRef(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setLanded(null);

    const segmentIndex = Math.floor(Math.random() * SEGMENTS.length);
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

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <div className="flex flex-col items-center gap-5 select-none">
      {/* Wheel wrapper */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* Pointer — fixed above wheel center */}
        <div
          className="absolute left-1/2 z-20"
          style={{
            top: -10,
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: "24px solid #D9D9D9",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))",
          }}
        />

        {/* Spinning container */}
        <div
          className="w-full h-full rounded-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
              : "none",
          }}
        >
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
            height={SIZE}
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
      <div className="flex gap-2 w-full">
        {PRICE_OPTIONS.map((price) => (
          <button
            key={price}
            onClick={() => setSelectedPrice(price)}
            className={`flex-1 h-10 rounded-lg border text-[14px] text-[#CBCBCB] transition-colors ${
              selectedPrice === price
                ? "border-[#CBCBCB] bg-[#1f1f1f]"
                : "border-[#282828] bg-[#0A0A0A]"
            }`}
          >
            {price}
          </button>
        ))}
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning}
        style={{ width: SIZE }}
        className={`h-12 rounded-2xl text-[15px] font-medium transition-all border ${
          spinning
            ? "bg-[#1a1a1a] text-[#4a4a4a] cursor-not-allowed border-[#282828]"
            : "bg-[#E8E8E8] text-[#0a0a0a] hover:bg-white cursor-pointer border-transparent"
        }`}
      >
        {spinning
          ? "Spinning..."
          : `Spin with ${selectedPrice || "0"} to find out`}
      </button>

      {/* Result badge 
      {landed && !spinning && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#282828] text-[14px] text-[#D9D9D9]">
          <Image src={landed.asset} alt={landed.label} width={20} height={20} />
          {landed.label}
        </div>
      )}*/}
    </div>
  );
};
