"use client";

import { WpmSnapshot } from "@/hooks/useTypingTest";

interface Props {
  history: WpmSnapshot[];
}

export default function WpmGraph({ history }: Props) {
  if (history.length < 2) return null;

  const width = 500;
  const height = 150;
  const pad = { top: 10, right: 10, bottom: 25, left: 40 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const maxTime = history[history.length - 1].time;
  const maxWpm = Math.max(...history.map((p) => p.wpm), 10);

  const x = (t: number) => pad.left + (t / maxTime) * w;
  const y = (wpm: number) => pad.top + h - (wpm / maxWpm) * h;

  const points = history.map((p) => `${x(p.time)},${y(p.wpm)}`).join(" ");

  // Y-axis ticks
  const yTicks = [0, Math.round(maxWpm / 2), maxWpm];

  return (
    <svg width={width} height={height} className="mx-auto mt-4">
      {/* Grid lines */}
      {yTicks.map((tick) => (
        <line
          key={tick}
          x1={pad.left}
          y1={y(tick)}
          x2={width - pad.right}
          y2={y(tick)}
          stroke="var(--color-text-dim)"
          strokeOpacity={0.2}
        />
      ))}
      {/* Y-axis labels */}
      {yTicks.map((tick) => (
        <text
          key={tick}
          x={pad.left - 6}
          y={y(tick) + 4}
          textAnchor="end"
          fill="var(--color-text-dim)"
          fontSize={10}
        >
          {tick}
        </text>
      ))}
      {/* X-axis label */}
      <text
        x={pad.left + w / 2}
        y={height - 4}
        textAnchor="middle"
        fill="var(--color-text-dim)"
        fontSize={10}
      >
        time (s)
      </text>
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Dots */}
      {history.map((p, i) => (
        <circle
          key={i}
          cx={x(p.time)}
          cy={y(p.wpm)}
          r={2.5}
          fill="var(--color-accent)"
        />
      ))}
    </svg>
  );
}
