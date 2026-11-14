-- ============================================================================
-- APLIKASIKU.ND — sql/supabase-schema.sql
-- Skema lengkap Supabase: tabel, foreign key, index, trigger updated_at,
-- fungsi view counter, RLS (Row Level Security), Storage bucket, dan seed data.
--
-- CARA PAKAI: buka Supabase Dashboard -> SQL Editor -> New query ->
-- salin SELURUH file ini -> Run. (Lihat docs/PANDUAN-LENGKAP.md Bagian 2)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. EKSTENSI
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. FUNGSI BANTU
-- ---------------------------------------------------------------------------

-- Otomatis isi kolom updated_at saat baris diperbarui
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Cek apakah user saat ini terdaftar sebagai admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. TABEL ADMINS (otorisasi dashboard)
--    User pertama yang mendaftar otomatis menjadi admin (lihat trigger di bawah).
--    Untuk menambah admin lain: insert into public.admins (user_id)
--      values ('<uuid user dari Auth > Users>');
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create policy "Admin boleh melihat daftar admin"
  on public.admins for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Admin boleh menambah admin"
  on public.admins for insert
  with check (public.is_admin());

create policy "Admin boleh menghapus admin"
  on public.admins for delete
  using (public.is_admin());

-- User pertama yang mendaftar otomatis diangkat menjadi admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.admins) = 0 then
    insert into public.admins (user_id) values (new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. TABEL CATEGORIES
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text default '',
  icon        text default 'fa-solid fa-layer-group',
  created_at  timestamptz not null default now()
);

create index if not exists idx_categories_slug on public.categories(slug);

-- ---------------------------------------------------------------------------
-- 4. TABEL APPLICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid references public.categories(id) on delete set null,
  name              text not null,
  slug              text not null unique,
  short_description text not null default '',
  full_description  text default '',
  background        text default '',
  benefits          jsonb default '[]'::jsonb,
  thumbnail_url     text default '',
  features          jsonb default '[]'::jsonb,
  screenshots       jsonb default '[]'::jsonb,
  demo_url          text default '',
  application_url   text default '',
  video_url         text default '',
  price             numeric(12,0) default 0,
  pricing_type      text not null default 'konsultasi'
                    check (pricing_type in ('gratis','sekali_bayar','langganan','konsultasi')),
  status            text not null default 'Tersedia'
                    check (status in ('Tersedia','Dalam Pengembangan','Segera Hadir')),
  target_users      text default '',
  tech              jsonb default '[]'::jsonb,
  is_featured       boolean not null default false,
  demo              boolean not null default false,
  view_count        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_applications_category on public.applications(category_id);
create index if not exists idx_applications_status   on public.applications(status);
create index if not exists idx_applications_featured on public.applications(is_featured);
create index if not exists idx_applications_created  on public.applications(created_at desc);

drop trigger if exists trg_applications_updated on public.applications;
create trigger trg_applications_updated
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Counter penonton yang aman untuk pengunjung publik (tanpa membuka UPDATE)
create or replace function public.increment_app_view(p_app_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.applications
  set view_count = coalesce(view_count, 0) + 1
  where id = p_app_id;
$$;

grant execute on function public.increment_app_view(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. TABEL INQUIRIES (permintaan konsultasi / prospek)
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null,
  organization     text default '',
  whatsapp         text not null,
  email            text not null,
  application_id   uuid references public.applications(id) on delete set null,
  inquiry_type     text default 'Konsultasi',
  description      text not null,
  desired_features text default '',
  budget           text default '',
  target_date      date,
  status           text not null default 'Baru'
                   check (status in ('Baru','Dihubungi','Negosiasi','Deal','Tidak Lanjut')),
  created_at       timestamptz not null default now()
);

create index if not exists idx_inquiries_status  on public.inquiries(status);
create index if not exists idx_inquiries_created on public.inquiries(created_at desc);

-- ---------------------------------------------------------------------------
-- 6. TABEL FOLLOW_UPS (riwayat komunikasi prospek)
-- ---------------------------------------------------------------------------
create table if not exists public.follow_ups (
  id             uuid primary key default gen_random_uuid(),
  inquiry_id     uuid not null references public.inquiries(id) on delete cascade,
  note           text not null,
  follow_up_date date,
  created_by     text default '',
  created_at     timestamptz not null default now()
);

create index if not exists idx_follow_ups_inquiry on public.follow_ups(inquiry_id);

-- ---------------------------------------------------------------------------
-- 7. TABEL TESTIMONIALS
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null,
  organization  text default '',
  content       text not null,
  rating        integer not null default 5 check (rating between 1 and 5),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. TABEL WEBSITE_SETTINGS (key-value)
-- ---------------------------------------------------------------------------
create table if not exists public.website_settings (
  id            uuid primary key default gen_random_uuid(),
  setting_key   text not null unique,
  setting_value text default '',
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_settings_updated on public.website_settings;
create trigger trg_settings_updated
  before update on public.website_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. TABEL FAQS
-- ---------------------------------------------------------------------------
create table if not exists public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 10. TABEL POSTS (blog/artikel edukasi — pelengkap fitur blog)
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text default '',
  content      text not null default '',
  cover_url    text default '',
  is_published boolean not null default true,
  published_at timestamptz default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_posts_slug on public.posts(slug);

drop trigger if exists trg_posts_updated on public.posts;
create trigger trg_posts_updated
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) — keamanan data
--     Pengunjung (anon): hanya baca data publik + insert inquiry.
--     Admin (terautentikasi di tabel admins): kelola penuh.
--     JANGAN pernah menonaktifkan RLS pada tabel di atas.
-- ---------------------------------------------------------------------------
alter table public.categories        enable row level security;
alter table public.applications      enable row level security;
alter table public.inquiries         enable row level security;
alter table public.follow_ups        enable row level security;
alter table public.testimonials      enable row level security;
alter table public.website_settings  enable row level security;
alter table public.faqs              enable row level security;
alter table public.posts             enable row level security;

-- categories
create policy "Publik dapat membaca kategori" on public.categories
  for select using (true);
create policy "Admin mengelola kategori" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- applications
create policy "Publik dapat membaca aplikasi" on public.applications
  for select using (true);
create policy "Admin mengelola aplikasi" on public.applications
  for all using (public.is_admin()) with check (public.is_admin());

-- inquiries: publik hanya boleh MENGIRIM; membaca/mengubah hanya admin
create policy "Publik dapat mengirim permintaan" on public.inquiries
  for insert with check (
    char_length(coalesce(full_name,'')) between 2 and 120
    and char_length(coalesce(whatsapp,'')) between 8 and 20
    and position('@' in coalesce(email,'')) > 1
    and char_length(coalesce(description,'')) >= 5
  );
create policy "Admin membaca prospek" on public.inquiries
  for select using (public.is_admin());
create policy "Admin mengubah prospek" on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin menghapus prospek" on public.inquiries
  for delete using (public.is_admin());

-- follow_ups: hanya admin
create policy "Admin mengelola follow-up" on public.follow_ups
  for all using (public.is_admin()) with check (public.is_admin());

-- testimonials: publik hanya melihat yang aktif
create policy "Publik membaca testimoni aktif" on public.testimonials
  for select using (is_active = true);
create policy "Admin mengelola testimoni" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- website_settings: publik baca, admin tulis
create policy "Publik membaca pengaturan" on public.website_settings
  for select using (true);
create policy "Admin mengelola pengaturan" on public.website_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- faqs: publik hanya melihat yang aktif
create policy "Publik membaca FAQ aktif" on public.faqs
  for select using (is_active = true);
create policy "Admin mengelola FAQ" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- posts: publik hanya melihat yang terbit
create policy "Publik membaca artikel terbit" on public.posts
  for select using (is_published = true);
create policy "Admin mengelola artikel" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 12. STORAGE — bucket "media" untuk logo, thumbnail, dan screenshot
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Publik membaca media" on storage.objects
  for select using (bucket_id = 'media');
create policy "Admin mengunggah media" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());
create policy "Admin memperbarui media" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());
create policy "Admin menghapus media" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- ============================================================================
-- 13. SEED DATA AWAL (data contoh — dapat diedit/dihapus dari dashboard admin)
-- ============================================================================
insert into public.categories (name, slug, description, icon) values
  ('Human Resource Management System (HRMS)', 'hrms', 'Aplikasi kelola pegawai, absensi, cuti, kinerja, dan pengetahuan HR.', 'fa-solid fa-users-gear'),
  ('Sistem Keuangan dan Akuntansi', 'keuangan-akuntansi', 'Pencatatan keuangan, jurnal, laporan keuangan, dan anggaran.', 'fa-solid fa-chart-pie'),
  ('Sistem Pendidikan dan Sekolah', 'pendidikan-sekolah', 'Manajemen sekolah, PPDB, Bimbingan Konseling, dan aplikasi guru.', 'fa-solid fa-graduation-cap'),
  ('CRM dan Sistem Pendaftaran', 'crm-pendaftaran', 'Kelola pelanggan, leads, follow-up, dan pendaftaran online.', 'fa-solid fa-handshake'),
  ('Sistem Administrasi dan Perkantoran', 'administrasi-perkantoran', 'Surat menyurat, disposisi, agenda, dan arsip digital.', 'fa-solid fa-folder-open'),
  ('Sistem Kesehatan', 'kesehatan', 'Aplikasi klinik, pendaftaran pasien, rekam medis sederhana.', 'fa-solid fa-heart-pulse'),
  ('Sistem Bisnis dan UMKM', 'bisnis-umkm', 'Kasir, inventaris, penjualan, dan pengelolaan usaha.', 'fa-solid fa-store'),
  ('Sistem Organisasi dan Yayasan', 'organisasi-yayasan', 'Kepegawaian, program, filantropi, dan database organisasi.', 'fa-solid fa-people-group'),
  ('Produktivitas dan Manajemen Proyek', 'produktivitas-proyek', 'Task management, timeline proyek, dan kolaborasi tim.', 'fa-solid fa-list-check'),
  ('Website dan Sistem Custom', 'website-custom', 'Website profil, landing page, dan sistem sesuai kebutuhan khusus.', 'fa-solid fa-laptop-code')
on conflict (slug) do nothing;

insert into public.applications
  (category_id, name, slug, short_description, full_description, background, benefits,
   thumbnail_url, features, screenshots, demo_url, application_url, video_url,
   price, pricing_type, status, target_users, tech, is_featured, demo)
values
  ((select id from public.categories where slug='hrms'),
   'HR Knowledge Center', 'hr-knowledge-center',
   'Pusat pengetahuan HR digital untuk memuat SOP, kebijakan, materi pelatihan, dan direktori pegawai dalam satu portal online.',
   'HR Knowledge Center adalah portal pengetahuan internal yang membantu organisasi mendigitalkan seluruh dokumen SDM: SOP kerja, kebijakan perusahaan, handbooks, hingga materi onboarding karyawan baru.

Aplikasi ini dilengkapi modul e-learning sederhana sehingga tim HR dapat menyusun materi pelatihan beserta kuis dan sertifikat penyelesaian. Manajemen dapat memantau aktivitas membaca melalui dashboard statistik.

Cocok untuk perusahaan, sekolah, yayasan, dan organisasi yang ingin membangun budaya dokumentasi tanpa biaya lisensi tahunan yang mahal.',
   'Banyak organisasi menyimpan SOP dan kebijakan HR dalam file yang tersebar sehingga karyawan sulit menemukan versi terbaru. Portal ini menata ulang seluruh dokumen menjadi satu pusat pengetahuan online yang terstruktur.',
   '["Dokumen SOP selalu versi terbaru dan mudah dicari","Onboarding karyawan baru lebih cepat","Mengurangi pertanyaan berulang ke HRD","Statistik pembacaan untuk pemantauan","Hak akses per divisi menjaga kerahasiaan"]'::jsonb,
   'assets/img/thumbs/hr-knowledge-center.svg',
   '["Artikel & SOP dengan editor mudah","Kategori, tag, dan pencarian cepat","Modul e-learning dengan kuis","Sertifikat penyelesaian pelatihan","Direktori pegawai & struktur organisasi","Pengumuman internal","Hak akses per divisi","Dashboard statistik pembacaan","Riwayat versi dokumen"]'::jsonb,
   '["assets/img/shots/hr-knowledge-center-1.svg","assets/img/shots/hr-knowledge-center-2.svg"]'::jsonb,
   '', '', '', 0, 'konsultasi', 'Tersedia', 'HRD, manajemen, dan seluruh pegawai',
   '["HTML5","JavaScript","Supabase Database","Supabase Storage"]'::jsonb, false, true),

  ((select id from public.categories where slug='hrms'),
   'HR Management System', 'hr-management-system',
   'Aplikasi manajemen SDM lengkap: data pegawai, struktur organisasi, absensi online, cuti, lembur, hingga penilaian kinerja.',
   'HR Management System membantu tim HR mengelola seluruh siklus data kepegawaian: biodata, kontrak, struktur organisasi, absensi harian, pengajuan cuti dan lembur, hingga penilaian kinerja berkala.

Pegawai mengajukan cuti langsung dari aplikasi, atasan menyetujui secara berjenjang, dan seluruh riwayat tercatat otomatis. Rekap absensi dapat diekspor untuk kebutuhan penggajian.

Dashboard manajemen menampilkan komposisi pegawai dan tingkat kehadiran secara real-time.',
   'Rekap absensi manual dan arsip cuti kertas sering menimbulkan selisih data. Sistem ini menggantikan pencatatan manual dengan alur digital: pengajuan, persetujuan berjenjang, dan rekap otomatis siap pakai.',
   '["Rekap kehadiran otomatis","Persetujuan cuti/lembur berjenjang","Data pegawai terpusat","Penilaian kinerja objektif","Ekspor data siap payroll"]'::jsonb,
   'assets/img/thumbs/hr-management-system.svg',
   '["Master data pegawai & kontrak","Struktur organisasi & jabatan","Absensi online dengan rekap bulanan","Pengajuan & persetujuan cuti berjenjang","Pencatatan lembur","Penilaian kinerja (e-appraisal)","Notifikasi pengajuan","Ekspor laporan Excel/CSV","Multi-role: admin HR, atasan, pegawai"]'::jsonb,
   '["assets/img/shots/hr-management-system-1.svg","assets/img/shots/hr-management-system-2.svg"]'::jsonb,
   '', '', '', 3500000, 'sekali_bayar', 'Tersedia', 'Perusahaan, yayasan, sekolah dengan 10-500 pegawai',
   '["HTML5","JavaScript","Supabase Auth","Supabase Database"]'::jsonb, true, true),

  ((select id from public.categories where slug='keuangan-akuntansi'),
   'Sistem Keuangan dan Akuntansi', 'sistem-keuangan-akuntansi',
   'Pencatatan transaksi keuangan, jurnal otomatis, kas bank, piutang-utang, hingga laporan neraca dan laba rugi siap cetak.',
   'Sistem Keuangan dan Akuntansi membantu bisnis dan lembaga mencatat seluruh transaksi secara tertib: pemasukan, pengeluaran, jurnal umum, kas & bank, piutang, hingga utang.

Laporan keuangan standar tersedia otomatis: buku besar, neraca saldo, laba rugi, neraca, dan arus kas per periode.

Mendukung multi-entitas sehingga laporan dapat dilihat per unit maupun gabungan.',
   'Pencatatan keuangan di spreadsheet rawan salah dan sulit diaudit. Sistem ini memastikan transaksi tercatat sekali lalu seluruh laporan standar tersusun otomatis dengan angka yang selalu sinkron.',
   '["Laporan keuangan otomatis","Angka konsisten antar laporan","Arus kas terpantau real-time","Memudahkan audit","Multi-entitas"]'::jsonb,
   'assets/img/thumbs/sistem-keuangan-akuntansi.svg',
   '["Jurnal umum & posting otomatis","Buku besar & neraca saldo","Kas & bank dengan rekonsiliasi","Piutang dan utang dagang","Laporan laba rugi, neraca, arus kas","Anggaran vs realisasi","Multi-entitas","Ekspor Excel & PDF","Hak akses berjenjang"]'::jsonb,
   '["assets/img/shots/sistem-keuangan-akuntansi-1.svg","assets/img/shots/sistem-keuangan-akuntansi-2.svg"]'::jsonb,
   '', '', '', 250000, 'langganan', 'Tersedia', 'UMKM, sekolah, yayasan, perusahaan jasa',
   '["HTML5","JavaScript","Supabase Database","Chart.js"]'::jsonb, false, true),

  ((select id from public.categories where slug='hrms'),
   'Sistem Remunerasi dan Penggajian', 'sistem-remunerasi-penggajian',
   'Penggajian otomatis: komponen gaji, tunjangan, potongan, PPh 21, BPJS, hingga slip gaji digital yang siap dikirim ke pegawai.',
   'Sistem Remunerasi dan Penggajian menyederhanakan proses payroll bulanan. Struktur gaji dikonfigurasi per jabatan dan data absensi dapat ditarik otomatis.

Perhitungan PPh 21 Ter/Bulanan dan iuran BPJS mengikuti parameter yang dapat disesuaikan bila regulasi berubah.

Setiap pegawai menerima slip gaji digital yang dapat diunduh.',
   'Proses payroll manual memakan waktu dan rawan salah hitung. Sistem ini menyelesaikan penggajian dalam hitungan menit dengan jejak perhitungan yang dapat ditelusuri.',
   '["Payroll cepat dan akurat","PPh 21 & BPJS otomatis","Slip gaji digital","Terintegrasi absensi","Rekap beban gaji per unit"]'::jsonb,
   'assets/img/thumbs/sistem-remunerasi-penggajian.svg',
   '["Struktur gaji per jabatan & unit","Rekap absensi otomatis","Perhitungan PPh 21","Perhitungan iuran BPJS","Slip gaji digital (PDF)","Riwayat payroll per periode","Rekap beban gaji","Hak akses terbatas data gaji","Ekspor bukti potong"]'::jsonb,
   '["assets/img/shots/sistem-remunerasi-penggajian-1.svg","assets/img/shots/sistem-remunerasi-penggajian-2.svg"]'::jsonb,
   '', '', '', 0, 'konsultasi', 'Dalam Pengembangan', 'HRD dan keuangan perusahaan/sekolah/yayasan',
   '["HTML5","JavaScript","Supabase Database","PDF Generator"]'::jsonb, false, true),

  ((select id from public.categories where slug='crm-pendaftaran'),
   'CRM dan Sistem Pendaftaran', 'crm-sistem-pendaftaran',
   'Kelola calon pelanggan (leads), pipeline penjualan, follow-up terjadwal, dan pendaftaran online dengan notifikasi WhatsApp.',
   'CRM dan Sistem Pendaftaran membantu tim menangkap dan menindaklanjuti setiap calon pelanggan dari formulir website, pendaftaran online, maupun input manual.

Pipeline kanban memperlihatkan status setiap leads: baru, dihubungi, nego, hingga deal — lengkap dengan pengingat follow-up.

Modul pendaftaran online cocok untuk kursus, event, PPDB, dan klinik dengan konfirmasi WhatsApp otomatis.',
   'Calon pelanggan sering hilang karena catatan tersebar di chat dan kertas. Sistem ini menyatukan seluruh leads dalam satu alur kerja yang terukur.',
   '["Leads terpusat tidak ada yang terlewat","Pipeline visual","Konversi terukur per sumber","Konfirmasi WhatsApp otomatis","Kuota terpantau real-time"]'::jsonb,
   'assets/img/thumbs/crm-sistem-pendaftaran.svg',
   '["Manajemen leads & sumber data","Pipeline kanban (baru s.d. deal)","Jadwal & pengingat follow-up","Formulir pendaftaran online","Notifikasi otomatis WhatsApp","Manajemen kuota & jadwal","Dashboard konversi","Riwayat komunikasi per leads","Ekspor data pendaftar"]'::jsonb,
   '["assets/img/shots/crm-sistem-pendaftaran-1.svg","assets/img/shots/crm-sistem-pendaftaran-2.svg"]'::jsonb,
   '', '', '', 2750000, 'sekali_bayar', 'Tersedia', 'Bisnis jasa, kursus, klinik, sekolah (PPDB), event',
   '["HTML5","JavaScript","Supabase Database","WhatsApp API"]'::jsonb, false, true),

  ((select id from public.categories where slug='pendidikan-sekolah'),
   'BK PRO — Aplikasi Bimbingan Konseling', 'bk-pro',
   'Aplikasi Bimbingan dan Konseling (BK) untuk guru BK: pencatatan kasus, layanan konseling, jadwal, dan laporan semester.',
   'BK PRO membantu guru BK mencatat seluruh aktivitas layanan secara tertib dan rahasia: profil siswa, identifikasi masalah, kasus per kategori, hingga catatan proses konseling individu maupun kelompok.

Sistem menyediakan instrumen bantu BK, jadwal layanan, serta tindak lanjut kolaboratif dengan wali kelas dan orang tua sesuai tingkat urgensi.

Di akhir semester, laporan layanan tersusun otomatis untuk kebutuhan laporan sekolah dan dinas.',
   'Catatan kasus BK yang masih manual sulit dirangkum saat pembuatan laporan semester dan kerahasiaannya rawan. BK PRO menjadikan pencatatan tertib, laporan otomatis, dan akses sesuai peran.',
   '["Pencatatan kasus tertib","Laporan semester otomatis","Kerahasiaan terjaga","Kolaborasi wali kelas","Sebaran masalah terlihat"]'::jsonb,
   'assets/img/thumbs/bk-pro.svg',
   '["Profil & data siswa","Identifikasi masalah per kategori","Catatan konseling individu & kelompok","Instrumen bantu BK","Jadwal layanan & booking","Tingkat urgensi & tindak lanjut","Kolaborasi wali kelas","Laporan semester otomatis","Hak akses berjenjang"]'::jsonb,
   '["assets/img/shots/bk-pro-1.svg","assets/img/shots/bk-pro-2.svg"]'::jsonb,
   '', '', '', 0, 'konsultasi', 'Tersedia', 'Guru BK, wali kelas, kepala sekolah (SD s.d. SMA)',
   '["HTML5","JavaScript","Supabase Auth","Supabase Database"]'::jsonb, true, true),

  ((select id from public.categories where slug='pendidikan-sekolah'),
   'Sistem Manajemen Sekolah', 'sistem-manajemen-sekolah',
   'Platform sekolah terpadu: PPDB online, data siswa & guru, jadwal pelajaran, e-rapor, SPP, dan pengumuman sekolah.',
   'Sistem Manajemen Sekolah menyatukan operasional harian sekolah: PPDB online, database siswa dan guru, jadwal pelajaran, pencatatan nilai dengan e-rapor, pembayaran SPP, hingga papan pengumuman.

Orang tua dapat memantau data anak, tagihan SPP, dan pengumuman dari perangkat mana pun.

Kepala sekolah memperoleh dashboard ringkas: siswa per rombel, kehadiran guru, realisasi SPP, dan perkembangan PPDB.',
   'Data siswa, guru, nilai, dan SPP yang tersebar di banyak file Excel membuat rekap dinas lambat dan tidak sinkron. Sistem ini menyatukan data pada satu sumber dengan peran yang jelas.',
   '["Data sekolah terpusat","PPDB online tanpa antrean","E-rapor lebih cepat","SPP terpantau + pengingat","Dashboard pimpinan"]'::jsonb,
   'assets/img/thumbs/sistem-manajemen-sekolah.svg',
   '["PPDB online dengan seleksi berkas","Database siswa, rombel & guru","Jadwal pelajaran & pengganti","Pencatatan nilai & e-rapor","Tagihan & pembayaran SPP","Pengumuman sekolah","Portal orang tua","Rekap kehadiran guru","Dashboard kepala sekolah"]'::jsonb,
   '["assets/img/shots/sistem-manajemen-sekolah-1.svg","assets/img/shots/sistem-manajemen-sekolah-2.svg"]'::jsonb,
   '', '', '', 4500000, 'sekali_bayar', 'Tersedia', 'SD, SMP, SMA/SMK, pesantren, lembaga pendidikan',
   '["HTML5","JavaScript","Supabase Auth","Supabase Database","Supabase Storage"]'::jsonb, true, true),

  ((select id from public.categories where slug='organisasi-yayasan'),
   'Sistem Filantropi dan Donasi', 'sistem-filantropi-donasi',
   'Kelola donatur, program, kampanye penggalangan dana, konfirmasi donasi, dan laporan transparansi untuk yayasan & organisasi.',
   'Sistem Filantropi dan Donasi mengelola seluruh siklus penggalangan dana: database donatur, katalog program, kampanye online, pencatatan donasi masuk, hingga laporan pertanggungjawaban.

Donasi dikonfirmasi melalui unggah bukti transfer; sistem menerbitkan kwitansi digital dan progress kampanye tampil real-time.

Laporan transparansi per program memudahkan pelaporan kepada donatur dan pemangku kepentingan.',
   'Pencatatan donasi di buku kas dan grup WhatsApp membuat laporan penyaluran lambat. Sistem ini menghadirkan satu alur data dari donasi masuk hingga laporan penyaluran.',
   '["Data donatur terpusat","Progress kampanye real-time","Kwitansi digital otomatis","Laporan transparan per program","Kepercayaan donatur meningkat"]'::jsonb,
   'assets/img/thumbs/sistem-filantropi-donasi.svg',
   '["Database donatur & riwayat donasi","Katalog program & kampanye","Unggah bukti transfer & verifikasi","Kwitansi digital","Progress bar real-time","Manajemen penyaluran dana","Laporan transparansi","Notifikasi ucapan terima kasih","Multi-program & rekening"]'::jsonb,
   '["assets/img/shots/sistem-filantropi-donasi-1.svg","assets/img/shots/sistem-filantropi-donasi-2.svg"]'::jsonb,
   '', '', '', 0, 'konsultasi', 'Segera Hadir', 'Yayasan, masjid, organisasi sosial, komunitas amal',
   '["HTML5","JavaScript","Supabase Database","Supabase Storage"]'::jsonb, false, true),

  ((select id from public.categories where slug='administrasi-perkantoran'),
   'Sistem Administrasi Operator', 'sistem-administrasi-operator',
   'Digitalisasi tata usaha: surat masuk-keluar, disposisi, agenda harian, arsip digital, dan notulen rapat dalam satu aplikasi.',
   'Sistem Administrasi Operator mendigitalkan tata usaha yang manual: pencatatan surat masuk dan keluar, disposisi pimpinan, agenda kegiatan, arsip dokumen digital, hingga notulen rapat.

Setiap surat tercatat dengan nomor dan tanggal; disposisi mengalir ke pihak terkait dengan notifikasi. Arsip dapat dicari dalam hitungan detik.

Sangat membantu operator sekolah, kantor desa, yayasan, dan perkantoran kecil.',
   'Buku agenda dan arsip lemari membuat pencarian dokumen lama memakan waktu dan disposisi sering tertunda. Sistem ini menghadirkan pencatatan digital sederhana yang cepat dipelajari.',
   '["Pencarian dokumen dalam detik","Disposisi cepat dengan notifikasi","Arsip digital aman","Agenda terlihat seluruh tim","Notulen mudah ditelusuri"]'::jsonb,
   'assets/img/thumbs/sistem-administrasi-operator.svg',
   '["Surat masuk & keluar bernomor otomatis","Disposisi berjenjang + notifikasi","Agenda kegiatan harian","Arsip dokumen digital","Pencarian cepat multi-filter","Notulen rapat","Template dokumen","Statistik administrasi","Backup data mudah"]'::jsonb,
   '["assets/img/shots/sistem-administrasi-operator-1.svg","assets/img/shots/sistem-administrasi-operator-2.svg"]'::jsonb,
   '', '', '', 1950000, 'sekali_bayar', 'Tersedia', 'Operator sekolah, kantor desa, yayasan, perkantoran',
   '["HTML5","JavaScript","Supabase Database","Supabase Storage"]'::jsonb, false, true),

  ((select id from public.categories where slug='bisnis-umkm'),
   'Sistem Manajemen Inventaris', 'sistem-manajemen-inventaris',
   'Kelola aset dan stok: katalog barang, transaksi masuk-keluar, stok opname, peminjaman, dan label QR untuk inventarisasi.',
   'Sistem Manajemen Inventaris membantu menginventarisasi aset dan stok secara digital: katalog barang dengan foto dan lokasi, transaksi masuk dan keluar, hingga stok opname berkala.

Setiap barang dapat diberi label QR untuk mempercepat audit. Modul peminjaman mencatat siapa meminjam dan kapan kembali.

Laporan stok menampilkan barang menipis dan nilai aset untuk perencanaan pengadaan.',
   'Inventaris manual sering tidak sinkron dengan kondisi riil: barang hilang tanpa jejak dan audit butuh waktu berhari-hari. Sistem ini membuat stok selalu terpantau dan audit lebih cepat.',
   '["Stok selalu sinkron","Audit cepat dengan QR","Pengadaan lebih tepat","Peminjaman tertib","Nilai aset terpantau"]'::jsonb,
   'assets/img/thumbs/sistem-manajemen-inventaris.svg',
   '["Katalog barang + foto & lokasi","Transaksi masuk & keluar","Stok minimum & peringatan","Stok opname berkala","Label QR per barang","Modul peminjaman","Laporan nilai aset","Multi-gudang","Ekspor Excel/PDF"]'::jsonb,
   '["assets/img/shots/sistem-manajemen-inventaris-1.svg","assets/img/shots/sistem-manajemen-inventaris-2.svg"]'::jsonb,
   '', '', '', 0, 'konsultasi', 'Tersedia', 'UMKM, sekolah, yayasan, gudang, kantor',
   '["HTML5","JavaScript","Supabase Database","QR Generator"]'::jsonb, false, true)
on conflict (slug) do nothing;

insert into public.website_settings (setting_key, setting_value) values
  ('site_name', 'Aplikasiku.nd'),
  ('tagline', 'Kerja Jadi Lebih Mudah'),
  ('hero_headline', 'Solusi Digital untuk Membuat Pekerjaan Lebih Mudah.'),
  ('hero_subheadline', 'Temukan berbagai aplikasi digital yang membantu bisnis, lembaga, sekolah, dan organisasi bekerja lebih efektif, terstruktur, dan produktif.'),
  ('cta_headline', 'Punya Kebutuhan Sistem Digital?'),
  ('cta_description', 'Kami siap membantu Anda membangun aplikasi yang sesuai dengan kebutuhan bisnis, sekolah, yayasan, dan organisasi.'),
  ('whatsapp', '6281234567890'),
  ('email', 'kontak@aplikasiku.nd'),
  ('operational_hours', 'Senin - Sabtu, 08.00 - 17.00 WIB'),
  ('address', 'Melayani seluruh Indonesia secara online'),
  ('instagram', 'https://instagram.com/aplikasiku.nd'),
  ('facebook', 'https://facebook.com/aplikasiku.nd'),
  ('tiktok', 'https://tiktok.com/@aplikasiku.nd'),
  ('youtube', 'https://youtube.com/@aplikasiku.nd'),
  ('seo_title', 'Aplikasiku.nd — Katalog Aplikasi Digital untuk Bisnis, Sekolah & Organisasi'),
  ('seo_description', 'Katalog aplikasi digital profesional: HRMS, keuangan, sekolah, CRM, administrasi, hingga sistem custom. Konsultasi gratis, kerja jadi lebih mudah.'),
  ('stats_users', '1500'),
  ('stats_projects', '120')
on conflict (setting_key) do nothing;

insert into public.faqs (question, answer) values
  ('Bagaimana cara meminta demo aplikasi?', 'Klik tombol Coba Demo pada aplikasi yang Anda minati, atau hubungi kami melalui WhatsApp. Tim kami akan menjadwalkan sesi demo online dan membantu Anda mencoba fitur utama aplikasi secara langsung.'),
  ('Apakah bisa dimodifikasi sesuai kebutuhan kami?', 'Bisa. Semua aplikasi pada katalog dapat dikustomisasi: penyesuaian fitur, alur kerja, laporan, hingga identitas brand lembaga Anda. Sampaikan kebutuhan Anda melalui formulir pemesanan dan kami akan memberikan penawaran.'),
  ('Berapa lama waktu pengembangan aplikasi custom?', 'Aplikasi berbasis modul yang sudah tersedia umumnya dapat digunakan dalam 1-3 minggu. Aplikasi custom tergantung kompleksitas kebutuhan, umumnya 3-8 minggu. Estimasi detail diberikan setelah sesi konsultasi awal.'),
  ('Apakah tersedia dukungan dan pemeliharaan setelah aplikasi selesai?', 'Ya. Kami menyediakan layanan maintenance: perbaikan bug, pembaruan kecil, backup, dan konsultasi penggunaan. Paket dukungan dapat dipilih sesuai kebutuhan dan dijelaskan saat penawaran.'),
  ('Apakah data kami aman?', 'Aplikasi dibangun di atas Supabase dengan Row Level Security, autentikasi berjenjang, dan enkripsi standar industri. Hak akses disesuaikan per peran sehingga data sensitif hanya dapat dilihat pihak yang berwenang.')
on conflict do nothing;

insert into public.testimonials (customer_name, organization, content, rating) values
  ('Ahmad Fauzi', 'SMK Nusantara (data contoh)', 'Sistem Manajemen Sekolah memangkas pekerjaan operator kami. Rekap SPP yang biasanya butuh berhari-hari kini selesai dalam satu sore. Orang tua juga lebih mudah memantau tagihan.', 5),
  ('Rina Kartika', 'CV Berkah Jaya (data contoh)', 'CRM dan Sistem Pendaftaran membuat tim sales jadi disiplin. Semua leads tercatat dan follow-up terjadwal. Dalam dua bulan konversi kami naik cukup signifikan.', 5),
  ('Drs. Hendra Wijaya', 'Yayasan Cerdas Bangsa (data contoh)', 'Proses konsultasinya cepat dan jelas. Aplikasi kepegawaian disesuaikan dengan struktur yayasan kami, dan tim selalu responsif ketika kami butuh bantuan.', 4)
on conflict do nothing;

insert into public.posts (title, slug, excerpt, content, cover_url, is_published, published_at) values
  ('5 Tanda Administrasi Kantor Anda Butuh Digitalisasi', 'tanda-administrasi-butuh-digitalisasi',
   'Surat bertumpuk, arsip sulit dicari, dan rekap yang selalu terlambat? Ini lima tanda waktunya memindahkan administrasi kantor Anda ke sistem digital.',
   'Administrasi manual masih menjadi kenyataan di banyak kantor, sekolah, dan yayasan. Berikut lima tanda paling umum.

1. Pencarian dokumen memakan waktu lama. Sistem arsip digital dapat mencari berdasarkan kata kunci, kategori, dan periode dalam hitungan detik.

2. Rekap selalu terlambat. Sistem yang baik menyusun rekap otomatis dari transaksi harian.

3. Data tidak sinkron antar petugas. Satu sumber data adalah prinsip utama digitalisasi.

4. Disposisi dan tindak lanjut tersendat. Dengan sistem, disposisi mengalir beserta notifikasi.

5. Riwayat sulit ditelusuri saat audit. Jejak digital membuat setiap perubahan tercatat: siapa, kapan, dan apa yang berubah.

Jika tiga dari lima tanda di atas terjadi di tempat Anda, mulailah dari digitalisasi satu alur kerja terlebih dahulu, misalnya surat menyurat, lalu perluas bertahap. Aplikasiku.nd menyediakan Sistem Administrasi Operator untuk kebutuhan tersebut.',
   'assets/img/thumbs/sistem-administrasi-operator.svg', true, now() - interval '30 days'),
  ('Memilih Aplikasi HRMS untuk Sekolah dan Yayasan', 'memilih-aplikasi-hrms-sekolah-yayasan',
   'HRMS bukan hanya untuk korporasi. Sekolah dan yayasan pun butuh sistem kepegawaian. Ini panduan memilih fitur yang benar-benar terpakai.',
   'Banyak pengelola lembaga menganggap sistem kepegawaian (HRMS) adalah urusan perusahaan besar. Kenyataannya, sekolah dan yayasan menghadapi persoalan yang sama: rekap kehadiran, pengajuan cuti, kontrak, hingga penilaian kinerja.

Pertama, pilih fitur yang menjawab masalah nyata. Absensi dan cuti adalah dua fitur paling cepat berdampak.

Kedua, pastikan alurnya berjenjang dengan notifikasi di setiap tahap.

Ketiga, perhatikan hak akses. Data kepegawaian bersifat sensitif dan harus mendukung peran berbeda.

Keempat, pikirkan keterhubungan dengan penggajian. Rekap absensi yang bisa diekspor menghemat banyak waktu.

Terakhir, pilih sistem yang mudah dipelajari. Minta demo sebelum memutuskan.',
   'assets/img/thumbs/hr-management-system.svg', true, now() - interval '15 days'),
  ('Apa Itu CRM dan Mengapa Bisnis Kecil Juga Membutuhkannya', 'apa-itu-crm-untuk-bisnis-kecil',
   'CRM sering dianggap terlalu besar untuk usaha kecil. Padahal prinsipnya sederhana: jangan sampai calon pelanggan terlupakan.',
   'CRM (Customer Relationship Management) adalah cara terstruktur untuk mengelola hubungan dengan calon dan pelanggan. Untuk usaha kecil, inti persoalannya biasanya sederhana: leads masuk lewat chat pribadi dan banyak yang lupa ditindaklanjuti.

CRM bekerja dengan tiga blok dasar: tempat tunggal untuk menyimpan leads, alur tahapan (pipeline) yang jelas, dan pengingat follow-up.

Sebagian besar konversi terjadi pada tindak lanjut kedua atau ketiga — bukan pada kontak pertama.

Untuk lembaga pendidikan dan layanan, CRM juga berguna sebagai sistem pendaftaran dengan konfirmasi otomatis via WhatsApp.

Mulailah sederhana: satu tim, satu pipeline, disiplin mencatat.',
   'assets/img/thumbs/crm-sistem-pendaftaran.svg', true, now() - interval '5 days')
on conflict (slug) do nothing;

-- ============================================================================
-- SELESAI. Cek hasil: buka Table Editor di Supabase Dashboard.
-- Langkah berikutnya: isi js/config.js (URL + anon key), buat user admin
-- di Authentication -> Users, lalu login di login.html.
-- ============================================================================
