// Le SEUL fichier à adapter par projet.
// hosts : les serveurs du site réel à relayer. `main` est celui qui sert la page ; les autres passent par /_h/<clé>/…
// entry : l'adresse d'entrée du prototype, calculée à partir de notre propre origine.
// inject : ce qu'on ajoute à chaque page HTML du site réel (notre interface).
const rev = 'sha256:f1bd51d178f8a6a7988a4140c49cc5a9f7eca5f549dd9d1ea850dfd8e9b2b28b';

export default {
  name: 'ALL prism, piste liquide',
  main: 'w',
  hosts: {
    w: 'https://staging.wrapper.all-prism.app',
    a: 'https://staging.all-prism.app',
    s: 'https://staging.assets.all-prism.app',
  },
  inject: ['/v3/prism.js'], // V3 « Prisme vivant » (la v2 reste sur main : public/skin.js)
  // Les bulles de la carte sont dessinées par le viewer lui-même, à partir de son manifeste.
  // On ne peut pas les redessiner, mais on peut changer leurs réglages au passage : fond fumé, texte blanc, un peu plus grandes. Ne pas mettre spriteColorHex en blanc : texte blanc sur bulle blanche.
  patch(path, j) {
    const h = j && j.visual && j.visual.hotspot; if (!/\/manifest$/.test('/' + path) || !h) return false;
    Object.assign(h, { spriteColorHex: '#16181c', textColorHex: '#ffffff' }); // la bulle prend la couleur de spriteColorHex (vu à l'écran), le texte reste blanc
    const d = h.responsive && h.responsive.desktop; if (d) Object.assign(d, { visibleHeight: 40, fontSize: 15, horizontalPadding: 18 });
  },
  entry(origin) {
    const api = origin + '/_h/a/api/viewer/projects/embed-tpc-leysin365';
    const p = new URLSearchParams({
      config: api + '/wrapper-config?locale=fr&localizationRevision=' + encodeURIComponent(rev),
      instanceId: 'tpc-leysin365-primary', embedKey: 'embed-tpc-leysin365', lang: 'fr',
      localizationSchemaVersion: 'all-prism-project-localization.v1', resolvedLocale: 'fr', defaultLocale: 'fr', supportedLocales: 'fr',
      requestedLocale: 'fr', localeFallbackApplied: 'false', localeChangeMode: 'fixed', mainLoaderCodeVersion: 'wrapper-2026-11-11-poi-marker-fold-v1',
      bootstrapUrl: api + '/bootstrap', experienceId: 'tpc-leysin365',
      manifestUrl: api + '/manifest?revision=v57&assetVersion=v85&locale=fr&localizationRevision=' + encodeURIComponent(rev), manifestVersion: 'v85',
    });
    return '/all-prism.html?' + p.toString();
  },
};
