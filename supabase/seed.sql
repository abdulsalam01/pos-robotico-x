insert into vendors (name, contact)
values
  ('Aurora Fragrances', 'contact@aurorafragrances.com'),
  ('Luxe Essence Co', '+62 812 555 0199');

insert into products (name, sku, status, base_ml, description)
values
  ('Midnight Oud', 'PRF-001', 'active', 100, 'Warm oud with amber and vanilla notes.'),
  ('Citrus Bloom', 'PRF-002', 'active', 50, 'Bright citrus blend with neroli.'),
  ('Velvet Rose', 'PRF-003', 'active', 75, 'Soft rose petals with musk.');

insert into product_variants (product_id, bottle_size_ml, barcode, price, cost_per_ml, min_stock)
select id, 50, concat('899', lpad(row_number() over ()::text, 6, '0')), 350000, 2500, 5
from products;

insert into customers (name, phone, email, birthday, notes)
values
  ('Alya Pratama', '+62 812 2222 3333', 'alya@example.com', '1995-03-21', 'Prefers floral scents.'),
  ('Raka Wirawan', '+62 811 5555 6666', 'raka@example.com', '1990-11-02', 'VIP customer.');

insert into discounts (name, type, value, valid_from, valid_until, status)
values
  ('Member 10%', 'percentage', 10, now() - interval '7 days', now() + interval '30 days', 'active'),
  ('Grand Opening', 'fixed', 25000, now() - interval '1 day', now() + interval '14 days', 'active');

insert into ui_content (page, section, label, value, note, accent, href, icon, position)
values
  ('global', 'sidebar_nav', 'Dashboard', null, null, null, '/', 'dashboard', 1),
  ('global', 'sidebar_nav', 'Point of Sale', null, null, null, '/pos', 'pos', 2),
  ('global', 'sidebar_nav', 'Products', null, null, null, '/products', 'products', 3),
  ('global', 'sidebar_nav', 'Inventory', null, null, null, '/inventory', 'inventory', 4),
  ('global', 'sidebar_nav', 'Vendors', null, null, null, '/vendors', 'vendors', 5),
  ('global', 'sidebar_nav', 'Customers', null, null, null, '/customers', 'customers', 6),
  ('global', 'sidebar_nav', 'Discounts', null, null, null, '/discounts', 'discounts', 7),
  ('global', 'sidebar_nav', 'Reports', null, null, null, '/reports', 'reports', 8),
  ('global', 'sidebar_nav', 'Settings', null, null, null, '/settings', 'settings', 9),
  ('global', 'sidebar_alert', 'Realtime Stock Alerts', 'Check variants that hit minimum stock.', 'View Alerts', 'warning', null, null, 1),
  ('global', 'topbar_meta', 'POS Dashboard', null, null, null, null, null, 1),
  ('global', 'topbar_search', 'Search products, customers, invoices', null, null, null, null, null, 1),
  ('global', 'topbar_profile', 'Alya Rahman', 'Store Manager', null, null, null, null, 1),
  ('dashboard', 'kpis', 'Today Revenue', 'Rp 12.450.000', '+12% vs yesterday', 'mint', null, null, 1),
  ('dashboard', 'kpis', 'Gross Margin', '38.4%', '+2.1% since last week', 'primary', null, null, 2),
  ('dashboard', 'kpis', 'Orders', '142', '+18 orders', 'primary', null, null, 3),
  ('dashboard', 'kpis', 'Low Stock', '7 items', 'Need restock', 'coral', null, null, 4),
  ('dashboard', 'sales_pulse', 'Avg Basket', 'Rp 175.000', '+6%', null, null, null, 1),
  ('dashboard', 'sales_pulse', 'Peak Hour', '18:00 - 20:00', 'Friday', null, null, null, 2),
  ('dashboard', 'sales_pulse', 'Repeat Rate', '32%', 'Monthly', null, null, null, 3),
  ('dashboard', 'sales_chart', 'Sales chart placeholder — connect to Supabase analytics table for realtime line chart.', null, null, null, null, null, 1),
  ('dashboard', 'quick_actions', 'Start new POS transaction', null, null, null, null, null, 1),
  ('dashboard', 'quick_actions', 'Restock low items', null, null, null, null, null, 2),
  ('dashboard', 'quick_actions', 'Create discount campaign', null, null, null, null, null, 3),
  ('dashboard', 'quick_actions', 'Add new customer profile', null, null, null, null, null, 4),
  ('products', 'detail_fields', 'Product name', null, null, null, null, null, 1),
  ('products', 'detail_fields', 'Brand / Notes', null, null, null, null, null, 2),
  ('products', 'detail_fields', 'Base oil (ml/l)', null, null, null, null, null, 3),
  ('products', 'detail_fields', 'Barcode / SKU', null, null, null, null, null, 4),
  ('products', 'detail_fields', 'Image upload', null, null, null, null, null, 5),
  ('products', 'detail_fields', 'Full-text search tags', null, null, null, null, null, 6),
  ('discounts', 'rules', 'Discount type (fixed / %)', null, null, null, null, null, 1),
  ('discounts', 'rules', 'Eligible products', null, null, null, null, null, 2),
  ('discounts', 'rules', 'Minimum purchase', null, null, null, null, null, 3),
  ('discounts', 'rules', 'Expiration date', null, null, null, null, null, 4),
  ('discounts', 'rules', 'Customer segment', null, null, null, null, null, 5),
  ('discounts', 'rules', 'Usage limits', null, null, null, null, null, 6),
  ('discounts', 'preview_notes', 'Automatic calculation on checkout.', null, null, null, null, null, 1),
  ('discounts', 'preview_notes', 'Combine with member pricing.', null, null, null, null, null, 2),
  ('discounts', 'preview_notes', 'Real-time analytics in dashboard.', null, null, null, null, null, 3),
  ('reports', 'report_cards', 'Sales summary (daily, weekly, monthly)', null, null, null, null, null, 1),
  ('reports', 'report_cards', 'Product profitability & margin', null, null, null, null, null, 2),
  ('reports', 'report_cards', 'Inventory valuation', null, null, null, null, null, 3),
  ('reports', 'report_cards', 'Vendor purchase history', null, null, null, null, null, 4),
  ('reports', 'report_cards', 'Customer lifetime value', null, null, null, null, null, 5),
  ('reports', 'report_cards', 'Discount performance', null, null, null, null, null, 6),
  ('reports', 'settings', 'A4 / thermal printer friendly.', null, null, null, null, null, 1),
  ('reports', 'settings', 'Include barcode list for stock audit.', null, null, null, null, null, 2),
  ('reports', 'settings', 'Attach signature and approval notes.', null, null, null, null, null, 3),
  ('pos', 'customer_fields', 'Customer name', null, null, null, null, null, 1),
  ('pos', 'customer_fields', 'Phone or WhatsApp', null, null, null, null, null, 2),
  ('pos', 'customer_fields', 'Email (optional)', null, null, null, null, null, 3),
  ('pos', 'customer_fields', 'Birthday / Notes', null, null, null, null, null, 4),
  ('pos', 'payment_methods', 'Cash', null, null, null, null, null, 1),
  ('pos', 'payment_methods', 'QRIS', null, null, null, null, null, 2),
  ('pos', 'payment_methods', 'Debit', null, null, null, null, null, 3),
  ('pos', 'payment_methods', 'Credit', null, null, null, null, null, 4),
  ('pos', 'payment_methods', 'E-Wallet', null, null, null, null, null, 5),
  ('pos', 'payment_methods', 'Transfer', null, null, null, null, null, 6),
  ('pos', 'summary_lines', 'Subtotal', 'Rp 0', null, 'default', null, null, 1),
  ('pos', 'summary_lines', 'Discount (Member 10%)', 'Rp 0', null, 'mint', null, null, 2),
  ('pos', 'summary_lines', 'Tax', 'Rp 0', null, 'default', null, null, 3),
  ('pos', 'summary_lines', 'Total', 'Rp 0', null, 'strong', null, null, 4);
