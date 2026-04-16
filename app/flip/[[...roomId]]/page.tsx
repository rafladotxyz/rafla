"use client";

import { FlipView } from "@/components/core/games/flip";
import { use } from "react";

interface Props {
  params: Promise<{ roomId?: string[] }>;
}

export default function FlipRoomPage({ params }: Props) {
  // 2. Unwrap the params promise using the 'use' hook
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId ? resolvedParams.roomId[0] : "3455654";
  return (
    <div className="px-4 py-0 font-sans">
      <FlipView roomId={roomId} />
    </div>
  );
}
