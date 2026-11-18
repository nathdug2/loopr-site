/* LOOPR — maquette front. Aucune dépendance. Panier et envies gardés dans le navigateur. */
(function () {
  "use strict";
  var D = window.LOOPR;
  var CART_KEY = "loopr.cart.v1";
  var WISH_KEY = "loopr.wish.v1";
  var ORDER_KEY = "loopr.order.v1";
  var SOLD_KEY = "loopr.sold.v1";
  var TRACK_KEY = "loopr.track.v1";
  var ACCOUNT_KEY = "loopr.account.v1";
  var PROMO_KEY = "loopr.promo.v1";
  var PROMO_PCT = 10;
  var PROMO_CODE = "BIENVENUE10";
  var HOLD_MS = 10 * 60 * 1000;
  var NB = " ";

  /* ---------- Utilitaires ---------- */
  var mem = {};
  var store = {
    get: function (k, d) {
      try { var v = window.localStorage.getItem(k); return v ? JSON.parse(v) : d; }
      catch (e) { return mem[k] !== undefined ? mem[k] : d; }
    },
    set: function (k, v) {
      try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; }
    }
  };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function eur(n) { return (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",")) + NB + "€"; }
  function byN(n) { return D.pieces.filter(function (p) { return p.n === Number(n); })[0]; }
  function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return pad(Math.floor(s / 60)) + ":" + pad(s % 60); }

  /* ---------- Illustrations de vêtements (SVG, motifs de tissus récupérés) ---------- */
  var SHAPES = {
    jacket: {
      body: "M70 30 L100 42 L130 30 L176 56 L186 132 L160 138 L155 102 L155 218 L45 218 L45 102 L40 138 L14 132 L24 56 Z",
      detail: "M100 42 V218 M70 30 L84 54 L100 42 L116 54 L130 30 M60 128 h28 v30 h-28z M112 128 h28 v30 h-28z"
    },
    shirt: {
      body: "M70 30 L100 44 L130 30 L172 54 L188 102 L160 112 L155 84 L155 218 L45 218 L45 84 L40 112 L12 102 L28 54 Z",
      detail: "M100 44 V218 M70 30 L84 56 L100 44 L116 56 L130 30 M60 100 h28 v28 h-28z"
    },
    vest: {
      body: "M72 32 L100 46 L128 32 L152 62 L154 218 L46 218 L48 62 Z",
      detail: "M100 80 V218 M72 32 L100 80 L128 32 M58 150 h30 v28 h-30z M112 150 h30 v28 h-30z"
    },
    trousers: {
      body: "M56 20 H144 L158 220 H108 L100 92 L92 220 H42 Z",
      detail: "M56 38 H144 M100 38 V92 M62 44 Q76 70 88 44 M138 44 Q124 70 112 44"
    },
    dress: {
      body: "M78 22 L100 40 L122 22 L138 34 L132 92 L170 222 H30 L68 92 L62 34 Z",
      detail: "M68 92 H132 M78 22 Q100 56 122 22 M100 56 V92"
    },
    tote: {
      pre: "M70 86 C64 18 136 18 130 86",
      preStroke: 6,
      body: "M42 84 H158 L168 218 H32 Z",
      detail: "M66 150 h68 v46 h-68z"
    },
    bumbag: {
      pre: "M28 112 Q-2 140 8 176 M172 112 Q202 140 192 176",
      preStroke: 7,
      body: "M26 110 Q100 70 174 110 L166 170 Q100 196 34 170 Z",
      detail: "M40 130 Q100 102 160 130 M148 123 l7 14"
    }
  };

  function pattern(fabric, id) {
    var open = '<pattern id="' + id + '" patternUnits="userSpaceOnUse" ';
    switch (fabric) {
      case "denim":
        return open + 'width="8" height="8"><rect width="8" height="8" fill="#3b5088"/><path d="M0 8 L8 0" stroke="#fff" stroke-opacity=".14" stroke-width="1.2"/></pattern>';
      case "patch":
        return open + 'width="90" height="90"><rect width="90" height="90" fill="#3b5088"/>' +
          '<rect width="46" height="38" fill="#5c73b3"/><rect x="46" width="44" height="52" fill="#26356f"/>' +
          '<rect y="38" width="34" height="52" fill="#7f95ce"/><rect x="34" y="52" width="56" height="38" fill="#4660a5"/>' +
          '<rect x="12" y="12" width="16" height="14" fill="#f2a71b"/><rect x="60" y="66" width="14" height="14" fill="#c73b2e"/>' +
          '<path d="M46 0 V52 M0 38 H46 M34 52 V90 M34 52 H90" stroke="#fff" stroke-opacity=".4" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/></pattern>';
      case "stripe":
        return open + 'width="16" height="16"><rect width="16" height="16" fill="#f4f2ec"/><rect width="6" height="16" fill="#2f3d86"/></pattern>';
      case "check":
        return open + 'width="18" height="18"><rect width="18" height="18" fill="#f4f2ec"/><rect width="9" height="18" fill="#c73b2e" fill-opacity=".6"/><rect width="18" height="9" fill="#c73b2e" fill-opacity=".6"/></pattern>';
      default: /* workwear */
        return open + 'width="8" height="8"><rect width="8" height="8" fill="#b8a272"/><path d="M0 8 L8 0" stroke="#8e7a4c" stroke-opacity=".55" stroke-width="1.3"/></pattern>';
    }
  }

  function garment(type, fabric, uid, label) {
    var s = SHAPES[type] || SHAPES.shirt;
    var pid = "fab-" + uid;
    return '<svg viewBox="0 0 200 240" role="img" aria-label="' + (label || "Illustration d’une pièce") + '" focusable="false">' +
      "<defs>" + pattern(fabric, pid) + "</defs>" +
      (s.pre ? '<path d="' + s.pre + '" fill="none" stroke="#1b2459" stroke-width="' + s.preStroke + '" stroke-linecap="round"/>' : "") +
      '<path d="' + s.body + '" fill="url(#' + pid + ')" stroke="#1b2459" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="' + s.body + '" transform="translate(100 120) scale(.92) translate(-100 -120)" fill="none" stroke="#f2a71b" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>' +
      '<path d="' + s.detail + '" fill="none" stroke="#1b2459" stroke-opacity=".85" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      "</svg>";
  }
  function pieceArt(p, suffix) { return garment(p.type, p.fabric, p.n + (suffix || ""), p.name); }

  /* ---------- Compte d'Océane (sans mot de passe) et code de bienvenue ---------- */
  var DEFAULT_ACCOUNT = { first: "Océane", email: "oceane@exemple.fr", city: "Lyon", alerts: true };
  function account() {
    var a = store.get(ACCOUNT_KEY, null) || {};
    return { first: a.first || DEFAULT_ACCOUNT.first, email: a.email || DEFAULT_ACCOUNT.email, city: a.city || DEFAULT_ACCOUNT.city, alerts: a.alerts === undefined ? DEFAULT_ACCOUNT.alerts : a.alerts };
  }
  function saveAccount(a) { store.set(ACCOUNT_KEY, a); }
  function promo() { return store.get(PROMO_KEY, null) || {}; }
  function promoActive() { var p = promo(); return p.state === "claimed" && !p.used; }
  function cents(x) { return Math.round(x * 100) / 100; }
  function discountOf(sub) { return promoActive() ? cents(sub * PROMO_PCT / 100) : 0; }

  /* ---------- Panier et envies ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 3800);
  }

  function readCart() {
    var now = Date.now();
    var all = store.get(CART_KEY, []);
    var live = all.filter(function (i) { return i.until > now; });
    if (live.length !== all.length) {
      store.set(CART_KEY, live);
      all.filter(function (i) { return i.until <= now; }).forEach(function (i) {
        toast("La réservation de la pièce n°" + NB + pad(i.n) + " a expiré. Elle est de nouveau disponible.");
      });
      setTimeout(refreshAll, 0);
    }
    return live;
  }
  function inCart(n) { return readCart().some(function (i) { return i.n === n; }); }
  function holdOf(n) { var f = readCart().filter(function (i) { return i.n === n; })[0]; return f ? f.until : 0; }
  function isSold(n) { return store.get(SOLD_KEY, []).indexOf(Number(n)) >= 0; }
  function stateOf(p) { return inCart(p.n) ? "panier" : isSold(p.n) ? "vendue" : p.status; }
  function readWish() { return store.get(WISH_KEY, []); }

  function reserve(n) {
    var p = byN(n);
    if (!p || inCart(n) || isSold(n)) return;
    if (p.status !== "dispo") return;
    var c = readCart();
    c.push({ n: n, until: Date.now() + HOLD_MS });
    store.set(CART_KEY, c);
    refreshAll();
    openDrawer("cart");
    toast("Pièce n°" + NB + pad(n) + " réservée pour 10 minutes.");
  }
  function placeOrder(method) {
    var items = readCart().map(function (i) { return byN(i.n); }).filter(Boolean);
    if (!items.length) return false;
    var sub = items.reduce(function (a, p) { return a + p.price; }, 0);
    var ship = sub >= D.freeShippingFrom ? 0 : D.shippingFee;
    var disc = discountOf(sub);
    store.set(ORDER_KEY, {
      id: "LP-" + D.drop.number + "-" + String(Math.floor(1000 + Math.random() * 9000)),
      at: Date.now(), method: method, items: items.map(function (p) { return p.n; }), sub: sub, disc: disc, ship: ship, total: cents(sub - disc + ship)
    });
    if (disc) { var pr = promo(); pr.used = true; store.set(PROMO_KEY, pr); }
    var sold = store.get(SOLD_KEY, []);
    items.forEach(function (p) { if (sold.indexOf(p.n) < 0) sold.push(p.n); });
    store.set(SOLD_KEY, sold);
    store.set(TRACK_KEY, 0);
    store.set(CART_KEY, []);
    return true;
  }
  function removeFromCart(n) {
    store.set(CART_KEY, readCart().filter(function (i) { return i.n !== n; }));
    refreshAll();
    toast("Pièce n°" + NB + pad(n) + " retirée. Elle est de nouveau disponible.");
  }
  function toggleWish(n) {
    var w = readWish();
    var i = w.indexOf(n);
    if (i >= 0) { w.splice(i, 1); toast("Retirée de tes envies."); }
    else { w.push(n); toast("Gardée dans tes envies."); }
    store.set(WISH_KEY, w);
    refreshAll();
  }

  /* ---------- Cartes de pièces ---------- */
  var BADGE = { dispo: "Disponible", reservee: "Réservée", vendue: "Vendue", panier: "Dans ton panier" };
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8-4.9-8-10.6A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8 2.6c0 5.7-8 10.6-8 10.6z" fill="none" stroke="#1b2459" stroke-width="2" stroke-linejoin="round"/></svg>';

  function cardActions(p, st) {
    var h = readWish().indexOf(p.n) >= 0;
    var main;
    if (st === "dispo") main = '<button class="btn" type="button" data-reserve="' + p.n + '">Réserver 10 min</button>';
    else if (st === "panier") main = '<button class="btn" type="button" data-open-cart>Voir mon panier</button>';
    else if (st === "vendue") main = '<button class="btn" type="button" disabled>Vendue</button>';
    else main = '<a class="btn btn--ghost" href="piece.html?p=' + p.n + '#alerte">Me prévenir</a>';
    return '<div class="tag-actions">' + main +
      '<button class="heart" type="button" data-heart="' + p.n + '" aria-pressed="' + h + '" aria-label="' + (h ? "Retirer" : "Ajouter") + " la pièce n°" + p.n + ' des envies">' + HEART + "</button></div>";
  }
  function card(p) {
    var st = stateOf(p);
    return '<li class="tag" data-n="' + p.n + '">' +
      '<a class="tag-link" href="piece.html?p=' + p.n + '" aria-label="' + p.name + ", pièce n°" + p.n + '">' +
      '<div class="tag-panel panel-' + p.panel + '"><span class="tag-badge" data-state="' + st + '">' + BADGE[st] + "</span>" + pieceArt(p, "c") + "</div>" +
      '<div class="tag-info"><div class="tag-num">N°' + NB + pad(p.n) + "<small>sur " + D.drop.total + "</small></div>" +
      '<div class="tag-name">' + p.name + "</div>" +
      '<div class="tag-meta"><span>Taille ' + p.size + '</span><span class="tag-price">' + eur(p.price) + "</span></div></div></a>" +
      cardActions(p, st) + "</li>";
  }

  /* ---------- Compte à rebours ---------- */
  function nextFriday19() {
    var now = new Date();
    var t = new Date(now);
    t.setHours(19, 0, 0, 0);
    t.setDate(t.getDate() + ((5 - now.getDay() + 7) % 7));
    if (t <= now) t.setDate(t.getDate() + 7);
    return t;
  }
  function parts(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
  }
  function tickCountdowns() {
    var pub = nextFriday19();
    $$("[data-cd]").forEach(function (el) {
      var target = el.getAttribute("data-cd") === "member" ? new Date(pub.getTime() - 24 * 3600 * 1000) : pub;
      var p = parts(target - new Date());
      if (el.hasAttribute("data-cd-cells")) {
        var vals = [p.d, p.h, p.m, p.s];
        $$(".cd-num", el).forEach(function (n, i) { n.textContent = pad(vals[i]); });
      } else {
        el.textContent = p.d + NB + "j " + pad(p.h) + NB + "h " + pad(p.m) + NB + "min";
      }
    });
  }
  function tickHolds() {
    var c = readCart();
    $$("[data-hold]").forEach(function (el) {
      var n = Number(el.getAttribute("data-hold"));
      var until = holdOf(n);
      if (until) el.textContent = mmss(until - Date.now());
    });
    var clock = $("#cart-clock");
    if (clock) {
      if (c.length) {
        var soon = Math.min.apply(null, c.map(function (i) { return i.until; }));
        clock.textContent = mmss(soon - Date.now());
        clock.hidden = false;
      } else clock.hidden = true;
    }
  }

  /* ---------- Structure commune : bandeau, en-tête, pied de page, tiroir ---------- */
  var PAGE = document.body.getAttribute("data-page");
  var LOGO = '<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="16" fill="#1b2459"/><circle cx="17" cy="17" r="9.5" fill="none" stroke="#f2a71b" stroke-width="3" stroke-dasharray="5 3.4"/></svg>';

  function navLinks(cls) {
    var items = [
      ["index.html#pieces", "Le drop", PAGE === "home" || PAGE === "piece"],
      ["live.html", "Live", PAGE === "live"],
      ["popup.html", "Pop-up", PAGE === "popup"],
      ["club.html", "LOOP Club", PAGE === "club"]
    ];
    return items.map(function (i) {
      return '<a href="' + i[0] + '"' + (i[2] ? ' aria-current="page"' : "") + ">" + i[1] + "</a>";
    }).join("");
  }

  function buildChrome() {
    var avail = D.pieces.filter(function (p) { return p.status === "dispo"; }).length;
    var head = $("#site-header");
    head.outerHTML =
      '<div class="announce"><div class="wrap"><span>Drop ' + D.drop.number + " en cours : " + avail + " pièces disponibles sur " + D.drop.total +
      "</span><span id=\"promo-note\"></span><span>Livraison offerte dès " + D.freeShippingFrom + NB + "€</span></div></div>" +
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="index.html" aria-label="LOOPR, accueil">' + LOGO + '<span class="brand-word">LOOPR</span></a>' +
      '<nav class="nav" aria-label="Navigation principale">' + navLinks() + "</nav>" +
      '<a class="acct-btn" href="compte.html" aria-label="Mon compte"' + (PAGE === "account" ? ' aria-current="page"' : "") + '><span class="acct-av" aria-hidden="true">' + account().first.charAt(0) + '</span><span class="acct-name">Mon compte</span></a>' +
      '<button class="cart-btn" type="button" data-open-cart aria-label="Ouvrir le panier"><span>Panier</span><span class="cart-count" id="cart-count">0</span><span class="cart-clock" id="cart-clock" hidden></span></button>' +
      '</div><div class="stitch"></div><div class="wrap subnav-wrap"><nav class="subnav" aria-label="Navigation principale (mobile)">' + navLinks() + "</nav></div></header>";

    var foot = $("#site-footer");
    foot.outerHTML =
      '<footer class="site-footer"><div class="wrap"><div class="foot-grid">' +
      '<div><a class="brand" href="index.html" aria-label="LOOPR, accueil"><span class="brand-word">LOOPR</span></a>' +
      '<p style="margin-top:.75rem;max-width:34ch">LOOPR coud des vêtements existants en pièces uniques. Une pièce, un exemplaire, une seule personne.</p></div>' +
      '<div><h3>Acheter</h3><ul><li><a href="index.html#pieces">Le drop ' + D.drop.number + '</a></li><li><a href="live.html">Live</a></li><li><a href="popup.html">Pop-up</a></li><li><a href="club.html">LOOP Club</a></li></ul></div>' +
      '<div><h3>Aide</h3><ul><li><a href="compte.html">Mon compte</a></li><li><a href="suivi.html">Suivre ma commande</a></li><li><a href="#" data-soon>Livraison et retours</a></li><li><a href="suivi.html">Passeport de la pièce</a></li><li><a href="#" data-soon>Contact</a></li></ul></div>' +
      '<div><h3>Suivre</h3><ul><li><a href="#" data-soon>TikTok</a></li><li><a href="#" data-soon>Instagram</a></li></ul></div>' +
      '</div><p class="foot-note">Maquette du site LOOPR réalisée pour un cas d’école. Les pièces, prix, dates de pop-up et textes sont des exemples. Les illustrations remplacent les photos.</p></div></footer>';

    var shell = document.createElement("div");
    shell.innerHTML =
      '<div class="scrim" id="scrim"></div>' +
      '<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Panier et envies">' +
      '<div class="drawer-head"><div class="tabs" role="tablist"><button class="tab" role="tab" data-tab="cart" aria-selected="true">Panier</button><button class="tab" role="tab" data-tab="wish" aria-selected="false">Envies</button></div>' +
      '<button class="icon-btn" type="button" data-close aria-label="Fermer">×</button></div>' +
      '<div class="drawer-body" id="drawer-body"></div><div class="drawer-foot" id="drawer-foot"></div></aside>' +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>' +
      '<dialog id="promo" aria-labelledby="promo-title"><div id="promo-body"></div></dialog>' +
      '<dialog id="checkout"><form method="dialog"><h2>Paiement simulé</h2><p id="checkout-msg"></p><div class="dlg-btns"><button class="btn" value="ok">Valider la commande simulée</button><button class="btn btn--ghost" value="cancel">Retour au panier</button></div></form></dialog>';
    while (shell.firstChild) document.body.appendChild(shell.firstChild);
  }

  var drawerTab = "cart";
  function openDrawer(tab) {
    drawerTab = tab || "cart";
    renderDrawer();
    $("#drawer").classList.add("is-open");
    $("#scrim").classList.add("is-open");
    var c = $("#drawer [data-close]");
    if (c) c.focus();
  }
  function closeDrawer() {
    $("#drawer").classList.remove("is-open");
    $("#scrim").classList.remove("is-open");
  }

  function renderDrawer() {
    $$("#drawer .tab").forEach(function (t) { t.setAttribute("aria-selected", String(t.getAttribute("data-tab") === drawerTab)); });
    var body = $("#drawer-body");
    var foot = $("#drawer-foot");
    if (drawerTab === "wish") {
      var w = readWish().map(byN).filter(Boolean);
      body.innerHTML = w.length ? w.map(function (p) {
        return '<div class="line"><div class="line-ph panel-' + p.panel + '">' + pieceArt(p, "w") + "</div>" +
          '<div><div class="line-name"><a href="piece.html?p=' + p.n + '">N°' + NB + pad(p.n) + ", " + p.name + "</a></div>" +
          '<div class="line-hold">' + BADGE[stateOf(p)] + '</div><button class="linkbtn" type="button" data-heart="' + p.n + '">Retirer des envies</button></div>' +
          '<div class="line-price">' + eur(p.price) + "</div></div>";
      }).join("") : '<div class="drawer-empty"><p><b>Aucune envie pour l’instant.</b></p><p class="muted" style="margin-top:.5rem">Touche le cœur sur une pièce pour la garder de côté.</p></div>';
      foot.innerHTML = "";
      foot.style.display = "none";
      return;
    }
    foot.style.display = "";
    var c = readCart().map(function (i) { return { p: byN(i.n), until: i.until }; });
    if (!c.length) {
      body.innerHTML = '<div class="drawer-empty"><p><b>Ton panier est vide.</b></p><p class="muted" style="margin-top:.5rem">Une pièce réservée reste à toi pendant 10 minutes.</p>' +
        '<p style="margin-top:1rem"><a class="btn" href="index.html#pieces" data-close-link>Voir le drop</a></p></div>';
      foot.innerHTML = "";
      foot.style.display = "none";
      return;
    }
    body.innerHTML = c.map(function (i) {
      return '<div class="line"><div class="line-ph panel-' + i.p.panel + '">' + pieceArt(i.p, "d") + "</div>" +
        '<div><div class="line-name">N°' + NB + pad(i.p.n) + ", " + i.p.name + "</div><div>Taille " + i.p.size + "</div>" +
        '<div class="line-hold">Gardée pour toi : <b data-hold="' + i.p.n + '">' + mmss(i.until - Date.now()) + "</b></div>" +
        '<button class="linkbtn" type="button" data-remove="' + i.p.n + '">Retirer</button></div>' +
        '<div class="line-price">' + eur(i.p.price) + "</div></div>";
    }).join("");
    var sub = c.reduce(function (a, i) { return a + i.p.price; }, 0);
    var ship = sub >= D.freeShippingFrom ? 0 : D.shippingFee;
    var disc = discountOf(sub);
    var promoLine = disc ? '<div class="sum sum--promo"><span>Code ' + PROMO_CODE + " (−" + PROMO_PCT + "" + NB + "%)</span><span>−" + eur(disc) + "</span></div>"
      : (promo().state === "claimed" ? "" : '<button class="promo-hook" type="button" data-promo-open>−' + PROMO_PCT + NB + "% sur ta première commande : laisse ton e-mail</button>");
    foot.innerHTML =
      promoLine +
      '<div class="sum"><span>Sous-total</span><span>' + eur(sub) + "</span></div>" +
      '<div class="sum"><span>Livraison</span><span>' + (ship ? eur(ship) : "Offerte") + "</span></div>" +
      '<div class="sum total"><span>Total</span><span>' + eur(cents(sub - disc + ship)) + "</span></div>" +
      (ship ? "<small>Plus que " + eur(D.freeShippingFrom - sub) + " pour la livraison offerte.</small>" : "") +
      '<div class="express"><button class="pay" type="button" data-checkout="Apple Pay">Apple Pay</button><button class="pay" type="button" data-checkout="Shop Pay">Shop Pay</button><button class="pay pay--alt" type="button" data-checkout="Klarna en 3 fois">Klarna 3x</button></div>' +
      '<button class="btn btn--block" type="button" data-checkout="paiement en invité">Commander sans compte</button>' +
      '<small>Pas de compte obligatoire. <a class="linkbtn" href="compte.html">Mon compte (' + account().first + ")</a></small>";
  }

  function renderHeaderCart() {
    var el = $("#cart-count");
    if (el) el.textContent = readCart().length;
  }

  /* ---------- Pages ---------- */
  var filter = "tout";
  function renderHome() {
    var grid = $("#grid");
    if (!grid) return;
    var list = D.pieces.filter(function (p) {
      if (filter === "tout") return true;
      if (filter === "dispo") return stateOf(p) === "dispo";
      return p.cat === filter;
    });
    grid.innerHTML = list.length ? list.map(card).join("") : '<li class="empty"><b>Aucune pièce dans cette catégorie.</b><p>Choisis une autre catégorie ou reviens au drop complet.</p></li>';

    var row = $("#slot-row");
    if (row) {
      row.innerHTML = D.pieces.map(function (p) {
        var st = stateOf(p);
        if (st === "panier") st = "reservee";
        return '<a class="slot" data-state="' + st + '" href="piece.html?p=' + p.n + '" aria-label="Pièce n°' + p.n + ", " + BADGE[stateOf(p)].toLowerCase() + '"><span>' + pad(p.n) + "</span></a>";
      }).join("");
      var avail = D.pieces.filter(function (p) { return stateOf(p) === "dispo"; }).length;
      $("#slot-title").textContent = avail + " pièces disponibles sur " + D.drop.total;
    }
  }
  function buildChips() {
    var box = $("#chips");
    if (!box) return;
    var defs = [["tout", "Tout"], ["dispo", "Disponibles"], ["vestes", "Vestes"], ["hauts", "Hauts"], ["bas", "Bas"], ["robes", "Robes"], ["sacs", "Sacs"]];
    box.innerHTML = defs.map(function (d) {
      return '<button class="chip" type="button" data-filter="' + d[0] + '" aria-pressed="' + (d[0] === filter) + '">' + d[1] + "</button>";
    }).join("");
  }
  function renderHomeExtras() {
    var blur = $("#blurs");
    if (blur) blur.innerHTML = D.nextPieces.map(function (p) {
      return '<div class="blur-tile">' + garment(p.type, p.fabric, "n" + p.n, "Pièce du prochain drop, floutée") + "</div>";
    }).join("");
    var pop = D.popups[0];
    var pc = $("#popup-city");
    if (pc) { pc.textContent = pop.city; $("#popup-dates").textContent = pop.dates; }
  }

  function buyBox(p) {
    var st = stateOf(p);
    var msgs = {
      dispo: "Disponible. Elle n’existe qu’en un exemplaire.",
      panier: "Dans ton panier. Il te reste",
      reservee: "Réservée par un autre client. Elle peut se libérer dans quelques minutes.",
      vendue: "Vendue. Chaque pièce n’existe qu’une fois."
    };
    var timer = st === "panier" ? '<span class="timer" data-hold="' + p.n + '">' + mmss(holdOf(p.n) - Date.now()) + "</span>" : "";
    var main;
    if (st === "dispo") main = '<button class="btn btn--block" type="button" data-reserve="' + p.n + '">Réserver 10 minutes</button>';
    else if (st === "panier") main = '<button class="btn btn--block" type="button" data-open-cart>Voir mon panier</button>';
    else if (st === "vendue") main = '<button class="btn btn--block" type="button" disabled>Vendue</button>';
    else if (st === "reservee") main = '<button class="btn btn--block" type="button" disabled>Réservée</button>';
    else main = '<button class="btn btn--block" type="button" disabled>Bientôt sur le site</button>';
    var h = readWish().indexOf(p.n) >= 0;
    return '<div class="status-box" data-state="' + st + '">' + msgs[st] + timer + "</div>" +
      '<div class="buy-actions">' + main +
      '<button class="btn btn--ghost btn--block" type="button" data-heart="' + p.n + '" aria-pressed="' + h + '">' + (h ? "Retirer des envies" : "Ajouter aux envies") + "</button></div>";
  }

  var currentPiece;
  function moreOf(p) { return D.pieces.filter(function (x) { return x.n !== p.n && x.status === "dispo"; }).slice(0, 4); }
  function renderPiece() {
    var root = $("#piece-root");
    if (!root) return;
    var q = new URLSearchParams(window.location.search).get("p");
    var p = currentPiece || (currentPiece = byN(q) || D.pieces.filter(function (x) { return x.slug === q; })[0]);
    if (!p) {
      root.innerHTML = '<div class="wrap" style="padding-block:3rem"><h1 class="display" style="font-size:3rem">Pièce introuvable</h1><p class="lead" style="margin-top:1rem">Ce numéro n’existe pas dans le drop ' + D.drop.number + '.</p><p style="margin-top:1.25rem"><a class="btn" href="index.html#pieces">Voir toutes les pièces</a></p></div>';
      return;
    }
    document.title = p.name + ", pièce n°" + p.n + " | LOOPR";
    var box = $("#buy-box");
    if (box) {
      box.innerHTML = buyBox(p);
      var mg = $("#more-grid");
      if (mg) mg.innerHTML = moreOf(p).map(card).join("");
      return;
    }

    var src = p.source;
    var srcW = Math.min(48, Math.floor(92 / src.types.length));
    var sources = src.types.map(function (t, i) {
      return '<span style="width:' + srcW + '%;display:block">' + garment(t, src.fabric, p.n + "s" + i, "Vêtement d’origine") + "</span>";
    }).join("");
    var others = moreOf(p);

    root.innerHTML =
      '<div class="wrap"><nav class="crumb" aria-label="Fil d’Ariane"><a href="index.html#pieces">Le drop ' + D.drop.number + "</a> / Pièce n°" + NB + pad(p.n) + "</nav>" +
      '<div class="piece-grid"><figure class="gallery panel-' + p.panel + '">' +
      '<div class="gallery-bar"><span>Avant : ' + src.label + "</span><span>Après : pièce n°" + NB + pad(p.n) + "</span></div>" +
      '<div class="ba" id="ba"><div class="ba-layer">' + pieceArt(p, "p") + "</div>" +
      '<div class="ba-layer ba-before" id="ba-before"><div class="sources">' + sources + "</div></div>" +
      '<span class="ba-cap ba-cap--l">Avant</span><span class="ba-cap ba-cap--r">Après</span>' +
      '<div class="ba-handle" id="ba-handle"></div>' +
      '<input class="ba-range" id="ba-range" type="range" min="0" max="100" value="14" aria-label="Comparer avant et après">' +
      "</div>" +
      '<figcaption class="gallery-foot">Glisse vers la droite pour voir les vêtements d\u2019origine. Illustration d’exemple : les photos viendront du shooting.</figcaption></figure>' +
      '<div class="buy"><div class="buy-num"><span class="num-tag">N°' + NB + pad(p.n) + '</span><span>sur ' + D.drop.total + ", exemplaire unique</span></div>" +
      '<h1 class="display">' + p.name + "</h1>" +
      '<p class="buy-price">' + eur(p.price) + '</p><p class="buy-sub">Taille ' + p.size + ". Livraison offerte dès " + D.freeShippingFrom + NB + "€.</p>" +
      '<div id="buy-box">' + buyBox(p) + "</div>" +
      '<div class="alert-box" id="alerte"><h2>Elle t’échappe ?</h2><p class="muted" style="margin-top:.35rem">Reçois un message quand une pièce en taille ' + p.size + " arrive.</p>" +
      '<form class="form-row" data-toast="C’est noté. Tu seras prévenu(e) dès qu’une pièce correspond.">' +
      '<label class="sr-only" for="al-mail">Adresse e-mail</label><input class="input" id="al-mail" type="email" required placeholder="ton@email.fr" autocomplete="email">' +
      '<button class="btn" type="submit">Me prévenir</button></form></div></div></div></div>' +

      '<section class="passport"><div class="wrap"><h2>Passeport de la pièce</h2>' +
      '<p class="muted" style="margin-top:.35rem;max-width:56ch">Chaque pièce raconte d’où elle vient et combien de temps il a fallu pour la refaire.</p>' +
      '<div class="label-card"><div class="label-card-head"><b>LOOPR</b><span>N°' + NB + pad(p.n) + "/" + D.drop.total + ", drop " + D.drop.number + "</span></div><dl>" +
      '<div class="row"><dt>D’où elle vient</dt><dd>' + p.origin + "</dd></div>" +
      '<div class="row"><dt>Travail en atelier</dt><dd>' + p.hours + " pour la découper, assembler et finir.</dd></div>" +
      '<div class="row"><dt>Matières</dt><dd>' + p.matter + "</dd></div>" +
      '<div class="row"><dt>Mesures à plat</dt><dd>' + p.measures + "</dd></div>" +
      '<div class="row"><dt>Entretien</dt><dd>Lavage à 30' + NB + '°C, à l’envers. Pas de sèche-linge : les patchs sont cousus, pas collés.</dd></div>' +
      "</dl></div></div></section>" +

      '<section class="reviews"><div class="wrap"><h2>Avis avec photo</h2>' +
      '<p class="muted" style="margin-top:.35rem;max-width:56ch">Après réception, chaque client peut ajouter une photo de la pièce portée. Les avis apparaîtront ici.</p>' +
      '<div class="review-grid">' +
      [0, 1, 2].map(function (i) {
        return '<div class="review"><div class="review-ph panel-' + ["a", "b", "c"][i] + '">' + garment(["jacket", "shirt", "dress"][i], ["patch", "stripe", "check"][i], "r" + i, "Emplacement photo client") + "</div>" +
          '<div><span class="review-tag">Exemple de mise en page</span><p>Ici : l’avis du client, sa taille et la photo de la pièce portée.</p></div></div>';
      }).join("") +
      "</div></div></section>" +

      '<section class="more"><div class="wrap"><h2>Encore disponibles dans le drop ' + D.drop.number + '</h2><ul class="grid" id="more-grid" style="margin-top:1.25rem">' + others.map(card).join("") + "</ul></div></section>";

    var range = $("#ba-range");
    function slide() {
      var v = Number(range.value);
      $("#ba-before").style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
      $("#ba-handle").style.left = Math.max(v, 3) + "%";
    }
    range.addEventListener("input", slide);
    slide();
  }

  function renderPopup() {
    var cal = $("#cal");
    if (!cal) return;
    cal.innerHTML = D.popups.map(function (p) {
      return '<li class="cal-row"><div class="cal-city">' + p.city + "</div><div>" + p.dates + "<br><span class=\"muted\">" + p.hours + "</span></div>" +
        '<span class="pill' + (p.status === "next" ? " pill--next" : "") + '">' + (p.status === "next" ? "Prochain" : "À venir") + "</span></li>";
    }).join("");
    var on = D.pieces.filter(function (p) { return p.status === "dispo"; }).slice(0, 4);
    $("#popup-pieces").innerHTML = on.map(card).join("");
  }

  /* ---------- Pop-up de bienvenue : -10 % contre une adresse e-mail ---------- */
  function promoForm() {
    return '<button class="icon-btn promo-x" type="button" data-promo-close aria-label="Fermer">×</button>' +
      '<h2 id="promo-title">−' + PROMO_PCT + NB + '% sur ta première commande</h2>' +
      '<p>Laisse ton adresse e-mail : la réduction s’applique toute seule à ton panier. Tu reçois aussi un message avant chaque drop.</p>' +
      '<form id="promo-form" class="promo-form"><label class="sr-only" for="promo-mail">Adresse e-mail</label>' +
      '<input class="input" id="promo-mail" type="email" required placeholder="ton@email.fr" autocomplete="email">' +
      '<button class="btn" type="submit">Je veux mes −' + PROMO_PCT + NB + '%</button></form>' +
      '<p class="promo-fine"><button class="linkbtn" type="button" data-promo-close>Non merci, je regarde le drop</button></p>' +
      '<p class="promo-fine">Une réduction par personne, sur la première commande. Tu peux te désinscrire à tout moment (maquette : aucun e-mail n’est envoyé).</p>';
  }
  function promoDone() {
    var pr = promo();
    return '<button class="icon-btn promo-x" type="button" data-promo-close aria-label="Fermer">×</button>' +
      '<h2 id="promo-title">C’est noté, merci !</h2>' +
      '<p>Ton code <b class="promo-code">' + PROMO_CODE + '</b> est enregistré pour <b>' + (pr.email || "") + '</b>.</p>' +
      '<p>−' + PROMO_PCT + NB + '% sur ta première commande, appliqué automatiquement dans ton panier.</p>' +
      '<p><button class="btn" type="button" data-promo-close>Voir les pièces</button></p>';
  }
  function openPromo() {
    var dlg = $("#promo");
    if (!dlg || dlg.open) return;
    $("#promo-body").innerHTML = promo().state === "claimed" ? promoDone() : promoForm();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    var inp = $("#promo-mail");
    if (inp) inp.focus();
  }
  function closePromo() {
    var dlg = $("#promo");
    if (!dlg || !dlg.open) return;
    if (promo().state !== "claimed") store.set(PROMO_KEY, { state: "dismissed" });
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
    refreshAll();
  }
  function claimPromo(email) {
    store.set(PROMO_KEY, { state: "claimed", email: email, used: false, at: Date.now() });
    var a = account(); a.email = email; saveAccount(a);
    $("#promo-body").innerHTML = promoDone();
    refreshAll();
  }
  function renderPromoNote() {
    var n = $("#promo-note");
    if (!n) return;
    var pr = promo();
    if (pr.state === "claimed" && !pr.used) n.innerHTML = "Code " + PROMO_CODE + " actif : −" + PROMO_PCT + NB + "% sur ta première commande";
    else if (pr.state === "claimed") n.textContent = "";
    else n.innerHTML = '<button class="announce-link" type="button" data-promo-open>−' + PROMO_PCT + NB + "% sur ta première commande</button>";
  }
  function resetDemo() {
    store.set(CART_KEY, []); store.set(ORDER_KEY, null); store.set(SOLD_KEY, []); store.set(TRACK_KEY, 0);
    store.set(PROMO_KEY, null); store.set(ACCOUNT_KEY, null);
  }

  function refreshAll() {
    renderHeaderCart();
    renderPromoNote();
    renderDrawer();
    if (PAGE === "home") renderHome();
    if (PAGE === "piece") renderPiece();
    if (PAGE === "popup") renderPopup();
    document.dispatchEvent(new CustomEvent("loopr:refresh"));
  }

  /* ---------- Événements ---------- */
  var pendingMethod = "";
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a, [data-close]");
    if (!t) return;
    if (t.hasAttribute("data-reserve")) return reserve(Number(t.getAttribute("data-reserve")));
    if (t.hasAttribute("data-heart")) { e.preventDefault(); return toggleWish(Number(t.getAttribute("data-heart"))); }
    if (t.hasAttribute("data-open-cart")) return openDrawer("cart");
    if (t.hasAttribute("data-promo-open")) { closeDrawer(); return openPromo(); }
    if (t.hasAttribute("data-promo-close")) return closePromo();
    if (t.hasAttribute("data-remove")) return removeFromCart(Number(t.getAttribute("data-remove")));
    if (t.hasAttribute("data-close") || t.hasAttribute("data-close-link")) return closeDrawer();
    if (t.hasAttribute("data-tab")) { drawerTab = t.getAttribute("data-tab"); return renderDrawer(); }
    if (t.hasAttribute("data-filter")) { filter = t.getAttribute("data-filter"); buildChips(); return renderHome(); }
    if (t.hasAttribute("data-checkout")) {
      $("#checkout-msg").textContent = "Ici s’ouvrira le " + t.getAttribute("data-checkout") + " : adresse, livraison, paiement. Dans la vraie boutique, cette étape est gérée par Shopify. Dans la maquette, aucun paiement n’est effectué.";
      var dlg = $("#checkout");
      pendingMethod = t.getAttribute("data-checkout");
      if (dlg.showModal) dlg.showModal();
      return;
    }
    if (t.hasAttribute("data-soon")) { e.preventDefault(); return toast("Cette page ne fait pas partie de la maquette."); }
  });
  document.addEventListener("click", function (e) { if (e.target && e.target.id === "scrim") closeDrawer(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  document.addEventListener("submit", function (e) {
    if (e.target.id === "promo-form") {
      e.preventDefault();
      var v = $("#promo-mail").value.trim();
      if (v) claimPromo(v);
      return;
    }
    var f = e.target.closest("form[data-toast]");
    if (!f) return;
    e.preventDefault();
    toast(f.getAttribute("data-toast"));
    f.reset();
  });

  /* ---------- Démarrage ---------- */
  window.LOOPR_APP = { store: store, KEYS: { order: ORDER_KEY, sold: SOLD_KEY, track: TRACK_KEY, account: ACCOUNT_KEY, promo: PROMO_KEY }, account: account, saveAccount: saveAccount, promo: promo, promoActive: promoActive, PROMO_CODE: PROMO_CODE, PROMO_PCT: PROMO_PCT, resetDemo: resetDemo, refresh: refreshAll, isSold: isSold, byN: byN, pad: pad, eur: eur, mmss: mmss, pieceArt: pieceArt, reserve: reserve, inCart: inCart, holdOf: holdOf, toast: toast, openDrawer: openDrawer };
  buildChrome();
  $("#checkout").addEventListener("close", function () {
    if ($("#checkout").returnValue === "ok" && pendingMethod && placeOrder(pendingMethod)) window.location.href = "commande.html";
    pendingMethod = "";
  });
  buildChips();
  renderHomeExtras();
  refreshAll();
  tickCountdowns();
  tickHolds();
  setInterval(function () { tickCountdowns(); tickHolds(); }, 1000);
  $("#promo").addEventListener("click", function (e) { if (e.target === this) closePromo(); });
  $("#promo").addEventListener("cancel", function () { if (promo().state !== "claimed") store.set(PROMO_KEY, { state: "dismissed" }); });
  if (PAGE === "home" && !promo().state) setTimeout(openPromo, 2500);
})();
