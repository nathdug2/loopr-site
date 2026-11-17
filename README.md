# LOOPR, maquette du site e-commerce

Maquette statique (HTML, CSS, JavaScript, sans dépendance) du site propre de LOOPR, réalisée pour le dossier de groupe du cours Fondamentaux du e-commerce.

## Pages

- `index.html` : drop en cours (12 pièces, statuts en direct), compte à rebours du prochain drop, exclusivité live TikTok 72 h, accès anticipé membres, teaser pop-up
- `piece.html?p=1` à `?p=12` : fiche pièce unique (avant/après, passeport, réservation 10 min, alerte, envies)
- `popup.html` : prochain pop-up, créneau d'essayage, retrait sur place, calendrier des villes
- `club.html` : LOOP Club (Seed, Loop, Collector)

Le panier est un tiroir commun : réservation de 10 minutes avec minuteur, envies, paiement express (maquette, non branché), achat sans compte.

## Contenu fictif

Pièces, prix, dates de pop-up, seuils du club et textes sont des exemples. Les illustrations SVG remplacent les photos.

## Lancer en local

```
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Déployer sur Vercel

Sur vercel.com : Add New, Project, importer ce dépôt GitHub. Framework : Other. Aucune commande de build, dossier racine `./`. Chaque push sur `main` redéploie le site.

## Identité visuelle

Denim indigo (`#1b2459`), surpiqûre ambre (`#f2a71b`), fond bleu lavé (`#eef1f7`). Polices Bricolage Grotesque et Instrument Sans (licence OFL, fichiers dans `assets/fonts`).
