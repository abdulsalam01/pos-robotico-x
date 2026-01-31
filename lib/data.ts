import { supabase } from "@/lib/supabase";
import { withCache } from "@/lib/cache";

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

interface CursorPayload {
  createdAt: string;
  id: string;
}

const DEFAULT_PAGE_SIZE = 12;
const CACHE_TTL_MS = 30_000;

export interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  status: string | null;
  created_at: string;
}

export interface DiscountRow {
  id: string;
  name: string;
  type: string;
  value: number | string;
  valid_from: string | null;
  valid_until: string | null;
  status: string;
  created_at: string;
}

export interface CustomerRow {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface VendorRow {
  id: string;
  name: string;
  contact: string | null;
  created_at: string;
}

export interface VariantRow {
  id: string;
  bottle_size_ml: number;
  barcode: string | null;
  price: number | string;
  min_stock: number | null;
  created_at: string;
  product?: { name: string | null } | null;
}

export interface TransactionRow {
  id: string;
  invoice_no: string;
  payment_method: string | null;
  total: number | string;
  created_at: string;
}

export interface UiContentRow {
  id: string;
  page: string;
  section: string;
  label: string;
  value: string | null;
  note: string | null;
  accent: string | null;
  href: string | null;
  icon: string | null;
  position: number | null;
}

const encodeCursor = (payload: CursorPayload) => `${payload.createdAt}|${payload.id}`;

const parseCursor = (cursor?: string | null): CursorPayload | null => {
  if (!cursor) {
    return null;
  }
  const [createdAt, id] = cursor.split("|");
  if (!createdAt || !id) {
    return null;
  }
  return { createdAt, id };
};

const applyCursor = <T>(query: T, cursor?: string | null) => {
  const parsed = parseCursor(cursor);
  if (!parsed) {
    return query;
  }
  const createdAt = encodeURIComponent(parsed.createdAt);
  const id = encodeURIComponent(parsed.id);
  return query.or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`);
};

export async function fetchProductsWithCursor(cursor?: string): Promise<CursorPage<ProductRow>> {
  return withCache(`products:${cursor ?? "first"}`, CACHE_TTL_MS, async () => {
    const query = applyCursor(
      supabase
        .from("products")
        .select("id,name,sku,status,created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(DEFAULT_PAGE_SIZE),
      cursor
    );
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const nextCursor =
      data.length === DEFAULT_PAGE_SIZE
        ? encodeCursor({ createdAt: data[data.length - 1].created_at, id: data[data.length - 1].id })
        : null;

    return {
      data,
      nextCursor
    };
  });
}

export async function fetchDiscountsWithCursor(cursor?: string): Promise<CursorPage<DiscountRow>> {
  return withCache(`discounts:${cursor ?? "first"}`, CACHE_TTL_MS, async () => {
    const query = applyCursor(
      supabase
        .from("discounts")
        .select("id,name,type,value,valid_from,valid_until,status,created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(DEFAULT_PAGE_SIZE),
      cursor
    );

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const nextCursor =
      data.length === DEFAULT_PAGE_SIZE
        ? encodeCursor({ createdAt: data[data.length - 1].created_at, id: data[data.length - 1].id })
        : null;

    return {
      data,
      nextCursor
    };
  });
}

export async function fetchCustomersWithCursor(cursor?: string): Promise<CursorPage<CustomerRow>> {
  return withCache(`customers:${cursor ?? "first"}`, CACHE_TTL_MS, async () => {
    const query = applyCursor(
      supabase
        .from("customers")
        .select("id,name,phone,email,created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(DEFAULT_PAGE_SIZE),
      cursor
    );

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const nextCursor =
      data.length === DEFAULT_PAGE_SIZE
        ? encodeCursor({ createdAt: data[data.length - 1].created_at, id: data[data.length - 1].id })
        : null;

    return { data, nextCursor };
  });
}

export async function fetchVendorsWithCursor(cursor?: string): Promise<CursorPage<VendorRow>> {
  return withCache(`vendors:${cursor ?? "first"}`, CACHE_TTL_MS, async () => {
    const query = applyCursor(
      supabase
        .from("vendors")
        .select("id,name,contact,created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(DEFAULT_PAGE_SIZE),
      cursor
    );

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const nextCursor =
      data.length === DEFAULT_PAGE_SIZE
        ? encodeCursor({ createdAt: data[data.length - 1].created_at, id: data[data.length - 1].id })
        : null;

    return { data, nextCursor };
  });
}

export async function fetchVariantsWithCursor(cursor?: string): Promise<CursorPage<VariantRow>> {
  return withCache(`variants:${cursor ?? "first"}`, CACHE_TTL_MS, async () => {
    const query = applyCursor(
      supabase
        .from("product_variants")
        .select("id,bottle_size_ml,barcode,price,min_stock,created_at,product:products(name)")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(DEFAULT_PAGE_SIZE),
      cursor
    );

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const nextCursor =
      data.length === DEFAULT_PAGE_SIZE
        ? encodeCursor({ createdAt: data[data.length - 1].created_at, id: data[data.length - 1].id })
        : null;

    return { data, nextCursor };
  });
}

export async function fetchTransactionsWithCursor(cursor?: string): Promise<CursorPage<TransactionRow>> {
  return withCache(`transactions:${cursor ?? "first"}`, CACHE_TTL_MS, async () => {
    const query = applyCursor(
      supabase
        .from("transactions")
        .select("id,invoice_no,payment_method,total,created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(DEFAULT_PAGE_SIZE),
      cursor
    );

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const nextCursor =
      data.length === DEFAULT_PAGE_SIZE
        ? encodeCursor({ createdAt: data[data.length - 1].created_at, id: data[data.length - 1].id })
        : null;

    return { data, nextCursor };
  });
}

export async function searchProducts(query: string) {
  return supabase
    .from("products")
    .select("id,name,search_vector")
    .textSearch("search_vector", query, {
      type: "plain",
      config: "indonesian"
    })
    .limit(10);
}

export async function fetchUiContent(page: string, section: string): Promise<UiContentRow[]> {
  return withCache(`ui:${page}:${section}`, CACHE_TTL_MS, async () => {
    const { data, error } = await supabase
      .from("ui_content")
      .select("id,page,section,label,value,note,accent,href,icon,position")
      .eq("page", page)
      .eq("section", section)
      .order("position", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  });
}

export async function fetchVariantMinimumCount() {
  const { count, error } = await supabase
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .gt("min_stock", 0);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
