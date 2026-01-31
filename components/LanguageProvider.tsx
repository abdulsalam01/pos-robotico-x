"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getStoredLocale = (): Locale => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  const stored = window.localStorage.getItem("locale");
  if (stored === "en" || stored === "id") {
    return stored;
  }
  const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
  if (match?.[1] === "en" || match?.[1] === "id") {
    return match[1];
  }
  return DEFAULT_LOCALE;
};

const persistLocale = (locale: Locale) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem("locale", locale);
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
  document.documentElement.lang = locale;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(getStoredLocale());
  }, []);

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocaleState
    }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
