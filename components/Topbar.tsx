import { Bell, Search } from "lucide-react";
import { fetchUiContent } from "@/lib/data";
import UserMenu from "@/components/UserMenu";
import { getServerLocale, translate } from "@/lib/i18n";

interface TopbarProps {
  title: string;
  description?: string;
}

export default async function Topbar({ title, description }: TopbarProps) {
  const locale = getServerLocale();
  const [metaItems, searchItems] = await Promise.all([
    fetchUiContent("global", "topbar_meta"),
    fetchUiContent("global", "topbar_search")
  ]);
  const meta = metaItems[0];
  const search = searchItems[0];
  const metaLabel = translate(locale, meta?.label ?? "POS Dashboard");
  const searchPlaceholder = translate(locale, search?.label ?? "Search products, customers, invoices");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {metaLabel}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-start gap-3 sm:flex-none sm:justify-end">
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 sm:w-72 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
              placeholder={searchPlaceholder}
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
            <Bell className="h-4 w-4" />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
