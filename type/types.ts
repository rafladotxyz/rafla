export interface Player {
  id: string;
  address: string;
  avatar: string;
  isYou?: boolean;
  color: string;
}

export interface GameState {
  roomId: string;
  pricePool: number;
  totalPlayers: number;
  minPlayers: number;
  yourEntry: number;
  potentialWin: number;
  drawTime: number; // timestamp
  isLive: boolean;
  status: "waiting" | "drawing" | "completed";
}

export interface RoomInfo {
  roomLink: string;
  chain: string;
}
