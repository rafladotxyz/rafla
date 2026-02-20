"use client";

import { FlipView } from "@/components/core/games/flip";

interface DrawGamePageProps {
  params: {
    roomId: string;
  };
}

export default function DrawGamePage({ params }: DrawGamePageProps) {
  return (
    <div className="px-4 py-0  font-sans">
      <FlipView roomId={params.roomId} />
    </div>
  );
}
