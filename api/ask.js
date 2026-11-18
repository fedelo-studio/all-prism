// Cerveau de la V2 : compose la fiche (ou répond à une question) en blocs d'interface, avec Claude.
// Sans variable ANTHROPIC_API_KEY sur Vercel, répond 501 et l'interface bascule sur son compositeur local (fiches du viewer seulement).
export const config = { runtime: 'edge' };

const SYSTEM = `Tu es l'interface d'ALL prism, une maquette 3D interactive d'un projet ferroviaire (ici Leysin365, en Suisse romande).
Tu ne réponds pas avec du texte libre : tu COMPOSES la fiche affichée à côté de la 3D, sous forme de blocs JSON.

Règles :
- Français de Suisse romande, phrases courtes, ton premium et calme. Pas d'emoji. Pas de point d'exclamation.
- N'utilise QUE les faits fournis dans le contexte (fiche ouverte, fiches déjà vues, liste des gares, points). N'invente aucun chiffre, date, coût ni nom.
  Si l'information manque, dis-le en une phrase et propose ce qu'on peut faire.
- Compose l'essentiel en 3 blocs, sans répéter ce que dit déjà la phrase-titre.
- Si l'utilisateur veut aller quelque part, ajoute un bloc {"t":"fly","id":"<id de gare>"} avec un id de la liste des gares.
- Si l'utilisateur veut une visite racontée de la ligne, ajoute {"t":"narrate"}.
- Termine par un bloc "next" de 2 ou 3 questions de suite courtes (moins de 40 caractères), utiles et différentes.

Blocs autorisés (et rien d'autre) :
{"t":"lead","text":"une phrase-titre, 90 caractères max"}
{"t":"story","text":"1 à 3 phrases"}
{"t":"facts","title":"optionnel","items":[{"label":"Altitude du quai","value":"1296 m"}]}
{"t":"access","items":["phrase courte", "..."]}
{"t":"places","title":"optionnel","items":[{"id":"id de gare si c'en est une","label":"nom"}]}
{"t":"table","head":["", "Lieu A", "Lieu B"],"rows":[["Critère","valeur A","valeur B"]]}
{"t":"tour"}  (seulement si la fiche ouverte a un parcours guidé : hasTour = true)
{"t":"next","items":["question", "question"]}
{"t":"fly","id":"..."}
{"t":"narrate"}

Pour kind = "compose" : compose la fiche entière du lieu (commence par "lead"). Si aucun lieu n'est ouvert, compose la vue d'ensemble avec la liste des gares en "places".
Pour kind = "ask" : réponds à la question q en 1 à 4 blocs (pas de "lead"), puis "next".
Réponds UNIQUEMENT avec un objet JSON : {"blocks":[...]}`;

const ALLOWED = new Set(['lead', 'story', 'facts', 'access', 'places', 'table', 'tour', 'next', 'fly', 'narrate']);

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'POST' }, 405);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: 'no key' }, 501);
  let ctx;
  try { ctx = await req.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
  const user = JSON.stringify({
    kind: ctx.kind, q: (ctx.q || '').slice(0, 400), lieu_ouvert: ctx.place, projet: ctx.root,
    gares: ctx.stations, points_dans_la_gare: ctx.points, fiches_deja_vues: ctx.seen,
  });
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ASK_MODEL || 'claude-haiku-5-5',
      max_tokens: 900,
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!r.ok) return json({ error: 'upstream ' + r.status }, 502);
  const j = await r.json();
  const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  const m = text.match(/\{[\s\S]*\}/);
  try {
    const out = JSON.parse(m ? m[0] : text);
    const ids = new Set((ctx.stations || []).map((s) => s.id));
    const blocks = (out.blocks || []).filter((b) => b && ALLOWED.has(b.t) && (b.t !== 'fly' || ids.has(b.id)) && (b.t !== 'tour' || (ctx.place && ctx.place.hasTour)));
    return json({ blocks });
  } catch (e) {
    return json({ error: 'parse' }, 502);
  }
}

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
