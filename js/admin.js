/* ============================================================
   APLIKASIKU.ND — js/admin.js
   Dashboard admin: auth guard, CRUD aplikasi/kategori/prospek,
   konten, testimoni, FAQ, pengaturan website, blog.
   ============================================================ */

(function () {
  "use strict";
  var UI = window.__UI;
  var H = window.__helpers;
  var DB = window.DB;
  var Auth = window.Auth;
  var MODE = window.APLIKASIKU_MODE || "demo";
  var user = null;
  var state = {};
  var esc = UI.esc;

  /* =================== Guard & boot =================== */
  Auth.getSession().then(function (session) {
    if (!session) { location.href = "login.html"; return; }
    user = session.user;
    if (Auth.isAdmin) Auth.isAdmin().then(function (ok) { if (!ok && MODE === "supabase") { location.href = "login.html"; return; } boot(); });
    else boot();
  });
  Auth.onChange(function (session) {
    if (!session && location.pathname.indexOf("admin.html") > -1) location.href = "login.html";
  });

  var SECTIONS = {
    dashboard: { title: "Dashboard Utama", icon: "fa-gauge-high", render: renderDashboard },
    aplikasi: { title: "Manajemen Aplikasi", icon: "fa-cubes", render: renderAplikasi },
    kategori: { title: "Manajemen Kategori", icon: "fa-tags", render: renderKategori },
    prospek: { title: "Manajemen Prospek", icon: "fa-user-tie", render: renderProspek },
    konten: { title: "Manajemen Konten", icon: "fa-pen-to-square", render: renderKonten },
    blog: { title: "Artikel / Blog", icon: "fa-newspaper", render: renderBlog },
    pengaturan: { title: "Pengaturan Website", icon: "fa-gear", render: renderPengaturan }
  };
  var STATUS_PROSPEK = ["Baru", "Dihubungi", "Negosiasi", "Deal", "Tidak Lanjut"];
  var STATUS_APP = ["Tersedia", "Dalam Pengembangan", "Segera Hadir"];
  var PRICING = { gratis: "Gratis", sekali_bayar: "Sekali Bayar", langganan: "Langganan / Bulanan", konsultasi: "Hubungi untuk Penawaran" };

  function boot() {
    DB.getSettings().then(function (s) { Object.assign(state, s || {}); }).catch(function () {});
    buildSidebar();
    buildTopbar();
    window.addEventListener("hashchange", route);
    route();
    document.getElementById("a-logout").addEventListener("click", function () {
      UI.confirmModal({ title: "Keluar?", message: "Anda akan keluar dari dashboard admin.", yesLabel: "Keluar", danger: true }).then(function (ok) {
        if (ok) Auth.signOut().then(function () { location.href = "login.html"; });
      });
    });
  }
  function buildSidebar() {
    var el = document.getElementById("a-nav");
    var items = Object.keys(SECTIONS).map(function (k) {
      return '<button class="a-nav__item" data-sec="' + k + '"><i class="fa-solid ' + SECTIONS[k].icon + '"></i>' + SECTIONS[k].title + "</button>";
    }).join("");
    el.innerHTML = '<div class="a-nav__label">Menu Admin</div>' + items;
    el.addEventListener("click", function (e) {
      var b = e.target.closest(".a-nav__item");
      if (b) location.hash = "#/" + b.dataset.sec;
    });
    document.getElementById("a-user-email").textContent = user.email || "admin";
    document.getElementById("a-user-ava").textContent = (user.email || "A")[0].toUpperCase();
    if (MODE === "demo") {
      var d = document.getElementById("a-demo-tag");
      if (d) d.style.display = "inline-flex";
    }
    var burger = document.getElementById("a-burger");
    var side = document.getElementById("a-side");
    if (burger) burger.addEventListener("click", function () { side.classList.toggle("is-open"); });
    document.addEventListener("click", function (e) {
      if (side.classList.contains("is-open") && !side.contains(e.target) && e.target !== burger && !burger.contains(e.target)) side.classList.remove("is-open");
    });
  }
  function buildTopbar() {
    var link = document.getElementById("a-view-site");
    if (link) link.href = "index.html";
  }
  function route() {
    var key = (location.hash.replace("#/", "") || "dashboard").split("?")[0];
    if (!SECTIONS[key]) key = "dashboard";
    document.querySelectorAll(".a-nav__item").forEach(function (b) { b.classList.toggle("is-active", b.dataset.sec === key); });
    document.querySelectorAll(".a-section").forEach(function (s) { s.classList.toggle("is-active", s.id === "sec-" + key); });
    document.getElementById("a-title").textContent = SECTIONS[key].title;
    SECTIONS[key].render();
  }

  /* =================== Komponen umum admin =================== */
  function openFormModal(opts) {
    var ov = document.createElement("div");
    ov.className = "modal-overlay is-open";
    ov.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' +
      '<div class="modal__head"><h3>' + esc(opts.title) + '</h3><button class="modal__close" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button></div>' +
      '<div class="modal__body"><form id="a-form" class="form-grid">' + opts.body + "</form></div>" +
      '<div class="modal__foot"><button class="btn btn--outline" data-x>Batal</button>' +
      '<button class="btn btn--primary" data-save><i class="fa-solid fa-floppy-disk"></i> ' + esc(opts.saveLabel || "Simpan") + "</button></div></div>";
    document.body.appendChild(ov);
    var form = ov.querySelector("#a-form");
    ov.querySelector(".modal__close").addEventListener("click", function () { ov.remove(); });
    ov.querySelector("[data-x]").addEventListener("click", function () { ov.remove(); });
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    if (opts.onMount) opts.onMount(form, ov);
    ov.querySelector("[data-save]").addEventListener("click", function () {
      var btn = this;
      opts.onSave(form, function (done) {
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan';
        if (done !== false) ov.remove();
      }, btn);
    });
    return ov;
  }
  function field(label, inner, full, hint) {
    return '<div class="field' + (full ? " field--full" : "") + '"><label>' + label + "</label>" + inner + (hint ? '<span class="hint">' + hint + "</span>" : "") + "</div>";
  }
  function selectHTML(id, options, value, req) {
    return '<select id="' + id + '"' + (req ? " required" : "") + ">" + options.map(function (o) {
      var v = typeof o === "string" ? o : o.v; var t = typeof o === "string" ? o : o.t;
      return '<option value="' + esc(v) + '"' + (String(value) === String(v) ? " selected" : "") + ">" + esc(t) + "</option>";
    }).join("") + "</select>";
  }
  function ta(id, value, rows, ph) {
    return '<textarea id="' + id + '" rows="' + (rows || 3) + '" placeholder="' + esc(ph || "") + '">' + esc(value || "") + "</textarea>";
  }
  function inp(id, value, type, ph, req) {
    return '<input id="' + id + '" type="' + (type || "text") + '" value="' + esc(value || "") + '" placeholder="' + esc(ph || "") + '"' + (req ? " required" : "") + ">";
  }
  function lines(arr) { return (arr || []).join("\n"); }
  function toLines(v) {
    return String(v || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function setBusy(btn, on, text) {
    btn.disabled = on;
    btn.innerHTML = on ? '<i class="fa-solid fa-spinner fa-spin"></i> ' + text : btn.dataset.label;
  }
  function errToast(e) { UI.toast("error", "Terjadi kesalahan", String((e && e.message) || e)); }

  /* =================== DASHBOARD =================== */
  function renderDashboard() {
    var el = document.getElementById("sec-dashboard");
    el.innerHTML = '<div class="stat-tiles" id="d-tiles">' + tilesSkeleton(4) + "</div>" +
      '<div class="a-grid-2">' +
      '<div class="a-panel"><div class="a-panel__head"><h2>Aplikasi Terbaru</h2><a class="btn btn--outline btn--sm" href="#/aplikasi">Kelola</a></div><div class="table-wrap" id="d-apps"></div></div>' +
      '<div class="a-panel"><div class="a-panel__head"><h2>Prospek Terbaru</h2><a class="btn btn--outline btn--sm" href="#/prospek">Kelola</a></div><div class="a-panel__body" id="d-inq"></div></div>' +
      "</div>" +
      '<div class="a-panel"><div class="a-panel__head"><h2>Aktivitas Terbaru</h2></div><div class="a-panel__body"><ul class="a-activity" id="d-act"></ul></div></div>';
    Promise.all([DB.getApplications({ limit: 100 }), DB.getCategories(), DB.getInquiries()]).then(function (res) {
      var apps = res[0].items || res[0], cats = res[1], inq = res[2];
      var deal = inq.filter(function (i) { return i.status === "Deal"; }).length;
      document.getElementById("d-tiles").innerHTML =
        tile("fa-cubes", apps.length, "Total Aplikasi") +
        tile("fa-tags", cats.length, "Total Kategori", "orange") +
        tile("fa-user-tie", inq.length, "Permintaan Konsultasi", "purple") +
        tile("fa-handshake", deal, "Prospek Deal", "green");
      var amap = {}; cats.forEach(function (c) { amap[c.id] = c.name.split("(")[0].trim(); });
      document.getElementById("d-apps").innerHTML = '<table class="table"><thead><tr><th>Aplikasi</th><th>Kategori</th><th>Status</th><th>Dilihat</th></tr></thead><tbody>' +
        apps.slice(0, 5).map(function (a) {
          return "<tr><td>" + UI.imgTag(a.thumbnail_url, "thumb " + a.name, "t-thumb") + " <span class='t-strong'>" + esc(a.name) + "</span></td><td>" + esc(amap[a.category_id] || "-") + "</td><td>" + UI.badgeStatus(a.status) + "</td><td>" + (a.view_count || 0) + "</td></tr>";
        }).join("") + "</tbody></table>";
      document.getElementById("d-inq").innerHTML = inq.length ? inq.slice(0, 5).map(function (i) {
        return '<div style="padding:12px 0;border-bottom:1px dashed var(--border);display:flex;gap:12px;align-items:flex-start">' +
          '<div style="flex:1"><b class="t-strong" style="font-size:.9rem">' + esc(i.full_name) + "</b> — <span class='muted' style='font-size:.84rem'>" + esc(i.organization || "-") + "</span>" +
          '<div class="muted" style="font-size:.82rem">' + esc(i.application_name || i.inquiry_type || "-") + " · " + UI.fmtDate(i.created_at) + "</div></div>" +
          '<span class="tag tag--' + tagClass(i.status) + '">' + esc(i.status) + "</span></div>";
      }).join("") : emptyAdmin("Belum ada permintaan masuk", "fa-inbox");
      var acts = [];
      (inq.slice(0, 4)).forEach(function (i) { acts.push({ t: '<b>' + esc(i.full_name) + "</b> mengirim permintaan " + esc(i.application_name || ""), d: i.created_at }); });
      (apps.slice(0, 4)).forEach(function (a) { acts.push({ t: "Aplikasi <b>" + esc(a.name) + "</b> " + (a.updated_at && a.updated_at !== a.created_at ? "diperbarui" : "ditambahkan"), d: a.updated_at || a.created_at }); });
      acts.sort(function (x, y) { return new Date(y.d) - new Date(x.d); });
      document.getElementById("d-act").innerHTML = acts.slice(0, 6).map(function (a) {
        return '<li><span class="a-activity__dot"></span><span>' + a.t + "</span><time>" + UI.fmtDate(a.d, true) + "</time></li>";
      }).join("") || emptyAdmin("Belum ada aktivitas", "fa-clock");
    }).catch(errToast);

    function tile(icon, val, label, color) {
      return '<div class="stat-tile"><div class="stat-tile__icon' + (color ? " stat-tile__icon--" + color : "") + '"><i class="fa-solid ' + icon + '"></i></div><div><b>' + val.toLocaleString("id-ID") + "</b><span>" + label + "</span></div></div>";
    }
    function tilesSkeleton(n) {
      var o = ""; for (var i = 0; i < n; i++) o += '<div class="skeleton" style="height:94px"></div>'; return o;
    }
    function emptyAdmin(t, icon) { return '<div class="a-empty"><i class="fa-solid ' + icon + '"></i>' + esc(t) + "</div>"; }
    function tagClass(s) {
      return { "Baru": "baru", "Dihubungi": "dihubungi", "Negosiasi": "negosiasi", "Deal": "deal", "Tidak Lanjut": "tidak" }[s] || "baru";
    }
  }

  /* =================== KATEGORI =================== */
  function renderKategori() {
    var el = document.getElementById("sec-kategori");
    el.innerHTML = panel("Kategori Aplikasi", '<button class="btn btn--primary btn--sm" id="k-add"><i class="fa-solid fa-plus"></i> Tambah Kategori</button>',
      '<div class="table-wrap" id="k-table"></div>');
    document.getElementById("k-add").addEventListener("click", function () { kategoriModal(null); });
    loadKategori();
    function loadKategori() {
      DB.getCategories().then(function (cats) {
        document.getElementById("k-table").innerHTML = '<table class="table"><thead><tr><th>Nama Kategori</th><th>Slug</th><th>Icon</th><th>Jml Aplikasi</th><th style="width:120px">Aksi</th></tr></thead><tbody>' +
          cats.map(function (c) {
            return "<tr><td class='t-strong'>" + esc(c.name) + "</td><td><code>" + esc(c.slug) + "</code></td><td><i class='" + esc(c.icon || "fa-solid fa-tag") + "'></i></td><td>" + (c.app_count || 0) + "</td>" +
              '<td><div class="t-actions"><button class="icon-btn" data-edit="' + c.id + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
              '<button class="icon-btn icon-btn--danger" data-del="' + c.id + '" title="Hapus"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
          }).join("") + "</tbody></table>" +
          (!cats.length ? '<div class="a-empty"><i class="fa-solid fa-tags"></i>Belum ada kategori</div>' : "");
        el.querySelectorAll("[data-edit]").forEach(function (b) {
          b.addEventListener("click", function () { kategoriModal(cats.find(function (c) { return c.id === b.dataset.edit; })); });
        });
        el.querySelectorAll("[data-del]").forEach(function (b) {
          b.addEventListener("click", function () {
            var c = cats.find(function (x) { return x.id === b.dataset.del; });
            if ((c.app_count || 0) > 0) return UI.toast("warning", "Tidak dapat dihapus", "Kategori masih memiliki " + c.app_count + " aplikasi. Pindahkan atau hapus aplikasinya dahulu.");
            UI.confirmModal({ title: "Hapus kategori?", message: 'Kategori "' + c.name + '" akan dihapus permanen.', yesLabel: "Hapus", danger: true }).then(function (ok) {
              if (!ok) return;
              DB.deleteCategory(c.id).then(function () { UI.toast("success", "Kategori dihapus", c.name); loadKategori(); }).catch(errToast);
            });
          });
        });
      }).catch(errToast);
    }
    function kategoriModal(cat) {
      openFormModal({
        title: cat ? "Edit Kategori" : "Tambah Kategori",
        body: field('Nama Kategori *', inp("c-name", cat && cat.name, "text", "cth: Sistem Kesehatan", true)) +
          field('Deskripsi', ta("c-desc", cat && cat.description, 2, "Deskripsi singkat kategori")) +
          field('Icon Font Awesome', inp("c-icon", cat ? cat.icon : "fa-solid fa-layer-group", "text", "fa-solid fa-heart-pulse"), false, "Gunakan class FA6 gratis, cth: fa-solid fa-store"),
        onMount: function (form) {
          var prev = document.createElement("div");
          prev.className = "field--full"; prev.style.cssText = "font-size:1.4rem;color:var(--blue)";
          form.appendChild(prev);
          var ic = form.querySelector("#c-icon");
          var upd = function () { prev.innerHTML = '<i class="' + esc(ic.value || "fa-solid fa-layer-group") + '"></i>'; };
          ic.addEventListener("input", upd); upd();
        },
        onSave: function (form, done) {
          var name = form.querySelector("#c-name").value.trim();
          if (!name) return UI.toast("error", "Nama wajib diisi");
          var row = {
            id: cat ? cat.id : null, name: name,
            slug: cat ? cat.slug : H.slugify(name),
            description: form.querySelector("#c-desc").value.trim(),
            icon: form.querySelector("#c-icon").value.trim() || "fa-solid fa-layer-group"
          };
          DB.upsertCategory(row).then(function () {
            UI.toast("success", cat ? "Kategori diperbarui" : "Kategori ditambahkan", name);
            done(); loadKategori();
          }).catch(function (e) { errToast(e); done(false); });
        }
      });
    }
  }



  /* =================== APLIKASI =================== */
  var APP_STATE = { search: "", cats: [] };

  function renderAplikasi() {
    var el = document.getElementById("sec-aplikasi");
    el.innerHTML = panel("Daftar Aplikasi", '<div class="a-toolbar">' +
      '<div class="a-search"><i class="fa-solid fa-magnifying-glass"></i><input id="ap-search" placeholder="Cari nama aplikasi..."></div>' +
      '<button class="btn btn--primary btn--sm" id="ap-add"><i class="fa-solid fa-plus"></i> Tambah Aplikasi</button></div>',
      '<div class="table-wrap" id="ap-table"></div>');
    document.getElementById("ap-add").addEventListener("click", function () { aplikasiModal(null); });
    var deb;
    document.getElementById("ap-search").addEventListener("input", function (e) {
      clearTimeout(deb);
      var v = e.target.value.trim();
      deb = setTimeout(function () { APP_STATE.search = v; loadAplikasi(); }, 300);
    });
    DB.getCategories().then(function (c) { APP_STATE.cats = c; });
    loadAplikasi();
    function loadAplikasi() {
      DB.getApplications({ limit: 500 }).then(function (r) {
        var apps = r.items || r;
        var q = APP_STATE.search.toLowerCase();
        if (q) apps = apps.filter(function (a) { return (a.name || "").toLowerCase().indexOf(q) > -1; });
        var amap = {}; APP_STATE.cats.forEach(function (c) { amap[c.id] = c.name.split("(")[0].trim(); });
        DB.getCategories().then(function (cats) {
          cats.forEach(function (c) { amap[c.id] = c.name.split("(")[0].trim(); });
          document.getElementById("ap-table").innerHTML = '<table class="table"><thead><tr><th>Aplikasi</th><th>Kategori</th><th>Harga</th><th>Status</th><th>Unggulan</th><th style="width:130px">Aksi</th></tr></thead><tbody>' +
            apps.map(function (a) {
              var p = UI.priceInfo(a);
              return "<tr><td>" + UI.imgTag(a.thumbnail_url, "thumb " + a.name, "t-thumb") + " <span class='t-strong'>" + esc(a.name) + "</span></td>" +
                "<td>" + esc(amap[a.category_id] || "-") + "</td>" +
                "<td>" + p.main + "<div class='muted' style='font-size:.72rem'>" + esc(PRICING[a.pricing_type] || "-") + "</div></td>" +
                "<td>" + UI.badgeStatus(a.status) + "</td>" +
                '<td><label class="switch"><input type="checkbox" data-feat="' + a.id + '"' + (a.is_featured ? " checked" : "") + "><i></i></label></td>" +
                '<td><div class="t-actions"><button class="icon-btn" data-edit="' + a.id + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                '<button class="icon-btn" data-view="' + a.slug + '" title="Lihat publik"><i class="fa-solid fa-eye"></i></button>' +
                '<button class="icon-btn icon-btn--danger" data-del="' + a.id + '" title="Hapus"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
            }).join("") + "</tbody></table>" +
            (!apps.length ? '<div class="a-empty"><i class="fa-solid fa-cubes"></i>Belum ada aplikasi. Klik "Tambah Aplikasi".</div>' : "");
          el.querySelectorAll("[data-edit]").forEach(function (b) {
            b.addEventListener("click", function () { aplikasiModal(apps.find(function (a) { return a.id === b.dataset.edit; })); });
          });
          el.querySelectorAll("[data-view]").forEach(function (b) {
            b.addEventListener("click", function () { window.open("detail.html?id=" + b.dataset.view, "_blank"); });
          });
          el.querySelectorAll("[data-feat]").forEach(function (cb) {
            cb.addEventListener("change", function () {
              var a = apps.find(function (x) { return x.id === cb.dataset.feat; });
              DB.upsertApplication({ id: a.id, is_featured: cb.checked }).then(function () {
                UI.toast("success", cb.checked ? "Ditandai unggulan" : "Diturunkan dari unggulan", a.name);
              }).catch(errToast);
            });
          });
          el.querySelectorAll("[data-del]").forEach(function (b) {
            b.addEventListener("click", function () {
              var a = apps.find(function (x) { return x.id === b.dataset.del; });
              UI.confirmModal({ title: "Hapus aplikasi?", message: '"' + a.name + '" akan dihapus permanen dari katalog.', yesLabel: "Hapus", danger: true }).then(function (ok) {
                if (!ok) return;
                DB.deleteApplication(a.id).then(function () { UI.toast("success", "Aplikasi dihapus", a.name); loadAplikasi(); }).catch(errToast);
              });
            });
          });
        });
      }).catch(errToast);
    }
  }

  function aplikasiModal(app) {
    var catOpts = APP_STATE.cats.map(function (c) { return { v: c.id, t: c.name }; });
    openFormModal({
      title: app ? "Edit Aplikasi" : "Tambah Aplikasi",
      body:
        field('Nama Aplikasi *', inp("f-name", app && app.name, "text", "cth: Sistem Manajemen Sekolah", true)) +
        field('Kategori *', selectHTML("f-cat", catOpts, app && app.category_id), false, "") +
        field('Status', selectHTML("f-status", STATUS_APP, app ? app.status : "Tersedia")) +
        field('Tipe Harga', selectHTML("f-pricing", Object.keys(PRICING).map(function (k) { return { v: k, t: PRICING[k] }; }), app ? app.pricing_type : "konsultasi")) +
        field('Harga (Rp, isi 0 jika konsultasi/gratis)', inp("f-price", app ? app.price : 0, "number", "3500000")) +
        field('Thumbnail — URL', inp("f-thumb", app && app.thumbnail_url, "text", "https://... atau hasil upload")) +
        field('Thumbnail — Upload', '<div class="upload-row"><label class="file-label"><input type="file" id="f-thumb-file" accept="image/*"><i class="fa-solid fa-upload"></i> Pilih Gambar</label><img id="f-thumb-prev" class="upload-preview" alt="preview"></div>', true) +
        field('Deskripsi Singkat *', ta("f-short", app && app.short_description, 2, "1-2 kalimat untuk kartu katalog"), true) +
        field('Deskripsi Lengkap *', ta("f-full", app && app.full_description, 6, "Beberapa paragraf. Pisahkan paragraf dengan baris kosong."), true) +
        field('Latar Belakang Kebutuhan', ta("f-bg", app && app.background, 3, "Mengapa aplikasi ini dibuat?"), true) +
        field('Manfaat (satu per baris)', ta("f-benefits", lines(app && app.benefits), 4, "Manfaat 1\nManfaat 2"), true) +
        field('Fitur Utama * (satu per baris)', ta("f-features", lines(app && app.features), 6, "Fitur 1\nFitur 2"), true) +
        field('Screenshot (satu URL per baris)', ta("f-shots", lines(app && app.screenshots), 3, "https://..."), true) +
        field('Screenshot — Upload (bisa lebih dari satu)', '<label class="file-label"><input type="file" id="f-shots-file" accept="image/*" multiple><i class="fa-solid fa-images"></i> Pilih Gambar</label><div class="up-list" id="f-shots-list"></div>', true) +
        field('Link Demo (boleh kosong)', inp("f-demo", app && app.demo_url, "url", "https://demo...")) +
        field('Link Aplikasi Utama (boleh kosong)', inp("f-appurl", app && app.application_url, "url", "https://...")) +
        field('Link Video Demo / YouTube (opsional)', inp("f-video", app && app.video_url, "url", "https://youtube.com/watch?v=...")) +
        field('Target Pengguna', inp("f-target", app && app.target_users, "text", "cth: Sekolah, yayasan, UMKM"), true) +
        field('Teknologi (satu per baris)', ta("f-tech", lines(app && app.tech), 3, "HTML5\nSupabase"), true) +
        field('Tandai sebagai Aplikasi Unggulan', '<label class="switch"><input type="checkbox" id="f-featured"' + (app && app.is_featured ? " checked" : "") + '><i></i></label>', true) +
        field('Tandai sebagai Data Contoh (label "Contoh" pada kartu)', '<label class="switch"><input type="checkbox" id="f-demo"' + (app && app.demo ? " checked" : "") + '><i></i></label>', true),
      onMount: function (form) {
        var prev = form.querySelector("#f-thumb-prev");
        var syncPrev = function () { var u = form.querySelector("#f-thumb").value.trim(); if (u) prev.src = u; };
        form.querySelector("#f-thumb").addEventListener("change", syncPrev);
        if (app && app.thumbnail_url) { prev.src = app.thumbnail_url; }
        prev.onerror = function () { prev.removeAttribute("src"); };
        form.querySelector("#f-thumb-file").addEventListener("change", function () {
          var file = this.files[0]; if (!file) return;
          setBusy(null, false, "");
          uploadOne(file, function (url) {
            form.querySelector("#f-thumb").value = url;
            prev.src = url;
            UI.toast("success", "Thumbnail terunggah", MODE === "demo" ? "Demo: tersimpan sementara di browser." : url.slice(0, 60) + "...");
          });
        });
        var shotsTA = form.querySelector("#f-shots");
        form.querySelector("#f-shots-file").addEventListener("change", function () {
          var files = Array.from(this.files); if (!files.length) return;
          uploadMany(files, function (urls) {
            shotsTA.value = (shotsTA.value.trim() ? shotsTA.value.trim() + "\n" : "") + urls.join("\n");
            renderShotList();
            UI.toast("success", urls.length + " screenshot terunggah");
          });
        });
        function renderShotList() {
          var arr = toLines(shotsTA.value);
          form.querySelector("#f-shots-list").innerHTML = arr.map(function (u, i) {
            return '<div class="up-item"><i class="fa-solid fa-circle-check"></i><span>' + esc(u.length > 48 ? u.slice(0, 48) + "..." : u) + '</span><button type="button" data-rm="' + i + '"><i class="fa-solid fa-xmark"></i></button></div>';
          }).join("");
          form.querySelectorAll("[data-rm]").forEach(function (b) {
            b.addEventListener("click", function () {
              var arr2 = toLines(shotsTA.value); arr2.splice(Number(b.dataset.rm), 1); shotsTA.value = arr2.join("\n"); renderShotList();
            });
          });
        }
        renderShotList();
        function uploadOne(file, cb) {
          DB.uploadImage(file, "thumbnails").then(cb).catch(function (e) { UI.toast("error", "Upload gagal", String(e.message || e)); });
        }
        function uploadMany(files, cb) {
          var urls = [], done = 0;
          files.forEach(function (f) {
            DB.uploadImage(f, "screenshots").then(function (u) {
              urls.push(u); if (++done === files.length) cb(urls);
            }).catch(function (e) { if (++done === files.length && urls.length) cb(urls); else if (done === files.length) UI.toast("error", "Upload gagal", String(e.message || e)); });
          });
        }
      },
      onSave: function (form, done) {
        var name = form.querySelector("#f-name").value.trim();
        var cat = form.querySelector("#f-cat").value;
        var short = form.querySelector("#f-short").value.trim();
        var full = form.querySelector("#f-full").value.trim();
        var feats = toLines(form.querySelector("#f-features").value);
        if (!name || !cat || !short || !full || !feats.length) {
          UI.toast("error", "Data belum lengkap", "Nama, kategori, deskripsi, dan minimal satu fitur wajib diisi.");
          return done(false);
        }
        var row = {
          id: app ? app.id : null, name: name, slug: app ? app.slug : H.slugify(name),
          category_id: cat, short_description: short, full_description: full,
          background: form.querySelector("#f-bg").value.trim(),
          benefits: toLines(form.querySelector("#f-benefits").value),
          features: feats,
          thumbnail_url: form.querySelector("#f-thumb").value.trim(),
          screenshots: toLines(form.querySelector("#f-shots").value),
          demo_url: form.querySelector("#f-demo").value.trim(),
          application_url: form.querySelector("#f-appurl").value.trim(),
          video_url: form.querySelector("#f-video").value.trim(),
          price: Number(form.querySelector("#f-price").value) || 0,
          pricing_type: form.querySelector("#f-pricing").value,
          status: form.querySelector("#f-status").value,
          target_users: form.querySelector("#f-target").value.trim(),
          tech: toLines(form.querySelector("#f-tech").value),
          is_featured: form.querySelector("#f-featured").checked,
          demo: form.querySelector("#f-demo").checked
        };
        DB.upsertApplication(row).then(function () {
          UI.toast("success", app ? "Aplikasi diperbarui" : "Aplikasi ditambahkan", name);
          done(); renderAplikasi();
        }).catch(function (e) { errToast(e); done(false); });
      }
    });
  }
  /* =================== PROSPEK =================== */
  var PROSPEK_STATE = { list: [], search: "", status: "" };

  function renderProspek() {
    var el = document.getElementById("sec-prospek");
    el.innerHTML = panel("Permintaan & Prospek Pelanggan",
      '<div class="a-toolbar">' +
      '<div class="a-search"><i class="fa-solid fa-magnifying-glass"></i><input id="pq" placeholder="Cari nama / lembaga / WA..."></div>' +
      '<select class="status-select" id="p-status"><option value="">Semua Status</option>' + STATUS_PROSPEK.map(function (s) { return '<option>' + s + "</option>"; }).join("") + "</select></div>",
      '<div class="table-wrap" id="p-table"></div>');
    document.getElementById("pq").addEventListener("input", function (e) { PROSPEK_STATE.search = e.target.value.toLowerCase(); paint(); });
    document.getElementById("p-status").addEventListener("change", function (e) { PROSPEK_STATE.status = e.target.value; paint(); });
    DB.getInquiries().then(function (list) { PROSPEK_STATE.list = list; paint(); }).catch(errToast);
    function paint() {
      var rows = PROSPEK_STATE.list.filter(function (i) {
        if (PROSPEK_STATE.status && i.status !== PROSPEK_STATE.status) return false;
        if (!PROSPEK_STATE.search) return true;
        return ((i.full_name || "") + " " + (i.organization || "") + " " + (i.whatsapp || "")).toLowerCase().indexOf(PROSPEK_STATE.search) > -1;
      });
      document.getElementById("p-table").innerHTML = '<table class="table"><thead><tr><th>Pemohon</th><th>Aplikasi/Jenis</th><th>WhatsApp</th><th>Tanggal</th><th>Status</th><th style="width:110px">Aksi</th></tr></thead><tbody>' +
        rows.map(function (i) {
          return "<tr><td><span class='t-strong'>" + esc(i.full_name) + "</span><div class='muted' style='font-size:.78rem'>" + esc(i.organization || "-") + "</div></td>" +
            "<td>" + esc(i.application_name || "-") + "</td>" +
            '<td><a href="https://wa.me/' + esc(String(i.whatsapp || "").replace(/\D/g, "").replace(/^0/, "62")) + '" target="_blank" rel="noopener" style="color:var(--wa-dark);font-weight:600">' + esc(i.whatsapp || "-") + "</a></td>" +
            "<td>" + UI.fmtDate(i.created_at) + "</td>" +
            '<td><select class="status-select" data-st="' + i.id + '">' + STATUS_PROSPEK.map(function (s) { return '<option' + (i.status === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></td>" +
            '<td><div class="t-actions"><button class="icon-btn" data-open="' + i.id + '" title="Detail"><i class="fa-solid fa-eye"></i></button>' +
            '<button class="icon-btn icon-btn--danger" data-del="' + i.id + '" title="Hapus"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
        }).join("") + "</tbody></table>" +
        (!rows.length ? '<div class="a-empty"><i class="fa-solid fa-inbox"></i>Tidak ada prospek pada filter ini.</div>' : "");
      el.querySelectorAll("[data-st]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          DB.updateInquiry(sel.dataset.st, { status: sel.value }).then(function () {
            var row = PROSPEK_STATE.list.find(function (x) { return x.id === sel.dataset.st; });
            if (row) row.status = sel.value;
            UI.toast("success", "Status diperbarui", sel.value);
          }).catch(errToast);
        });
      });
      el.querySelectorAll("[data-open]").forEach(function (b) {
        b.addEventListener("click", function () { detailProspek(PROSPEK_STATE.list.find(function (x) { return x.id === b.dataset.open; })); });
      });
      el.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          var i = PROSPEK_STATE.list.find(function (x) { return x.id === b.dataset.del; });
          UI.confirmModal({ title: "Hapus prospek?", message: "Data permintaan dari " + i.full_name + " akan dihapus permanen.", yesLabel: "Hapus", danger: true }).then(function (ok) {
            if (!ok) return;
            DB.deleteRow("inquiries", i.id).then(function () {
              UI.toast("success", "Prospek dihapus"); DB.getInquiries().then(function (l) { PROSPEK_STATE.list = l; paint(); });
            }).catch(errToast);
          });
        });
      });
    }
  }

  function detailProspek(i) {
    var waNum = String(i.whatsapp || "").replace(/\D/g, "").replace(/^0/, "62");
    openFormModal({
      title: "Detail Prospek — " + i.full_name,
      saveLabel: "Tutup",
      body: '<div class="field--full" style="display:flex;flex-direction:column;gap:6px;font-size:.92rem;color:var(--text-2)">' +
        "<div><b class='t-strong'>Aplikasi/Jenis:</b> " + esc(i.application_name || i.inquiry_type || "-") + "</div>" +
        "<div><b class='t-strong'>Lembaga:</b> " + esc(i.organization || "-") + "</div>" +
        "<div><b class='t-strong'>Email:</b> " + esc(i.email || "-") + "</div>" +
        "<div><b class='t-strong'>WhatsApp:</b> " + esc(i.whatsapp || "-") + "</div>" +
        "<div><b class='t-strong'>Anggaran:</b> " + esc(i.budget || "-") + "</div>" +
        "<div><b class='t-strong'>Target Selesai:</b> " + esc(i.target_date ? UI.fmtDate(i.target_date) : "-") + "</div>" +
        "<div><b class='t-strong'>Status:</b> " + esc(i.status) + "</div>" +
        '<div style="margin-top:8px"><b class="t-strong">Deskripsi Kebutuhan:</b><div style="background:var(--bg-soft);border:1px solid var(--border);border-radius:10px;padding:12px;margin-top:6px">' + esc(i.description || "-") + "</div></div>" +
        (i.desired_features ? '<div><b class="t-strong">Fitur Diinginkan:</b><div style="background:var(--bg-soft);border:1px solid var(--border);border-radius:10px;padding:12px;margin-top:6px">' + esc(i.desired_features) + "</div></div>" : "") +
        '<div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">' +
        '<a class="btn btn--wa btn--sm" target="_blank" rel="noopener" href="https://wa.me/' + esc(waNum) + '"><i class="fa-brands fa-whatsapp"></i> Hubungi via WhatsApp</a>' +
        '<a class="btn btn--outline btn--sm" href="mailto:' + esc(i.email || "") + '"><i class="fa-solid fa-envelope"></i> Email</a></div>' +
        '<h4 style="margin-top:18px;font-family:var(--font-head);color:var(--navy-800)">Riwayat Follow-up</h4><ul class="followup-list" id="fu-list"></ul>' +
        '<div class="form-grid" style="margin-top:6px">' +
        field("Catatan Follow-up", ta("fu-note", "", 2, "cth: Sudah dihubungi, menunggu keputusan manajemen"), true) +
        field("Tanggal", inp("fu-date", new Date().toISOString().slice(0, 10), "date"), false) +
        "</div>",
      onMount: function (form) {
        loadFU();
      },
      onSave: function (form, done) {
        var note = form.querySelector("#fu-note").value.trim();
        if (!note) { UI.toast("warning", "Catatan kosong", "Tulis catatan follow-up dahulu."); return done(false); }
        DB.addFollowUp({
          inquiry_id: i.id, note: note,
          follow_up_date: form.querySelector("#fu-date").value || new Date().toISOString().slice(0, 10),
          created_by: (user && user.email) || "admin"
        }).then(function () {
          UI.toast("success", "Follow-up dicatat");
          done(); renderProspek();
        }).catch(function (e) { errToast(e); done(false); });
      }
    });
    function loadFU() {
      DB.getFollowUps(i.id).then(function (list) {
        var ul = document.getElementById("fu-list");
        if (ul) ul.innerHTML = list.length ? list.map(function (f) {
          return "<li><b>" + UI.fmtDate(f.follow_up_date || f.created_at) + " — " + esc(f.created_by || "admin") + "</b>" + esc(f.note) + "</li>";
        }).join("") : '<li style="color:var(--text-3)">Belum ada riwayat follow-up.</li>';
      }).catch(errToast);
    }
  }

  /* =================== KONTEN =================== */
  function renderKonten() {
    var el = document.getElementById("sec-konten");
    el.innerHTML =
      panel("Hero Halaman Beranda", "", '<div class="a-panel__body"><div class="form-grid">' +
        field("Headline Utama", inp("k-hero", state.hero_headline, "text"), true) +
        field("Sub-headline", ta("k-hero-sub", state.hero_subheadline, 2), true) +
        '<div class="form-actions"><button class="btn btn--primary" id="k-hero-save"><i class="fa-solid fa-floppy-disk"></i> Simpan Hero</button></div></div></div>') +
      panel("Call to Action Beranda", "", '<div class="a-panel__body"><div class="form-grid">' +
        field("Headline CTA", inp("k-cta", state.cta_headline, "text"), true) +
        field("Deskripsi CTA", ta("k-cta-desc", state.cta_description, 2), true) +
        '<div class="form-actions"><button class="btn btn--primary" id="k-cta-save"><i class="fa-solid fa-floppy-disk"></i> Simpan CTA</button></div></div></div>') +
      panel("Testimoni Pelanggan", '<button class="btn btn--primary btn--sm" id="t-add"><i class="fa-solid fa-plus"></i> Tambah Testimoni</button>', '<div class="table-wrap" id="t-table"></div>') +
      panel("FAQ (Tanya Jawab)", '<button class="btn btn--primary btn--sm" id="q-add"><i class="fa-solid fa-plus"></i> Tambah FAQ</button>', '<div class="table-wrap" id="q-table"></div>');

    document.getElementById("k-hero-save").addEventListener("click", function () {
      var btn = this; btn.dataset.label = btn.innerHTML; setBusy(btn, true, "Menyimpan...");
      DB.saveSettings({ hero_headline: val("k-hero"), hero_subheadline: val("k-hero-sub") }).then(function () {
        setBusy(btn, false); UI.toast("success", "Hero tersimpan", "Perubahan tampil di halaman beranda.");
      }).catch(function (e) { errToast(e); setBusy(btn, false); });
    });
    document.getElementById("k-cta-save").addEventListener("click", function () {
      var btn = this; btn.dataset.label = btn.innerHTML; setBusy(btn, true, "Menyimpan...");
      DB.saveSettings({ cta_headline: val("k-cta"), cta_description: val("k-cta-desc") }).then(function () {
        setBusy(btn, false); UI.toast("success", "CTA tersimpan");
      }).catch(function (e) { errToast(e); setBusy(btn, false); });
    });
    function val(id) { return document.getElementById(id).value; }

    loadTesti(); loadFaq();
    document.getElementById("t-add").addEventListener("click", function () { testiModal(null); });
    document.getElementById("q-add").addEventListener("click", function () { faqModal(null); });

    function loadTesti() {
      DB.getTestimonials(false).then(function (list) {
        document.getElementById("t-table").innerHTML = '<table class="table"><thead><tr><th>Nama</th><th>Lembaga</th><th>Isi</th><th>Rating</th><th>Aktif</th><th style="width:110px">Aksi</th></tr></thead><tbody>' +
          list.map(function (t) {
            return "<tr><td class='t-strong'>" + esc(t.customer_name) + "</td><td>" + esc(t.organization || "-") + "</td>" +
              '<td style="max-width:280px">' + esc((t.content || "").slice(0, 80)) + ((t.content || "").length > 80 ? "..." : "") + "</td>" +
              "<td>" + (t.rating || 5) + " ★</td>" +
              '<td><label class="switch"><input type="checkbox" data-ta="' + t.id + '"' + (t.is_active ? " checked" : "") + "><i></i></label></td>" +
              '<td><div class="t-actions"><button class="icon-btn" data-te="' + t.id + '"><i class="fa-solid fa-pen"></i></button><button class="icon-btn icon-btn--danger" data-td="' + t.id + '"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
          }).join("") + "</tbody></table>" + (!list.length ? '<div class="a-empty"><i class="fa-solid fa-quote-left"></i>Belum ada testimoni</div>' : "");
        el.querySelectorAll("[data-ta]").forEach(function (cb) {
          cb.addEventListener("change", function () {
            DB.upsertTestimonial({ id: cb.dataset.ta, is_active: cb.checked }).catch(errToast);
          });
        });
        el.querySelectorAll("[data-te]").forEach(function (b) { b.addEventListener("click", function () { testiModal(list.find(function (t) { return t.id === b.dataset.te; })); }); });
        el.querySelectorAll("[data-td]").forEach(function (b) {
          b.addEventListener("click", function () {
            UI.confirmModal({ title: "Hapus testimoni?", message: "Data akan dihapus permanen.", yesLabel: "Hapus", danger: true }).then(function (ok) {
              if (ok) DB.deleteTestimonial(b.dataset.td).then(function () { UI.toast("success", "Testimoni dihapus"); loadTesti(); }).catch(errToast);
            });
          });
        });
      }).catch(errToast);
    }
    function testiModal(t) {
      openFormModal({
        title: t ? "Edit Testimoni" : "Tambah Testimoni",
        body: field("Nama Pelanggan *", inp("t-name", t && t.customer_name, "text", "cth: Ahmad Fauzi", true)) +
          field("Lembaga / Organisasi", inp("t-org", t && t.organization, "text", "cth: SMK Nusantara")) +
          field("Isi Testimoni *", ta("t-content", t && t.content, 4), true) +
          field("Rating (1-5)", inp("t-rating", t ? t.rating : 5, "number", "5")) +
          field("Aktif ditampilkan", '<label class="switch"><input type="checkbox" id="t-active"' + (!t || t.is_active ? " checked" : "") + "><i></i></label>"),
        onSave: function (form, done) {
          var name = form.querySelector("#t-name").value.trim();
          var content = form.querySelector("#t-content").value.trim();
          if (!name || !content) { UI.toast("error", "Lengkapi nama dan isi testimoni"); return done(false); }
          DB.upsertTestimonial({
            id: t ? t.id : null, customer_name: name, organization: form.querySelector("#t-org").value.trim(),
            content: content, rating: Math.min(5, Math.max(1, Number(form.querySelector("#t-rating").value) || 5)),
            is_active: form.querySelector("#t-active").checked
          }).then(function () { UI.toast("success", "Testimoni tersimpan"); done(); loadTesti(); })
            .catch(function (e) { errToast(e); done(false); });
        }
      });
    }
    function loadFaq() {
      DB.getFaqs(false).then(function (list) {
        document.getElementById("q-table").innerHTML = '<table class="table"><thead><tr><th>Pertanyaan</th><th>Jawaban</th><th>Aktif</th><th style="width:110px">Aksi</th></tr></thead><tbody>' +
          list.map(function (f) {
            return "<tr><td class='t-strong' style='max-width:240px'>" + esc(f.question) + "</td><td style='max-width:280px'>" + esc((f.answer || "").slice(0, 90)) + ((f.answer || "").length > 90 ? "..." : "") + "</td>" +
              '<td><label class="switch"><input type="checkbox" data-qa="' + f.id + '"' + (f.is_active ? " checked" : "") + "><i></i></label></td>" +
              '<td><div class="t-actions"><button class="icon-btn" data-qe="' + f.id + '"><i class="fa-solid fa-pen"></i></button><button class="icon-btn icon-btn--danger" data-qd="' + f.id + '"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
          }).join("") + "</tbody></table>" + (!list.length ? '<div class="a-empty"><i class="fa-solid fa-circle-question"></i>Belum ada FAQ</div>' : "");
        el.querySelectorAll("[data-qa]").forEach(function (cb) { cb.addEventListener("change", function () { DB.upsertFaq({ id: cb.dataset.qa, is_active: cb.checked }).catch(errToast); }); });
        el.querySelectorAll("[data-qe]").forEach(function (b) { b.addEventListener("click", function () { faqModal(list.find(function (f) { return f.id === b.dataset.qe; })); }); });
        el.querySelectorAll("[data-qd]").forEach(function (b) {
          b.addEventListener("click", function () {
            UI.confirmModal({ title: "Hapus FAQ?", message: "Data akan dihapus permanen.", yesLabel: "Hapus", danger: true }).then(function (ok) {
              if (ok) DB.deleteFaq(b.dataset.qd).then(function () { UI.toast("success", "FAQ dihapus"); loadFaq(); }).catch(errToast);
            });
          });
        });
      }).catch(errToast);
    }
    function faqModal(f) {
      openFormModal({
        title: f ? "Edit FAQ" : "Tambah FAQ",
        body: field("Pertanyaan *", inp("q-q", f && f.question, "text", "cth: Bagaimana cara meminta demo?", true)) +
          field("Jawaban *", ta("q-a", f && f.answer, 4), true) +
          field("Aktif ditampilkan", '<label class="switch"><input type="checkbox" id="q-active"' + (!f || f.is_active ? " checked" : "") + "><i></i></label>"),
        onSave: function (form, done) {
          var q = form.querySelector("#q-q").value.trim(), a = form.querySelector("#q-a").value.trim();
          if (!q || !a) { UI.toast("error", "Lengkapi pertanyaan dan jawaban"); return done(false); }
          DB.upsertFaq({ id: f ? f.id : null, question: q, answer: a, is_active: form.querySelector("#q-active").checked })
            .then(function () { UI.toast("success", "FAQ tersimpan"); done(); loadFaq(); })
            .catch(function (e) { errToast(e); done(false); });
        }
      });
    }
  }

  /* =================== BLOG =================== */
  function renderBlog() {
    var el = document.getElementById("sec-blog");
    el.innerHTML = panel("Artikel Edukasi", '<button class="btn btn--primary btn--sm" id="b-add"><i class="fa-solid fa-plus"></i> Tulis Artikel</button>', '<div class="table-wrap" id="b-table"></div>');
    document.getElementById("b-add").addEventListener("click", function () { postModal(null); });
    DB.getPosts({}).then(function (posts) {
      document.getElementById("b-table").innerHTML = '<table class="table"><thead><tr><th>Judul</th><th>Slug</th><th>Tanggal</th><th>Status</th><th style="width:110px">Aksi</th></tr></thead><tbody>' +
        posts.map(function (p) {
          return "<tr><td class='t-strong' style='max-width:280px'>" + esc(p.title) + "</td><td><code>" + esc(p.slug) + "</code></td><td>" + UI.fmtDate(p.published_at || p.created_at) + "</td>" +
            '<td><span class="tag ' + (p.is_published ? "tag--deal" : "tag--tidak") + '">' + (p.is_published ? "Publik" : "Draft") + "</span></td>" +
            '<td><div class="t-actions"><button class="icon-btn" data-be="' + p.id + '"><i class="fa-solid fa-pen"></i></button><button class="icon-btn icon-btn--danger" data-bd="' + p.id + '"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
        }).join("") + "</tbody></table>" + (!posts.length ? '<div class="a-empty"><i class="fa-solid fa-newspaper"></i>Belum ada artikel</div>' : "");
      el.querySelectorAll("[data-be]").forEach(function (b) { b.addEventListener("click", function () { postModal(posts.find(function (p) { return p.id === b.dataset.be; })); }); });
      el.querySelectorAll("[data-bd]").forEach(function (b) {
        b.addEventListener("click", function () {
          UI.confirmModal({ title: "Hapus artikel?", message: "Artikel akan dihapus permanen.", yesLabel: "Hapus", danger: true }).then(function (ok) {
            if (ok) DB.deletePost(b.dataset.bd).then(function () { UI.toast("success", "Artikel dihapus"); renderBlog(); }).catch(errToast);
          });
        });
      });
    }).catch(errToast);
    function postModal(p) {
      openFormModal({
        title: p ? "Edit Artikel" : "Tulis Artikel",
        body: field("Judul *", inp("b-title", p && p.title, "text", "cth: 5 Tanda Administrasi Butuh Digitalisasi", true)) +
          field("Slug (otomatis jika kosong)", inp("b-slug", p && p.slug, "text", "otomatis-dari-judul")) +
          field("Ringkasan (excerpt)", ta("b-excerpt", p && p.excerpt, 2, "1-2 kalimat ringkasan"), true) +
          field("Cover URL (opsional)", inp("b-cover", p && p.cover_url, "text", "https://...")) +
          field("Konten * (pisahkan paragraf dengan baris kosong; baris berawalan '- ' menjadi daftar)", ta("b-content", p && p.content, 10), true) +
          field("Publikasikan", '<label class="switch"><input type="checkbox" id="b-pub"' + (!p || p.is_published ? " checked" : "") + "><i></i></label>"),
        onSave: function (form, done) {
          var title = form.querySelector("#b-title").value.trim();
          var content = form.querySelector("#b-content").value.trim();
          if (!title || !content) { UI.toast("error", "Judul dan konten wajib diisi"); return done(false); }
          var now = new Date().toISOString();
          DB.upsertPost({
            id: p ? p.id : null, title: title,
            slug: form.querySelector("#b-slug").value.trim() || H.slugify(title),
            excerpt: form.querySelector("#b-excerpt").value.trim(),
            cover_url: form.querySelector("#b-cover").value.trim(),
            content: content, is_published: form.querySelector("#b-pub").checked,
            published_at: p && p.published_at ? p.published_at : now
          }).then(function () { UI.toast("success", "Artikel tersimpan"); done(); renderBlog(); })
            .catch(function (e) { errToast(e); done(false); });
        }
      });
    }
  }

  /* =================== PENGATURAN WEBSITE (v1.1 — multi-tab) ===================
     Tab: Identitas & Logo | Tampilan & Warna | Koneksi Supabase |
          Kontak & Sosial | SEO & Statistik                                */
  var THEME_PRESETS = [
    { name: "Electric Blue (Bawaan)", primary: "#1E6FFF", dark: "#0F55D6" },
    { name: "Indigo Modern", primary: "#6366F1", dark: "#4F46E5" },
    { name: "Teal Segar", primary: "#0D9488", dark: "#0F766E" },
    { name: "Hijau Zamrud", primary: "#16A34A", dark: "#15803D" },
    { name: "Oranye Senja", primary: "#EA580C", dark: "#C2410C" },
    { name: "Maroon Elegan", primary: "#BE123C", dark: "#9F1239" }
  ];
  var LS_OVERRIDE = "apknd_supabase_override";

  function renderPengaturan() {
    var el = document.getElementById("sec-pengaturan");
    var TABS = [
      { id: "identitas", icon: "fa-copyright", label: "Identitas & Logo" },
      { id: "tampilan", icon: "fa-palette", label: "Tampilan & Warna" },
      { id: "koneksi", icon: "fa-plug-circle-bolt", label: "Koneksi Supabase" },
      { id: "kontak", icon: "fa-address-book", label: "Kontak & Sosial" },
      { id: "seo", icon: "fa-magnifying-glass-chart", label: "SEO & Statistik" }
    ];
    el.innerHTML = '<div class="a-tabs" role="tablist">' + TABS.map(function (t) {
      return '<button type="button" class="a-tab" data-tab="' + t.id + '" role="tab"><i class="fa-solid ' + t.icon + '"></i>' + t.label + "</button>";
    }).join("") + '</div><div id="set-body"></div>';
    var body = document.getElementById("set-body");
    var RENDERERS = {
      identitas: renderTabIdentitas, tampilan: renderTabTampilan, koneksi: renderTabKoneksi,
      kontak: renderTabKontak, seo: renderTabSeo
    };
    function open(key) {
      el.querySelectorAll(".a-tab").forEach(function (b) { b.classList.toggle("is-active", b.dataset.tab === key); });
      (RENDERERS[key] || renderTabIdentitas)(body);
    }
    el.querySelectorAll(".a-tab").forEach(function (b) {
      b.addEventListener("click", function () { open(b.dataset.tab); });
    });
    open("identitas");
  }

  /* ---- komponen upload gambar (Supabase Storage / dataURL demo) ---- */
  function upl(id, label, hint, cur) {
    var has = !!cur;
    return '<div class="upl" data-upl="' + id + '">' +
      '<div class="upl__head"><b>' + label + '</b><span class="hint">' + hint + "</span></div>" +
      '<div class="upl__row">' +
        '<div class="upl__preview" id="' + id + '-prev">' + (has ? '<img src="' + esc(cur) + '" alt="Pratinjau">' : '<i class="fa-regular fa-image"></i>') + "</div>" +
        '<div class="upl__btns">' +
          '<input type="file" id="' + id + '-file" accept="image/*" hidden>' +
          '<button type="button" class="btn btn--outline btn--sm" id="' + id + '-pick"><i class="fa-solid fa-upload"></i> Pilih Gambar</button>' +
          '<button type="button" class="btn btn--danger btn--sm" id="' + id + '-del"' + (has ? "" : " disabled") + '><i class="fa-solid fa-trash-can"></i> Hapus</button>' +
          '<input type="hidden" id="' + id + '" value="' + esc(cur || "") + '">' +
        "</div>" +
      "</div></div>";
  }
  function bindUpl(id, afterChange) {
    var file = document.getElementById(id + "-file");
    var pick = document.getElementById(id + "-pick");
    var del = document.getElementById(id + "-del");
    var prev = document.getElementById(id + "-prev");
    var hid = document.getElementById(id);
    if (!file || !pick) return;
    pick.addEventListener("click", function () { file.click(); });
    file.addEventListener("change", function () {
      var f = file.files && file.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) return UI.toast("error", "Bukan berkas gambar", "Pilih berkas PNG, JPG, SVG, atau WebP.");
      var isSupa = (DB.mode || window.APLIKASIKU_MODE) === "supabase";
      var maxMB = isSupa ? 2 : 0.4;
      if (f.size > maxMB * 1024 * 1024) return UI.toast("error", "Ukuran terlalu besar", "Maksimal " + (isSupa ? "2MB pada mode Supabase." : "400KB pada mode demo — kompres dulu gambarnya."));
      var labelHTML = pick.innerHTML;
      pick.disabled = true;
      pick.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah...';
      DB.uploadImage(f, "brand").then(function (url) {
        hid.value = url;
        prev.innerHTML = '<img src="' + esc(url) + '" alt="Pratinjau">';
        del.disabled = false;
        UI.toast("success", "Gambar terunggah", "Klik tombol Simpan pada tab ini untuk menerapkan secara permanen.");
        if (afterChange) afterChange(url);
      }).catch(function (e) { errToast(e); })
        .finally(function () { pick.disabled = false; pick.innerHTML = labelHTML; file.value = ""; });
    });
    del.addEventListener("click", function () {
      hid.value = "";
      prev.innerHTML = '<i class="fa-regular fa-image"></i>';
      del.disabled = true;
      UI.toast("info", "Dihapus dari draf", "Klik tombol Simpan pada tab ini untuk menerapkan.");
      if (afterChange) afterChange("");
    });
  }
  function sgval(id) { var el = document.getElementById(id); return el ? String(el.value).trim() : ""; }
  function resetThemeVars() {
    var r = document.documentElement.style;
    ["--blue", "--blue-dark", "--blue-soft", "--blue-light", "--blue-rgb"].forEach(function (k) { r.removeProperty(k); });
    document.body.classList.remove("theme-navbar-dark");
  }
  function saveSettingsBtn(btnId, payload, okTitle, okMsg, after) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.dataset.label = btn.innerHTML;
    setBusy(btn, true, "Menyimpan...");
    DB.saveSettings(payload).then(function () {
      Object.assign(state, payload);
      UI.toast("success", okTitle, okMsg);
      if (after) after();
      setBusy(btn, false);
    }).catch(function (e) { errToast(e); setBusy(btn, false); });
  }

  /* ---- Tab 1: Identitas & Logo ---- */
  function renderTabIdentitas(body) {
    var s = state;
    body.innerHTML = panel("Identitas & Logo Brand", "",
      '<div class="form-grid">' +
      field("Nama Website", inp("i-name", s.site_name, "text", "cth: Aplikasiku.nd")) +
      field("Tagline", inp("i-tagline", s.tagline, "text", "cth: Kerja Jadi Lebih Mudah")) +
      field("Teks Footer", inp("i-footnote", s.footer_note, "text", "cth: Kerja Jadi Lebih Mudah."), false, "Kalimat singkat pada baris hak cipta di semua halaman.") +
      '<div class="field field--full"><label>Pratinjau Navbar</label><div class="id-preview">' +
        '<img id="i-prev-img" src="' + esc(s.logo_url || "assets/img/logo.svg") + '" alt="Pratinjau logo">' +
        '<div><b id="i-prev-name">' + esc(s.site_name || "Aplikasiku.nd") + '</b><span id="i-prev-tag">' + esc(s.tagline || "Kerja Jadi Lebih Mudah") + "</span></div></div></div>" +
      upl("i-logo", "Logo Utama (navbar)", "PNG/SVG latar transparan, tinggi ±42px. Maks " + ((DB.mode || window.APLIKASIKU_MODE) === "supabase" ? "2MB." : "400KB pada mode demo."), s.logo_url) +
      upl("i-logolight", "Logo Versi Putih (footer)", "Tampil pada footer dan bagian berlatar navy.", s.logo_light_url) +
      upl("i-favicon", "Favicon", "Ikon pada tab browser — disarankan 64x64px PNG/SVG.", s.favicon_url) +
      upl("i-og", "Gambar Open Graph", "Gambar saat tautan dibagikan ke WhatsApp/Facebook — 1200x630px.", s.og_image_url) +
      '<div class="form-actions"><button class="btn btn--primary" id="i-save"><i class="fa-solid fa-floppy-disk"></i> Simpan Identitas</button>' +
      '<span class="form-note"><i class="fa-solid fa-circle-info"></i> Berkas tersimpan di Supabase Storage (bucket <code>media</code>, folder <code>brand/</code>); alamatnya dicatat di tabel <code>website_settings</code>.</span></div>' +
      "</div>");
    bindUpl("i-logo", function (url) { var p = document.getElementById("i-prev-img"); if (p) p.src = url || "assets/img/logo.svg"; });
    bindUpl("i-logolight", null);
    bindUpl("i-favicon", null);
    bindUpl("i-og", null);
    document.getElementById("i-name").addEventListener("input", function () { document.getElementById("i-prev-name").textContent = this.value || "Aplikasiku.nd"; });
    document.getElementById("i-tagline").addEventListener("input", function () { document.getElementById("i-prev-tag").textContent = this.value || "Kerja Jadi Lebih Mudah"; });
    document.getElementById("i-save").addEventListener("click", function () {
      saveSettingsBtn("i-save", {
        site_name: sgval("i-name"), tagline: sgval("i-tagline"), footer_note: sgval("i-footnote"),
        logo_url: sgval("i-logo"), logo_light_url: sgval("i-logolight"),
        favicon_url: sgval("i-favicon"), og_image_url: sgval("i-og")
      }, "Identitas tersimpan", "Logo & identitas baru langsung dipakai di seluruh halaman website.", function () { UI.applyIdentity(state); });
    });
  }

  /* ---- Tab 2: Tampilan & Warna ---- */
  function renderTabTampilan(body) {
    var s = state;
    var cur = (s.theme_primary || THEME_PRESETS[0].primary).toUpperCase();
    body.innerHTML = panel("Tampilan & Warna", "",
      '<div class="form-grid">' +
      '<div class="field field--full"><label>Warna Utama — Preset</label><div class="swatches" id="sw-list">' +
        THEME_PRESETS.map(function (p) {
          var active = cur === p.primary.toUpperCase();
          return '<button type="button" class="swatch' + (active ? " is-active" : "") + '" data-p="' + p.primary + '" data-d="' + p.dark + '">' +
            '<span class="swatch__c" style="background:' + p.primary + '"></span><span class="swatch__c" style="background:' + p.dark + '"></span><span>' + esc(p.name) + "</span></button>";
        }).join("") + "</div></div>" +
      field("Warna Utama Kustom", '<div class="color-row"><input type="color" id="t-color" value="' + esc(cur) + '"><input type="text" id="t-hex" value="' + esc(cur) + '" maxlength="7" spellcheck="false"></div>', false, "Pilih warna apa pun — tombol, tautan, aksen, dan bayangan seluruh halaman mengikuti.") +
      field("Warna Hover/Gradien", inp("t-dark", s.theme_primary_dark || "", "text", "Kosongkan = dibuat otomatis"), false, "Versi lebih gelap dari warna utama untuk efek hover.") +
      field("Gaya Navbar", selectHTML("t-nav", [{ v: "light", t: "Terang (putih)" }, { v: "dark", t: "Gelap (navy)" }], s.theme_navbar || "light")) +
      '<div class="field field--full"><label>Pratinjau Langsung</label><div class="theme-preview">' +
        '<span class="eyebrow"><i class="fa-solid fa-bolt"></i> Label Aksen</span>' +
        '<button type="button" class="btn btn--primary btn--sm"><i class="fa-solid fa-wand-magic-sparkles"></i> Tombol Utama</button>' +
        '<button type="button" class="btn btn--outline btn--sm">Tombol Garis</button>' +
        '<span class="theme-preview__link">Tautan berwarna tema</span>' +
      "</div></div>" +
      '<div class="form-actions"><button class="btn btn--primary" id="t-save"><i class="fa-solid fa-floppy-disk"></i> Simpan Tema</button>' +
      '<button class="btn btn--outline" id="t-reset"><i class="fa-solid fa-rotate-left"></i> Kembalikan Bawaan</button>' +
      '<span class="form-note"><i class="fa-solid fa-circle-info"></i> Perubahan warna juga langsung terlihat pada dashboard ini.</span></div>' +
      "</div>");
    var liveP = cur;
    function applyLive(p, d) { liveP = p; UI.applyTheme({ theme_primary: p, theme_primary_dark: d }); }
    body.querySelectorAll(".swatch").forEach(function (b) {
      b.addEventListener("click", function () {
        body.querySelectorAll(".swatch").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        document.getElementById("t-color").value = b.dataset.p;
        document.getElementById("t-hex").value = b.dataset.p;
        document.getElementById("t-dark").value = b.dataset.d;
        applyLive(b.dataset.p, b.dataset.d);
      });
    });
    var colorIn = document.getElementById("t-color"), hexIn = document.getElementById("t-hex");
    colorIn.addEventListener("input", function () {
      hexIn.value = colorIn.value.toUpperCase();
      body.querySelectorAll(".swatch").forEach(function (x) { x.classList.remove("is-active"); });
      applyLive(colorIn.value, sgval("t-dark"));
    });
    hexIn.addEventListener("change", function () {
      if (!UI.hexToRgb(hexIn.value)) { hexIn.value = colorIn.value.toUpperCase(); return UI.toast("warning", "Kode warna tidak valid", "Gunakan 6 digit heksadesimal, cth: #1E6FFF"); }
      colorIn.value = hexIn.value;
      body.querySelectorAll(".swatch").forEach(function (x) { x.classList.remove("is-active"); });
      applyLive(hexIn.value, sgval("t-dark"));
    });
    document.getElementById("t-dark").addEventListener("change", function () { applyLive(liveP, this.value.trim()); });
    document.getElementById("t-save").addEventListener("click", function () {
      saveSettingsBtn("t-save", {
        theme_primary: liveP, theme_primary_dark: sgval("t-dark"),
        theme_navbar: sgval("t-nav") || "light"
      }, "Tema tersimpan", "Warna baru kini aktif di seluruh halaman website.");
    });
    document.getElementById("t-reset").addEventListener("click", function () {
      saveSettingsBtn("t-reset", { theme_primary: "", theme_primary_dark: "", theme_navbar: "light" },
        "Tema dikembalikan", "Seluruh warna kembali ke bawaan (Electric Blue).", function () {
          resetThemeVars();
          renderTabTampilan(body);
        });
    });
  }

  /* ---- Tab 3: Koneksi Supabase ---- */
  function renderTabKoneksi(body) {
    var CFG = window.APLIKASIKU_CONFIG || {};
    var isOverride = !!window.__SUPABASE_OVERRIDE;
    var connected = (DB.mode || window.APLIKASIKU_MODE) === "supabase";
    body.innerHTML = panel("Koneksi Supabase", "",
      '<div class="conn ' + (connected ? "conn--ok" : "conn--demo") + '">' +
        "<div><b>" + (connected ? "Terhubung ke Supabase" : "Mode Demo — belum ada Supabase") + "</b>" +
        '<span class="hint">' + (connected
          ? "Data nyata dibaca & ditulis ke project Supabase Anda" + (isOverride ? " (kredensial dari panel ini, tersimpan di browser perangkat ini)." : " (kredensial dari js/config.js).")
          : "Data contoh hanya tersimpan di localStorage browser ini. Isi kredensial di bawah untuk mengaktifkan data nyata.") + "</span></div>" +
        '<span class="badge ' + (connected ? "badge--ok" : "badge--demo") + '"><i class="fa-solid ' + (connected ? "fa-link" : "fa-flask") + '"></i> ' + (connected ? (isOverride ? "via Panel Admin" : "via config.js") : "Demo") + "</span>" +
      "</div>" +
      '<div class="form-grid">' +
      field("Project URL", inp("c-url", CFG.SUPABASE_URL || "", "text", "https://abcdefghijk.supabase.co")) +
      field("Anon / Publishable Key", '<div class="pw-wrap">' + inp("c-key", CFG.SUPABASE_ANON_KEY || "", "password", "eyJhbGciOiJIUzI1NiIs...") +
        '<button type="button" class="pw-toggle" id="c-eye" aria-label="Tampilkan kunci"><i class="fa-regular fa-eye"></i></button></div>', false,
        "Ambil dari Project Settings > API Keys. Gunakan anon key — JANGAN service_role!") +
      '<div class="field field--full"><div class="conn-actions">' +
        '<button class="btn btn--outline" id="c-test"><i class="fa-solid fa-satellite-dish"></i> Uji Koneksi</button>' +
        '<button class="btn btn--primary" id="c-save"><i class="fa-solid fa-plug-circle-check"></i> Simpan &amp; Hubungkan</button>' +
        (isOverride ? '<button class="btn btn--danger" id="c-drop"><i class="fa-solid fa-link-slash"></i> Putuskan &amp; Kembali ke Demo</button>' : "") +
      '</div><div id="c-result"></div></div>' +
      "</div>" +
      '<div class="a-note"><i class="fa-solid fa-shield-halved"></i><div><b>Cara kerja:</b> tombol "Simpan &amp; Hubungkan" menyimpan kredensial pada browser ini saja (localStorage) lalu memuat ulang halaman — praktis untuk pengujian cepat. Untuk koneksi permanen di semua perangkat (produksi), isi <code>SUPABASE_URL</code> dan <code>SUPABASE_ANON_KEY</code> pada berkas <code>js/config.js</code>. Keamanan data diatur oleh Row Level Security (RLS) pada <code>sql/supabase-schema.sql</code>. Jika tabel belum ada, jalankan SQL tersebut di Supabase SQL Editor terlebih dahulu.</div></div>');
    var keyIn = document.getElementById("c-key");
    document.getElementById("c-eye").addEventListener("click", function () {
      var show = keyIn.type === "password";
      keyIn.type = show ? "text" : "password";
      this.innerHTML = '<i class="fa-regular ' + (show ? "fa-eye-slash" : "fa-eye") + '"></i>';
    });
    document.getElementById("c-test").addEventListener("click", function () {
      var btn = this; btn.dataset.label = btn.innerHTML; setBusy(btn, true, "Menguji...");
      var res = document.getElementById("c-result");
      res.innerHTML = '<div class="conn-testing"><i class="fa-solid fa-spinner fa-spin"></i> Menguji koneksi database &amp; storage...</div>';
      DB.testConnection(sgval("c-url"), keyIn.value.trim()).then(function (r) {
        res.innerHTML = r.ok
          ? '<div class="conn-result conn-result--ok"><b><i class="fa-solid fa-circle-check"></i> ' + esc(r.message) + "</b>" + (r.storage ? "<span>" + esc(r.storage) + "</span>" : "") + "</div>"
          : '<div class="conn-result conn-result--fail"><b><i class="fa-solid fa-circle-xmark"></i> Gagal terhubung</b><span>' + esc(r.message) + "</span></div>";
      }).catch(function (e) {
        res.innerHTML = '<div class="conn-result conn-result--fail"><b><i class="fa-solid fa-circle-xmark"></i> Gagal terhubung</b><span>' + esc(String((e && e.message) || e)) + "</span></div>";
      }).finally(function () { setBusy(btn, false); });
    });
    document.getElementById("c-save").addEventListener("click", function () {
      var url = sgval("c-url").replace(/\/$/, "");
      var key = keyIn.value.trim();
      if (!/^https:\/\/.+\..+/.test(url)) return UI.toast("error", "URL tidak valid", "Gunakan format https://xxxx.supabase.co");
      if (key.length < 30) return UI.toast("error", "Key terlalu pendek", "Tempelkan anon key lengkap dari Project Settings > API Keys.");
      UI.confirmModal({ title: "Hubungkan ke Supabase ini?", message: "Halaman akan dimuat ulang dengan koneksi baru. Pastikan SQL schema sudah dijalankan di project tersebut. Kredensial tersimpan hanya di browser perangkat ini.", yesLabel: "Ya, Hubungkan" }).then(function (ok) {
        if (!ok) return;
        try { localStorage.setItem(LS_OVERRIDE, JSON.stringify({ url: url, key: key })); }
        catch (e) { return UI.toast("error", "Gagal menyimpan", "localStorage tidak tersedia di browser ini."); }
        location.reload();
      });
    });
    var drop = document.getElementById("c-drop");
    if (drop) drop.addEventListener("click", function () {
      UI.confirmModal({ title: "Putuskan koneksi?", message: "Website akan kembali ke Mode Demo (data contoh). Kredensial yang tersimpan di browser ini akan dihapus.", yesLabel: "Putuskan", danger: true }).then(function (ok) {
        if (!ok) return;
        localStorage.removeItem(LS_OVERRIDE);
        location.reload();
      });
    });
  }

  /* ---- Tab 4: Kontak & Sosial ---- */
  function renderTabKontak(body) {
    var s = state;
    body.innerHTML = panel("Kontak & Media Sosial", "", '<div class="form-grid">' +
      field("Nomor WhatsApp (format 62xxx)", inp("k-wa", s.whatsapp, "text", "6281234567890"), false, "Dipakai pada semua tombol WhatsApp & pesan otomatis di seluruh situs.") +
      field("Email Kontak", inp("k-email", s.email, "email", "halo@domain.com")) +
      field("Jam Operasional", inp("k-hours", s.operational_hours, "text", "Senin - Sabtu, 08.00 - 17.00 WIB")) +
      field("Alamat / Cakupan Layanan", inp("k-address", s.address, "text")) +
      field("Instagram", inp("k-ig", s.instagram, "url", "https://instagram.com/akun")) +
      field("Facebook", inp("k-fb", s.facebook, "url", "https://facebook.com/halaman")) +
      field("LinkedIn", inp("k-li", s.linkedin, "url", "https://linkedin.com/company/...")) +
      field("TikTok", inp("k-tt", s.tiktok, "url", "https://tiktok.com/@akun")) +
      field("YouTube", inp("k-yt", s.youtube, "url", "https://youtube.com/@channel")) +
      '<div class="form-actions"><button class="btn btn--primary" id="k-save"><i class="fa-solid fa-floppy-disk"></i> Simpan Kontak</button>' +
      '<span class="form-note"><i class="fa-solid fa-circle-info"></i> Mengosongkan ikon sosial akan menyembunyikan tautannya di footer.</span></div>' +
      "</div></div>");
    document.getElementById("k-save").addEventListener("click", function () {
      var wa = String(sgval("k-wa")).replace(/\D/g, "");
      if (wa && (wa.length < 9 || wa.length > 16)) return UI.toast("error", "Nomor WhatsApp tidak valid", "Gunakan format 628xxxxxxxxxx (tanpa spasi/tanda +).");
      saveSettingsBtn("k-save", {
        whatsapp: wa, email: sgval("k-email"), operational_hours: sgval("k-hours"), address: sgval("k-address"),
        instagram: sgval("k-ig"), facebook: sgval("k-fb"), linkedin: sgval("k-li"), tiktok: sgval("k-tt"), youtube: sgval("k-yt")
      }, "Kontak tersimpan", "Tombol WhatsApp dan ikon sosial di seluruh halaman ikut berubah.");
    });
  }

  /* ---- Tab 5: SEO & Statistik ---- */
  function renderTabSeo(body) {
    var s = state;
    body.innerHTML = panel("SEO & Statistik Beranda", "", '<div class="form-grid">' +
      field("SEO Title", inp("e-title", s.seo_title, "text"), true, "Judul pada tab browser & hasil pencarian Google (disarankan maks 60 karakter).") +
      field("Meta Description", ta("e-desc", s.seo_description, 3), true, "Ringkasan 150-160 karakter untuk hasil pencarian.") +
      field("Domain Produksi (canonical & Open Graph)", inp("e-url", s.site_url, "text", "https://www.aplikasiku.nd"), false, "Isi setelah domain final aktif — dipakai untuk canonical link, og:url, dan konsistensi sitemap.") +
      field("Statistik: Total Pengguna (angka animasi beranda)", inp("e-users", s.stats_users, "number")) +
      field("Statistik: Total Proyek Selesai (angka)", inp("e-projects", s.stats_projects, "number")) +
      '<div class="form-actions"><button class="btn btn--primary" id="e-save"><i class="fa-solid fa-floppy-disk"></i> Simpan SEO &amp; Statistik</button></div>' +
      "</div></div>");
    document.getElementById("e-save").addEventListener("click", function () {
      saveSettingsBtn("e-save", {
        seo_title: sgval("e-title"), seo_description: sgval("e-desc"),
        site_url: sgval("e-url").replace(/\/$/, ""),
        stats_users: String(Number(sgval("e-users")) || 0), stats_projects: String(Number(sgval("e-projects")) || 0)
      }, "SEO tersimpan", "Judul, deskripsi, dan statistik beranda diperbarui.", function () { UI.applyIdentity(state); });
    });
  }

  function panel(title, actions, body) {
    return '<div class="a-panel"><div class="a-panel__head"><h2>' + title + "</h2>" + (actions || "") + '</div><div class="a-panel__body">' + body + "</div></div>";
  }
  window.__ADMIN = { state: state };
})();
