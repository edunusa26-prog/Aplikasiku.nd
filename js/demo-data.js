/* ============================================================
   APLIKASIKU.ND — js/demo-data.js
   Data contoh (label DEMO/CONTOH) untuk Mode Demo — dipakai
   saat Supabase belum dikonfigurasi. Pada produksi, data nyata
   diambil dari tabel Supabase dengan struktur yang identik.
   ============================================================ */

window.DEMO_SETTINGS = {
  site_name: "Aplikasiku.nd",
  tagline: "Kerja Jadi Lebih Mudah",
  hero_headline: "Solusi Digital untuk Membuat Pekerjaan Lebih Mudah.",
  hero_subheadline: "Temukan berbagai aplikasi digital yang membantu bisnis, lembaga, sekolah, dan organisasi bekerja lebih efektif, terstruktur, dan produktif.",
  cta_headline: "Punya Kebutuhan Sistem Digital?",
  cta_description: "Kami siap membantu Anda membangun aplikasi yang sesuai dengan kebutuhan bisnis, sekolah, yayasan, dan organisasi.",
  whatsapp: "6281234567890",
  email: "kontak@aplikasiku.nd",
  operational_hours: "Senin - Sabtu, 08.00 - 17.00 WIB",
  address: "Melayani seluruh Indonesia secara online",
  instagram: "https://instagram.com/aplikasiku.nd",
  facebook: "https://facebook.com/aplikasiku.nd",
  tiktok: "https://tiktok.com/@aplikasiku.nd",
  youtube: "https://youtube.com/@aplikasiku.nd",
  seo_title: "Aplikasiku.nd — Katalog Aplikasi Digital untuk Bisnis, Sekolah & Organisasi",
  seo_description: "Katalog aplikasi digital profesional: HRMS, keuangan, sekolah, CRM, administrasi, hingga sistem custom. Konsultasi gratis, kerja jadi lebih mudah.",
  stats_users: "1500",
  stats_projects: "120",
  /* --- v1.1: identitas brand, tema warna, SEO (dikelola dari
     Admin > Pengaturan Website). Nilai kosong = pakai bawaan. --- */
  logo_url: "",
  logo_light_url: "",
  favicon_url: "",
  og_image_url: "",
  theme_primary: "",
  theme_primary_dark: "",
  theme_navbar: "light",
  site_url: "",
  linkedin: "",
  footer_note: "Kerja Jadi Lebih Mudah."
};

window.DEMO_CATEGORIES = [
  { id: "cat-1", name: "Human Resource Management System (HRMS)", slug: "hrms", description: "Aplikasi kelola pegawai, absensi, cuti, kinerja, dan pengetahuan HR.", icon: "fa-solid fa-users-gear", created_at: "2025-01-10T08:00:00Z" },
  { id: "cat-2", name: "Sistem Keuangan dan Akuntansi", slug: "keuangan-akuntansi", description: "Pencatatan keuangan, jurnal, laporan keuangan, dan anggaran.", icon: "fa-solid fa-chart-pie", created_at: "2025-01-10T08:05:00Z" },
  { id: "cat-3", name: "Sistem Pendidikan dan Sekolah", slug: "pendidikan-sekolah", description: "Manajemen sekolah, PPDB, Bimbingan Konseling, dan aplikasi guru.", icon: "fa-solid fa-graduation-cap", created_at: "2025-01-10T08:10:00Z" },
  { id: "cat-4", name: "CRM dan Sistem Pendaftaran", slug: "crm-pendaftaran", description: "Kelola pelanggan, leads, follow-up, dan pendaftaran online.", icon: "fa-solid fa-handshake", created_at: "2025-01-10T08:15:00Z" },
  { id: "cat-5", name: "Sistem Administrasi dan Perkantoran", slug: "administrasi-perkantoran", description: "Surat menyurat, disposisi, agenda, dan arsip digital.", icon: "fa-solid fa-folder-open", created_at: "2025-01-10T08:20:00Z" },
  { id: "cat-6", name: "Sistem Kesehatan", slug: "kesehatan", description: "Aplikasi klinik, pendaftaran pasien, rekam medis sederhana.", icon: "fa-solid fa-heart-pulse", created_at: "2025-01-10T08:25:00Z" },
  { id: "cat-7", name: "Sistem Bisnis dan UMKM", slug: "bisnis-umkm", description: "Kasir, inventaris, penjualan, dan pengelolaan usaha.", icon: "fa-solid fa-store", created_at: "2025-01-10T08:30:00Z" },
  { id: "cat-8", name: "Sistem Organisasi dan Yayasan", slug: "organisasi-yayasan", description: "Kepegawaian, program, filantropi, dan database organisasi.", icon: "fa-solid fa-people-group", created_at: "2025-01-10T08:35:00Z" },
  { id: "cat-9", name: "Produktivitas dan Manajemen Proyek", slug: "produktivitas-proyek", description: "Task management, timeline proyek, dan kolaborasi tim.", icon: "fa-solid fa-list-check", created_at: "2025-01-10T08:40:00Z" },
  { id: "cat-10", name: "Website dan Sistem Custom", slug: "website-custom", description: "Website profil, landing page, dan sistem sesuai kebutuhan khusus.", icon: "fa-solid fa-laptop-code", created_at: "2025-01-10T08:45:00Z" }
];

window.DEMO_APPLICATIONS = [
  {
    id: "app-1", category_id: "cat-1", name: "HR Knowledge Center", slug: "hr-knowledge-center",
    short_description: "Pusat pengetahuan HR digital untuk memuat SOP, kebijakan, materi pelatihan, dan direktori pegawai dalam satu portal online.",
    full_description: "HR Knowledge Center adalah portal pengetahuan internal yang membantu organisasi mendigitalkan seluruh dokumen SDM: SOP kerja, kebijakan perusahaan, handbooks, hingga materi onboarding karyawan baru. Tidak lagi berpindah-pindah file atau bertanya berulang kali ke HRD — semua informasi tersimpan rapi, mudah dicari, dan selalu versi terbaru.\n\nAplikasi ini dilengkapi modul e-learning sederhana sehingga tim HR dapat menyusun materi pelatihan beserta kuis dan sertifikat penyelesaian. Manajemen dapat memantau seberapa aktif pegawai membaca dokumen melalui dashboard statistik baca.\n\nCocok untuk perusahaan, sekolah, yayasan, dan organisasi yang ingin membangun budaya dokumentasi dan pembelajaran mandiri tanpa biaya lisensi tahunan yang mahal.",
    background: "Banyak organisasi masih menyimpan SOP dan kebijakan HR dalam file Word atau PDF yang tersebar di beberapa komputer. Karyawan sulit menemukan informasi terbaru, versi dokumen tidak jelas, dan proses orientasi karyawan baru memakan waktu lama. HR Knowledge Center hadir untuk menata ulang alur tersebut menjadi satu pusat pengetahuan online yang terstruktur.",
    benefits: ["Dokumen SOP dan kebijakan selalu versi terbaru dan mudah dicari", "Onboarding karyawan baru lebih cepat dengan modul e-learning", "Mengurangi pertanyaan berulang ke tim HRD", "Statistik baca untuk memantau kedisiplinan dokumentasi", "Hak akses per divisi menjaga kerahasiaan dokumen"],
    thumbnail_url: "assets/img/thumbs/hr-knowledge-center.svg",
    features: ["Artikel & SOP dengan editor mudah", "Kategori, tag, dan pencarian cepat", "Modul e-learning dengan kuis", "Sertifikat penyelesaian pelatihan", "Direktori pegawai & struktur organisasi", "Pengumuman internal", "Hak akses per divisi / level", "Dashboard statistik pembacaan", "Riwayat versi dokumen"],
    screenshots: ["assets/img/shots/hr-knowledge-center-1.svg", "assets/img/shots/hr-knowledge-center-2.svg"],
    demo_url: "", application_url: "",
    price: 0, pricing_type: "konsultasi", status: "Tersedia", target_users: "HRD, manajemen, dan seluruh pegawai perusahaan/lembaga",
    tech: ["HTML5", "JavaScript", "Supabase Database", "Supabase Storage"],
    is_featured: false, view_count: 214, demo: true,
    created_at: "2025-09-02T09:00:00Z", updated_at: "2026-02-14T10:00:00Z"
  },
  {
    id: "app-2", category_id: "cat-1", name: "HR Management System", slug: "hr-management-system",
    short_description: "Aplikasi manajemen SDM lengkap: data pegawai, struktur organisasi, absensi online, cuti, lembur, hingga penilaian kinerja.",
    full_description: "HR Management System membantu tim HR mengelola seluruh siklus data kepegawaian dalam satu sistem: biodata, kontrak, struktur organisasi, absensi harian, pengajuan cuti dan lembur, hingga penilaian kinerja berkala.\n\nPegawai dapat mengajukan cuti atau lembur langsung dari aplikasi, atasan menyetujui secara berjenjang, dan seluruh riwayat tercatat otomatis. Rekap absensi dapat diekspor untuk kebutuhan penggajian.\n\nDashboard manajemen menampilkan komposisi pegawai, tingkat kehadiran, dan status pengajuan secara real-time sehingga keputusan SDM lebih cepat dan berbasis data.",
    background: "Rekap absensi manual dan arsip cuti berbasis kertas sering menimbulkan selisih data serta memakan waktu berhari-hari saat audit. Sistem ini dibuat untuk menggantikan pencatatan manual dengan alur digital yang rapi: pengajuan, persetujuan berjenjang, dan rekap otomatis siap pakai.",
    benefits: ["Rekap kehadiran otomatis tanpa hitung manual", "Alur persetujuan cuti/lembur berjenjang dan terdokumentasi", "Data pegawai terpusat dan mudah diaudit", "Penilaian kinerja berkala lebih objektif", "Ekspor data siap untuk payroll"],
    thumbnail_url: "assets/img/thumbs/hr-management-system.svg",
    features: ["Master data pegawai & kontrak", "Struktur organisasi & jabatan", "Absensi online dengan rekap bulanan", "Pengajuan & persetujuan cuti berjenjang", "Pencatatan lembur", "Penilaian kinerja (e-appraisal)", "Notifikasi pengajuan", "Ekspor laporan Excel/CSV", "Multi-role: admin HR, atasan, pegawai"],
    screenshots: ["assets/img/shots/hr-management-system-1.svg", "assets/img/shots/hr-management-system-2.svg"],
    demo_url: "", application_url: "",
    price: 3500000, pricing_type: "sekali_bayar", status: "Tersedia", target_users: "Perusahaan, yayasan, sekolah, dan lembaga dengan 10-500 pegawai",
    tech: ["HTML5", "JavaScript", "Supabase Auth", "Supabase Database"],
    is_featured: true, view_count: 486, demo: true,
    created_at: "2025-08-18T09:00:00Z", updated_at: "2026-03-02T10:00:00Z"
  },
  {
    id: "app-3", category_id: "cat-2", name: "Sistem Keuangan dan Akuntansi", slug: "sistem-keuangan-akuntansi",
    short_description: "Pencatatan transaksi keuangan, jurnal otomatis, kas bank, piutang-utang, hingga laporan neraca dan laba rugi siap cetak.",
    full_description: "Sistem Keuangan dan Akuntansi membantu bisnis dan lembaga mencatat seluruh transaksi secara tertib: pemasukan, pengeluaran, jurnal umum, kas & bank, piutang, hingga utang. Setiap transaksi dapat dikaitkan dengan kategori akun dan sumber dana.\n\nLaporan keuangan standar tersedia otomatis: buku besar, neraca saldo, laba rugi, neraca, dan arus kas — dengan periode yang dapat dipilih. Tidak perlu lagi menyusun laporan manual di spreadsheet setiap akhir bulan.\n\nUntuk organisasi dengan beberapa unit atau program, sistem mendukung multi-entitas sehingga laporan dapat dilihat per unit maupun gabungan.",
    background: "Pencatatan keuangan di spreadsheet rawan salah dan sulit diaudit. Banyak organisasi kesulitan menyusun laporan keuangan yang konsisten antar periode. Sistem ini dibuat agar transaksi tercatat sekali, lalu seluruh laporan standar tersusun otomatis dengan angka yang selalu sinkron.",
    benefits: ["Laporan keuangan otomatis: neraca, laba rugi, arus kas", "Angka konsisten antar laporan karena satu sumber data", "Pemantauan arus kas real-time", "Memudahkan audit karena jejak transaksi lengkap", "Multi-entitas untuk organisasi dengan banyak unit"],
    thumbnail_url: "assets/img/thumbs/sistem-keuangan-akuntansi.svg",
    features: ["Jurnal umum & posting otomatis", "Buku besar & neraca saldo", "Kas & bank dengan rekonsiliasi", "Piutang dan utang dagang", "Laporan laba rugi, neraca, arus kas", "Anggaran vs realisasi", "Multi-entitas / multi-program", "Ekspor laporan ke Excel & PDF", "Hak akses: admin keuangan & pimpinan"],
    screenshots: ["assets/img/shots/sistem-keuangan-akuntansi-1.svg", "assets/img/shots/sistem-keuangan-akuntansi-2.svg"],
    demo_url: "", application_url: "",
    price: 250000, pricing_type: "langganan", status: "Tersedia", target_users: "UMKM, sekolah, yayasan, dan perusahaan jasa",
    tech: ["HTML5", "JavaScript", "Supabase Database", "Chart.js"],
    is_featured: false, view_count: 358, demo: true,
    created_at: "2025-07-22T09:00:00Z", updated_at: "2026-01-28T10:00:00Z"
  },
  {
    id: "app-4", category_id: "cat-1", name: "Sistem Remunerasi dan Penggajian", slug: "sistem-remunerasi-penggajian",
    short_description: "Penggajian otomatis: komponen gaji, tunjangan, potongan, PPh 21, BPJS, hingga slip gaji digital yang siap dikirim ke pegawai.",
    full_description: "Sistem Remunerasi dan Penggajian menyederhanakan proses payroll bulanan. Struktur gaji dikonfigurasi per jabatan: gaji pokok, tunjangan, rate lembur, hingga potongan. Data absensi dari HR Management System dapat ditarik otomatis sehingga perhitungan tidak perlu dihitung ulang.\n\nPerhitungan PPh 21 Ter/Bulanan dan iuran BPJS mengikuti aturan yang berlaku, dengan parameter yang dapat disesuaikan bila regulasi berubah.\n\nSetiap pegawai menerima slip gaji digital yang dapat diunduh, dan pimpinan memperoleh rekap beban gaji per unit untuk kebutuhan anggaran.",
    background: "Proses payroll manual dengan spreadsheet memakan waktu berhari-hari dan rawan salah hitung, terutama saat komponen tunjangan dan potongan beragam. Sistem ini dibuat agar penggajian selesai dalam hitungan menit dengan jejak perhitungan yang dapat ditelusuri.",
    benefits: ["Payroll bulanan selesai lebih cepat dan akurat", "PPh 21 & BPJS dihitung otomatis sesuai parameter", "Slip gaji digital mudah didistribusikan", "Terintegrasi dengan data absensi", "Rekap beban gaji per unit untuk anggaran"],
    thumbnail_url: "assets/img/thumbs/sistem-remunerasi-penggajian.svg",
    features: ["Struktur gaji per jabatan & unit", "Import/rekap absensi otomatis", "Perhitungan PPh 21", "Perhitungan iuran BPJS", "Slip gaji digital (PDF)", "Riwayat payroll per periode", "Rekap beban gaji untuk manajemen", "Hak akses terbatas data gaji", "Ekspor bukti potong"],
    screenshots: ["assets/img/shots/sistem-remunerasi-penggajian-1.svg", "assets/img/shots/sistem-remunerasi-penggajian-2.svg"],
    demo_url: "", application_url: "",
    price: 0, pricing_type: "konsultasi", status: "Dalam Pengembangan", target_users: "HRD dan keuangan perusahaan, sekolah, yayasan",
    tech: ["HTML5", "JavaScript", "Supabase Database", "PDF Generator"],
    is_featured: false, view_count: 189, demo: true,
    created_at: "2026-01-12T09:00:00Z", updated_at: "2026-05-20T10:00:00Z"
  },
  {
    id: "app-5", category_id: "cat-4", name: "CRM dan Sistem Pendaftaran", slug: "crm-sistem-pendaftaran",
    short_description: "Kelola calon pelanggan (leads), pipeline penjualan, follow-up terjadwal, dan pendaftaran online dengan notifikasi WhatsApp.",
    full_description: "CRM dan Sistem Pendaftaran membantu tim bisnis dan lembaga menangkap, mengelola, dan menindaklanjuti setiap calon pelanggan. Leads dapat masuk dari formulir website, pendaftaran online, maupun input manual oleh tim.\n\nPipeline kanban membuat status setiap lead terlihat jelas: baru, dihubungi, nego, hingga deal. Pengingat follow-up memastikan tidak ada calon pelanggan yang terlupakan.\n\nModul pendaftaran online cocok untuk kursus, event, PPDB, maupun layanan klinik: pendaftar mengisi formulir, sistem mengonfirmasi via WhatsApp, dan admin memantau kuota secara real-time.",
    background: "Calon pelanggan sering hilang karena catatan tersebar di chat pribadi, catatan kertas, atau ingatan tim. Tanpa pipeline yang jelas, follow-up tidak terjadwal dan tingkat konversi sulit diukur. Sistem ini menyatukan seluruh leads dalam satu alur kerja yang terukur.",
    benefits: ["Semua leads terpusat dan tidak ada yang terlewat", "Pipeline visual mempercepat penindaklanjutan", "Tingkat konversi terukur per sumber leads", "Konfirmasi pendaftaran otomatis via WhatsApp", "Kuota pendaftaran terpantau real-time"],
    thumbnail_url: "assets/img/thumbs/crm-sistem-pendaftaran.svg",
    features: ["Manajemen leads & sumber data", "Pipeline kanban (baru s.d. deal)", "Jadwal & pengingat follow-up", "Formulir pendaftaran online", "Notifikasi otomatis WhatsApp", "Manajemen kuota & jadwal", "Dashboard konversi", "Riwayat komunikasi per leads", "Ekspor data pendaftar"],
    screenshots: ["assets/img/shots/crm-sistem-pendaftaran-1.svg", "assets/img/shots/crm-sistem-pendaftaran-2.svg"],
    demo_url: "", application_url: "",
    price: 2750000, pricing_type: "sekali_bayar", status: "Tersedia", target_users: "Bisnis jasa, kursus, klinik, sekolah (PPDB), dan event organizer",
    tech: ["HTML5", "JavaScript", "Supabase Database", "WhatsApp API"],
    is_featured: false, view_count: 302, demo: true,
    created_at: "2025-06-15T09:00:00Z", updated_at: "2026-02-08T10:00:00Z"
  }
];

window.DEMO_APPLICATIONS.push(
  {
    id: "app-6", category_id: "cat-3", name: "BK PRO — Aplikasi Bimbingan Konseling", slug: "bk-pro",
    short_description: "Aplikasi Bimbingan dan Konseling (BK) untuk guru BK: pencatatan kasus, layanan konseling, jadwal, dan laporan semester.",
    full_description: "BK PRO membantu guru Bimbingan dan Konseling mencatat seluruh aktivitas layanan secara tertib dan rahasia: profil siswa, identifikasi masalah, kasus per kategori (pribadi, sosial, belajar, karier), hingga catatan proses konseling individu maupun kelompok.\n\nSistem menyediakan instrumen bantu yang lazim digunakan di BK, jadwal layanan, serta tindak lanjut kolaborasi dengan wali kelas dan orang tua sesuai tingkat urgensi kasus.\n\nDi akhir semester, laporan layanan BK tersusun otomatis untuk kebutuhan laporan kepala sekolah dan dinas — tanpa menyalin ulang catatan manual.",
    background: "Catatan kasus BK masih sering berbentuk buku tulis dan kartu bimbingan sehingga sulit dirangkum saat pembuatan laporan semester, dan kerahasiaan data siswa sulit dijaga. BK PRO dibuat agar pencatatan tertib, laporan otomatis, dan akses data sesuai peran.",
    benefits: ["Pencatatan kasus lebih tertib dan mudah ditelusuri", "Laporan layanan semester tersusun otomatis", "Kerahasiaan data siswa terjaga lewat hak akses", "Tindak lanjut kolaboratif dengan wali kelas", "Sebaran masalah siswa terlihat untuk program preventif"],
    thumbnail_url: "assets/img/thumbs/bk-pro.svg",
    features: ["Profil & data siswa", "Identifikasi masalah per kategori", "Catatan konseling individu & kelompok", "Instrumen bantu BK", "Jadwal layanan & booking", "Tingkat urgensi & tindak lanjut", "Kolaborasi wali kelas", "Laporan semester otomatis", "Hak akses berjenjang & aman"],
    screenshots: ["assets/img/shots/bk-pro-1.svg", "assets/img/shots/bk-pro-2.svg"],
    demo_url: "", application_url: "",
    price: 0, pricing_type: "konsultasi", status: "Tersedia", target_users: "Guru BK, wali kelas, dan kepala sekolah (SD s.d. SMA)",
    tech: ["HTML5", "JavaScript", "Supabase Auth", "Supabase Database"],
    is_featured: true, view_count: 512, demo: true,
    created_at: "2025-05-10T09:00:00Z", updated_at: "2026-04-01T10:00:00Z"
  },
  {
    id: "app-7", category_id: "cat-3", name: "Sistem Manajemen Sekolah", slug: "sistem-manajemen-sekolah",
    short_description: "Platform sekolah terpadu: PPDB online, data siswa & guru, jadwal pelajaran, e-rapor, SPP, dan pengumuman sekolah.",
    full_description: "Sistem Manajemen Sekolah menyatukan operasional sekolah harian dalam satu aplikasi: PPDB online, database siswa dan guru, jadwal pelajaran, pencatatan nilai dengan e-rapor, pembayaran SPP, hingga papan pengumuman.\n\nOrang tua dapat memantau data anak, tagihan SPP, dan pengumuman sekolah dari perangkat mana pun. Operator sekolah tidak lagi mengelola puluhan spreadsheet terpisah.\n\nKepala sekolah memperoleh dashboard ringkas: jumlah siswa per rombel, kehadiran guru, realisasi SPP, dan perkembangan PPDB — semua dalam satu tampilan.",
    background: "Data siswa, guru, nilai, dan pembayaran SPP tersebar di banyak file Excel milik operator berbeda, sehingga rekap untuk rapat dinas memakan waktu lama dan sering tidak sinkron. Sistem ini menyatukan data pada satu sumber dengan peran yang jelas untuk operator, guru, dan orang tua.",
    benefits: ["Data sekolah terpusat dan selalu sinkron", "PPDB online memangkas antrean pendaftaran", "E-rapor dan nilai lebih cepat tersusun", "Tagihan SPP terpantau dan pengingat otomatis", "Dashboard pimpinan untuk keputusan cepat"],
    thumbnail_url: "assets/img/thumbs/sistem-manajemen-sekolah.svg",
    features: ["PPDB online dengan seleksi berkas", "Database siswa, rombel & guru", "Jadwal pelajaran & pengganti", "Pencatatan nilai & e-rapor", "Tagihan & pembayaran SPP", "Pengumuman sekolah", "Portal orang tua", "Rekap kehadiran guru", "Dashboard kepala sekolah"],
    screenshots: ["assets/img/shots/sistem-manajemen-sekolah-1.svg", "assets/img/shots/sistem-manajemen-sekolah-2.svg"],
    demo_url: "", application_url: "",
    price: 4500000, pricing_type: "sekali_bayar", status: "Tersedia", target_users: "SD, SMP, SMA/SMK, pesantren, dan lembaga pendidikan nonformal",
    tech: ["HTML5", "JavaScript", "Supabase Auth", "Supabase Database", "Supabase Storage"],
    is_featured: true, view_count: 623, demo: true,
    created_at: "2025-04-08T09:00:00Z", updated_at: "2026-05-05T10:00:00Z"
  },
  {
    id: "app-8", category_id: "cat-8", name: "Sistem Filantropi dan Donasi", slug: "sistem-filantropi-donasi",
    short_description: "Kelola donatur, program, kampanye penggalangan dana, konfirmasi donasi, dan laporan transparansi untuk yayasan & organisasi.",
    full_description: "Sistem Filantropi dan Donasi membantu yayasan, masjid, dan organisasi sosial mengelola seluruh siklus penggalangan dana: database donatur, katalog program, kampanye online, pencatatan donasi masuk, hingga laporan pertanggungjawaban.\n\nDonasi dapat dikonfirmasi melalui unggah bukti transfer; sistem mencocokkan dengan kampanye terkait dan menerbitkan kwitansi digital. Progress kampanye tampil real-time untuk dipublikasikan.\n\nLaporan transparansi per program memudahkan yayasan melaporkan penyaluran dana kepada donatur dan pemangku kepentingan.",
    background: "Pencatatan donasi di buku kas dan grup WhatsApp membuat laporan penyaluran lambat dan rentan tidak akurat. Donatur juga kesulitan melihat progres program yang mereka dukung. Sistem ini menghadirkan satu alur data dari donasi masuk hingga laporan penyaluran.",
    benefits: ["Data donatur dan riwayat donasi terpusat", "Progres kampanye real-time dan dapat dipublikasikan", "Kwitansi digital otomatis", "Laporan penyaluran transparan per program", "Meningkatkan kepercayaan donatur"],
    thumbnail_url: "assets/img/thumbs/sistem-filantropi-donasi.svg",
    features: ["Database donatur & riwayat donasi", "Katalog program & kampanye", "Unggah bukti transfer & verifikasi", "Kwitansi digital", "Progress bar kampanye real-time", "Manajemen penyaluran dana", "Laporan transparansi", "Notifikasi ucapan terima kasih", "Multi-program & multi-rekening"],
    screenshots: ["assets/img/shots/sistem-filantropi-donasi-1.svg", "assets/img/shots/sistem-filantropi-donasi-2.svg"],
    demo_url: "", application_url: "",
    price: 0, pricing_type: "konsultasi", status: "Segera Hadir", target_users: "Yayasan, masjid, organisasi sosial, dan komunitas amal",
    tech: ["HTML5", "JavaScript", "Supabase Database", "Supabase Storage"],
    is_featured: false, view_count: 145, demo: true,
    created_at: "2026-03-01T09:00:00Z", updated_at: "2026-06-10T10:00:00Z"
  },
  {
    id: "app-9", category_id: "cat-5", name: "Sistem Administrasi Operator", slug: "sistem-administrasi-operator",
    short_description: "Digitalisasi tata usaha: surat masuk-keluar, disposisi, agenda harian, arsip digital, dan notulen rapat dalam satu aplikasi.",
    full_description: "Sistem Administrasi Operator mendigitalkan tata usaha perkantoran yang selama ini manual: pencatatan surat masuk dan keluar, disposisi pimpinan, agenda kegiatan, arsip dokumen digital, hingga notulen rapat.\n\nSetiap surat tercatat dengan nomor, tanggal, dan tujuan; disposisi mengalir ke pihak terkait dengan notifikasi. Arsip dapat dicari dalam hitungan detik berdasarkan kata kunci, kategori, atau periode.\n\nAplikasi ini sangat membantu operator sekolah, kantor desa, yayasan, dan perkantoran kecil yang ingin rapi tanpa membeli sistem mahal.",
    background: "Buku agenda surat dan arsip lemari membuat pencarian dokumen lama memakan waktu, dan disposisi sering tertunda karena tidak ada pemberitahuan. Sistem ini menghadirkan pencatatan digital sederhana yang cepat dipelajari oleh siapa pun.",
    benefits: ["Pencarian surat & dokumen dalam hitungan detik", "Disposisi mengalir cepat dengan notifikasi", "Arsip digital aman dan tersistem", "Agenda kegiatan terlihat oleh seluruh tim", "Notulen rapat mudah ditelusuri kembali"],
    thumbnail_url: "assets/img/thumbs/sistem-administrasi-operator.svg",
    features: ["Surat masuk & keluar bernomor otomatis", "Disposisi berjenjang + notifikasi", "Agenda kegiatan harian", "Arsip dokumen digital", "Pencarian cepat multi-filter", "Notulen rapat", "Template dokumen", "Statistik administrasi", "Backup data mudah"],
    screenshots: ["assets/img/shots/sistem-administrasi-operator-1.svg", "assets/img/shots/sistem-administrasi-operator-2.svg"],
    demo_url: "", application_url: "",
    price: 1950000, pricing_type: "sekali_bayar", status: "Tersedia", target_users: "Operator sekolah, kantor desa, yayasan, dan perkantoran",
    tech: ["HTML5", "JavaScript", "Supabase Database", "Supabase Storage"],
    is_featured: false, view_count: 267, demo: true,
    created_at: "2025-10-05T09:00:00Z", updated_at: "2026-03-18T10:00:00Z"
  },
  {
    id: "app-10", category_id: "cat-7", name: "Sistem Manajemen Inventaris", slug: "sistem-manajemen-inventaris",
    short_description: "Kelola aset dan stok: katalog barang, transaksi masuk-keluar, stok opname, peminjaman, dan label QR untuk inventarisasi.",
    full_description: "Sistem Manajemen Inventaris membantu usaha dan lembaga menginventarisasi seluruh aset dan stok secara digital: katalog barang dengan foto, kategori, dan lokasi penyimpanan; transaksi barang masuk dan keluar; hingga stok opname berkala.\n\nSetiap barang dapat diberi label QR untuk mempercepat audit. Modul peminjaman barang cocok untuk sekolah dan organisasi: siapa meminjam, kapan kembali, dan kondisi barang tercatat rapi.\n\nLaporan stok menampilkan barang menipis, barang tersendat, dan nilai aset — bahan penting untuk perencanaan pengadaan.",
    background: "Inventaris yang dicatat manual sering tidak sinkron dengan kondisi riil: barang hilang tanpa jejak, stok menipis baru sadar saat dibutuhkan, dan audit butuh waktu berhari-hari. Sistem ini membuat stok selalu terpantau dan audit jauh lebih cepat.",
    benefits: ["Stok selalu sinkron dengan transaksi riil", "Audit aset lebih cepat dengan label QR", "Pengadaan lebih tepat dari laporan stok", "Peminjaman barang jelas dan tertib", "Nilai aset organisasi terpantau"],
    thumbnail_url: "assets/img/thumbs/sistem-manajemen-inventaris.svg",
    features: ["Katalog barang + foto & lokasi", "Transaksi barang masuk & keluar", "Stok minimum & peringatan menipis", "Stok opname berkala", "Label QR per barang", "Modul peminjaman & pengembalian", "Laporan nilai aset", "Multi-gudang / multi-lokasi", "Ekspor laporan Excel/PDF"],
    screenshots: ["assets/img/shots/sistem-manajemen-inventaris-1.svg", "assets/img/shots/sistem-manajemen-inventaris-2.svg"],
    demo_url: "", application_url: "",
    price: 0, pricing_type: "konsultasi", status: "Tersedia", target_users: "UMKM, sekolah, yayasan, gudang, dan kantor",
    tech: ["HTML5", "JavaScript", "Supabase Database", "QR Generator"],
    is_featured: false, view_count: 231, demo: true,
    created_at: "2025-11-20T09:00:00Z", updated_at: "2026-04-22T10:00:00Z"
  }
);

window.DEMO_FAQS = [
  { id: "faq-1", question: "Bagaimana cara meminta demo aplikasi?", answer: "Klik tombol 'Coba Demo' pada aplikasi yang Anda minati, atau hubungi kami melalui WhatsApp. Tim kami akan menjadwalkan sesi demo online dan membantu Anda mencoba fitur utama aplikasi secara langsung.", is_active: true, created_at: "2025-06-01T08:00:00Z" },
  { id: "faq-2", question: "Apakah bisa dimodifikasi sesuai kebutuhan kami?", answer: "Bisa. Semua aplikasi pada katalog dapat dikustomisasi: penyesuaian fitur, alur kerja, laporan, hingga identitas brand lembaga Anda. Sampaikan kebutuhan Anda melalui formulir pemesanan dan kami akan memberikan penawaran.", is_active: true, created_at: "2025-06-01T08:05:00Z" },
  { id: "faq-3", question: "Berapa lama waktu pengembangan aplikasi custom?", answer: "Aplikasi berbasis modul yang sudah tersedia umumnya dapat digunakan dalam 1-3 minggu. Aplikasi custom tergantung kompleksitas kebutuhan, umumnya 3-8 minggu. Estimasi detail diberikan setelah sesi konsultasi awal.", is_active: true, created_at: "2025-06-01T08:10:00Z" },
  { id: "faq-4", question: "Apakah tersedia dukungan dan pemeliharaan setelah aplikasi selesai?", answer: "Ya. Kami menyediakan layanan maintenance: perbaikan bug, pembaruan kecil, backup, dan konsultasi penggunaan. Paket dukungan dapat dipilih sesuai kebutuhan dan dijelaskan saat penawaran.", is_active: true, created_at: "2025-06-01T08:15:00Z" },
  { id: "faq-5", question: "Apakah data kami aman?", answer: "Aplikasi dibangun di atas Supabase dengan Row Level Security, autentikasi berjenjang, dan enkripsi standar industri. Hak akses disesuaikan per peran sehingga data sensitif hanya dapat dilihat pihak yang berwenang.", is_active: true, created_at: "2025-06-01T08:20:00Z" }
];

window.DEMO_TESTIMONIALS = [
  { id: "testi-1", customer_name: "Ahmad Fauzi", organization: "SMK Nusantara (data contoh)", content: "Sistem Manajemen Sekolah memangkas pekerjaan operator kami. Rekap SPP yang biasanya butuh berhari-hari kini selesai dalam satu sore. Orang tua juga lebih mudah memantau tagihan.", rating: 5, is_active: true, created_at: "2025-09-10T08:00:00Z" },
  { id: "testi-2", customer_name: "Rina Kartika", organization: "CV Berkah Jaya (data contoh)", content: "CRM dan Sistem Pendaftaran membuat tim sales jadi disiplin. Semua leads tercatat dan follow-up terjadwal. Dalam dua bulan konversi kami naik cukup signifikan.", rating: 5, is_active: true, created_at: "2025-11-02T08:00:00Z" },
  { id: "testi-3", customer_name: "Drs. Hendra Wijaya", organization: "Yayasan Cerdas Bangsa (data contoh)", content: "Proses konsultasinya cepat dan jelas. Aplikasi kepegawaian disesuaikan dengan struktur yayasan kami, dan tim selalu responsif ketika kami butuh bantuan.", rating: 4, is_active: true, created_at: "2026-01-20T08:00:00Z" }
];

window.DEMO_POSTS = [
  {
    id: "post-1", title: "5 Tanda Administrasi Kantor Anda Butuh Digitalisasi", slug: "tanda-administrasi-butuh-digitalisasi",
    excerpt: "Surat bertumpuk, arsip sulit dicari, dan rekap yang selalu terlambat? Ini lima tanda waktunya memindahkan administrasi kantor Anda ke sistem digital.",
    content: "Administrasi manual masih menjadi kenyataan di banyak kantor, sekolah, dan yayasan. Awalnya terasa biasa saja, tetapi lama-kelamaan menimbulkan kerja dua kali dan data yang tidak konsisten. Berikut lima tanda paling umum.\n\n1. Pencarian dokumen memakan waktu lama. Jika mencari surat tahun lalu butuh membuka tumpukan map, itu sinyal kuat arsip digital dibutuhkan. Sistem arsip digital dapat mencari berdasarkan kata kunci, kategori, dan periode dalam hitungan detik.\n\n2. Rekap selalu terlambat. Ketika laporan bulanan harus menunggu penjumlahan manual dari banyak file, kesalahan hampir pasti terjadi. Sistem yang baik menyusun rekap otomatis dari transaksi harian.\n\n3. Data tidak sinkron antar petugas. Dua orang mencatat transaksi yang sama di file berbeda dan angkanya berbeda. Satu sumber data adalah prinsip utama digitalisasi.\n\n4. Disposisi dan tindak lanjut tersendat. Surat menunggu di meja pimpinan tanpa pemberitahuan. Dengan sistem, disposisi mengalir beserta notifikasi.\n\n5. Riwayat sulit ditelusuri saat audit. Jejak digital membuat setiap perubahan tercatat: siapa, kapan, dan apa yang berubah.\n\nJika tiga dari lima tanda di atas terjadi di tempat Anda, mulailah dari digitalisasi satu alur kerja terlebih dahulu, misalnya surat menyurat, lalu perluas bertahap. Aplikasiku.nd menyediakan Sistem Administrasi Operator untuk kebutuhan tersebut — silakan hubungi kami untuk konsultasi gratis.",
    cover_url: "assets/img/thumbs/sistem-administrasi-operator.svg", is_published: true, published_at: "2026-02-10T08:00:00Z", created_at: "2026-02-10T08:00:00Z"
  },
  {
    id: "post-2", title: "Memilih Aplikasi HRMS untuk Sekolah dan Yayasan", slug: "memilih-aplikasi-hrms-sekolah-yayasan",
    excerpt: "HRMS bukan hanya untuk korporasi. Sekolah dan yayasan pun butuh sistem kepegawaian. Ini panduan memilih fitur yang benar-benar terpakai.",
    content: "Banyak pengelola lembaga pendidikan dan sosial menganggap sistem kepegawaian (HRMS) adalah urusan perusahaan besar. Kenyataannya, sekolah dan yayasan menghadapi persoalan yang sama: rekap kehadiran, pengajuan cuti, kontrak, hingga penilaian kinerja.\n\nPertama, pilih fitur yang menjawab masalah nyata. Absensi dan cuti adalah dua fitur paling cepat berdampak karena keduanya langsung mengurangi hitung manual di akhir bulan.\n\nKedua, pastikan alurnya berjenjang. Pengajuan cuti sebaiknya mengalir dari pegawai ke atasan langsung, lalu ke HR, dengan notifikasi di setiap tahap. Alur yang berjenjang membuat tanggung jawab jelas.\n\nKetiga, perhatikan hak akses. Data kepegawaian bersifat sensitif. Sistem harus mendukung peran berbeda: admin HR melihat semua, atasan melihat bawahan, pegawai hanya melihat data dirinya.\n\nKeempat, pikirkan keterhubungan dengan penggajian. Rekap absensi yang bisa diekspor ke sistem payroll akan menghemat banyak waktu setiap bulan.\n\nTerakhir, pilih sistem yang mudah dipelajari. Fitur canggih tidak berguna jika petugas tidak mau memakainya. Minta demo sebelum memutuskan — Aplikasiku.nd menyediakan HR Management System dan HR Knowledge Center yang dapat disesuaikan untuk sekolah maupun yayasan.",
    cover_url: "assets/img/thumbs/hr-management-system.svg", is_published: true, published_at: "2026-03-15T08:00:00Z", created_at: "2026-03-15T08:00:00Z"
  },
  {
    id: "post-3", title: "Apa Itu CRM dan Mengapa Bisnis Kecil Juga Membutuhkannya", slug: "apa-itu-crm-untuk-bisnis-kecil",
    excerpt: "CRM sering dianggap terlalu besar untuk usaha kecil. Padahal prinsipnya sederhana: jangan sampai calon pelanggan terlupakan. Ini penjelasan singkatnya.",
    content: "CRM (Customer Relationship Management) adalah cara terstruktur untuk mengelola hubungan dengan calon dan pelanggan. Untuk usaha kecil, inti persoalannya biasanya sederhana: leads masuk lewat chat pribadi, dicatat di mana saja, dan banyak yang lupa ditindaklanjuti.\n\nCRM bekerja dengan tiga blok dasar. Pertama, tempat tunggal untuk menyimpan setiap calon pelanggan beserta sumbernya — dari formulir website, pendaftaran online, hingga input manual.\n\nKedua, alur tahapan (pipeline) yang jelas: baru, dihubungi, negosiasi, deal, atau tidak lanjut. Dengan pipeline, setiap orang tahu posisi setiap leads dan siapa yang harus menghubungi berikutnya.\n\nKetiga, pengingat follow-up. Penelitian praktik penjualan menunjukkan sebagian besar konversi terjadi pada tindak lanjut kedua atau ketiga — bukan pada kontak pertama. Tanpa pengingat, itu yang paling sering hilang.\n\nUntuk lembaga pendidikan dan layanan, CRM juga berguna sebagai sistem pendaftaran: pendaftar masuk sebagai leads, dikonfirmasi otomatis via WhatsApp, dan kuotanya terpantau.\n\nMulailah sederhana: satu tim, satu pipeline, disiplin mencatat. Aplikasiku.nd menyediakan CRM dan Sistem Pendaftaran yang dapat dicoba melalui sesi demo — hubungi kami untuk jadwalnya.",
    cover_url: "assets/img/thumbs/crm-sistem-pendaftaran.svg", is_published: true, published_at: "2026-04-20T08:00:00Z", created_at: "2026-04-20T08:00:00Z"
  }
];

/* Rakit objek data demo lengkap */
window.DEMO_DATA = {
  categories: window.DEMO_CATEGORIES,
  applications: window.DEMO_APPLICATIONS,
  inquiries: [],
  follow_ups: [],
  testimonials: window.DEMO_TESTIMONIALS,
  website_settings: Object.entries(window.DEMO_SETTINGS).map(function (kv, i) {
    return { id: "set-" + i, setting_key: kv[0], setting_value: kv[1], updated_at: "2025-06-01T08:00:00Z" };
  }),
  faqs: window.DEMO_FAQS,
  posts: window.DEMO_POSTS
};
