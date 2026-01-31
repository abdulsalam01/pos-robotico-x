"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span className="hidden sm:inline">
        {theme === "dark" ? translate(locale, "Dark mode") : translate(locale, "Light mode")}
      </span>
    </button>
  );
}
