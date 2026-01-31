"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
}

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const dismissedKey = "pos-notifications-dismissed";

  const loadDismissed = () => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      return JSON.parse(window.localStorage.getItem(dismissedKey) ?? "[]") as string[];
    } catch {
      return [];
    }
  };

  const persistDismissed = (ids: string[]) => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(dismissedKey, JSON.stringify(ids));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLowStock = async () => {
    setLoading(true);
    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("id,bottle_size_ml,unit_label,min_stock,product:products(name)")
      .gt("min_stock", 0);

    if (error || !variants) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const ids = variants.map((variant) => variant.id);
    const { data: movements } = await supabase
      .from("inventory_movements")
      .select("variant_id,direction,quantity")
      .in("variant_id", ids);

    const stockMap = new Map<string, number>();
    movements?.forEach((movement) => {
      const current = stockMap.get(movement.variant_id) ?? 0;
      const next =
        movement.direction === "in" ? current + Number(movement.quantity) : current - Number(movement.quantity);
      stockMap.set(movement.variant_id, next);
    });

    const dismissed = loadDismissed();
    const lowStock = variants
      .map((variant) => {
        const stock = stockMap.get(variant.id) ?? 0;
        const min = Number(variant.min_stock ?? 0);
        return {
          id: variant.id,
          title: `${variant.product?.name ?? "Product"} · ${variant.bottle_size_ml}${variant.unit_label ?? "ml"}`,
          detail: `Stock ${stock} / Min ${min}`,
          stock,
          min
        };
      })
      .filter((variant) => variant.stock <= variant.min && !dismissed.includes(variant.id))
      .map(({ id, title, detail }) => ({ id, title, detail }));

    setNotifications(lowStock);
    setLoading(false);
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) {
      void fetchLowStock();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-soft dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Notifications</p>
            <button
              type="button"
              onClick={() => {
                const dismissed = Array.from(new Set([...loadDismissed(), ...notifications.map((item) => item.id)]));
                persistDismissed(dismissed);
                setNotifications([]);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {loading ? <p>Loading alerts...</p> : null}
            {!loading && notifications.length === 0 ? <p>No alerts right now.</p> : null}
            {!loading
              ? notifications.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                    <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                  </div>
                ))
              : null}
          </div>
          <button
            type="button"
            onClick={fetchLowStock}
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            disabled={loading}
          >
            Refresh alerts
          </button>
        </div>
      ) : null}
    </div>
  );
}
