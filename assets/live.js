/* LOOPR — page Live. Tout est simulé (chat, spectateurs, cœurs). Le live présente la nouvelle collection : rien ne s'y commande, le lien du site est épinglé en haut du chat. */
(function () {
  "use strict";
  var A = window.LOOPR_APP;
  var root = document.getElementById("live-root");
  if (!A || !root) return;

  var D = window.LOOPR;
  var SHOW = [8, 1, 11, 7, 4];   /* pièces présentées, dans l'ordre de passage */
  var cur = 0;
  var N = SHOW[0];
  var P = A.byN(N);
  var NB = " ";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function irand(a, b) { return Math.floor(rand(a, b + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function $(s, r) { return (r || document).querySelector(s); }
  function k(n) { return n >= 1000 ? (Math.round(n / 100) / 10).toString().replace(".", ",") + NB + "k" : String(n); }
  function plain(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  /* ---------- Icônes ---------- */
  var ICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.2S3.2 15.8 2.2 9.6C1.6 6 4 3.4 7 3.4c2 0 3.7 1 5 2.9 1.3-1.9 3-2.9 5-2.9 3 0 5.4 2.600 4.800 6.200-1 6.200-9.800 11.600-9.800 11.600z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13v6h16v-6M12 15V3M7 8l5-5 5 5"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    logo: '<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="16" fill="#1b2459"/><circle cx="17" cy="17" r="9.500" fill="none" stroke="#f2a71b" stroke-width="2.500" stroke-dasharray="4 3"/></svg>'
  };

  /* ---------- Décor : hôte et pièce tenue à bout de bras ---------- */
  function railGarment(left, type, fabric) {
    var g = { type: type, fabric: fabric, n: 100 + left, name: "" };
    return '<div class="g" style="left:' + left + 'px">' + A.pieceArt(g, "r") + "</div>";
  }
  var HOST =
    '<svg viewBox="0 0 270 480" aria-hidden="true">' +
    '<path d="M16 480V268Q16 210 78 198H192Q254 210 254 268V480Z" fill="#f4f2ec"/>' +
    '<path d="M62 480V244L96 208H174L208 244V480Z" fill="#f2a71b" stroke="#1b2459" stroke-width="2.500"/>' +
    '<path d="M72 480V250L100 218H170L198 250V480" fill="none" stroke="#1b2459" stroke-width="1.500" stroke-dasharray="4 3"/>' +
    '<rect x="112" y="160" width="46" height="50" rx="14" fill="#c98f6b"/>' +
    '<ellipse cx="135" cy="112" rx="46" ry="54" fill="#d9a27c"/>' +
    '<path d="M87 112Q80 48 135 44Q192 48 183 112Q172 82 135 80Q98 82 87 112Z" fill="#2a1d1a"/>' +
    '<circle cx="135" cy="38" r="17" fill="#2a1d1a"/>' +
    '<ellipse class="lv-eye" cx="117" cy="114" rx="3.600" ry="4.200" fill="#2a1d1a"/><ellipse class="lv-eye" cx="153" cy="114" rx="3.600" ry="4.200" fill="#2a1d1a"/>' +
    '<path d="M108 103Q117 98 126 102M144 102Q153 98 162 103" fill="none" stroke="#2a1d1a" stroke-width="2.200" stroke-linecap="round"/>' +
    '<circle cx="106" cy="130" r="7" fill="#e58a83" opacity=".35"/><circle cx="164" cy="130" r="7" fill="#e58a83" opacity=".35"/>' +
    '<ellipse class="lv-mouth" cx="135" cy="140" rx="9" ry="7" fill="#7a2a2a"/>' +
    '<circle cx="88" cy="128" r="4" fill="#f2a71b"/><circle cx="182" cy="128" r="4" fill="#f2a71b"/>' +
    '<path d="M222 262Q246 214 236 168" fill="none" stroke="#f4f2ec" stroke-width="34" stroke-linecap="round"/>' +
    '<circle cx="236" cy="160" r="15" fill="#d9a27c"/>' +
    "</svg>";

  var AV_COLORS = ["#f7e2b0", "#dde4f0", "#f1cdc7", "#c3cee4", "#ffd36b", "#cfe3d4"];
  function avColor(name) { var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997; return AV_COLORS[h % AV_COLORS.length]; }

  root.innerHTML =
    '<div class="lv-video" id="lv-video">' +
      '<div class="lv-wall"></div>' +
      '<div class="lv-sign"><i></i>LOOPR</div>' +
      '<div class="lv-rail"><span class="bar"></span>' + railGarment(8, "jacket", "denim") + railGarment(86, "dress", "check") + railGarment(246, "vest", "denim") + railGarment(292, "shirt", "stripe") + "</div>" +
      '<div class="lv-host">' + HOST + "</div>" +
      '<div class="lv-garment" id="lv-garment">' + A.pieceArt(P, "live") + "</div>" +
      '<div class="lv-grain"></div><div class="lv-shade-t"></div><div class="lv-shade-b"></div>' +
    "</div>" +
    '<div class="lv-top">' +
      '<div class="lv-host-pill"><span class="lv-av">' + ICON.logo + '</span><span><b>loopr.atelier</b><small id="lv-likes">12' + NB + "k</small></span>" +
      '<button class="lv-follow" type="button" id="lv-follow">Suivre</button></div>' +
      '<div class="lv-right"><div class="lv-viewers"><span class="lv-faces"><i style="background:#f7e2b0"></i><i style="background:#c3cee4"></i><i style="background:#f1cdc7"></i></span><span id="lv-viewers">1,2' + NB + 'k</span></div>' +
      '<button class="lv-x" type="button" data-leave aria-label="Quitter le live">' + ICON.x + "</button></div>" +
    "</div>" +
    '<div class="lv-tags"><span class="lv-live">LIVE</span><span class="lv-tag">Nouvelle collection · drop 14</span></div>' +
    '<div class="lv-gifts" id="lv-gifts"></div>' +
    '<div class="lv-cap" id="lv-cap" aria-hidden="true"><span id="lv-cap-t"></span></div>' +
    '<div class="lv-hearts" id="lv-hearts"></div>' +
    '<div class="lv-bottom">' +
      '<a class="lv-pin" href="index.html#pieces" id="lv-pin"><span class="lv-pin-tag">Épinglé</span><span class="lv-pin-tx"><b>LOOPR</b> La collection est disponible uniquement sur le site : <u>voir la collection</u></span></a>' +
      '<ul class="lv-chat" id="lv-chat"></ul>' +
      '<div class="lv-card" id="lv-card"></div>' +
      '<form class="lv-bar" id="lv-form" autocomplete="off">' +
        '<label class="lv-input"><span class="sr-only" style="position:absolute;left:-9999px">Message</span><input id="lv-input" type="text" maxlength="90" placeholder="Dis quelque chose…" enterkeyhint="send"></label>' +
        '<button class="lv-round" type="button" data-share aria-label="Partager">' + ICON.share + "</button>" +
        '<button class="lv-round heart" type="button" data-like aria-label="Envoyer des cœurs">' + ICON.heart + "</button>" +
      "</form>" +
    "</div>";

  var el = {
    chat: $("#lv-chat"), card: $("#lv-card"), hearts: $("#lv-hearts"), gifts: $("#lv-gifts"),
    cap: $("#lv-cap"), capT: $("#lv-cap-t"), viewers: $("#lv-viewers"), likes: $("#lv-likes"), input: $("#lv-input")
  };

  /* ---------- Mise à l'échelle (le décor fait 360 × 640) ---------- */
  var phone = $("#lv-phone");
  function fit() {
    var top = 0;
    ["announce", "site-header"].forEach(function (c) {
      var n = $("." + c); if (n) top += n.offsetHeight;
    });
    var availH = window.innerHeight - top - 72;
    var availW = window.innerWidth - 32;
    var s = Math.min(1.5, availH / 640, availW / 360);
    s = Math.max(0.6, s);
    root.style.transform = "scale(" + s + ")";
    phone.style.width = Math.round(360 * s) + "px";
    phone.style.height = Math.round(640 * s) + "px";
  }
  fit();
  window.addEventListener("resize", fit);

  /* ---------- État du live ---------- */
  var run = 0;            /* change à chaque relance : les anciennes boucles s'arrêtent */
  var burst = false;
  var pinned = false;
  var viewers = 1240;
  var likes = 12400;

  var USERS = ["mila.s", "theo_vint", "lea.thrift", "camille.d", "yanis.75", "noor_", "sarah.fr", "hugo.lyon", "jade__", "lucas.b", "manon.seconde", "ines.m", "adam.v", "clem.w", "paul_thrift", "romane.l"];
  var MSGS = [
    "bonsoir tout le monde", "trop belle cette collection", "elle est en quelle taille ?", "le denim est magnifique", "c’est combien ?",
    "je regarde déjà le site", "qui est de Lyon ? pop-up en décembre", "les coutures sont trop propres", "c’est vraiment une pièce unique ?", "elle vient d’un vieux jean ?",
    "on peut commander ici ?", "les patchs sont incroyables", "il y aura d’autres pièces comme ça ?", "coucou depuis Bordeaux", "montre le dos stp", "zoome sur les patchs",
    "j’ai pris la veste au dernier drop, elle est parfaite", "le LOOP Club ça donne quoi ?", "elle taille grand ?", "first", "trop bien ce concept",
    "je suis sur le site, chaque pièce a son passeport", "ça ferait trop bien avec un jean brut", "5 h de travail, respect", "le lien est bien épinglé en haut"
  ];
  var CAPS = [
    "Bonsoir tout le monde, merci d’être là pour le drop 14.",
    "Ce soir : la nouvelle collection, douze pièces cousues à partir de vêtements existants.",
    "Elles ne se vendent pas ici : toute la collection est disponible uniquement sur le site."
  ];
  var CAPS_LOOP = [
    "Le lien du site est épinglé en haut du chat.",
    "Chaque pièce n’existe qu’une fois, avec son passeport sur le site.",
    "Je regarde le chat, posez vos questions !",
    "Les membres Loop entrent sur le site vingt-quatre heures avant tout le monde.",
    "Toute la collection est à retrouver sur le site LOOPR."
  ];

  /* ---------- Chat ---------- */
  function addMsg(kind, user, text) {
    var li = document.createElement("li");
    if (kind) li.className = kind;
    if (kind === "sys") {
      li.innerHTML = '<span class="t"></span>';
      $(".t", li).textContent = text;
    } else {
      var av = document.createElement("span"); av.className = "av"; av.style.background = avColor(user); av.textContent = user.charAt(0).toUpperCase();
      var t = document.createElement("span"); t.className = "t";
      var b = document.createElement("b");
      if (kind === "host") { var bd = document.createElement("span"); bd.className = "badge"; bd.textContent = "Hôte"; t.appendChild(bd); }
      b.textContent = user;
      t.appendChild(b); t.appendChild(document.createTextNode(text));
      li.appendChild(av); li.appendChild(t);
    }
    el.chat.appendChild(li);
    while (el.chat.children.length > 14) el.chat.removeChild(el.chat.firstChild);
  }
  var bag = [];
  var recent = [];
  function pickUser() { var u; do { u = pick(USERS); } while (recent.indexOf(u) >= 0); recent.push(u); if (recent.length > 6) recent.shift(); return u; }
  function viewerMsg(text) { addMsg("", pickUser(), text || nextMsg()); }
  function nextMsg() { if (!bag.length) bag = shuffle(MSGS); return bag.pop(); }
  function sys(text) { addMsg("sys", "", text); }

  /* ---------- Sous-titres et voix de l'hôte ---------- */
  var capQueue = [];
  var capIndex = 0;
  var capBusy = false;
  var capTimer;
  function say(text) { capQueue.unshift(text); if (!capBusy) nextCap(run); }
  function nextCap(tok) {
    if (tok !== run) return;
    var text = capQueue.shift();
    if (!text) {
      text = CAPS_LOOP[capIndex++ % CAPS_LOOP.length];
    }
    capBusy = true;
    el.capT.textContent = text;
    el.cap.classList.add("is-on");
    root.classList.add("is-talking");
    var dur = Math.max(2600, text.length * 62);
    capTimer = setTimeout(function () {
      if (tok !== run) return;
      el.cap.classList.remove("is-on");
      root.classList.remove("is-talking");
      capTimer = setTimeout(function () { capBusy = false; nextCap(tok); }, 700);
    }, dur);
  }
  function hostReply(text, caption) {
    addMsg("host", "LOOPR", text);
    say(caption || text);
  }

  /* ---------- Cœurs, cadeaux, spectateurs ---------- */
  function heart(color) {
    if (el.hearts.children.length > 40) return;
    var h = document.createElement("span");
    h.className = "h";
    h.innerHTML = ICON.heart;
    h.firstChild.style.fill = color || pick(["#fe2c55", "#ff6f91", "#f2a71b", "#fff", "#7f95ce"]);
    h.style.setProperty("--dx", Math.round(rand(-38, 22)) + "px");
    h.style.setProperty("--rot", Math.round(rand(-25, 25)) + "deg");
    h.style.animationDuration = rand(2.2, 3.2).toFixed(2) + "s";
    el.hearts.appendChild(h);
    h.addEventListener("animationend", function () { if (h.parentNode) h.parentNode.removeChild(h); });
    setTimeout(function () { if (h.parentNode) h.parentNode.removeChild(h); }, 3600);
  }
  function hearts(n, gap) {
    for (var i = 0; i < n; i++) setTimeout(heart, i * (gap || 70));
    likes += n;
    el.likes.textContent = k(likes);
  }
  function gift() {
    var who = pickUser();
    var g = document.createElement("div");
    g.className = "lv-gift";
    g.innerHTML = '<span class="lv-gift-av"></span><span><b></b><small></small></span>';
    $(".lv-gift-av", g).style.background = avColor(who);
    $(".lv-gift-av", g).textContent = who.charAt(0).toUpperCase();
    $("b", g).textContent = who;
    $("small", g).textContent = "a envoyé une rose × " + irand(1, 9);
    el.gifts.appendChild(g);
    setTimeout(function () { g.classList.add("is-out"); setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 450); }, 3600);
  }

  function every(fn, min, max, tok) {
    (function step() {
      if (tok !== run) return;
      fn();
      setTimeout(step, burst ? Math.max(180, min / 3) + rand(0, (max - min) / 3) : rand(min, max));
    })();
  }

  /* ---------- Pièce présentée : simple repère, rien à acheter ici ---------- */
  var garmentEl = $("#lv-garment");
  function sizeWord(p) { return p.size === "Unique" ? "taille unique" : "taille " + p.size; }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function pieceLines(p) {
    return [
      "Pièce numéro " + p.n + " : " + p.name + ".",
      p.origin,
      p.hours.replace(" h ", NB + "h ") + " d’atelier, " + p.matter.toLowerCase() + ".",
      cap1(sizeWord(p)) + ", " + p.price + " euros.",
      "Elle est à retrouver uniquement sur le site."
    ];
  }
  function setPiece(i, instant) {
    cur = i; N = SHOW[i]; P = A.byN(N);
    function swap() { garmentEl.innerHTML = A.pieceArt(P, "live"); garmentEl.classList.remove("swap"); render(); }
    if (instant || reduce) return swap();
    garmentEl.classList.add("swap");
    var tok = run;
    setTimeout(function () { if (tok === run) swap(); }, 260);
  }
  function nextPiece() {
    setPiece((cur + 1) % SHOW.length);
    capQueue = pieceLines(A.byN(SHOW[cur]));
    if (!capBusy) nextCap(run);
    hearts(4);
  }

  function renderCard() {
    if (!pinned) { el.card.classList.remove("is-on"); return; }
    var html = '<span class="pc-th">' + A.pieceArt(P, "card") + "</span>" +
      '<span class="pc-tx"><b>N°' + NB + A.pad(N) + " · " + P.name + "</b><span>Présentée en ce moment · à retrouver sur le site</span></span>";
    if (el.card.getAttribute("data-sig") !== html) {
      el.card.setAttribute("data-sig", html);
      el.card.innerHTML = html;
    }
    el.card.classList.add("is-on");
  }
  function render() { renderCard(); }

  /* ---------- Réponses de l'hôte au chat ---------- */
  function reply(text) {
    var t = plain(text);
    var ship = P.price >= D.freeShippingFrom ? "livraison offerte" : "livraison offerte dès " + D.freeShippingFrom + NB + "€ d’achats";
    var R = [
      [/command|reserv|panier|prendre|veux|acheter|lien|site|dispo|vend/, "Tout se commande sur le site LOOPR : le lien est épinglé en haut du chat.", "Toute la collection est disponible uniquement sur le site, le lien est épinglé."],
      [/taille|size|grand|petit|mesure/, "La " + P.size + " : " + P.measures.toLowerCase() + ".", cap1(sizeWord(P)) + "."],
      [/prix|combien|cher|euro/, A.eur(P.price) + ", " + ship + ", sur le site.", P.price + " euros, sur le site."],
      [/livr|expedi|delai/, "Livraison offerte dès " + D.freeShippingFrom + NB + "€ d’achats, " + A.eur(D.shippingFee) + " sinon.", "La livraison est offerte dès " + D.freeShippingFrom + " euros."],
      [/matiere|coton|tissu|jean|denim/, P.matter + ". " + P.origin, P.matter + "."],
      [/bonjour|salut|coucou|bonsoir|hello/, "Coucou et bienvenue dans le live !", "Bienvenue dans le live !"]
    ];
    var r = R.filter(function (x) { return x[0].test(t); })[0];
    if (r) hostReply(r[1], r[2]); else hostReply("Merci pour ton message, je lis tout.", "Merci pour vos messages, je lis tout.");
  }

  /* ---------- Démarrage / relance ---------- */
  function start() {
    var tok = ++run;
    clearTimeout(capTimer);
    capQueue = CAPS.slice(); capIndex = 0; capBusy = false; burst = false;
    pinned = false;
    setPiece(0, true);
    pieceLines(A.byN(SHOW[0])).forEach(function (l) { capQueue.push(l); });
    el.chat.innerHTML = ""; el.cap.classList.remove("is-on"); root.classList.remove("is-talking");
    el.card.removeAttribute("data-sig");
    [ "bonsoir !", "coucou depuis Lyon", "ça commence !", "trop hâte de voir la collection" ].forEach(function (m) { viewerMsg(m); });
    sys("Bienvenue dans le live LOOPR. Respecte les autres spectateurs.");
    setTimeout(function () { nextCap(tok); }, 600);
    setTimeout(function () {
      if (tok !== run) return;
      pinned = true;
      sys("LOOPR a épinglé le lien du site : la collection n’est disponible que là.");
      render();
      hearts(5);
    }, 3200);
    (function rotate() { setTimeout(function () { if (tok !== run) return; nextPiece(); rotate(); }, 34000); })();
    every(function () { viewerMsg(); }, 1000, 2300, tok);
    every(function () { heart(); if (Math.random() < 0.5) heart(); likes += 1; el.likes.textContent = k(likes); }, 650, 1500, tok);
    (function tick() {
      if (tok !== run) return;
      viewers = Math.max(1050, Math.min(burst ? 2400 : 1650, viewers + irand(burst ? 10 : -14, burst ? 60 : 20)));
      el.viewers.textContent = k(viewers);
      setTimeout(tick, 2200);
    })();
    (function giftLoop() { if (tok !== run) return; setTimeout(function () { if (tok !== run) return; gift(); giftLoop(); }, burst ? 5000 : rand(14000, 26000)); })();
    render();
  }

  /* ---------- Événements ---------- */
  root.addEventListener("click", function (e) {
    var t = e.target.closest("button, #lv-video");
    if (!t) return;
    if (t.hasAttribute("data-like")) return hearts(6, 55);
    if (t.hasAttribute("data-share")) return A.toast("Lien du live copié (simulation).");
    if (t.hasAttribute("data-leave")) { window.location.href = "index.html"; return; }
    if (t.id === "lv-follow") { t.classList.toggle("is-on"); t.textContent = t.classList.contains("is-on") ? "Abonné" : "Suivre"; return; }
    if (t.id === "lv-video") { hearts(3, 80); }
  });
  $("#lv-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = el.input.value.trim();
    if (!v) return;
    addMsg("me", "toi", v);
    el.input.value = "";
    var tok = run;
    setTimeout(function () { if (tok === run) reply(v); }, rand(1400, 2400));
  });

  start();
})();
