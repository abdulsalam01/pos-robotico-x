import AppShell from "@/components/AppShell";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";

const customers = [
  { name: "Sari Rahman", visits: 6, lastVisit: "2 days ago", segment: "VIP" },
  { name: "Andi Wibowo", visits: 3, lastVisit: "1 week ago", segment: "Regular" },
  { name: "Walk-in", visits: 1, lastVisit: "Today", segment: "Guest" }
];

export default function CustomersPage() {
  return (
    <AppShell
      title="Customers & CRM"
      description="Capture optional customer data for loyalty and personalized campaigns."
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Card>
          <SectionHeader
            title="Customer list"
            subtitle="All visits, segments, and discount history."
            action={<Button>Add customer</Button>}
          />
          <div className="mt-4 space-y-3">
            {customers.map((customer) => (
              <div key={customer.name} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{customer.name}</p>
                  <p className="text-xs text-slate-400">Last visit: {customer.lastVisit}</p>
                </div>
                <div className="text-sm text-slate-300">{customer.visits} visits</div>
                <Badge label={customer.segment} tone={customer.segment === "VIP" ? "success" : "info"} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Loyalty insights"
            subtitle="Optional data entry to respect customer privacy."
          />
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>✅ Apply birthday discount automatically.</p>
            <p>✅ Track preferred fragrance notes.</p>
            <p>✅ Optional consent for promotions.</p>
          </div>
          <Button variant="secondary">Create loyalty tier</Button>
        </Card>
      </div>
    </AppShell>
  );
}
