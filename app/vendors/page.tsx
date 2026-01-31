import AppShell from "@/components/AppShell";
import { Button, Card, SectionHeader } from "@/components/ui";

const vendors = [
  { name: "Aroma Prima", volume: "25 L", lastPrice: "Rp 2.400.000 / L", trend: "-3%" },
  { name: "Fragrance Lab", volume: "18 L", lastPrice: "Rp 2.550.000 / L", trend: "+2%" },
  { name: "Scentify Co.", volume: "30 L", lastPrice: "Rp 2.320.000 / L", trend: "-1%" }
];

export default function VendorsPage() {
  return (
    <AppShell
      title="Vendor & HPP Tracking"
      description="Track purchase cost per liter and calculate HPP per variant automatically."
    >
      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <Card>
          <SectionHeader
            title="Vendor list"
            subtitle="Monitor supplier prices, quality, and supply history."
            action={<Button>Add vendor</Button>}
          />
          <div className="mt-4 space-y-3">
            {vendors.map((vendor) => (
              <div key={vendor.name} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{vendor.name}</p>
                  <p className="text-xs text-slate-400">Monthly volume: {vendor.volume}</p>
                </div>
                <div className="text-sm text-white">{vendor.lastPrice}</div>
                <div className="text-xs text-mint-300">Price trend {vendor.trend}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="HPP calculation"
            subtitle="Weighted average cost across vendors."
          />
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>✅ Input purchase in liters with vendor price.</p>
            <p>✅ HPP recalculated per bottle size.</p>
            <p>✅ Gross margin updated in POS & reports.</p>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Example: Amber Noir 1L from Aroma Prima at Rp 2.400.000 + 0.5L from Scentify at Rp 2.320.000 → HPP 1ml = Rp 2.373
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
