/* ============================================================
   APLIKASIKU.ND — js/app.js
   UI publik: komponen inti + logika semua halaman.
   Halaman ditandai lewat <body data-page="home|katalog|detail|
   kategori|layanan|tentang|kontak|blog|login">
   ============================================================ */

(function () {
  "use strict";

  var CFG = window.APLIKASIKU_CONFIG || {};
  var MODE = window.APLIKASIKU_MODE || "demo";
  var H = window.__helpers;
  var state = { settings: {}, categories: [] };

  /* =================== Util =================== */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function fmtRupiah(n) {
    n = Number(n || 0);
    return "Rp " + n.toLocaleString("id-ID");
  }
  function fmtDate(iso, withTime) {
    if (!iso) return "-";
    var d = new Date(iso);
    if (isNaN(d)) return "-";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
      (withTime ? " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "");
  }
  function qs(name) {
    return new URLSearchParams(location.search).get(name) || "";
  }
  function pathSlug() {
    var m = location.pathname.match(/^\/aplikasi\/([a-z0-9-]+)\/?$/i);
    return m ? m[1] : "";
  }
  function statusClass(s) {
    if (/tersedia/i.test(s || "")) return "tersedia";
    if (/pengembangan/i.test(s || "")) return "pengembangan";
    return "segera";
  }
  function priceInfo(app) {
    var t = app.pricing_type;
    if (t === "gratis") return { main: "Gratis", small: "tanpa biaya" };
    if (t === "sekali_bayar") return { main: fmtRupiah(app.price), small: "sekali bayar" };
    if (t === "langganan") return { main: fmtRupiah(app.price), small: "per bulan" };
    return { main: "Konsultasi", small: "hubungi kami" };
  }
  function waBase() {
    var num = (state.settings && state.settings.whatsapp) || CFG.DEFAULT_WHATSAPP || "6281234567890";
    return "https://wa.me/" + String(num).replace(/\D/g, "");
  }
  function waLink(msg) { return waBase() + "?text=" + encodeURIComponent(msg); }
  function waAppMsg(name) {
    return "Halo " + (state.settings.site_name || "Aplikasiku.nd") + ", saya tertarik dengan aplikasi " + name +
      ". Saya ingin mendapatkan informasi lebih lanjut mengenai fitur, demo, dan harga aplikasi tersebut.";
  }
  function detailHref(slug) { return "detail.html?id=" + encodeURIComponent(slug); }
  function thumbFallback(app) {
    return app && app.thumbnail_url ? app.thumbnail_url : "assets/img/thumbs/website-custom.svg";
  }
  function imgTag(src, alt, cls) {
    var safe = src && /^(https?:|data:|assets\/)/.test(src) ? src : thumbFallback({ thumbnail_url: null });
    return '<img src="' + esc(safe) + '" alt="' + esc(alt) + '" class="' + (cls || "") + '" loading="lazy" ' +
      'onerror="this.onerror=null;this.src=\'assets/img/thumbs/website-custom.svg\'">';
  }

  /* =================== Komponen kartu aplikasi =================== */
  function badgeStatus(status) {
    return '<span class="badge badge--' + statusClass(status) + ' badge--dot">' + esc(status) + "</span>";
  }
  function appCardHTML(app, opts) {
    opts = opts || {};
    var feat = (app.features || []).slice(0, 3).map(function (f) {
      return '<li><i class="fa-solid fa-circle-check"></i>' + esc(f) + "</li>";
    }).join("");
    var extra = (app.features || []).length > 3 ? '<span class="app-card__more">+' + ((app.features || []).length - 3) + " fitur lainnya</span>" : "";
    var p = priceInfo(app);
    var demoHref = app.demo_url
      ? '<a class="btn btn--outline btn--sm" href="' + esc(app.demo_url) + '" target="_blank" rel="noopener"><i class="fa-solid fa-play"></i>Demo</a>'
      : '<a class="btn btn--outline btn--sm" href="' + waLink(waAppMsg(app.name)) + '" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i>Demo</a>';
    return '<article class="app-card reveal in">' +
      '<div class="app-card__media">' +
        '<a href="' + detailHref(app.slug) + '">' + imgTag(app.thumbnail_url, "Thumbnail aplikasi " + app.name) + "</a>" +
        badgeStatus(app.status) +
        (app.category ? '<span class="badge badge--cat">' + esc(app.category.name.split("(")[0].trim()) + "</span>" : "") +
        (app.demo ? '<span class="badge badge--demo"><i class="fa-solid fa-flask"></i>Contoh</span>' : "") +
      "</div>" +
      '<div class="app-card__body">' +
        '<h3 class="app-card__title"><a href="' + detailHref(app.slug) + '">' + esc(app.name) + "</a></h3>" +
        '<p class="app-card__desc">' + esc(app.short_description) + "</p>" +
        '<ul class="app-card__features">' + feat + "</ul>" + extra +
        '<div class="app-card__meta"><div class="app-card__price">' + p.main + "<small>" + p.small + "</small></div></div>" +
        '<div class="app-card__actions">' +
          '<a class="btn btn--primary btn--sm" href="' + detailHref(app.slug) + '"><i class="fa-solid fa-arrow-up-right-from-square"></i>Detail</a>' +
          demoHref +
          '<a class="btn btn--navy btn--sm" href="kontak.html?app=' + encodeURIComponent(app.slug) + '"><i class="fa-solid fa-cart-shopping"></i>Pesan</a>' +
        "</div>" +
      "</div></article>";
  }
  function skeletonCards(n) {
    var out = "";
    for (var i = 0; i < n; i++) {
      out += '<div class="app-card sk-card"><div class="skeleton sk-card__media"></div>' +
        '<div class="sk-card__body"><i style="width:60%"></i><i style="width:95%"></i><i style="width:85%"></i><i style="width:40%"></i></div></div>';
    }
    return out;
  }
  function emptyStateHTML(icon, title, desc, action) {
    return '<div class="empty-state"><i class="fa-solid ' + icon + '"></i><h3>' + esc(title) + "</h3><p>" + esc(desc) + "</p>" + (action || "") + "</div>";
  }

  /* =================== Toast =================== */
  function toast(type, title, msg, ms) {
    var wrap = document.querySelector(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    var icons = { success: "fa-circle-check", error: "fa-circle-xmark", info: "fa-circle-info", warning: "fa-triangle-exclamation" };
    var el = document.createElement("div");
    el.className = "toast toast--" + type;
    el.innerHTML = '<i class="fa-solid ' + (icons[type] || icons.info) + '"></i><div><strong>' + esc(title) + "</strong>" + (msg ? "<span>" + esc(msg) + "</span>" : "") + "</div>";
    wrap.appendChild(el);
    setTimeout(function () { el.classList.add("is-out"); setTimeout(function () { el.remove(); }, 320); }, ms || 4200);
  }

  /* =================== Modal konfirmasi =================== */
  function confirmModal(opts) {
    return new Promise(function (resolve) {
      var ov = document.createElement("div");
      ov.className = "modal-overlay is-open";
      ov.innerHTML = '<div class="modal modal--sm" role="dialog" aria-modal="true">' +
        '<div class="modal__head"><h3>' + esc(opts.title || "Konfirmasi") + '</h3>' +
        '<button class="modal__close" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button></div>' +
        '<div class="modal__body"><p>' + esc(opts.message || "Lanjutkan?") + "</p></div>" +
        '<div class="modal__foot">' +
          '<button class="btn btn--outline" data-act="no">' + esc(opts.noLabel || "Batal") + "</button>" +
          '<button class="btn ' + (opts.danger ? "btn--danger" : "btn--primary") + '" data-act="yes">' + esc(opts.yesLabel || "Ya, lanjutkan") + "</button>" +
        "</div></div>";
      document.body.appendChild(ov);
      function close(v) { ov.remove(); resolve(v); }
      ov.addEventListener("click", function (e) {
        if (e.target === ov) close(false);
        var b = e.target.closest("[data-act],.modal__close");
        if (!b) return;
        if (b.dataset.act === "yes") close(true); else close(false);
      });
    });
  }

  /* =================== Tema warna & identitas brand (v1.1) ===================
     Warna utama, logo, favicon, dsb. dikelola dari Admin > Pengaturan.
     Warna diaplikasikan lewat CSS variables sehingga seluruh halaman
     (termasuk tombol, gradasi, fokus, bayangan) ikut berubah. */
  function hexToRgb(hex) {
    hex = String(hex || "").trim().replace("#", "");
    if (/^[0-9a-f]{3}$/i.test(hex)) hex = hex.replace(/./g, "$&$&");
    if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
    var n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(hex, target, t) {
    var a = hexToRgb(hex), b = hexToRgb(target);
    if (!a || !b) return null;
    return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * t) + "," + Math.round(a[1] + (b[1] - a[1]) * t) + "," + Math.round(a[2] + (b[2] - a[2]) * t) + ")";
  }
  function applyTheme(settings) {
    var s = settings || {};
    var p = s.theme_primary;
    if (!p || !hexToRgb(p)) return;
    var d = (s.theme_primary_dark && hexToRgb(s.theme_primary_dark)) ? s.theme_primary_dark : mix(p, "#000000", 0.24);
    var r = document.documentElement.style;
    r.setProperty("--blue", p);
    r.setProperty("--blue-dark", d);
    r.setProperty("--blue-soft", mix(p, "#ffffff", 0.9));
    r.setProperty("--blue-light", mix(p, "#ffffff", 0.34));
    r.setProperty("--blue-rgb", hexToRgb(p).join(","));
  }
  function applyIdentity(settings) {
    var s = settings || {};
    /* gantiLogo: pakai URL pengaturan bila ada, selain itu kembali ke src bawaan
       (src asli disimpan di data-orig agar pengosongan logo benar-benar memulihkan). */
    function gantiLogo(sel, url) {
      document.querySelectorAll(sel).forEach(function (img) {
        if (!img.dataset.orig) img.dataset.orig = img.getAttribute("src");
        if (url) img.src = url; else img.src = img.dataset.orig;
      });
    }
    gantiLogo("img[data-brand-logo]", s.logo_url);
    gantiLogo("img[data-brand-logo-light]", s.logo_light_url);
    gantiLogo("img[data-brand-logo-admin]", s.logo_url);
    if (s.favicon_url) {
      var fav = document.querySelector('link[rel="icon"]');
      if (fav) fav.href = s.favicon_url;
    }
    if (s.og_image_url) {
      document.querySelectorAll('meta[property="og:image"]').forEach(function (m) { m.setAttribute("content", s.og_image_url); });
    }
    if (s.site_url) {
      var ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", s.site_url);
      var canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = s.site_url + location.pathname.replace(/^\//, "");
    }
    if (s.theme_navbar === "dark") document.body.classList.add("theme-navbar-dark");
    document.querySelectorAll("[data-footer-note]").forEach(function (el) { el.textContent = s.footer_note || "Kerja Jadi Lebih Mudah."; });
    document.querySelectorAll("[data-brand-logo-admin]").forEach(function (img) { img.src = s.logo_url || img.getAttribute("src"); });
  }

  /* =================== Apply settings ke UI global =================== */
  function applyGlobalUI() {
    var s = state.settings;
    document.querySelectorAll("[data-brand-name]").forEach(function (el) {
      el.innerHTML = esc(s.site_name || "Aplikasiku").replace(/\.(nd|ND)$/, "") + "<b>" + esc((s.site_name || "aplikasiku.nd").slice(-3).startsWith(".") ? "." + (s.site_name || "").split(".").pop() : "") + "</b>";
    });
    document.querySelectorAll("[data-set-wa]").forEach(function (el) { el.href = waLink("Halo " + (s.site_name || "Aplikasiku.nd") + ", saya ingin berkonsultasi mengenai kebutuhan aplikasi digital."); });
    document.querySelectorAll("[data-set-email]").forEach(function (el) { el.textContent = s.email || "-"; el.href = "mailto:" + (s.email || ""); });
    document.querySelectorAll("[data-set-hours]").forEach(function (el) { el.textContent = s.operational_hours || "-"; });
    document.querySelectorAll("[data-set-address]").forEach(function (el) { el.textContent = s.address || "-"; });
    document.querySelectorAll("[data-set-tagline]").forEach(function (el) { el.textContent = s.tagline || "Kerja Jadi Lebih Mudah"; });
    var soc = { instagram: s.instagram, facebook: s.facebook, tiktok: s.tiktok, youtube: s.youtube, linkedin: s.linkedin };
    document.querySelectorAll("[data-social]").forEach(function (a) {
      var key = a.dataset.social;
      if (soc[key]) { a.href = soc[key]; a.target = "_blank"; a.rel = "noopener"; }
    });
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    applyTheme(s);
    applyIdentity(s);
    if (MODE === "demo" && !document.body.classList.contains("hide-demo-pill")) showDemoPill();
    if (document.body.dataset.page && s.seo_title) document.title = s.seo_title;
  }
  function showDemoPill() {
    var pill = document.createElement("a");
    pill.className = "badge badge--demo";
    pill.style.cssText = "position:fixed;left:18px;bottom:20px;z-index:870;cursor:pointer;box-shadow:var(--sh-md)";
    pill.innerHTML = '<i class="fa-solid fa-flask"></i> Mode Demo';
    pill.title = "Klik untuk penjelasan Mode Demo";
    pill.href = "docs/PANDUAN-LENGKAP.md";
    pill.addEventListener("click", function (e) {
      e.preventDefault();
      toast("info", "Mode Demo aktif", "Data contoh disimpan di browser Anda. Hubungkan Supabase melalui js/config.js untuk data nyata (lihat docs/PANDUAN-LENGKAP.md).", 7000);
    });
    document.body.appendChild(pill);
  }
  function applySEO(app) {
    if (app) {
      document.title = app.name + " — " + (state.settings.site_name || "Aplikasiku.nd");
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute("content", app.short_description || "");
    }
  }

  /* =================== Inisialisasi umum =================== */
  function initNavbar() {
    var nav = document.querySelector(".navbar");
    var burger = document.querySelector(".navbar__toggle");
    var menu = document.querySelector(".mobile-menu");
    var onScroll = function () { nav && nav.classList.toggle("is-scrolled", window.scrollY > 10); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    if (burger && menu) {
      burger.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
      });
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { menu.classList.remove("is-open"); burger.innerHTML = '<i class="fa-solid fa-bars"></i>'; });
      });
    }
    var page = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.dataset.nav === page) { a.classList.add("is-active"); a.setAttribute("aria-current", "page"); }
    });
  }
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }
  function initCountUp() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    var run = function (el) {
      var target = parseInt(el.dataset.count || "0", 10);
      var dur = 1300, t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("id-ID");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    els.forEach(function (e) { io.observe(e); });
  }
  function initFaqAccordion(container) {
    (container || document).querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-item__q");
      if (!q || q.dataset.bound) return;
      q.dataset.bound = "1";
      q.addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        (container || document).querySelectorAll(".faq-item.is-open").forEach(function (o) {
          o.classList.remove("is-open"); var a = o.querySelector(".faq-item__a"); if (a) a.style.maxHeight = null;
        });
        if (!open) {
          item.classList.add("is-open");
          var a = item.querySelector(".faq-item__a");
          if (a) a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });
  }
  function renderFaqList(list, mount) {
    if (!mount) return;
    if (!list.length) { mount.innerHTML = emptyStateHTML("fa-circle-question", "Belum ada FAQ", "Daftar tanya jawab akan tampil di sini."); return; }
    mount.innerHTML = list.map(function (f) {
      return '<div class="faq-item"><button class="faq-item__q" type="button"><span>' + esc(f.question) + '</span><i class="fa-solid fa-plus"></i></button>' +
        '<div class="faq-item__a"><p>' + esc(f.answer) + "</p></div></div>";
    }).join("");
    initFaqAccordion(mount);
  }

  window.__UI = {
    esc: esc, fmtRupiah: fmtRupiah, fmtDate: fmtDate, qs: qs, pathSlug: pathSlug, statusClass: statusClass,
    priceInfo: priceInfo, waBase: waBase, waLink: waLink, waAppMsg: waAppMsg, detailHref: detailHref,
    imgTag: imgTag, badgeStatus: badgeStatus, appCardHTML: appCardHTML, skeletonCards: skeletonCards,
    emptyStateHTML: emptyStateHTML, toast: toast, confirmModal: confirmModal,
    applyGlobalUI: applyGlobalUI, initNavbar: initNavbar, initReveal: initReveal, initCountUp: initCountUp,
    initFaqAccordion: initFaqAccordion, renderFaqList: renderFaqList, applySEO: applySEO, state: state,
    applyTheme: applyTheme, applyIdentity: applyIdentity, hexToRgb: hexToRgb, mixColor: mix
  };
})();

/* =================== Logika per halaman =================== */
(function () {
  "use strict";
  var UI = window.__UI;
  var CFG = window.APLIKASIKU_CONFIG || {};
  var MODE = window.APLIKASIKU_MODE || "demo";
  var DB = window.DB, state = UI.state;

  /* ---------- HOME ---------- */
  function initHome() {
    var s = state.settings;
    var heroTitle = document.querySelector("[data-hero-title]");
    var heroDesc = document.querySelector("[data-hero-desc]");
    if (heroTitle) heroTitle.innerHTML = UI.esc(s.hero_headline || "").replace(/Lebih Mudah\.$/, "<em>Lebih Mudah.</em>");
    if (heroDesc) heroDesc.textContent = s.hero_subheadline || "";
    var ctaH = document.querySelector("[data-cta-headline]"); if (ctaH) ctaH.textContent = s.cta_headline || "";
    var ctaD = document.querySelector("[data-cta-desc]"); if (ctaD) ctaD.textContent = s.cta_description || "";

    var grid = document.getElementById("featured-grid");
    if (grid) {
      DB.getApplications({ featuredOnly: true, limit: 3, sort: "newest" }).then(function (r) {
        if (!r.items.length) {
          return DB.getApplications({ limit: 3 }).then(function (r2) { paint(r2.items); });
        }
        paint(r.items);
        function paint(items) { grid.innerHTML = items.map(function (a) { return UI.appCardHTML(a); }).join(""); }
      }).catch(function (e) { grid.innerHTML = UI.emptyStateHTML("fa-triangle-exclamation", "Gagal memuat", "Coba muat ulang halaman."); console.error(e); });
    }
    var tg = document.getElementById("testi-grid");
    if (tg) {
      DB.getTestimonials(true).then(function (list) {
        tg.innerHTML = list.slice(0, 3).map(function (t) {
          var stars = "★★★★★".slice(0, t.rating || 5) + "☆☆☆☆☆".slice(0, 5 - (t.rating || 5));
          var initials = (t.customer_name || "?").split(" ").map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
          return '<div class="testi-card reveal"><div class="stars">' + stars + '</div><blockquote>"' + UI.esc(t.content) + '"</blockquote>' +
            '<div class="testi-card__who"><div class="testi-card__ava">' + UI.esc(initials) + "</div><div><b>" + UI.esc(t.customer_name) + "</b><span>" + UI.esc(t.organization || "") + "</span></div></div></div>";
        }).join("");
        UI.initReveal();
      });
    }
    Promise.all([DB.getApplications({ limit: 1 }), DB.getCategories()]).then(function (res) {
      var set = function (id, val) { var el = document.getElementById(id); if (el) el.dataset.count = val; };
      set("stat-apps", res[0].total); set("stat-cats", res[1].length);
      set("stat-users", parseInt(s.stats_users || "1500", 10)); set("stat-projects", parseInt(s.stats_projects || "120", 10));
      UI.initCountUp();
    });
    UI.renderFaqList([], null);
  }

  /* ---------- KATALOG ---------- */
  function initKatalog() {
    var grid = document.getElementById("app-grid");
    var chips = document.getElementById("cat-chips");
    var search = document.getElementById("search-input");
    var statusSel = document.getElementById("filter-status");
    var sortSel = document.getElementById("sort-select");
    var moreBtn = document.getElementById("load-more");
    var info = document.getElementById("result-info");
    var LIMIT = 6;
    var st = { q: UI.qs("q"), category: UI.qs("kategori"), status: UI.qs("status"), sort: UI.qs("urut") || "newest", view: UI.qs("tampil") === "list" ? "list" : "grid", page: 0, total: 0 };

    function syncURL() {
      var p = new URLSearchParams();
      if (st.q) p.set("q", st.q);
      if (st.category) p.set("kategori", st.category);
      if (st.status) p.set("status", st.status);
      if (st.sort !== "newest") p.set("urut", st.sort);
      if (st.view === "list") p.set("tampil", "list");
      history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
    }
    function paintChips() {
      var html = '<button class="chip' + (!st.category ? " is-active" : "") + '" data-cat="">Semua</button>';
      html += state.categories.map(function (c) {
        return '<button class="chip' + (st.category === c.slug ? " is-active" : "") + '" data-cat="' + UI.esc(c.slug) + '">' + UI.esc(c.name.split("(")[0].trim()) + "</button>";
      }).join("");
      chips.innerHTML = html;
      chips.querySelectorAll(".chip").forEach(function (b) {
        b.addEventListener("click", function () {
          st.category = b.dataset.cat; st.page = 0;
          chips.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("is-active"); });
          b.classList.add("is-active");
          syncURL(); load(true);
        });
      });
    }
    function load(reset) {
      moreBtn.disabled = true;
      if (reset) { grid.innerHTML = UI.skeletonCards(6); moreBtn.style.display = "none"; }
      var opt = { q: st.q, category: st.category, status: st.status, sort: st.sort, limit: LIMIT, offset: st.page * LIMIT };
      DB.getApplications(opt).then(function (r) {
        st.total = r.total;
        var html = r.items.map(function (a) { return UI.appCardHTML(a); }).join("");
        if (reset) grid.innerHTML = html; else grid.insertAdjacentHTML("beforeend", html);
        var shown = Math.min((st.page + 1) * LIMIT, r.total);
        info.innerHTML = r.total ? "Menampilkan <b>" + shown + "</b> dari <b>" + r.total + "</b> aplikasi" : "";
        grid.classList.toggle("app-grid--list", st.view === "list");
        grid.classList.toggle("app-grid", true);
        if (!r.items.length && reset) {
          grid.innerHTML = "";
          grid.insertAdjacentHTML("beforeend", '<div style="grid-column:1/-1">' + UI.emptyStateHTML("fa-magnifying-glass", "Aplikasi tidak ditemukan", "Coba ubah kata kunci pencarian atau reset filter.", '<button class="btn btn--outline" id="reset-filter"><i class="fa-solid fa-rotate-left"></i> Reset Filter</button>') + "</div>");
          var rf = document.getElementById("reset-filter");
          if (rf) rf.addEventListener("click", function () {
            st.q = ""; st.category = ""; st.status = ""; search.value = ""; statusSel.value = ""; paintChips(); syncURL(); load(true);
          });
        }
        moreBtn.style.display = r.hasMore ? "inline-flex" : "none";
        moreBtn.disabled = false;
      }).catch(function (e) {
        grid.innerHTML = "";
        grid.insertAdjacentHTML("beforeend", '<div style="grid-column:1/-1">' + UI.emptyStateHTML("fa-triangle-exclamation", "Gagal memuat katalog", String(e.message || e), "") + "</div>");
        moreBtn.disabled = false;
      });
    }
    DB.getCategories().then(function (cats) {
      state.categories = cats; paintChips();
      if (st.status) statusSel.value = st.status;
      if (st.sort) sortSel.value = st.sort;
      if (st.q) search.value = st.q;
      if (st.view === "list") { document.getElementById("view-list").classList.add("is-active"); document.getElementById("view-grid").classList.remove("is-active"); }
      var t = document.querySelector(".page-hero h1");
      if (st.category) {
        var c = cats.find(function (x) { return x.slug === st.category; });
        if (c && t) t.textContent = "Katalog: " + c.name;
      }
      load(true);
    });
    var deb;
    search.addEventListener("input", function () {
      clearTimeout(deb);
      deb = setTimeout(function () { st.q = search.value.trim(); st.page = 0; syncURL(); load(true); }, 320);
    });
    statusSel.addEventListener("change", function () { st.status = statusSel.value; st.page = 0; syncURL(); load(true); });
    sortSel.addEventListener("change", function () { st.sort = sortSel.value; st.page = 0; syncURL(); load(true); });
    document.getElementById("view-grid").addEventListener("click", function () {
      st.view = "grid"; document.getElementById("view-grid").classList.add("is-active");
      document.getElementById("view-list").classList.remove("is-active"); grid.classList.remove("app-grid--list"); syncURL();
    });
    document.getElementById("view-list").addEventListener("click", function () {
      st.view = "list"; document.getElementById("view-list").classList.add("is-active");
      document.getElementById("view-grid").classList.remove("is-active"); grid.classList.add("app-grid--list"); syncURL();
    });
    moreBtn.addEventListener("click", function () { st.page++; load(false); });
  }

  /* ---------- DETAIL ---------- */
  function initDetail() {
    var slug = UI.qs("id") || UI.pathSlug();
    var main = document.getElementById("detail-main");
    if (!slug) {
      main.innerHTML = UI.emptyStateHTML("fa-file-circle-question", "Aplikasi tidak ditemukan", "Tidak ada parameter aplikasi pada tautan ini.", '<a class="btn btn--primary" href="katalog.html">Kembali ke Katalog</a>');
      return;
    }
    main.innerHTML = '<div class="skeleton" style="height:320px"></div><div class="skeleton" style="height:180px;margin-top:20px"></div>';
    DB.getApplication(slug).then(function (app) {
      if (!app) {
        main.innerHTML = UI.emptyStateHTML("fa-file-circle-question", "Aplikasi tidak ditemukan", "Aplikasi yang Anda cari tidak tersedia atau sudah dipindahkan.", '<a class="btn btn--primary" href="katalog.html">Lihat Semua Aplikasi</a>');
        return;
      }
      UI.applySEO(app);
      DB.incrementView(app.id);
      document.getElementById("crumb-name").textContent = app.name;
      var crumb2 = document.getElementById("crumb-name2");
      if (crumb2) crumb2.textContent = app.name;
      document.title = app.name + " — " + (state.settings.site_name || "Aplikasiku.nd");
      var p = UI.priceInfo(app);
      main.innerHTML =
        '<div class="detail-cover">' + UI.imgTag(app.thumbnail_url, "Thumbnail aplikasi " + app.name, "detail-cover-img") + "</div>" +
        section("fa-circle-info", "Deskripsi Aplikasi", paras(app.full_description)) +
        section("fa-lightbulb", "Latar Belakang Kebutuhan", paras(app.background)) +
        section("fa-hand-holding-heart", "Manfaat Aplikasi", '<ul class="check-list">' + checks(app.benefits) + "</ul>") +
        section("fa-list-check", "Fitur Lengkap", '<ul class="check-list">' + checks(app.features) + "</ul>") +
        shotSection(app) +
        videoSection(app) +
        section("fa-microchip", "Teknologi yang Digunakan", '<div class="tech-tags">' + (app.tech || []).map(function (t) { return "<span>" + UI.esc(t) + "</span>"; }).join("") + "</div>");

      var side = document.getElementById("detail-side");
      side.innerHTML =
        '<div class="side-card">' +
          '<div class="side-card__label">Harga</div><div class="side-card__price">' + p.main + " <small>" + p.small + "</small></div><hr>" +
          '<div class="side-card__row"><span>Status</span><b>' + UI.esc(app.status) + "</b></div>" +
          (app.category ? '<div class="side-card__row"><span>Kategori</span><b>' + UI.esc(app.category.name.split("(")[0].trim()) + "</b></div>" : "") +
          '<div class="side-card__row"><span>Dilihat</span><b>' + (app.view_count || 0) + " kali</b></div>" +
          (app.target_users ? '<div class="side-card__row" style="align-items:flex-start"><span>Target</span><b style="max-width:210px">' + UI.esc(app.target_users) + "</b></div>" : "") +
          "<hr>" +
          (app.demo_url
            ? '<a class="btn btn--primary btn--block" href="' + UI.esc(app.demo_url) + '" target="_blank" rel="noopener"><i class="fa-solid fa-play"></i> Coba Demo</a>'
            : '<a class="btn btn--primary btn--block" target="_blank" rel="noopener" href="' + UI.waLink(UI.waAppMsg(app.name)) + '"><i class="fa-brands fa-whatsapp"></i> Coba Demo via WhatsApp</a>') +
          '<a class="btn btn--navy btn--block" href="kontak.html?app=' + encodeURIComponent(app.slug) + '"><i class="fa-solid fa-cart-shopping"></i> Pesan Aplikasi</a>' +
          '<a class="btn btn--wa btn--block" target="_blank" rel="noopener" href="' + UI.waLink(UI.waAppMsg(app.name)) + '"><i class="fa-brands fa-whatsapp"></i> Konsultasi WhatsApp</a>' +
          (app.application_url ? '<a class="btn btn--outline btn--block" href="' + UI.esc(app.application_url) + '" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> Buka Aplikasi Utama</a>' : "") +
          '<div class="demo-note"><i class="fa-solid fa-flask"></i><span>' + (app.demo ? "Aplikasi ini merupakan data contoh (" + UI.esc(app.status) + "). Hubungi kami untuk mengatur sesi demo nyata dan penawaran harga." : "Informasi harga dapat berubah. Hubungi kami untuk penawaran resmi sesuai kebutuhan Anda.") + "</span></div>" +
        "</div>";

      injectJSONLD(app, p);
      DB.getApplications({ category: app.category ? app.category.slug : "", excludeId: app.id, limit: 3, sort: "popular" })
        .then(function (r) {
          var rg = document.getElementById("related-grid");
          if (!r.items.length) { rg.closest(".section").style.display = "none"; return; }
          rg.innerHTML = r.items.map(function (a) { return UI.appCardHTML(a); }).join("");
        });
      function paras(txt) { return String(txt || "").split(/\n\n+/).filter(Boolean).map(function (x) { return "<p>" + UI.esc(x).replace(/\n/g, "<br>") + "</p>"; }).join(""); }
      function checks(arr) { return (arr || []).map(function (f) { return '<li><i class="fa-solid fa-circle-check"></i>' + UI.esc(f) + "</li>"; }).join(""); }
      function section(icon, title, body) {
        return '<section class="detail-section reveal"><h2><i class="fa-solid ' + icon + '"></i>' + title + "</h2>" + body + "</section>";
      }
      function shotSection(app) {
        var shots = app.screenshots || [];
        if (!shots.length) return "";
        return '<section class="detail-section reveal"><h2><i class="fa-solid fa-images"></i>Screenshot Aplikasi</h2><div class="gallery">' +
          shots.map(function (u, i) { return '<img src="' + UI.esc(u) + '" alt="Screenshot ' + (i + 1) + " aplikasi " + app.name + '" loading="lazy" data-shot>' + ""; }).join("") +
          "</div></section>";
      }
      function videoSection(app) {
        if (!app.video_url) return "";
        var m = String(app.video_url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
        var frame = m ? "https://www.youtube.com/embed/" + m[1] : UI.esc(app.video_url);
        return '<section class="detail-section reveal"><h2><i class="fa-solid fa-circle-play"></i>Video Demonstrasi</h2>' +
          '<div style="aspect-ratio:16/9;border-radius:14px;overflow:hidden"><iframe src="' + frame + '" title="Video demo ' + UI.esc(app.name) + '" style="width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div></section>';
      }
      function injectJSONLD(app, p) {
        var ld = document.getElementById("jsonld-app");
        var data = {
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          name: app.name, description: app.short_description,
          applicationCategory: app.category ? app.category.name : "BusinessApplication",
          operatingSystem: "Web", url: (CFG.SITE_URL || "") + "/detail.html?id=" + app.slug,
          offers: { "@type": "Offer", price: app.pricing_type === "konsultasi" ? "0" : String(app.price || 0), priceCurrency: "IDR" }
        };
        if (ld) ld.textContent = JSON.stringify(data);
      }
      main.querySelectorAll("[data-shot]").forEach(function (img) {
        img.addEventListener("click", function () { openLightbox(img.src, img.alt); });
      });
      UI.initReveal();
    }).catch(function (e) {
      main.innerHTML = UI.emptyStateHTML("fa-triangle-exclamation", "Gagal memuat aplikasi", String(e.message || e), "");
      console.error(e);
    });
  }
  function openLightbox(src, alt) {
    var ov = document.createElement("div");
    ov.className = "modal-overlay is-open";
    ov.innerHTML = '<div style="max-width:900px;width:100%"><img src="' + src + '" alt="' + alt + '" style="width:100%;border-radius:18px"></div>';
    ov.addEventListener("click", function () { ov.remove(); });
    document.body.appendChild(ov);
  }

  /* ---------- KATEGORI ---------- */
  function initKategori() {
    var grid = document.getElementById("cat-grid");
    DB.getCategories().then(function (cats) {
      grid.innerHTML = cats.map(function (c) {
        return '<a class="cat-card reveal" href="katalog.html?kategori=' + UI.esc(c.slug) + '">' +
          '<div class="cat-card__icon"><i class="' + UI.esc(c.icon || "fa-solid fa-layer-group") + '"></i></div>' +
          "<div><h3>" + UI.esc(c.name) + "</h3><p>" + UI.esc(c.description || "") + '</p><span class="cat-card__count">' + (c.app_count || 0) + " aplikasi</span></div></a>";
      }).join("");
      UI.initReveal();
    });
  }

  /* ---------- KONTAK ---------- */
  function initKontak() {
    var form = document.getElementById("inq-form");
    var sel = document.getElementById("f-jenis");
    var faqMount = document.getElementById("faq-list");
    DB.getCategories().then(function (cats) {
      cats.forEach(function (c) {
        var o = document.createElement("option");
        o.value = "cat:" + c.slug; o.textContent = c.name;
        sel.appendChild(o);
      });
      var o = document.createElement("option");
      o.value = "custom"; o.textContent = "Aplikasi Custom / Lainnya";
      sel.appendChild(o);
      var appSlug = UI.qs("app");
      if (appSlug) {
        DB.getApplication(appSlug).then(function (app) {
          if (!app) return;
          sel.value = "cat:" + (app.category ? app.category.slug : "");
          var box = document.getElementById("app-context");
          box.style.display = "flex";
          box.innerHTML = '<i class="fa-solid fa-box-open"></i><span>Anda memesan aplikasi: <b>' + UI.esc(app.name) + "</b>. Lengkapi detail kebutuhan Anda di bawah.</span>";
          document.getElementById("f-application-id").value = app.id;
          document.getElementById("f-application-name").value = app.name;
          var f = document.getElementById("f-deskripsi");
          if (f && !f.value) f.value = "Saya tertarik dengan aplikasi " + app.name + ". ";
        });
      }
      var layanan = UI.qs("layanan");
      if (layanan) {
        var box = document.getElementById("app-context");
        box.style.display = "flex";
        box.innerHTML = '<i class="fa-solid fa-gears"></i><span>Layanan yang diminati: <b>' + UI.esc(layanan) + "</b>.</span>";
        document.getElementById("f-deskripsi").value = "Saya tertarik dengan layanan " + layanan + ". ";
      }
    });
    DB.getFaqs(true).then(function (list) { UI.renderFaqList(list, faqMount); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (id) { return document.getElementById(id).value.trim(); };
      var data = {
        full_name: v("f-nama"), organization: v("f-lembaga"), whatsapp: v("f-wa").replace(/\D/g, ""),
        email: v("f-email"), description: v("f-deskripsi"), desired_features: v("f-fitur"),
        budget: v("f-budget"), target_date: v("f-target") || null,
        application_id: v("f-application-id") || null,
        inquiry_type: sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : "Konsultasi"
      };
      if (!data.full_name || data.full_name.length < 3) return UI.toast("error", "Nama belum lengkap", "Isi nama lengkap minimal 3 karakter.");
      if (data.whatsapp.length < 9 || data.whatsapp.length > 16) return UI.toast("error", "Nomor WhatsApp tidak valid", "Gunakan format 08xx atau 628xx.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return UI.toast("error", "Email tidak valid", "Periksa kembali alamat email Anda.");
      if (!data.description || data.description.length < 10) return UI.toast("error", "Deskripsi terlalu singkat", "Ceritakan kebutuhan Anda minimal 10 karakter.");
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
      DB.createInquiry(data).then(function () {
        var waMsg = "Halo " + (state.settings.site_name || "Aplikasiku.nd") + ", saya " + data.full_name +
          (data.organization ? " dari " + data.organization : "") + ".%0A%0A" +
          "Kebutuhan aplikasi: " + data.inquiry_type + "%0A" +
          "Deskripsi: " + data.description + "%0A" +
          (data.desired_features ? "Fitur diinginkan: " + data.desired_features + "%0A" : "") +
          (data.budget ? "Estimasi anggaran: " + data.budget + "%0A" : "") +
          (data.target_date ? "Target selesai: " + data.target_date + "%0A" : "");
        document.getElementById("wa-continue").href = UI.waBase() + "?text=" + waMsg;
        form.style.display = "none";
        document.getElementById("inq-success").style.display = "block";
        UI.toast("success", "Permintaan terkirim", "Tim kami akan menghubungi Anda segera. Data tersimpan di dashboard admin.");
        form.reset();
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Permintaan';
      }).catch(function (err) {
        UI.toast("error", "Gagal mengirim", String(err.message || err));
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Permintaan';
      });
    });
  }

  /* ---------- BLOG ---------- */
  function initBlog() {
    var slug = UI.qs("slug");
    if (slug) return renderPost(slug);
    var grid = document.getElementById("post-grid");
    DB.getPosts({ publishedOnly: true }).then(function (posts) {
      if (!posts.length) { grid.innerHTML = '<div style="grid-column:1/-1">' + UI.emptyStateHTML("fa-newspaper", "Belum ada artikel", "Artikel edukasi akan dipublikasikan di sini.") + "</div>"; return; }
      grid.innerHTML = posts.map(function (p) {
        return '<article class="post-card reveal">' +
          '<div class="post-card__media"><i class="fa-solid fa-feather-pointed"></i></div>' +
          '<div class="post-card__body">' +
            '<div class="post-card__meta"><b>Artikel</b><span>' + UI.fmtDate(p.published_at || p.created_at) + "</span></div>" +
            "<h3>" + UI.esc(p.title) + "</h3><p>" + UI.esc(p.excerpt) + "</p>" +
            '<a class="read" href="blog.html?slug=' + UI.esc(p.slug) + '">Baca selengkapnya <i class="fa-solid fa-arrow-right"></i></a>' +
          "</div></article>";
      }).join("");
      UI.initReveal();
    });
  }
  function renderPost(slug) {
    DB.getPosts({ publishedOnly: true, slug: slug }).then(function (p) {
      var mount = document.getElementById("post-single");
      var gridWrap = document.getElementById("blog-list");
      if (gridWrap) gridWrap.style.display = "none";
      if (!p) { mount.innerHTML = UI.emptyStateHTML("fa-newspaper", "Artikel tidak ditemukan", "Artikel yang Anda cari tidak tersedia.", '<a class="btn btn--primary" href="blog.html">Semua Artikel</a>'); return; }
      document.title = p.title + " — " + (state.settings.site_name || "Aplikasiku.nd");
      var body = String(p.content || "").split(/\n\n+/).filter(Boolean).map(function (par) {
        var lines = par.split("\n");
        if (lines.every(function (l) { return /^\s*[-•]/.test(l); })) {
          return "<ul>" + lines.map(function (l) { return '<li><i class="fa-solid fa-circle-check"></i>' + UI.esc(l.replace(/^\s*[-•]\s*/, "")) + "</li>"; }).join("") + "</ul>";
        }
        return "<p>" + lines.map(function (l) { return UI.esc(l); }).join("<br>") + "</p>";
      }).join("");
      mount.innerHTML = '<nav class="breadcrumb breadcrumb--light"><a href="blog.html">Blog</a><i class="fa-solid fa-chevron-right"></i><span class="is-current">' + UI.esc(p.title) + "</span></nav>" +
        '<article class="post-body"><h1>' + UI.esc(p.title) + '</h1><div class="meta">Dipublikasikan ' + UI.fmtDate(p.published_at || p.created_at) + "</div>" + body +
        '<div style="margin-top:28px;padding-top:20px;border-top:1px solid var(--border)"><a class="btn btn--wa" target="_blank" rel="noopener" href="' + UI.waLink("Halo, saya ingin konsultasi setelah membaca artikel: " + p.title) + '"><i class="fa-brands fa-whatsapp"></i> Diskusikan dengan Kami</a></div></article>';
    });
  }

  /* ---------- LOGIN ---------- */
  function initLogin() {
    var form = document.getElementById("login-form");
    var hint = document.getElementById("demo-hint");
    if (MODE === "demo" && hint) {
      hint.style.display = "block";
      hint.innerHTML = '<b>Akun demo:</b><br>Email: ' + CFG.DEMO_ADMIN_EMAIL + "<br>Password: " + CFG.DEMO_ADMIN_PASSWORD;
    }
    UI.toast("info", "Halaman Login Admin", MODE === "demo" ? "Mode Demo aktif — gunakan akun demo di bawah." : "Masuk dengan akun admin Supabase Anda.");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("l-email").value.trim();
      var pass = document.getElementById("l-pass").value;
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
      window.Auth.signIn(email, pass).then(function () {
        UI.toast("success", "Login berhasil", "Mengalihkan ke dashboard admin...");
        setTimeout(function () { location.href = "admin.html"; }, 500);
      }).catch(function (err) {
        UI.toast("error", "Login gagal", String(err.message || err));
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk';
      });
    });
    var reset = document.getElementById("l-reset");
    if (reset) reset.addEventListener("click", function (e) {
      e.preventDefault();
      if (MODE === "demo") return UI.toast("warning", "Mode Demo", "Reset password hanya tersedia pada mode Supabase.");
      var email = document.getElementById("l-email").value.trim();
      if (!email) return UI.toast("warning", "Isi email dulu", "Masukkan email Anda pada kolom email, lalu klik reset.");
      window.Auth.sendReset(email).then(function () { UI.toast("success", "Terkirim", "Tautan reset password dikirim ke email Anda."); })
        .catch(function (err) { UI.toast("error", "Gagal", String(err.message || err)); });
    });
  }

  /* ---------- Bootstrap ---------- */
  function boot() {
    UI.initNavbar();
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.dataset.nav === document.body.dataset.page) { a.classList.add("is-active"); a.setAttribute("aria-current", "page"); }
    });
    Promise.all([DB.getSettings(), DB.getCategories().catch(function () { return []; })]).then(function (res) {
      state.settings = res[0] || {};
      state.categories = res[1] || [];
      UI.applyGlobalUI();
      var fc = document.getElementById("footer-cats");
      if (fc) fc.innerHTML = state.categories.slice(0, 6).map(function (c) {
        return '<li><a href="katalog.html?kategori=' + UI.esc(c.slug) + '"><i class="fa-solid fa-angle-right"></i>' + UI.esc(c.name.split("(")[0].trim()) + "</a></li>";
      }).join("");
      var map = { home: initHome, katalog: initKatalog, detail: initDetail, kategori: initKategori, kontak: initKontak, blog: initBlog, login: initLogin };
      var fn = map[document.body.dataset.page];
      if (fn) fn();
      UI.initReveal();
      UI.initFaqAccordion();
    }).catch(function (e) {
      console.error(e);
      UI.toast("error", "Gagal memuat pengaturan", String(e.message || e));
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
