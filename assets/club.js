/* LOOPR — page LOOP Club : simulateur de niveau. Rien n'est enregistré, c'est une démonstration. */
(function () {
  "use strict";
  var box = document.getElementById("club-sim");
  if (!box) return;
  var A = window.LOOPR_APP;
  var NB = " ";
  var PRICE = 85, MAX = 6;
  var LEVELS = [
    { name: "Seed", perks: ["Alerte une heure avant chaque drop et chaque live", "Code de bienvenue et lookbook du drop"] },
    { name: "Loop", perks: ["Accès anticipé de 24 heures sur une pièce sur cinq", "Points d’achat et parrainage", "Passeports de toutes tes pièces au même endroit"] },
    { name: "Collector", perks: ["Pièces VIP réservées aux Collector", "Reprise bonifiée de 15" + NB + "%", "Invitation prioritaire aux pop-ups et livraison offerte"] }
  ];
  var n = 0;
  try { if (A && A.store.get(A.KEYS.order, null)) n = 1; } catch (e) { n = 0; }

  function $(id) { return document.getElementById(id); }
  function levelOf(count) { return count >= 3 || count * PRICE >= 250 ? 2 : count >= 1 ? 1 : 0; }

  function render() {
    var lv = levelOf(n), L = LEVELS[lv];
    $("sim-level").textContent = L.name;
    $("sim-n").textContent = String(n);
    $("sim-eur").textContent = n * PRICE + NB + "€";
    $("sim-fill").style.width = Math.min(n / 3, 1) * 100 + "%";
    var next;
    if (lv === 0) next = "Un premier achat te fait passer Loop : tu entres 24 heures avant tout le monde sur le prochain drop.";
    else if (lv === 1) { var r = 3 - n; next = "Encore " + r + " pièce" + (r > 1 ? "s" : "") + " pour passer Collector (3 pièces, ou 250" + NB + "€ d’achats)."; }
    else next = "Tu es au dernier niveau. Les pièces VIP et la reprise bonifiée sont pour toi.";
    $("sim-next").textContent = next;
    $("sim-perks").innerHTML = L.perks.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    box.setAttribute("data-level", String(lv));
    box.querySelector('[data-sim="add"]').disabled = n >= MAX;
    box.querySelector('[data-sim="sub"]').disabled = n <= 0;
  }

  box.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-sim]");
    if (!b) return;
    var a = b.getAttribute("data-sim");
    if (a === "add") n = Math.min(MAX, n + 1);
    if (a === "sub") n = Math.max(0, n - 1);
    if (a === "reset") n = 0;
    render();
  });
  render();
})();
