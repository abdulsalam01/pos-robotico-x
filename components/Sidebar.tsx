import Link from "next/link";
import { BarChart3, Barcode, Boxes, Gem, Package, Receipt, Settings, ShoppingBag, Users } from "lucide-react";
import { fetchUiContent, fetchVariantMinimumCount } from "@/lib/data";
import { getServerLocale } from "@/lib/i18n.server";
import { translate } from "@/lib/i18n";

const iconMap = {
  dashboard: BarChart3,
  pos: Receipt,
  products: Gem,
  inventory: Boxes,
  vendors: Package,
  customers: Users,
  discounts: ShoppingBag,
  reports: Barcode,
  settings: Settings
};

export default async function Sidebar() {
  const locale = await getServerLocale();
  const [navItems, alertItems, lowStockCount] = await Promise.all([
    fetchUiContent("global", "sidebar_nav"),
    fetchUiContent("global", "sidebar_alert"),
    fetchVariantMinimumCount()
  ]);
  const alert = alertItems[0];
  const alertTitle = translate(locale, alert?.label ?? "Inventory Alerts");
  const alertDescription =
    translate(locale, alert?.value ?? "Review inventory levels to prevent out of stock items.");
  const alertCta = translate(locale, alert?.note ?? "View Alerts");

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-6 py-8 dark:border-white/10 dark:bg-slate-950/95 lg:block">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-soft">
          <span className="text-lg font-semibold">PX</span>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Parfume POS</p>
          <p className="text-xs text-slate-400">{translate(locale, "Fast retail control")}</p>
        </div>
      </div>
      <nav className="mt-10 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon ? iconMap[item.icon as keyof typeof iconMap] : null;
          return (
            <Link
              key={item.href}
              href={item.href ?? "#"}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-gradient-to-br dark:from-white/5 dark:to-white/0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{alertTitle}</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
          {lowStockCount} items below minimum. {alertDescription}
        </p>
        <button className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
          {alertCta}
        </button>
      </div>
    </aside>
  );
}
