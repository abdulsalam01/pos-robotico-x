import AppShell from "@/components/AppShell";
import ProductsClient from "@/app/products/ProductsClient";
import { fetchProductsWithCursor, fetchUiContent, fetchVariantsWithCursor } from "@/lib/data";

interface ProductsPageProps {
  searchParams?: Promise<{ cursor?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const cursor = resolvedSearchParams.cursor;
  const [{ data: products, nextCursor }, variants, detailFields] = await Promise.all([
    fetchProductsWithCursor(cursor),
    fetchVariantsWithCursor().then((response) => response.data),
    fetchUiContent("products", "detail_fields")
  ]);

  return (
    <AppShell
      title="Products & Variants"
      description="Manage perfume catalog, bottle variants, pricing, barcode, and images."
    >
      <ProductsClient
        products={products}
        variants={variants}
        detailFields={detailFields}
        nextCursor={nextCursor}
      />
    </AppShell>
  );
}
