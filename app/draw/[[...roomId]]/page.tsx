"use client";

import { use } from "react"; // 1. Import 'use'
import { DrawView } from "@/components/core/games/draw";

interface Props {
  params: Promise<{ roomId?: string[] }>;
}

export default function DrawRoomPage({ params }: Props) {
  // 2. Unwrap the params promise using the 'use' hook
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId ? resolvedParams.roomId[0] : "3455654";

  return (
    <div className="px-4 py-0 font-sans">
      <DrawView roomId={roomId} />
    </div>
  );
}
