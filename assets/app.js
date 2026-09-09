/* ============================================================
   Un mosaico al giorno — logica condivisa
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var DATA_URL = "data/mosaics.json";

  /* ---------- Testi dell'interfaccia / UI strings ---------- */
  var UI = {
    it: {
      tagline: "Ogni giorno un mosaico, con la sua storia.",
      today: "Il mosaico di oggi",
      prev: "Precedente",
      next: "Successivo",
      archive: "Archivio",
      home: "Oggi",
      backHome: "Torna a oggi",
      allMosaics: "Tutti i mosaici",
      photo: "Foto",
      source: "Scheda su Wikimedia Commons",
      loadError: "Impossibile caricare i dati dei mosaici.",
      notFound: "Mosaico non trovato.",
      number: "Mosaico n.",
      of: "di",
      langLabel: "EN"
    },
    en: {
      tagline: "One mosaic a day, with its story.",
      today: "Today's mosaic",
      prev: "Previous",
      next: "Next",
      archive: "Archive",
      home: "Today",
      backHome: "Back to today",
      allMosaics: "All mosaics",
      photo: "Photo",
      source: "File page on Wikimedia Commons",
      loadError: "Could not load the mosaic data.",
      notFound: "Mosaic not found.",
      number: "Mosaic no.",
      of: "of",
      langLabel: "IT"
    }
  };

  /* ---------- Lingua ---------- */
  function getLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "it" || q === "en") return q;
    try {
      var s = localStorage.getItem("mdg_lang");
      if (s === "it" || s === "en") return s;
    } catch (e) {}
    return CFG.defaultLang === "en" ? "en" : "it";
  }
  function setLang(l) {
    try { localStorage.setItem("mdg_lang", l); } catch (e) {}
    var u = new URL(location.href);
    u.searchParams.delete("lang");
    location.href = u.toString();
  }
  var LANG = getLang();
  var t = UI[LANG];

  /* ---------- Immagini da Wikimedia Commons ---------- */
  function commonsImg(file, width) {
    var name = encodeURIComponent(file.replace(/ /g, "_"));
    return "https://commons.wikimedia.org/wiki/Special:FilePath/" + name + "?width=" + (width || 1600);
  }
  function commonsPage(file) {
    return "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(file.replace(/ /g, "_"));
  }

  /* ---------- Rotazione giornaliera ---------- */
  function dayNumber() {
    var ep = new Date((CFG.epoch || "2026-01-01") + "T00:00:00");
    var now = new Date();
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((startOfToday - ep) / 86400000);
  }
  function todayIndex(len) {
    var d = dayNumber();
    return ((d % len) + len) % len;
  }

  /* ---------- Utility DOM ---------- */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function pick(obj) { return (obj && (obj[LANG] || obj.it || obj.en)) || ""; }

  /* ---------- Pubblicità ---------- */
  function injectAdHead() {
    var ads = CFG.ads || {};
    if (ads.enabled && ads.headHtml) {
      var range = document.createRange();
      range.selectNode(document.head);
      document.head.appendChild(range.createContextualFragment(ads.headHtml));
    }
  }
  function renderAds() {
    var ads = CFG.ads || {};
    document.querySelectorAll(".ad-slot").forEach(function (slot) {
      if (ads.enabled && ads.slotHtml) {
        slot.innerHTML = ads.slotHtml;
        slot.classList.add("is-live");
      } else {
        slot.textContent = pick(ads.placeholder) || "Advertising";
        slot.classList.add("is-placeholder");
      }
    });
  }

  /* ---------- Intestazione / piè di pagina ---------- */
  function buildChrome() {
    document.documentElement.lang = LANG;
    var header = document.querySelector("[data-chrome=header]");
    if (header) {
      header.innerHTML = "";
      header.appendChild(el("a", { class: "brand", href: "index.html" }, [
        el("span", { text: CFG.siteName || "Un mosaico al giorno" })
      ]));
      var nav = el("nav", { class: "nav" }, [
        el("a", { href: "index.html", text: t.home }),
        el("a", { href: "archivio.html", text: t.archive }),
        el("button", { class: "lang-btn", type: "button", "aria-label": "Change language", text: t.langLabel })
      ]);
      nav.querySelector(".lang-btn").addEventListener("click", function () {
        setLang(LANG === "it" ? "en" : "it");
      });
      header.appendChild(nav);
    }
    var footer = document.querySelector("[data-chrome=footer]");
    if (footer) {
      var year = new Date().getFullYear();
      var bits = [CFG.siteName || "Un mosaico al giorno", "© " + year];
      footer.innerHTML = "";
      footer.appendChild(el("p", { text: bits.join(" · ") }));
      footer.appendChild(el("p", { class: "muted", text:
        LANG === "it"
          ? "Immagini da Wikimedia Commons, ciascuna con il proprio autore e licenza."
          : "Images from Wikimedia Commons, each with its own author and licence."
      }));
    }
  }

  /* ---------- Rendering di una scheda mosaico ---------- */
  function mosaicArticle(m, label) {
    var fig = el("figure", { class: "mosaic-figure" }, [
      el("img", {
        class: "mosaic-img",
        src: commonsImg(m.commonsFile, 1600),
        alt: pick(m.title),
        loading: "eager"
      }),
      el("figcaption", { class: "credit" }, [
        el("span", { text: t.photo + ": " + String(m.credit || "Wikimedia Commons").replace(/^\s*(foto|photo)\s*:\s*/i, "") + " · " }),
        el("a", { href: commonsPage(m.commonsFile), target: "_blank", rel: "noopener", text: t.source })
      ])
    ]);

    var meta = el("p", { class: "mosaic-meta", text: [pick(m.place), pick(m.period)].filter(Boolean).join(" — ") });

    var body = el("div", { class: "mosaic-body" }, [
      label ? el("p", { class: "eyebrow", text: label }) : null,
      el("h1", { class: "mosaic-title", text: pick(m.title) }),
      meta,
      el("p", { class: "mosaic-text", text: pick(m.description) })
    ]);

    return el("article", { class: "mosaic" }, [fig, body]);
  }

  /* ---------- Pagine ---------- */
  function renderToday(list) {
    var main = document.querySelector("[data-page=today]");
    var i = todayIndex(list.length);
    var params = new URLSearchParams(location.search);
    var offset = parseInt(params.get("d") || "0", 10);
    if (!isFinite(offset)) offset = 0;
    var idx = (((i + offset) % list.length) + list.length) % list.length;
    var m = list[idx];

    var label = offset === 0
      ? t.today
      : (t.number + " " + (idx + 1) + " " + t.of + " " + list.length);

    main.innerHTML = "";
    main.appendChild(mosaicArticle(m, label));

    var prevUrl = "index.html?d=" + (offset - 1);
    var nextUrl = "index.html?d=" + (offset + 1);
    var pager = el("nav", { class: "pager" }, [
      el("a", { class: "pager-link", href: prevUrl, rel: "prev", text: "‹ " + t.prev }),
      offset !== 0 ? el("a", { class: "pager-link", href: "index.html", text: t.backHome }) : el("span"),
      el("a", { class: "pager-link", href: nextUrl, rel: "next", text: t.next + " ›" })
    ]);
    main.appendChild(pager);
    main.appendChild(el("div", { class: "ad-slot" }));

    document.title = pick(m.title) + " — " + (CFG.siteName || "Un mosaico al giorno");
    setMeta("description", pick(m.description).slice(0, 155));
  }

  function renderArchive(list) {
    var main = document.querySelector("[data-page=archive]");
    main.innerHTML = "";
    main.appendChild(el("h1", { class: "page-title", text: t.allMosaics }));
    main.appendChild(el("div", { class: "ad-slot" }));

    var grid = el("div", { class: "grid" });
    list.forEach(function (m) {
      var card = el("a", { class: "card", href: "mosaico.html?id=" + encodeURIComponent(m.id) }, [
        el("div", { class: "card-thumb" }, [
          el("img", { src: commonsImg(m.commonsFile, 600), alt: pick(m.title), loading: "lazy" })
        ]),
        el("div", { class: "card-info" }, [
          el("h2", { class: "card-title", text: pick(m.title) }),
          el("p", { class: "card-place", text: pick(m.place) })
        ])
      ]);
      grid.appendChild(card);
    });
    main.appendChild(grid);
    main.appendChild(el("div", { class: "ad-slot" }));
    document.title = t.allMosaics + " — " + (CFG.siteName || "Un mosaico al giorno");
  }

  function renderSingle(list) {
    var main = document.querySelector("[data-page=single]");
    var id = new URLSearchParams(location.search).get("id");
    var m = list.filter(function (x) { return x.id === id; })[0];
    main.innerHTML = "";
    if (!m) {
      main.appendChild(el("p", { class: "notice", text: t.notFound }));
      main.appendChild(el("p", [el("a", { href: "archivio.html", text: "← " + t.archive })]));
      return;
    }
    main.appendChild(mosaicArticle(m, null));
    main.appendChild(el("div", { class: "ad-slot" }));
    main.appendChild(el("p", { class: "back" }, [el("a", { href: "archivio.html", text: "← " + t.allMosaics })]));
    document.title = pick(m.title) + " — " + (CFG.siteName || "Un mosaico al giorno");
    setMeta("description", pick(m.description).slice(0, 155));
  }

  function setMeta(name, content) {
    var tag = document.querySelector('meta[name="' + name + '"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  /* ---------- Avvio ---------- */
  function start() {
    injectAdHead();
    buildChrome();

    var pageEl =
      document.querySelector("[data-page=today]") ||
      document.querySelector("[data-page=archive]") ||
      document.querySelector("[data-page=single]");
    if (!pageEl) { renderAds(); return; }

    fetch(DATA_URL, { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list) || !list.length) throw new Error("empty");
        var page = pageEl.getAttribute("data-page");
        if (page === "today") renderToday(list);
        else if (page === "archive") renderArchive(list);
        else if (page === "single") renderSingle(list);
        renderAds();
      })
      .catch(function (err) {
        pageEl.innerHTML = "";
        pageEl.appendChild(el("p", { class: "notice", text: t.loadError }));
        console.error(err);
        renderAds();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
