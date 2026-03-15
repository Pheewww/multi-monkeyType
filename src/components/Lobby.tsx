"use client";

import { Player } from "@/lib/protocol";

interface Props {
  players: Player[];
  isOwner: boolean;
  onStart: () => void;
  roomId: string;
}

export default function Lobby({ players, isOwner, onStart, roomId }: Props) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/room/${roomId}` : "";
  const canStart = isOwner && players.length === 2;

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-[var(--color-accent)] text-2xl font-bold">waiting for opponent</h2>

      <div className="flex flex-col gap-3 w-64">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-[var(--color-bg-secondary)] px-4 py-3 rounded"
          >
            <span className="text-[var(--color-text)]">{p.name}</span>
            {p.isOwner && (
              <span className="text-xs text-[var(--color-accent)]">owner</span>
            )}
          </div>
        ))}
        {players.length < 2 && (
          <div className="flex items-center justify-center bg-[var(--color-bg-secondary)] px-4 py-3 rounded border border-dashed border-[var(--color-text-dim)]">
            <span className="text-[var(--color-text-dim)] text-sm">waiting...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-[var(--color-text-dim)] text-xs">share this link</span>
        <button
          onClick={() => navigator.clipboard.writeText(link)}
          className="bg-[var(--color-bg-secondary)] px-4 py-2 rounded text-sm text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
        >
          {link}
        </button>
      </div>

      {isOwner && (
        <button
          onClick={onStart}
          disabled={!canStart}
          className={`px-8 py-3 rounded font-bold text-lg transition-colors ${
            canStart
              ? "bg-[var(--color-accent)] text-[var(--color-bg)] hover:opacity-90"
              : "bg-[var(--color-bg-secondary)] text-[var(--color-text-dim)] cursor-not-allowed"
          }`}
        >
          start
        </button>
      )}
    </div>
  );
}
