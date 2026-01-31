import Link from "next/link";
import AppShell from "@/components/AppShell";
import ActionButton from "@/components/ActionButton";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { fetchDiscountsWithCursor, fetchUiContent } from "@/lib/data";

interface DiscountsPageProps {
  searchParams?: Promise<{ cursor?: string }>;
}

export default async function DiscountsPage({ searchParams }: DiscountsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const cursor = resolvedSearchParams.cursor;
  const [{ data, nextCursor }, rules, previewNotes] = await Promise.all([
    fetchDiscountsWithCursor(cursor),
    fetchUiContent("discounts", "rules"),
    fetchUiContent("discounts", "preview_notes")
  ]);

  return (
    <AppShell
      title="Discount Management"
      description="Create fixed or percentage discounts for products or transactions."
    >
      <Card>
        <SectionHeader
          title="Active campaigns"
          subtitle="Manage expiry dates and eligibility rules."
          action={<ActionButton label="Add discount" message="Discount builder opened." />}
        />
        <div className="mt-4 space-y-3">
          {data.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              No discounts yet. Create a discount to start tracking campaigns.
            </div>
          ) : (
            data.map((discount) => (
              <div
                key={discount.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{discount.name}</p>
                  <p className="text-xs text-slate-400">
                    {discount.valid_from ?? "—"} - {discount.valid_until ?? "—"}
                  </p>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
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
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
            {rules.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                {item.label}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="POS preview"
            subtitle="Simulate discounts before launching."
          />
          <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
            {previewNotes.map((item) => (
              <p key={item.id}>✅ {item.label}</p>
            ))}
          </div>
          <ActionButton label="Run simulation" variant="secondary" message="Simulation started." />
        </Card>
      </section>
    </AppShell>
  );
}
