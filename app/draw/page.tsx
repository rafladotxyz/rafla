"use client";

import { DrawView } from "@/components/core/games/draw";

interface DrawGamePageProps {
  params: {
    roomId: string;
  };
}

export default function DrawGamePage({ params }: DrawGamePageProps) {
  return (
    <div className="px-4 py-0">
      <DrawView roomId={params.roomId} />
    </div>
  );
}
