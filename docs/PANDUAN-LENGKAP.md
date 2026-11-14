# PANDUAN LENGKAP — APLIKASIKU.ND

Panduan operasional dari nol sampai website live dan dikelola sehari-hari.

**Daftar Bagian**

1. Membuat Project Supabase
2. Menjalankan SQL Skema
3. Mengatur URL & API Key
4. Konfigurasi Storage
5. Login Admin (Auth)
6. Deploy ke GitHub & Vercel
7. Menambahkan Aplikasi Baru
8. Pengelolaan Website Harian
9. Mode Demo
10. Keamanan & Pemeliharaan

---

## 1. Membuat Project Supabase

1. Buka <https://supabase.com> → **Sign in** (bisa pakai akun GitHub).
2. Klik **New Project**.
3. Isi:
   - **Name**: `aplikasiku-nd` (bebas)
   - **Database Password**: buat password kuat, **simpan** di tempat aman (dipakai untuk koneksi database langsung, bukan untuk website).
   - **Region**: pilih yang terdekat (cth: Singapore).
4. Klik **Create new project** dan tunggu ±2 menit hingga siap.

## 2. Menjalankan SQL Skema

1. Di Dashboard Supabase, buka menu **SQL Editor** → **New query**.
2. Buka file `sql/supabase-schema.sql` dari proyek ini, **salin seluruh isinya**, tempel ke editor, lalu klik **Run**.
3. Jika berhasil akan muncul `Success. No rows returned`. Verifikasi di **Table Editor** — tabel yang harus muncul:
   `categories, applications, inquiries, follow_ups, testimonials, website_settings, faqs, posts, admins`.
4. Skema sudah berisi: foreign key, index, trigger `updated_at`, fungsi `increment_app_view`, **RLS aktif di semua tabel**, bucket Storage `media`, serta **data contoh** (10 kategori, 10 aplikasi, FAQ, testimoni, 3 artikel, pengaturan).

> Jalankan sekali saja. Menjalankan ulang aman (semua perintah memakai `if not exists` / `on conflict do nothing`), namun tidak perlu.

## 3. Mengatur URL & API Key

1. Di Dashboard Supabase, buka **Project Settings** (ikon gerigi) → **API**.
2. Salin dua nilai ini:
   - **Project URL** — bentuknya `https://xxxxxxxxxxxx.supabase.co`
   - **anon public** key (di bawah Project API Keys) — key panjang `eyJ...`
3. Buka file `js/config.js` di proyek ini, isi:

```js
SUPABASE_URL: "https://xxxxxxxxxxxx.supabase.co",
SUPABASE_ANON_KEY: "eyJhbGciOi....(anon public key)",
```

4. Simpan file, muat ulang website. Badge **"Mode Demo"** hilang — website kini memakai data Supabase nyata.

**PERINGATAN KEAMANAN**

- Gunakan **hanya** key `anon/public`. **JANGAN PERNAH** menaruh `service_role` key di frontend atau di repo — key itu bisa menghapus semua data dan melewati RLS.
- Key anon aman dipublikasikan karena keamanan diatur oleh **Row Level Security** (sudah dikonfigurasi pada SQL).
- Opsional: isi `SITE_URL` di `js/config.js` dengan domain final (cth: `https://www.aplikasiku.nd`) untuk canonical/SEO.

## 4. Konfigurasi Storage

Bucket `media` **sudah dibuat otomatis** oleh SQL (publik, untuk logo/thumbnail/screenshot) lengkap dengan kebijakan akses: publik bisa membaca, hanya admin yang bisa mengunggah.

Verifikasi: **Storage** di sidebar → harus ada bucket `media`.

Cara pakai: di dashboard admin → tambah/edit aplikasi → **Pilih Gambar** pada kolom thumbnail/screenshot. File terunggah ke `media/thumbnails/...` atau `media/screenshots/...` dan URL-nya otomatis terisi. URL gambar eksternal juga tetap didukung (kolom URL dapat diisi manual).

Batas ukuran upload default Supabase adalah 50MB per file; kompres gambar ke ~200-500KB agar website tetap cepat.

## 5. Login Admin (Supabase Auth)

1. Pastikan SQL (Bagian 2) sudah dijalankan dan `config.js` sudah diisi.
2. Buat akun admin **pertama**:
   - Dashboard Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
   - Isi email + password, aktifkan **Auto Confirm User**.
3. User pertama **otomatis menjadi admin** melalui trigger `handle_new_user` (masuk ke tabel `admins`). Bila perlu admin tambahan, login dulu dengan admin pertama, lalu jalankan di SQL Editor:
   ```sql
   insert into public.admins (user_id)
   values ('<UUID user baru dari Authentication > Users>');
   ```
4. Buka `login.html` di website → masukkan email & password → Anda diarahkan ke `admin.html`.
5. Lupa password? Klik **"Lupa password?"** di halaman login (email reset dikirim Supabase; atur redirect di Authentication → URL Configuration bila perlu).
6. Logout ada di sidebar admin. Mengakses `admin.html` tanpa login akan dialihkan ke `login.html`.

> **Admin = tabel `admins`.** Akun Supabase yang tidak tercatat di tabel ini tidak dapat masuk dashboard (login akan ditolak oleh pengecekan `is_admin()`).

## 6. Deploy ke GitHub & Vercel

**A. Push ke GitHub**

```bash
cd aplikasiku-nd
git init
git add .
git commit -m "Aplikasiku.nd — website katalog aplikasi digital"
git branch -M main
git remote add origin https://github.com/<username>/aplikasiku-nd.git
git push -u origin main
```

> `js/config.js` berisi anon key + URL — **aman untuk repo publik** karena proteksi datanya ada di RLS Supabase. Jangan simpan service_role key di repo.

**B. Deploy ke Vercel**

1. Buka <https://vercel.com> → **Sign in with GitHub**.
2. **Add New... → Project** → pilih repo `aplikasiku-nd`.
3. Framework Preset: **Other** (statis — tidak perlu build command; Output Directory: `./`).
4. Klik **Deploy** — ±30 detik, website live di `https://aplikasiku-nd.vercel.app`.
5. (Opsional) Domain sendiri: **Project → Settings → Domains** → tambahkan domain Anda dan ikuti pengaturan DNS yang ditampilkan. Setelah domain aktif, isi `SITE_URL` di `js/config.js`, lalu perbarui `sitemap.xml` dan `robots.txt` dengan domain final, dan push ulang.

File `vercel.json` di proyek ini menambahkan URL ramah SEO `https://domain/aplikasi/<slug>` yang otomatis membuka halaman detail.

**C. Perbarui konten setelah live** — semua konten (hero, CTA, harga, WA, dll) dikelola dari dashboard admin; tidak perlu deploy ulang untuk mengubah konten.

## 7. Menambahkan Aplikasi Baru

1. Login di `login.html` → buka **Manajemen Aplikasi** → **Tambah Aplikasi**.
2. Isi kolom:
   - **Nama Aplikasi** (slug dibuat otomatis, dipakai untuk URL detail).
   - **Kategori** — pilih; tambah kategori baru di menu **Manajemen Kategori**.
   - **Thumbnail** — unggah gambar (disarankan 1200x750px, 16:9) atau tempel URL.
   - **Deskripsi singkat** (1-2 kalimat, tampil di kartu) dan **deskripsi lengkap** (pisahkan paragraf dengan baris kosong).
   - **Latar belakang, manfaat, fitur** — fitur ditulis satu per baris; 3 fitur pertama tampil di kartu katalog.
   - **Screenshot** — unggah satu per satu atau tempel URL per baris; tampil sebagai galeri dengan lightbox.
   - **Link demo / aplikasi utama / video** — kosongkan bila belum ada; tombol demo akan otomatis mengarah ke WhatsApp. Untuk video, tempel URL YouTube.
   - **Harga & tipe harga** — `Sekali Bayar`/`Langganan` isi angka (tanpa titik); `Konsultasi`/`Gratis` biarkan 0.
   - **Status** — `Tersedia` / `Dalam Pengembangan` / `Segera Hadir` (jadi badge warna di kartu).
   - **Unggulan** — aktifkan untuk menampilkan aplikasi di beranda (maks. 3 terbaik agar grid rapi).
   - **Data contoh** — aktifkan hanya untuk aplikasi demo; kartu mendapat label "Contoh".
3. Klik **Simpan** → aplikasi langsung tampil di katalog, kategori, dan pencarian.
4. Gunakan ikon **mata** untuk pratinjau halaman publik, **pensil** untuk edit, **tempat sampah** untuk hapus (ada dialog konfirmasi).

## 8. Pengelolaan Website Harian

- **Nomor WhatsApp**: menu **Pengaturan Website** → tab *Kontak & Sosial* → kolom *Nomor WhatsApp* (format `62xxx`). Semua tombol WA di seluruh halaman mengikuti nomor ini.
- **Logo, favicon & identitas**: tab *Identitas & Logo* — unggah logo utama (navbar), logo putih (footer), favicon, dan gambar Open Graph; berkas tersimpan di Storage folder `brand/`. Klik *Pilih Gambar* → terunggah → *Simpan Identitas*. Tombol *Hapus* mengosongkan slot (kembali ke logo bawaan).
- **Warna tema situs**: tab *Tampilan & Warna* — pilih 1 dari 6 preset atau atur warna kustom; pratinjau langsung tampil sebelum disimpan. Opsi *Gaya Navbar* mengubah navbar menjadi gelap (navy). *Kembalikan Bawaan* mereset ke Electric Blue.
- **Kontak & media sosial**: tab *Kontak & Sosial* — email, jam operasional, alamat, serta tautan Instagram/Facebook/LinkedIn/TikTok/YouTube. Mengosongkan tautan menyembunyikan ikonnya di footer.
- **SEO & statistik**: tab *SEO & Statistik* — SEO title, meta description, domain produksi (canonical/OG), dan angka statistik beranda.
- **Koneksi Supabase dari panel**: tab *Koneksi Supabase* — tempel Project URL & anon key, klik *Uji Koneksi* (mengecek tabel dan bucket storage), lalu *Simpan & Hubungkan* (halaman dimuat ulang dalam mode Supabase). Koneksi ini bersifat per-browser; untuk produksi permanen isi `js/config.js` (Bagian 3). Tombol *Putuskan* menghapus override dan kembali ke Mode Demo.
- **Headline beranda & CTA**: menu **Manajemen Konten** → *Hero Halaman Beranda* dan *Call to Action Beranda*.
- **Testimoni & FAQ**: menu **Manajemen Konten** — atur aktif/nonaktif dengan saklar, tambah/edit/hapus bebas.
- **Prospek (pelanggan potensial)**: menu **Manajemen Prospek** — setiap pengiriman formulir muncul di sini dengan status `Baru`. Alur kerja: ubah status ke `Dihubungi` → catat hasil di **follow-up** (dengan tanggal) → `Negosiasi` → `Deal` atau `Tidak Lanjut`. Tombol WhatsApp di tabel/detail prospek membuka chat dengan nomor pemohon.
- **Artikel blog**: menu **Artikel / Blog** → tulis judul, ringkasan, konten (paragraf dipisah baris kosong; baris berawalan `- ` menjadi daftar), lalu publikasikan.
- **Statistik beranda**: angka *Total Pengguna* dan *Proyek Selesai* diatur di **Pengaturan Website** tab *SEO & Statistik*; angka *Total Aplikasi* dan *Total Kategori* dihitung otomatis dari katalog.
- **SEO**: *SEO Title* dan *Meta Description* di **Pengaturan Website** tab *SEO & Statistik* dipakai sebagai judul/deskripsi situs. Untuk hasil maksimal di Google, lengkapi deskripsi tiap aplikasi dan rutin terbitkan artikel.

## 9. Mode Demo

Website berjalan dalam **Mode Demo** bila `SUPABASE_URL`/`SUPABASE_ANON_KEY` di `js/config.js` masih kosong.

- Seluruh halaman dan CRUD berfungsi memakai **data contoh** yang tersimpan di `localStorage` browser.
- Login admin demo: `admin@aplikasiku.nd` / `demo1234` (tercantum di halaman login).
- Upload gambar dibatasi 400KB dan tersimpan sementara di browser.
- Data demo **tidak** terlihat oleh orang lain dan tidak menghubungi server apa pun.
- Begitu Supabase diisi, mode demo otomatis nonaktif (badge "Mode Demo" hilang).

Mode demo berguna untuk mencoba seluruh alur — termasuk dashboard admin — sebelum database nyata disiapkan.

## 10. Keamanan & Pemeliharaan

- **Kunci**: hanya `anon` key di frontend. Jangan pernah membagikan `service_role` key. Bila terlanjur, **rotate** key di Supabase → Settings → API.
- **RLS aktif di semua tabel** — jangan dinonaktifkan. Uji: buka website dalam mode incognito; Anda harus bisa membaca katalog tetapi tidak bisa mengubah apa pun.
- **Akun admin**: minimalkan jumlah admin; hapus dari tabel `admins` bila ada yang keluar dari tim.
- **Backup**: Supabase otomatis menyimpan backup harian (paket Pro). Untuk paket gratis, ekspor berkala lewat Table Editor → Export CSV, atau SQL Editor: `select * from applications;`.
- **Performa**: kompres gambar sebelum upload (cth: squoosh.app); SVG thumbnail bawaan sudah sangat ringan.
- **Pembaruan konten rutin**: terbitkan artikel 1-2x per bulan dan perbarui status aplikasi — membantu SEO dan kepercayaan pengunjung.

---

## Troubleshooting Cepat

| Gejala | Penyebab & Solusi |
|---|---|
| Badge "Mode Demo" masih tampil | `config.js` belum terisi/tersimpan; cek tanda kutip dan koma pada URL & key |
| Upload logo gagal di mode Supabase | Bucket `media` belum dibuat/publik — lihat Bagian 4, atau gunakan *Uji Koneksi* di tab Koneksi Supabase |
| Warna/logo tidak berubah di halaman publik | Tekan Ctrl+Shift+R (hard refresh) — pengaturan dimuat asinkron; pastikan tombol Simpan pada tab terkait sudah diklik |
| Katalog kosong setelah connect | SQL belum dijalankan, atau seed tertimpa — cek Table Editor `applications` |
| Login ditolak "bukan admin" | User belum tercatat di tabel `admins` — lihat Bagian 5 langkah 3 |
| Upload gagal di mode Supabase | Cek kebijakan storage pada SQL (Bagian 12 skema) dan pastikan login admin aktif |
| Formulir gagal terkirim | Validasi RLS menolak input — pastikan nama, WA (8-20 digit), email berisi `@`, dan deskripsi terisi |
| Halaman detail kosong | URL kehilangan `?id=<slug>` — gunakan tombol Detail dari katalog |
