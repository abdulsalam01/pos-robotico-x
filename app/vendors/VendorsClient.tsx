"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, SectionHeader } from "@/components/ui";
import QuickAddDialog from "@/components/QuickAddDialog";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { VendorRow } from "@/lib/data";

interface VendorsClientProps {
  initialData: VendorRow[];
  nextCursor: string | null;
}

export default function VendorsClient({ initialData, nextCursor }: VendorsClientProps) {
  const { locale } = useLanguage();
  const [vendors, setVendors] = useState<VendorRow[]>(initialData);

  const handleAddVendor = async (values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("vendors")
      .insert({
        name: values.name,
        contact: values.contact || null
      })
      .select("id,name,contact,created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setVendors((prev) => [data, ...prev]);
    }
  };

  return (
    <Card>
      <SectionHeader
        title={translate(locale, "Vendor list")}
        subtitle={translate(locale, "Monitor supplier prices, quality, and supply history.")}
        action={
          <QuickAddDialog
            title="Add vendor"
            description="Quick add"
            triggerLabel="Add vendor"
            fields={[
              { name: "name", label: "Vendor name", placeholder: "Vendor name", required: true },
              { name: "contact", label: "Contact", placeholder: "Contact" }
            ]}
            onSubmit={handleAddVendor}
          />
        }
      />
      <div className="mt-4 space-y-3">
        {vendors.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {translate(locale, "No vendors yet. Add a vendor profile to start logging contacts.")}
          </div>
        ) : (
          vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{vendor.name}</p>
                <p className="text-xs text-slate-400">{vendor.contact ?? translate(locale, "No contact set")}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-6 flex justify-end">
        {nextCursor ? (
          <Link
            href={{ pathname: "/vendors", query: { cursor: nextCursor } }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {translate(locale, "Next page")}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
