import AppShell from "@/components/AppShell";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import { fetchProductsWithCursor } from "@/lib/data";

const cartItems = [
  {
    name: "Amber Noir",
    variant: "10ml Bottle",
    qty: 2,
    price: "Rp 120.000",
    total: "Rp 240.000"
  },
  {
    name: "Velvet Rose",
    variant: "5ml Bottle",
    qty: 1,
    price: "Rp 75.000",
    total: "Rp 75.000"
  }
];

export default async function PosPage() {
  const { data: products } = await fetchProductsWithCursor();

  return (
    <AppShell
      title="Point of Sale"
      description="Process fast checkout with barcode, discounts, and automatic change."
    >
      <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="space-y-6">
          <Card>
            <SectionHeader
              title="Scan & add products"
              subtitle="Barcode ready. Use quick search for products and variants."
              action={<Button>Open scanner</Button>}
            />
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <input
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                placeholder="Search perfume name or barcode"
              />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {products.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                  No products yet. Add products to start selling.
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-slate-400">SKU {product.sku ?? "—"}</p>
                      </div>
                      <Badge label={product.status ?? "Active"} tone="success" />
                    </div>
                    <p className="mt-4 text-xs text-slate-400">Pricing from variants table</p>
                    <button className="mt-4 w-full rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
                      Add to cart
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="Customer & CRM"
              subtitle="Optional fields help create loyalty campaigns and targeted discounts."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                "Customer name",
                "Phone or WhatsApp",
                "Email (optional)",
                "Birthday / Notes"
              ].map((placeholder) => (
                <input
                  key={placeholder}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  placeholder={placeholder}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="secondary">Apply member discount</Button>
              <Button variant="ghost">Save for next visit</Button>
            </div>
          </Card>
        </div>

        <Card className="space-y-6">
          <SectionHeader title="Checkout summary" subtitle="Confirm items, payment, and change." />
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.variant}</p>
                  </div>
                  <div className="text-xs text-slate-400">{item.qty}x</div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-400">{item.price}</span>
                  <span className="font-semibold text-white">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white">Rp 315.000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Discount (Member 10%)</span>
              <span className="text-mint-300">- Rp 31.500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tax</span>
              <span className="text-white">Rp 0</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>Rp 283.500</span>
            </div>
          </div>
          <div className="space-y-3">
            <SectionHeader title="Payment" subtitle="Choose method and input cash received." />
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Cash",
                "QRIS",
                "Debit",
                "Credit",
                "E-Wallet",
                "Transfer"
              ].map((method) => (
                <button
                  key={method}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  {method}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                placeholder="Cash received"
              />
              <input
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                placeholder="Change returned"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button>Complete transaction</Button>
            <Button variant="secondary">Save draft</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
