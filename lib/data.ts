import { supabase } from "@/lib/supabase";

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

export async function fetchProductsWithCursor(cursor?: string): Promise<CursorPage<Record<string, unknown>>> {
  const pageSize = 12;
  const query = supabase
    .from("products")
    .select("id,name,created_at")
    .order("created_at", { ascending: false })
    .limit(pageSize);

  const { data, error } = cursor ? await query.lt("created_at", cursor) : await query;

  if (error) {
    throw error;
  }

  const nextCursor = data.length === pageSize ? String(data[data.length - 1].created_at) : null;

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
