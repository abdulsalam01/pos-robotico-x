import { Bell, Search } from "lucide-react";
import { fetchUiContent } from "@/lib/data";

interface TopbarProps {
  title: string;
  description?: string;
}

export default async function Topbar({ title, description }: TopbarProps) {
  const [metaItems, searchItems, profileItems] = await Promise.all([
    fetchUiContent("global", "topbar_meta"),
    fetchUiContent("global", "topbar_search"),
    fetchUiContent("global", "topbar_profile")
  ]);
  const meta = metaItems[0];
  const search = searchItems[0];
  const profile = profileItems[0];

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {meta?.label ?? "POS Dashboard"}
          </p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-start gap-3 sm:flex-none sm:justify-end">
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 sm:w-72">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
              placeholder={search?.label ?? "Search products, customers, invoices"}
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-coral-500" />
            <div className="text-xs">
              <p className="font-semibold text-white">{profile?.label ?? "Store Admin"}</p>
              <p className="text-slate-400">{profile?.value ?? "Staff"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
