import Link from "next/link";
import AppShell from "@/components/AppShell";
import ActionButton from "@/components/ActionButton";
import { Card, SectionHeader } from "@/components/ui";
import { fetchVendorsWithCursor } from "@/lib/data";

interface VendorsPageProps {
  searchParams?: Promise<{ cursor?: string }>;
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const cursor = resolvedSearchParams.cursor;
  const { data, nextCursor } = await fetchVendorsWithCursor(cursor);

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
            action={<ActionButton label="Add vendor" message="Vendor profile opened." />}
          />
          <div className="mt-4 space-y-3">
            {data.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No vendors yet. Add suppliers to calculate HPP automatically.
              </div>
            ) : (
              data.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{vendor.name}</p>
                    <p className="text-xs text-slate-400">{vendor.contact ?? "No contact yet"}</p>
                  </div>
                  <div className="text-xs text-mint-300">Active supplier</div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 flex justify-end">
          {nextCursor ? (
            <Link
              href={{ pathname: "/vendors", query: { cursor: nextCursor } }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Next page
            </Link>
          ) : null}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="HPP calculation"
            subtitle="Weighted average cost across vendors."
          />
          <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
            <p>✅ Input purchase in liters with vendor price.</p>
            <p>✅ HPP recalculated per bottle size.</p>
            <p>✅ Gross margin updated in POS & reports.</p>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            Example: blend vendor purchase prices to keep weighted cost per ml updated in POS.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
