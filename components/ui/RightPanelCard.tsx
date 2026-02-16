"use client";

import { PricePoolCard } from "./PricePoolCard";
import { EntryInfoCard } from "./EntryInfoCard";
import { RoomLinkCard } from "./RoomLinkCard";
import { AddEntryButton } from "./AddEntryButton";

interface RightPanelProps {
  pricePool: number;
  yourEntry: number;
  potentialWin: number;
  roomLink: string;
  entryAmount: number;
  loading: boolean;
  onAddEntry: () => void;
}

export function RightPanel({
  pricePool,
  yourEntry,
  potentialWin,
  roomLink,
  entryAmount,
  loading,
  onAddEntry,
}: RightPanelProps) {
  return (
    <div className="space-y-4">
      <PricePoolCard amount={pricePool} />
      <EntryInfoCard yourEntry={yourEntry} potentialWin={potentialWin} />
      <RoomLinkCard roomLink={roomLink} />
      <AddEntryButton
        amount={entryAmount}
        loading={loading}
        onClick={onAddEntry}
      />
    </div>
  );
}
