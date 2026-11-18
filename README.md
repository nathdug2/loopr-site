# LOOPR, maquette du site e-commerce

Maquette statique (HTML, CSS, JavaScript, sans dépendance) du site propre de LOOPR, réalisée pour le dossier de groupe du cours Fondamentaux du e-commerce.

## Pages

- `index.html` : drop en cours (12 pièces, statuts en direct), compte à rebours du prochain drop, lien vers le live TikTok (présentation de la collection, achat uniquement sur le site), accès anticipé membres, teaser pop-up
- `piece.html?p=1` à `?p=12` : fiche pièce unique (avant/après, passeport, réservation 10 min, alerte, envies)
- `popup.html` : prochain pop-up, créneau d'essayage, retrait sur place, calendrier des villes
- `live.html` : live TikTok simulé, présentation de la nouvelle collection (rien ne s'y achète, lien épinglé vers le site)
- `compte.html` : compte d'Océane, ouvert sans mot de passe (informations, réduction, commande, envies, niveau LOOP Club) et bouton « Remettre le site à zéro » pour les répétitions
- `club.html` : LOOP Club (Seed, Loop, Collector)

Le panier est un tiroir commun : réservation de 10 minutes avec minuteur, envies, paiement express (maquette, non branché), achat sans compte ou avec le compte d'Océane.

Pop-up de bienvenue sur la page du drop : une adresse e-mail donne le code BIENVENUE10, qui retire 10 % sur la première commande (appliqué automatiquement dans le panier et la commande).

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
