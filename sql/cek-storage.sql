-- ============================================================================
-- APLIKASIKU.ND — sql/cek-storage.sql
-- Pemeriksaan cepat: kenapa upload gambar di panel admin gagal?
--
-- CARA PAKAI: Supabase Dashboard -> SQL Editor -> New query ->
-- salin SELURUH isi file ini -> Run -> baca hasil tiap blok.
--
-- Semua perintah pada bagian 1-5 hanya MEMBACA (tidak mengubah apa pun).
-- Bagian "PERBAIKAN OPSIONAL" di bawah sengaja diberi tanda komentar;
-- lepaskan tanda -- pada baris yang dibutuhkan lalu Run lagi.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) BUCKET "media" — HARUS menghasilkan 1 baris dengan kolom public = true.
--    Kosong = bucket belum dibuat (ini penyebab error "Bucket not found").
-- ---------------------------------------------------------------------------
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'media';

-- ---------------------------------------------------------------------------
-- 2) KEBIJAKAN AKSES BUCKET — HARUS menampilkan 4 baris:
--    "Publik membaca media"      (SELECT)
--    "Admin mengunggah media"    (INSERT)  <- kalau baris ini tidak ada,
--    "Admin memperbarui media"   (UPDATE)     upload pasti gagal dengan
--    "Admin menghapus media"     (DELETE)     "row-level security policy"
-- ---------------------------------------------------------------------------
select policyname, cmd
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;

-- ---------------------------------------------------------------------------
-- 3) DAFTAR ADMIN TERDAFTAR — user yang dipakai login di panel admin
--    WAJIB muncul di daftar ini. Kalau kosong / email Anda tidak ada,
--    kebijakan storage (is_admin()) akan menolak setiap upload.
-- ---------------------------------------------------------------------------
select a.user_id, u.email, a.created_at
from public.admins a
left join auth.users u on u.id = a.user_id
order by a.created_at;

-- ---------------------------------------------------------------------------
-- 4) USER YANG SEDANG LOGIN DI BROWSER INI
--    Bandingkan hasilnya dengan daftar pada blok nomor 3 —
--    kedua user_id harus SAMA. NULL = belum login sama sekali.
-- ---------------------------------------------------------------------------
select auth.uid() as user_anda_saat_ini;

-- ---------------------------------------------------------------------------
-- 5) FILE YANG SUDAH PERNAH TERUNGGAH di bucket (10 terbaru)
-- ---------------------------------------------------------------------------
select name, created_at
from storage.objects
where bucket_id = 'media'
order by created_at desc
limit 10;

-- ============================================================================
-- PERBAIKAN OPSIONAL — jalankan HANYA bagian yang diperlukan.
-- Lepaskan tanda -- di depan baris, lalu Run.
-- ============================================================================

-- A. Bucket belum ada (blok 1 kosong)? Buat sekaligus pastikan publik:
-- insert into storage.buckets (id, name, public)
-- values ('media', 'media', true)
-- on conflict (id) do update set public = true;

-- B. Kebijakan belum lengkap (blok 2 kurang dari 4 baris)? Buat ulang:
-- drop policy if exists "Publik membaca media" on storage.objects;
-- drop policy if exists "Admin mengunggah media" on storage.objects;
-- drop policy if exists "Admin memperbarui media" on storage.objects;
-- drop policy if exists "Admin menghapus media" on storage.objects;
-- create policy "Publik membaca media" on storage.objects
--   for select using (bucket_id = 'media');
-- create policy "Admin mengunggah media" on storage.objects
--   for insert with check (bucket_id = 'media' and public.is_admin());
-- create policy "Admin memperbarui media" on storage.objects
--   for update using (bucket_id = 'media' and public.is_admin());
-- create policy "Admin menghapus media" on storage.objects
--   for delete using (bucket_id = 'media' and public.is_admin());

-- C. Akun Anda belum terdaftar sebagai admin (blok 3 tidak berisi email
--    Anda)? Ganti email di bawah, lalu jalankan:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'email-anda@contoh.com'
-- on conflict (user_id) do nothing;
