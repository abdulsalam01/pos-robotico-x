import { cookies } from "next/headers";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

export async function getServerLocale(): Promise<Locale> {
  const stored = (await cookies()).get("locale")?.value;
  if (stored === "id" || stored === "en") {
    return stored;
  }
  return DEFAULT_LOCALE;
}
