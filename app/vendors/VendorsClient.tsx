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

interface PurchaseItemDraft {
  id: string;
  product_id: string;
  volume_liter: string;
  price_per_liter: string;
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
  const [purchaseCart, setPurchaseCart] = useState<PurchaseItemDraft[]>([]);
  const [purchaseVendor, setPurchaseVendor] = useState("");
  const [purchasePage, setPurchasePage] = useState(1);
  const purchasePageSize = 5;

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

  const visiblePurchases = purchases.slice(0, purchasePage * purchasePageSize);

  const formatIdr = (value: string) => {
    if (!value) {
      return "";
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return "";
    }
    return new Intl.NumberFormat("id-ID").format(numericValue);
  };

  const parseIdr = (value: string) => value.replace(/[^\d]/g, "");

  const handleAddPurchaseItem = () => {
    if (!products.length) {
      return;
    }
    setPurchaseCart((prev) => [
      ...prev,
      { id: crypto.randomUUID(), product_id: products[0].id, volume_liter: "", price_per_liter: "" }
    ]);
  };

  const handleUpdatePurchaseItem = (id: string, field: keyof PurchaseItemDraft, value: string) => {
    setPurchaseCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemovePurchaseItem = (id: string) => {
    setPurchaseCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmitPurchase = async () => {
    if (!purchaseVendor) {
      return;
    }
    if (purchaseCart.length === 0) {
      return;
    }
    const payload = purchaseCart.map((item) => ({
      vendor_id: purchaseVendor,
      product_id: item.product_id,
      volume_liter: Number(item.volume_liter || 0),
      price_per_liter: Number(item.price_per_liter || 0)
    }));
    const { data, error } = await supabase
      .from("vendor_purchases")
      .insert(payload)
      .select("id,vendor_id,product_id,volume_liter,price_per_liter,purchased_at,vendor:vendors(name),product:products(name)");

    if (error) {
      return;
    }
    if (data) {
      setPurchases((prev) => [...data, ...prev]);
      setPurchaseCart([]);
    }
  };

  const totalVolume = purchaseCart.reduce((sum, item) => sum + Number(item.volume_liter || 0), 0);
  const totalCost = purchaseCart.reduce(
    (sum, item) => sum + Number(item.volume_liter || 0) * Number(item.price_per_liter || 0),
    0
  );

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
          subtitle="Quickly log a single vendor purchase line."
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
                { name: "price_per_liter", label: "Price per liter", type: "currency", required: true }
              ]}
              onSubmit={handleAddPurchase}
            />
          }
        />
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Use Log purchase for one-off vendor invoices. For multiple items in the same delivery, use Purchase builder
          below so everything is saved together.
        </div>
        {purchases.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            No purchase data yet.
          </div>
        ) : (
          visiblePurchases.map((purchase) => (
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
        {purchases.length > visiblePurchases.length ? (
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setPurchasePage((prev) => prev + 1)}>
              Load more purchases
            </Button>
          </div>
        ) : null}
      </div>
      <div className="mt-6 space-y-3">
        <SectionHeader
          title="Purchase builder"
          subtitle="Create a multi-item vendor purchase in clear steps."
          action={
            <Button variant="secondary" onClick={handleAddPurchaseItem}>
              Add item
            </Button>
          }
        />
        <div className="grid gap-4 lg:grid-cols-[1.1fr,1.4fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step 1</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Select vendor</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Choose the supplier before adding purchase items.
              </p>
            </div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Vendor
              <select
                value={purchaseVendor}
                onChange={(event) => setPurchaseVendor(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              <p className="font-semibold text-slate-600 dark:text-slate-200">Step 2 summary</p>
              <p className="mt-1">Add items with volume and price per liter.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step 2</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Add purchase items</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Each item logs the volume and price per liter from this vendor.
              </p>
            </div>
            {purchaseCart.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Add items to create a purchase order.
              </div>
            ) : (
              <div className="space-y-3">
                {purchaseCart.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 md:grid-cols-[2fr,1fr,1fr,auto]"
                  >
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                      Product
                      <select
                        value={item.product_id}
                        onChange={(event) => handleUpdatePurchaseItem(item.id, "product_id", event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                      Volume (L)
                      <input
                        type="number"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        value={item.volume_liter}
                        onChange={(event) => handleUpdatePurchaseItem(item.id, "volume_liter", event.target.value)}
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                      Price per liter
                      <input
                        inputMode="numeric"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        value={formatIdr(item.price_per_liter)}
                        onChange={(event) =>
                          handleUpdatePurchaseItem(item.id, "price_per_liter", parseIdr(event.target.value))
                        }
                      />
                    </label>
                    <div className="flex items-end">
                      <Button variant="ghost" onClick={() => handleRemovePurchaseItem(item.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step 3</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Review & submit</p>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Total volume: {totalVolume.toLocaleString("id-ID")} L • Estimated cost: Rp{" "}
              {totalCost.toLocaleString("id-ID")}
            </p>
          </div>
          <Button onClick={handleSubmitPurchase} disabled={!purchaseVendor || purchaseCart.length === 0}>
            Submit purchase
          </Button>
        </div>
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
