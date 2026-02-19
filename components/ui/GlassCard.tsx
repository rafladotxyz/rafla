"use client";

import { useState } from "react";
//import { cn } from "@/lib/utils"; // or however you handle classnames

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className, onClick }: GlassCardProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 border-[#141414] transition-all duration-500
        hover:border-[#2A2A2A] hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-1
        ${onClick && "cursor-pointer"}
        ${className}
      `}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onClick={onClick}
    >
      {/* Animated Border Shimmer */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-slow" />
      </div>

      {/* Static Glass Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-xl" />

      {/* Radial Ambient Glow */}
      <div
        className={`absolute -inset-1 bg-gradient-radial from-white/5 via-transparent to-transparent blur-xl pointer-events-none transition-opacity duration-500 ${
          isActive ? "opacity-100" : "opacity-40"
        }`}
      />

      {/* Main Shimmer Sweep */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Secondary Shimmer (Delayed) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 delay-150 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] delay-200 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Corner Accents */}
      <div
        className={`absolute top-0 left-0 w-8 h-8 border-l border-t border-white/20 rounded-tl-xl transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute bottom-0 right-0 w-8 h-8 border-r border-b border-white/20 rounded-br-xl transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden pointer-events-none">
        <div
          className={`h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ${
            isActive ? "translate-x-0" : "-translate-x-full"
          }`}
        />
      </div>

      {/* Content sits on top of everything */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
