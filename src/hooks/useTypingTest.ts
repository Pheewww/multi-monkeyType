"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { generateWords } from "@/data/words";

export type TestStatus = "idle" | "running" | "finished";

export interface WordState {
  word: string;
  typed: string;
}

export interface TestResults {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export interface WpmSnapshot {
  time: number;
  wpm: number;
}

const WORD_COUNT = 200;

export function useTypingTest(duration: number, initialWords?: string[]) {
  const [words, setWords] = useState<WordState[]>(() => {
    const wordList = initialWords || generateWords(WORD_COUNT);
    return wordList.map((w) => ({ word: w, typed: "" }));
  });
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const wpmHistoryRef = useRef<WpmSnapshot[]>([]);
  const lastRecordedSecondRef = useRef<number>(0);
  const wordsRef = useRef(words);
  const wordIndexRef = useRef(currentWordIndex);
  wordsRef.current = words;
  wordIndexRef.current = currentWordIndex;

  // Reset when duration or words change
  useEffect(() => {
    restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, initialWords]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    wpmHistoryRef.current = [];
    lastRecordedSecondRef.current = 0;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, duration - elapsed);

      // Record WPM snapshot each second
      if (elapsed > 0 && elapsed > lastRecordedSecondRef.current) {
        lastRecordedSecondRef.current = elapsed;
        let correct = 0;
        const w = wordsRef.current;
        const idx = wordIndexRef.current;
        for (let i = 0; i <= idx && i < w.length; i++) {
          const { word, typed } = w[i];
          if (i === idx && typed.length === 0) continue;
          for (let j = 0; j < Math.max(word.length, typed.length); j++) {
            if (j < word.length && j < typed.length && word[j] === typed[j]) correct++;
          }
          if (i < idx) correct++;
        }
        const wpm = Math.round(correct / 5 / (elapsed / 60));
        wpmHistoryRef.current.push({ time: elapsed, wpm });
      }

      if (remaining <= 0) {
        stopTimer();
        setTimeLeft(0);
        setStatus("finished");
      } else {
        setTimeLeft(remaining);
      }
    }, 100);
  }, [duration, stopTimer]);

  const restart = useCallback(() => {
    stopTimer();
    const wordList = initialWords || generateWords(WORD_COUNT);
    setWords(wordList.map((w) => ({ word: w, typed: "" })));
    setCurrentWordIndex(0);
    setStatus("idle");
    setTimeLeft(duration);
    wpmHistoryRef.current = [];
    lastRecordedSecondRef.current = 0;
  }, [duration, stopTimer, initialWords]);

  const forceStart = useCallback(() => {
    setStatus("running");
    startTimer();
  }, [startTimer]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (status === "finished") return;

      if (e.key === "Tab") {
        e.preventDefault();
        restart();
        return;
      }

      // Start on first real keypress
      if (status === "idle" && e.key.length === 1) {
        setStatus("running");
        startTimer();
      }

      if (status === "idle" && e.key.length !== 1) return;

      if (e.key === " ") {
        e.preventDefault();
        if (words[currentWordIndex].typed.length > 0) {
          setCurrentWordIndex((i) => i + 1);
        }
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setWords((prev) => {
          const updated = [...prev];
          const current = updated[currentWordIndex];
          if (e.ctrlKey || e.metaKey) {
            updated[currentWordIndex] = { ...current, typed: "" };
          } else {
            updated[currentWordIndex] = {
              ...current,
              typed: current.typed.slice(0, -1),
            };
          }
          return updated;
        });
        return;
      }

      if (e.key.length === 1) {
        setWords((prev) => {
          const updated = [...prev];
          const current = updated[currentWordIndex];
          updated[currentWordIndex] = {
            ...current,
            typed: current.typed + e.key,
          };
          return updated;
        });
      }
    },
    [status, currentWordIndex, words, restart, startTimer]
  );

  const getResults = useCallback((): TestResults => {
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;

    for (let i = 0; i <= currentWordIndex && i < words.length; i++) {
      const { word, typed } = words[i];
      // Only count the last word if it was actually typed
      if (i === currentWordIndex && typed.length === 0) continue;

      for (let j = 0; j < Math.max(word.length, typed.length); j++) {
        if (j >= word.length) {
          extra++;
        } else if (j >= typed.length) {
          if (i < currentWordIndex) missed++;
        } else if (word[j] === typed[j]) {
          correct++;
        } else {
          incorrect++;
        }
      }
      // Count spaces between words
      if (i < currentWordIndex) correct++;
    }

    const totalTyped = correct + incorrect + extra;
    const elapsedMin = duration / 60;
    const wpm = Math.round(correct / 5 / elapsedMin);
    const rawWpm = Math.round(totalTyped / 5 / elapsedMin);
    const accuracy = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 0;

    return { wpm, rawWpm, accuracy, correct, incorrect, extra, missed };
  }, [words, currentWordIndex, duration]);

  return {
    words,
    currentWordIndex,
    status,
    timeLeft,
    handleKeyDown,
    restart,
    getResults,
    forceStart,
    wpmHistory: wpmHistoryRef.current,
  };
}
