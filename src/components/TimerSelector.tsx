"use client";

interface Props {
  duration: number;
  onSelect: (d: number) => void;
}

const options = [15, 30, 60];

export default function TimerSelector({ duration, onSelect }: Props) {
  return (
    <div className="flex gap-4 items-center justify-center mb-6">
      {options.map((d) => (
        <button
          key={d}
          onClick={() => onSelect(d)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            d === duration
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
