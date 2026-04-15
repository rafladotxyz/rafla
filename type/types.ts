export interface GameState {
  roomId: string;
  pricePool: number;
  players: Player[];
  totalPlayers: number;
  minPlayers: number;
  yourEntry: number;
  potentialWin: number;
  drawTime: number; // unix ms
  isLive: boolean;
  status: "waiting" | "active" | "completed" | "cancelled";
}

export interface Player {
  id: string;
  address: string;
  username?: string | null;
  avatar?: string | null;
  isYou?: boolean;
  color: string;
}
export interface RoomInfo {
  roomLink: string;
  chain: string;
}
