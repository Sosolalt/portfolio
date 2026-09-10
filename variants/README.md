# Variantes de la page d'accueil

**Version retenue : 05 — Orbite** (choix du 10 septembre 2026). Les autres sont
conservées comme historique du travail.

Trois pages HTML autonomes, à ouvrir directement dans le navigateur (ou avec
l'aperçu de VS Code) pour les comparer au site actuel (`npm run dev`).

Les polices sont chargées depuis Google Fonts et Fontshare : il faut une
connexion réseau, comme pour le site.

Ce qui ne change pas, dans les trois : la palette, les trois familles de
caractères, le ciel étoilé cliquable (« faire un vœu »), l'accent par projet, et
chaque chaîne de texte, reprise mot pour mot depuis `src/data/`.

Ce qui change partout, parce que ce sont les marqueurs « généré par une IA » les
plus lisibles : plus d'eyebrow en capitales espacées au-dessus du nom, plus de
titres de section en mono, plus de puces « chips » pour chaque liste, plus de
curseur `|` clignotant, plus de flou « verre » sur la nav, des icônes dessinées
en SVG au lieu des glyphes `→ ↗ ✕`, une seule entrée animée écrite pour le hero
au lieu d'un fondu identique sur chaque section, et les surfaces du navigateur
(barre de défilement, sélection, focus, soulignements) reprises dans la palette.

## 01 — Observatoire

Éditorial, ancré à gauche. Le nom en bas à gauche du ciel, les anneaux décalés
à droite comme un horizon. Les sections ont une colonne d'étiquette collante à
gauche et le contenu à droite. Les projets forment un registre : des lignes
séparées par des filets, dont le filet supérieur prend l'accent du projet au
survol. La ligne de phrases défile verticalement avec un mince chronomètre menthe.
L'étude de cas reste une fiche qui monte du bas.

## 02 — Constellation

Le hero centré est conservé mais réduit à l'essentiel : nom, rôle, machine à
écrire (avec un vrai curseur en barre), localisation. Les anneaux laissent la
place à ce qui donne son nom au design : une constellation tracée dans le ciel,
et les étoiles proches du pointeur qui se relient entre elles. Les cartes à
liseré supérieur gardent leur signature, mais sur une grille décalée plutôt
qu'un 2×2. Étude de cas en fiche.

## 03 — Méridien

Typographique. Le nom sur deux lignes à pleine taille, le rôle et les quatre
phrases en « cadran » à droite, une étoile menthe passant de l'une à l'autre.
Grands titres de section soulignés d'un filet. Les études de cas se déplient sur
place sous chaque projet (plus de fenêtre modale) ; la nav souligne la section
courante. Le paragraphe « À propos » est composé en grand, les compétences en
liste à filets.

## 04 — Zénith

Le hero de l'original, réduit à ce qu'un recruteur cherche : anneaux centrés,
nom lisible mais un cran plus calme, **AI Engineer** en menthe comme ligne la
plus forte, « Paris » en petit dessous, puis les quatre domaines qui défilent.
Rien d'autre. Sections et registre de projets d'Observatoire.

## 05 — Orbite

Même hero que Zénith avec deux actions sous le profil (Projets en menthe pleine,
Contact en contour) pour donner un prochain pas immédiat. Sous le hero, tout
reste sur l'axe central : titres de section centrés, registre de projets pleine
largeur, texte et contact centrés.

Dans 04 et 05, le hero porte le titre « AI Engineer » seul, à la demande de
Lucas ; la ligne « Ingénieur informatique · Spécialité IA — Paris » n'y figure
plus (elle faisait doublon avec le titre). Le paragraphe « À propos » garde
l'information sur le diplôme.

## Notes

- Le détecteur du plugin impeccable ne signale plus que les polices
  (Space Grotesk et Geist Mono sont dans sa liste de faces « surutilisées ») ;
  elles sont imposées par les tokens, donc conservées.
- Le halo de 18 px derrière les anneaux du battement de cœur a été retiré
  (marqueur « lueur sur fond sombre ») ; les anneaux, leur durée et leur
  décalage lub-dub sont inchangés.
- `prefers-reduced-motion: reduce` coupe toute animation, comme sur le site.
- Vérifié à 1440, 1280, 1024 et 360 px, sans débordement horizontal.
