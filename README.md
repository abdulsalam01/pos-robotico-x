# pos-robotico-x

Parfume POS system with inventory, CRM, vendor HPP tracking, and PDF reporting.

## Quick start

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase schema (SQL)

Use this as a starting point for your Supabase project. Create an internal user in Supabase Auth and use the login page (no public registration).

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  status text default 'active',
  base_ml numeric,
  description text,
  search_vector tsvector generated always as (
    to_tsvector('indonesian', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(sku, ''))
  ) stored,
  created_at timestamptz default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  bottle_size_ml numeric not null,
  barcode text unique,
  price numeric not null,
  cost_per_ml numeric,
  min_stock integer default 0,
  created_at timestamptz default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  created_at timestamptz default now()
);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  created_at timestamptz default now()
);

create table vendor_purchases (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  volume_liter numeric not null,
  price_per_liter numeric not null,
  purchased_at timestamptz default now()
);

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid references product_variants(id) on delete cascade,
  direction text check (direction in ('in', 'out')) not null,
  quantity integer not null,
  reason text,
  created_at timestamptz default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  birthday date,
  notes text,
  created_at timestamptz default now()
);

create table discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('percentage', 'fixed')) not null,
  value numeric not null,
  valid_from timestamptz,
  valid_until timestamptz,
  status text default 'active',
  created_at timestamptz default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null,
  customer_id uuid references customers(id) on delete set null,
  payment_method text,
  subtotal numeric not null,
  discount_total numeric default 0,
  tax_total numeric default 0,
  total numeric not null,
  cash_received numeric,
  change_returned numeric,
  created_at timestamptz default now()
);

create table transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  qty integer not null,
  price numeric not null,
  total numeric not null
);

create index products_created_at_idx on products(created_at desc);
create index discounts_created_at_idx on discounts(created_at desc);
create index products_search_idx on products using gin(search_vector);
create index variants_barcode_idx on product_variants(barcode);
```

## Highlights

- Responsive POS UI with barcode-ready checkout.
- Product variants by bottle size (ml/l) with margin tracking.
- Inventory alerts when stock hits minimum levels.
- Vendor purchase tracking with weighted HPP calculation.
- CRM-ready customer profiles and discount campaigns.
- PDF reporting for sales, inventory, and finance.
