import AppShell from "@/components/AppShell";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";

const discounts = [
  { name: "Ramadan Sale", type: "20%", valid: "15 Mar - 10 Apr", status: "Active" },
  { name: "VIP Member", type: "10%", valid: "Always", status: "Active" },
  { name: "New Store Launch", type: "Rp 50.000", valid: "Ended", status: "Expired" }
];

export default function DiscountsPage() {
  return (
    <AppShell
      title="Discount Management"
      description="Create fixed or percentage discounts for products or transactions."
    >
      <Card>
        <SectionHeader
          title="Active campaigns"
          subtitle="Manage expiry dates and eligibility rules."
          action={<Button>Add discount</Button>}
        />
        <div className="mt-4 space-y-3">
          {discounts.map((discount) => (
            <div key={discount.name} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-sm font-semibold text-white">{discount.name}</p>
                <p className="text-xs text-slate-400">{discount.valid}</p>
              </div>
              <div className="text-sm text-slate-300">{discount.type}</div>
              <Badge label={discount.status} tone={discount.status === "Expired" ? "warning" : "success"} />
            </div>
          ))}
        </div>
      </Card>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr,1fr]">
        <Card>
          <SectionHeader
            title="Rules builder"
            subtitle="Attach discounts to products, categories, or checkout totals."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              "Discount type (fixed / %)",
              "Eligible products",
              "Minimum purchase",
              "Expiration date",
              "Customer segment",
              "Usage limits"
            ].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="POS preview"
            subtitle="Simulate discounts before launching."
          />
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>✅ Automatic calculation on checkout.</p>
            <p>✅ Combine with member pricing.</p>
            <p>✅ Real-time analytics in dashboard.</p>
          </div>
          <Button variant="secondary">Run simulation</Button>
        </Card>
      </section>
    </AppShell>
  );
}
