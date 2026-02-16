"use client";

import { useTimer } from "../../hooks/useTimer";
import { CircularProgress } from "./CircularProgress";
import { LiveBadge } from "./LiveBadge";

interface DrawTimerProps {
  drawTime: number;
  isLive: boolean;
}

export function DrawTimer({ drawTime, isLive }: DrawTimerProps) {
  const { minutes, seconds, progress, isExpired } = useTimer(drawTime);

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="relative flex items-center justify-center">
      {/* Circular Progress Ring */}
      <CircularProgress progress={progress} size={384} strokeWidth={2} />

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isLive && <LiveBadge />}

        <span className="text-sm text-[#F97316] mb-2 font-medium">
          {isExpired ? "Drawing..." : "Drawing in"}
        </span>

        <time className="text-8xl font-bold text-[#E8E8E8] tabular-nums tracking-tight">
          {isExpired ? "0:00" : formattedTime}
        </time>

        <span className="text-sm text-[#6B6B6B] mt-1">minutes</span>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F97316] blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
