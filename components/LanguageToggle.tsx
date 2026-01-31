"use client";

import { Globe } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";

export default function LanguageToggle() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value === "id" ? "id" : "en";
    setLocale(nextLocale);
    router.refresh();
  };

  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-200">
      <Globe className="h-4 w-4" />
      <span>{translate(locale, "Language")}</span>
      <select
        value={locale}
        onChange={handleChange}
        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm transition focus:outline-none dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
      >
        <option value="en">{translate(locale, "English")}</option>
        <option value="id">{translate(locale, "Indonesian")}</option>
      </select>
    </label>
  );
}
