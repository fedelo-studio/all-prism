# ALL prism, piste liquide (prototype Fedelo Studio)

Un lien partageable qui montre le vrai viewer ALL prism (Leysin365, préproduction d'A-LL), 3D en direct,
avec l'interface du concept posée dessus par `public/skin.js`.

Rien n'est copié : `api/px.js` relaie les pages, scripts, configurations et scènes depuis les serveurs d'A-LL
et ajoute une balise `<script>` à la page du viewer. Tout ce qui est propre au projet tient dans `proto.config.mjs`.
Ce dépôt est créé à partir du modèle `fedelo-proto-overlay`.

## Déployer
1. Sur https://vercel.com/new, importer ce dépôt. Aucun réglage de build (pas de framework).
2. Recommandé : dans Settings > Environment Variables, ajouter `PROTO_KEY` avec une clé de ton choix, puis redéployer.
   Le lien à partager devient `https://<projet>.vercel.app/?k=<clé>`. Sans cette variable, le lien est ouvert à tous.

## État au 16 novembre 2026
- `skin.js` est vérifié sur le vrai viewer (vue d'ensemble, gare, point) par injection directe.
- Le relais Vercel n'a pas été déployé ni testé de bout en bout. Points à surveiller au premier essai :
  le chargement du fichier `.wasm.gz` d'Unity à travers la réécriture, et les scènes servies par `staging.assets.all-prism.app`.
- La révision de localisation et les versions (`v57`, `v85`) dans `proto.config.mjs` sont celles du 16 novembre : à mettre à jour si A-LL republie.

## Limites de l'interface
Voir l'en-tête de `public/skin.js` : étiquettes dessinées dans le canvas Unity (non restylables d'ici),
commande IA en réponses d'exemple, pas de déplacement à la main sur le tracé du parcours.

## V2 « Prisme vivant » (branche de travail)
Noms convenus avec Felipe le 18 novembre 2026 : cette version s'appelle **V2** (solution finale) et la précédente,
celle de `main` (`public/skin.js`), s'appelle **1.5**. Les dossiers et fichiers gardent leur nom technique (`public/v3/`).
La barre d'outils Vercel est coupée dans les réglages du projet (Settings > General > Vercel Toolbar : Off).

`proto.config.mjs` injecte `public/v3/prism.js` au lieu de `public/skin.js`.
- Une seule surface : la fiche est composée par l'IA à chaque arrêt de caméra, à partir d'un registre de blocs
  (phrase-titre, chiffres, récit, accessibilité, lieux, comparaison, parcours, questions suivantes).
- Les onglets de regard (Essentiel, Voyageur, Technique, Accessible) ont été retirés le 18 novembre 2026 à la demande de Felipe.
- Les réglages de démonstration en haut à droite (variante A / B, Origine / Prisme) sont masqués au repos : ils apparaissent
  au survol du coin ou au clic dedans.
- Les questions s'ajoutent dans la fiche et peuvent déplacer la caméra (« Emmène-moi à… »). Le prisme se souvient
  des gares ouvertes et peut les comparer.
- « Raconter la ligne » : visite automatique des gares, sous-titres et voix (bouton son).
- Cerveau : `api/ask.js` appelle Claude si `ANTHROPIC_API_KEY` est posée dans Vercel (modèle via `ASK_MODEL`,
  par défaut `claude-haiku-5-5`). Sans clé, badge « IA démo » et compositeur local qui n'utilise que le texte des fiches.
- Test local : `python3 -m http.server 8765` à la racine, puis
  `http://localhost:8765/test/stub-v3.html?config=config.json&manifestUrl=manifest.json`.

### Repasse fluidité (18 novembre 2026)
- L'état du viewer n'est pris en compte qu'une fois stable (110 ms pour un état qui s'ajoute, 330 ms pour un qui disparaît) :
  la fiche ne s'ouvre plus et ne se ferme plus plusieurs fois à l'arrivée. Une seule composition au démarrage, et une mise à jour
  sur place quand un détail du même lieu arrive après coup.
- Durées raccourcies (fiche 0,4 s, blocs 0,38 s avec décalage de 45 ms) ; fondu d'entrée sur le widget, le fil d'Ariane, la légende du récit.
- Le plan du parcours n'est reconstruit que si le tracé change ; le repère de position suit la caméra image par image
  (pastille HTML `#pz-pin` posée sur l'ancre du calque incliné). Les animations infinies sont en pause quand elles ne se voient pas.

### Prisme plus vif et voile du plan (18 novembre 2026, retour de Felipe)
- Palette de l'IA inchangée (tête blanche, queue chaude jaune / corail, queue froide bleu / glacier) mais plus saturée et à queues plus longues.
  Un trait de lumière fait le tour de la barre au repos (anneau 1 px + halo en bande, intensité réduite d'un cran après le retour de Felipe), plus vif au survol, et le prisme « s'allume »
  (deux têtes, tour en 1,5 s, éclat du halo) dès que l'IA compose, au moins 1 s visible. Les calques tournent par `transform` : pas de repeinte.
- Le voile sombre sous le plan de visite reprend la maquette Figma (fichier du design system, page « Pastilles · V2 », « Ombre douce (plan) ») :
  noir à 20 %, flou 140, ellipse 760 x 620 centrée sur le coin bas droit d'une vue 1512 x 757 (460 x 520 sur téléphone, centre à 40 px du bas),
  rendu en dégradé radial. Avant : jusqu'à 40 %.
- Repère de position du parcours allégé (retour de Felipe, 18 novembre au soir) : cœur de 9 px à la couleur du client avec un liseré blanc de 1,5 px,
  lentille de verre fine de 24 px autour (20 px sur téléphone), une seule onde mince et lente. Plus de halo plein ni de disque de 36 px.
- Icône d'accessibilité (bloc « Accessibilité » des réponses) : pictogramme Phosphor « person-arms-spread », graisse regular, 18 px
  (licence MIT, `assets/regular/person-arms-spread.svg` du dépôt phosphor-icons/core), à la place du bonhomme tracé à la main.
- Poignée grise en haut de la fiche sur téléphone retirée en variante B (le chevron de repli suffit) ; l'en-tête reprend 12 px de marge haute.

### Variante B « la barre » (`/b`, ou bouton « B · Barre » en haut à droite)
Même cerveau et mêmes blocs, mais l'IA vit dans une barre en bas au centre. Repliée, la barre devient un mini widget
qui change selon l'écran : vue d'ensemble = « Demander à Leysin365 » + Raconter ; lieu = nom, repère, retour ;
parcours guidé = lecture, curseur pour avancer, Quitter. Sur téléphone elle reste repliée par défaut.
