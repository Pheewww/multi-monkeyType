"use client";

import { useState, useRef, useEffect } from "react";
import { useTypingTest } from "@/hooks/useTypingTest";
import WordDisplay from "./WordDisplay";
import TimerSelector from "./TimerSelector";
import Results from "./Results";

export default function TypingTest() {
  const [duration, setDuration] = useState(30);
  const { words, currentWordIndex, status, timeLeft, handleKeyDown, restart, getResults } =
    useTypingTest(duration);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep focus on container
  useEffect(() => {
    containerRef.current?.focus();
  }, [status, duration]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none max-w-3xl mx-auto"
    >
      {status === "finished" ? (
        <Results results={getResults()} onRestart={restart} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <TimerSelector duration={duration} onSelect={setDuration} />
            <div
              className={`text-2xl font-bold transition-colors ${
                status === "running" ? "text-[var(--color-accent)]" : "text-[var(--color-text-dim)]"
              }`}
            >
              {timeLeft}
            </div>
          </div>
          <WordDisplay
            words={words}
            currentWordIndex={currentWordIndex}
            isFinished={false}
          />
          <div className="text-center mt-6 text-sm text-[var(--color-text-dim)]">
            {status === "idle" && "start typing to begin"}
          </div>
        </>
      )}
    </div>
  );
}
