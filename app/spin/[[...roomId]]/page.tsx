"use client";

import { SpinView } from "@/components/core/games/spin";
import { use } from "react";

interface Props {
  params: Promise<{ roomId?: string[] }>;
}

export default function SpinRoomPage({ params }: Props) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId ? resolvedParams.roomId[0] : "3455654";

  return (
    <div className="px-4 py-0 font-sans">
      <SpinView roomId={roomId} />
    </div>
  );
}
