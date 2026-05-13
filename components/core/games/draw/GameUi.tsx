import { GameState, Player } from "@/hooks/useGameState";
import { PlayersCard } from "../cards/PlayerCard";
import { RightPanel } from "../RightPanelCard";
import { DrawTimer } from "./DrawTimer";

// Game UI shared between public and private
export const GameUI = ({
  isPrivate,
  players,
  gameState,
  loading,
  onAddEntry,
  roomId,
  error,
}: {
  isPrivate: boolean;
  players: Player[];
  gameState: GameState;
  loading: boolean;
  onAddEntry: () => Promise<void>;
  roomId?: string;
  error?: string | null;
}) => (
  <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full max-w-6xl mx-auto gap-8 md:gap-12 py-6">
    <PlayersCard
      players={players}
      totalPlayers={gameState.totalPlayers}
      minPlayers={gameState.minPlayers}
    />
    <DrawTimer drawTime={gameState.drawTime} isLive={gameState.isLive} />
    <div className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl animate-shake">
          {error}
        </div>
      )}
      <RightPanel
        pricePool={gameState.pricePool}
        yourEntry={gameState.yourEntry}
        potentialWin={gameState.potentialWin}
        isPrivate={isPrivate}
        roomLink={isPrivate ? `https://rafla.xyz/draw/${roomId}` : ""}
        entryAmount={5.0}
        loading={loading}
        onAddEntry={onAddEntry}
      />
    </div>
  </div>
);
