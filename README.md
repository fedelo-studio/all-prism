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
