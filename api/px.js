// Relais générique : sert un site réel sous notre domaine et ajoute notre interface à ses pages.
// Rien n'est copié, tout est relayé à la demande. La configuration est dans proto.config.mjs.
import cfg from '../proto.config.mjs';

export const config = { runtime: 'edge' };
const TEXT = /json|html|javascript|text\/|xml/;

export default async function handler(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const secret = process.env.PROTO_KEY;                    // facultatif : protège le lien par ?k=<clé>
  const cookie = req.headers.get('cookie') || '';
  const given = url.searchParams.get('k');
  const known = !secret || given === secret || cookie.split(/;\s*/).includes('pk=' + secret);
  const remember = secret && given === secret ? `pk=${secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` : null;

  // Entrée : / redirige vers l'adresse d'entrée du prototype
  if (url.searchParams.has('entry')) {
    if (!known) return denied();
    const v = url.searchParams.get('v'); // variante de l'interface (/b → variante B)
    const h = { location: cfg.entry(origin) + (v && /^[a-z]$/.test(v) ? '&pzv=' + v : ''), 'cache-control': 'no-store' };
    if (remember) h['set-cookie'] = remember;
    return new Response(null, { status: 302, headers: h });
  }

  // on ne relaie que la lecture : les envois (statistiques, formulaires) ne partent pas vers le site réel
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response(null, { status: 204 });

  const u = url.searchParams.get('u') || cfg.main + '/';
  url.searchParams.delete('u'); url.searchParams.delete('k');
  const cut = u.indexOf('/');
  const key = cut < 0 ? u : u.slice(0, cut), path = cut < 0 ? '' : u.slice(cut + 1);
  const base = cfg.hosts[key];
  if (!base) return new Response('Hôte inconnu', { status: 400 });

  const qs = url.searchParams.toString();
  const target = base + '/' + path.split('/').map(encodeURIComponent).join('/') + (qs ? '?' + qs : '');
  const headers = { accept: req.headers.get('accept') || '*/*' };
  const range = req.headers.get('range'); if (range) headers.range = range;
  const up = await fetch(target, { headers, redirect: 'follow' });
  const type = up.headers.get('content-type') || 'application/octet-stream';

  if (TEXT.test(type)) {
    if (type.includes('html') && !known) return denied();
    let body = await up.text();
    // toute adresse du site réel écrite en dur (page, script, configuration) repasse par nous
    // (y compris sous leur forme échappée dans du JSON : https:\/\/domaine)
    const esc = (v) => v.replace(/\//g, '\\/');
    for (const [k, host] of Object.entries(cfg.hosts)) {
      const ours = k === cfg.main ? origin : origin + '/_h/' + k;
      body = body.split(host).join(ours).split(esc(host)).join(esc(ours));
    }
    // retouche facultative d'une réponse JSON du site réel (par exemple le style des bulles de la carte)
    if (cfg.patch && type.includes('json')) { try { const j = JSON.parse(body); if (cfg.patch(path, j) !== false) body = JSON.stringify(j); } catch (e) {} }
    if (type.includes('html')) {
      // contenu en français : on le dit au navigateur pour que Chrome ne propose plus de traduire
      body = body.replace(/<html([^>]*)>/i, (m, a) => '<html' + a.replace(/\s(lang|translate)="[^"]*"/gi, '') + ' lang="fr" translate="no">')
        .replace(/<head(\s[^>]*)?>/i, (m) => m + '<meta name="google" content="notranslate">');
    }
    if (type.includes('html')) body = body.replace(/<\/body>/i, cfg.inject.map((s) => `<script src="${s}"></script>`).join('') + '</body>');
    const h = { 'content-type': type, 'cache-control': 'no-store' };
    if (remember) h['set-cookie'] = remember;
    return new Response(body, { status: up.status, headers: h });
  }
  const h = { 'content-type': type, 'cache-control': 'public, max-age=3600' };
  for (const k of ['content-range', 'accept-ranges']) { const v = up.headers.get(k); if (v) h[k] = v; }
  return new Response(up.body, { status: up.status, headers: h });
}

function denied() {
  return new Response('Prototype privé. Demandez le lien complet à Fedelo Studio.', { status: 401, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
