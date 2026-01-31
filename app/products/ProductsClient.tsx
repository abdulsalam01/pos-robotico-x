"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import type { ProductRow, UiContentRow, VariantRow } from "@/lib/data";
import QuickAddDialog from "@/components/QuickAddDialog";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

interface ProductsClientProps {
  products: ProductRow[];
  variants: VariantRow[];
  detailFields: UiContentRow[];
  nextCursor: string | null;
}

export default function ProductsClient({ products, variants, detailFields, nextCursor }: ProductsClientProps) {
  const { locale } = useLanguage();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id ?? null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [productList, setProductList] = useState<ProductRow[]>(products);

  const selectedProduct = useMemo(
    () => productList.find((product) => product.id === selectedProductId) ?? productList[0],
    [productList, selectedProductId]
  );

  const handleCreateProduct = async (values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: values.name,
        sku: values.sku || null,
        status: values.status || "Active"
      })
      .select("id,name,sku,status,created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setProductList((prev) => [data, ...prev]);
      setSelectedProductId(data.id);
      setStatusMessage(`${translate(locale, "Action completed successfully.")}`);
    }
  };

  const handleGenerateBarcode = (productName: string) => {
    setStatusMessage(`${translate(locale, "Action completed successfully.")} (${productName})`);
  };

  return (
    <>
      <Card>
        <SectionHeader
          title={translate(locale, "Catalog")}
          subtitle={translate(
            locale,
            "Each product supports multiple bottle sizes, pricing tiers, and barcode generation."
          )}
          action={
            <QuickAddDialog
              title="Add new product"
              description="Quick add"
              triggerLabel="Add new product"
              fields={[
                { name: "name", label: "Product name", placeholder: "Product name", required: true },
                { name: "sku", label: "SKU", placeholder: "SKU" },
                {
                  name: "status",
                  label: "Status",
                  type: "select",
                  options: [
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" }
                  ]
                }
              ]}
              onSubmit={handleCreateProduct}
            />
          }
        />
        {statusMessage ? (
          <div className="mt-4 rounded-xl border border-mint-200 bg-mint-50 px-4 py-2 text-xs text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-200">
            {statusMessage}
          </div>
        ) : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {productList.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {translate(locale, "No products yet. Add a product to start tracking variants and inventory.")}
            </div>
          ) : (
            productList.map((product) => (
              <div
                key={product.id}
                className={`rounded-2xl border p-4 transition ${
                  product.id === selectedProduct?.id
                    ? "border-primary-200 bg-primary-50/40 dark:border-primary-500/40 dark:bg-primary-500/10"
                    : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">SKU {product.sku ?? "—"}</p>
                  </div>
                  <Badge
                    label={product.status ?? "Active"}
                    tone={product.status === "Healthy" ? "success" : "warning"}
                  />
                </div>
                <div className="mt-4 text-sm text-slate-500 dark:text-slate-300">
                  <p>Variants: connect to variants table</p>
                  <p>Price: connect to variants pricing</p>
                  <p>Stock: connect to inventory ledger</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setSelectedProductId(product.id)}>
                    {translate(locale, "View details")}
                  </Button>
                  <Button variant="ghost" onClick={() => handleGenerateBarcode(product.name)}>
                    {translate(locale, "Generate barcode")}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex justify-end">
          {nextCursor ? (
            <Link
              href={{ pathname: "/products", query: { cursor: nextCursor } }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              {translate(locale, "Next page")}
            </Link>
          ) : null}
        </div>
      </Card>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,1fr]">
        <Card>
          <SectionHeader
            title={translate(locale, "Product detail")}
            subtitle={translate(locale, "Capture bottle size, stock, and pricing per variant.")}
          />
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {selectedProduct
              ? `Viewing details for ${selectedProduct.name}.`
              : translate(locale, "Select a product to see its detail form.")}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {detailFields.map((field) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                {field.label}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title={translate(locale, "Variant pricing")}
            subtitle={translate(locale, "Set bottle size and margin with realtime HPP updates.")}
          />
          <div className="mt-4 space-y-3">
            {variants.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {translate(locale, "No variants yet. Add a product variant to define bottle size and pricing.")}
              </div>
            ) : (
              variants.slice(0, 3).map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {variant.bottle_size_ml} ml bottle
                    </p>
                    <p className="text-xs text-slate-400">Product {variant.product?.name ?? "—"}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Rp {Number(variant.price).toLocaleString("id-ID")}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </>
  );
}
