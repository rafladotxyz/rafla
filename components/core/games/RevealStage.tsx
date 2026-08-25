"use client";

import { useEffect, useRef } from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

// Fullscreen staging for game reveals: dims the world, focuses the payoff.
// Escape and backdrop clicks close via onClose when provided.
export function RevealStage({
  children,
  label,
  onClose,
}: {
  children: React.ReactNode;
  label: string;
  onClose?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onClose) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const primary = cardRef.current?.querySelector<HTMLButtonElement>(
      "button:not(:disabled)",
    );
    primary?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 px-3 py-3 backdrop-blur-xl animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes revealStageIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .reveal-stage-enter {
          animation: revealStageIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
      <div ref={cardRef} className="reveal-stage-enter w-full max-w-[480px]">
        <SurfaceCard className="p-3 sm:p-4">{children}</SurfaceCard>
      </div>
    </div>
  );
}
