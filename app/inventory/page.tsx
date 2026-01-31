import Link from "next/link";
import AppShell from "@/components/AppShell";
import ActionButton from "@/components/ActionButton";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { fetchVariantsWithCursor } from "@/lib/data";
import { getServerLocale } from "@/lib/i18n.server";
import { translate } from "@/lib/i18n";

interface InventoryPageProps {
  searchParams?: Promise<{ cursor?: string }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const locale = await getServerLocale();
  const resolvedSearchParams = (await searchParams) ?? {};
  const cursor = resolvedSearchParams.cursor;
  const { data, nextCursor } = await fetchVariantsWithCursor(cursor);

  return (
    <AppShell
      title="Inventory Management"
      description="Track real-time stock, minimum thresholds, and reorder status."
    >
      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card>
          <SectionHeader
            title={translate(locale, "Stock overview")}
            subtitle={translate(locale, "Realtime stock count with automatic minimum alerts.")}
            action={
              <ActionButton
                label={translate(locale, "Sync stock")}
                message={translate(locale, "Action completed successfully.")}
              />
            }
          />
          <div className="mt-4 space-y-3">
            {data.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {translate(locale, "No variants yet. Add product variants to start tracking inventory.")}
              </div>
            ) : (
              data.map((variant) => (
                <div
                  key={variant.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {variant.product?.name ?? "Unnamed product"}
                    </p>
                    <p className="text-xs text-slate-400">{variant.bottle_size_ml} ml bottle</p>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {translate(locale, "On hand: connect inventory ledger")}
                  </div>
                  <Badge label={`${translate(locale, "Min")} ${variant.min_stock ?? 0}`} tone="info" />
                  <div className="text-xs text-slate-400">
                    {translate(locale, "Barcode")}: {variant.barcode ?? "—"}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 flex justify-end">
          {nextCursor ? (
            <Link
              href={{ pathname: "/inventory", query: { cursor: nextCursor } }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              {translate(locale, "Next page")}
            </Link>
          ) : null}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title={translate(locale, "Realtime alerts")}
            subtitle={translate(locale, "Notify staff when stock hits minimum.")}
          />
          <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
            <p>✅ Auto-notify via WhatsApp & email.</p>
            <p>✅ Highlight in POS when stock is low.</p>
            <p>✅ Trigger reorder suggestion to vendors.</p>
          </div>
          <ActionButton
            label={translate(locale, "Manage notification rules")}
            variant="secondary"
            message={translate(locale, "Action completed successfully.")}
          />
        </Card>
      </div>
    </AppShell>
  );
}
