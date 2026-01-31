"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
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

interface ProductImageRow {
  id: string;
  image_url: string;
}

interface UnitRow {
  id: string;
  label: string;
  symbol: string | null;
}

export default function ProductsClient({ products, variants, detailFields, nextCursor }: ProductsClientProps) {
  const { locale } = useLanguage();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id ?? null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [productList, setProductList] = useState<ProductRow[]>(products);
  const [variantList, setVariantList] = useState<VariantRow[]>(variants);
  const [variantStock, setVariantStock] = useState<Record<string, number>>({});
  const [productImages, setProductImages] = useState<ProductImageRow[]>([]);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [variantPage, setVariantPage] = useState(1);

  const variantPageSize = 5;

  const selectedProduct = useMemo(
    () => productList.find((product) => product.id === selectedProductId) ?? productList[0],
    [productList, selectedProductId]
  );

  const filteredVariants = useMemo(
    () => variantList.filter((variant) => variant.product_id === selectedProduct?.id),
    [variantList, selectedProduct?.id]
  );

  const visibleVariants = useMemo(
    () => filteredVariants.slice(0, variantPage * variantPageSize),
    [filteredVariants, variantPage, variantPageSize]
  );

  useEffect(() => {
    const loadUnits = async () => {
      const { data } = await supabase.from("units").select("id,label,symbol").order("label");
      setUnits(data ?? []);
    };

    void loadUnits();
  }, []);

  useEffect(() => {
    setVariantPage(1);
  }, [selectedProduct?.id]);

  useEffect(() => {
    const loadImages = async () => {
      if (!selectedProduct?.id) {
        setProductImages([]);
        return;
      }
      const { data } = await supabase
        .from("product_images")
        .select("id,image_url")
        .eq("product_id", selectedProduct.id)
        .order("created_at", { ascending: false });
      setProductImages(data ?? []);
    };

    void loadImages();
  }, [selectedProduct?.id]);

  useEffect(() => {
    const loadStock = async () => {
      if (!filteredVariants.length) {
        setVariantStock({});
        return;
      }
      const ids = filteredVariants.map((variant) => variant.id);
      const { data } = await supabase
        .from("inventory_movements")
        .select("variant_id,direction,quantity")
        .in("variant_id", ids);

      const nextStock: Record<string, number> = {};
      (data ?? []).forEach((movement) => {
        const current = nextStock[movement.variant_id] ?? 0;
        const delta = movement.direction === "in" ? Number(movement.quantity) : -Number(movement.quantity);
        nextStock[movement.variant_id] = current + delta;
      });
      setVariantStock(nextStock);
    };

    void loadStock();
  }, [filteredVariants]);

  const computeCostPerMl = async (productId: string) => {
    const { data, error } = await supabase
      .from("vendor_purchases")
      .select("volume_liter,price_per_liter")
      .eq("product_id", productId);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const totals = data.reduce(
      (acc, row) => {
        const volume = Number(row.volume_liter);
        const price = Number(row.price_per_liter);
        return {
          totalVolume: acc.totalVolume + volume,
          totalCost: acc.totalCost + price * volume
        };
      },
      { totalVolume: 0, totalCost: 0 }
    );

    if (totals.totalVolume === 0) {
      return null;
    }

    return totals.totalCost / totals.totalVolume / 1000;
  };

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

  const handleUpdateProduct = async (productId: string, values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("products")
      .update({
        name: values.name,
        sku: values.sku || null,
        status: values.status || "Active"
      })
      .eq("id", productId)
      .select("id,name,sku,status,created_at")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setProductList((prev) => prev.map((product) => (product.id === productId ? data : product)));
      setStatusMessage(`${translate(locale, "Action completed successfully.")}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Delete this product and all variants?")) {
      return;
    }
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      setStatusMessage(error.message);
      return;
    }
    const nextProducts = productList.filter((product) => product.id !== productId);
    setProductList(nextProducts);
    setVariantList((prev) => prev.filter((variant) => variant.product_id !== productId));
    if (selectedProductId === productId) {
      setSelectedProductId(nextProducts[0]?.id ?? null);
    }
  };

  const handleCreateVariant = async (values: Record<string, string>) => {
    if (!selectedProduct?.id) {
      throw new Error("Select a product first.");
    }
    const costPerMl = await computeCostPerMl(selectedProduct.id);
    const { data, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: selectedProduct.id,
        bottle_size_ml: Number(values.bottle_size_ml),
        unit_label: values.unit_label || "ml",
        barcode: values.barcode || null,
        price: Number(values.price),
        min_stock: values.min_stock ? Number(values.min_stock) : 0,
        cost_per_ml: costPerMl
      })
      .select("id,product_id,bottle_size_ml,unit_label,barcode,price,cost_per_ml,min_stock,created_at,product:products(name)")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setVariantList((prev) => [data, ...prev]);
      setStatusMessage(`${translate(locale, "Action completed successfully.")}`);
    }
  };

  const handleUpdateVariant = async (variantId: string, values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("product_variants")
      .update({
        bottle_size_ml: Number(values.bottle_size_ml),
        unit_label: values.unit_label || "ml",
        barcode: values.barcode || null,
        price: Number(values.price),
        min_stock: values.min_stock ? Number(values.min_stock) : 0
      })
      .eq("id", variantId)
      .select("id,product_id,bottle_size_ml,unit_label,barcode,price,cost_per_ml,min_stock,created_at,product:products(name)")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setVariantList((prev) => prev.map((variant) => (variant.id === variantId ? data : variant)));
      setStatusMessage(`${translate(locale, "Action completed successfully.")}`);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!window.confirm("Delete this variant?")) {
      return;
    }
    const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
    if (error) {
      setStatusMessage(error.message);
      return;
    }
    setVariantList((prev) => prev.filter((variant) => variant.id !== variantId));
  };

  const handleRecalculateHpp = async (variantId: string) => {
    if (!selectedProduct?.id) {
      return;
    }
    const costPerMl = await computeCostPerMl(selectedProduct.id);
    const { data, error } = await supabase
      .from("product_variants")
      .update({ cost_per_ml: costPerMl })
      .eq("id", variantId)
      .select("id,product_id,bottle_size_ml,unit_label,barcode,price,cost_per_ml,min_stock,created_at,product:products(name)")
      .single();

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    if (data) {
      setVariantList((prev) => prev.map((variant) => (variant.id === variantId ? data : variant)));
    }
  };

  const handleAdjustStock = async (variantId: string, values: Record<string, string>) => {
    const { error } = await supabase.from("inventory_movements").insert({
      variant_id: variantId,
      direction: values.direction,
      quantity: Number(values.quantity),
      reason: values.reason || null
    });

    if (error) {
      throw error;
    }

    const { data } = await supabase
      .from("inventory_movements")
      .select("variant_id,direction,quantity")
      .eq("variant_id", variantId);
    const total = (data ?? []).reduce((sum, movement) => {
      const delta = movement.direction === "in" ? Number(movement.quantity) : -Number(movement.quantity);
      return sum + delta;
    }, 0);
    setVariantStock((prev) => ({ ...prev, [variantId]: total }));
  };

  const handleGenerateBarcode = (productName: string) => {
    setStatusMessage(`${translate(locale, "Action completed successfully.")} (${productName})`);
  };

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProduct?.id) {
      return;
    }
    const filePath = `products/${selectedProduct.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(filePath, file, {
      upsert: true
    });
    if (error) {
      setStatusMessage(error.message);
      return;
    }
    const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(filePath);
    const imageUrl = publicData.publicUrl;
    const { data } = await supabase
      .from("product_images")
      .insert({ product_id: selectedProduct.id, image_url: imageUrl })
      .select("id,image_url")
      .single();
    if (data) {
      setProductImages((prev) => [data, ...prev]);
    }
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
                  <QuickAddDialog
                    title="Edit product"
                    description="Update details"
                    triggerLabel="Edit"
                    submitLabel="Save"
                    initialValues={{
                      name: product.name,
                      sku: product.sku ?? "",
                      status: product.status ?? "Active"
                    }}
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
                    onSubmit={(values) => handleUpdateProduct(product.id, values)}
                  />
                  <Button variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                    Delete
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
          <div className="mt-4 space-y-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Upload product image
              <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-xs text-slate-500"
                onChange={handleUploadImage}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {productImages.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  No images uploaded yet.
                </div>
              ) : (
                productImages.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                    <img src={image.image_url} alt="Product" className="h-32 w-full object-cover" />
                  </div>
                ))
              )}
            </div>
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
            action={
              <div className="flex flex-wrap gap-2">
                <QuickAddDialog
                  title="Add variant"
                  description="Define size, price, and minimum stock"
                  triggerLabel="Quick add"
                  fields={[
                    { name: "bottle_size_ml", label: "Bottle size", type: "number", required: true },
                    {
                      name: "unit_label",
                      label: "Unit",
                      type: "select",
                      options:
                        units.length > 0
                          ? units.map((unit) => ({
                              label: unit.symbol ? `${unit.label} (${unit.symbol})` : unit.label,
                              value: unit.symbol ?? unit.label
                            }))
                          : [
                              { label: "Milliliter (ml)", value: "ml" },
                              { label: "Gram (g)", value: "g" },
                              { label: "Piece (pcs)", value: "pcs" }
                            ]
                    },
                    { name: "barcode", label: "Barcode", placeholder: "Barcode" },
                    { name: "price", label: "Price", type: "currency", required: true },
                    { name: "min_stock", label: "Min", type: "number" }
                  ]}
                  onSubmit={handleCreateVariant}
                />
                <QuickAddDialog
                  title="Add unit"
                  description="Manage unit master list"
                  triggerLabel="Add unit"
                  submitLabel="Save"
                  fields={[
                    { name: "label", label: "Unit name", placeholder: "Unit name", required: true },
                    { name: "symbol", label: "Symbol", placeholder: "Symbol" }
                  ]}
                  onSubmit={async (values) => {
                    const { data, error } = await supabase
                      .from("units")
                      .insert({ label: values.label, symbol: values.symbol || null })
                      .select("id,label,symbol")
                      .single();
                    if (error) {
                      throw error;
                    }
                    if (data) {
                      setUnits((prev) => [...prev, data]);
                    }
                  }}
                />
              </div>
            }
          />
          <div className="mt-4 space-y-3">
            {visibleVariants.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {translate(locale, "No variants yet. Add a product variant to define bottle size and pricing.")}
              </div>
            ) : (
              visibleVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {variant.bottle_size_ml} {variant.unit_label ?? "ml"}
                      </p>
                      <p className="text-xs text-slate-400">Product {variant.product?.name ?? "—"}</p>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Rp {Number(variant.price).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-300 sm:grid-cols-3">
                    <p>Stock: {variantStock[variant.id] ?? 0}</p>
                    <p>Min: {variant.min_stock ?? 0}</p>
                    <p>
                      HPP:{" "}
                      {variant.cost_per_ml
                        ? `Rp ${(Number(variant.cost_per_ml) * Number(variant.bottle_size_ml)).toLocaleString("id-ID")}`
                        : "Add vendor purchases"}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <QuickAddDialog
                      title="Edit variant"
                      description="Update size, price, and stock"
                      triggerLabel="Edit"
                      submitLabel="Save"
                      initialValues={{
                        bottle_size_ml: String(variant.bottle_size_ml),
                        unit_label: variant.unit_label ?? "ml",
                        barcode: variant.barcode ?? "",
                        price: String(variant.price),
                        min_stock: String(variant.min_stock ?? 0)
                      }}
                      fields={[
                        { name: "bottle_size_ml", label: "Bottle size", type: "number", required: true },
                        {
                          name: "unit_label",
                          label: "Unit",
                          type: "select",
                          options:
                            units.length > 0
                              ? units.map((unit) => ({
                                  label: unit.symbol ? `${unit.label} (${unit.symbol})` : unit.label,
                                  value: unit.symbol ?? unit.label
                                }))
                              : [
                                  { label: "Milliliter (ml)", value: "ml" },
                                  { label: "Gram (g)", value: "g" },
                                  { label: "Piece (pcs)", value: "pcs" }
                                ]
                        },
                        { name: "barcode", label: "Barcode", placeholder: "Barcode" },
                        { name: "price", label: "Price", type: "currency", required: true },
                        { name: "min_stock", label: "Min", type: "number" }
                      ]}
                      onSubmit={(values) => handleUpdateVariant(variant.id, values)}
                    />
                    <QuickAddDialog
                      title="Adjust stock"
                      description="Log inventory movement"
                      triggerLabel="Adjust stock"
                      submitLabel="Save"
                      fields={[
                        {
                          name: "direction",
                          label: "Type",
                          type: "select",
                          required: true,
                          options: [
                            { label: "Stock in", value: "in" },
                            { label: "Stock out", value: "out" }
                          ]
                        },
                        { name: "quantity", label: "Value", type: "number", required: true },
                        { name: "reason", label: "Note", placeholder: "Reason" }
                      ]}
                      onSubmit={(values) => handleAdjustStock(variant.id, values)}
                    />
                    <Button variant="ghost" onClick={() => handleDeleteVariant(variant.id)}>
                      Delete
                    </Button>
                    <Button variant="secondary" onClick={() => handleRecalculateHpp(variant.id)}>
                      Refresh HPP
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {filteredVariants.length > visibleVariants.length ? (
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setVariantPage((prev) => prev + 1)}>
                Load more variants
              </Button>
            </div>
          ) : null}
        </Card>
      </section>
    </>
  );
}
