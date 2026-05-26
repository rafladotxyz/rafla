"use client";

type SurfaceCardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

const baseClasses =
  "relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/25 backdrop-blur-xl";

export function SurfaceCard({
  children,
  className = "",
  as: Tag = "div",
}: SurfaceCardProps) {
  return (
    <Tag className={`${baseClasses} ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}

