import AppShell from "@/components/AppShell";
import PosClient from "@/app/pos/PosClient";
import { fetchProductsWithCursor, fetchUiContent, fetchVariantsWithCursor } from "@/lib/data";

export default async function PosPage() {
  const [products, variants, customerFields, paymentMethods, summaryLines] = await Promise.all([
    fetchProductsWithCursor().then((response) => response.data),
    fetchVariantsWithCursor().then((response) => response.data),
    fetchUiContent("pos", "customer_fields"),
    fetchUiContent("pos", "payment_methods"),
    fetchUiContent("pos", "summary_lines")
  ]);

  return (
    <AppShell
      title="Point of Sale"
      description="Process fast checkout with barcode, discounts, and automatic change."
    >
      <PosClient
        products={products}
        variants={variants}
        customerFields={customerFields}
        paymentMethods={paymentMethods}
        summaryLines={summaryLines}
      />
    </AppShell>
  );
}
