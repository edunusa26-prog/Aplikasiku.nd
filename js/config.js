/* ============================================================
   APLIKASIKU.ND — js/config.js
   ------------------------------------------------------------
   KONFIGURASI UTAMA WEBSITE.
   Isi SUPABASE_URL dan SUPABASE_ANON_KEY sesuai Panduan
   (docs/PANDUAN-LENGKAP.md — Bagian 2 & 3), atau gunakan dashboard
   Admin > Pengaturan Website > tab "Koneksi Supabase" untuk koneksi
   cepat per-browser (localStorage).
   Jika keduanya kosong, website berjalan dalam "Mode Demo"
   dengan data contoh yang tersimpan di localStorage browser.
   ------------------------------------------------------------
   PENTING KEAMANAN:
   - Hanya gunakan ANON / publishable key di frontend. JANGAN
     pernah menaruh service_role key di file manapun.
   - Keamanan data diatur lewat Row Level Security (RLS) pada
     sql/supabase-schema.sql.
   ============================================================ */

window.APLIKASIKU_CONFIG = {
  /* --- Supabase (WAJIB diisi untuk produksi) ---
     Contoh: "https://abcdefghijk.supabase.co" */
  SUPABASE_URL: "https://ayijdoyhrovcgulwdczd.supabase.co",

  /* --- Supabase anon/public key (bukan service_role!) --- */
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aWpkb3locm92Y2d1bHdkY3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMjUwMjMsImV4cCI6MjEwODYwMTAyM30.rs-8W4RaDFBQbGW4mT0Q18DAozrJjjLbx66feoT2KtA",

  /* Nama bucket Supabase Storage untuk logo/thumbnail/screenshot */
  STORAGE_BUCKET: "media",

  /* Nomor WhatsApp default (format internasional tanpa + / spasi).
     Nilai ini hanya fallback awal — nomor aktif diambil dari
     Pengaturan Website di dashboard admin (tabel website_settings). */
  DEFAULT_WHATSAPP: "6281214447790",

  /* Domain final untuk SEO (canonical, sitemap, Open Graph).
     Contoh: "https://www.aplikasiku.nd" — biarkan kosong saat masih lokal. */
  SITE_URL: "",

  /* Akun demo untuk Mode Demo (preview tanpa Supabase). */
  DEMO_ADMIN_EMAIL: "admin@aplikasiku.nd",
  DEMO_ADMIN_PASSWORD: "demo1234"
};

/* Deteksi mode: "supabase" bila URL+key terisi, selain itu "demo". */
window.APLIKASIKU_MODE = (window.APLIKASIKU_CONFIG.SUPABASE_URL && window.APLIKASIKU_CONFIG.SUPABASE_ANON_KEY)
  ? "supabase"
  : "demo";
