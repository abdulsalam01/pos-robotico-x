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
  unit_label text default 'ml',
  barcode text unique,
  price numeric not null,
  cost_per_ml numeric,
  min_stock integer default 0,
  created_at timestamptz default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  symbol text,
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

create table ui_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  label text not null,
  value text,
  note text,
  accent text,
  href text,
  icon text,
  position integer default 0,
  created_at timestamptz default now()
);

create index products_created_at_idx on products(created_at desc);
create index products_status_idx on products(status);
create index product_variants_product_id_idx on product_variants(product_id);
create index product_variants_created_at_idx on product_variants(created_at desc);
create index units_label_idx on units(label);
create index vendor_purchases_vendor_id_idx on vendor_purchases(vendor_id);
create index vendor_purchases_created_at_idx on vendor_purchases(purchased_at desc);
create index inventory_movements_variant_id_idx on inventory_movements(variant_id);
create index inventory_movements_created_at_idx on inventory_movements(created_at desc);
create index customers_created_at_idx on customers(created_at desc);
create index discounts_created_at_idx on discounts(created_at desc);
create index products_search_idx on products using gin(search_vector);
create index variants_barcode_idx on product_variants(barcode);
create index transactions_created_at_idx on transactions(created_at desc);
create index transaction_items_transaction_id_idx on transaction_items(transaction_id);
create index ui_content_page_section_idx on ui_content(page, section, position);
