import Link from "next/link";
import { BarChart3, Barcode, Boxes, Gem, Package, Receipt, Settings, ShoppingBag, Users } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/pos", label: "Point of Sale", icon: Receipt },
  { href: "/products", label: "Products", icon: Gem },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/vendors", label: "Vendors", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/discounts", label: "Discounts", icon: ShoppingBag },
  { href: "/reports", label: "Reports", icon: Barcode },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/95 px-6 py-8 lg:block">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-soft">
          <span className="text-lg font-semibold">PX</span>
        </div>
        <div>
          <p className="text-lg font-semibold">Parfume POS</p>
          <p className="text-xs text-slate-400">Fast retail control</p>
        </div>
      </div>
      <nav className="mt-10 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4">
        <p className="text-sm font-semibold">Realtime Stock Alerts</p>
        <p className="mt-2 text-xs text-slate-400">3 items below minimum. Review inventory to reorder.</p>
        <button className="mt-4 w-full rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
          View Alerts
        </button>
      </div>
    </aside>
  );
}
