"use client";

import { DrawView } from "@/components/core/games/draw";
import { use } from "react";

interface Props {
  params: Promise<{ roomId?: string[] }>;
}

export default function DrawRoomPage({ params }: Props) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId?.[0];

  return (
    <div className="px-4 py-0 font-sans">
      <DrawView roomId={roomId} />
    </div>
  );
}
