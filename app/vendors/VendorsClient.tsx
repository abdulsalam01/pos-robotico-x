"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, SectionHeader } from "@/components/ui";
import QuickAddDialog from "@/components/QuickAddDialog";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { VendorRow } from "@/lib/data";

interface ProductOption {
  id: string;
  name: string;
}

interface PurchaseRow {
  id: string;
  vendor_id: string | null;
  product_id: string | null;
  volume_liter: number;
  price_per_liter: number;
  purchased_at: string;
  vendor?: { name: string | null } | null;
  product?: { name: string | null } | null;
}

interface VendorsClientProps {
  initialData: VendorRow[];
  nextCursor: string | null;
}

export default function VendorsClient({ initialData, nextCursor }: VendorsClientProps) {
  const { locale } = useLanguage();
  const [vendors, setVendors] = useState<VendorRow[]>(initialData);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from("products").select("id,name").order("name");
      setProducts(data ?? []);
    };
    const loadPurchases = async () => {
      const { data } = await supabase
        .from("vendor_purchases")
        .select("id,vendor_id,product_id,volume_liter,price_per_liter,purchased_at,vendor:vendors(name),product:products(name)")
        .order("purchased_at", { ascending: false })
        .limit(10);
      setPurchases(data ?? []);
    };
    void loadProducts();
    void loadPurchases();
  }, []);

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

  const handleUpdateVendor = async (vendorId: string, values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("vendors")
      .update({
        name: values.name,
        contact: values.contact || null
      })
      .eq("id", vendorId)
      .select("id,name,contact,created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setVendors((prev) => prev.map((vendor) => (vendor.id === vendorId ? data : vendor)));
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!window.confirm("Delete this vendor and related purchases?")) {
      return;
    }
    const { error } = await supabase.from("vendors").delete().eq("id", vendorId);
    if (error) {
      return;
    }
    setVendors((prev) => prev.filter((vendor) => vendor.id !== vendorId));
  };

  const handleAddPurchase = async (values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("vendor_purchases")
      .insert({
        vendor_id: values.vendor_id,
        product_id: values.product_id,
        volume_liter: Number(values.volume_liter),
        price_per_liter: Number(values.price_per_liter)
      })
      .select("id,vendor_id,product_id,volume_liter,price_per_liter,purchased_at,vendor:vendors(name),product:products(name)")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setPurchases((prev) => [data, ...prev]);
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
              <div className="flex flex-wrap gap-2">
                <QuickAddDialog
                  title="Edit vendor"
                  description="Update vendor"
                  triggerLabel="Edit"
                  submitLabel="Save"
                  initialValues={{ name: vendor.name, contact: vendor.contact ?? "" }}
                  fields={[
                    { name: "name", label: "Vendor name", placeholder: "Vendor name", required: true },
                    { name: "contact", label: "Contact", placeholder: "Contact" }
                  ]}
                  onSubmit={(values) => handleUpdateVendor(vendor.id, values)}
                />
                <Button variant="ghost" onClick={() => handleDeleteVendor(vendor.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-6 space-y-3">
        <SectionHeader
          title="Log purchase"
          subtitle="Add vendor costs to calculate HPP automatically."
          action={
            <QuickAddDialog
              title="Log purchase"
              description="Add volume and price per liter"
              triggerLabel="Log purchase"
              submitLabel="Save"
              fields={[
                {
                  name: "vendor_id",
                  label: "Vendor",
                  type: "select",
                  required: true,
                  options: vendors.map((vendor) => ({ label: vendor.name, value: vendor.id }))
                },
                {
                  name: "product_id",
                  label: "Product",
                  type: "select",
                  required: true,
                  options: products.map((product) => ({ label: product.name, value: product.id }))
                },
                { name: "volume_liter", label: "Volume (L)", type: "number", required: true },
                { name: "price_per_liter", label: "Price per liter", type: "number", required: true }
              ]}
              onSubmit={handleAddPurchase}
            />
          }
        />
        {purchases.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            No purchase data yet.
          </div>
        ) : (
          purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {purchase.product?.name ?? "Product"}
                </p>
                <p className="text-xs text-slate-400">{purchase.vendor?.name ?? "Vendor"}</p>
              </div>
              <div>
                {Number(purchase.volume_liter).toLocaleString("id-ID")} L @ Rp{" "}
                {Number(purchase.price_per_liter).toLocaleString("id-ID")}
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
