"use client";

interface Props {
  value: number;
}

export default function Countdown({ value }: Props) {
  return (
    <div className="flex items-center justify-center">
      <div className="text-8xl font-bold text-[var(--color-accent)] animate-pulse">
        {value}
      </div>
    </div>
  );
}
