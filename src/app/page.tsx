"use client";

import { useRouter } from "next/navigation";
import TypingTest from "@/components/TypingTest";
import ThemeSelector from "@/components/ThemeSelector";

export default function Home() {
  const router = useRouter();

  const createRoom = () => {
    const roomId = crypto.randomUUID().slice(0, 8);
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeSelector />
      </div>
      <h1 className="text-[var(--color-text-dim)] text-sm mb-12 tracking-widest">
        monkeytype
      </h1>
      <TypingTest />
      <button
        onClick={createRoom}
        className="mt-12 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors text-sm"
      >
        multiplayer
      </button>
    </main>
  );
}
