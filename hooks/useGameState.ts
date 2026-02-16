"use client";

import { useState, useEffect } from "react";
import { GameState, Player } from "@/type/types";

// Mock data - replace with actual API/WebSocket calls
export function useGameState(roomId: string) {
  const [gameState, setGameState] = useState<GameState>({
    roomId,
    pricePool: 15.0,
    totalPlayers: 3,
    minPlayers: 3,
    yourEntry: 5.0,
    potentialWin: 15.0,
    drawTime: Date.now() + 150000, // 2:30 from now
    isLive: true,
    status: "waiting",
  });

  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      address: "0x3k19...00hgio",
      avatar: "🎮",
      isYou: true,
      color: "#8B5CF6",
    },
    {
      id: "2",
      address: "0x7b21...x9p2ae",
      avatar: "⚡",
      color: "#EAB308",
    },
    {
      id: "3",
      address: "0x8d02...17fghp",
      avatar: "🎯",
      color: "#EF4444",
    },
    {
      id: "4",
      address: "0x8d02...17fghp",
      avatar: "🎯",
      color: "#EF4444",
    },
    {
      id: "5",
      address: "0x8d02...17fghp",
      avatar: "🎯",
      color: "#EF4444",
    },
    {
      id: "6",
      address: "0x8d02...17fghp",
      avatar: "🎯",
      color: "#EF4444",
    },
    {
      id: "7",
      address: "0x8d02...17fghp",
      avatar: "🎯",
      color: "#EF4444",
    },
    {
      id: "8",
      address: "0x8d02...17fghp",
      avatar: "🎯",
      color: "#EF4444",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    // Replace with actual WebSocket connection
    const interval = setInterval(() => {
      // Update game state here
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId]);

  const addEntry = async (amount: number) => {
    setLoading(true);
    try {
      // Call API to add entry
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setGameState((prev) => ({
        ...prev,
        yourEntry: prev.yourEntry + amount,
        pricePool: prev.pricePool + amount,
        potentialWin: prev.potentialWin + amount,
      }));
    } catch (error) {
      console.error("Failed to add entry:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    gameState,
    players,
    loading,
    addEntry,
  };
}
