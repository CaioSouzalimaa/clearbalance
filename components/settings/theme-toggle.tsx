"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "clearbalance-theme";

type ThemeOption = "light" | "dark";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<ThemeOption>("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    }
  }, []);

  const handleThemeChange = (value: ThemeOption) => {
    setTheme(value);
    localStorage.setItem(THEME_STORAGE_KEY, value);
    document.documentElement.classList.toggle("dark", value === "dark");
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleThemeChange("light")}
        aria-pressed={theme === "light"}
        className={cn(
          "border-border",
          theme === "light"
            ? "bg-primary/10 text-primary"
            : "text-foreground"
        )}
      >
        Tema claro
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleThemeChange("dark")}
        aria-pressed={theme === "dark"}
        className={cn(
          "border-border",
          theme === "dark"
            ? "bg-primary/10 text-primary"
            : "text-foreground"
        )}
      >
        Tema escuro
      </Button>
    </div>
  );
};
