"use client";
import { useState, useRef } from "react";

type Segment = {
  label: string;
  emoji: string;
  color: string;
};

const SEGMENTS: Segment[] = [
  { label: "You Lose!", emoji: "🪨", color: "#1a1a1a" },
  { label: "Breakeven!", emoji: "⚖️", color: "#222222" },
  { label: "Yaay $2 won!", emoji: "🏆", color: "#111111" },
];

const SPIN_DURATION = 4000; // ms
const MIN_SPINS = 5;

export const SpinWheel = ({
  betAmount = "$1",
  onResult,
}: {
  betAmount?: string;
  onResult?: (segment: Segment) => void;
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<Segment | null>(null);
  const currentRotation = useRef(0);

  const spin = () => {
    if (spinning) return;

    setSpinning(true);
    setLanded(null);

    // Pick a random segment (0, 1, or 2)
    const segmentIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length; // 120deg each

    // Calculate the extra rotation to land on segmentIndex
    // Each segment center offset from top: segmentIndex * 120 + 60
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

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Wheel wrapper */}
      <div className="relative w-[420px] h-[420px]">
        {/* Pointer triangle at top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "20px solid #D9D9D9",
          }}
        />

        {/* Spinning wheel */}
        <div
          className="w-full h-full rounded-full overflow-hidden border-4 border-[#2a2a2a] shadow-2xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
              : "none",
          }}
        >
          <svg
            viewBox="0 0 420 420"
            width="420"
            height="420"
            xmlns="http://www.w3.org/2000/svg"
          >
            {SEGMENTS.map((seg, i) => {
              const total = SEGMENTS.length;
              const angle = 360 / total;
              const startAngle = i * angle - 90; // start from top
              const endAngle = startAngle + angle;

              const toRad = (deg: number) => (deg * Math.PI) / 180;
              const cx = 210;
              const cy = 210;
              const r = 210;

              const x1 = cx + r * Math.cos(toRad(startAngle));
              const y1 = cy + r * Math.sin(toRad(startAngle));
              const x2 = cx + r * Math.cos(toRad(endAngle));
              const y2 = cy + r * Math.sin(toRad(endAngle));

              const midAngle = toRad(startAngle + angle / 2);
              const labelR = r * 0.58;
              const lx = cx + labelR * Math.cos(midAngle);
              const ly = cy + labelR * Math.sin(midAngle);
              const textRotation = startAngle + angle / 2 + 90;

              return (
                <g key={i}>
                  {/* Segment fill */}
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="#333"
                    strokeWidth="1.5"
                  />
                  {/* Emoji */}
                  <text
                    x={lx}
                    y={ly - 18}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="36"
                    transform={`rotate(${textRotation}, ${lx}, ${ly})`}
                  >
                    {seg.emoji}
                  </text>
                  {/* Label */}
                  <text
                    x={lx}
                    y={ly + 26}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="13"
                    fill="#D9D9D9"
                    fontWeight="500"
                    fontFamily="sans-serif"
                    transform={`rotate(${textRotation}, ${lx}, ${ly})`}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx="210" cy="210" r="12" fill="#333" />
          </svg>
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning}
        className={`w-[420px] h-12 rounded-2xl text-[15px] font-medium transition-colors border border-[#282828] ${
          spinning
            ? "bg-[#1a1a1a] text-[#4a4a4a] cursor-not-allowed"
            : "bg-[#1a1a1a] text-[#D9D9D9] hover:bg-[#222] cursor-pointer"
        }`}
      >
        {spinning ? "Spinning..." : `Spin with ${betAmount} to find out`}
      </button>

      {/* Result badge */}
      {landed && !spinning && (
        <div className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#282828] text-[14px] text-[#D9D9D9]">
          {landed.emoji} {landed.label}
        </div>
      )}
    </div>
  );
};
