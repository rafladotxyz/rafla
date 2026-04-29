import Pusher from "pusher";

const globalForPusher = globalThis as unknown as {
  pusher: Pusher | undefined;
};

export const pusher =
  globalForPusher.pusher ??
  new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  });

if (process.env.NODE_ENV !== "production") globalForPusher.pusher = pusher;

// ── Channel helpers ───────────────────────────────────────────────────────────

export const roomChannel = (roomId: string) => `room-${roomId}`;

// ── Event names ───────────────────────────────────────────────────────────────

export const PUSHER_EVENTS = {
  PLAYER_JOINED: "player-joined",
  GAME_STARTED: "game-started",
  RESULT_REVEALED: "result-revealed",
  ROUND_CANCELLED: "round-cancelled",
} as const;

export type PusherEvent = (typeof PUSHER_EVENTS)[keyof typeof PUSHER_EVENTS];

// ── Shared payload types ──────────────────────────────────────────────────────

export interface PlayerJoinedPayload {
  participant: {
    userId: string;
    wallet: string;
    username: string | null;
    avatar: string | null;
    txHash: string | null;
    joinedAt: string;
  };
  totalPlayers: number;
}

export interface GameStartedPayload {
  roomId: string;
  drawTime: string;
}

export interface ResultRevealedPayload {
  winnerId: string;
  winnerWallet: string;
  winnerUsername: string | null;
  prizeAmount: string;
  txHash: string;
  vrfRequestId: string | null;
}

export interface RoundCancelledPayload {
  roomId: string;
  reason: string;
}
