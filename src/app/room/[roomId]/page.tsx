"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import MultiplayerTypingTest from "@/components/MultiplayerTypingTest";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-[var(--color-text-dim)] text-sm mb-12 tracking-widest">monkeytype</h1>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-[var(--color-accent)] text-xl font-bold">enter your name</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) setJoined(true);
            }}
            placeholder="name"
            autoFocus
            className="bg-[var(--color-bg-secondary)] text-[var(--color-text)] px-4 py-3 rounded text-center text-lg outline-none border border-[var(--color-text-dim)] focus:border-[var(--color-accent)] transition-colors"
          />
          <button
            onClick={() => name.trim() && setJoined(true)}
            disabled={!name.trim()}
            className={`px-8 py-3 rounded font-bold transition-colors ${
              name.trim()
                ? "bg-[var(--color-accent)] text-[var(--color-bg)] hover:opacity-90"
                : "bg-[var(--color-bg-secondary)] text-[var(--color-text-dim)] cursor-not-allowed"
            }`}
          >
            join
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-[var(--color-text-dim)] text-sm mb-12 tracking-widest">monkeytype</h1>
      <MultiplayerTypingTest roomId={roomId} playerName={name.trim()} />
    </main>
  );
}
