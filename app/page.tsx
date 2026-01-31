import AppShell from "@/components/AppShell";
import ActionButton from "@/components/ActionButton";
import ActionList from "@/components/ActionList";
import { BarChart, DonutChart, Gauge, LineChart } from "@/components/Charts";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui";
import { fetchTransactionsWithCursor, fetchUiContent, fetchVariantsWithCursor } from "@/lib/data";
import { getServerLocale, translate } from "@/lib/i18n";

export default async function HomePage() {
  const locale = getServerLocale();
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
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {salesChart[0]?.label ??
              translate(
                locale,
                "Sales chart placeholder — connect to Supabase analytics table for realtime line chart."
              )}
          </div>
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
        <LineChart
          title={translate(locale, "Weekly revenue trend")}
          points={[
            { label: translate(locale, "Mon"), value: 18 },
            { label: translate(locale, "Tue"), value: 30 },
            { label: translate(locale, "Wed"), value: 22 },
            { label: translate(locale, "Thu"), value: 34 },
            { label: translate(locale, "Fri"), value: 46 },
            { label: translate(locale, "Sat"), value: 60 },
            { label: translate(locale, "Sun"), value: 48 }
          ]}
        />
        <BarChart
          title={translate(locale, "Top categories")}
          bars={[
            { label: translate(locale, "Floral"), value: 54 },
            { label: translate(locale, "Citrus"), value: 42 },
            { label: translate(locale, "Woody"), value: 36 },
            { label: translate(locale, "Musk"), value: 28 }
          ]}
        />
        <DonutChart
          title={translate(locale, "Payment mix")}
          slices={[
            { label: translate(locale, "Cash"), value: 45, tone: "mint" },
            { label: translate(locale, "QRIS"), value: 30, tone: "primary" },
            { label: translate(locale, "Card"), value: 15, tone: "coral" },
            { label: translate(locale, "Transfer"), value: 10, tone: "ink" }
          ]}
        />
        <Gauge title={translate(locale, "Daily target")} value={78} max={120} tone="primary" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr,1.8fr]">
        <Card>
          <SectionHeader
            title={translate(locale, "Low stock alerts")}
            subtitle={translate(locale, "Restock before reaching minimum thresholds.")}
          />
          <div className="mt-4 space-y-3">
            {variants.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {translate(locale, "No variants found. Add product variants to enable stock alerts.")}
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
