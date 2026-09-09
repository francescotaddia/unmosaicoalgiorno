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
      siteName: "Un mosaico al giorno",
      tagline: "Ogni giorno un mosaico, con la sua storia.",
      today: "Il mosaico di oggi",
      prev: "Precedente",
      next: "Successivo",
      archive: "Archivio",
      home: "Oggi",
      backHome: "Torna a oggi",
      allMosaics: "L'archivio",
      archiveIntro: "Tutti i mosaici pubblicati finora, dal più recente.",
      photo: "Foto",
      source: "Scheda su Wikimedia Commons",
      loadError: "Impossibile caricare i dati dei mosaici.",
      notFound: "Mosaico non trovato.",
      upcoming: "Questo mosaico sarà pubblicato il",
      number: "N.",
      langLabel: "EN",
      further: "Approfondimenti",
      linkWikipedia: "Cerca su Wikipedia",
      linkBooks: "Libri sull'argomento",
      linkTours: "Visite guidate e biglietti",
      affiliateNote: "Alcuni link sono affiliati: se acquisti tramite loro, il sito riceve una piccola commissione, senza costi aggiuntivi per te.",
      months: ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"]
    },
    en: {
      siteName: "A Mosaic a Day",
      tagline: "One mosaic a day, with its story.",
      today: "Today's mosaic",
      prev: "Previous",
      next: "Next",
      archive: "Archive",
      home: "Today",
      backHome: "Back to today",
      allMosaics: "The archive",
      archiveIntro: "Every mosaic published so far, newest first.",
      photo: "Photo",
      source: "File page on Wikimedia Commons",
      loadError: "Could not load the mosaic data.",
      notFound: "Mosaic not found.",
      upcoming: "This mosaic will be published on",
      number: "No.",
      langLabel: "IT",
      further: "Further reading",
      linkWikipedia: "Search on Wikipedia",
      linkBooks: "Books on this subject",
      linkTours: "Guided tours & tickets",
      affiliateNote: "Some links are affiliate links: if you buy through them, the site earns a small commission at no extra cost to you.",
      months: ["January","February","March","April","May","June","July","August","September","October","November","December"]
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

  /* ---------- Date ---------- */
  function todayStr() {
    var n = new Date();
    return n.getFullYear() + "-" +
      String(n.getMonth() + 1).padStart(2, "0") + "-" +
      String(n.getDate()).padStart(2, "0");
  }
  function formatDate(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return iso || "";
    var day = parseInt(p[2], 10);
    var mon = t.months[parseInt(p[1], 10) - 1] || "";
    return day + " " + mon + " " + p[0];
  }

  /* ---------- Immagini da Wikimedia Commons ---------- */
  function commonsImg(file, width) {
    var name = encodeURIComponent(file.replace(/ /g, "_"));
    return "https://commons.wikimedia.org/wiki/Special:FilePath/" + name + "?width=" + (width || 1600);
  }
  function commonsPage(file) {
    return "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(file.replace(/ /g, "_"));
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

  /* Nome del sito: accetta una stringa oppure { it, en } */
  function siteName() {
    var s = CFG.siteName;
    if (s && typeof s === "object") return s[LANG] || s.it || s.en || t.siteName;
    return s || t.siteName;
  }

  /* Ordina per data crescente e assegna il numero progressivo */
  function prepare(list) {
    var sorted = list.slice().sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });
    sorted.forEach(function (m, i) { m._n = i + 1; });
    return sorted;
  }
  function publishedOnly(sorted) {
    var today = todayStr();
    return sorted.filter(function (m) { return String(m.date) <= today; });
  }

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

  /* ---------- Titolo a mosaico ---------- */
  function mosaicWordmark(text, extraClass) {
    var wrap = el("span", { class: "wordmark " + (extraClass || ""), "aria-label": text });
    var words = String(text).split(/\s+/).filter(Boolean);
    words.forEach(function (word, wi) {
      var w = el("span", { class: "wm-word", "aria-hidden": "true" });
      word.split("").forEach(function (ch) {
        w.appendChild(el("span", { class: "wm-l", text: ch }));
      });
      wrap.appendChild(w);
      if (wi < words.length - 1) {
        wrap.appendChild(el("span", { class: "wm-space", "aria-hidden": "true", html: "&nbsp;" }));
      }
    });
    return wrap;
  }

  /* ---------- Intestazione / piè di pagina ---------- */
  function buildChrome() {
    document.documentElement.lang = LANG;
    var name = siteName();

    var header = document.querySelector("[data-chrome=header]");
    if (header) {
      header.innerHTML = "";
      var brand = el("a", { class: "brand", href: "index.html" });
      brand.appendChild(mosaicWordmark(name, "wordmark-sm"));
      header.appendChild(brand);

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
      var sup = CFG.support || {};
      var aff = CFG.affiliates || {};
      footer.innerHTML = "";

      if (sup.url) {
        footer.appendChild(el("p", { class: "support" }, [
          el("a", { class: "support-btn", href: sup.url, target: "_blank", rel: "noopener" },
            [document.createTextNode(pick(sup.label) || (LANG === "it" ? "Offri un caffè" : "Buy me a coffee"))])
        ]));
      }

      footer.appendChild(el("p", { text: name + " · © " + year }));
      footer.appendChild(el("p", { class: "muted", text:
        LANG === "it"
          ? "Immagini da Wikimedia Commons, ciascuna con il proprio autore e licenza."
          : "Images from Wikimedia Commons, each with its own author and licence."
      }));

      if (aff.amazonTag || aff.getYourGuidePartner) {
        footer.appendChild(el("p", { class: "muted", text: t.affiliateNote }));
      }
    }
  }

  /* ---------- Scheda mosaico ---------- */
  function mosaicArticle(m, eyebrow) {
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

    return el("article", { class: "mosaic" }, [
      fig,
      el("div", { class: "mosaic-body" }, [
        eyebrow ? el("p", { class: "eyebrow", text: eyebrow }) : null,
        el("h1", { class: "mosaic-title", text: pick(m.title) }),
        meta,
        el("p", { class: "mosaic-text", text: pick(m.description) })
      ])
    ]);
  }

  function eyebrowFor(m) {
    return t.number + " " + m._n + " · " + formatDate(m.date);
  }

  /* ---------- Approfondimenti / affiliazione ---------- */
  function extLink(label, href, sponsored) {
    return el("a", {
      class: "further-link",
      href: href,
      target: "_blank",
      rel: sponsored ? "noopener nofollow sponsored" : "noopener"
    }, [document.createTextNode(label)]);
  }

  function furtherBlock(m) {
    var aff = CFG.affiliates || {};
    var wikiLang = LANG === "en" ? "en" : "it";
    var titleQ = pick(m.title);
    var titleBare = titleQ.split("(")[0].replace(/["“”]/g, "").trim();
    var placeQ = (m.place && (m.place.en || m.place.it)) || "";
    var placeShort = placeQ.split("(")[0].split(",")[0].trim();
    var items = [];

    /* link personalizzati dal file dati */
    (m.links || []).forEach(function (lk) {
      if (lk && lk.url) items.push(extLink(pick(lk.label) || lk.url, lk.url, false));
    });

    /* Wikipedia */
    items.push(extLink(
      t.linkWikipedia,
      "https://" + wikiLang + ".wikipedia.org/w/index.php?search=" + encodeURIComponent(titleQ),
      false
    ));

    /* Amazon: ricerca libri (con tag affiliato se configurato) */
    var amzDomain = aff.amazonDomain || "www.amazon.it";
    var amzUrl = "https://" + amzDomain + "/s?k=" +
      encodeURIComponent(titleBare + " " + (LANG === "en" ? "mosaic" : "mosaico")) + "&i=stripbooks";
    if (aff.amazonTag) amzUrl += "&tag=" + encodeURIComponent(aff.amazonTag);
    items.push(extLink(t.linkBooks, amzUrl, !!aff.amazonTag));

    /* GetYourGuide: solo se è stato indicato il partner id */
    if (aff.getYourGuidePartner && placeShort) {
      items.push(extLink(
        t.linkTours,
        "https://www.getyourguide.com/s/?q=" + encodeURIComponent(placeShort) +
          "&partner_id=" + encodeURIComponent(aff.getYourGuidePartner),
        true
      ));
    }

    var links = el("div", { class: "further-links" });
    items.forEach(function (a) { links.appendChild(a); });
    return el("aside", { class: "further" }, [
      el("h2", { class: "further-title", text: t.further }),
      links
    ]);
  }

  /* ---------- Pagine ---------- */
  function renderToday(all) {
    var main = document.querySelector("[data-page=today]");
    var sorted = prepare(all);
    var pub = publishedOnly(sorted);
    var pool = pub.length ? pub : sorted.slice(0, 1);

    var params = new URLSearchParams(location.search);
    var offset = parseInt(params.get("d") || "0", 10);
    if (!isFinite(offset)) offset = 0;
    if (offset > 0) offset = 0;

    var last = pool.length - 1;
    var pos = last + offset;
    if (pos < 0) pos = 0;
    if (pos > last) pos = last;
    var m = pool[pos];

    main.innerHTML = "";
    main.appendChild(mosaicArticle(m, eyebrowFor(m)));
    main.appendChild(furtherBlock(m));

    var pager = el("nav", { class: "pager" });
    pager.appendChild(pos > 0
      ? el("a", { class: "pager-link", href: "index.html?d=" + (offset - 1), rel: "prev", text: "‹ " + t.prev })
      : el("span", { class: "pager-link is-off", text: "‹ " + t.prev }));
    pager.appendChild(offset !== 0
      ? el("a", { class: "pager-link", href: "index.html", text: t.backHome })
      : el("span"));
    pager.appendChild(pos < last
      ? el("a", { class: "pager-link", href: "index.html?d=" + (offset + 1), rel: "next", text: t.next + " ›" })
      : el("span", { class: "pager-link is-off", text: t.next + " ›" }));
    main.appendChild(pager);
    main.appendChild(el("div", { class: "ad-slot" }));

    document.title = pick(m.title) + " — " + siteName();
    setMeta("description", pick(m.description).slice(0, 155));
  }

  function renderArchive(all) {
    var main = document.querySelector("[data-page=archive]");
    var pub = publishedOnly(prepare(all)).slice().reverse();

    main.innerHTML = "";
    main.appendChild(el("h1", { class: "page-title", text: t.allMosaics }));
    main.appendChild(el("p", { class: "page-intro", text: t.archiveIntro }));
    main.appendChild(el("div", { class: "ad-slot" }));

    var grid = el("div", { class: "grid" });
    pub.forEach(function (m) {
      grid.appendChild(el("a", { class: "card", href: "mosaico.html?id=" + encodeURIComponent(m.id) }, [
        el("div", { class: "card-thumb" }, [
          el("img", { src: commonsImg(m.commonsFile, 600), alt: pick(m.title), loading: "lazy" })
        ]),
        el("div", { class: "card-info" }, [
          el("p", { class: "card-date", text: t.number + " " + m._n + " · " + formatDate(m.date) }),
          el("h2", { class: "card-title", text: pick(m.title) }),
          el("p", { class: "card-place", text: pick(m.place) })
        ])
      ]));
    });
    main.appendChild(grid);
    main.appendChild(el("div", { class: "ad-slot" }));
    document.title = t.allMosaics + " — " + siteName();
  }

  function renderSingle(all) {
    var main = document.querySelector("[data-page=single]");
    var id = new URLSearchParams(location.search).get("id");
    var sorted = prepare(all);
    var m = sorted.filter(function (x) { return x.id === id; })[0];

    main.innerHTML = "";
    if (!m) {
      main.appendChild(el("p", { class: "notice", text: t.notFound }));
      main.appendChild(el("p", [el("a", { href: "archivio.html", text: "← " + t.allMosaics })]));
      return;
    }
    if (String(m.date) > todayStr()) {
      main.appendChild(el("p", { class: "notice", text: t.upcoming + " " + formatDate(m.date) + "." }));
      main.appendChild(el("p", [el("a", { href: "archivio.html", text: "← " + t.allMosaics })]));
      document.title = siteName();
      return;
    }
    main.appendChild(mosaicArticle(m, eyebrowFor(m)));
    main.appendChild(furtherBlock(m));
    main.appendChild(el("div", { class: "ad-slot" }));
    main.appendChild(el("p", { class: "back" }, [el("a", { href: "archivio.html", text: "← " + t.allMosaics })]));
    document.title = pick(m.title) + " — " + siteName();
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
