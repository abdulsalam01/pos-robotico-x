import { cookies } from "next/headers";

export type Locale = "en" | "id";

export const DEFAULT_LOCALE: Locale = "en";

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {},
  id: {
    "POS Dashboard": "Dashboard POS",
    "Search products, customers, invoices": "Cari produk, pelanggan, faktur",
    "Fast retail control": "Kontrol ritel cepat",
    "Inventory Alerts": "Peringatan Inventori",
    "Review inventory levels to prevent out of stock items.":
      "Tinjau level stok untuk mencegah barang habis.",
    "View Alerts": "Lihat Peringatan",
    "Open scanner": "Buka pemindai",
    "Scan & add products": "Pindai & tambah produk",
    "Barcode ready. Use quick search for products and variants.":
      "Barcode siap. Gunakan pencarian cepat untuk produk dan varian.",
    "Search perfume name or barcode": "Cari nama parfum atau barcode",
    "No products yet. Add products to start selling.":
      "Belum ada produk. Tambahkan produk untuk mulai berjualan.",
    "Pricing from variants table": "Harga dari tabel varian",
    "Add to cart": "Tambah ke keranjang",
    "Customer & CRM": "Pelanggan & CRM",
    "Optional fields help create loyalty campaigns and targeted discounts.":
      "Bidang opsional membantu membuat kampanye loyalitas dan diskon yang ditargetkan.",
    "Apply member discount": "Terapkan diskon member",
    "Save for next visit": "Simpan untuk kunjungan berikutnya",
    "Checkout summary": "Ringkasan pembayaran",
    "Confirm items, payment, and change.": "Konfirmasi item, pembayaran, dan kembalian.",
    "No items yet. Add products from the left to build the cart.":
      "Belum ada item. Tambahkan produk dari kiri untuk membuat keranjang.",
    "Remove": "Hapus",
    "items in cart. Pricing will follow the selected variant size.":
      "item di keranjang. Harga mengikuti ukuran varian yang dipilih.",
    "Payment": "Pembayaran",
    "Choose method and input cash received.": "Pilih metode dan masukkan uang diterima.",
    "Cash received": "Uang diterima",
    "Change returned": "Kembalian",
    "Complete transaction": "Selesaikan transaksi",
    "Save draft": "Simpan draft",
    "Barcode scanner": "Pemindai barcode",
    "Use a USB scanner or input barcode manually to add products quickly.":
      "Gunakan pemindai USB atau masukkan barcode secara manual untuk menambah produk dengan cepat.",
    "Close": "Tutup",
    "Scanner ready. Focus the cursor here and scan the barcode.":
      "Pemindai siap. Fokuskan kursor di sini dan pindai barcode.",
    "Done scanning": "Selesai memindai",
    "Cancel": "Batal",
    "Catalog": "Katalog",
    "Each product supports multiple bottle sizes, pricing tiers, and barcode generation.":
      "Setiap produk mendukung beberapa ukuran botol, tingkatan harga, dan pembuatan barcode.",
    "Add new product": "Tambah produk baru",
    "No products yet. Add a product to start tracking variants and inventory.":
      "Belum ada produk. Tambahkan produk untuk mulai melacak varian dan inventori.",
    "View details": "Lihat detail",
    "Generate barcode": "Buat barcode",
    "Product detail": "Detail produk",
    "Capture bottle size, stock, and pricing per variant.":
      "Catat ukuran botol, stok, dan harga per varian.",
    "Select a product to see its detail form.":
      "Pilih produk untuk melihat formulir detailnya.",
    "Variant pricing": "Harga varian",
    "Set bottle size and margin with realtime HPP updates.":
      "Atur ukuran botol dan margin dengan pembaruan HPP real-time.",
    "No variants yet. Add a product variant to define bottle size and pricing.":
      "Belum ada varian. Tambahkan varian produk untuk menentukan ukuran botol dan harga.",
    "Customers & CRM": "Pelanggan & CRM",
    "Capture optional customer data for loyalty and personalized campaigns.":
      "Tangkap data pelanggan opsional untuk loyalitas dan kampanye personal.",
    "Customer list": "Daftar pelanggan",
    "All visits, segments, and discount history.": "Semua kunjungan, segmen, dan riwayat diskon.",
    "Add customer": "Tambah pelanggan",
    "No customers yet. Add optional customer profiles to enable CRM.":
      "Belum ada pelanggan. Tambahkan profil pelanggan opsional untuk mengaktifkan CRM.",
    "Unnamed customer": "Pelanggan tanpa nama",
    "No contact set": "Tidak ada kontak",
    "Loyalty insights": "Wawasan loyalitas",
    "Optional data entry to respect customer privacy.":
      "Entri data opsional untuk menghormati privasi pelanggan.",
    "Create loyalty tier": "Buat tingkatan loyalitas",
    "Discount Management": "Manajemen Diskon",
    "Create fixed or percentage discounts for products or transactions.":
      "Buat diskon nominal atau persentase untuk produk atau transaksi.",
    "Active campaigns": "Kampanye aktif",
    "Manage expiry dates and eligibility rules.": "Kelola tanggal kedaluwarsa dan aturan kelayakan.",
    "Add discount": "Tambah diskon",
    "No discounts yet. Create a discount to start tracking campaigns.":
      "Belum ada diskon. Buat diskon untuk mulai melacak kampanye.",
    "Next page": "Halaman berikutnya",
    "Rules builder": "Pembuat aturan",
    "Attach discounts to products, categories, or checkout totals.":
      "Lampirkan diskon ke produk, kategori, atau total pembayaran.",
    "POS preview": "Pratinjau POS",
    "Simulate discounts before launching.": "Simulasikan diskon sebelum diluncurkan.",
    "Run simulation": "Jalankan simulasi",
    "Vendors": "Vendor",
    "Vendor & HPP Tracking": "Pelacakan Vendor & HPP",
    "Track purchase cost per liter and calculate HPP per variant automatically.":
      "Lacak biaya pembelian per liter dan hitung HPP per varian secara otomatis.",
    "HPP calculation": "Perhitungan HPP",
    "Weighted average cost across vendors.": "Biaya rata-rata tertimbang antar vendor.",
    "Vendor list": "Daftar vendor",
    "Monitor supplier prices, quality, and supply history.":
      "Pantau harga pemasok, kualitas, dan riwayat pasokan.",
    "Add vendor": "Tambah vendor",
    "No vendors yet. Add a vendor profile to start logging contacts.":
      "Belum ada vendor. Tambahkan profil vendor untuk mulai mencatat kontak.",
    "Inactive": "Tidak aktif",
    "Expired": "Kedaluwarsa",
    "Inventory": "Inventori",
    "Sync stock": "Sinkronkan stok",
    "Manage notification rules": "Kelola aturan notifikasi",
    "Log out": "Keluar",
    "Light mode": "Mode terang",
    "Dark mode": "Mode gelap",
    "Language": "Bahasa",
    "English": "Inggris",
    "Indonesian": "Indonesia",
    "Quick add": "Tambah cepat",
    "Save": "Simpan",
    "Cancel": "Batal",
    "Status": "Status",
    "Active": "Aktif",
    "Type": "Tipe",
    "Value": "Nilai",
    "Percentage": "Persentase",
    "Fixed amount": "Nominal tetap",
    "Valid from": "Berlaku dari",
    "Valid until": "Berlaku sampai",
    "Phone": "Telepon",
    "Email": "Email",
    "Contact": "Kontak",
    "Product name": "Nama produk",
    "SKU": "SKU",
    "Customer name": "Nama pelanggan",
    "Vendor name": "Nama vendor",
    "Discount name": "Nama diskon",
    "Action completed successfully.": "Aksi berhasil dilakukan.",
    "Perfume Store Overview": "Ikhtisar Toko Parfum",
    "Monitor sales, stock health, and CRM performance in one clear workspace.":
      "Pantau penjualan, kesehatan stok, dan kinerja CRM dalam satu ruang kerja.",
    "Sales pulse": "Denyut penjualan",
    "Revenue trend, average basket, and peak hours at a glance.":
      "Tren pendapatan, rata-rata keranjang, dan jam puncak sekilas.",
    "Export insights": "Ekspor wawasan",
    "Sales chart placeholder — connect to Supabase analytics table for realtime line chart.":
      "Placeholder grafik penjualan — hubungkan ke tabel analitik Supabase untuk grafik garis real-time.",
    "Quick actions": "Aksi cepat",
    "Create fast workflows for staff.": "Buat alur kerja cepat untuk staf.",
    "Weekly revenue trend": "Tren pendapatan mingguan",
    "Mon": "Sen",
    "Tue": "Sel",
    "Wed": "Rab",
    "Thu": "Kam",
    "Fri": "Jum",
    "Sat": "Sab",
    "Sun": "Min",
    "Top categories": "Kategori teratas",
    "Floral": "Floral",
    "Citrus": "Sitrus",
    "Woody": "Kayu",
    "Musk": "Musk",
    "Payment mix": "Komposisi pembayaran",
    "Cash": "Tunai",
    "Card": "Kartu",
    "Transfer": "Transfer",
    "Daily target": "Target harian",
    "Low stock alerts": "Peringatan stok rendah",
    "Restock before reaching minimum thresholds.":
      "Isi ulang sebelum mencapai ambang minimum.",
    "No variants found. Add product variants to enable stock alerts.":
      "Varian tidak ditemukan. Tambahkan varian produk untuk mengaktifkan peringatan stok.",
    "Min": "Min",
    "units": "unit",
    "Check stock": "Cek stok",
    "Recent transactions": "Transaksi terbaru",
    "Fast access to the latest invoices and payments.":
      "Akses cepat ke faktur dan pembayaran terbaru.",
    "See all": "Lihat semua",
    "No transactions yet. Start selling to see activity here.":
      "Belum ada transaksi. Mulai berjualan untuk melihat aktivitas di sini.",
    "Payment pending": "Menunggu pembayaran"
    ,
    "Inventory Management": "Manajemen Inventori",
    "Track real-time stock, minimum thresholds, and reorder status.":
      "Lacak stok real-time, ambang minimum, dan status pemesanan ulang.",
    "Stock overview": "Ringkasan stok",
    "Realtime stock count with automatic minimum alerts.":
      "Perhitungan stok real-time dengan peringatan minimum otomatis.",
    "No variants yet. Add product variants to start tracking inventory.":
      "Belum ada varian. Tambahkan varian produk untuk mulai melacak inventori.",
    "On hand: connect inventory ledger": "Stok tersedia: hubungkan buku persediaan",
    "Barcode": "Barcode",
    "Realtime alerts": "Peringatan real-time",
    "Notify staff when stock hits minimum.": "Beri tahu staf saat stok mencapai minimum.",
    "Manage notification rules": "Kelola aturan notifikasi",
    "Sign in to your workspace": "Masuk ke ruang kerja Anda",
    "This POS is private. Only admin-created users can access the system.":
      "POS ini bersifat privat. Hanya pengguna yang dibuat admin yang bisa mengakses sistem.",
    "Password": "Kata sandi",
    "Signing in...": "Sedang masuk...",
    "Sign in": "Masuk",
    "Signed-in user": "Pengguna masuk",
    "Staff": "Staf"
  }
};

export function translate(locale: Locale, value: string): string {
  return TRANSLATIONS[locale]?.[value] ?? value;
}

export function getServerLocale(): Locale {
  const stored = cookies().get("locale")?.value;
  if (stored === "id" || stored === "en") {
    return stored;
  }
  return DEFAULT_LOCALE;
}
