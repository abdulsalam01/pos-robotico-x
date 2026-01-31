import { cookies } from "next/headers";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

export function getServerLocale(): Locale {
  const stored = cookies().get("locale")?.value;
  if (stored === "id" || stored === "en") {
    return stored;
  }
  return DEFAULT_LOCALE;
}
