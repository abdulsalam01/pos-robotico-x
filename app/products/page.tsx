import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import { fetchProductsWithCursor } from "@/lib/data";

interface ProductsPageProps {
  searchParams?: { cursor?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const cursor = searchParams?.cursor;
  const { data, nextCursor } = await fetchProductsWithCursor(cursor);

  return (
    <AppShell
      title="Products & Variants"
      description="Manage perfume catalog, bottle variants, pricing, barcode, and images."
    >
      <Card>
        <SectionHeader
          title="Catalog"
          subtitle="Each product supports multiple bottle sizes, pricing tiers, and barcode generation."
          action={<Button>Add new product</Button>}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              No products yet. Add a product to start tracking variants and inventory.
            </div>
          ) : (
            data.map((product) => (
              <div key={product.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">SKU {product.sku ?? "—"}</p>
                  </div>
                  <Badge label={product.status ?? "Active"} tone={product.status === "Healthy" ? "success" : "warning"} />
                </div>
                <div className="mt-4 text-sm text-slate-300">
                  <p>Variants: connect to variants table</p>
                  <p>Price: connect to variants pricing</p>
                  <p>Stock: connect to inventory ledger</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary">Edit</Button>
                  <Button variant="ghost">Generate barcode</Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex justify-end">
          {nextCursor ? (
            <Link
              href={{ pathname: "/products", query: { cursor: nextCursor } }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Next page
            </Link>
          ) : null}
        </div>
      </Card>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,1fr]">
        <Card>
          <SectionHeader
            title="Product detail"
            subtitle="Capture bottle size, stock, and pricing per variant."
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              "Product name",
              "Brand / Notes",
              "Base oil (ml/l)",
              "Barcode / SKU",
              "Image upload",
              "Full-text search tags"
            ].map((label) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {label}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Variant pricing"
            subtitle="Set bottle size and margin with realtime HPP updates."
          />
          <div className="mt-4 space-y-3">
            {[
              { size: "3ml", price: "Rp 45.000", margin: "58%" },
              { size: "5ml", price: "Rp 75.000", margin: "62%" },
              { size: "10ml", price: "Rp 120.000", margin: "65%" }
            ].map((variant) => (
              <div key={variant.size} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{variant.size} bottle</p>
                  <p className="text-xs text-slate-400">Margin {variant.margin}</p>
                </div>
                <p className="text-sm font-semibold text-white">{variant.price}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
