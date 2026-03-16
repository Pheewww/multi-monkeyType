"use client";

import { TestResults, WpmSnapshot } from "@/hooks/useTypingTest";
import WpmGraph from "./WpmGraph";

interface Props {
  results: TestResults;
  onRestart: () => void;
  hideRestart?: boolean;
  wpmHistory?: WpmSnapshot[];
}

export default function Results({ results, onRestart, hideRestart, wpmHistory }: Props) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-12">
        <div className="text-center">
          <div className="text-[var(--color-text-dim)] text-sm mb-1">wpm</div>
          <div className="text-5xl text-[var(--color-accent)] font-bold">{results.wpm}</div>
        </div>
        <div className="text-center">
          <div className="text-[var(--color-text-dim)] text-sm mb-1">acc</div>
          <div className="text-5xl text-[var(--color-accent)] font-bold">{results.accuracy}%</div>
        </div>
      </div>
      {wpmHistory && wpmHistory.length >= 2 && <WpmGraph history={wpmHistory} />}
      <div className="flex gap-8 text-sm text-[var(--color-text-dim)]">
        <div>raw: <span className="text-[var(--color-text)]">{results.rawWpm}</span></div>
        <div>correct: <span className="text-[var(--color-correct)]">{results.correct}</span></div>
        <div>incorrect: <span className="text-[var(--color-error)]">{results.incorrect}</span></div>
        <div>extra: <span className="text-[var(--color-error)]">{results.extra}</span></div>
        <div>missed: <span className="text-[var(--color-text)]">{results.missed}</span></div>
      </div>
      {!hideRestart && (
        <button
          onClick={onRestart}
          className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors text-sm"
        >
          tab - restart
        </button>
      )}
    </div>
  );
}
