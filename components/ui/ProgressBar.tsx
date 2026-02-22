"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const BAR_COLOR = "#229EFF"; // your Rafla blue

const HEIGHT = 3; // px

export const ProgressBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    const bar = barRef.current;
    if (!bar) return;

    // Reset
    bar.style.transition = "none";
    bar.style.width = "0%";
    bar.style.opacity = "1";

    // Fake progress — jump to 80% quickly, then slow down
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.transition = "width 800ms ease";
        bar.style.width = "70%";

        timerRef.current = setTimeout(() => {
          bar.style.transition = "width 3000ms ease";
          bar.style.width = "90%";
        }, 800);
      });
    });
  };

  const finish = () => {
    const bar = barRef.current;
    if (!bar) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    bar.style.transition = "width 200ms ease";
    bar.style.width = "100%";

    timerRef.current = setTimeout(() => {
      bar.style.transition = "opacity 300ms ease";
      bar.style.opacity = "0";

      timerRef.current = setTimeout(() => {
        bar.style.width = "0%";
      }, 300);
    }, 200);
  };

  // Fire on every route change
  useEffect(() => {
    start();
    const timeout = setTimeout(finish, 100); // finish shortly after route settles
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none"
      style={{ height: HEIGHT }}
    >
      <div
        ref={barRef}
        style={{
          height: "100%",
          width: "0%",
          opacity: 0,
          background: BAR_COLOR,
          boxShadow: `0 0 8px ${BAR_COLOR}, 0 0 2px ${BAR_COLOR}`,
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
};
