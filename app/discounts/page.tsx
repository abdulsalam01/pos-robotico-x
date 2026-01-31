import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import { fetchDiscountsWithCursor } from "@/lib/data";

interface DiscountsPageProps {
  searchParams?: { cursor?: string };
}

export default async function DiscountsPage({ searchParams }: DiscountsPageProps) {
  const cursor = searchParams?.cursor;
  const { data, nextCursor } = await fetchDiscountsWithCursor(cursor);

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
          {data.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              No discounts yet. Create a discount to start tracking campaigns.
            </div>
          ) : (
            data.map((discount) => (
              <div key={discount.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{discount.name}</p>
                  <p className="text-xs text-slate-400">
                    {discount.valid_from ?? "—"} - {discount.valid_until ?? "—"}
                  </p>
                </div>
                <div className="text-sm text-slate-300">
                  {discount.type === "percentage"
                    ? `${Number(discount.value)}%`
                    : `Rp ${Number(discount.value).toLocaleString("id-ID")}`}
                </div>
                <Badge label={discount.status} tone={discount.status === "expired" ? "warning" : "success"} />
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex justify-end">
          {nextCursor ? (
            <Link
              href={{ pathname: "/discounts", query: { cursor: nextCursor } }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Next page
            </Link>
          ) : null}
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
