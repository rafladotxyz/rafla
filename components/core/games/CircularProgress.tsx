"use client";

interface CircularProgressProps {
  progress: number;
  strokeWidth?: number;
  className?: string;
}

// ViewBox-based so the parent controls rendered size (stays responsive).
export function CircularProgress({
  progress,
  strokeWidth = 2,
  className,
}: CircularProgressProps) {
  const size = 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={`h-full w-full -rotate-90 ${className ?? ""}`}
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2A2A2A"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#D9D9D9"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-linear"
      />
    </svg>
  );
}
