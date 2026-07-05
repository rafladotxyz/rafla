"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type ModalShellProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  description?: string;
  className?: string;
};

export function ModalShell({
  children,
  onClose,
  title,
  description,
  className = "",
}: ModalShellProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/70 px-3 py-3 sm:p-4 backdrop-blur-xl"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full max-w-[520px] max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0B0B0F]/95 shadow-[0_24px_120px_rgba(0,0,0,0.55)] ${className}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative z-10 flex flex-col min-h-0 flex-1">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A8A8A]">
                Rafla
              </p>
              <h2 className="text-lg font-semibold text-[#F3F3F3] sm:text-xl">
                {title}
              </h2>
              {description ? (
                <p className="text-sm leading-relaxed text-[#A3A3A3]">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#CBCBCB] transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

