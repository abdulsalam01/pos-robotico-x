"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, SectionHeader } from "@/components/ui";
import { supabase } from "@/lib/supabase";

type ReportType = "sales" | "purchases" | "inventory";

interface ReportRow {
  title: string;
  detail: string;
  amount?: number;
  date?: string;
}

interface OptionRow {
  id: string;
  name: string | null;
}

export default function ReportsClient() {
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [productId, setProductId] = useState("");
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<OptionRow[]>([]);
  const [vendors, setVendors] = useState<OptionRow[]>([]);
  const [products, setProducts] = useState<OptionRow[]>([]);
  const [page, setPage] = useState(1);
  const [reportNotice, setReportNotice] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const loadFilters = async () => {
      const [{ data: customerData }, { data: vendorData }, { data: productData }] = await Promise.all([
        supabase.from("customers").select("id,name").order("name"),
        supabase.from("vendors").select("id,name").order("name"),
        supabase.from("products").select("id,name").order("name")
      ]);
      setCustomers(customerData ?? []);
      setVendors(vendorData ?? []);
      setProducts(productData ?? []);
    };
    void loadFilters();
  }, []);

  const formatIdr = (value: number | undefined) => {
    if (!value && value !== 0) {
      return "";
    }
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const applyDateFilters = <T extends { gte: (col: string, value: string) => T; lte: (col: string, value: string) => T }>(
    query: T
  ) => {
    let nextQuery = query;
    if (dateFrom) {
      nextQuery = nextQuery.gte("created_at", dateFrom);
    }
    if (dateTo) {
      nextQuery = nextQuery.lte("created_at", dateTo);
    }
    return nextQuery;
  };

  const handleGenerate = async (printPdf: boolean) => {
    setLoading(true);
    setPage(1);
    setReportNotice(null);
    try {
      if (reportType === "sales") {
        let query = supabase
          .from("transactions")
          .select("id,invoice_no,total,created_at,customer:customers(name)")
          .order("created_at", { ascending: false });
        if (customerId) {
          query = query.eq("customer_id", customerId);
        }
        query = applyDateFilters(query);
        const { data, error } = await query;
        if (error) {
          throw error;
        }
        const rows =
          data?.map((row) => ({
            title: row.invoice_no,
            detail: row.customer?.name ?? "Walk-in customer",
            amount: Number(row.total),
            date: row.created_at
          })) ?? [];
        setReportRows(rows);
        if (rows.length === 0) {
          setReportNotice("No sales data found for the selected filters.");
        }
        if (printPdf) {
          generatePdf(rows, "Sales report");
        }
      }

      if (reportType === "purchases") {
        let query = supabase
          .from("vendor_purchases")
          .select("id,volume_liter,price_per_liter,purchased_at,product:products(name),vendor:vendors(name)")
          .order("purchased_at", { ascending: false });
        if (vendorId) {
          query = query.eq("vendor_id", vendorId);
        }
        if (productId) {
          query = query.eq("product_id", productId);
        }
        if (dateFrom) {
          query = query.gte("purchased_at", dateFrom);
        }
        if (dateTo) {
          query = query.lte("purchased_at", dateTo);
        }
        const { data, error } = await query;
        if (error) {
          throw error;
        }
        const rows =
          data?.map((row) => ({
            title: row.product?.name ?? "Product",
            detail: row.vendor?.name ?? "Vendor",
            amount: Number(row.price_per_liter) * Number(row.volume_liter),
            date: row.purchased_at
          })) ?? [];
        setReportRows(rows);
        if (rows.length === 0) {
          setReportNotice("No purchase data found for the selected filters.");
        }
        if (printPdf) {
          generatePdf(rows, "Purchase report");
        }
      }

      if (reportType === "inventory") {
        let query = supabase
          .from("inventory_movements")
          .select("id,direction,quantity,created_at,variant:product_variants(bottle_size_ml,unit_label,product:products(name))")
          .order("created_at", { ascending: false });
        if (dateFrom) {
          query = query.gte("created_at", dateFrom);
        }
        if (dateTo) {
          query = query.lte("created_at", dateTo);
        }
        const { data, error } = await query;
        if (error) {
          throw error;
        }
        const rows =
          data?.map((row) => ({
            title: `${row.variant?.product?.name ?? "Product"} ${row.variant?.bottle_size_ml ?? 0}${row.variant?.unit_label ?? "ml"}`,
            detail: row.direction === "in" ? "Stock in" : "Stock out",
            amount: Number(row.quantity),
            date: row.created_at
          })) ?? [];
        setReportRows(rows);
        if (rows.length === 0) {
          setReportNotice("No inventory movement found for the selected filters.");
        }
        if (printPdf) {
          generatePdf(rows, "Inventory movement report");
        }
      }
    } catch (error) {
      setReportRows([]);
      setReportNotice(
        error instanceof Error ? error.message : "Unable to load report data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = (rows: ReportRow[], title: string) => {
    const win = window.open("", "_blank");
    if (!win) {
      return;
    }
    const tableRows = rows
      .map(
        (row) => `
        <tr>
          <td>${row.title}</td>
          <td>${row.detail}</td>
          <td>${row.amount !== undefined ? formatIdr(row.amount) : "-"}</td>
          <td>${row.date ? new Date(row.date).toLocaleString("id-ID") : "-"}</td>
        </tr>
      `
      )
      .join("");
    win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated ${new Date().toLocaleString("id-ID")}</p>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Detail</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || "<tr><td colspan='4'>No data found.</td></tr>"}
            </tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const visibleRows = useMemo(() => reportRows.slice(0, page * pageSize), [reportRows, page, pageSize]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
      <Card>
        <SectionHeader
          title="Report center"
          subtitle="Generate PDF summaries for finance and operations."
          action={
            <Button onClick={() => handleGenerate(true)} disabled={loading}>
              {loading ? "Generating..." : "Generate PDF"}
            </Button>
          }
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
            Report type
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={reportType}
              onChange={(event) => setReportType(event.target.value as ReportType)}
            >
              <option value="sales">Sales report</option>
              <option value="purchases">Purchase report</option>
              <option value="inventory">Inventory movement</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
            Customer
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              disabled={reportType !== "sales"}
            >
              <option value="">All customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name ?? "Unnamed customer"}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
            Vendor
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
              disabled={reportType !== "purchases"}
            >
              <option value="">All vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name ?? "Vendor"}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
            Product
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              disabled={reportType !== "purchases"}
            >
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name ?? "Product"}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
            Date from
            <input
              type="date"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
            Date to
            <input
              type="date"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => handleGenerate(false)} disabled={loading}>
            Preview report
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {reportNotice ? (
            <div className="rounded-xl border border-coral-200 bg-coral-50 p-4 text-xs text-coral-700 dark:border-coral-500/30 dark:bg-coral-500/10 dark:text-coral-200">
              {reportNotice}
            </div>
          ) : null}
          {visibleRows.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Run a report to see data.
            </div>
          ) : (
            visibleRows.map((row, index) => (
              <div
                key={`${row.title}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.title}</p>
                  <p className="text-xs text-slate-400">{row.detail}</p>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {row.amount !== undefined ? `Rp ${formatIdr(row.amount)}` : "-"}
                </div>
              </div>
            ))
          )}
          {reportRows.length > visibleRows.length ? (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setPage((prev) => prev + 1)}>
                Load more
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Print settings" subtitle="Customize layout, paper size, and metadata." />
        <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
          <p>✅ Select a report type and date range.</p>
          <p>✅ Filter by customer, vendor, or product.</p>
          <p>✅ Use Generate PDF to print or save as PDF.</p>
        </div>
      </Card>
    </div>
  );
}
