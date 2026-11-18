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

## V3 « Prisme vivant » (branche de travail, la v2 reste sur main)
`proto.config.mjs` injecte `public/v3/prism.js` au lieu de `public/skin.js`.
- Une seule surface : la fiche est composée par l'IA à chaque arrêt de caméra, à partir d'un registre de blocs
  (phrase-titre, chiffres, récit, accessibilité, lieux, comparaison, parcours, questions suivantes).
- Quatre regards sur le même lieu : Essentiel, Voyageur, Technique, Accessible.
- Les questions s'ajoutent dans la fiche et peuvent déplacer la caméra (« Emmène-moi à… »). Le prisme se souvient
  des gares ouvertes et peut les comparer.
- « Raconter la ligne » : visite automatique des gares, sous-titres et voix (bouton son).
- Cerveau : `api/ask.js` appelle Claude si `ANTHROPIC_API_KEY` est posée dans Vercel (modèle via `ASK_MODEL`,
  par défaut `claude-haiku-5-5`). Sans clé, badge « IA démo » et compositeur local qui n'utilise que le texte des fiches.
- Test local : `python3 -m http.server 8765` à la racine, puis
  `http://localhost:8765/test/stub-v3.html?config=config.json&manifestUrl=manifest.json`.

### Variante B « la barre » (`/b`, ou bouton « B · Barre » en haut à droite)
Même cerveau et mêmes blocs, mais l'IA vit dans une barre en bas au centre. Repliée, la barre devient un mini widget
qui change selon l'écran : vue d'ensemble = « Demander à Leysin365 » + Raconter ; lieu = nom, repère, retour ;
parcours guidé = lecture, curseur pour avancer, Quitter. Sur téléphone elle reste repliée par défaut.
