import AppShell from "@/components/AppShell";
import { Card, SectionHeader } from "@/components/ui";
import { fetchDiscountsWithCursor, fetchUiContent } from "@/lib/data";
import DiscountsClient from "@/app/discounts/DiscountsClient";
import DiscountSimulation from "@/app/discounts/DiscountSimulation";
import { getServerLocale } from "@/lib/i18n.server";
import { translate } from "@/lib/i18n";

interface DiscountsPageProps {
  searchParams?: Promise<{ cursor?: string }>;
}

export default async function DiscountsPage({ searchParams }: DiscountsPageProps) {
  const locale = await getServerLocale();
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
      <DiscountsClient initialData={data} nextCursor={nextCursor} />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr,1fr]">
        <Card>
          <SectionHeader
            title={translate(locale, "Rules builder")}
            subtitle={translate(locale, "Attach discounts to products, categories, or checkout totals.")}
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
            title={translate(locale, "POS preview")}
            subtitle={translate(locale, "Simulate discounts before launching.")}
          />
          <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
            {previewNotes.map((item) => (
              <p key={item.id}>✅ {item.label}</p>
            ))}
          </div>
          <DiscountSimulation discounts={data} />
        </Card>
      </section>
    </AppShell>
  );
}
