"use client";

import { SpinView } from "@/components/core/games/spin";

interface DrawGamePageProps {
  params: {
    roomId: string;
  };
}

export default function DrawGamePage({ params }: DrawGamePageProps) {
  return (
    <div className="px-4 py-0  font-sans">
      <SpinView roomId={params.roomId} />
    </div>
  );
}
