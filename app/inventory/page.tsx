import AppShell from "@/components/AppShell";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";

const inventoryItems = [
  { name: "Amber Noir", variant: "10ml Bottle", onHand: 36, min: 12, lastBuy: "Vendor A" },
  { name: "Velvet Rose", variant: "5ml Bottle", onHand: 8, min: 20, lastBuy: "Vendor C" },
  { name: "Citrus Muse", variant: "30ml Bottle", onHand: 14, min: 15, lastBuy: "Vendor B" }
];

export default function InventoryPage() {
  return (
    <AppShell
      title="Inventory Management"
      description="Track real-time stock, minimum thresholds, and reorder status."
    >
      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card>
          <SectionHeader
            title="Stock overview"
            subtitle="Realtime stock count with automatic minimum alerts."
            action={<Button>Sync stock</Button>}
          />
          <div className="mt-4 space-y-3">
            {inventoryItems.map((item) => (
              <div key={`${item.name}-${item.variant}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.variant}</p>
                </div>
                <div className="text-sm text-slate-300">{item.onHand} units</div>
                <Badge label={`Min ${item.min}`} tone={item.onHand <= item.min ? "warning" : "success"} />
                <div className="text-xs text-slate-400">Last buy: {item.lastBuy}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Realtime alerts"
            subtitle="Notify staff when stock hits minimum."
          />
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>✅ Auto-notify via WhatsApp & email.</p>
            <p>✅ Highlight in POS when stock is low.</p>
            <p>✅ Trigger reorder suggestion to vendors.</p>
          </div>
          <Button variant="secondary">Manage notification rules</Button>
        </Card>
      </div>
    </AppShell>
  );
}
