/* LOOPR — Mon compte. Compte d'Océane ouvert sur cet appareil, sans mot de passe (maquette). */
(function () {
  "use strict";
  var A = window.LOOPR_APP;
  var root = document.getElementById("acct-root");
  if (!A || !root) return;
  var NB = " ";
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function render() {
    var a = A.account();
    var pr = A.promo();
    var o = A.store.get(A.KEYS.order, null);
    var wish = A.store.get("loopr.wish.v1", []).map(A.byN).filter(Boolean);

    var promoCard;
    if (pr.state === "claimed" && !pr.used) {
      promoCard = '<p class="acct-code">' + A.PROMO_CODE + '</p><p>−' + A.PROMO_PCT + NB + '% sur ta première commande, enregistré pour ' + esc(pr.email) + '. Il s’applique tout seul dans le panier.</p>' +
        '<a class="btn" href="index.html#pieces">Voir les pièces</a>';
    } else if (pr.state === "claimed") {
      promoCard = '<p>Ton code ' + A.PROMO_CODE + ' a été utilisé sur ta première commande' + (o ? " (" + esc(o.id) + ")" : "") + '.</p>';
    } else {
      promoCard = '<p>Laisse ton e-mail pour recevoir −' + A.PROMO_PCT + NB + '% sur ta première commande.</p><button class="btn" type="button" data-promo-open>Recevoir mes −' + A.PROMO_PCT + NB + '%</button>';
    }

    var orderCard;
    if (o) {
      var items = o.items.map(A.byN).filter(Boolean);
      orderCard = items.map(function (p) {
        return '<div class="ord-line"><div class="ord-ph">' + A.pieceArt(p, "a") + '</div><div><div class="ord-name">N°' + NB + A.pad(p.n) + ", " + p.name + "</div><div>Taille " + p.size + '</div></div><div class="ord-name">' + A.eur(p.price) + "</div></div>";
      }).join("") +
        '<div class="ord-sums">' + (o.disc ? '<div><span>Code ' + A.PROMO_CODE + '</span><span>−' + A.eur(o.disc) + "</span></div>" : "") + '<div class="total"><span>Total payé</span><span>' + A.eur(o.total) + "</span></div></div>" +
        '<p class="ord-meta">Commande ' + esc(o.id) + '</p><div class="ord-actions"><a class="btn btn--indigo" href="suivi.html">Suivre ma commande</a></div>';
    } else {
      orderCard = '<p>Pas encore de commande. La première réservation se fait sur la fiche d’une pièce.</p><div class="ord-actions"><a class="btn" href="index.html#pieces">Voir le drop</a></div>';
    }

    var wishCard = wish.length ? '<ul class="acct-wish">' + wish.map(function (p) {
      return '<li><a href="piece.html?p=' + p.n + '"><span class="ord-ph">' + A.pieceArt(p, "e") + "</span><span><b>N°" + NB + A.pad(p.n) + "</b><br>" + p.name + "<br>" + A.eur(p.price) + "</span></a></li>";
    }).join("") + "</ul>" : '<p>Aucune envie pour l’instant. Touche le cœur sur une pièce pour la garder de côté.</p>';

    var level = o ? "Loop" : "Seed";
    var clubCard = '<p class="acct-level">Niveau ' + level + "</p><p>" + (o
      ? "Un premier achat donne 24 heures d’accès anticipé au prochain drop. Collector à 3 achats ou 250" + NB + "€ cumulés."
      : "Inscrite à la liste d’attente : alertes de drop, lookbook et code de bienvenue. Le premier achat ouvre le niveau Loop.") +
      '</p><a class="btn btn--ghost" href="club.html">Voir le LOOP Club</a>';

    root.innerHTML =
      '<div class="acct-head"><span class="acct-big" aria-hidden="true">' + esc(a.first.charAt(0)) + '</span><div><h1 class="ord-title">Bonjour ' + esc(a.first) + "</h1>" +
      '<p class="ord-sub">Ton compte est ouvert sur cet appareil, sans mot de passe. Tu y retrouves tes informations, ta commande et tes envies.</p></div></div>' +
      '<div class="acct-grid">' +
      '<section class="ord-card"><h2>Mes informations</h2><form id="acct-form" class="acct-form">' +
      '<label>Prénom<input class="input" name="first" value="' + esc(a.first) + '" autocomplete="given-name" required></label>' +
      '<label>Adresse e-mail<input class="input" type="email" name="email" value="' + esc(a.email) + '" autocomplete="email" required></label>' +
      '<label>Ville<input class="input" name="city" value="' + esc(a.city) + '" autocomplete="address-level2"></label>' +
      '<label class="acct-check"><input type="checkbox" name="alerts"' + (a.alerts ? " checked" : "") + '> Me prévenir avant chaque drop et à chaque pop-up près de chez moi</label>' +
      '<div class="ord-actions"><button class="btn btn--indigo" type="submit">Enregistrer</button></div></form></section>' +
      '<div class="ord-side">' +
      '<section class="ord-next"><h2>Ma réduction</h2>' + promoCard + "</section>" +
      '<section class="ord-next"><h2>LOOP Club</h2>' + clubCard + "</section></div>" +
      '<section class="ord-card"><h2>Ma commande</h2>' + orderCard + "</section>" +
      '<section class="ord-card"><h2>Mes envies</h2>' + wishCard + "</section></div>" +
      '<aside class="acct-demo"><h2>Pour la répétition</h2><p>Remet le site comme au début : panier vide, pièce n° 08 en vente, pas de commande, pop-up de bienvenue de retour.</p>' +
      '<button class="btn btn--ghost" type="button" data-demo-reset>Remettre le site à zéro (répétition)</button></aside>';
  }

  document.addEventListener("submit", function (e) {
    if (e.target.id !== "acct-form") return;
    e.preventDefault();
    var f = e.target;
    A.saveAccount({ first: f.first.value.trim() || "Océane", email: f.email.value.trim(), city: f.city.value.trim(), alerts: f.alerts.checked });
    A.toast("Informations enregistrées.");
    A.refresh();
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (t && t.hasAttribute("data-demo-reset")) { A.resetDemo(); A.toast("Site remis à zéro."); A.refresh(); }
  });
  document.addEventListener("loopr:refresh", render);
  render();
})();
