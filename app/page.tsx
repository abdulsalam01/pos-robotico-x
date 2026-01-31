import AppShell from "@/components/AppShell";
import ActionButton from "@/components/ActionButton";
import ActionList from "@/components/ActionList";
import { BarChart, DonutChart, Gauge, LineChart } from "@/components/Charts";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui";
import { fetchTransactionsWithCursor, fetchUiContent, fetchVariantsWithCursor } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { getServerLocale } from "@/lib/i18n.server";
import { translate } from "@/lib/i18n";

export default async function HomePage() {
  const locale = await getServerLocale();
  const [variants, transactions, quickActions] = await Promise.all([
    fetchVariantsWithCursor().then((response) => response.data),
    fetchTransactionsWithCursor().then((response) => response.data),
    fetchUiContent("dashboard", "quick_actions")
  ]);

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  const startISO = start.toISOString();

  const [{ data: recentTransactions }, { data: transactionItems }, { data: inventoryMovements }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("id,invoice_no,total,created_at,payment_method")
        .gte("created_at", startISO)
        .order("created_at", { ascending: false }),
      supabase
        .from("transaction_items")
        .select("qty,variant:product_variants(product:products(name))"),
      supabase
        .from("inventory_movements")
        .select("variant_id,direction,quantity")
    ]);

  const revenueTotal = transactions.reduce((sum, item) => sum + Number(item.total ?? 0), 0);
  const transactionCount = transactions.length;
  const avgBasket = transactionCount ? revenueTotal / transactionCount : 0;
  const todayRevenue =
    recentTransactions?.reduce((sum, item) => sum + Number(item.total ?? 0), 0) ?? 0;

  const paymentMix = (transactions ?? []).reduce<Record<string, number>>((acc, item) => {
    const key = item.payment_method ?? "Cash";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const revenueByDay = new Map<string, number>();
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toLocaleDateString("id-ID", { weekday: "short" });
    revenueByDay.set(key, 0);
  }
  (recentTransactions ?? []).forEach((item) => {
    const date = new Date(item.created_at);
    const key = date.toLocaleDateString("id-ID", { weekday: "short" });
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(item.total ?? 0));
  });

  const topProducts = (transactionItems ?? []).reduce<Record<string, number>>((acc, row) => {
    const name = row.variant?.product?.name ?? "Product";
    acc[name] = (acc[name] ?? 0) + Number(row.qty ?? 0);
    return acc;
  }, {});

  const topProductBars = Object.entries(topProducts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value]) => ({ label, value }));

  const stockMap = new Map<string, number>();
  (inventoryMovements ?? []).forEach((movement) => {
    const current = stockMap.get(movement.variant_id) ?? 0;
    const next =
      movement.direction === "in" ? current + Number(movement.quantity) : current - Number(movement.quantity);
    stockMap.set(movement.variant_id, next);
  });

  const lowStockVariants = variants
    .map((variant) => ({
      ...variant,
      stock: stockMap.get(variant.id) ?? 0
    }))
    .filter((variant) => (variant.min_stock ?? 0) > 0 && variant.stock <= (variant.min_stock ?? 0));

  const kpis = [
    {
      id: "revenue",
      label: translate(locale, "Revenue"),
      value: `Rp ${Math.round(revenueTotal).toLocaleString("id-ID")}`,
      note: `${transactionCount} transactions`,
      accent: "mint"
    },
    {
      id: "avg-basket",
      label: translate(locale, "Average basket"),
      value: `Rp ${Math.round(avgBasket).toLocaleString("id-ID")}`,
      note: translate(locale, "Sales pulse"),
      accent: "primary"
    },
    {
      id: "low-stock",
      label: translate(locale, "Low stock alerts"),
      value: lowStockVariants.length.toString(),
      note: translate(locale, "Inventory"),
      accent: "coral"
    },
    {
      id: "today",
      label: translate(locale, "Daily target"),
      value: `Rp ${Math.round(todayRevenue).toLocaleString("id-ID")}`,
      note: translate(locale, "Today"),
      accent: "primary"
    }
  ];

  const salesPulse = [
    {
      label: translate(locale, "Revenue"),
      value: `Rp ${Math.round(revenueTotal).toLocaleString("id-ID")}`,
      note: translate(locale, "Revenue trend")
    },
    {
      label: translate(locale, "Average basket"),
      value: `Rp ${Math.round(avgBasket).toLocaleString("id-ID")}`,
      note: translate(locale, "Payment mix")
    },
    {
      label: translate(locale, "Transactions"),
      value: transactionCount.toString(),
      note: translate(locale, "Recent transactions")
    }
  ];

  return (
    <AppShell
      title="Perfume Store Overview"
      description="Monitor sales, stock health, and CRM performance in one clear workspace."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value ?? "—"}
            change={stat.note ?? ""}
            accent={(stat.accent ?? "primary") as "primary" | "mint" | "coral"}
          />
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card className="space-y-6">
          <SectionHeader
            title={translate(locale, "Sales pulse")}
            subtitle={translate(locale, "Revenue trend, average basket, and peak hours at a glance.")}
            action={
              <ActionButton
                label={translate(locale, "Export insights")}
                variant="secondary"
                message={translate(locale, "Action completed successfully.")}
              />
            }
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {salesPulse.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{item.value ?? "—"}</p>
                <p className="mt-1 text-xs text-mint-600 dark:text-mint-300">{item.note ?? ""}</p>
              </div>
            ))}
          </div>
          <LineChart
            title={translate(locale, "Weekly revenue trend")}
            points={Array.from(revenueByDay.entries()).map(([label, value]) => ({ label, value }))}
          />
        </Card>

        <Card className="space-y-5">
          <SectionHeader
            title={translate(locale, "Quick actions")}
            subtitle={translate(locale, "Create fast workflows for staff.")}
          />
          <ActionList actions={quickActions.map((action) => ({ id: action.id, label: action.label }))} />
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <BarChart
          title={translate(locale, "Top categories")}
          bars={
            topProductBars.length
              ? topProductBars
              : [
                  { label: translate(locale, "Floral"), value: 0 },
                  { label: translate(locale, "Citrus"), value: 0 }
                ]
          }
        />
        <DonutChart
          title={translate(locale, "Payment mix")}
          slices={Object.entries(paymentMix).map(([label, value], index) => ({
            label,
            value,
            tone: (["mint", "primary", "coral", "ink"][index % 4] ?? "primary") as
              | "mint"
              | "primary"
              | "coral"
              | "ink"
          }))}
        />
        <Gauge title={translate(locale, "Daily target")} value={Math.round(todayRevenue)} max={1_000_000} tone="primary" />
        <LineChart
          title={translate(locale, "Weekly revenue trend")}
          points={Array.from(revenueByDay.entries()).map(([label, value]) => ({ label, value }))}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr,1.8fr]">
        <Card>
          <SectionHeader
            title={translate(locale, "Low stock alerts")}
            subtitle={translate(locale, "Restock before reaching minimum thresholds.")}
          />
          <div className="mt-4 space-y-3">
            {lowStockVariants.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {translate(locale, "No variants found. Add product variants to enable stock alerts.")}
              </div>
            ) : (
              lowStockVariants.slice(0, 3).map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {variant.product?.name ?? "Unnamed product"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {variant.bottle_size_ml} {variant.unit_label ?? "ml"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-coral-600 dark:text-coral-300">
                      {translate(locale, "Min")} {Number(variant.min_stock ?? 0)}{" "}
                      {translate(locale, "units")}
                    </p>
                    <Badge label={translate(locale, "Check stock")} tone="warning" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title={translate(locale, "Recent transactions")}
            subtitle={translate(locale, "Fast access to the latest invoices and payments.")}
            action={
              <ActionButton
                label={translate(locale, "See all")}
                variant="ghost"
                message={translate(locale, "Action completed successfully.")}
              />
            }
          />
          <div className="mt-4 space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {translate(locale, "No transactions yet. Start selling to see activity here.")}
              </div>
            ) : (
              transactions.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.invoice_no}</p>
                    <p className="text-xs text-slate-400">
                      {item.payment_method ?? translate(locale, "Payment pending")}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Rp {Number(item.total).toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
