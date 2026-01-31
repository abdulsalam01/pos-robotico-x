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
  const [activePanel, setActivePanel] = useState<"details" | "variants" | "media" | "barcode">("details");
  const [barcodeModal, setBarcodeModal] = useState<{
    title: string;
    barcode: string;
    subtitle?: string;
  } | null>(null);

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
        status: values.status || "Active",
        base_ml: values.base_ml ? Number(values.base_ml) : null,
        description: values.description || null
      })
      .select("id,name,sku,status,base_ml,description,created_at")
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
        status: values.status || "Active",
        base_ml: values.base_ml ? Number(values.base_ml) : null,
        description: values.description || null
      })
      .eq("id", productId)
      .select("id,name,sku,status,base_ml,description,created_at")
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

  const handleGenerateBarcode = async (productId: string) => {
    const variant = variantList.find((item) => item.product_id === productId);
    if (!variant) {
      setStatusMessage("Add a variant before generating a barcode.");
      return;
    }
    await handleGenerateVariantBarcode(variant.id);
  };

  const handleGenerateVariantBarcode = async (variantId: string) => {
    const barcode = `PX-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data, error } = await supabase
      .from("product_variants")
      .update({ barcode })
      .eq("id", variantId)
      .select("id,product_id,bottle_size_ml,unit_label,barcode,price,cost_per_ml,min_stock,created_at,product:products(name)")
      .single();

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    if (data) {
      setVariantList((prev) => prev.map((variant) => (variant.id === variantId ? data : variant)));
      setStatusMessage(`Barcode generated: ${barcode}`);
    }
  };

  const buildBarcodeBars = (value: string) => {
    const bits = `101${value
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join("")}101`;
    const bars: { x: number; width: number }[] = [];
    let x = 0;
    const barWidth = 2;
    for (const bit of bits) {
      if (bit === "1") {
        bars.push({ x, width: barWidth });
      }
      x += barWidth;
    }
    return { bars, width: x };
  };

  const renderBarcodeSvg = (value: string, label: string) => {
    const { bars, width } = buildBarcodeBars(value);
    return (
      <svg width={width} height={72} viewBox={`0 0 ${width} 72`} role="img" aria-label={label}>
        <rect width={width} height={60} fill="white" />
        {bars.map((bar, index) => (
          <rect key={`${value}-${index}`} x={bar.x} y={0} width={bar.width} height={60} fill="black" />
        ))}
        <text x={width / 2} y={70} textAnchor="middle" fontSize="10" fill="#111827">
          {label}
        </text>
      </svg>
    );
  };

  const renderBarcodeSvgMarkup = (value: string, label: string) => {
    const { bars, width } = buildBarcodeBars(value);
    const barsMarkup = bars
      .map((bar) => `<rect x="${bar.x}" y="0" width="${bar.width}" height="60" fill="#111"></rect>`)
      .join("");
    return `
      <svg width="${width}" height="72" viewBox="0 0 ${width} 72" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="60" fill="white"></rect>
        ${barsMarkup}
        <text x="${width / 2}" y="70" text-anchor="middle" font-size="10" fill="#111827">${label}</text>
      </svg>
    `;
  };

  const openBarcodeModal = (title: string, barcode: string, subtitle?: string) => {
    setBarcodeModal({ title, barcode, subtitle });
  };

  const handlePrintBarcodes = (items: { label: string; barcode: string }[]) => {
    if (!items.length) {
      setStatusMessage("No barcodes available to print.");
      return;
    }
    const win = window.open("", "_blank");
    if (!win) {
      return;
    }
    const barcodeCards = items
      .map(
        (item) => `
        <div class="card">
          <div class="label">${item.label}</div>
          ${renderBarcodeSvgMarkup(item.barcode, item.barcode)}
        </div>
      `
      )
      .join("");
    win.document.write(`
      <html>
        <head>
          <title>Product Barcodes</title>
          <style>
            @page { size: A4; margin: 16mm; }
            body { font-family: Arial, sans-serif; color: #111827; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
            .card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
            .label { font-size: 12px; margin-bottom: 8px; }
            svg { width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <h1>Product Barcodes</h1>
          <div class="grid">${barcodeCards}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
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
    <div className="grid gap-6 xl:grid-cols-[1.1fr,1.5fr]">
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
                { name: "base_ml", label: "Bottle size (ml)", type: "number" },
                { name: "description", label: "Notes", placeholder: "Notes" },
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">SKU {product.sku ?? "—"}</p>
                  </div>
                  <Badge
                    label={product.status ?? "Active"}
                    tone={product.status === "Healthy" ? "success" : "warning"}
                  />
                </div>
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-300">
                  <p>Variants: {variantList.filter((variant) => variant.product_id === product.id).length}</p>
                  <p>
                    Barcode:{" "}
                    {variantList.find((variant) => variant.product_id === product.id && variant.barcode)
                      ? "Ready"
                      : "Generate first"}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setActivePanel("details");
                    }}
                  >
                    {translate(locale, "View details")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const variant = variantList.find(
                        (item) => item.product_id === product.id && item.barcode
                      );
                      if (!variant?.barcode) {
                        setStatusMessage("Generate a barcode first.");
                        return;
                      }
                      openBarcodeModal(product.name, variant.barcode);
                    }}
                  >
                    View barcode
                  </Button>
                  <QuickAddDialog
                    title="Edit product"
                    description="Update details"
                    triggerLabel="Edit"
                    submitLabel="Save"
                    initialValues={{
                      name: product.name,
                      sku: product.sku ?? "",
                      base_ml: product.base_ml ? String(product.base_ml) : "",
                      description: product.description ?? "",
                      status: product.status ?? "Active"
                    }}
                    fields={[
                      { name: "name", label: "Product name", placeholder: "Product name", required: true },
                      { name: "sku", label: "SKU", placeholder: "SKU" },
                      { name: "base_ml", label: "Bottle size (ml)", type: "number" },
                      { name: "description", label: "Notes", placeholder: "Notes" },
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
                  <Button variant="ghost" onClick={() => handleGenerateBarcode(product.id)}>
                    {translate(locale, "Generate barcode")}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex justify-between">
          <Button
            variant="secondary"
            onClick={() =>
              handlePrintBarcodes(
                variantList
                  .filter((variant) => variant.barcode)
                  .map((variant) => ({
                    label: `${variant.product?.name ?? "Product"} ${variant.bottle_size_ml} ${variant.unit_label ?? "ml"}`,
                    barcode: variant.barcode ?? ""
                  }))
              )
            }
          >
            Print all barcodes
          </Button>
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

      <Card className="space-y-4">
        <SectionHeader
          title="Product workspace"
          subtitle={selectedProduct ? `Managing ${selectedProduct.name}.` : "Select a product to begin."}
        />
        <div className="flex flex-wrap gap-2">
          {[
            { id: "details", label: "Details" },
            { id: "variants", label: "Variants" },
            { id: "media", label: "Media" },
            { id: "barcode", label: "Barcode" }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                activePanel === tab.id
                  ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/60 dark:bg-primary-500/20 dark:text-primary-100"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
              onClick={() => setActivePanel(tab.id as typeof activePanel)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activePanel === "details" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {selectedProduct
                ? `Viewing details for ${selectedProduct.name}.`
                : translate(locale, "Select a product to see its detail form.")}
            </div>
            {selectedProduct ? (
              <div className="grid gap-3 text-xs text-slate-500 dark:text-slate-300 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Measurement</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    {selectedProduct.base_ml ? `${selectedProduct.base_ml} ml` : "Not set"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Notes</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    {selectedProduct.description ?? "—"}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              {detailFields.map((field) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  {field.label}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activePanel === "variants" ? (
          <div className="space-y-4">
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
            <div className="space-y-3">
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
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (!variant.barcode) {
                            handleGenerateVariantBarcode(variant.id);
                            return;
                          }
                          openBarcodeModal(
                            `${variant.product?.name ?? "Product"} ${variant.bottle_size_ml} ${variant.unit_label ?? "ml"}`,
                            variant.barcode
                          );
                        }}
                      >
                        Generate barcode
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
          </div>
        ) : null}

        {activePanel === "media" ? (
          <div className="space-y-4">
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
        ) : null}

        {activePanel === "barcode" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {selectedProduct
                ? `Barcode preview for ${selectedProduct.name}.`
                : "Select a product to preview barcodes."}
            </div>
            {selectedProduct ? (
              <div className="space-y-3">
                {filteredVariants.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    Add a variant to enable barcode previews.
                  </div>
                ) : (
                  filteredVariants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {variant.product?.name ?? "Product"} {variant.bottle_size_ml}{" "}
                          {variant.unit_label ?? "ml"}
                        </p>
                        <p className="text-xs text-slate-400">{variant.barcode ?? "No barcode yet."}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {variant.barcode ? (
                          <button
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                            onClick={() =>
                              openBarcodeModal(
                                `${variant.product?.name ?? "Product"} ${variant.bottle_size_ml} ${variant.unit_label ?? "ml"}`,
                                variant.barcode ?? ""
                              )
                            }
                          >
                            Preview
                          </button>
                        ) : (
                          <Button variant="secondary" onClick={() => handleGenerateVariantBarcode(variant.id)}>
                            Generate barcode
                          </Button>
                        )}
                        {variant.barcode ? (
                          <Button
                            variant="secondary"
                            onClick={() =>
                              handlePrintBarcodes([
                                {
                                  label: `${variant.product?.name ?? "Product"} ${variant.bottle_size_ml} ${variant.unit_label ?? "ml"}`,
                                  barcode: variant.barcode ?? ""
                                }
                              ])
                            }
                          >
                            Print
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      {barcodeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{barcodeModal.title}</h3>
                <p className="text-sm text-slate-400">{barcodeModal.subtitle ?? "Barcode preview"}</p>
              </div>
              <button
                className="text-sm font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
                onClick={() => setBarcodeModal(null)}
              >
                Close
              </button>
            </div>
            <div className="mt-6 flex justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
              {renderBarcodeSvg(barcodeModal.barcode, barcodeModal.barcode)}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() =>
                  handlePrintBarcodes([{ label: barcodeModal.title, barcode: barcodeModal.barcode }])
                }
              >
                Print barcode
              </Button>
              <Button onClick={() => setBarcodeModal(null)}>Done</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
