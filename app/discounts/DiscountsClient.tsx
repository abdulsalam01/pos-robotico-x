"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import QuickAddDialog from "@/components/QuickAddDialog";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { DiscountRow } from "@/lib/data";

interface DiscountsClientProps {
  initialData: DiscountRow[];
  nextCursor: string | null;
}

export default function DiscountsClient({ initialData, nextCursor }: DiscountsClientProps) {
  const { locale } = useLanguage();
  const [discounts, setDiscounts] = useState<DiscountRow[]>(initialData);

  const handleAddDiscount = async (values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("discounts")
      .insert({
        name: values.name,
        type: values.type,
        value: Number(values.value || 0),
        status: values.status || "active",
        valid_from: values.valid_from || null,
        valid_until: values.valid_until || null
      })
      .select("id,name,type,value,valid_from,valid_until,status,created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setDiscounts((prev) => [data, ...prev]);
    }
  };

  const handleUpdateDiscount = async (discountId: string, values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("discounts")
      .update({
        name: values.name,
        type: values.type,
        value: Number(values.value || 0),
        status: values.status || "active",
        valid_from: values.valid_from || null,
        valid_until: values.valid_until || null
      })
      .eq("id", discountId)
      .select("id,name,type,value,valid_from,valid_until,status,created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setDiscounts((prev) => prev.map((discount) => (discount.id === discountId ? data : discount)));
    }
  };

  const handleDeleteDiscount = async (discountId: string) => {
    if (!window.confirm("Delete this discount?")) {
      return;
    }
    const { error } = await supabase.from("discounts").delete().eq("id", discountId);
    if (error) {
      return;
    }
    setDiscounts((prev) => prev.filter((discount) => discount.id !== discountId));
  };

  return (
    <Card>
      <SectionHeader
        title={translate(locale, "Active campaigns")}
        subtitle={translate(locale, "Manage expiry dates and eligibility rules.")}
        action={
          <QuickAddDialog
            title="Add discount"
            description="Quick add"
            triggerLabel="Add discount"
            fields={[
              { name: "name", label: "Discount name", placeholder: "Discount name", required: true },
              {
                name: "type",
                label: "Type",
                type: "select",
                required: true,
                options: [
                  { label: "Percentage", value: "percentage" },
                  { label: "Fixed amount", value: "fixed" }
                ]
              },
              { name: "value", label: "Value", type: "currency", required: true },
              {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                  { label: "Active", value: "active" },
                  { label: "Expired", value: "expired" }
                ]
              },
              { name: "valid_from", label: "Valid from", type: "date" },
              { name: "valid_until", label: "Valid until", type: "date" }
            ]}
            onSubmit={handleAddDiscount}
          />
        }
      />
      <div className="mt-4 space-y-3">
        {discounts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {translate(locale, "No discounts yet. Create a discount to start tracking campaigns.")}
          </div>
        ) : (
          discounts.map((discount) => (
            <div
              key={discount.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{discount.name}</p>
                <p className="text-xs text-slate-400">
                  {discount.valid_from ?? "—"} - {discount.valid_until ?? "—"}
                </p>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {discount.type === "percentage"
                  ? `${Number(discount.value)}%`
                  : `Rp ${Number(discount.value).toLocaleString("id-ID")}`}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  label={discount.status}
                  tone={discount.status === "expired" ? "warning" : "success"}
                />
                <QuickAddDialog
                  title="Edit discount"
                  description="Update discount rules"
                  triggerLabel="Edit"
                  submitLabel="Save"
                  initialValues={{
                    name: discount.name,
                    type: discount.type,
                    value: String(discount.value),
                    status: discount.status,
                    valid_from: discount.valid_from ?? "",
                    valid_until: discount.valid_until ?? ""
                  }}
                  fields={[
                    { name: "name", label: "Discount name", placeholder: "Discount name", required: true },
                    {
                      name: "type",
                      label: "Type",
                      type: "select",
                      required: true,
                      options: [
                        { label: "Percentage", value: "percentage" },
                        { label: "Fixed amount", value: "fixed" }
                      ]
                    },
                    { name: "value", label: "Value", type: "currency", required: true },
                    {
                      name: "status",
                      label: "Status",
                      type: "select",
                      options: [
                        { label: "Active", value: "active" },
                        { label: "Expired", value: "expired" }
                      ]
                    },
                    { name: "valid_from", label: "Valid from", type: "date" },
                    { name: "valid_until", label: "Valid until", type: "date" }
                  ]}
                  onSubmit={(values) => handleUpdateDiscount(discount.id, values)}
                />
                <Button variant="ghost" onClick={() => handleDeleteDiscount(discount.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-6 flex justify-end">
        {nextCursor ? (
          <Link
            href={{ pathname: "/discounts", query: { cursor: nextCursor } }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {translate(locale, "Next page")}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
