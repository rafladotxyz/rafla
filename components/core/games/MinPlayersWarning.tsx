"use client";

interface MinPlayersWarningProps {
  current: number;
  required: number;
}

export function MinPlayersWarning({
  current,
  required,
}: MinPlayersWarningProps) {
  const remaining = Math.max(0, required - current);

  if (remaining === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
      <p className="text-sm text-[#F97316]">
        Min {remaining} {remaining === 1 ? "player" : "players"} to start
      </p>
    </div>
  );
}
