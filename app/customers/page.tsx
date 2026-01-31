import AppShell from "@/components/AppShell";
import ActionButton from "@/components/ActionButton";
import { Card, SectionHeader } from "@/components/ui";
import { fetchCustomersWithCursor } from "@/lib/data";
import CustomersClient from "@/app/customers/CustomersClient";
import { getServerLocale } from "@/lib/i18n.server";
import { translate } from "@/lib/i18n";

interface CustomersPageProps {
  searchParams?: Promise<{ cursor?: string }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const locale = await getServerLocale();
  const resolvedSearchParams = (await searchParams) ?? {};
  const cursor = resolvedSearchParams.cursor;
  const { data, nextCursor } = await fetchCustomersWithCursor(cursor);

  return (
    <AppShell
      title="Customers & CRM"
      description="Capture optional customer data for loyalty and personalized campaigns."
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <CustomersClient initialData={data} nextCursor={nextCursor} />

        <Card>
          <SectionHeader
            title={translate(locale, "Loyalty insights")}
            subtitle={translate(locale, "Optional data entry to respect customer privacy.")}
          />
          <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
            <p>✅ Apply birthday discount automatically.</p>
            <p>✅ Track preferred fragrance notes.</p>
            <p>✅ Optional consent for promotions.</p>
          </div>
          <ActionButton
            label={translate(locale, "Create loyalty tier")}
            variant="secondary"
            message={translate(locale, "Action completed successfully.")}
          />
        </Card>
      </div>
    </AppShell>
  );
}
