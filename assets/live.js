/* LOOPR — page Live. Tout est simulé (chat, spectateurs, cœurs) sauf la réservation de la pièce n° 08, qui passe par le vrai panier du site. */
(function () {
  "use strict";
  var A = window.LOOPR_APP;
  var root = document.getElementById("live-root");
  if (!A || !root) return;
  window.LOOPR_LIVE_ON = true; /* autorise la réservation d'une pièce « tiktok » depuis cette page */

  var N = 8;
  var P = A.byN(N);
  var NB = " ";
  var NUM = "n°" + NB + A.pad(N);
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
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6.500a3 3 0 0 1 6 0V8"/></svg>',
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
      '<div class="lv-garment">' + A.pieceArt(P, "live") + "</div>" +
      '<div class="lv-grain"></div><div class="lv-shade-t"></div><div class="lv-shade-b"></div>' +
    "</div>" +
    '<div class="lv-top">' +
      '<div class="lv-host-pill"><span class="lv-av">' + ICON.logo + '</span><span><b>loopr.atelier</b><small id="lv-likes">12' + NB + "k</small></span>" +
      '<button class="lv-follow" type="button" id="lv-follow">Suivre</button></div>' +
      '<div class="lv-right"><div class="lv-viewers"><span class="lv-faces"><i style="background:#f7e2b0"></i><i style="background:#c3cee4"></i><i style="background:#f1cdc7"></i></span><span id="lv-viewers">1,2' + NB + 'k</span></div>' +
      '<button class="lv-x" type="button" data-leave aria-label="Quitter le live">' + ICON.x + "</button></div>" +
    "</div>" +
    '<div class="lv-tags"><span class="lv-live">LIVE</span><span class="lv-tag">Drop 14 · pièce ' + NUM + "</span></div>" +
    '<div class="lv-gifts" id="lv-gifts"></div>' +
    '<div class="lv-cap" id="lv-cap" aria-hidden="true"><span id="lv-cap-t"></span></div>' +
    '<div class="lv-hearts" id="lv-hearts"></div>' +
    '<div class="lv-bottom">' +
      '<ul class="lv-chat" id="lv-chat"></ul>' +
      '<div class="lv-card" id="lv-card"></div>' +
      '<form class="lv-bar" id="lv-form" autocomplete="off">' +
        '<label class="lv-input"><span class="sr-only" style="position:absolute;left:-9999px">Message</span><input id="lv-input" type="text" maxlength="90" placeholder="Dis quelque chose…" enterkeyhint="send"></label>' +
        '<button class="lv-round bag" type="button" data-sheet-open aria-label="Voir les produits du live">' + ICON.bag + '<span class="n" id="lv-bagn">1</span></button>' +
        '<button class="lv-round" type="button" data-share aria-label="Partager">' + ICON.share + "</button>" +
        '<button class="lv-round heart" type="button" data-like aria-label="Envoyer des cœurs">' + ICON.heart + "</button>" +
      "</form>" +
    "</div>" +
    '<div class="lv-sheet" id="lv-sheet" role="dialog" aria-label="Produit du live"></div>';

  var el = {
    chat: $("#lv-chat"), card: $("#lv-card"), sheet: $("#lv-sheet"), hearts: $("#lv-hearts"), gifts: $("#lv-gifts"),
    cap: $("#lv-cap"), capT: $("#lv-cap-t"), viewers: $("#lv-viewers"), likes: $("#lv-likes"), bag: $("#lv-bagn"), input: $("#lv-input")
  };
  el.bag.parentNode.style.visibility = "hidden";

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
  var lastCall = false;
  var otherUntil = 0;
  var viewers = 1240;
  var likes = 12400;
  var wasOther = false;

  var USERS = ["mila.s", "theo_vint", "lea.thrift", "camille.d", "yanis.75", "noor_", "sarah.fr", "hugo.lyon", "jade__", "lucas.b", "manon.seconde", "ines.m", "adam.v", "clem.w", "paul_thrift", "romane.l"];
  var MSGS = [
    "bonsoir tout le monde", "trop belle cette chemise", "elle est en quelle taille ?", "le denim est magnifique", "c’est combien ?", "85 € ça va", "je la veux !!",
    "qui est de Lyon ? pop-up en décembre", "les coutures sont trop propres", "c’est vraiment une pièce unique ?", "elle vient d’un vieux jean ?", "je réserve !!",
    "les patchs sont incroyables", "vous referez une chemise comme ça ?", "coucou depuis Bordeaux", "montre le dos stp", "zoome sur les patchs",
    "j’ai pris la veste au dernier drop, elle est parfaite", "le LOOP Club ça donne quoi ?", "elle taille grand ?", "first", "trop bien ce concept",
    "je suis dessus, ne la vendez pas", "elle ferait trop bien avec un jean brut", "5 h de travail, respect", "ça rend super bien sur toi", "ah elle est déjà épinglée !"
  ];
  var CAPS = [
    "Bonsoir tout le monde, merci d’être là pour le drop 14.",
    "Aujourd’hui : la chemise patchs denim, pièce numéro huit.",
    "Une chemise blanche et les chutes de jean du drop précédent.",
    "Cinq heures d’atelier, cent pour cent coton.",
    "Taille M, épaules 47 centimètres.",
    "Une seule pièce, 85 euros, livraison offerte.",
    "Touchez le sac jaune : elle est à vous pendant dix minutes.",
    "Je regarde le chat, posez vos questions !"
  ];
  var CAPS_LOOP = [
    "Je la remets devant la caméra pour ceux qui arrivent.",
    "Regardez les patchs : aucun n’est placé au hasard.",
    "Il reste une seule pièce, une seule personne.",
    "Réservée, elle est à vous pendant dix minutes."
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
      if (capIndex < CAPS.length) text = CAPS[capIndex++]; else text = CAPS_LOOP[(capIndex++ - CAPS.length) % CAPS_LOOP.length];
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

  /* ---------- Carte produit épinglée et fiche ---------- */
  function otherActive() { return otherUntil > Date.now(); }
  function state() {
    var mine = A.inCart(N);
    if (!mine && A.isSold(N)) return { k: "sold" };
    if (mine) return { k: "mine", left: A.mmss(A.holdOf(N) - Date.now()) };
    if (otherActive()) return { k: "other", left: A.mmss(otherUntil - Date.now()) };
    return { k: "free" };
  }
  function renderCard() {
    var s = state();
    if (!pinned) { el.card.classList.remove("is-on"); return; }
    var sub = s.k === "mine" ? "Gardée pour toi : " + s.left
      : s.k === "sold" ? "Vendue · pièce unique"
      : s.k === "other" ? "Un spectateur l’a réservée : " + s.left
      : lastCall ? '<span class="alert">Dernier appel · 1 pièce</span>' : A.eur(P.price) + " · 1 seule pièce";
    var cta = s.k === "mine" ? '<button class="pc-cta is-mine" type="button" data-live-cart>Mon panier</button>'
      : s.k === "sold" || s.k === "other" ? '<button class="pc-cta" type="button" disabled>' + (s.k === "sold" ? "Vendue" : "Prise") + "</button>"
      : '<button class="pc-cta" type="button" data-live-reserve>Réserver</button>';
    var html = '<button class="pc-main" type="button" data-sheet-open aria-label="Voir la fiche de la pièce ' + NUM + '"><span class="pc-th">' + A.pieceArt(P, "card") + "<em>1</em></span>" +
      '<span class="pc-tx"><b>N°' + NB + A.pad(N) + " · " + P.name + "</b><span>" + sub + "</span></span></button>" + cta;
    if (el.card.getAttribute("data-sig") !== html) {
      el.card.setAttribute("data-sig", html);
      el.card.innerHTML = html;
    }
    el.card.classList.add("is-on");
  }
  function renderSheet() {
    var s = state();
    var btn = s.k === "mine" ? '<button class="lv-big is-mine" type="button" data-live-cart>Voir mon panier</button>'
      : s.k === "sold" ? '<button class="lv-big" type="button" disabled>Pièce vendue</button>'
      : s.k === "other" ? '<button class="lv-big" type="button" disabled>Réservée par un autre spectateur</button>'
      : '<button class="lv-big" type="button" data-live-reserve>Réserver 10 minutes</button>';
    var note = s.k === "sold" ? "Cette pièce unique a trouvé sa personne. Le prochain drop arrive bientôt."
      : s.k === "mine" ? "Gardée pour toi : <b>" + s.left + "</b>. Passe commande avant la fin du compte à rebours."
      : s.k === "other" ? "Elle revient dans <b>" + s.left + "</b> si la personne ne finalise pas."
      : "Tu as 10 minutes pour finaliser. Passé ce délai, la pièce est remise en vente.";
    var html = '<div class="lv-sheet-head"><h2>Produits du live (1)</h2><button type="button" data-sheet-close aria-label="Fermer la fiche">' + ICON.x + "</button></div>" +
      '<div class="lv-prod"><div class="ph">' + A.pieceArt(P, "sheet") + "</div><div>" +
      "<h3>N°" + NB + A.pad(N) + " · " + P.name + '</h3><div class="pr">' + A.eur(P.price) + ' <small>livraison offerte</small></div>' +
      "<p>Taille " + P.size + " · " + P.matter + "</p><p>" + P.measures + "</p></div></div>" +
      '<div class="lv-passport"><b>Passeport de la pièce</b>' + P.origin + " " + P.hours.replace(" h ", NB + "h ") + " d’atelier.</div>" +
      btn + '<p class="lv-hold">' + note + ' <a href="piece.html?p=' + N + '">Voir la fiche complète</a></p>';
    if (el.sheet.getAttribute("data-sig") !== html) {
      el.sheet.setAttribute("data-sig", html);
      el.sheet.innerHTML = html;
    }
  }
  function render() {
    renderCard();
    renderSheet();
    var other = otherActive();
    var btn = $("#regie-other");
    if (btn) btn.disabled = other || A.inCart(N) || A.isSold(N);
    if (wasOther && !other) {
      wasOther = false;
      sys("La réservation a expiré : la pièce " + NUM + " est de nouveau disponible.");
      viewerMsg("elle revient !!");
      say("Elle est de nouveau disponible, c’est le moment !");
      hearts(4);
    }
  }
  function openSheet() { el.sheet.classList.add("is-open"); renderSheet(); }
  function closeSheet() { el.sheet.classList.remove("is-open"); }

  function reserveNow() {
    if (A.inCart(N)) { A.openDrawer("cart"); return; }
    if (otherActive()) return;
    A.reserve(N);
    if (A.inCart(N)) {
      closeSheet();
      sys("Tu as réservé la pièce " + NUM + " : elle est à toi pendant 10 minutes.");
      hearts(8, 60);
      setTimeout(function () { viewerMsg("bravo !!"); }, 900);
      setTimeout(function () { hostReply("Bravo, elle est pour toi !", "Bravo, elle est à vous. Dix minutes pour finaliser."); }, 1800);
    }
  }

  /* ---------- Réponses de l'hôte au chat ---------- */
  var REPLIES = [
    [/taille|size|grand|petit|mesure/, "La M : épaules 47 cm, longueur 70 cm.", "Taille M : épaules 47 centimètres, longueur 70."],
    [/prix|combien|cher|euro/, "85 €, livraison offerte.", "Quatre-vingt-cinq euros, livraison offerte."],
    [/livr|expedi|delai/, "Livraison offerte dès 60 €, donc offerte ici.", "La livraison est offerte dès soixante euros."],
    [/matiere|coton|tissu|jean|denim/, "100 % coton : une chemise blanche et des chutes de jean.", "Cent pour cent coton, une chemise et des chutes de jean."],
    [/reserv|panier|prendre|veux|acheter/, "Touche le sac jaune puis Réserver : 10 minutes pour toi.", "Touchez le sac jaune, puis Réserver."],
    [/bonjour|salut|coucou|bonsoir|hello/, "Coucou et bienvenue dans le live !", "Bienvenue dans le live !"]
  ];
  function reply(text) {
    var t = plain(text);
    var r = REPLIES.filter(function (x) { return x[0].test(t); })[0];
    if (r) hostReply(r[1], r[2]); else hostReply("Merci pour ton message, je lis tout.", "Merci pour vos messages, je lis tout.");
  }

  /* ---------- Démarrage / relance ---------- */
  function start() {
    var tok = ++run;
    clearTimeout(capTimer);
    capQueue = []; capIndex = 0; capBusy = false; burst = false;
    pinned = false; lastCall = false; otherUntil = 0; wasOther = false;
    el.chat.innerHTML = ""; el.cap.classList.remove("is-on"); root.classList.remove("is-talking");
    el.card.removeAttribute("data-sig");
    el.bag.parentNode.style.visibility = "hidden";
    closeSheet();
    [ "bonsoir !", "coucou depuis Lyon", "ça commence !", "trop hâte de voir la pièce" ].forEach(function (m) { viewerMsg(m); });
    sys("Bienvenue dans le live LOOPR. Respecte les autres spectateurs.");
    setTimeout(function () { nextCap(tok); }, 600);
    setTimeout(function () {
      if (tok !== run) return;
      pinned = true;
      el.bag.parentNode.style.visibility = "visible";
      sys("LOOPR a épinglé la pièce " + NUM + ".");
      render();
      hearts(5);
    }, 3200);
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
    if (t.hasAttribute("data-live-reserve")) return reserveNow();
    if (t.hasAttribute("data-live-cart")) return A.openDrawer("cart");
    if (t.hasAttribute("data-sheet-open")) return openSheet();
    if (t.hasAttribute("data-sheet-close")) return closeSheet();
    if (t.hasAttribute("data-like")) return hearts(6, 55);
    if (t.hasAttribute("data-share")) return A.toast("Lien du live copié (simulation).");
    if (t.hasAttribute("data-leave")) { window.location.href = "index.html"; return; }
    if (t.id === "lv-follow") { t.classList.toggle("is-on"); t.textContent = t.classList.contains("is-on") ? "Abonné" : "Suivre"; return; }
    if (t.id === "lv-video") { closeSheet(); hearts(3, 80); }
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

  document.querySelector(".regie").addEventListener("click", function (e) {
    var b = e.target.closest("[data-regie]");
    if (!b) return;
    var a = b.getAttribute("data-regie");
    var tok = run;
    if (a === "restart") return start();
    if (a === "reset") {
      A.store.set("loopr.cart.v1", []); A.store.set(A.KEYS.order, null); A.store.set(A.KEYS.sold, []); A.store.set(A.KEYS.track, 0);
      window.location.reload();
      return;
    }
    if (a === "burst") {
      burst = true;
      sys("Le live s’emballe !");
      hearts(14, 50);
      say("Merci à tous, vous êtes de plus en plus nombreux !");
      setTimeout(function () { if (tok === run) burst = false; }, 15000);
    }
    if (a === "last") {
      if (!pinned) return;
      lastCall = true;
      sys("Dernier appel : la pièce " + NUM + " part bientôt.");
      say("Dernier appel pour la chemise patchs denim !");
      viewerMsg("je me décide !!"); viewerMsg("attends attends");
      render();
      setTimeout(function () { if (tok === run) { lastCall = false; render(); } }, 60000);
    }
    if (a === "other") {
      if (!pinned || A.inCart(N) || otherActive()) return;
      otherUntil = Date.now() + 45000;
      wasOther = true;
      sys("Un spectateur vient de réserver la pièce " + NUM + ".");
      viewerMsg("noooon, trop tard");
      say("Quelqu’un vient de la réserver. Elle revient si le paiement n’est pas finalisé.");
      render();
    }
  });

  document.addEventListener("loopr:refresh", render);
  setInterval(render, 1000);
  start();
})();
