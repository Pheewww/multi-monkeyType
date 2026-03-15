"use client";

import { useRef, useEffect } from "react";
import { WordState } from "@/hooks/useTypingTest";

interface Props {
  words: WordState[];
  currentWordIndex: number;
  isFinished: boolean;
  opponentWordIndex?: number;
}

export default function WordDisplay({ words, currentWordIndex, isFinished, opponentWordIndex }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const word = activeWordRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const wordTop = word.getBoundingClientRect().top;
      const offset = wordTop - containerTop;
      if (offset > 80) {
        container.scrollTop += offset - 40;
      }
    }
  }, [currentWordIndex]);

  return (
    <div
      ref={containerRef}
      className="relative text-2xl leading-10 h-[120px] overflow-hidden select-none"
    >
      {words.map((wordState, wi) => {
        const isActive = wi === currentWordIndex && !isFinished;
        const isPast = wi < currentWordIndex;
        const isOpponentWord = opponentWordIndex !== undefined && wi === opponentWordIndex;
        const { word, typed } = wordState;

        return (
          <span
            key={wi}
            ref={isActive ? activeWordRef : undefined}
            className={`inline-block mr-3 ${isPast && typed !== word ? "border-b-2 border-[var(--color-error)]" : ""} ${isOpponentWord ? "bg-[var(--color-text-dim)]/20 rounded" : ""}`}
          >
            {word.split("").map((char, ci) => {
              let color = "text-[var(--color-text-dim)]"; // untyped
              if (ci < typed.length) {
                color = typed[ci] === char ? "text-[var(--color-correct)]" : "text-[var(--color-error)]";
              }
              const showCursor = isActive && ci === typed.length;
              const showOpponentCursor = isOpponentWord && ci === 0 && !showCursor;
              return (
                <span key={ci} className={`${color} ${showCursor ? "border-l-2 border-[var(--color-accent)] cursor-blink" : ""} ${showOpponentCursor ? "border-l-2 border-[var(--color-error)]" : ""}`}>
                  {char}
                </span>
              );
            })}
            {/* Extra typed characters beyond word length */}
            {typed.length > word.length &&
              typed
                .slice(word.length)
                .split("")
                .map((char, ci) => (
                  <span key={`extra-${ci}`} className="text-[var(--color-error)] opacity-70">
                    {char}
                  </span>
                ))}
            {/* Cursor at end of word */}
            {isActive && typed.length >= word.length && (
              <span className="border-l-2 border-[var(--color-accent)] cursor-blink">&zwj;</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
