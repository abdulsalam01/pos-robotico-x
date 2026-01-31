import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import { fetchVariantsWithCursor } from "@/lib/data";

interface InventoryPageProps {
  searchParams?: { cursor?: string };
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const cursor = searchParams?.cursor;
  const { data, nextCursor } = await fetchVariantsWithCursor(cursor);

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
            {data.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                No variants yet. Add product variants to start tracking inventory.
              </div>
            ) : (
              data.map((variant) => (
                <div
                  key={variant.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{variant.product?.name ?? "Unnamed product"}</p>
                    <p className="text-xs text-slate-400">{variant.bottle_size_ml} ml bottle</p>
                  </div>
                  <div className="text-sm text-slate-300">On hand: connect inventory ledger</div>
                  <Badge label={`Min ${variant.min_stock ?? 0}`} tone="info" />
                  <div className="text-xs text-slate-400">Barcode: {variant.barcode ?? "—"}</div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 flex justify-end">
            {nextCursor ? (
              <Link
                href={{ pathname: "/inventory", query: { cursor: nextCursor } }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Next page
              </Link>
            ) : null}
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
