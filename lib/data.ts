import { supabase } from "@/lib/supabase";

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

const DEFAULT_PAGE_SIZE = 12;

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

export async function fetchProductsWithCursor(cursor?: string): Promise<CursorPage<ProductRow>> {
  const query = supabase
    .from("products")
    .select("id,name,sku,status,created_at")
    .order("created_at", { ascending: false })
    .limit(DEFAULT_PAGE_SIZE);

  const { data, error } = cursor ? await query.lt("created_at", cursor) : await query;

  if (error) {
    throw error;
  }

  const nextCursor = data.length === DEFAULT_PAGE_SIZE ? String(data[data.length - 1].created_at) : null;

  return {
    data,
    nextCursor
  };
}

export async function fetchDiscountsWithCursor(cursor?: string): Promise<CursorPage<DiscountRow>> {
  const query = supabase
    .from("discounts")
    .select("id,name,type,value,valid_from,valid_until,status,created_at")
    .order("created_at", { ascending: false })
    .limit(DEFAULT_PAGE_SIZE);

  const { data, error } = cursor ? await query.lt("created_at", cursor) : await query;

  if (error) {
    throw error;
  }

  const nextCursor = data.length === DEFAULT_PAGE_SIZE ? String(data[data.length - 1].created_at) : null;

  return {
    data,
    nextCursor
  };
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
