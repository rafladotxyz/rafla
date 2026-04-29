"use client";

import { useEffect, useRef } from "react";
import PusherClient from "pusher-js";
import {
  PUSHER_EVENTS,
  PlayerJoinedPayload,
  GameStartedPayload,
  ResultRevealedPayload,
  RoundCancelledPayload,
} from "@/lib/pusher";

interface UsePusherRoomOptions {
  roomId: string;
  onPlayerJoined?: (data: PlayerJoinedPayload) => void;
  onGameStarted?: (data: GameStartedPayload) => void;
  onResultRevealed?: (data: ResultRevealedPayload) => void;
  onRoundCancelled?: (data: RoundCancelledPayload) => void;
}

export function usePusherRoom({
  roomId,
  onPlayerJoined,
  onGameStarted,
  onResultRevealed,
  onRoundCancelled,
}: UsePusherRoomOptions) {
  // Keep callbacks in refs so we don't re-subscribe when they change
  const onPlayerJoinedRef = useRef(onPlayerJoined);
  const onGameStartedRef = useRef(onGameStarted);
  const onResultRevealedRef = useRef(onResultRevealed);
  const onRoundCancelledRef = useRef(onRoundCancelled);

  useEffect(() => {
    onPlayerJoinedRef.current = onPlayerJoined;
    onGameStartedRef.current = onGameStarted;
    onResultRevealedRef.current = onResultRevealed;
    onRoundCancelledRef.current = onRoundCancelled;
  });

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.warn(
        "[usePusherRoom] Missing NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER",
      );
      return;
    }

    // Skip empty state room
    if (!roomId || roomId === "3455654") return;

    const pusher = new PusherClient(key, {
      cluster,
    });

    const channel = pusher.subscribe(`room-${roomId}`);

    channel.bind(PUSHER_EVENTS.PLAYER_JOINED, (data: PlayerJoinedPayload) => {
      onPlayerJoinedRef.current?.(data);
    });

    channel.bind(PUSHER_EVENTS.GAME_STARTED, (data: GameStartedPayload) => {
      onGameStartedRef.current?.(data);
    });

    channel.bind(
      PUSHER_EVENTS.RESULT_REVEALED,
      (data: ResultRevealedPayload) => {
        onResultRevealedRef.current?.(data);
      },
    );

    channel.bind(
      PUSHER_EVENTS.ROUND_CANCELLED,
      (data: RoundCancelledPayload) => {
        onRoundCancelledRef.current?.(data);
      },
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`room-${roomId}`);
      pusher.disconnect();
    };
  }, [roomId]); // only re-subscribe if roomId changes
}
