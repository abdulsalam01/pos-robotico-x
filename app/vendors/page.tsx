import AppShell from "@/components/AppShell";
import { Card, SectionHeader } from "@/components/ui";
import { fetchVendorsWithCursor } from "@/lib/data";
import VendorsClient from "@/app/vendors/VendorsClient";
import { getServerLocale } from "@/lib/i18n.server";
import { translate } from "@/lib/i18n";

interface VendorsPageProps {
  searchParams?: Promise<{ cursor?: string }>;
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const locale = await getServerLocale();
  const resolvedSearchParams = (await searchParams) ?? {};
  const cursor = resolvedSearchParams.cursor;
  const { data, nextCursor } = await fetchVendorsWithCursor(cursor);

  return (
    <AppShell
      title="Vendor & HPP Tracking"
      description="Track purchase cost per liter and calculate HPP per variant automatically."
    >
      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <VendorsClient initialData={data} nextCursor={nextCursor} />

        <Card>
          <SectionHeader
            title={translate(locale, "HPP calculation")}
            subtitle={translate(locale, "Weighted average cost across vendors.")}
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
