"use client";

import { useTimer } from "../../../../hooks/useTimer";
import { CircularProgress } from "../CircularProgress";
import { LiveBadge } from "../LiveBadge";

interface DrawTimerProps {
  drawTime: number;
  isLive: boolean;
}

export function DrawTimer({ drawTime, isLive }: DrawTimerProps) {
  const { minutes, seconds, progress, isExpired } = useTimer(drawTime);

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const totalSeconds = minutes * 60 + seconds;
  // Announce only near the end so screen readers aren't spammed every second.
  const announce = !isLive ? undefined : isExpired
    ? "Drawing now"
    : totalSeconds <= 10
      ? `${totalSeconds} seconds remaining`
      : undefined;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[384px]">
      <CircularProgress progress={progress} strokeWidth={2} />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        role="timer"
        aria-live={announce !== undefined ? "assertive" : "off"}
        aria-label={
          isExpired ? "Drawing now" : `Drawing in ${formattedTime}`
        }
      >
        {isLive && <LiveBadge />}

        <span className="mb-2 text-sm font-medium text-[#CBCBCB]">
          {isExpired ? "Drawing…" : "Drawing in"}
        </span>

        <time className="text-7xl font-bold tabular-nums tracking-tight text-[#F3F3F3] sm:text-8xl">
          {isExpired ? "0:00" : formattedTime}
        </time>

        <span className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8A8A8A]">
          min : sec
        </span>
        <span className="sr-only">{announce}</span>
      </div>
    </div>
  );
}
