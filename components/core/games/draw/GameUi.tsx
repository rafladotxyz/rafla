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
  <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center w-full max-w-6xl mx-auto gap-6 md:gap-8 lg:gap-12 py-4 md:py-6">
    <div className="w-full max-w-sm order-2 lg:order-1">
      <PlayersCard
        players={players}
        totalPlayers={gameState.totalPlayers}
        minPlayers={gameState.minPlayers}
      />
    </div>
    
    <div className="flex flex-col items-center gap-6 md:gap-8 order-1 lg:order-2 w-full lg:w-auto">
      <DrawTimer drawTime={gameState.drawTime} isLive={gameState.isLive} />
      
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs md:text-sm p-3 rounded-xl animate-shake">
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
  </div>
);
