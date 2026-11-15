/* ============================================================
   APLIKASIKU.ND — js/supabase.js
   ------------------------------------------------------------
   OVERRIDE KONEKSI (opsional) — diisi dari dashboard Admin >
   Pengaturan Website > tab "Koneksi Supabase". Tersimpan di
   localStorage browser ini SAJA (per perangkat). Untuk produksi
   yang permanen, tetap isi js/config.js.
   ============================================================ */
(function () {
  try {
    var raw = localStorage.getItem("apknd_supabase_override");
    if (!raw) return;
    var ov = JSON.parse(raw);
    if (ov && ov.url && ov.key && /^https?:\/\/.+/i.test(ov.url)) {
      window.APLIKASIKU_CONFIG = window.APLIKASIKU_CONFIG || {};
      window.APLIKASIKU_CONFIG.SUPABASE_URL = ov.url;
      window.APLIKASIKU_CONFIG.SUPABASE_ANON_KEY = ov.key;
      window.APLIKASIKU_MODE = "supabase";
      window.__SUPABASE_OVERRIDE = true;
    }
  } catch (e) { /* abaikan — override korup */ }
})();

/* ============================================================
   APLIKASIKU.ND — js/supabase.js (lanjutan)
   ------------------------------------------------------------
   LAPISAN DATA (Data Layer) — satu API, dua backend:
   1. MODE DEMO  : data contoh + localStorage (tanpa server).
   2. MODE SUPABASE: Supabase Database + Auth + Storage sungguhan.
   Semua halaman hanya memanggil window.DB dan window.Auth —
   tidak perlu tahu backend mana yang aktif.
   ============================================================ */

(function () {
  "use strict";

  var CFG = window.APLIKASIKU_CONFIG || {};
  var MODE = window.APLIKASIKU_MODE || "demo";
  var BUCKET = CFG.STORAGE_BUCKET || "media";
  var DEFAULTS = window.DEMO_SETTINGS || {};
  /* Kunci yang nilainya boleh kosong: bila kosong -> pakai bawaan */
  var EMPTY_IS_DEFAULT = { logo_url: 1, logo_light_url: 1, favicon_url: 1, og_image_url: 1, theme_primary: 1, theme_primary_dark: 1, site_url: 1, linkedin: 1 };
  function mergeSettings(dbRows) {
    var out = {}; Object.keys(DEFAULTS).forEach(function (k) { out[k] = DEFAULTS[k]; });
    Object.keys(dbRows || {}).forEach(function (k) {
      var v = dbRows[k];
      if (EMPTY_IS_DEFAULT[k] && (v === null || v === "")) return;
      out[k] = v;
    });
    return out;
  }

  /* ---------- util ---------- */
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  function slugify(str) {
    return String(str || "").toLowerCase().trim()
      .replace(/[^a-z0-9\u00C0-\u024F\s-]/g, "")
      .replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "item";
  }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms || 220); }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function mapCategoryName(list) {
    var m = {}; (list || []).forEach(function (c) { m[c.id] = c; }); return m;
  }
  function attachCat(apps, cats) {
    var m = mapCategoryName(cats);
    return apps.map(function (a) { a.category = m[a.category_id] || null; return a; });
  }

  /* ============================================================
     MODE DEMO — store di localStorage
     ============================================================ */
  var LS_KEY = "apknd_db_v1";

  function demoLoad() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var db = JSON.parse(raw);
        // migrasi ringan bila struktur lama kurang tabel
        var seed = window.DEMO_DATA || {};
        ["categories", "applications", "inquiries", "follow_ups", "testimonials", "faqs", "posts"].forEach(function (t) {
          if (!Array.isArray(db[t])) db[t] = clone(seed[t] || []);
        });
        if (!db.website_settings || typeof db.website_settings !== "object") db.website_settings = {};
        return db;
      }
    } catch (e) { /* korup -> reseed */ }
    var fresh = {};
    var d = window.DEMO_DATA || {};
    ["categories", "applications", "inquiries", "follow_ups", "testimonials", "faqs", "posts"].forEach(function (t) {
      fresh[t] = clone(d[t] || []);
    });
    fresh.website_settings = {};
    (d.website_settings || []).forEach(function (s) { fresh.website_settings[s.setting_key] = s.setting_value; });
    demoSave(fresh);
    return fresh;
  }
  function demoSave(db) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(db)); }
    catch (e) { console.warn("Gagal menyimpan data demo (localStorage penuh?)", e); }
  }

  function demoFilterApps(db, opt) {
    opt = opt || {};
    var items = clone(db.applications);
    var cats = mapCategoryName(db.categories);
    if (opt.category) items = items.filter(function (a) {
      var c = cats[a.category_id];
      return c && c.slug === opt.category;
    });
    if (opt.status) items = items.filter(function (a) { return a.status === opt.status; });
    if (opt.featuredOnly) items = items.filter(function (a) { return a.is_featured; });
    if (opt.excludeId) items = items.filter(function (a) { return a.id !== opt.excludeId; });
    if (opt.q) {
      var q = String(opt.q).toLowerCase();
      items = items.filter(function (a) {
        return (a.name || "").toLowerCase().indexOf(q) > -1 ||
          (a.short_description || "").toLowerCase().indexOf(q) > -1 ||
          (a.full_description || "").toLowerCase().indexOf(q) > -1;
      });
    }
    if (opt.sort === "popular") items.sort(function (a, b) { return (b.view_count || 0) - (a.view_count || 0); });
    else if (opt.sort === "name") items.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
    else items.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
    var total = items.length;
    if (opt.offset) items = items.slice(opt.offset);
    if (opt.limit) items = items.slice(0, opt.limit);
    items.forEach(function (a) { a.category = cats[a.category_id] || null; });
    return { items: items, total: total, hasMore: opt.offset + items.length < total };
  }

  /* ---------- implementasi mode demo ---------- */
  var demoDB = {
    getSettings: function () {
      var db = demoLoad();
      return delay(60).then(function () { return mergeSettings(db.website_settings || {}); });
    },
    saveSettings: function (obj) {
      var db = demoLoad();
      Object.keys(obj || {}).forEach(function (k) { db.website_settings[k] = String(obj[k]); });
      demoSave(db);
      return delay(80).then(function () { return true; });
    },
    getCategories: function () {
      var db = demoLoad();
      var counts = {};
      db.applications.forEach(function (a) { counts[a.category_id] = (counts[a.category_id] || 0) + 1; });
      var list = clone(db.categories).map(function (c) { c.app_count = counts[c.id] || 0; return c; });
      return delay(60).then(function () { return list; });
    },
    getApplications: function (opt) {
      var db = demoLoad();
      return delay(120).then(function () { return demoFilterApps(db, opt); });
    },
    getApplication: function (slug) {
      var db = demoLoad();
      var app = clone(db.applications.find(function (a) { return a.slug === slug; }) || null);
      if (app) app.category = mapCategoryName(db.categories)[app.category_id] || null;
      return delay(100).then(function () { return app; });
    },
    incrementView: function (id) {
      var db = demoLoad();
      var a = db.applications.find(function (x) { return x.id === id; });
      if (a) { a.view_count = (a.view_count || 0) + 1; demoSave(db); }
      return Promise.resolve();
    },
    createInquiry: function (data) {
      var db = demoLoad();
      var row = Object.assign({ id: uuid(), status: "Baru", created_at: new Date().toISOString() }, data);
      db.inquiries.unshift(row); demoSave(db);
      return delay(160).then(function () { return row; });
    },
    getInquiries: function () {
      var db = demoLoad();
      var apps = mapCategoryName(db.categories);
      var amap = {}; db.applications.forEach(function (a) { amap[a.id] = a.name; });
      var list = clone(db.inquiries).map(function (i) {
        i.application_name = i.application_id ? (amap[i.application_id] || "-") : (i.inquiry_type || "Custom");
        return i;
      });
      list.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
      return delay(100).then(function () { return list; });
    },
    updateInquiry: function (id, patch) {
      var db = demoLoad();
      var row = db.inquiries.find(function (i) { return i.id === id; });
      if (row) Object.assign(row, patch);
      demoSave(db);
      return delay(80).then(function () { return row || null; });
    },
    addFollowUp: function (data) {
      var db = demoLoad();
      var row = Object.assign({ id: uuid(), created_at: new Date().toISOString() }, data);
      db.follow_ups.push(row); demoSave(db);
      return delay(80).then(function () { return row; });
    },
    getFollowUps: function (inquiryId) {
      var db = demoLoad();
      var list = clone(db.follow_ups.filter(function (f) { return f.inquiry_id === inquiryId; }));
      list.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
      return delay(60).then(function () { return list; });
    },
    getTestimonials: function (activeOnly) {
      var db = demoLoad();
      var list = clone(db.testimonials);
      if (activeOnly) list = list.filter(function (t) { return t.is_active; });
      return delay(80).then(function () { return list; });
    },
    getFaqs: function (activeOnly) {
      var db = demoLoad();
      var list = clone(db.faqs);
      if (activeOnly) list = list.filter(function (f) { return f.is_active; });
      return delay(60).then(function () { return list; });
    },
    getPosts: function (opt) {
      opt = opt || {};
      var db = demoLoad();
      var list = clone(db.posts);
      if (opt.publishedOnly) list = list.filter(function (p) { return p.is_published; });
      if (opt.slug) list = list.filter(function (p) { return p.slug === opt.slug; });
      list.sort(function (a, b) { return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at); });
      return delay(90).then(function () { return opt.slug ? (list[0] || null) : list; });
    },
    uploadImage: function (file, folder) {
      if (!file) return Promise.reject(new Error("File tidak ada"));
      if (file.size > 400 * 1024) {
        return Promise.reject(new Error("Mode Demo mendukung gambar maksimal 400KB. Untuk upload penuh, hubungkan Supabase Storage (lihat Panduan)."));
      }
      return new Promise(function (resolve, reject) {
        var fr = new FileReader();
        fr.onload = function () { resolve(fr.result); };
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
    },
    /* generik CRUD */
    upsertRow: function (table, row) {
      var db = demoLoad();
      var now = new Date().toISOString();
      if (!row.id) { row.id = uuid(); row.created_at = now; }
      row.updated_at = now;
      var i = db[table].findIndex(function (r) { return r.id === row.id; });
      if (i > -1) db[table][i] = Object.assign({}, db[table][i], row);
      else db[table].unshift(row);
      demoSave(db);
      return delay(90).then(function () { return clone(db[table].find(function (r) { return r.id === row.id; })); });
    },
    deleteRow: function (table, id) {
      var db = demoLoad();
      db[table] = db[table].filter(function (r) { return r.id !== id; });
      demoSave(db);
      return delay(70).then(function () { return true; });
    }
  };

  window.__demoDB = demoDB;
  window.__helpers = { uuid: uuid, slugify: slugify, delay: delay, clone: clone, attachCat: attachCat, mapCategoryName: mapCategoryName, mergeSettings: mergeSettings };
})();

/* ============================================================
     MODE SUPABASE — Database + Auth + Storage sungguhan
     ============================================================ */
(function () {
  "use strict";
  if (window.APLIKASIKU_MODE !== "supabase" || !window.supabase || !window.supabase.createClient) return;

  var CFG = window.APLIKASIKU_CONFIG;
  var BUCKET = CFG.STORAGE_BUCKET || "media";
  var sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  var H = window.__helpers;
  var mergeSettings = H.mergeSettings; /* fungsi gabungan pengaturan — didefinisikan pada IIFE Mode Demo di atas */
  var DEFAULTS = window.DEMO_SETTINGS || {};
  var _catCache = null, _isAdmin = null;

  function catMap(list) { var m = {}; (list || []).forEach(function (c) { m[c.slug] = c.id; }); return m; }

  var supaDB = {
    mode: "supabase",
    getSettings: function () {
      return sb.from("website_settings").select("setting_key,setting_value")
        .then(function (r) {
          if (r.error) throw r.error;
          var rows = {};
          (r.data || []).forEach(function (s) { rows[s.setting_key] = s.setting_value; });
          return mergeSettings(rows);
        });
    },
    saveSettings: function (obj) {
      var rows = Object.keys(obj || {}).map(function (k) {
        return { setting_key: k, setting_value: String(obj[k]), updated_at: new Date().toISOString() };
      });
      return sb.from("website_settings").upsert(rows, { onConflict: "setting_key" }).then(function (r) {
        if (r.error) throw r.error; return true;
      });
    },
    getCategories: function () {
      return sb.from("categories").select("*").order("created_at").then(function (r) {
        if (r.error) throw r.error;
        _catCache = r.data;
        return sb.from("applications").select("category_id").then(function (r2) {
          var counts = {};
          (r2.data || []).forEach(function (a) { counts[a.category_id] = (counts[a.category_id] || 0) + 1; });
          return (r.data || []).map(function (c) { c.app_count = counts[c.id] || 0; return c; });
        });
      });
    },
    getApplications: function (opt) {
      opt = opt || {};
      var q = sb.from("applications").select("*, category:categories(id,name,slug,icon)", { count: "exact" });
      var build = function (catIdMap) {
        if (opt.category && catIdMap) { var cid = catIdMap[opt.category]; if (cid) q = q.eq("category_id", cid); }
        if (opt.status) q = q.eq("status", opt.status);
        if (opt.featuredOnly) q = q.eq("is_featured", true);
        if (opt.excludeId) q = q.neq("id", opt.excludeId);
        if (opt.q) {
          var safe = String(opt.q).replace(/[,()%]/g, "");
          if (safe) q = q.or("name.ilike.%" + safe + "%,short_description.ilike.%" + safe + "%,full_description.ilike.%" + safe + "%");
        }
        if (opt.sort === "popular") q = q.order("view_count", { ascending: false });
        else if (opt.sort === "name") q = q.order("name", { ascending: true });
        else q = q.order("created_at", { ascending: false });
        if (opt.limit != null) q = q.range(opt.offset || 0, (opt.offset || 0) + opt.limit - 1);
        return q.then(function (r) {
          if (r.error) throw r.error;
          return { items: r.data || [], total: r.count || (r.data || []).length, hasMore: opt.limit ? ((opt.offset || 0) + (r.data || []).length) < (r.count || 0) : false };
        });
      };
      if (opt.category) {
        return this.__catIds().then(build);
      }
      return build(null);
    },
    __catIds: function () {
      if (_catCache) return Promise.resolve(catMap(_catCache));
      return sb.from("categories").select("id,slug").then(function (r) {
        if (r.error) throw r.error;
        _catCache = r.data; return catMap(r.data);
      });
    },
    getApplication: function (slug) {
      return sb.from("applications").select("*, category:categories(id,name,slug,icon)").eq("slug", slug).maybeSingle()
        .then(function (r) { if (r.error) throw r.error; return r.data; });
    },
    incrementView: function (id) {
      return sb.rpc("increment_app_view", { p_app_id: id }).then(function (r) { if (r.error) console.warn(r.error); });
    },
    createInquiry: function (data) {
      var row = {
        full_name: data.full_name, organization: data.organization, whatsapp: data.whatsapp, email: data.email,
        application_id: data.application_id || null, inquiry_type: data.inquiry_type || "Konsultasi",
        description: data.description, desired_features: data.desired_features || "",
        budget: data.budget || "", target_date: data.target_date || null, status: "Baru"
      };
      return sb.from("inquiries").insert(row).select().single().then(function (r) {
        if (r.error) throw r.error; return r.data;
      });
    },
    getInquiries: function () {
      return sb.from("inquiries").select("*, application:applications(name)").order("created_at", { ascending: false })
        .then(function (r) {
          if (r.error) throw r.error;
          return (r.data || []).map(function (i) {
            i.application_name = i.application ? i.application.name : (i.inquiry_type || "Custom");
            return i;
          });
        });
    },
    updateInquiry: function (id, patch) {
      return sb.from("inquiries").update(patch).eq("id", id).select().single().then(function (r) {
        if (r.error) throw r.error; return r.data;
      });
    },
    addFollowUp: function (data) {
      return sb.from("follow_ups").insert({
        inquiry_id: data.inquiry_id, note: data.note,
        follow_up_date: data.follow_up_date || new Date().toISOString().slice(0, 10),
        created_by: data.created_by || "admin"
      }).select().single().then(function (r) { if (r.error) throw r.error; return r.data; });
    },
    getFollowUps: function (inquiryId) {
      return sb.from("follow_ups").select("*").eq("inquiry_id", inquiryId).order("created_at", { ascending: false })
        .then(function (r) { if (r.error) throw r.error; return r.data || []; });
    },
    getTestimonials: function (activeOnly) {
      var q = sb.from("testimonials").select("*").order("created_at", { ascending: false });
      if (activeOnly) q = q.eq("is_active", true);
      return q.then(function (r) { if (r.error) throw r.error; return r.data || []; });
    },
    getFaqs: function (activeOnly) {
      var q = sb.from("faqs").select("*").order("created_at");
      if (activeOnly) q = q.eq("is_active", true);
      return q.then(function (r) { if (r.error) throw r.error; return r.data || []; });
    },
    getPosts: function (opt) {
      opt = opt || {};
      var q = sb.from("posts").select("*").order("published_at", { ascending: false });
      if (opt.publishedOnly) q = q.eq("is_published", true);
      if (opt.slug) return q.eq("slug", opt.slug).maybeSingle().then(function (r) { if (r.error) throw r.error; return r.data; });
      return q.then(function (r) { if (r.error) throw r.error; return r.data || []; });
    },
    uploadImage: function (file, folder) {
      if (!file) return Promise.reject(new Error("File tidak ada"));
      var ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      var path = (folder || "uploads") + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      return sb.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false })
        .then(function (r) {
          if (r.error) throw r.error;
          return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        });
    },
    upsertRow: function (table, row) {
      var r2 = Object.assign({}, row);
      delete r2.category;
      if (!r2.id) { delete r2.id; r2.created_at = new Date().toISOString(); }
      r2.updated_at = new Date().toISOString();
      return sb.from(table).upsert(r2).select().single().then(function (r) {
        if (r.error) throw r.error; return r.data;
      });
    },
    deleteRow: function (table, id) {
      return sb.from(table).delete().eq("id", id).then(function (r) { if (r.error) throw r.error; return true; });
    }
  };

  /* ---------- Auth ---------- */
  var supaAuth = {
    mode: "supabase",
    getSession: function () { return sb.auth.getSession().then(function (r) { return r.data.session; }); },
    signIn: function (email, password) {
      return sb.auth.signInWithPassword({ email: email, password: password }).then(function (r) {
        if (r.error) throw r.error;
        _isAdmin = null;
        return supaAuth.isAdmin().then(function (ok) {
          if (!ok) {
            return supaAuth.signOut().then(function () {
              throw new Error("Login berhasil, tetapi akun ini belum terdaftar sebagai admin. Tambahkan ke tabel admins (lihat Panduan Bagian 5).");
            });
          }
          return r.data.session;
        });
      });
    },
    signOut: function () { return sb.auth.signOut(); },
    isAdmin: function () {
      if (_isAdmin !== null) return Promise.resolve(_isAdmin);
      return sb.from("admins").select("user_id").limit(1).then(function (r) {
        _isAdmin = !r.error && (r.data || []).length > 0;
        return _isAdmin;
      }).catch(function () { return false; });
    },
    onChange: function (cb) { sb.auth.onAuthStateChange(function (_e, session) { cb(session); }); },
    sendReset: function (email) { return sb.auth.resetPasswordForEmail(email); }
  };

  window.DB = supaDB;
  window.Auth = supaAuth;
  window.__supabaseClient = sb;
})();

/* ---------- Ekspor akhir: pilih backend sesuai mode ---------- */
(function () {
  if (!window.DB) {
    var demo = window.__demoDB;
    var H = window.__helpers;
    var LS_SESSION = "apknd_demo_session";
    var demoAuth = {
      mode: "demo",
      getSession: function () {
        try { return Promise.resolve(JSON.parse(localStorage.getItem(LS_SESSION) || "null")); }
        catch (e) { return Promise.resolve(null); }
      },
      signIn: function (email, password) {
        var cfg = window.APLIKASIKU_CONFIG;
        if (String(email).trim().toLowerCase() === cfg.DEMO_ADMIN_EMAIL && password === cfg.DEMO_ADMIN_PASSWORD) {
          var s = { user: { email: cfg.DEMO_ADMIN_EMAIL, id: "demo-admin" }, demo: true };
          localStorage.setItem(LS_SESSION, JSON.stringify(s));
          return H.delay(250).then(function () { return s; });
        }
        return H.delay(250).then(function () {
          throw new Error("Email atau password demo salah. Gunakan " + cfg.DEMO_ADMIN_EMAIL + " / " + cfg.DEMO_ADMIN_PASSWORD);
        });
      },
      signOut: function () { localStorage.removeItem(LS_SESSION); return Promise.resolve(); },
      isAdmin: function () { return demoAuth.getSession().then(function (s) { return !!s; }); },
      onChange: function (cb) { demoAuth.getSession().then(cb); },
      sendReset: function () {
        return Promise.reject(new Error("Reset password hanya tersedia pada mode Supabase."));
      }
    };
    demo.mode = "demo";
    window.DB = demo;
    window.Auth = demoAuth;
  }
  /* wrapper CRUD generik untuk kedua mode */
  var DB = window.DB;
  DB.mode = DB.mode || window.APLIKASIKU_MODE;
  DB.upsertCategory = function (r) { return DB.upsertRow("categories", r); };
  DB.upsertApplication = function (r) { return DB.upsertRow("applications", r); };
  DB.upsertTestimonial = function (r) { return DB.upsertRow("testimonials", r); };
  DB.upsertFaq = function (r) { return DB.upsertRow("faqs", r); };
  DB.upsertPost = function (r) { return DB.upsertRow("posts", r); };
  DB.deleteCategory = function (id) { return DB.deleteRow("categories", id); };
  DB.deleteApplication = function (id) { return DB.deleteRow("applications", id); };
  DB.deleteTestimonial = function (id) { return DB.deleteRow("testimonials", id); };
  DB.deleteFaq = function (id) { return DB.deleteRow("faqs", id); };
  DB.deletePost = function (id) { return DB.deleteRow("posts", id); };

  /* ---------- Uji koneksi Supabase (dipakai tab Koneksi Supabase) ----------
     Membuat klien sementara dari URL+key yang diketik user (belum
     harus tersimpan), lalu membaca 1 baris website_settings dan
     mengecek keterbacaan bucket storage. */
  DB.testConnection = function (url, key) {
    if (!url || !key) return Promise.reject(new Error("URL dan anon key wajib diisi terlebih dahulu."));
    if (!/^https:\/\/.+\..+/i.test(String(url).trim())) {
      return Promise.reject(new Error("Format URL tidak valid (harus diawali https://). Contoh: https://abcdefghijk.supabase.co"));
    }
    if (!window.supabase || !window.supabase.createClient) {
      return Promise.reject(new Error("Pustaka Supabase JS gagal dimuat. Periksa koneksi internet / CDN lalu muat ulang halaman."));
    }
    var client;
    try { client = window.supabase.createClient(String(url).trim().replace(/\/$/, ""), String(key).trim()); }
    catch (e) { return Promise.reject(new Error("Gagal membuat klien: " + e.message)); }
    var B = window.APLIKASIKU_CONFIG.STORAGE_BUCKET || "media";
    return client.from("website_settings").select("setting_key").limit(1).then(function (r) {
      if (r.error) {
        var msg = r.error.message || "Query gagal";
        if (/relation|does not exist|schema/i.test(msg)) msg += " — kemungkinan SQL (sql/supabase-schema.sql) belum dijalankan di Supabase SQL Editor.";
        if (/JWT|apikey|Invalid API key/i.test(msg)) msg += " — periksa kembali anon key Anda (bukan service_role).";
        return { ok: false, message: msg, storage: "" };
      }
      return client.storage.from(B).list("", { limit: 1 }).then(function (sr) {
        return {
          ok: true,
          message: "Berhasil! Database terhubung dan tabel website_settings dapat dibaca.",
          storage: sr && sr.error ? ("Bucket \"" + B + "\" belum dapat dibaca — buat bucket publik \"" + B + "\" (Panduan Bagian 4) agar upload logo berfungsi.") : ("Bucket storage \"" + B + "\" juga siap dipakai untuk upload logo/gambar.")
        };
      }).catch(function () {
        return { ok: true, message: "Berhasil! Database terhubung.", storage: "Bucket storage \"" + B + "\" belum dapat dibaca — buat bucket publik (Panduan Bagian 4)." };
      });
    }, function (netErr) {
      return { ok: false, message: "Tidak dapat menghubungi server Supabase. Periksa URL dan koneksi internet Anda. " + (netErr && netErr.message ? "(" + netErr.message + ")" : ""), storage: "" };
    });
  };
})();
