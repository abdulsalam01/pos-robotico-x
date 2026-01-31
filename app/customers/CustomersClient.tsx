"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Card, SectionHeader } from "@/components/ui";
import QuickAddDialog from "@/components/QuickAddDialog";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { CustomerRow } from "@/lib/data";

interface CustomersClientProps {
  initialData: CustomerRow[];
  nextCursor: string | null;
}

export default function CustomersClient({ initialData, nextCursor }: CustomersClientProps) {
  const { locale } = useLanguage();
  const [customers, setCustomers] = useState<CustomerRow[]>(initialData);

  const handleAddCustomer = async (values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        name: values.name || null,
        phone: values.phone || null,
        email: values.email || null
      })
      .select("id,name,phone,email,created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setCustomers((prev) => [data, ...prev]);
    }
  };

  return (
    <Card>
      <SectionHeader
        title={translate(locale, "Customer list")}
        subtitle={translate(locale, "All visits, segments, and discount history.")}
        action={
          <QuickAddDialog
            title="Add customer"
            description="Quick add"
            triggerLabel="Add customer"
            fields={[
              { name: "name", label: "Customer name", placeholder: "Customer name", required: true },
              { name: "phone", label: "Phone", placeholder: "Phone" },
              { name: "email", label: "Email", placeholder: "Email" }
            ]}
            onSubmit={handleAddCustomer}
          />
        }
      />
      <div className="mt-4 space-y-3">
        {customers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {translate(locale, "No customers yet. Add optional customer profiles to enable CRM.")}
          </div>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {customer.name ?? translate(locale, "Unnamed customer")}
                </p>
                <p className="text-xs text-slate-400">
                  {customer.phone ?? customer.email ?? translate(locale, "No contact set")}
                </p>
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
            {translate(locale, "Next page")}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
