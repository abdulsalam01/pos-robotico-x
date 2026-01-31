import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Button, Card, SectionHeader } from "@/components/ui";
import { fetchVendorsWithCursor } from "@/lib/data";

interface VendorsPageProps {
  searchParams?: { cursor?: string };
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const cursor = searchParams?.cursor;
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
            action={<Button>Add vendor</Button>}
          />
          <div className="mt-4 space-y-3">
            {data.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                No vendors yet. Add suppliers to calculate HPP automatically.
              </div>
            ) : (
              data.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{vendor.name}</p>
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
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
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
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>✅ Input purchase in liters with vendor price.</p>
            <p>✅ HPP recalculated per bottle size.</p>
            <p>✅ Gross margin updated in POS & reports.</p>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Example: blend vendor purchase prices to keep weighted cost per ml updated in POS.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
