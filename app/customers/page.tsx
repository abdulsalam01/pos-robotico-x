import Link from "next/link";
import AppShell from "@/components/AppShell";
import ActionButton from "@/components/ActionButton";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { fetchCustomersWithCursor } from "@/lib/data";

interface CustomersPageProps {
  searchParams?: Promise<{ cursor?: string }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const cursor = resolvedSearchParams.cursor;
  const { data, nextCursor } = await fetchCustomersWithCursor(cursor);

  return (
    <AppShell
      title="Customers & CRM"
      description="Capture optional customer data for loyalty and personalized campaigns."
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Card>
          <SectionHeader
            title="Customer list"
            subtitle="All visits, segments, and discount history."
            action={<ActionButton label="Add customer" message="Customer form opened." />}
          />
          <div className="mt-4 space-y-3">
            {data.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No customers yet. Add optional customer profiles to enable CRM.
              </div>
            ) : (
              data.map((customer) => (
                <div
                  key={customer.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {customer.name ?? "Unnamed customer"}
                    </p>
                    <p className="text-xs text-slate-400">{customer.phone ?? customer.email ?? "No contact set"}</p>
                  </div>
                  <Badge label="CRM" tone="info" />
                </div>
              ))
            )}
          </div>
          <div className="mt-6 flex justify-end">
          {nextCursor ? (
            <Link
              href={{ pathname: "/customers", query: { cursor: nextCursor } }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Next page
            </Link>
          ) : null}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Loyalty insights"
            subtitle="Optional data entry to respect customer privacy."
          />
          <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
            <p>✅ Apply birthday discount automatically.</p>
            <p>✅ Track preferred fragrance notes.</p>
            <p>✅ Optional consent for promotions.</p>
          </div>
          <ActionButton label="Create loyalty tier" variant="secondary" message="Loyalty tier setup opened." />
        </Card>
      </div>
    </AppShell>
  );
}
