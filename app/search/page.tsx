import AppShell from "@/components/AppShell";
import { Card, SectionHeader } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { getServerLocale } from "@/lib/i18n.server";
import { translate } from "@/lib/i18n";

interface SearchPageProps {
  searchParams?: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const locale = await getServerLocale();
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = (resolvedSearchParams.q ?? "").trim();

  if (!query) {
    return (
      <AppShell title="Search results" description="Find products, customers, and invoices.">
        <Card>
          <SectionHeader
            title={translate(locale, "Search")}
            subtitle={translate(locale, "Type a keyword in the top bar to start searching.")}
          />
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {translate(locale, "No query entered yet.")}
          </div>
        </Card>
      </AppShell>
    );
  }

  const [productsResult, customersResult, invoicesResult] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,sku")
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .limit(8),
    supabase
      .from("customers")
      .select("id,name,phone,email")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(8),
    supabase
      .from("transactions")
      .select("id,invoice_no,total")
      .ilike("invoice_no", `%${query}%`)
      .limit(8)
  ]);

  const products = productsResult.data ?? [];
  const customers = customersResult.data ?? [];
  const invoices = invoicesResult.data ?? [];

  return (
    <AppShell title="Search results" description={`Results for "${query}"`}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionHeader title={translate(locale, "Products")} subtitle={`${products.length} matches`} />
          <div className="mt-4 space-y-3">
            {products.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {translate(locale, "No products found.")}
              </p>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                  <p className="text-xs text-slate-400">SKU {product.sku ?? "—"}</p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <SectionHeader title={translate(locale, "Customers")} subtitle={`${customers.length} matches`} />
          <div className="mt-4 space-y-3">
            {customers.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {translate(locale, "No customers found.")}
              </p>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {customer.name ?? translate(locale, "Unnamed customer")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {customer.email ?? customer.phone ?? translate(locale, "No contact set")}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <SectionHeader title={translate(locale, "Invoices")} subtitle={`${invoices.length} matches`} />
          <div className="mt-4 space-y-3">
            {invoices.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {translate(locale, "No invoices found.")}
              </p>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{invoice.invoice_no}</p>
                  <p className="text-xs text-slate-400">
                    Rp {Number(invoice.total ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
