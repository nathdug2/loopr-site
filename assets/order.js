/* LOOPR — Commande, Suivi, Passeport. Données gardées dans ce navigateur (maquette). */
(function () {
  "use strict";
  var A = window.LOOPR_APP;
  var D = window.LOOPR;
  var PAGE = document.body.getAttribute("data-page");
  if (!A) return;
  var NB = " ";
  var root = document.getElementById("ord-root");
  var STEPS = [
    ["Commande confirmée", "Ton paiement est validé et la pièce est à toi.", 0],
    ["Pièce vérifiée et emballée", "L’atelier contrôle les coutures, plie la pièce et glisse le passeport dans le colis.", 1],
    ["Colis expédié", "Le transporteur a pris ton colis.", 2],
    ["Colis livré", "Ta pièce est arrivée. Scanne le QR du colis pour ouvrir son passeport.", 4]
  ];

  function order() {
    var o = A.store.get(A.KEYS.order, null);
    if (o) return { o: o, demo: false };
    /* Sans commande dans ce navigateur, on montre un exemple pour que la page reste présentable. */
    var p = A.byN(8);
    return { demo: true, o: { id: "LP-" + D.drop.number + "-0000", at: Date.now(), items: [8], sub: p.price, ship: 0, total: p.price } };
  }
  function day(ts, plus) {
    var d = new Date(ts + plus * 86400000);
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  }
  function ph(p, suf) { return '<div class="ord-ph">' + A.pieceArt(p, suf) + "</div>"; }
  function sim() { return '<span class="ord-sim">Maquette : aucun paiement n’a été effectué</span>'; }

  /* ---------- Commande confirmée ---------- */
  function renderOrder() {
    var saved = A.store.get(A.KEYS.order, null);
    if (!saved) {
      root.innerHTML = '<div class="ord-empty"><h1 class="ord-title">Pas encore de commande</h1><p>Aucune commande n’a été passée dans ce navigateur. Réserve une pièce du drop, ouvre le panier, puis valide la commande.</p>' +
        '<div class="ord-actions"><a class="btn btn--indigo" href="index.html#pieces">Voir le drop</a><a class="btn btn--ghost" href="live.html">Aller au live</a></div></div>';
      return;
    }
    var o = saved;
    var items = o.items.map(A.byN).filter(Boolean);
    root.innerHTML =
      sim() +
      '<h1 class="ord-title">Commande confirmée</h1>' +
      '<p class="ord-sub">Merci ! Un e-mail de confirmation est parti (simulation). Ta commande ' + o.id + ' est prise en charge par l’atelier.</p>' +
      '<div class="ord-grid"><article class="ord-card" aria-label="Récapitulatif">' +
      "<h2>Commande " + o.id + "</h2>" +
      items.map(function (p) {
        return '<div class="ord-line">' + ph(p, "o") + '<div><div class="ord-name">N°' + NB + A.pad(p.n) + ", " + p.name + "</div><div>Taille " + p.size + '</div></div><div class="ord-name">' + A.eur(p.price) + "</div></div>";
      }).join("") +
      '<div class="ord-sums"><div><span>Sous-total</span><span>' + A.eur(o.sub) + "</span></div>" + (o.disc ? "<div><span>Code " + A.PROMO_CODE + " (−" + A.PROMO_PCT + NB + "%)</span><span>−" + A.eur(o.disc) + "</span></div>" : "") + "<div><span>Livraison</span><span>" + (o.ship ? A.eur(o.ship) : "Offerte") + '</span></div><div class="total"><span>Total</span><span>' + A.eur(o.total) + "</span></div></div>" +
      '<p class="ord-meta">Livraison estimée : ' + day(o.at, 3) + " (exemple).</p></article>" +
      '<div class="ord-side">' +
      '<section class="ord-next"><h2>Suivre ta commande</h2><p>Voir où en est ton colis et ouvrir le passeport de ta pièce à la réception.</p><a class="btn btn--indigo" href="suivi.html">Suivre ma commande</a></section>' +
      '<section class="ord-next"><h2>Tu passes niveau Loop</h2><p>Un premier achat suffit pour entrer 24 h avant tout le monde sur le prochain drop.</p><a class="btn" href="club.html">Voir le LOOP Club</a></section>' +
      "</div></div>";
  }

  /* ---------- Suivi + passeport ---------- */
  var scanned = false;
  function renderTrack() {
    var r = order();
    var o = r.o;
    var step = Math.max(0, Math.min(3, Number(A.store.get(A.KEYS.track, 0)) || 0));
    var p = A.byN(o.items[0]);
    var open = step === 3 && scanned;
    var list = STEPS.map(function (s, i) {
      var fin = i === 3 && step === 3;
      var cls = i < step || fin ? "is-done" : i === step ? "is-now" : "";
      var when = i <= step ? day(o.at, s[2]) : "Prévue " + day(o.at, s[2]);
      return '<li class="' + cls + '"><span class="dot" aria-hidden="true">' + (i < step || fin ? "✓" : i + 1) + "</span><b>" + s[0] + "</b><span>" + when + (i === step && !fin ? " · étape en cours" : "") + "</span><br><span>" + s[1] + "</span></li>";
    }).join("");
    root.innerHTML =
      (r.demo ? sim() + " " : "") +
      '<h1 class="ord-title">Suivi de commande</h1>' +
      '<p class="ord-sub">Commande ' + o.id + ", " + p.name + (r.demo ? " (exemple : aucune commande dans ce navigateur)." : ".") + "</p>" +
      '<div class="ord-grid"><section class="ord-card" aria-label="Étapes de livraison"><h2>Où en est ton colis</h2><ol class="trk">' + list + "</ol>" +
      '<div class="trk-ctl">' +
      (step < 3 ? '<button class="btn btn--indigo" type="button" data-track-next>Avancer d’une étape</button>' : "") +
      '<button class="btn btn--ghost" type="button" data-track-reset>Revenir au début</button>' +
      '<button class="btn btn--ghost" type="button" data-demo-reset>Remettre la pièce en vente</button>' +
      "<small>Boutons de démonstration : en vrai, c’est le transporteur qui fait avancer le suivi.</small></div></section>" +
      passport(p, step, open) + "</div>";
  }
  function passport(p, step, open) {
    var locked = !open;
    return '<section class="pass' + (locked ? " is-locked" : " is-new") + '" aria-label="Passeport de la pièce">' +
      '<div class="tagl"><small>Pièce unique</small><strong>N°' + NB + A.pad(p.n) + "</strong><small>1 exemplaire</small></div>" +
      '<div class="pass-lock"><h2>Passeport de la pièce</h2><p>' + (step === 3
        ? "Le colis est arrivé. Scanne le QR glissé dedans pour ouvrir l’histoire de ta pièce."
        : "Le passeport s’ouvre à la réception, avec le QR glissé dans le colis. Il raconte d’où vient ta pièce.") + "</p>" +
      (step === 3 ? '<button class="btn btn--indigo" type="button" data-scan>Scanner le QR du colis</button>' : '<button class="btn" type="button" disabled>Disponible à la livraison</button>') + "</div>" +
      '<div class="pass-body"><h2>' + p.name + "</h2><p>" + p.origin + "</p>" +
      '<dl class="pass-facts"><div><dt>Fabriquée à partir de</dt><dd>' + p.source.label + "</dd></div><div><dt>Temps d’atelier</dt><dd>" + p.hours.replace(" h ", NB + "h ") + "</dd></div>" +
      "<div><dt>Matière</dt><dd>" + p.matter + "</dd></div><div><dt>Taille et mesures</dt><dd>" + p.size + ". " + p.measures + "</dd></div></dl>" +
      '<div class="pass-care"><b>Pour la garder longtemps (exemple)</b>Lavage à 30 °C, retournée. Séchage à plat.</div>' +
      '<div class="ord-actions" style="margin-top:1.25rem"><a class="btn btn--indigo" href="club.html">Voir mon niveau LOOP Club</a><a class="btn btn--ghost" href="index.html#next-title">Prochain drop</a></div></div></section>';
  }
  function resetDemo() { A.resetDemo(); }

  /* ---------- Club : niveau Loop après un achat ---------- */
  function renderClub() {
    var slot = document.getElementById("club-status");
    var o = A.store.get(A.KEYS.order, null);
    if (!slot || !o) return;
    slot.innerHTML = '<div class="club-status"><b>Tu es niveau Loop</b><p>Ta commande ' + o.id + ' te donne l’accès anticipé de 24 h au prochain drop. Pour passer Collector : 3 achats, ou 250' + NB + '€ cumulés.</p></div>';
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    if (t.hasAttribute("data-track-next")) { A.store.set(A.KEYS.track, Math.min(3, (Number(A.store.get(A.KEYS.track, 0)) || 0) + 1)); scanned = false; return renderTrack(); }
    if (t.hasAttribute("data-track-reset")) { A.store.set(A.KEYS.track, 0); scanned = false; return renderTrack(); }
    if (t.hasAttribute("data-scan")) { scanned = true; return renderTrack(); }
    if (t.hasAttribute("data-demo-reset")) { resetDemo(); scanned = false; A.toast("Démo remise à zéro : la pièce n° 08 est de nouveau en vente, le code de bienvenue aussi."); return renderTrack(); }
  });

  if (PAGE === "order") renderOrder();
  if (PAGE === "track") renderTrack();
  if (PAGE === "club") renderClub();
})();
