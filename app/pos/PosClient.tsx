"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import type { ProductRow, UiContentRow, VariantRow } from "@/lib/data";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";

interface PosClientProps {
  products: ProductRow[];
  variants: VariantRow[];
  customerFields: UiContentRow[];
  paymentMethods: UiContentRow[];
  summaryLines: UiContentRow[];
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  sku?: string | null;
  variantId?: string | null;
  unitPrice: number;
}

export default function PosClient({
  products,
  variants,
  customerFields,
  paymentMethods,
  summaryLines
}: PosClientProps) {
  const { locale } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [scannerValue, setScannerValue] = useState("");
  const scannerInputRef = useRef<HTMLInputElement | null>(null);
  const [productPage, setProductPage] = useState(1);
  const productPageSize = 6;

  useEffect(() => {
    if (scannerOpen) {
      const timer = setTimeout(() => {
        scannerInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [scannerOpen]);

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

  const handleAddToCart = (product: ProductRow) => {
    const productVariants = variants.filter((variant) => variant.product_id === product.id);
    const unitPrice = productVariants.length ? Number(productVariants[0].price) : 0;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        {
          id: product.id,
          name: product.name,
          quantity: 1,
          sku: product.sku,
          unitPrice
        },
        ...prev
      ];
    });
    setNotice(`${translate(locale, "Add to cart")}: ${product.name}.`);
  };

  const handleAddVariant = (variant: VariantRow) => {
    const unitLabel = variant.unit_label ?? "ml";
    const name = `${variant.product?.name ?? "Product"} ${variant.bottle_size_ml} ${unitLabel}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.variantId === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: variant.id,
          name,
          quantity: 1,
          sku: variant.barcode ?? null,
          variantId: variant.id,
          unitPrice: Number(variant.price)
        }
      ];
    });
    setNotice(`${translate(locale, "Add to cart")}: ${name}.`);
  };

  const handleScanSubmit = () => {
    const trimmed = scannerValue.trim();
    if (!trimmed) {
      return;
    }
    const match = variants.find((variant) => variant.barcode === trimmed);
    if (!match) {
      setNotice(`Barcode ${trimmed} not found.`);
      return;
    }
    handleAddVariant(match);
    setScannerValue("");
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id: string, nextValue: number) => {
    if (Number.isNaN(nextValue)) {
      return;
    }
    if (nextValue <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: nextValue } : item))
    );
  };

  const handleComplete = () => {
    setActionNotice(translate(locale, "Action completed successfully."));
  };

  const handleDraft = () => {
    setActionNotice(translate(locale, "Save draft"));
  };

  const handleApplyMemberDiscount = () => {
    if (cartItems.length === 0) {
      setActionNotice(translate(locale, "No items yet. Add products from the left to build the cart."));
      return;
    }
    setActionNotice(translate(locale, "Action completed successfully."));
  };

  const handleSaveForNextVisit = () => {
    setActionNotice(translate(locale, "Save for next visit"));
  };

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cartItems]
  );

  const discountAmount = useMemo(() => {
    const value = Number(discountValue || 0);
    if (!value) {
      return 0;
    }
    if (discountType === "percentage") {
      return Math.min(subtotal, subtotal * (value / 100));
    }
    return Math.min(subtotal, value);
  }, [discountType, discountValue, subtotal]);

  const totalDue = useMemo(() => Math.max(subtotal - discountAmount, 0), [subtotal, discountAmount]);

  const selectedPaymentLabel = useMemo(() => {
    const method = paymentMethods.find((item) => item.id === selectedPayment);
    return method?.label ?? "";
  }, [paymentMethods, selectedPayment]);

  const isCashPayment = useMemo(() => /cash|tunai/i.test(selectedPaymentLabel), [selectedPaymentLabel]);

  const changeDue = useMemo(() => {
    if (!isCashPayment) {
      return 0;
    }
    const received = Number(cashReceived || 0);
    return Math.max(received - totalDue, 0);
  }, [cashReceived, isCashPayment, totalDue]);

  const visibleProducts = useMemo(
    () => products.slice(0, productPage * productPageSize),
    [products, productPage, productPageSize]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
      <div className="space-y-6">
        <Card>
          <SectionHeader
            title={translate(locale, "Scan & add products")}
            subtitle={translate(locale, "Barcode ready. Use quick search for products and variants.")}
            action={<Button onClick={() => setScannerOpen(true)}>{translate(locale, "Open scanner")}</Button>}
          />
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:border-white/10 dark:bg-transparent dark:text-white dark:placeholder:text-slate-500"
              placeholder={translate(locale, "Search perfume name or barcode")}
            />
          </div>
          {notice ? (
            <div className="mt-4 rounded-xl border border-mint-200 bg-mint-50 px-4 py-2 text-xs text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-200">
              {notice}
            </div>
          ) : null}
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {visibleProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {translate(locale, "No products yet. Add products to start selling.")}
              </div>
            ) : (
              visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-400">SKU {product.sku ?? "—"}</p>
                    </div>
                    <Badge label={product.status ?? "Active"} tone="success" />
                  </div>
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    {translate(locale, "Pricing from variants table")}
                  </p>
                  <button
                    className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    onClick={() => handleAddToCart(product)}
                  >
                    {translate(locale, "Add to cart")}
                  </button>
                </div>
              ))
            )}
          </div>
          {products.length > visibleProducts.length ? (
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setProductPage((prev) => prev + 1)}>
                Load more products
              </Button>
            </div>
          ) : null}
        </Card>

        <Card>
          <SectionHeader
            title={translate(locale, "Customer & CRM")}
            subtitle={translate(locale, "Optional fields help create loyalty campaigns and targeted discounts.")}
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {customerFields.map((field) => (
              <input
                key={field.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                placeholder={field.label}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleApplyMemberDiscount}>
              {translate(locale, "Apply member discount")}
            </Button>
            <Button variant="ghost" onClick={handleSaveForNextVisit}>
              {translate(locale, "Save for next visit")}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="space-y-6">
        <SectionHeader
          title={translate(locale, "Checkout summary")}
          subtitle={translate(locale, "Confirm items, payment, and change.")}
        />
        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {translate(locale, "No items yet. Add products from the left to build the cart.")}
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">SKU {item.sku ?? "—"}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    Qty
                    <input
                      type="number"
                      min={0}
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantityChange(item.id, Number.parseInt(event.target.value, 10))
                      }
                    />
                  </label>
                  <button
                    className="text-xs font-semibold text-coral-600 transition hover:text-coral-500"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    {translate(locale, "Remove")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {totalItems} {translate(locale, "items in cart. Pricing will follow the selected variant size.")}
        </div>
        {actionNotice ? (
          <div className="rounded-xl border border-mint-200 bg-mint-50 p-4 text-xs text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-200">
            {actionNotice}
          </div>
        ) : null}
        <div className="space-y-3 border-t border-slate-200 pt-4 text-sm dark:border-white/10">
          <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
            <span>Subtotal</span>
            <span>Rp {formatIdr(String(Math.round(subtotal))) || "0"}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
            <span>Discount</span>
            <span>- Rp {formatIdr(String(Math.round(discountAmount))) || "0"}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-slate-900 dark:text-white">
            <span>Total due</span>
            <span>Rp {formatIdr(String(Math.round(totalDue))) || "0"}</span>
          </div>
          {summaryLines.map((line) => {
            const valueClass =
              line.accent === "mint"
                ? "text-mint-600 dark:text-mint-300"
                : line.accent === "strong"
                ? "text-slate-900 text-base font-semibold dark:text-white"
                : "text-slate-900 dark:text-white";
            const labelClass =
              line.accent === "strong"
                ? "text-base font-semibold text-slate-700 dark:text-slate-200"
                : "text-slate-500";
            return (
              <div
                key={line.id}
                className={`flex items-center justify-between ${line.accent === "strong" ? "text-base font-semibold" : ""}`}
              >
                <span className={labelClass}>{line.label}</span>
                <span className={valueClass}>{line.value ?? "Rp 0"}</span>
              </div>
            );
          })}
        </div>
        <div className="space-y-3">
          <SectionHeader
            title={translate(locale, "Payment")}
            subtitle={translate(locale, "Choose method and input cash received.")}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  selectedPayment === method.id
                    ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/60 dark:bg-primary-500/20 dark:text-primary-100"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                }`}
                onClick={() => setSelectedPayment(method.id)}
              >
                {method.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Discount type
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
                value={discountType}
                onChange={(event) => setDiscountType(event.target.value as "fixed" | "percentage")}
              >
                <option value="fixed">Fixed amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Discount value
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                placeholder={discountType === "percentage" ? "%" : "Rp"}
                inputMode="numeric"
                value={discountValue}
                onChange={(event) => setDiscountValue(parseIdr(event.target.value))}
              />
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Discount applied: Rp {formatIdr(String(Math.round(discountAmount))) || "0"}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              placeholder={translate(locale, "Cash received")}
              inputMode="numeric"
              value={formatIdr(cashReceived)}
              onChange={(event) => setCashReceived(parseIdr(event.target.value))}
              disabled={!isCashPayment}
            />
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              placeholder={translate(locale, "Change returned")}
              inputMode="numeric"
              value={isCashPayment ? formatIdr(String(Math.round(changeDue))) : "—"}
              readOnly
              disabled={!isCashPayment}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={handleComplete}>{translate(locale, "Complete transaction")}</Button>
          <Button variant="secondary" onClick={handleDraft}>
            {translate(locale, "Save draft")}
          </Button>
        </div>
      </Card>

      {scannerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {translate(locale, "Barcode scanner")}
                </h3>
                <p className="text-sm text-slate-400">
                  {translate(
                    locale,
                    "Use a USB scanner or input barcode manually to add products quickly."
                  )}
                </p>
              </div>
              <button
                className="text-sm font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
                onClick={() => setScannerOpen(false)}
              >
                {translate(locale, "Close")}
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {translate(locale, "Scanner ready. Focus the cursor here and scan the barcode.")}
            </div>
            <div className="mt-4 space-y-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                Barcode input
                <input
                  ref={scannerInputRef}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="Scan or type barcode"
                  value={scannerValue}
                  onChange={(event) => setScannerValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleScanSubmit();
                    }
                  }}
                />
              </label>
              <Button onClick={handleScanSubmit}>Add barcode</Button>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => setScannerOpen(false)}>{translate(locale, "Done scanning")}</Button>
              <Button variant="secondary" onClick={() => setScannerOpen(false)}>
                {translate(locale, "Cancel")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
