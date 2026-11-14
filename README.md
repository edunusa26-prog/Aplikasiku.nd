# APLIKASIKU.ND — Website Katalog Aplikasi Digital

**Tagline:** Kerja Jadi Lebih Mudah

Website katalog, showcase, dan pemasaran aplikasi digital untuk bisnis, lembaga, sekolah, dan organisasi. Dibangun dengan **HTML5 + CSS3 + JavaScript (ES6)** murni, terintegrasi **Supabase** (Database, Auth, Storage) — siap di-deploy ke **Vercel**.

---

## Fitur Utama

| Area | Fitur |
|---|---|
| Beranda | Hero + ilustrasi dashboard, statistik dinamis (animasi hitung), aplikasi unggulan, keunggulan, testimoni, CTA |
| Katalog | Pencarian nama, filter kategori & status, urutkan (terbaru/populer/A-Z), tampilan grid & list, load more, skeleton, empty state |
| Detail Aplikasi | Deskripsi, latar belakang, manfaat, fitur lengkap, screenshot (lightbox), video demo, teknologi, harga, status, target pengguna, link demo/aplikasi, rekomendasi aplikasi lain, Schema.org SoftwareApplication |
| Kategori | Segmentasi pengguna (Pendidikan, Bisnis, Yayasan & Organisasi, Umum) + grid kategori dari database |
| Layanan | 8 layanan lengkap dengan manfaat + alur kerja 6 langkah |
| Kontak | Formulir pemesanan lengkap (tersimpan ke tabel `inquiries`), lanjut via WhatsApp otomatis, FAQ dinamis |
| Blog | Daftar artikel + halaman baca (tabel `posts`) |
| WhatsApp | Tombol mengambang + pesan otomatis per aplikasi + pesan dari isi formulir |
| Admin | Login Supabase Auth; dashboard statistik; CRUD aplikasi (upload thumbnail/screenshot ke Storage), kategori, prospek (status + follow-up), konten (hero/CTA/testimoni/FAQ), artikel; **Modul Pengaturan lengkap**: upload logo/favicon/OG image ke Storage, nama & tagline, 6 preset + kustom warna tema (CSS variables, langsung terlihat), gaya navbar, **koneksi Supabase dari panel** (uji koneksi + override per-browser), kontak & media sosial (termasuk LinkedIn), SEO & statistik |
| SEO | Meta title/description, Open Graph, sitemap.xml, robots.txt, JSON-LD, URL slug, alt text |
| Keamanan | RLS di semua tabel, hanya anon key di frontend, validasi input, pesan error aman |

## Struktur Folder

```
aplikasiku-nd/
├── index.html            # Beranda
├── katalog.html          # Katalog aplikasi (cari, filter, urutkan)
├── detail.html           # Detail aplikasi (?id=<slug>)
├── kategori.html         # Kategori & segmentasi pengguna
├── layanan.html          # Layanan pembuatan aplikasi
├── tentang.html          # Tentang kami
├── kontak.html           # Kontak + formulir pemesanan + FAQ
├── blog.html             # Artikel edukasi (?slug= untuk baca)
├── login.html            # Login admin
├── admin.html            # Dashboard admin
├── css/
│   └── style.css         # Design system lengkap (navy + electric blue)
├── js/
│   ├── config.js         # KONFIGURASI: Supabase URL & anon key  <-- ISI DI SINI
│   ├── demo-data.js      # Data contoh untuk Mode Demo
│   ├── supabase.js       # Data layer: mode Demo & mode Supabase
│   ├── app.js            # Logika semua halaman publik
│   └── admin.js          # Logika dashboard admin
├── sql/
│   └── supabase-schema.sql  # SQL lengkap: tabel, RLS, storage, seed data
├── docs/
│   └── PANDUAN-LENGKAP.md   # Panduan Supabase, deploy, admin, pengelolaan
├── assets/img/           # Logo, favicon, og-image, thumbnail & screenshot contoh
├── robots.txt
├── sitemap.xml
└── vercel.json           # Rewrites URL ramah SEO (opsional)
```

## Mulai Cepat (3 Langkah)

1. **Mode Demo (tanpa server)** — buka `index.html` di browser. Semua halaman berjalan dengan data contoh di localStorage. Login admin demo: `admin@aplikasiku.nd` / `demo1234`.
2. **Hubungkan Supabase** — buat project di [supabase.com](https://supabase.com), jalankan `sql/supabase-schema.sql` di SQL Editor, lalu isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di `js/config.js` — atau lebih cepat: login admin > **Pengaturan Website > tab Koneksi Supabase** (uji koneksi + hubungkan tanpa edit file). Panduan lengkap: `docs/PANDUAN-LENGKAP.md`.
3. **Deploy** — push ke GitHub, import ke Vercel. Panduan: `docs/PANDUAN-LENGKAP.md` Bagian 6.

> **Catatan Mode Demo:** seluruh CRUD (termasuk dashboard admin) berfungsi penuh di browser — cocok untuk mencoba sebelum Supabase dihubungkan. File upload terbatas 400KB pada mode ini.

## Keamanan

- Frontend hanya memakai **anon/publishable key** — **jangan pernah** menaruh `service_role` key di file manapun.
- Semua tabel dilindungi **Row Level Security**: pengunjung hanya bisa membaca data publik dan mengirim inquiry; mengelola katalog hanya bisa akun yang terdaftar di tabel `admins`.
- User **pertama** yang dibuat di Supabase Auth otomatis menjadi admin (trigger `handle_new_user`).

## Modul Pengaturan (v1.1)

Dashboard Admin > **Pengaturan Website** kini memiliki 5 tab:

1. **Identitas & Logo** — nama website, tagline, teks footer, pratinjau navbar, serta upload **logo utama, logo putih (footer), favicon, dan gambar Open Graph** langsung ke Supabase Storage (folder `brand/`). Pada Mode Demo, gambar disimpan sebagai data URL (maks 400KB).
2. **Tampilan & Warna** — 6 preset warna (Electric Blue, Indigo, Teal, Hijau, Oranye, Maroon), pemilih warna kustom, warna hover otomatis/manual, gaya navbar (terang/gelap), dan pratinjau langsung. Warna diterapkan lewat CSS variables sehingga seluruh halaman ikut berubah.
3. **Koneksi Supabase** — isi Project URL & anon key dari panel, **uji koneksi** (cek tabel + bucket storage), simpan & hubungkan (reload otomatis), atau putuskan kembali ke Mode Demo. Koneksi dari panel bersifat per-browser; untuk produksi permanen tetap isi `js/config.js`.
4. **Kontak & Sosial** — WhatsApp, email, jam operasional, alamat, Instagram, Facebook, LinkedIn, TikTok, YouTube.
5. **SEO & Statistik** — SEO title, meta description, domain produksi (canonical/OG), angka statistik beranda.

Semua nilai disimpan di tabel `website_settings`; mengosongkan nilai logo/tema mengembalikan aset bawaan.
