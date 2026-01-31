import AppShell from "@/components/AppShell";
import { Badge, Button, Card, SectionHeader, StatCard } from "@/components/ui";

const kpiData = [
  { label: "Today Revenue", value: "Rp 12.450.000", change: "+12% vs yesterday", accent: "mint" as const },
  { label: "Gross Margin", value: "38.4%", change: "+2.1% since last week", accent: "primary" as const },
  { label: "Orders", value: "142", change: "+18 orders", accent: "primary" as const },
  { label: "Low Stock", value: "7 items", change: "Need restock", accent: "coral" as const }
];

const lowStockItems = [
  { name: "Amber Noir", variant: "10ml Bottle", stock: "6", min: "12" },
  { name: "Velvet Rose", variant: "30ml Bottle", stock: "9", min: "20" },
  { name: "Citrus Muse", variant: "5ml Bottle", stock: "4", min: "10" }
];

const transactions = [
  { id: "INV-2034", customer: "Walk-in", items: 3, payment: "QRIS", total: "Rp 480.000" },
  { id: "INV-2033", customer: "Sari R.", items: 2, payment: "Cash", total: "Rp 220.000" },
  { id: "INV-2032", customer: "Andi W.", items: 4, payment: "Debit", total: "Rp 760.000" }
];

export default function HomePage() {
  return (
    <AppShell
      title="Perfume Store Overview"
      description="Monitor sales, stock health, and CRM performance in one clear workspace."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiData.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card className="space-y-6">
          <SectionHeader
            title="Sales pulse"
            subtitle="Revenue trend, average basket, and peak hours at a glance."
            action={<Button variant="secondary">Export Insights</Button>}
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { label: "Avg Basket", value: "Rp 175.000", note: "+6%" },
              { label: "Peak Hour", value: "18:00 - 20:00", note: "Friday" },
              { label: "Repeat Rate", value: "32%", note: "Monthly" }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-mint-300">{item.note}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">
            Sales chart placeholder — connect to Supabase analytics table for realtime line chart.
          </div>
        </Card>

        <Card className="space-y-5">
          <SectionHeader title="Quick actions" subtitle="Create fast workflows for staff." />
          <div className="space-y-3">
            {[
              "Start new POS transaction",
              "Restock low items",
              "Create discount campaign",
              "Add new customer profile"
            ].map((action) => (
              <button
                key={action}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
              >
                {action}
                <span className="text-xs text-slate-400">→</span>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr,1.8fr]">
        <Card>
          <SectionHeader title="Low stock alerts" subtitle="Restock before reaching minimum thresholds." />
          <div className="mt-4 space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.variant}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-coral-300">
                    {item.stock} / {item.min} units
                  </p>
                  <Badge label="Reorder" tone="warning" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Recent transactions"
            subtitle="Fast access to the latest invoices and payments."
            action={<Button variant="ghost">See all</Button>}
          />
          <div className="mt-4 space-y-3">
            {transactions.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{item.id}</p>
                  <p className="text-xs text-slate-400">{item.customer}</p>
                </div>
                <div className="text-xs text-slate-400">{item.items} items</div>
                <div className="text-xs text-slate-400">{item.payment}</div>
                <div className="text-sm font-semibold text-white">{item.total}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
