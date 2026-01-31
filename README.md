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

## Highlights

- Responsive POS UI with barcode-ready checkout.
- Product variants by bottle size (ml/l) with margin tracking.
- Inventory alerts when stock hits minimum levels.
- Vendor purchase tracking with weighted HPP calculation.
- CRM-ready customer profiles and discount campaigns.
- PDF reporting for sales, inventory, and finance.
