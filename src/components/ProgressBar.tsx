"use client";

interface Props {
  progress: number;
  opponentProgress?: number;
}

export default function ProgressBar({ progress, opponentProgress }: Props) {
  return (
    <div className="flex flex-col gap-1 w-full mb-4">
      <div className="w-full h-1 bg-[var(--color-text-dim)]/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-150"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
      {opponentProgress !== undefined && (
        <div className="w-full h-1 bg-[var(--color-text-dim)]/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-error)] rounded-full transition-all duration-150"
            style={{ width: `${Math.min(opponentProgress * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
