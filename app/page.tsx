import AppShell from "@/components/AppShell";
import ActionButton from "@/components/ActionButton";
import ActionList from "@/components/ActionList";
import { BarChart, DonutChart, Gauge, LineChart } from "@/components/Charts";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui";
import { fetchTransactionsWithCursor, fetchUiContent, fetchVariantsWithCursor } from "@/lib/data";

export default async function HomePage() {
  const [variants, transactions, kpis, salesPulse, quickActions, salesChart] = await Promise.all([
    fetchVariantsWithCursor().then((response) => response.data),
    fetchTransactionsWithCursor().then((response) => response.data),
    fetchUiContent("dashboard", "kpis"),
    fetchUiContent("dashboard", "sales_pulse"),
    fetchUiContent("dashboard", "quick_actions"),
    fetchUiContent("dashboard", "sales_chart")
  ]);

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
            title="Sales pulse"
            subtitle="Revenue trend, average basket, and peak hours at a glance."
            action={<ActionButton label="Export insights" variant="secondary" message="Export started." />}
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
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {salesChart[0]?.label ?? "Sales chart placeholder — connect to Supabase analytics table for realtime line chart."}
          </div>
        </Card>

        <Card className="space-y-5">
          <SectionHeader title="Quick actions" subtitle="Create fast workflows for staff." />
          <ActionList actions={quickActions.map((action) => ({ id: action.id, label: action.label }))} />
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <LineChart
          title="Weekly revenue trend"
          points={[
            { label: "Mon", value: 18 },
            { label: "Tue", value: 30 },
            { label: "Wed", value: 22 },
            { label: "Thu", value: 34 },
            { label: "Fri", value: 46 },
            { label: "Sat", value: 60 },
            { label: "Sun", value: 48 }
          ]}
        />
        <BarChart
          title="Top categories"
          bars={[
            { label: "Floral", value: 54 },
            { label: "Citrus", value: 42 },
            { label: "Woody", value: 36 },
            { label: "Musk", value: 28 }
          ]}
        />
        <DonutChart
          title="Payment mix"
          slices={[
            { label: "Cash", value: 45, tone: "mint" },
            { label: "QRIS", value: 30, tone: "primary" },
            { label: "Card", value: 15, tone: "coral" },
            { label: "Transfer", value: 10, tone: "ink" }
          ]}
        />
        <Gauge title="Daily target" value={78} max={120} tone="primary" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr,1.8fr]">
        <Card>
          <SectionHeader title="Low stock alerts" subtitle="Restock before reaching minimum thresholds." />
          <div className="mt-4 space-y-3">
            {variants.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No variants found. Add product variants to enable stock alerts.
              </div>
            ) : (
              variants.slice(0, 3).map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {variant.product?.name ?? "Unnamed product"}
                    </p>
                    <p className="text-xs text-slate-400">{variant.bottle_size_ml} ml bottle</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-coral-600 dark:text-coral-300">
                      Min {Number(variant.min_stock ?? 0)} units
                    </p>
                    <Badge label="Check stock" tone="warning" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Recent transactions"
            subtitle="Fast access to the latest invoices and payments."
            action={<ActionButton label="See all" variant="ghost" message="Opening transactions list." />}
          />
          <div className="mt-4 space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No transactions yet. Start selling to see activity here.
              </div>
            ) : (
              transactions.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.invoice_no}</p>
                    <p className="text-xs text-slate-400">{item.payment_method ?? "Payment pending"}</p>
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
