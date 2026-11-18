/* ALL prism, V3 « Prisme vivant » — Fedelo Studio
 *
 * Idée : une seule surface. Plus de fiche figée d'un côté et de barre IA de l'autre :
 * la fiche EST la réponse de l'IA. Elle se compose à chaque arrêt de caméra à partir
 * d'un petit registre de blocs (phrase-titre, chiffres, récit, accessibilité, lieux,
 * comparaison, parcours, questions suivantes), selon le regard choisi (Essentiel,
 * Voyageur, Technique, Accessible). Une question posée ajoute des blocs à la fiche
 * et peut déplacer la caméra. « Raconter la ligne » fait visiter les gares seul,
 * avec sous-titres et voix.
 *
 * Cerveau : /api/ask (Claude) si une clé ANTHROPIC_API_KEY est posée sur Vercel,
 * sinon un compositeur local qui n'utilise QUE le texte des fiches du viewer
 * (aucun chiffre inventé).
 *
 * Limites héritées du viewer : les points (bulles dans une gare) ne s'ouvrent pas
 * depuis nos boutons, seules les gares le peuvent ; les étiquettes de la 3D sont
 * dessinées par Unity.
 */
(function boot() {
  if (document.title.split('|').length < 3 && performance.now() < 6e4) return setTimeout(boot, 200);
  if (window.__prism) window.__prism.destroy();

  const $ = (s, r = document) => r.querySelector(s);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Q = new URLSearchParams(location.search);
  const VB = Q.get('pzv') === 'b' || /^#b\b/.test(location.hash); // variante B : l'IA vit dans la barre, repliée en mini widget
  const ROOT = (document.title.split('|').pop() || '').trim() || 'Vue d’ensemble';
  const accent = (getComputedStyle(document.documentElement).getPropertyValue('--all-prism-theme-accent-color') || '#ed695a').trim() || '#ed695a';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const wait = (ms) => new Promise((r) => setTimeout(r, RM ? Math.min(ms, 60) : ms));
  const nice = (s) => s.trim().replace(/^[◦\-–·•]\s*/, '').replace(/\.$/, '')
    .replace(/(\d)\s?%/g, '$1 %').replace(/\bm2\b/g, 'm²').replace(/(\d)\s(m|m²|km|s|min)\b/g, '$1 $2')
    .replace(/\(Conforme Lhand\)/i, '(conforme LHand)');
  const cap = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;
  const low = (s) => s ? s[0].toLowerCase() + s.slice(1) : s;

  /* ---------- icônes (traits 1.6, 20px) ---------- */
  const I = {
    spark: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2.5c.4 3.6 1.9 5.6 5.5 6.3v.4c-3.6.7-5.1 2.7-5.5 6.3h-.4c-.4-3.6-1.9-5.6-5.5-6.3v-.4c3.6-.7 5.1-2.7 5.5-6.3h.4Z" fill="currentColor"/><path d="M15.6 2.4c.1 1 .6 1.6 1.6 1.8v.2c-1 .2-1.5.8-1.6 1.8h-.2c-.1-1-.6-1.6-1.6-1.8v-.2c1-.2 1.5-.8 1.6-1.8h.2Z" fill="currentColor" opacity=".7"/></svg>',
    send: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 15.5v-11M5.5 9 10 4.5 14.5 9" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    go: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4.5 10h11m-4.5-4.5L15.5 10 11 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 20 20"><path d="M6 4.2v11.6c0 .6.7 1 1.2.7l9-5.8c.5-.3.5-1 0-1.3l-9-5.8C6.7 3.2 6 3.6 6 4.2Z" fill="currentColor"/></svg>',
    pause: '<svg width="16" height="16" viewBox="0 0 20 20"><rect x="5" y="4" width="3.4" height="12" rx="1" fill="currentColor"/><rect x="11.6" y="4" width="3.4" height="12" rx="1" fill="currentColor"/></svg>',
    stop: '<svg width="14" height="14" viewBox="0 0 20 20"><rect x="4.5" y="4.5" width="11" height="11" rx="2" fill="currentColor"/></svg>',
    sound: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3.5 8v4h3l4 3.5v-11l-4 3.5h-3Z" fill="currentColor"/><path d="M13.5 7.2a4 4 0 0 1 0 5.6M15.6 5a7 7 0 0 1 0 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    mute: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3.5 8v4h3l4 3.5v-11l-4 3.5h-3Z" fill="currentColor"/><path d="m13.5 8 4 4m0-4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    access: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="3.6" r="1.6" fill="currentColor"/><path d="M5 6.6h10M10 6.6v5m0 0-3 5m3-5 3 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pin: '<svg width="14" height="14" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" fill="currentColor"/></svg>',
    down: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="m5 7.5 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    up: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="m5 12.5 5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  /* ---------- styles ---------- */
  const css = document.createElement('style');
  css.id = 'pz-style';
  css.textContent = `
  html:not(.pz-orig) #poi-card-panel,html:not(.pz-orig) .camera-spatial-control,html:not(.pz-orig) #interaction-hint{opacity:0!important;pointer-events:none!important}
  .pz-orig #pz>*:not(#pz-top){display:none!important}
  #pz{position:fixed;inset:0;z-index:2147483000;pointer-events:none;
    font:400 15px/20px -apple-system,BlinkMacSystemFont,"SF Pro Text","Inter","Helvetica Neue",Arial,sans-serif;letter-spacing:-.01em;color:var(--ink);
    -webkit-font-smoothing:antialiased;text-align:left;
    --ink:rgba(255,255,255,.97);--soft:rgba(235,240,248,.72);--faint:rgba(255,255,255,.12);--fill:rgba(255,255,255,.09);--fill2:rgba(255,255,255,.16);
    --glass:rgba(18,20,24,.56);--accent:${accent};--ease:cubic-bezier(.2,.7,.2,1);--spring:cubic-bezier(.2,.9,.26,1.2);
    --spectrum:conic-gradient(from var(--pz-a,0deg),#ff6b6b,#ffb547,#f6ff6b,#5dffa8,#5ed7ff,#7b8cff,#d16bff,#ff6b6b)}
  :where(#pz) *{box-sizing:border-box;margin:0;padding:0}
  :where(#pz) button{font:inherit;letter-spacing:inherit;color:inherit;background:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent;text-align:inherit}
  #pz button:focus-visible{outline:2px solid #fff;outline-offset:2px}
  #pz input{outline:none}
  @property --pz-a{syntax:'<angle>';initial-value:0deg;inherits:true}
  @keyframes pz-turn{to{--pz-a:360deg}}

  .pz-glass{pointer-events:auto;background:var(--glass);-webkit-backdrop-filter:blur(26px) saturate(180%);backdrop-filter:blur(26px) saturate(180%);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.10),inset 0 1px 0 rgba(255,255,255,.30),0 30px 70px -20px rgba(0,0,0,.6),0 4px 14px -4px rgba(0,0,0,.3)}

  /* --- le prisme : la colonne vivante --- */
  #pz-panel{position:absolute;left:20px;bottom:20px;width:384px;max-height:calc(100% - 40px);border-radius:28px;display:flex;flex-direction:column;
    transition:transform .52s var(--ease),opacity .34s var(--ease),max-height .34s var(--ease)}
  #pz-panel::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1.5px;background:var(--spectrum);opacity:0;transition:opacity .5s;
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;animation:pz-turn 3.2s linear infinite}
  #pz-panel::after{content:"";position:absolute;inset:-18px;border-radius:44px;background:var(--spectrum);filter:blur(34px);opacity:0;transition:opacity .6s;z-index:-1;pointer-events:none;animation:pz-turn 3.2s linear infinite}
  #pz.busy #pz-panel::before{opacity:.9}
  #pz.busy #pz-panel::after{opacity:.22}
  #pz.narrating #pz-panel{transform:translateX(calc(-100% - 40px));opacity:0;pointer-events:none}

  .pz-head{display:flex;align-items:center;gap:6px;padding:12px 12px 0 12px;min-height:52px;flex:none}
  .pz-back{width:32px;height:32px;border-radius:50%;background:var(--fill);display:grid;place-items:center;flex:none;transition:background .2s}
  .pz-back:hover{background:var(--fill2)}
  .pz-crumb{display:flex;align-items:center;gap:6px;min-width:0;font-size:13px;line-height:18px;color:var(--soft);white-space:nowrap;overflow:hidden;padding-left:6px}
  .pz-crumb button{color:var(--soft);transition:color .2s;overflow:hidden;text-overflow:ellipsis;min-width:0}
  .pz-crumb button:last-child{flex:0 1 auto}
  .pz-crumb button:hover{color:var(--ink)}
  .pz-crumb i{opacity:.4;font-style:normal}
  .pz-brain{margin-left:auto;display:flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:14px;background:var(--fill);font-size:12px;line-height:16px;color:var(--soft);flex:none}
  .pz-brain b{width:6px;height:6px;border-radius:50%;background:#5dffa8;box-shadow:0 0 8px #5dffa8}
  .pz-brain.local b{background:#ffb547;box-shadow:0 0 8px #ffb547}

  /* regards */
  .pz-lens{position:relative;display:flex;gap:2px;margin:12px 12px 0;padding:3px;border-radius:16px;background:rgba(0,0,0,.22);flex:none;overflow-x:auto;scrollbar-width:none}
  .pz-lens::-webkit-scrollbar{display:none}
  .pz-lens button{position:relative;z-index:1;flex:1 0 auto;height:30px;padding:0 12px;border-radius:13px;font-size:13px;line-height:18px;font-weight:500;color:var(--soft);transition:color .2s;white-space:nowrap}
  .pz-lens button[aria-pressed=true]{color:#fff}
  .pz-lens u{position:absolute;z-index:0;top:3px;height:30px;border-radius:13px;background:var(--fill2);box-shadow:inset 0 1px 0 rgba(255,255,255,.18);transition:transform .34s var(--spring),width .34s var(--spring)}

  /* fil des blocs */
  .pz-feed{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;padding:6px 20px 8px;display:flex;flex-direction:column;gap:14px;
    -webkit-mask:linear-gradient(transparent,#000 14px,#000 calc(100% - 14px),transparent);mask:linear-gradient(transparent,#000 14px,#000 calc(100% - 14px),transparent)}
  .pz-feed::-webkit-scrollbar{display:none}
  .pz-b{animation:pz-in .52s var(--ease) backwards}
  @keyframes pz-in{from{opacity:0;transform:translateY(10px);filter:blur(6px)}}
  .pz-feed.out>*{transition:opacity .18s,transform .18s;opacity:0;transform:translateY(-6px)}
  .pz-photo{border-radius:18px;aspect-ratio:16/8;background:#2b2e33 center/cover no-repeat;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);margin:6px -8px 0}
  .pz-lead{font-size:22px;line-height:28px;font-weight:600;letter-spacing:-.02em;text-wrap:balance}
  .pz-lead .w{display:inline-block;animation:pz-w .42s var(--ease) backwards}
  @keyframes pz-w{from{opacity:0;filter:blur(5px);transform:translateY(3px)}}
  .pz-story{font-size:15px;line-height:22px;color:var(--soft);text-wrap:pretty}
  .pz-story b{color:var(--ink);font-weight:500}
  .pz-k{font-size:11px;line-height:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--soft);margin-bottom:8px;display:flex;align-items:center;gap:6px}
  .pz-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
  .pz-tile{padding:12px 14px;border-radius:16px;background:var(--fill);box-shadow:inset 0 1px 0 rgba(255,255,255,.07)}
  .pz-tile strong{display:block;font-size:20px;line-height:24px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
  .pz-tile span{display:block;margin-top:2px;font-size:13px;line-height:17px;color:var(--soft)}
  .pz-list{display:flex;flex-direction:column;gap:6px}
  .pz-place{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 14px;border-radius:14px;background:var(--fill);transition:background .2s,transform .2s var(--ease);font-size:15px;line-height:20px}
  .pz-place:hover{background:var(--fill2)}
  .pz-place:active{transform:scale(.98)}
  .pz-place .d{width:8px;height:8px;border-radius:50%;background:var(--accent);flex:none;box-shadow:0 0 10px var(--accent)}
  .pz-place .t{flex:1;min-width:0}
  .pz-place .m{font-size:13px;color:var(--soft)}
  .pz-place svg{opacity:.5;flex:none}
  .pz-place.static{cursor:default;background:none;box-shadow:inset 0 0 0 1px var(--faint)}
  .pz-hint{font-size:13px;line-height:18px;color:var(--soft)}
  .pz-access{display:flex;flex-direction:column;gap:2px;padding:14px;border-radius:18px;background:linear-gradient(135deg,rgba(93,215,255,.16),rgba(123,140,255,.10));box-shadow:inset 0 0 0 1px rgba(150,200,255,.18)}
  .pz-access p{display:flex;gap:10px;align-items:baseline;font-size:15px;line-height:21px;padding:4px 0}
  .pz-access p::before{content:"";width:6px;height:6px;border-radius:50%;background:#8fd8ff;flex:none;transform:translateY(-2px)}
  .pz-table{width:100%;border-collapse:collapse;font-size:13px;line-height:18px;font-variant-numeric:tabular-nums}
  .pz-table th{color:var(--soft);font-weight:500;text-align:left;padding:6px 8px 6px 0}
  .pz-table td{padding:8px 8px 8px 0;border-top:1px solid var(--faint);vertical-align:top}
  .pz-table td:first-child{color:var(--soft)}
  .pz-q{align-self:flex-end;max-width:85%;padding:9px 14px;border-radius:18px 18px 6px 18px;background:var(--fill2);font-size:15px;line-height:20px}
  .pz-chips{display:flex;flex-wrap:wrap;gap:6px}
  .pz-chip{min-height:34px;padding:7px 12px;border-radius:17px;font-size:13px;line-height:18px;background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.05));box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 0 0 1px rgba(255,255,255,.05);transition:background .2s,transform .2s var(--ease)}
  .pz-chip:hover{background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,.09));transform:translateY(-1px)}
  .pz-act{display:flex;align-items:center;justify-content:center;gap:8px;height:48px;border-radius:24px;font-size:16px;line-height:20px;font-weight:600;
    background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 84%,#fff),var(--accent))!important;color:#1d0a07!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 12px 26px -12px var(--accent);transition:transform .2s var(--ease),filter .2s}
  .pz-act:hover{filter:brightness(1.07)}
  .pz-act:active{transform:scale(.97)}
  .pz-tour{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:20px;background:rgba(0,0,0,.22)}
  .pz-tour svg.map{width:100%;height:auto;max-height:140px;display:block}
  .pz-tour svg.map path.camera-spatial-route-edge{stroke:rgba(255,255,255,.18);stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
  .pz-tour svg.map path.camera-spatial-route{stroke:#fff;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
  .pz-tour svg.map circle{fill:var(--accent)}
  .pz-tour .row{display:flex;align-items:center;gap:12px}
  .pz-tour .pp{width:40px;height:40px;border-radius:50%;background:#fff!important;color:#15171a!important;display:grid;place-items:center;flex:none}
  .pz-tour .bar{flex:1;height:4px;border-radius:2px;background:var(--faint);overflow:hidden}
  .pz-tour .bar i{display:block;height:100%;background:#fff;transform-origin:0 50%;transform:scaleX(0)}
  .pz-skel{display:flex;flex-direction:column;gap:10px}
  .pz-skel i{display:block;height:14px;border-radius:7px;background:linear-gradient(90deg,var(--fill) 0%,rgba(255,255,255,.22) 50%,var(--fill) 100%) 0 0/200% 100%;animation:pz-sh 1.2s linear infinite}
  .pz-skel i:nth-child(1){height:24px;width:82%}.pz-skel i:nth-child(2){width:96%}.pz-skel i:nth-child(3){width:64%}
  .pz-skel div{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pz-skel div i{height:58px;border-radius:16px}
  @keyframes pz-sh{to{background-position:-200% 0}}
  .pz-src{font-size:12px;line-height:16px;color:var(--soft);opacity:.8}
  .pz-anchor{color:var(--ink);text-decoration:underline;text-decoration-color:rgba(255,255,255,.35);text-underline-offset:3px;cursor:pointer}

  /* compositeur, intégré au bas du prisme */
  .pz-ask{position:relative;display:flex;align-items:center;gap:10px;margin:4px 10px 10px;height:52px;padding:0 6px 0 16px;border-radius:20px;background:rgba(0,0,0,.26);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);flex:none}
  .pz-ask svg{flex:none}
  .pz-ask>svg{color:#c9d6ff}
  .pz-ask input{flex:1;min-width:0;height:100%;border:0;background:none;font:inherit;font-size:16px;color:var(--ink)}
  .pz-ask input::placeholder{color:var(--soft)}
  .pz-ask button{width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:var(--fill2)!important;transition:background .2s,transform .2s var(--ease)}
  .pz-ask button:hover{background:rgba(255,255,255,.26)!important}

  /* en haut à droite */
  #pz-top{position:absolute;right:20px;top:20px;display:flex;gap:8px;align-items:center;pointer-events:none}
  .pz-seg{display:flex;gap:2px;padding:4px;border-radius:22px;pointer-events:auto}
  .pz-seg button{height:32px;padding:0 14px;border-radius:16px;font-size:13px;line-height:18px;color:var(--soft);transition:background .2s,color .2s}
  .pz-seg button[aria-pressed=true]{background:var(--fill2);color:#fff}
  #pz-tell{pointer-events:auto;height:40px;padding:0 16px 0 12px;border-radius:20px;display:flex;align-items:center;gap:8px;font-size:14px;line-height:18px;font-weight:600;position:relative;isolation:isolate}
  #pz-tell::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:var(--spectrum);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.75;animation:pz-turn 6s linear infinite}
  #pz-tell:hover::before{opacity:1}

  /* récit : sous-titres façon documentaire */
  #pz-cap{position:absolute;left:50%;bottom:28px;width:min(720px,calc(100% - 32px));transform:translate(-50%,24px);opacity:0;pointer-events:none;border-radius:26px;padding:18px 20px 16px;transition:opacity .4s var(--ease),transform .52s var(--ease)}
  #pz.narrating #pz-cap{opacity:1;transform:translate(-50%,0);pointer-events:auto}
  #pz-cap::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1.5px;background:var(--spectrum);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.8;animation:pz-turn 3.2s linear infinite;pointer-events:none}
  .pz-cap-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .pz-cap-h .k{font-size:11px;line-height:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--soft)}
  .pz-cap-h .n{font-size:17px;line-height:22px;font-weight:600}
  .pz-cap-h .sp{flex:1}
  .pz-cap-h button{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--fill)!important}
  .pz-cap-h button:hover{background:var(--fill2)!important}
  #pz-cap-t{font-size:20px;line-height:28px;font-weight:500;letter-spacing:-.015em;text-wrap:pretty;min-height:56px}
  #pz-cap-t .w{display:inline-block;animation:pz-w .42s var(--ease) backwards}
  .pz-pips{display:flex;gap:6px;margin-top:14px}
  .pz-pips i{flex:1;height:3px;border-radius:2px;background:var(--faint);overflow:hidden}
  .pz-pips i b{display:block;height:100%;background:#fff;transform-origin:0 50%;transform:scaleX(0)}
  .pz-pips i.done b{transform:none}

  /* téléphone : le prisme devient une feuille, le compositeur reste en bas */
  .pz-c #pz-panel{left:8px;right:8px;width:auto;bottom:calc(8px + env(safe-area-inset-bottom));max-height:62%;border-radius:26px}
  .pz-c #pz-panel.min .pz-feed,.pz-c #pz-panel.min .pz-lens{display:none}
  .pz-c .pz-grab{display:block;width:36px;height:5px;border-radius:3px;background:rgba(255,255,255,.4);margin:8px auto 0;flex:none}
  .pz-c .pz-head{padding-top:4px;min-height:44px}
  .pz-c #pz-top{right:8px;top:calc(8px + env(safe-area-inset-top))}
  .pz-c .pz-seg{display:none}
  .pz-c #pz-cap{bottom:calc(10px + env(safe-area-inset-bottom));border-radius:22px;padding:14px 16px}
  .pz-c #pz-cap-t{font-size:17px;line-height:24px;min-height:48px}
  .pz-c .pz-tiles{grid-template-columns:1fr 1fr}
  .pz-c .pz-crumb>*:not(:last-child){display:none}
  .pz-c .pz-photo{aspect-ratio:16/6}
  .pz-grab{display:none}
  .pz-c.pz-kb #pz-panel{max-height:none;top:calc(8px + env(safe-area-inset-top))}
  /* ===== variante B : la barre ===== */
  .pz-vb #pz-panel{left:50%;transform:translateX(-50%);width:440px;max-height:calc(100% - 96px);transition:opacity .34s var(--ease)}
  .pz-vb.narrating #pz-panel{transform:translateX(-50%);opacity:0;pointer-events:none}
  .pz-vb #pz-panel.shut .pz-head,.pz-vb #pz-panel.shut .pz-lens,.pz-vb #pz-panel.shut .pz-feed,.pz-vb #pz-panel.shut .pz-ask,.pz-vb #pz-panel.shut .pz-grab{display:none}
  .pz-vb #pz-panel:not(.shut) #pz-mini{display:none}
  .pz-vb #pz-panel.shut{width:auto;min-width:300px;max-width:min(560px,calc(100% - 40px));border-radius:26px}
  #pz-mini{display:none}
  .pz-vb #pz-mini{display:flex;align-items:center;gap:12px;padding:8px 8px 8px 16px;min-height:56px;cursor:pointer}
  #pz-mini .ic{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;flex:none;color:#c9d6ff}
  #pz-mini .ic.dot::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--accent);box-shadow:0 0 10px var(--accent)}
  #pz-mini .tx{flex:1;min-width:0;display:flex;flex-direction:column}
  #pz-mini .tx b{font-size:15px;line-height:20px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #pz-mini .tx small{font-size:13px;line-height:17px;color:var(--soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #pz-mini .bt{height:40px;min-width:40px;padding:0 12px;border-radius:20px;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--fill)!important;font-size:13px;line-height:18px;font-weight:500;flex:none;transition:background .2s}
  #pz-mini .bt:hover{background:var(--fill2)!important}
  #pz-mini .bt.round{padding:0;width:40px}
  #pz-mini .pp{width:40px;height:40px;border-radius:50%;background:#fff!important;color:#15171a!important;display:grid;place-items:center;flex:none}
  #pz-mini .scrub{flex:1;min-width:120px;display:flex;flex-direction:column;gap:7px;padding:4px 0;cursor:default}
  #pz-mini .scrub small{font-size:13px;line-height:17px;color:var(--soft);display:flex;justify-content:space-between;gap:8px;white-space:nowrap}
  #pz-mini .scrub small span{overflow:hidden;text-overflow:ellipsis}
  #pz-mini .scrub small em{font-style:normal;font-variant-numeric:tabular-nums;color:var(--ink)}
  #pz-mini .trk{position:relative;height:20px;cursor:pointer;touch-action:none}
  #pz-mini .trk::before{content:"";position:absolute;left:0;right:0;top:8px;height:4px;border-radius:2px;background:var(--faint)}
  #pz-mini .trk i{position:absolute;left:0;top:8px;height:4px;border-radius:2px;background:#fff;width:var(--v,0%)}
  #pz-mini .trk u{position:absolute;top:2px;left:var(--v,0%);width:16px;height:16px;margin-left:-8px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4);transition:transform .2s var(--ease)}
  #pz-mini .trk:active u{transform:scale(1.2)}
  #pz-mini .kind{font-size:11px;line-height:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--soft)}
  .pz-vb .pz-head .pz-fold{width:32px;height:32px;border-radius:50%;background:var(--fill);display:grid;place-items:center;flex:none;margin-left:6px}
  .pz-vb .pz-head .pz-fold:hover{background:var(--fill2)}
  .pz-fold{display:none}
  .pz-vb .pz-fold{display:grid}
  .pz-c.pz-vb #pz-panel{left:8px;right:8px;transform:none;width:auto;max-height:70%}
  .pz-c.pz-vb #pz-panel.shut{min-width:0;max-width:none}
  .pz-c.pz-vb.narrating #pz-panel{transform:none}
  .pz-c.pz-vb #pz-mini{min-height:60px}
  #pz-vars{display:flex;gap:2px;padding:4px;border-radius:22px;pointer-events:auto}
  #pz-vars button{height:32px;padding:0 12px;border-radius:16px;font-size:13px;line-height:18px;color:var(--soft)}
  #pz-vars button[aria-pressed=true]{background:var(--fill2);color:#fff}
  .pz-c #pz-vars{display:none}
  .pz-vb #pz-tell{display:none}
  html.pz-hc:not(.pz-orig) #footer{top:calc(14px + env(safe-area-inset-top));bottom:auto!important;left:14px;right:auto!important}
  @media (prefers-reduced-motion:reduce){#pz *{animation:none!important;transition:none!important}}
  `;
  document.head.append(css);

  /* ---------- squelette ---------- */
  const root = document.createElement('div');
  root.id = 'pz';
  root.setAttribute('translate', 'no');
  root.innerHTML = `
    <section id="pz-panel" class="pz-glass" aria-label="Prisme">
      <div id="pz-mini" role="group" aria-label="Prisme replié"></div>
      <i class="pz-grab"></i>
      <header class="pz-head"><div id="pz-crumb" class="pz-crumb"></div><span id="pz-brain" class="pz-brain local" title=""><b></b><span>IA</span></span><button type="button" class="pz-fold" id="pz-fold" aria-label="Réduire">${I.down}</button></header>
      <nav id="pz-lens" class="pz-lens" aria-label="Regard"><u></u></nav>
      <div id="pz-feed" class="pz-feed" aria-live="polite"></div>
      <form id="pz-form" class="pz-ask" autocomplete="off">${I.spark}<input id="pz-in" type="text" enterkeyhint="send" placeholder="Demander à Leysin365…" aria-label="Poser une question"><button type="submit" aria-label="Envoyer">${I.send}</button></form>
    </section>
    <div id="pz-top"><div id="pz-vars" class="pz-glass" aria-label="Variante"><button type="button" data-v="a">A · Fiche</button><button type="button" data-v="b">B · Barre</button></div><button id="pz-tell" class="pz-glass" type="button">${I.spark}<span>Raconter la ligne</span></button>
      <div id="pz-seg" class="pz-seg pz-glass"><button type="button" data-m="off">Origine</button><button type="button" data-m="on" aria-pressed="true">Prisme</button></div></div>
    <section id="pz-cap" class="pz-glass" aria-live="polite">
      <div class="pz-cap-h"><div><div class="k">Récit · <span id="pz-cap-i"></span></div><div class="n" id="pz-cap-n"></div></div><span class="sp"></span>
        <button type="button" id="pz-voice" aria-label="Voix">${I.mute}</button><button type="button" id="pz-stop" aria-label="Arrêter le récit">${I.close}</button></div>
      <p id="pz-cap-t"></p><div class="pz-pips" id="pz-pips"></div>
    </section>`;
  document.body.append(root);
  const R = (id) => document.getElementById(id);
  const panel = R('pz-panel'), feed = R('pz-feed'), input = R('pz-in');

  /* ---------- état ---------- */
  const S = {
    open: false, title: '', eyebrow: '', facts: [], photo: '', hasTour: false, key: '',
    lens: 'essentiel', stations: [], hotspots: [], seen: {}, busy: false, brain: 'local',
    compact: false, narr: null, voice: false, gen: 0,
  };
  const LENSES = [['essentiel', 'Essentiel'], ['voyageur', 'Voyageur'], ['technique', 'Technique'], ['accessible', 'Accessible']];

  /* ---------- lecture du viewer ---------- */
  const V = {
    panel: () => $('#poi-card-panel'),
    close: () => $('#poi-card-close-button'),
    ctrl: () => $('.camera-spatial-control'),
  };
  function read() {
    const p = V.panel(); if (!p) return false;
    const vis = (el) => el && getComputedStyle(el).display !== 'none';
    const title = ($('#poi-card-title')?.textContent || '').trim();
    const eb = vis($('#poi-card-eyebrow')) ? $('#poi-card-eyebrow').textContent.trim() : '';
    const facts = [$('#poi-card-bullets'), $('#poi-card-text')].filter(vis).map((e) => e.innerText).join('\n')
      .split(/\n|•/).map((s) => s.trim()).filter(Boolean);
    const img = $('#poi-card-image'); const photo = vis(img) ? img.currentSrc || img.src : '';
    const c = V.ctrl(); const tour = !!c && !c.hasAttribute('hidden') && getComputedStyle(c).display !== 'none';
    const open = p.dataset.open === 'true' && !!title;
    const key = [open, title, eb, facts.length, photo, tour].join('|');
    if (key === S.key) return false;
    Object.assign(S, { key, open, title, eyebrow: eb, facts, photo, hasTour: tour && open });
    if (open) S.seen[title] = { facts: facts.slice(), eyebrow: eb };
    return true;
  }
  const level = () => !S.open ? 0 : (S.eyebrow && norm(S.eyebrow) !== norm(ROOT) ? 2 : 1);
  const trail = () => !S.open ? [ROOT] : level() === 2 ? [ROOT, cap(S.eyebrow.toLowerCase()), S.title] : [ROOT, S.title];

  function focusTarget(id) {
    try {
      window.unityInstance.SendMessage((window.getUnityGameObjectName && window.getUnityGameObjectName()) || 'ALL Prism Core', 'SelectSelectableTarget',
        JSON.stringify({ type: 'allprism.selectableTargetRequest', source: 'wrapper-selectable-target-menu', action: 'focus', targetId: id,
          instanceId: Q.get('instanceId') || '', experienceId: Q.get('experienceId') || '', embedKey: Q.get('embedKey') || '' }));
      return true;
    } catch (e) { return false; }
  }
  const back = (n = 1) => { for (let i = 0; i < n; i++) setTimeout(() => V.close()?.click(), i * 450); };
  const stationFor = (txt) => {
    const a = norm(txt); let best = null, sc = 0;
    for (const s of S.stations) {
      const n = norm(s.label).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !['halte', 'gare', 'station', 'acces'].includes(w)).filter((w) => a.includes(w)).length;
      if (n > sc) { sc = n; best = s; }
    }
    return best;
  };

  /* ---------- faits → structure ---------- */
  function parse(facts) {
    const pairs = [], notes = [];
    for (const f of facts) {
      const m = f.match(/^([^:]{2,40}?)\s*:\s*(.+)$/);
      m ? pairs.push([m[1].trim(), nice(m[2])]) : notes.push(nice(f));
    }
    return { pairs, notes };
  }
  const isAccess = (s) => /mobilit|lhand|pmr|accessib|pente|ascenseur|rampe|escalier|fauteuil/i.test(s);
  function headline(v) { // une valeur courte et forte pour une tuile
    const m = v.match(/^([\d'’\s.,]+\s?[^\s\d]{0,3})(.*)$/);
    return m && m[1].trim().length <= 9 ? [m[1].trim(), m[2].replace(/^\s*(de|d’|d')\s*/i, '').trim()] : [v, ''];
  }

  /* ---------- compositeur local (n'invente rien : tout vient des fiches) ---------- */
  function composeLocal(lens) {
    const B = [];
    const lv = level();
    if (!S.open) {
      const n = S.stations.length;
      B.push({ t: 'lead', text: n ? `${ROOT} : ${n} gares sur un même tracé.` : `${ROOT}, en 3D.` });
      B.push({ t: 'story', text: lens === 'voyageur' ? 'Choisissez une gare : je vous y emmène et je vous dis ce qu’il faut savoir pour l’utiliser.'
        : lens === 'technique' ? 'Chaque gare a sa fiche : altitudes, dimensions des quais, pentes. Ouvrez-en une, je la mets en chiffres.'
        : lens === 'accessible' ? 'Je peux résumer l’accessibilité de chaque gare : pentes, conformité LHand, accès. Choisissez par où commencer.'
        : 'Posez une question, choisissez une gare, ou laissez-moi raconter la ligne de bout en bout.' });
      if (n) B.push({ t: 'places', title: 'Les gares', items: S.stations.map((s) => ({ id: s.id, label: s.label, meta: S.seen[s.label] ? 'vue' : '' })) });
      if (Object.keys(S.seen).length > 1) B.push({ t: 'next', items: ['Compare les gares que j’ai vues'] });
      B.push({ t: 'next', items: ['Par où commencer ?', 'Combien de gares ?', 'Raconte-moi la ligne'] });
      return B;
    }
    const { pairs, notes } = parse(S.facts);
    const acc = [...pairs.filter(([k, v]) => isAccess(k + ' ' + v)).map(([k, v]) => `${k} : ${v}`), ...notes.filter(isAccess)];
    const title = S.title;
    if (S.photo && lens !== 'technique') B.push({ t: 'photo', src: S.photo });
    // phrase-titre
    const same = (x) => norm(title).includes(norm(x)) || norm(x).includes(norm(title)) || norm(x).split(' ').filter((w) => w.length > 3).every((w) => norm(title).includes(w));
    const n0 = notes.find((x) => !isAccess(x) && !same(x));
    const leadBy = {
      essentiel: n0 ? `${title}, ${low(n0)}.` : `${title}.`,
      voyageur: acc.length ? `${title} : accessible, ${pairs.length ? 'quai à ' + (pairs.find(([k]) => /altitude/i.test(k))?.[1] || pairs[0][1]) : 'prête à l’usage'}.` : `${title}, ce qu’il faut savoir avant d’y aller.`,
      technique: `${title} en ${pairs.length || S.facts.length} chiffres.`,
      accessible: acc.length ? `${title} : ${acc.length} point${acc.length > 1 ? 's' : ''} d’accessibilité.` : `${title} : la fiche ne détaille pas encore l’accessibilité.`,
    };
    B.push({ t: 'lead', text: leadBy[lens] || leadBy.essentiel });
    if (lens === 'accessible') {
      if (acc.length) B.push({ t: 'access', items: acc });
      const rest = pairs.filter(([k, v]) => !isAccess(k + ' ' + v));
      if (rest.length) B.push({ t: 'facts', title: 'Autres repères', items: rest.slice(0, 4).map(([k, v]) => ({ label: k, value: v })) });
    } else if (lens === 'technique') {
      if (pairs.length) B.push({ t: 'facts', title: 'Fiche', items: pairs.map(([k, v]) => ({ label: k, value: v })) });
      if (notes.length) B.push({ t: 'story', text: notes.join('. ') + '.' });
    } else if (lens === 'voyageur') {
      const parts = [];
      if (n0) parts.push(`Vous arrivez à une <b>${esc(low(n0))}</b>.`);
      const alt = pairs.find(([k]) => /altitude/i.test(k)); if (alt) parts.push(`Le quai est à <b>${esc(alt[1])}</b>.`);
      const dim = pairs.find(([k]) => /dimension|longueur/i.test(k)); if (dim) parts.push(`Il mesure <b>${esc(dim[1])}</b>.`);
      if (acc.length) parts.push('Accessible en fauteuil, conforme à la loi sur l’égalité des personnes handicapées.');
      B.push({ t: 'story', html: parts.join(' ') || esc(S.facts.join('. ')) });
    } else {
      if (notes.length > 1) B.push({ t: 'story', text: notes.slice(1).join('. ') + '.' });
      if (pairs.length) B.push({ t: 'facts', items: pairs.slice(0, 4).map(([k, v]) => ({ label: k, value: v })) });
    }
    if (S.hasTour) B.push({ t: 'tour' });
    if (lv === 1) {
      const st = stationFor(title); const hs = st ? S.hotspots.filter((h) => h.visibilityGroupId === st.id) : [];
      if (hs.length) B.push({ t: 'places', title: hs.length > 1 ? `${hs.length} points à voir ici` : 'À voir ici', static: true, items: hs.map((h) => ({ label: h.label })), hint: 'Touchez un point coloré dans la vue pour y entrer.' });
    }
    const next = [];
    if (lens !== 'accessible' && acc.length) next.push('Est-ce accessible en fauteuil ?');
    if (Object.keys(S.seen).length > 1) next.push('Compare avec les autres gares vues');
    next.push(lens === 'technique' ? 'Résume en une phrase' : 'Donne-moi les chiffres');
    const nxt = S.stations.find((s) => !S.seen[s.label] && norm(s.label) !== norm(title)); if (nxt) next.push(`Emmène-moi à ${nxt.label}`);
    B.push({ t: 'next', items: next.slice(0, 3) });
    B.push({ t: 'src', text: 'Composé à partir de la fiche du viewer.' });
    return B;
  }

  function compareBlock() {
    const names = Object.keys(S.seen); if (names.length < 2) return null;
    const keys = new Map();
    for (const n of names) for (const [k] of parse(S.seen[n].facts).pairs) keys.set(norm(k), k);
    const rows = [...keys.entries()].map(([nk, k]) => [k, ...names.map((n) => parse(S.seen[n].facts).pairs.find(([kk]) => norm(kk) === nk)?.[1] || '—')])
      .filter((r) => r.slice(1).filter((x) => x !== '—').length > 1 || names.length === 2);
    return { t: 'table', head: ['', ...names], rows: rows.slice(0, 6) };
  }

  function answerLocal(q) {
    const a = norm(q); const B = [];
    const st = stationFor(q);
    if (st && /aller|emm|montre|voir|direction|va |go|vers/.test(a + ' ')) {
      B.push({ t: 'story', html: `En route pour <b>${esc(st.label)}</b>. La fiche se recompose à l’arrivée.` });
      B.push({ t: 'fly', id: st.id });
      return B;
    }
    if (/raconte|recit|visite.*ligne|toute la ligne/.test(a)) { B.push({ t: 'story', text: 'Je lance le récit. Touchez la vue à tout moment pour reprendre la main.' }); B.push({ t: 'narrate' }); return B; }
    if (/compar/.test(a)) {
      const c = compareBlock();
      if (c) { B.push({ t: 'story', text: `Voici ce que disent les fiches des ${Object.keys(S.seen).length} lieux que vous avez ouverts.` }); B.push(c); }
      else B.push({ t: 'story', text: 'Ouvrez au moins deux gares, je les mets côte à côte.' });
      return B;
    }
    if (/combien/.test(a) && !S.open) { B.push({ t: 'story', html: `<b>${S.stations.length}</b> gares sont sur le tracé.` }); B.push({ t: 'places', items: S.stations.map((s) => ({ id: s.id, label: s.label })) }); return B; }
    if (/commencer|debut/.test(a)) { B.push({ t: 'story', text: 'Commencez par une gare : je vous y emmène. Dans certaines, un point lance un parcours guidé.' }); if (S.stations[0]) B.push({ t: 'places', items: [S.stations[0]].map((s) => ({ id: s.id, label: s.label })) }); return B; }
    if (!S.open) { B.push({ t: 'story', text: 'Ouvrez une gare et je répondrai à partir de sa fiche. Ou demandez-moi de vous y emmener.' }); return B; }
    const { pairs, notes } = parse(S.facts);
    if (/resume|phrase|essentiel/.test(a)) { B.push({ t: 'story', html: `<b>${esc(S.title)}</b> : ${esc(S.facts.slice(0, 3).map(nice).join(', ').toLowerCase())}.` }); return B; }
    if (/chiffre|nombre|donnee/.test(a)) { B.push({ t: 'facts', items: pairs.map(([k, v]) => ({ label: k, value: v })) }); return B; }
    if (/fauteuil|accessib|pmr|handicap/.test(a)) {
      const acc = [...pairs.filter(([k, v]) => isAccess(k + v)).map(([k, v]) => `${k} : ${v}`), ...notes.filter(isAccess)];
      acc.length ? B.push({ t: 'story', text: 'D’après la fiche, oui :' }, { t: 'access', items: acc }) : B.push({ t: 'story', text: 'La fiche de ce lieu ne le précise pas.' });
      return B;
    }
    // recherche par mots dans la fiche
    const words = a.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    const hit = S.facts.map(nice).map((f) => [f, words.filter((w) => norm(f).includes(w)).length]).filter(([, s]) => s).sort((x, y) => y[1] - x[1]);
    if (hit.length) { B.push({ t: 'story', html: `D’après la fiche : <b>${esc(hit[0][0])}</b>.` }); return B; }
    B.push({ t: 'story', text: 'Ce n’est pas dans la fiche de ce lieu. En version complète, je chercherais dans tous les documents du projet.' });
    return B;
  }

  /* ---------- cerveau distant (Claude via /api/ask), avec repli local ---------- */
  async function brain(kind, q) {
    const ctx = {
      kind, q, lens: S.lens, place: S.open ? { title: S.title, parent: S.eyebrow, facts: S.facts, hasTour: S.hasTour } : null,
      root: ROOT, stations: S.stations.map((s) => ({ id: s.id, label: s.label })),
      seen: Object.fromEntries(Object.entries(S.seen).map(([k, v]) => [k, v.facts])),
      points: (() => { const st = S.open && stationFor(S.title); return st ? S.hotspots.filter((h) => h.visibilityGroupId === st.id).map((h) => h.label) : []; })(),
    };
    if (S.brain !== 'off') {
      try {
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000);
        const r = await fetch('/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(ctx), signal: ctl.signal });
        clearTimeout(to);
        if (r.ok) { const j = await r.json(); if (Array.isArray(j.blocks) && j.blocks.length) { setBrain('live'); return j.blocks; } }
        else if (r.status === 501 || r.status === 404) setBrain('off');
      } catch (e) { /* repli */ }
    }
    return null;
  }
  function setBrain(m) {
    if (S.brain === m) return; S.brain = m;
    const b = R('pz-brain'); b.classList.toggle('local', m !== 'live');
    b.querySelector('span').textContent = m === 'live' ? 'IA en direct' : 'IA démo';
    b.title = m === 'live' ? 'Réponses générées par Claude à partir des fiches' : 'Démo : réponses composées à partir des fiches du viewer';
  }

  /* ---------- rendu des blocs ---------- */
  function words(el, text, step = 34) {
    el.textContent = '';
    text.split(' ').forEach((w, i) => { const s = document.createElement('span'); s.className = 'w'; s.style.animationDelay = (i * step) + 'ms'; s.textContent = w; el.append(s, ' '); });
  }
  function block(b, i) {
    const el = document.createElement('div'); el.className = 'pz-b'; el.style.animationDelay = (i * 70) + 'ms';
    const k = (t) => t ? `<div class="pz-k">${esc(t)}</div>` : '';
    switch (b.t) {
      case 'photo': el.innerHTML = `<div class="pz-photo" style="background-image:url('${esc(b.src)}')"></div>`; break;
      case 'lead': { const h = document.createElement('h2'); h.className = 'pz-lead'; words(h, b.text); el.append(h); break; }
      case 'story': el.innerHTML = `<p class="pz-story">${b.html || esc(b.text)}</p>`; break;
      case 'facts': {
        el.innerHTML = k(b.title) + '<div class="pz-tiles"></div>';
        for (const f of b.items || []) { const [big, rest] = headline(f.value); const d = document.createElement('div'); d.className = 'pz-tile';
          d.innerHTML = `<strong>${esc(big)}</strong><span>${esc(f.label)}${rest ? ' · ' + esc(rest) : ''}</span>`; el.lastChild.append(d); }
        break;
      }
      case 'access': el.innerHTML = `<div class="pz-access"><div class="pz-k">${I.access} Accessibilité</div>${(b.items || []).map((x) => `<p>${esc(nice(x))}</p>`).join('')}</div>`; break;
      case 'places': {
        el.innerHTML = k(b.title) + '<div class="pz-list"></div>';
        for (const p of b.items || []) {
          const id = p.id || S.stations.find((s) => norm(s.label) === norm(p.label))?.id;
          const d = document.createElement(b.static || !id ? 'div' : 'button'); d.className = 'pz-place' + (b.static || !id ? ' static' : ''); if (id) d.type = 'button';
          d.innerHTML = `<b class="d"></b><span class="t">${esc(p.label)}</span>${p.meta ? `<span class="m">${esc(p.meta)}</span>` : ''}${id && !b.static ? I.go : ''}`;
          if (id && !b.static) d.onclick = () => fly(id);
          el.lastChild.append(d);
        }
        if (b.hint) el.insertAdjacentHTML('beforeend', `<p class="pz-hint" style="margin-top:8px">${esc(b.hint)}</p>`);
        break;
      }
      case 'table': {
        const t = document.createElement('table'); t.className = 'pz-table';
        t.innerHTML = `<tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>` + b.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
        el.append(t); break;
      }
      case 'tour': {
        el.innerHTML = `<div class="pz-tour"><div class="pz-k" style="margin:0">Parcours guidé</div><div class="map-h"></div><div class="row"><button type="button" class="pp" aria-label="Lecture">${I.play}</button><div class="bar"><i></i></div></div></div>`;
        el.querySelector('.pp').onclick = () => V.ctrl()?.querySelector('.camera-spatial-transport')?.click();
        tourEl = el; syncTour(true); break;
      }
      case 'q': el.innerHTML = `<p class="pz-q">${esc(b.text)}</p>`; el.style.display = 'flex'; el.style.justifyContent = 'flex-end'; break;
      case 'next': {
        el.className += ' pz-chips';
        for (const q of b.items || []) { const c = document.createElement('button'); c.type = 'button'; c.className = 'pz-chip'; c.textContent = q; c.onclick = () => ask(q); el.append(c); }
        break;
      }
      case 'action': { const a = document.createElement('button'); a.type = 'button'; a.className = 'pz-act'; a.textContent = b.label; a.onclick = () => b.ask ? ask(b.ask) : b.id && fly(b.id); el.append(a); break; }
      case 'src': el.innerHTML = `<p class="pz-src">${esc(b.text)}</p>`; break;
      case 'fly': setTimeout(() => fly(b.id), 700); return null;
      case 'narrate': setTimeout(narrate, 900); return null;
      default: return null;
    }
    return el;
  }
  let tourEl = null, tourMap = '';
  function syncTour(force) {
    if (!tourEl || !tourEl.isConnected) return;
    const c = V.ctrl(); if (!c) return;
    const m = c.querySelector('svg.camera-spatial-map');
    if (m && (force || m.outerHTML !== tourMap)) {
      tourMap = m.outerHTML; const cl = m.cloneNode(true); cl.setAttribute('class', 'map'); cl.removeAttribute('style');
      const h = tourEl.querySelector('.map-h'); h.innerHTML = ''; h.append(cl);
    }
    const p = parseFloat(c.querySelector('.camera-spatial-handle')?.getAttribute('aria-valuenow') || '0') || 0;
    tourEl.querySelector('.bar i').style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    const playing = performance.now() - (S.tourMove || 0) < 700;
    if (Math.abs(p - (S.tourP || 0)) > 1e-4) { S.tourMove = performance.now(); S.tourP = p; }
    const pp = tourEl.querySelector('.pp'); const want = playing ? 'pause' : 'play';
    if (pp.dataset.s !== want) { pp.dataset.s = want; pp.innerHTML = I[want]; }
  }

  function render(blocks, { append = false } = {}) {
    const h0 = panel.offsetHeight;
    if (!append) { feed.innerHTML = ''; tourEl = null; }
    let i = 0;
    for (const b of blocks) { const el = block(b, i); if (el) { feed.append(el); i++; } }
    if (append) feed.scrollTo({ top: feed.scrollHeight, behavior: RM ? 'auto' : 'smooth' });
    else feed.scrollTop = 0;
    morph(h0);
  }
  function morph(h0) { // la vitre change de taille d'un seul geste, sans saut
    const h1 = panel.offsetHeight; if (RM || !h0 || Math.abs(h1 - h0) < 4) return;
    panel.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  function skeleton(append) {
    const el = document.createElement('div'); el.className = 'pz-skel pz-b'; el.innerHTML = '<i></i><i></i><i></i><div><i></i><i></i></div>';
    const h0 = panel.offsetHeight;
    if (!append) feed.innerHTML = ''; feed.append(el); morph(h0);
    if (append) feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
    return el;
  }
  const busy = (on) => { S.busy = on; root.classList.toggle('busy', on); };

  /* ---------- composer la fiche ---------- */
  async function compose() {
    const g = ++S.gen;
    renderHead();
    busy(true);
    feed.classList.add('out'); await wait(160);
    if (g !== S.gen) return;
    feed.classList.remove('out');
    skeleton(false);
    const t0 = performance.now();
    const remote = await brain('compose');
    await wait(Math.max(0, 650 - (performance.now() - t0))); // le temps de voir la fiche se « penser »
    if (g !== S.gen) return;
    render(remote || composeLocal(S.lens));
    busy(false);
  }
  async function ask(q) {
    q = (q || input.value).trim(); if (!q) return;
    input.value = ''; input.blur();
    if (S.compact) panel.classList.remove('min');
    if (VB) setShut(false);
    const g = ++S.gen;
    render([{ t: 'q', text: q }], { append: true });
    const sk = skeleton(true); busy(true);
    const t0 = performance.now();
    const remote = await brain('ask', q);
    await wait(Math.max(0, 900 - (performance.now() - t0)));
    sk.remove(); busy(false);
    if (g !== S.gen) return;
    render(remote || answerLocal(q), { append: true });
  }
  function fly(id) {
    if (S.compact) panel.classList.add('min');
    if (VB && S.compact) setShut(true);
    if (!focusTarget(id)) render([{ t: 'story', text: 'La vue 3D n’est pas encore prête.' }], { append: true });
  }

  /* ---------- en-tête : fil d'Ariane + regards ---------- */
  function renderHead() {
    const c = R('pz-crumb'); c.innerHTML = '';
    const tr = trail();
    const old = panel.querySelector('.pz-back'); old && old.remove();
    if (tr.length > 1) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pz-back'; b.innerHTML = I.back;
      b.setAttribute('aria-label', 'Retour à ' + tr[tr.length - 2]); b.onclick = () => back(1);
      c.before(b);
    }
    tr.forEach((t, i) => {
      if (tr.length > 2 && i === 0) return; // la flèche suffit pour remonter : on garde les deux derniers niveaux
      if (i && !(tr.length > 2 && i === 1)) c.insertAdjacentHTML('beforeend', '<i>/</i>');
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      if (i === tr.length - 1) { b.style.color = 'var(--ink)'; b.style.fontWeight = '600'; b.style.cursor = 'default'; }
      else b.onclick = () => back(tr.length - 1 - i);
      c.append(b);
    });
  }
  const lensNav = R('pz-lens');
  for (const [id, label] of LENSES) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.l = id; b.textContent = label; b.setAttribute('aria-pressed', String(id === S.lens));
    b.onclick = () => { if (S.lens === id) return; S.lens = id; for (const x of lensNav.querySelectorAll('button')) x.setAttribute('aria-pressed', String(x.dataset.l === id)); slide(); compose(); };
    lensNav.append(b);
  }
  function slide() {
    const on = lensNav.querySelector('[aria-pressed=true]'); const u = lensNav.querySelector('u'); if (!on) return;
    u.style.width = on.offsetWidth + 'px'; u.style.transform = `translateX(${on.offsetLeft - 3}px)`; u.style.left = '3px';
  }

  /* ---------- récit : la ligne racontée ---------- */
  function narrLine(name, facts) {
    const { pairs, notes } = parse(facts || []);
    const alt = pairs.find(([k]) => /altitude/i.test(k)); const dim = pairs.find(([k]) => /dimension|longueur/i.test(k));
    const parts = [];
    parts.push(notes[0] ? `${name}. ${cap(notes[0])}.` : `${name}.`);
    if (alt) parts.push(`Le quai est à ${alt[1]}.`);
    if (dim) parts.push(`Il mesure ${dim[1]}.`);
    if (notes.some(isAccess) || pairs.some(([k, v]) => isAccess(k + v))) parts.push('Accessible à tous.');
    return parts.join(' ');
  }
  function speak(text) {
    if (!S.voice || !window.speechSynthesis) return Promise.resolve();
    return new Promise((res) => {
      speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/ /g, ' ')); u.lang = 'fr-FR'; u.rate = 1.02;
      const v = speechSynthesis.getVoices().find((x) => /^fr/i.test(x.lang) && /Amélie|Thomas|Audrey|Google/i.test(x.name)) || speechSynthesis.getVoices().find((x) => /^fr/i.test(x.lang)); if (v) u.voice = v;
      u.onend = u.onerror = res; speechSynthesis.speak(u);
    });
  }
  async function narrate() {
    if (S.narr || !S.stations.length) return;
    const run = S.narr = { i: 0, stop: false };
    root.classList.add('narrating'); input.blur(); R('pz-tell').lastChild.textContent = 'Arrêter le récit';
    const pips = R('pz-pips'); pips.innerHTML = S.stations.map(() => '<i><b></b></i>').join('');
    const t = R('pz-cap-t');
    R('pz-cap-n').textContent = ROOT; R('pz-cap-i').textContent = `${S.stations.length} gares`;
    words(t, `${ROOT}. ${S.stations.length} gares, une seule ligne. Je vous emmène.`, 40);
    await speak(t.textContent); await wait(2200);
    for (let i = 0; i < S.stations.length && !run.stop; i++) {
      const st = S.stations[i]; run.i = i;
      R('pz-cap-n').textContent = st.label; R('pz-cap-i').textContent = `${i + 1} sur ${S.stations.length}`;
      words(t, 'En route…', 40);
      const here = () => S.open && level() === 1 && (stationFor(S.title)?.id === st.id || norm(S.title) === norm(st.label));
      const before = S.title; if (!here()) focusTarget(st.id);
      const tt = performance.now(); while (!run.stop && performance.now() - tt < 6000 && !here() && (S.title === before || !S.open)) { read() && renderHead(); await wait(150); }
      if (run.stop) break;
      await wait(1400);
      const line = narrLine(S.open ? S.title : st.label, S.open ? S.facts : []);
      words(t, line, 45);
      const bar = pips.children[i].firstChild; bar.style.transition = `transform ${RM ? 0 : 7}s linear`; requestAnimationFrame(() => (bar.style.transform = 'scaleX(1)'));
      await Promise.all([speak(line), wait(7000)]);
      pips.children[i].classList.add('done');
    }
    if (!run.stop) { words(t, 'Fin du récit. Posez-moi une question, ou ouvrez un point dans la vue.', 40); await wait(2800); }
    endNarr();
  }
  function endNarr() {
    if (!S.narr) return; S.narr.stop = true; S.narr = null; window.speechSynthesis && speechSynthesis.cancel();
    root.classList.remove('narrating'); R('pz-tell').lastChild.textContent = 'Raconter la ligne'; S.key = ''; tick(true);
  }
  R('pz-stop').onclick = endNarr;
  R('pz-voice').onclick = () => { S.voice = !S.voice; R('pz-voice').innerHTML = S.voice ? I.sound : I.mute; if (S.voice) speak(R('pz-cap-t').textContent); else speechSynthesis.cancel(); };
  R('pz-tell').onclick = () => (S.narr ? endNarr() : narrate());

  /* ---------- Origine / Prisme ---------- */
  const setMode = (m) => {
    document.documentElement.classList.toggle('pz-orig', m === 'off');
    for (const b of R('pz-seg').children) b.setAttribute('aria-pressed', String(b.dataset.m === m));
    try { sessionStorage.setItem('pz-mode', m); } catch (e) {}
  };
  for (const b of R('pz-seg').children) b.onclick = () => setMode(b.dataset.m);
  try { if (sessionStorage.getItem('pz-mode') === 'off') setMode('off'); } catch (e) {}

  /* ---------- saisie ---------- */
  R('pz-form').addEventListener('submit', (e) => { e.preventDefault(); ask(); });
  for (const e of ['keydown', 'keyup', 'keypress']) input.addEventListener(e, (ev) => ev.stopPropagation());
  for (const e of ['wheel', 'touchmove', 'pointerdown']) panel.addEventListener(e, (ev) => ev.stopPropagation(), { passive: true });
  input.addEventListener('focus', () => { if (S.compact) panel.classList.remove('min'); kb(); });
  input.addEventListener('blur', () => setTimeout(kb, 60));
  panel.querySelector('.pz-grab').onclick = () => (VB ? R('pz-fold').click() : panel.classList.toggle('min'));
  const onCanvas = (e) => { if (!root.contains(e.target) && S.narr) endNarr(); };
  addEventListener('pointerdown', onCanvas, true);
  const onKey = (e) => { if (e.key === 'Escape' && S.narr) endNarr(); };
  addEventListener('keydown', onKey);

  /* clavier iPhone : la feuille suit la zone visible */
  const vv = window.visualViewport;
  function kb() {
    const on = !!(S.compact && vv && document.activeElement === input && innerHeight - vv.height > 120);
    root.classList.toggle('pz-kb', on);
    root.style.transform = on ? `translate3d(0,${Math.round(vv.offsetTop)}px,0)` : '';
    root.style.height = on ? Math.round(vv.height) + 'px' : '';
    root.style.bottom = on ? 'auto' : '';
  }
  vv && vv.addEventListener('resize', kb); vv && vv.addEventListener('scroll', kb);

  function layout() {
    S.compact = innerWidth < 640;
    root.classList.toggle('pz-c', S.compact); document.documentElement.classList.toggle('pz-hc', S.compact);
    slide(); kb();
  }
  addEventListener('resize', layout);

  /* ---------- données du projet ---------- */
  Q.get('config') && fetch(Q.get('config')).then((r) => r.json()).then((j) => {
    S.stations = ((j.selectableTargetMenu || {}).targets || []).filter((a) => a && a.id && a.label);
    R('pz-cap-i').textContent = `${S.stations.length} gares`; if (!S.open) compose();
  }).catch(() => {});
  Q.get('manifestUrl') && fetch(Q.get('manifestUrl')).then((r) => r.json()).then((j) => {
    S.hotspots = (j.hotspots || []).filter((a) => a && a.id && a.label); if (S.open && level() === 1) compose();
  }).catch(() => {});

  /* ---------- variante B : la barre qui se replie en mini widget ---------- */
  S.shut = true;
  function setShut(v, quiet) {
    if (!VB || S.shut === v) return;
    const r0 = panel.getBoundingClientRect();
    S.shut = v; panel.classList.toggle('shut', v); miniSig = ''; mini();
    if (!v) slide();
    const r1 = panel.getBoundingClientRect();
    if (!RM && !quiet && (Math.abs(r1.width - r0.width) > 2 || Math.abs(r1.height - r0.height) > 2))
      panel.animate([{ width: r0.width + 'px', height: r0.height + 'px', borderRadius: v ? '28px' : '26px' }, { width: r1.width + 'px', height: r1.height + 'px' }],
        { duration: 480, easing: 'cubic-bezier(.2,.9,.26,1.05)' });
  }
  const miniEl = R('pz-mini');
  let miniSig = '';
  const miniMode = () => (S.hasTour ? 'tour' : S.open ? 'place' : 'idle');
  function subline() {
    const { pairs, notes } = parse(S.facts);
    const n = notes.find((x) => !norm(S.title).includes(norm(x)) && !isAccess(x));
    const alt = pairs.find(([k]) => /altitude/i.test(k));
    return [n && cap(n), alt && 'quai à ' + alt[1]].filter(Boolean).join(' · ') || 'Touchez pour la fiche';
  }
  function mini() {
    if (!VB) return;
    const m = miniMode();
    const sig = [m, S.title, S.facts.length, S.stations.length, S.compact].join('|');
    if (sig !== miniSig) {
      miniSig = sig;
      if (m === 'idle') {
        miniEl.innerHTML = `<span class="ic">${I.spark}</span><span class="tx"><b>Demander à ${esc(ROOT)}</b><small>${S.stations.length ? S.stations.length + ' gares · ' : ''}une question, une gare, un récit</small></span>` +
          `<button type="button" class="bt" data-a="tell">${I.play}<span>Raconter</span></button><button type="button" class="bt round" data-a="open" aria-label="Ouvrir">${I.up}</button>`;
      } else if (m === 'place') {
        miniEl.innerHTML = `<button type="button" class="bt round" data-a="back" aria-label="Retour">${I.back}</button><span class="tx"><b>${esc(S.title)}</b><small>${esc(subline())}</small></span>` +
          `<button type="button" class="bt round" data-a="open" aria-label="Ouvrir la fiche">${I.up}</button>`;
      } else {
        miniEl.innerHTML = `<button type="button" class="pp" data-a="play" aria-label="Lecture">${I.play}</button>` +
          `<div class="scrub"><small><span>Parcours · ${esc(S.title)}</span><em>0 %</em></small><div class="trk" role="slider" tabindex="0" aria-label="Avancer dans le parcours" aria-valuemin="0" aria-valuemax="100"><i></i><u></u></div></div>` +
          `<button type="button" class="bt" data-a="exit">${I.close}<span>Quitter</span></button><button type="button" class="bt round" data-a="open" aria-label="Ouvrir la fiche">${I.up}</button>`;
        bindScrub(miniEl.querySelector('.trk'));
      }
    }
    if (m === 'tour') {
      const p = tourTarget != null ? tourTarget : tourProg();
      miniEl.style.setProperty('--v', (Math.min(1, Math.max(0, p)) * 100).toFixed(1) + '%');
      const em = miniEl.querySelector('.scrub em'); if (em) em.textContent = Math.round(p * 100) + '\u202F%';
      const pp = miniEl.querySelector('.pp'); const want = performance.now() - (S.tourMove || 0) < 700 ? 'pause' : 'play';
      if (pp && pp.dataset.s !== want) { pp.dataset.s = want; pp.innerHTML = I[want]; }
    }
  }
  const tourProg = () => parseFloat(V.ctrl()?.querySelector('.camera-spatial-handle')?.getAttribute('aria-valuenow') || '0') || 0;
  // on avance la caméra du viewer en lui envoyant les touches de son propre curseur, jusqu'à la position voulue
  let tourTarget = null, tourHeld = false, lastKey = 0;
  function seekLoop(t) {
    if (tourTarget == null) return;
    const cur = tourProg(), d = tourTarget - cur;
    if (Math.abs(d) < 0.006) { if (!tourHeld) { tourTarget = null; return; } }
    else if (t - lastKey > 70) {
      lastKey = t;
      const key = tourTarget < 0.005 ? 'Home' : tourTarget > 0.995 ? 'End' : d >= 0.1 ? 'PageUp' : d <= -0.1 ? 'PageDown' : d > 0 ? 'ArrowRight' : 'ArrowLeft';
      const h = V.ctrl()?.querySelector('.camera-spatial-handle');
      if (h) for (const n of ['keydown', 'keyup']) h.dispatchEvent(new KeyboardEvent(n, { key, bubbles: true, cancelable: true }));
      else if (window.__stubSeek) window.__stubSeek(tourTarget);
    }
    mini(); requestAnimationFrame(seekLoop);
  }
  function bindScrub(trk) {
    const at = (e) => { const r = trk.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / Math.max(1, r.width))); };
    trk.addEventListener('pointerdown', (e) => { e.stopPropagation(); trk.setPointerCapture(e.pointerId); tourHeld = true; const go = tourTarget == null; tourTarget = at(e); mini(); go && requestAnimationFrame(seekLoop); });
    trk.addEventListener('pointermove', (e) => { if (tourHeld) { tourTarget = at(e); mini(); } });
    const up = () => { tourHeld = false; };
    trk.addEventListener('pointerup', up); trk.addEventListener('pointercancel', up);
    trk.addEventListener('keydown', (e) => {
      e.stopPropagation(); const d = { ArrowRight: 0.05, ArrowUp: 0.05, ArrowLeft: -0.05, ArrowDown: -0.05 }[e.key];
      if (d !== undefined) { e.preventDefault(); const go = tourTarget == null; tourTarget = Math.min(1, Math.max(0, tourProg() + d)); go && requestAnimationFrame(seekLoop); }
    });
  }
  miniEl.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (e.target.closest('.scrub')) return;
    if (a === 'tell') return narrate();
    if (a === 'back') return back(1);
    if (a === 'exit') { S.userShut = true; return back(1); } // on sort du parcours : retour au simple widget du lieu
    if (a === 'play') return V.ctrl()?.querySelector('.camera-spatial-transport')?.click();
    S.userShut = false; setShut(false);
    if (miniMode() === 'idle' && !S.compact) setTimeout(() => input.focus(), 60);
  });
  R('pz-fold').onclick = () => { S.userShut = true; setShut(true); };
  // ce qui se passe à l'écran décide de l'état : arrivée sur un lieu = fiche ouverte (bureau), parcours = widget de lecture, vue d'ensemble = barre
  let lastPlace = '';
  function context() {
    if (!VB) return;
    const here = (S.open ? S.title : '') + '|' + S.hasTour;
    if (here === lastPlace) return; lastPlace = here;
    if (S.hasTour || !S.open || S.compact || S.userShut) setShut(true); else setShut(false);
  }
  if (VB) { root.classList.add('pz-vb'); panel.classList.add('shut'); }
  for (const b of R('pz-vars').children) {
    b.setAttribute('aria-pressed', String((b.dataset.v === 'b') === VB));
    b.onclick = () => { if ((b.dataset.v === 'b') === VB) return; const u = new URL(location.href); b.dataset.v === 'b' ? u.searchParams.set('pzv', 'b') : u.searchParams.delete('pzv'); u.hash = ''; location.href = u.toString(); };
  }

  /* ---------- boucle : on suit le viewer ---------- */
  let timer = 0;
  function tick(force) {
    if (read() || force) { if (!S.narr) compose(); context(); }
    syncTour(); mini();
  }
  timer = setInterval(tick, 200);
  S.brain = 'pending';
  layout(); tick(true);

  window.__prism = {
    destroy() { clearInterval(timer); endNarr(); root.remove(); css.remove(); removeEventListener('pointerdown', onCanvas, true); removeEventListener('keydown', onKey); removeEventListener('resize', layout); document.documentElement.classList.remove('pz-orig'); },
    state: S, compose, ask, narrate,
  };
})();
