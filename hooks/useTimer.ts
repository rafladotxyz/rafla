"use client";

import { useState, useEffect } from "react";
import { getTimeRemaining } from "@/utils/utils";

export function useTimer(targetTime: number) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(targetTime),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(targetTime);
      setTimeRemaining(remaining);

      if (remaining.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const progress = Math.max(
    0,
    Math.min(100, ((150000 - timeRemaining.total) / 150000) * 100),
  );

  return {
    minutes: timeRemaining.minutes,
    seconds: timeRemaining.seconds,
    isExpired: timeRemaining.total <= 0,
    progress,
  };
}
