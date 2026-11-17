/* Contenu d'exemple de la maquette LOOPR (pièces, prix, dates : tout est fictif). */
window.LOOPR = {
  drop: { number: 14, total: 12 },
  freeShippingFrom: 60,
  shippingFee: 4.9,

  // statut : dispo | reservee | vendue | tiktok (exclu live pendant 72 h)
  pieces: [
    { n: 1, slug: "veste-trucker-patchwork", name: "Veste trucker patchwork", type: "jacket", fabric: "patch", panel: "a", size: "M", price: 129, status: "dispo", cat: "vestes",
      source: { types: ["trousers", "trousers"], fabric: "denim", label: "2 jeans déclassés" },
      origin: "2 jeans collectés à Lyon, trop abîmés pour être revendus tels quels.", hours: "7 h 30", matter: "100 % coton denim", measures: "Longueur 60 cm, épaules 46 cm, manche 62 cm" },
    { n: 2, slug: "tote-toile-de-jean", name: "Tote bag toile de jean", type: "tote", fabric: "denim", panel: "b", size: "Unique", price: 45, status: "dispo", cat: "sacs",
      source: { types: ["trousers"], fabric: "denim", label: "1 jean usé aux genoux" },
      origin: "Un jean usé aux genoux. Les jambes sont devenues le corps du sac.", hours: "2 h 15", matter: "100 % coton denim, anses en ceinture récupérée", measures: "Hauteur 38 cm, largeur 36 cm" },
    { n: 3, slug: "chemise-rayures-recomposee", name: "Chemise rayures recomposée", type: "shirt", fabric: "stripe", panel: "c", size: "L", price: 79, status: "vendue", cat: "hauts",
      source: { types: ["shirt", "shirt"], fabric: "stripe", label: "2 chemises homme" },
      origin: "2 chemises homme aux rayures différentes, assemblées en une seule.", hours: "5 h 45", matter: "100 % coton", measures: "Longueur 74 cm, épaules 50 cm" },
    { n: 4, slug: "pantalon-workwear-patch", name: "Pantalon workwear à patchs", type: "trousers", fabric: "workwear", panel: "d", size: "40", price: 95, status: "dispo", cat: "bas",
      source: { types: ["trousers"], fabric: "workwear", label: "1 pantalon de travail" },
      origin: "Un pantalon de travail réformé, genoux renforcés avec des chutes de toile.", hours: "4 h 30", matter: "65 % coton, 35 % polyester", measures: "Taille 80 cm, entrejambe 76 cm" },
    { n: 5, slug: "robe-vichy-rouge", name: "Robe vichy rouge", type: "dress", fabric: "check", panel: "c", size: "S", price: 89, status: "reservee", cat: "robes",
      source: { types: ["shirt", "shirt"], fabric: "check", label: "2 chemises vichy" },
      origin: "2 chemises vichy et une nappe de brocante.", hours: "6 h 10", matter: "100 % coton", measures: "Longueur 98 cm, poitrine 88 cm" },
    { n: 6, slug: "sac-banane-patchwork", name: "Sac banane patchwork", type: "bumbag", fabric: "patch", panel: "a", size: "Unique", price: 39, status: "vendue", cat: "sacs",
      source: { types: ["trousers"], fabric: "denim", label: "1 jean" },
      origin: "Les chutes d'un jean coupé pour la veste n° 1.", hours: "1 h 40", matter: "Coton denim, zip récupéré", measures: "Largeur 26 cm, hauteur 14 cm" },
    { n: 7, slug: "gilet-indigo-matelasse", name: "Gilet indigo matelassé", type: "vest", fabric: "denim", panel: "b", size: "M", price: 69, status: "dispo", cat: "vestes",
      source: { types: ["jacket"], fabric: "denim", label: "1 veste en jean" },
      origin: "Une veste en jean sans manches, doublée avec une couverture de laine.", hours: "3 h 50", matter: "Coton denim, doublure laine recyclée", measures: "Longueur 58 cm, épaules 42 cm" },
    { n: 8, slug: "chemise-patchs-denim", name: "Chemise patchs denim", type: "shirt", fabric: "patch", panel: "d", size: "M", price: 85, status: "tiktok", cat: "hauts",
      source: { types: ["shirt", "trousers"], fabric: "denim", label: "1 chemise + 1 jean" },
      origin: "Une chemise blanche et les chutes de jean du drop précédent.", hours: "5 h 00", matter: "100 % coton", measures: "Longueur 70 cm, épaules 47 cm" },
    { n: 9, slug: "pantalon-droit-rayure", name: "Pantalon droit à rayures", type: "trousers", fabric: "stripe", panel: "a", size: "38", price: 98, status: "dispo", cat: "bas",
      source: { types: ["shirt", "shirt", "shirt"], fabric: "stripe", label: "3 chemises à rayures" },
      origin: "Trois chemises à rayures découpées en bandes, recousues en jambes.", hours: "8 h 00", matter: "100 % coton", measures: "Taille 74 cm, entrejambe 78 cm" },
    { n: 10, slug: "veste-workwear-bleu-de-travail", name: "Veste workwear", type: "jacket", fabric: "workwear", panel: "b", size: "L", price: 139, status: "reservee", cat: "vestes",
      source: { types: ["jacket"], fabric: "workwear", label: "1 veste de travail" },
      origin: "Une veste de travail d'atelier, poches refaites et col remplacé.", hours: "6 h 45", matter: "100 % coton", measures: "Longueur 68 cm, épaules 51 cm, manche 64 cm" },
    { n: 11, slug: "robe-denim-patch", name: "Robe denim à poches", type: "dress", fabric: "denim", panel: "c", size: "S", price: 99, status: "dispo", cat: "robes",
      source: { types: ["trousers", "trousers"], fabric: "denim", label: "2 jeans" },
      origin: "Deux jeans ouverts, les poches d'origine gardées sur le devant.", hours: "6 h 30", matter: "100 % coton denim", measures: "Longueur 95 cm, poitrine 90 cm" },
    { n: 12, slug: "tote-vichy", name: "Tote bag vichy", type: "tote", fabric: "check", panel: "d", size: "Unique", price: 49, status: "dispo", cat: "sacs",
      source: { types: ["shirt"], fabric: "check", label: "1 chemise vichy" },
      origin: "Une chemise vichy et des chutes de toile cirée.", hours: "2 h 30", matter: "Coton, intérieur toile cirée", measures: "Hauteur 36 cm, largeur 34 cm" }
  ],

  // aperçu du drop suivant, réservé aux membres Loop 24 h avant l'ouverture publique
  nextPieces: [
    { n: 13, type: "jacket", fabric: "patch" },
    { n: 14, type: "dress", fabric: "stripe" },
    { n: 15, type: "tote", fabric: "workwear" }
  ],

  popups: [
    { city: "Lyon", dates: "3 au 6 décembre 2026", hours: "11 h à 19 h", status: "next" },
    { city: "Lille", dates: "17 au 20 décembre 2026", hours: "11 h à 19 h", status: "soon" },
    { city: "Bordeaux", dates: "14 au 17 janvier 2027", hours: "11 h à 19 h", status: "soon" },
    { city: "Nantes", dates: "28 janvier au 1er février 2027", hours: "11 h à 19 h", status: "soon" },
    { city: "Paris", dates: "11 au 14 février 2027", hours: "11 h à 19 h", status: "soon" },
    { city: "Marseille", dates: "4 au 7 mars 2027", hours: "11 h à 19 h", status: "soon" }
  ]
};
