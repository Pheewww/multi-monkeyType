"use client";

import { useRef, useEffect } from "react";
import { useMultiplayerTest } from "@/hooks/useMultiplayerTest";
import WordDisplay from "./WordDisplay";
import Results from "./Results";
import Lobby from "./Lobby";
import Countdown from "./Countdown";
import ProgressBar from "./ProgressBar";

interface Props {
  roomId: string;
  playerName: string;
}

export default function MultiplayerTypingTest({ roomId, playerName }: Props) {
  const {
    players,
    isOwner,
    opponent,
    roomStatus,
    countdownValue,
    opponentProgress,
    opponentResults,
    error,
    startGame,
    handleKeyDown,
    typing,
  } = useMultiplayerTest(roomId, playerName);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomStatus === "running") {
      containerRef.current?.focus();
    }
  }, [roomStatus]);

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-[var(--color-error)] text-xl">{error}</div>
      </div>
    );
  }

  if (roomStatus === "waiting") {
    return <Lobby players={players} isOwner={isOwner} onStart={startGame} roomId={roomId} />;
  }

  if (roomStatus === "countdown" && countdownValue !== null) {
    return <Countdown value={countdownValue} />;
  }

  const isFinished = typing.status === "finished" || roomStatus === "finished";

  if (isFinished) {
    const myResults = typing.getResults();
    return (
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-[var(--color-accent)] text-2xl font-bold">results</h2>
        <div className="flex gap-16">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[var(--color-text-dim)] text-sm">you</span>
            <Results results={myResults} onRestart={() => {}} hideRestart />
          </div>
          {opponentResults && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[var(--color-text-dim)] text-sm">{opponent?.name ?? "opponent"}</span>
              <Results results={opponentResults} onRestart={() => {}} hideRestart />
            </div>
          )}
        </div>
        {myResults.wpm > (opponentResults?.wpm ?? 0) ? (
          <div className="text-[var(--color-accent)] text-xl font-bold">you win!</div>
        ) : opponentResults && myResults.wpm < opponentResults.wpm ? (
          <div className="text-[var(--color-error)] text-xl font-bold">you lose</div>
        ) : opponentResults ? (
          <div className="text-[var(--color-text)] text-xl font-bold">tie!</div>
        ) : (
          <div className="text-[var(--color-text-dim)] text-sm">waiting for opponent to finish...</div>
        )}
      </div>
    );
  }

  // Running state
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => containerRef.current?.focus()}
      className="outline-none max-w-3xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 text-sm">
          {opponent && (
            <span className="text-[var(--color-text-dim)]">
              {opponent.name}: word {opponentProgress.currentWordIndex} · {opponentProgress.wpm} wpm
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-[var(--color-accent)]">
          {typing.timeLeft}
        </div>
      </div>
      <ProgressBar
        progress={typing.currentWordIndex / typing.words.length}
        opponentProgress={opponentProgress.currentWordIndex / typing.words.length}
      />
      <WordDisplay
        words={typing.words}
        currentWordIndex={typing.currentWordIndex}
        isFinished={false}
        opponentWordIndex={opponentProgress.currentWordIndex}
      />
    </div>
  );
}
