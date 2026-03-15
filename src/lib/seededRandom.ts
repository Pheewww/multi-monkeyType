import { words } from "@/data/words";

// Simple mulberry32 seeded PRNG
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWordsSeeded(count: number, seed: number): string[] {
  const rng = mulberry32(seed);
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(rng() * words.length)]);
  }
  return result;
}
