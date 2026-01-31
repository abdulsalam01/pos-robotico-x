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

Use this as a starting point for your Supabase project. Create an internal user in Supabase Auth and use the login page (no public registration). The schema lives in [`supabase/schema.sql`](supabase/schema.sql).

## Seed data (optional)

To test the UI with sample data, run the seed script after applying the schema:

```sql
-- Supabase SQL editor
-- 1) Run supabase/schema.sql
-- 2) Run supabase/seed.sql
```

The seed file creates demo vendors, products, variants, customers, and discounts. You can add transactions manually from the POS screen after logging in. See [`supabase/seed.sql`](supabase/seed.sql).

## Login setup

The app expects a Supabase Auth user (email/password) that you create manually:

1. Open **Authentication → Users** in the Supabase dashboard.
2. Click **Add user** and set an email/password (for example `admin@store.com`).
3. Use that same email/password on `/login`.

## Highlights

- Responsive POS UI with barcode-ready checkout.
- Product variants by bottle size (ml/l) with margin tracking.
- Inventory alerts when stock hits minimum levels.
- Vendor purchase tracking with weighted HPP calculation.
- CRM-ready customer profiles and discount campaigns.
- PDF reporting for sales, inventory, and finance.
