export interface Theme {
  bg: string;
  bgSecondary: string;
  text: string;
  textDim: string;
  accent: string;
  error: string;
  correct: string;
}

export const themes: Record<string, Theme> = {
  dark: {
    bg: "#323437",
    bgSecondary: "#2c2e31",
    text: "#d1d0c5",
    textDim: "#646669",
    accent: "#e2b714",
    error: "#ca4754",
    correct: "#d1d0c5",
  },
  light: {
    bg: "#f5f5f5",
    bgSecondary: "#e8e8e8",
    text: "#2c2c2c",
    textDim: "#999999",
    accent: "#4a90d9",
    error: "#da3333",
    correct: "#2c2c2c",
  },
  dracula: {
    bg: "#282a36",
    bgSecondary: "#21222c",
    text: "#f8f8f2",
    textDim: "#6272a4",
    accent: "#bd93f9",
    error: "#ff5555",
    correct: "#f8f8f2",
  },
  nord: {
    bg: "#2e3440",
    bgSecondary: "#272c36",
    text: "#eceff4",
    textDim: "#616e88",
    accent: "#88c0d0",
    error: "#bf616a",
    correct: "#eceff4",
  },
};

export function applyTheme(theme: Theme) {
  const root = document.documentElement.style;
  root.setProperty("--color-bg", theme.bg);
  root.setProperty("--color-bg-secondary", theme.bgSecondary);
  root.setProperty("--color-text", theme.text);
  root.setProperty("--color-text-dim", theme.textDim);
  root.setProperty("--color-accent", theme.accent);
  root.setProperty("--color-error", theme.error);
  root.setProperty("--color-correct", theme.correct);
}

export function loadSavedTheme() {
  const name = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
  if (name && themes[name]) {
    applyTheme(themes[name]);
    return name;
  }
  return "dark";
}
