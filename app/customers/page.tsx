import AppShell from "@/components/AppShell";
import { fetchCustomersWithCursor } from "@/lib/data";
import CustomersClient from "@/app/customers/CustomersClient";
import LoyaltyTierCard from "@/app/customers/LoyaltyTierCard";
import { getServerLocale } from "@/lib/i18n.server";

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
        <LoyaltyTierCard />
      </div>
    </AppShell>
  );
}
