"use client";

import { useState, useEffect } from "react";
import { themes, applyTheme, loadSavedTheme } from "@/lib/themes";

export default function ThemeSelector() {
  const [active, setActive] = useState("dark");

  useEffect(() => {
    setActive(loadSavedTheme());
  }, []);

  const select = (name: string) => {
    applyTheme(themes[name]);
    localStorage.setItem("theme", name);
    setActive(name);
  };

  return (
    <div className="flex gap-2">
      {Object.entries(themes).map(([name, theme]) => (
        <button
          key={name}
          onClick={() => select(name)}
          title={name}
          className={`w-4 h-4 rounded-full border-2 transition-transform ${
            active === name ? "scale-125 border-[var(--color-accent)]" : "border-transparent"
          }`}
          style={{ backgroundColor: theme.accent }}
        />
      ))}
    </div>
  );
}
