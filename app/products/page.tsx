import AppShell from "@/components/AppShell";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";

const products = [
  {
    name: "Amber Noir",
    sku: "AN-001",
    variants: "3ml, 5ml, 10ml",
    price: "Rp 75.000 - Rp 210.000",
    stock: "68 units",
    status: "Healthy"
  },
  {
    name: "Velvet Rose",
    sku: "VR-014",
    variants: "5ml, 15ml",
    price: "Rp 90.000 - Rp 190.000",
    stock: "42 units",
    status: "Reorder"
  },
  {
    name: "Citrus Muse",
    sku: "CM-009",
    variants: "10ml, 30ml",
    price: "Rp 120.000 - Rp 320.000",
    stock: "26 units",
    status: "Low"
  }
];

export default function ProductsPage() {
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
          {products.map((product) => (
            <div key={product.sku} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{product.name}</p>
                  <p className="text-xs text-slate-400">SKU {product.sku}</p>
                </div>
                <Badge label={product.status} tone={product.status === "Healthy" ? "success" : "warning"} />
              </div>
              <div className="mt-4 text-sm text-slate-300">
                <p>Variants: {product.variants}</p>
                <p>Price: {product.price}</p>
                <p>Stock: {product.stock}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary">Edit</Button>
                <Button variant="ghost">Generate barcode</Button>
              </div>
            </div>
          ))}
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
