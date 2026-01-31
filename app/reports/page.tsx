import AppShell from "@/components/AppShell";
import { Button, Card, SectionHeader } from "@/components/ui";

export default function ReportsPage() {
  return (
    <AppShell
      title="Reports & PDF Export"
      description="Generate financial, inventory, and customer reports in seconds."
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Card>
          <SectionHeader
            title="Report center"
            subtitle="Print-ready PDF summaries for finance and operations."
            action={<Button>Generate PDF</Button>}
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              "Sales summary (daily, weekly, monthly)",
              "Product profitability & margin",
              "Inventory valuation",
              "Vendor purchase history",
              "Customer lifetime value",
              "Discount performance"
            ].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Print settings"
            subtitle="Customize layout, paper size, and metadata."
          />
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>✅ A4 / thermal printer friendly.</p>
            <p>✅ Include barcode list for stock audit.</p>
            <p>✅ Attach signature and approval notes.</p>
          </div>
          <Button variant="secondary">Save template</Button>
        </Card>
      </div>
    </AppShell>
  );
}
