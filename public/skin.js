/* ALL prism, piste liquide : interface posée sur le VRAI viewer.
   À exécuter dans la page du viewer (staging.wrapper.all-prism.app/all-prism.html…).
   Le script ne touche pas à la 3D ni à la logique d'A-LL : il masque leur panneau et leur contrôle de parcours,
   lit leur contenu dans le DOM (#poi-card-*) et pilote leurs propres boutons (fermer, lecture).
   Fedelo Studio, prototype du 16 novembre 2026. */
(function wait() {
  // le titre de la page ne porte le nom du projet qu'une fois la configuration chargée : on démarre à ce moment-là
  if (document.title.split('|').length < 3 && performance.now() < 60000) return setTimeout(wait, 200);
  (() => {
  if (window.__prismSkin) { window.__prismSkin.destroy(); }
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chromium = !!window.chrome || /Chrome\//.test(navigator.userAgent);
  const theme = getComputedStyle(document.documentElement);
  const accent = (theme.getPropertyValue('--all-prism-theme-accent-color') || '#ed695a').trim() || '#ed695a';
  const brandFont = (theme.getPropertyValue('--all-prism-poi-font-family') || '').trim() || 'system-ui';

  /* ---------- styles ---------- */
  const css = document.createElement('style'); css.id = 'fx-style';
  css.textContent = `
  html:not(.fx-orig) #poi-card-panel{opacity:0!important;pointer-events:none!important}
  .fx-orig #fx .fx-pane,.fx-orig #fx-grab,.fx-orig #fx-auto{display:none!important}
  /* Échelle iOS : 26 titre, 17 gras pour ce qu'on nomme, 15 pour ce qu'on lit, 13 pour le secondaire. Rien entre. */
  #fx{position:fixed;inset:0;z-index:2147483000;pointer-events:none;text-align:left;
    font:400 15px/20px -apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Helvetica,Arial,sans-serif;letter-spacing:-.01em;
    color:var(--ink);-webkit-font-smoothing:antialiased;font-feature-settings:"ss01","cv11";
    --ink:rgba(255,255,255,.96);--soft:rgba(255,255,255,.64);--faint:rgba(255,255,255,.14);--fill:rgba(255,255,255,.10);
    --glass:rgba(22,24,28,.58);--accent:${accent};--on-accent:#1d0a07;--ease:cubic-bezier(.2,0,0,1)}
  :where(#fx) *{box-sizing:border-box;margin:0;padding:0}
  #fx button{font:inherit;letter-spacing:inherit;color:inherit;background:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
  #fx button:focus-visible{outline:2px solid #fff;outline-offset:3px}
  #fx input,#fx input:focus-visible{outline:none}
  /* la vitre : fumée, neutre, un liseré clair en haut, une ombre large et douce */
  .fx-pane{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;pointer-events:auto;will-change:transform,width,height;background:var(--glass);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.10),inset 0 1px 0 rgba(255,255,255,.34),0 24px 60px -16px rgba(0,0,0,.55),0 4px 14px -4px rgba(0,0,0,.30)}
  .fx-pane.off{pointer-events:none}
  .fx-pane.glow{box-shadow:inset 0 0 0 1px rgba(255,255,255,.5),0 0 0 1px rgba(255,255,255,.35),0 0 24px 2px rgba(110,160,255,.55),0 0 40px 8px rgba(255,120,190,.30),0 24px 60px -16px rgba(0,0,0,.55)}
  .fx-face{position:absolute;left:0;top:0;opacity:0;pointer-events:none;transform:translateY(4px);transition:opacity .18s var(--ease),transform .28s var(--ease)}
  .fx-face.on{opacity:1;pointer-events:auto;transform:none;transition-delay:.07s}

  /* fil d'Ariane */
  .fx-crumb{display:flex;align-items:center;height:44px;padding:0 18px 0 6px;gap:2px;white-space:nowrap;font-size:15px;line-height:20px}
  .fx-crumb .back{width:32px;height:32px;margin-right:6px;border-radius:50%;background:var(--fill);display:grid;place-items:center;flex:none;transition:background .2s}
  .fx-crumb .back:hover{background:rgba(255,255,255,.2)}
  .fx-crumb .root{padding-left:12px}
  .fx-crumb .anc{color:var(--soft);transition:color .2s}
  .fx-crumb .anc:hover{color:var(--ink)}
  .fx-crumb .here{font-weight:600;cursor:default}
  .fx-crumb svg.sep{margin:0 8px;opacity:.45;flex:none}
  .fx-compact .fx-crumb .anc,.fx-compact .fx-crumb svg.sep{display:none}

  /* fiche */
  .fx-full{display:flex;flex-direction:column}
  .fx-handle{display:none;height:20px;place-items:center;flex:none;cursor:grab}
  .fx-handle::before{content:"";width:36px;height:5px;border-radius:3px;background:rgba(255,255,255,.4)}
  .fx-compact .fx-handle{display:grid}
  .fx-photo{margin:8px 8px 0;border-radius:20px;aspect-ratio:16/8;background:#3a3d42 center/cover no-repeat;flex:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
  .fx-compact .fx-photo{display:none}
  .fx-body{padding:16px 20px 20px;display:flex;flex-direction:column;transition:opacity .16s var(--ease),transform .28s var(--ease)}
  .fx-body.out{opacity:0;transform:translateX(-8px)}
  .fx-title{font-family:${brandFont},-apple-system,system-ui,sans-serif;font-size:22px;line-height:26px;font-weight:600;letter-spacing:-.012em;text-wrap:balance}
  .fx-notes{margin-top:4px;color:var(--soft);font-size:15px;line-height:20px;text-wrap:pretty}
  .fx-rows{margin-top:16px;display:flex;flex-direction:column;overflow:auto;scrollbar-width:none}
  .fx-rows::-webkit-scrollbar{display:none}
  .fx-rows div{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:10px 0;border-top:1px solid var(--faint)}
  .fx-rows dt{color:var(--soft);flex:none;max-width:52%}
  .fx-rows dd{text-align:right;font-weight:500;font-variant-numeric:tabular-nums;text-wrap:balance}
  .fx-btn{margin-top:18px;height:50px;border-radius:25px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:17px;line-height:22px;font-weight:600;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 84%,#fff),var(--accent))!important;color:var(--on-accent)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 12px 26px -12px var(--accent);transition:transform .2s var(--ease),filter .2s}
  .fx-btn:hover{filter:brightness(1.07)}
  .fx-btn:active{transform:scale(.97)}

  /* pastilles : fiche repliée, parcours */
  .fx-pill{height:48px;display:flex;align-items:center;gap:10px;padding:0 18px;white-space:nowrap;font-size:17px;line-height:22px;font-weight:600}
  .fx-pill b{width:8px;height:8px;border-radius:50%;background:var(--accent);flex:none}
  .fx-pill small{font-size:15px;font-weight:400;color:var(--soft)}
  .fx-pill svg{flex:none}
  .fx-pill .chev{margin-left:2px;opacity:.5}

  /* parcours */
  .fx-mini{display:flex;flex-direction:column;padding:16px;gap:12px}
  .fx-mini header{display:flex;justify-content:space-between;align-items:baseline;font-size:17px;line-height:22px;font-weight:600}
  .fx-mini header span{font-size:15px;font-weight:400;color:var(--soft);font-variant-numeric:tabular-nums}
  .fx-map{width:100%;aspect-ratio:200/116;border-radius:14px;background:rgba(0,0,0,.22);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
  .fx-row{display:flex;align-items:center;gap:12px}
  .fx-play{width:44px;height:44px;border-radius:50%;background:#fff!important;color:#15171a!important;display:grid;place-items:center;flex:none;transition:transform .2s var(--ease)}
  .fx-play:active{transform:scale(.92)}
  .fx-bar{flex:1;height:4px;border-radius:2px;background:var(--faint);overflow:hidden}
  .fx-bar div{height:100%;background:#fff;transform-origin:0 50%;transform:scaleX(0)}
  .fx-x{height:36px;padding:0 14px;border-radius:18px;font-size:15px;font-weight:500;background:var(--fill)!important}
  .fx-x:hover{background:rgba(255,255,255,.2)!important}

  /* commande IA */
  .fx-ai{height:100%;display:flex;align-items:center;gap:10px;padding:0 18px 0 16px}
  .fx-ai svg{flex:none;opacity:.9}
  .fx-ai input{flex:1;min-width:0;height:100%;border:0;background:none;font:inherit;font-size:17px;letter-spacing:inherit;color:var(--ink);outline:none}
  .fx-ai input::placeholder{color:var(--soft)}
  .fx-answer{padding:16px 20px 20px;display:flex;flex-direction:column;gap:12px}
  .fx-answer .who{display:flex;justify-content:space-between;font-size:13px;line-height:18px;color:var(--soft)}
  .fx-answer p{font-size:17px;line-height:24px;text-wrap:pretty}
  .fx-answer p span{opacity:0;animation:fxw .35s var(--ease) forwards}
  @keyframes fxw{from{opacity:0;filter:blur(4px)}to{opacity:1;filter:none}}
  #fx-chips{display:flex;flex-direction:column;gap:8px;align-items:flex-start}
  .fx-chip{min-height:40px;padding:10px 16px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.05))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 0 0 1px rgba(255,255,255,.05);font-size:15px;line-height:20px;text-align:left;transition:background .2s,transform .2s var(--ease)}
  .fx-chip:hover{background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,.1))!important;transform:translateY(-1px)}
  .fx-chip:active{transform:scale(.97)}

  /* hors produit : avant, après */
  #fx-modes{position:absolute;right:20px;top:20px;display:flex;gap:2px;padding:4px;border-radius:22px;background:rgba(16,18,21,.62);pointer-events:auto;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
  #fx-modes button{height:36px;padding:0 14px;border-radius:18px;font-size:13px;line-height:18px;color:rgba(255,255,255,.72);transition:background .2s,color .2s}
  #fx-modes button[aria-pressed=true]{background:rgba(255,255,255,.18);color:#fff}

  /* lieux : aller directement à une gare */
  #fx-places{display:flex;flex-wrap:wrap;gap:8px}
  #fx-places:empty{display:none}
  .fx-place{height:38px;padding:0 15px;border-radius:19px;background:linear-gradient(180deg,rgba(255,255,255,.15),rgba(255,255,255,.07))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 0 0 1px rgba(255,255,255,.05);font-size:15px;line-height:20px;font-weight:500;display:flex;align-items:center;gap:8px;transition:background .2s,transform .2s var(--ease)}
  .fx-place::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--accent)}
  .fx-place:hover{background:linear-gradient(180deg,rgba(255,255,255,.24),rgba(255,255,255,.12))!important;transform:translateY(-1px)}
  .fx-place:active{transform:scale(.97)}

  /* showroom : la fiche devient une fenêtre posée dans l'espace, avec sa poignée dessous */
  #fx .fx-pane:not([data-k=ai])::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;background:linear-gradient(140deg,rgba(214,234,255,.6),rgba(255,255,255,.07) 32%,rgba(255,255,255,.03) 64%,rgba(255,218,176,.4));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
  .fx-show{--glass:rgba(48,50,54,.5)}
  .fx-show .fx-pane::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.4px;pointer-events:none;
    background:linear-gradient(155deg,rgba(255,255,255,.6),rgba(255,255,255,.06) 38%,rgba(255,255,255,.04) 62%,rgba(255,255,255,.34));
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
  .fx-show .fx-pane{box-shadow:0 40px 80px -20px rgba(0,0,0,.5),0 6px 18px -6px rgba(0,0,0,.3)}
  .fx-show .fx-photo{border-radius:32px}
  #fx-grab{position:absolute;left:0;top:0;transform-origin:0 0;display:flex;align-items:center;gap:8px;padding:8px 0;opacity:0;pointer-events:none;transition:opacity .25s var(--ease)}
  #fx-grab.on{opacity:1;pointer-events:auto}
  #fx-grab b{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.42);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}
  #fx-grab i{width:136px;height:10px;border-radius:5px;background:rgba(255,255,255,.42);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);transition:background .2s}
  #fx-grab:hover i{background:rgba(255,255,255,.7)}
  #fx-auto{position:absolute;left:50%;top:24px;height:36px;padding:0 16px;border-radius:18px;display:flex;align-items:center;gap:10px;white-space:nowrap;font-size:13px;line-height:18px;color:rgba(255,255,255,.9);background:rgba(16,18,21,.62);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);opacity:0;transform:translate(-50%,-8px);transition:opacity .3s var(--ease),transform .3s var(--ease)}
  #fx-auto.on{opacity:1;transform:translate(-50%,0)}
  #fx-auto::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--accent)}
  @property --fx-p{syntax:"<angle>";inherits:false;initial-value:0deg}
  #fx .fx-place,#fx .fx-chip,#fx .fx-crumb .back,#fx-modes button{position:relative}
  #fx .fx-place::after,#fx .fx-chip::after,#fx .fx-crumb .back::after,#fx-modes button:not([aria-pressed=true])::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.25px;pointer-events:none;opacity:0;transition:opacity .6s var(--ease);
    background:conic-gradient(from var(--fx-a),rgba(255,255,255,0) 0deg,rgba(255,255,255,.8) 65deg,rgba(255,255,255,0) 140deg,rgba(255,255,255,0) 190deg,rgba(255,255,255,.4) 250deg,rgba(255,255,255,0) 320deg,rgba(255,255,255,0) 360deg),linear-gradient(rgba(255,255,255,.14),rgba(255,255,255,.14));
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
  #fx .fx-place:hover::after,#fx .fx-chip:hover::after,#fx .fx-crumb .back:hover::after,#fx-modes button:hover::after,#fx :is(.fx-place,.fx-chip,.back):focus-visible::after{opacity:1;transition-duration:.35s;animation:fxspin 6s linear infinite}
  #fx .fx-place,#fx .fx-chip{transition:background .3s,transform .3s var(--ease),box-shadow .6s var(--ease)}
  #fx .fx-place:hover,#fx .fx-chip:hover{box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 0 18px -4px rgba(255,255,255,.26)}
  @keyframes fxbreath{0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 10px 24px -12px var(--accent)}50%{box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 10px 36px -6px var(--accent)}}
  #fx .fx-btn{animation:fxbreath 3.4s ease-in-out infinite}
  #fx .fx-btn:hover{animation:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 10px 42px -4px var(--accent)}
  @media (prefers-reduced-motion:reduce){#fx .fx-btn{animation:none}}
  #fx .fx-spots{margin-top:18px;display:flex;flex-direction:column}
  #fx .fx-spots h3{font-size:13px;line-height:18px;font-weight:600;color:var(--soft)}
  #fx .fx-spot{position:relative;height:46px;margin-top:8px;padding:0 12px 0 14px;border-radius:14px;display:flex;align-items:center;gap:10px;font-size:15px;line-height:20px;font-weight:500;text-align:left;background:linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.06));box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 0 0 1px rgba(255,255,255,.05);transition:background .3s,transform .3s var(--ease)}
  #fx .fx-spot:hover{background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.11));transform:translateY(-1px)}
  #fx .fx-spot:active{transform:scale(.98)}
  #fx .fx-spot b{width:6px;height:6px;border-radius:50%;background:var(--accent);flex:none}
  #fx .fx-spot span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #fx .fx-spot svg{flex:none;opacity:.5}
  #fx .fx-hint{margin-top:10px;font-size:13px;line-height:18px;color:var(--soft)}
  #fx-veil{position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(90deg,rgba(8,10,12,.6),rgba(8,10,12,.2) 72%);-webkit-backdrop-filter:blur(26px) saturate(150%);backdrop-filter:blur(26px) saturate(150%);transition:opacity 1.3s var(--ease)}
  #fx-veil.on{opacity:1;transition:none}
  #fx-hero{position:absolute;left:8vw;top:50%;transform:translateY(-55%);transform-origin:0 0;pointer-events:none;color:#fff;display:none}
  #fx-hero.on{display:block}
  #fx-hero h2{font-family:${brandFont},-apple-system,system-ui,sans-serif;font-size:clamp(52px,9vw,132px);line-height:.95;font-weight:600;letter-spacing:-.035em;white-space:nowrap}
  #fx-hero h2 span{display:inline-block;opacity:0;filter:blur(14px);transform:translateY(.18em);animation:fxin .9s var(--ease) forwards}
  #fx-hero p{margin-top:18px;font-size:clamp(17px,1.7vw,24px);line-height:1.3;color:rgba(255,255,255,.74);opacity:0;filter:blur(8px);transform:translateY(8px);animation:fxin .8s .7s var(--ease) forwards}
  @keyframes fxin{to{opacity:1;filter:none;transform:none}}
  #fx-hero.out{opacity:0;transition:transform .95s cubic-bezier(.6,0,.1,1),opacity .45s .5s linear}
  #fx-hero.out p{animation:none;opacity:0}
  #fx.fx-pre #fx-modes{opacity:0;pointer-events:none}
  #fx-modes{transition:opacity .5s var(--ease)}
  @property --fx-a{syntax:"<angle>";inherits:false;initial-value:0deg}
  @keyframes fxspin{to{--fx-a:360deg}}
  @keyframes fxsweep{from{background-position:170% 0,0 0}to{background-position:-70% 0,0 0}}
  @keyframes fxrot{to{rotate:360deg}}
  #fx .fx-pane[data-k=ai]{--beam:conic-gradient(from 0deg,#fff 0deg,#fff1bd 5deg,#ffab62 12deg,#ff5f72 20deg,transparent 32deg,transparent 328deg,#5f8dff 340deg,#4ea4ff 348deg,#a8edff 355deg,#fff 360deg);background:linear-gradient(115deg,rgba(95,141,255,.07),rgba(78,164,255,.05) 30%,rgba(255,255,255,.02) 50%,rgba(255,171,98,.05) 70%,rgba(255,95,114,.07)),rgba(13,14,17,.62);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),0 18px 50px -14px rgba(0,0,0,.6),0 4px 14px -4px rgba(0,0,0,.3);transition:box-shadow .6s var(--ease)}
  #fx .fx-ring,#fx .fx-bloom{position:absolute;inset:0;border-radius:inherit;pointer-events:none;overflow:hidden;transition:opacity .8s var(--ease),visibility 0s .8s}
  #fx .fx-ring{padding:1.25px;opacity:.5;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
  #fx .fx-bloom{opacity:0;visibility:hidden;filter:blur(14px);mix-blend-mode:plus-lighter}
  #fx .fx-ring u,#fx .fx-bloom u{position:absolute;left:50%;top:50%;width:210%;aspect-ratio:1;translate:-50% -50%;animation:fxrot 18s linear infinite}
  #fx .fx-bloom u{animation-play-state:paused}
  #fx .fx-ring b,#fx .fx-bloom b{position:absolute;inset:0;background:var(--beam)}
  #fx .fx-ring b+b,#fx .fx-bloom b+b{rotate:180deg;opacity:0;transition:opacity .8s var(--ease)}
  #fx .fx-pane[data-k=ai]:hover .fx-ring,#fx .fx-pane[data-k=ai].near .fx-ring{opacity:.85}
  #fx .fx-pane[data-k=ai]:hover .fx-bloom,#fx .fx-pane[data-k=ai].near .fx-bloom{opacity:.16;visibility:visible;transition-delay:0s}
  #fx .fx-pane[data-k=ai]:hover .fx-bloom u,#fx .fx-pane[data-k=ai].near .fx-bloom u,#fx .fx-pane[data-k=ai]:focus-within .fx-bloom u,#fx .fx-pane[data-k=ai].glow .fx-bloom u{animation-play-state:running}
  #fx .fx-pane[data-k=ai]:hover:not(:focus-within):not(.glow),#fx .fx-pane[data-k=ai].near:not(:focus-within):not(.glow){box-shadow:inset 0 0 0 1px rgba(255,255,255,.2),0 18px 50px -14px rgba(0,0,0,.6),0 4px 14px -4px rgba(0,0,0,.3)}
  #fx .fx-pane[data-k=ai]:focus-within,#fx .fx-pane[data-k=ai].glow{box-shadow:inset 0 0 0 1px rgba(255,255,255,.2),-14px 0 34px -18px rgba(96,160,255,.34),14px 0 34px -18px rgba(255,150,96,.3),0 18px 50px -14px rgba(0,0,0,.6)}
  #fx .fx-pane[data-k=ai]:focus-within .fx-ring,#fx .fx-pane[data-k=ai].glow .fx-ring{opacity:1}
  #fx .fx-pane[data-k=ai]:focus-within .fx-bloom,#fx .fx-pane[data-k=ai].glow .fx-bloom{opacity:.4;visibility:visible;transition-delay:0s}
  #fx .fx-pane[data-k=ai]:focus-within b+b,#fx .fx-pane[data-k=ai].glow b+b{opacity:1}
  #fx .fx-pane[data-k=ai].glow u{animation-duration:2.6s}
  #fx .fx-pane[data-k=ai].glow{background:linear-gradient(105deg,transparent 42%,rgba(255,255,255,.13) 50%,transparent 58%) no-repeat,rgba(13,14,17,.62);background-size:220% 100%,auto;animation:fxsweep 1.5s linear infinite}
  @media (prefers-reduced-motion:reduce){#fx .fx-ring u,#fx .fx-bloom u{animation:none}}
  #fx .fx-ai{width:100%}
  #fx .fx-ai svg{opacity:.92}
  #fx .fx-pane[data-k=answer]{background:linear-gradient(115deg,rgba(95,141,255,.07),rgba(78,164,255,.05) 30%,transparent 50%,rgba(255,171,98,.05) 70%,rgba(255,95,114,.07)),rgba(13,14,17,.6)}
  #fx .fx-pane[data-k=answer]::before{content:"";position:absolute;left:8%;right:8%;top:0;height:1.5px;pointer-events:none;background:linear-gradient(90deg,transparent,#5f8dff 18%,#4ea4ff 32%,#fff 50%,#ffab62 68%,#ff5f72 82%,transparent);opacity:.85}
  #fx .fx-answer .who span:first-child{color:var(--ink);font-weight:600}
  #fx.fx-compact #fx-modes{display:none}
  #fx.fx-compact .fx-ai{padding:0 13px}
  #fx.fx-compact .fx-pane[data-k=ai]:not(:focus-within) input{opacity:0}
  @media (prefers-reduced-motion:reduce){#fx .fx-pane::before{animation:none}.fx-face,.fx-body{transition:none}.fx-answer p span{animation:none;opacity:1}}
  `;
  // tout ce qui suit est rangé sous #fx : aucune règle de la page d'accueil (boutons blancs, survols) ne peut passer devant
  css.textContent = css.textContent.replace(/^  (\.fx-[^{]*)\{/gm, (m, sel) => '  ' + sel.split(',').map((x) => (/^\.fx-orig/.test(x) ? x : /^\.fx-(compact|show)(?=[ {]|$)/.test(x) ? '#fx' + x : '#fx ' + x)).join(',') + '{');
  document.head.append(css);

  /* ---------- structure ---------- */
  const root = document.createElement('div'); root.id = 'fx'; root.className = 'fx-pre';
  const I = {
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.6v10.8a.6.6 0 0 0 .92.5l8.3-5.4a.6.6 0 0 0 0-1L5.42 2.1a.6.6 0 0 0-.92.5Z"/></svg>',
    pause: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3.4" y="2.5" width="3.3" height="11" rx="1"/><rect x="9.3" y="2.5" width="3.3" height="11" rx="1"/></svg>',
    up: '<svg class="chev" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 5-5 5 5"/></svg>',
    sep: '<svg class="sep" width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m1 1 5 5-5 5"/></svg>',
    route: '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 16c0-5 3-4 5-7s1-5 4-5 5 3 5 6-3 4-5 6-9 5-9 0Z"/></svg>',
    spark: '<svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor"><path d="M11 2.2c.5 3.9 1.9 5.3 5.8 5.8-3.9.5-5.3 1.9-5.8 5.8-.5-3.9-1.9-5.3-5.8-5.8 3.9-.5 5.3-1.9 5.8-5.8Z"/><path d="M17 13.4c.25 1.9.9 2.6 2.8 2.8-1.9.25-2.6.9-2.8 2.8-.25-1.9-.9-2.6-2.8-2.8 1.9-.25 2.6-.9 2.8-2.8Z" opacity=".7"/></svg>',
  };
  root.innerHTML = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs id="fx-defs"><linearGradient id="fxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe0ff"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#ffdf96"/></linearGradient></defs></svg>
    <div id="fx-veil"></div><div id="fx-hero"><h2 id="fx-intro-t"></h2><p id="fx-intro-s"></p></div><nav class="fx-pane" data-k="crumb" aria-label="Où je suis"><div class="fx-face fx-crumb" id="fx-crumb"></div></nav>
    <section class="fx-pane" data-k="card" aria-live="polite">
      <div class="fx-face fx-full" id="fx-full"><div class="fx-handle" id="fx-handle" role="button" tabindex="0" aria-label="Replier la fiche"></div><div class="fx-photo" id="fx-photo"></div>
        <div class="fx-body" id="fx-body"><h1 class="fx-title" id="fx-title"></h1><p class="fx-notes" id="fx-notes"></p><dl class="fx-rows" id="fx-rows"></dl><div class="fx-spots" id="fx-spots"></div><button class="fx-btn" id="fx-go" type="button">${I.play}<span>Lancer le parcours</span></button></div></div>
      <button class="fx-face fx-pill" id="fx-pill" type="button" aria-label="Ouvrir la fiche"></button>
    </section>
    <section class="fx-pane" data-k="mini" aria-label="Parcours guidé">
      <button class="fx-face fx-pill" id="fx-mpill" type="button">${I.route}<span>Parcours</span></button>
      <div class="fx-face fx-mini" id="fx-mfull"><header>Parcours guidé<span id="fx-pct">0 %</span></header><canvas class="fx-map" id="fx-map" width="400" height="240"></canvas>
        <div class="fx-row"><button class="fx-play" id="fx-play" type="button" aria-label="Lecture"></button><div class="fx-bar"><div id="fx-fill"></div></div><button class="fx-x" id="fx-stop" type="button">Quitter</button></div></div>
    </section>
    <section class="fx-pane" data-k="answer" aria-live="polite"><div class="fx-face on fx-answer" id="fx-answer"><div class="who"><span id="fx-who">Suggestions</span><span>Réponses d'exemple</span></div><p id="fx-text" hidden></p><div id="fx-places"></div><div id="fx-chips"></div></div></section>
    <form class="fx-pane" data-k="ai" autocomplete="off"><i class="fx-bloom"><u><b></b><b></b></u></i><i class="fx-ring"><u><b></b><b></b></u></i><div class="fx-face on fx-ai">${I.spark}<input id="fx-ask" type="text" placeholder="Demander à l'IA…" aria-label="Demander à l'IA"></div></form>
    <button id="fx-grab" type="button" aria-label="Replier la fiche"><b></b><i></i></button>
    <div id="fx-auto">Visite automatique. Touchez l'écran pour reprendre la main.</div>
    <div id="fx-modes" role="group" aria-label="Version de l'interface"><button type="button" data-m="off">Origine</button><button type="button" data-m="liquid">Liquide</button><button type="button" data-m="show">Showroom</button></div>`;
  document.body.append(root);
  const el = (id) => root.querySelector('#' + id);

  /* ---------- lentille : réfraction réelle du canvas 3D derrière chaque vitre (Chromium) ---------- */
  const lensCache = {};
  function lens(pane, w, h, r, band, scale) {
    if (!chromium) return '';
    w = Math.round(w); h = Math.round(h); r = Math.min(r, w / 2, h / 2);
    const id = 'fxl-' + pane; const key = [w, h, Math.round(r), band, scale].join('_');
    if (lensCache[pane] === key) return `url(#${id}) `;
    lensCache[pane] = key;
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const img = x.createImageData(w, h); const d = img.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const px = i + 0.5 - w / 2, py = j + 0.5 - h / 2, qx = Math.abs(px) - (w / 2 - r), qy = Math.abs(py) - (h / 2 - r);
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0), ol = Math.hypot(ox, oy);
      const sd = ol + Math.min(Math.max(qx, qy), 0) - r; // négatif à l'intérieur
      let nx = 0, ny = 0;
      if (ol > 0) { nx = ox / ol * Math.sign(px); ny = oy / ol * Math.sign(py); } else if (qx > qy) nx = Math.sign(px); else ny = Math.sign(py);
      const t = clamp(1 + sd / band, 0, 1), k = t * t;
      const o = (j * w + i) * 4; d[o] = 128 + nx * k * 127; d[o + 1] = 128 + ny * k * 127; d[o + 2] = 128; d[o + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    let f = root.querySelector('#' + id);
    if (!f) { f = document.createElementNS('http://www.w3.org/2000/svg', 'filter'); f.id = id; f.setAttribute('color-interpolation-filters', 'sRGB'); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '100%'); f.setAttribute('height', '100%'); el('fx-defs').append(f); }
    f.innerHTML = `<feImage href="${c.toDataURL()}" x="0" y="0" width="${w}" height="${h}" result="m" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="m" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>`;
    return `url(#${id}) `;
  }

  /* ---------- vitres animées par ressorts ---------- */
  const K = { x: [230, 24], y: [230, 24], w: [185, 21], h: [185, 21], r: [200, 26], p: [170, 26] };
  const panes = {};
  for (const n of root.querySelectorAll('.fx-pane')) panes[n.dataset.k] = { el: n, cur: { x: 0, y: 0, w: 1, h: 1, r: 0, p: 0 }, vel: { x: 0, y: 0, w: 0, h: 0, r: 0, p: 0 }, tgt: { x: 0, y: 0, w: 1, h: 1, r: 0, p: 0 }, fresh: true, still: 0 };
  const LOOK = { crumb: [14, 64, 5], card: [34, 96, 18], mini: [24, 70, 12], answer: [30, 84, 18], ai: [16, 72, 6] }; // bande, force, flou
  function stepPane(k, dt) {
    const P = panes[k], c = P.cur, t = P.tgt; let move = 0; if (P.rest) return; // vitre immobile : on ne touche plus à rien
    if (P.fresh) { Object.assign(c, t, { p: 0 }); P.fresh = false; }
    for (const q in c) {
      if (reduced) { c[q] = t[q]; continue; }
      const [ks, kd] = K[q]; P.vel[q] += (-ks * (c[q] - t[q]) - kd * P.vel[q]) * dt; c[q] += P.vel[q] * dt; move += Math.abs(P.vel[q]);
    }
    c.w = Math.max(c.w, 1); c.h = Math.max(c.h, 1);
    const s = P.el.style, rr = Math.min(c.r, c.w / 2, c.h / 2);
    const Z = S.z; s.transform = `translate3d(${(c.x * Z).toFixed(2)}px,${(c.y * Z).toFixed(2)}px,0) scale(${Z})`; s.width = c.w.toFixed(1) + 'px'; s.height = c.h.toFixed(1) + 'px'; s.borderRadius = rr.toFixed(1) + 'px';
    s.opacity = clamp((c.p - 0.3) / 0.6, 0, 1).toFixed(3); P.el.classList.toggle('off', t.p < 0.5);
    // la lentille est recalculée quand la vitre s'immobilise (pendant le mouvement : flou simple)
    P.still = move < 6 ? P.still + dt : 0;
    const [band, force, blur0] = LOOK[k], blur = S.show ? Math.round(blur0 * 1.5) : blur0;
    const want = P.still > 0.12 && c.p > 0.9 ? lens(k, t.w, t.h, t.r, band, force) : (P.lens && move < 60 ? P.lens : '');
    if (P.still > 0.12) P.lens = want;
    const bf = `${want}blur(${blur}px) saturate(170%)`;
    if (P.bf !== bf) { P.bf = bf; s.backdropFilter = bf; s.webkitBackdropFilter = `blur(${blur}px) saturate(170%)`; }
    s.visibility = c.p < 0.02 && t.p < 0.5 ? 'hidden' : 'visible'; let far = 0; for (const q in c) far = Math.max(far, Math.abs(c[q] - t[q])); if (P.still > 0.4 && far < 0.05) P.rest = true;
  }

  /* ---------- lecture du viewer d'A-LL ---------- */
  const theirs = { panel: $('#poi-card-panel'), close: $('#poi-card-close-button'), ctrl: $('.camera-spatial-control') };
  const ROOT = (document.title.split('|').pop() || '').trim() || 'Vue d\u2019ensemble';
  const S = { open: false, level: 0, trail: [ROOT], eyebrow: '', title: '', facts: [], photo: '', hasTour: false, touring: false, prog: 0, playing: false, cardOpen: true, ai: 'idle', W: 0, H: 0, compact: false, key: '', mode: 'liquid', show: false, z: 1, auto: false, intro: 'wait' };
  const cap = (s) => (s || '').trim().toLowerCase().replace(/(^|[\s\-:])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  function read() {
    const p = theirs.panel || (theirs.panel = $('#poi-card-panel')); if (!p) return false;
    theirs.close = theirs.close || $('#poi-card-close-button');
    const open = p.dataset.open === 'true';
    const vis = (n) => n && getComputedStyle(n).display !== 'none';
    const title = ($('#poi-card-title')?.textContent || '').trim();
    const eyebrow = vis($('#poi-card-eyebrow')) ? $('#poi-card-eyebrow').textContent.trim() : '';
    const raw = [$('#poi-card-bullets'), $('#poi-card-text')].filter(vis).map((n) => n.innerText).join('\n');
    const facts = raw.split(/\n|•/).map((s) => s.trim()).filter(Boolean);
    const im = $('#poi-card-image'); const photo = vis(im) ? (im.currentSrc || im.src) : '';
    const ctrl = theirs.ctrl = theirs.ctrl || $('.camera-spatial-control');
    const hasTour = !!ctrl && !ctrl.hasAttribute('hidden') && getComputedStyle(ctrl).display !== 'none';
    const h = ctrl && ctrl.querySelector('.camera-spatial-handle'); const prog = h ? parseFloat(h.getAttribute('aria-valuenow') || '0') || 0 : 0;
    const key = [open, title, eyebrow, facts.length, photo, hasTour].join('|');
    const moved = Math.abs(prog - S.prog) > 1e-4; if (moved) S.lastMove = performance.now();
    S.prog = prog; S.playing = performance.now() - (S.lastMove || 0) < 700;
    if (key === S.key) return false;
    S.key = key; if (S.compact && title !== S.title) S.cardOpen = false; S.open = open && !!title; S.eyebrow = eyebrow; S.title = title; S.facts = facts; S.photo = photo; S.hasTour = hasTour && S.open;
    if (!S.open) { S.level = 0; S.trail = [ROOT]; S.touring = false; }
    else {
      const isPoi = !!eyebrow && eyebrow.toLowerCase() !== ROOT.toLowerCase(); // le surtitre d'une gare est le nom du projet, celui d'un point est sa gare
      S.level = isPoi ? 2 : 1; S.trail = isPoi ? [ROOT, cap(eyebrow), title] : [ROOT, title];
      if (!S.hasTour) S.touring = false;
    }
    return true;
  }
  const goUp = (n = 1) => { for (let i = 0; i < n; i++) setTimeout(() => theirs.close?.click(), i * 450); };
  const transport = () => theirs.ctrl?.querySelector('.camera-spatial-transport')?.click();

  /* ---------- rendu ---------- */
  let swap = 0;
  // typographie française : espace fine insécable avant % et entre un nombre et son unité, m² au lieu de m2
  const tidy = (t) => t.trim().replace(/^[◦\-–·]\s*/, '').replace(/\.$/, '').replace(/(\d)\s?%/g, '$1\u202f%').replace(/\bm2\b/g, 'm²').replace(/(\d)\s(m|m²|km|s|min|sec)\b/g, '$1\u202f$2').replace(/\(Conforme Lhand\)/i, '(conforme LHand)');
  function render(animate) {
    const c = el('fx-crumb'); c.innerHTML = '';
    if (S.trail.length > 1) { const b = document.createElement('button'); b.className = 'back'; b.innerHTML = I.back; b.setAttribute('aria-label', 'Retour à ' + S.trail[S.trail.length - 2]); b.onclick = () => { S.touring = false; goUp(1); }; c.append(b); }
    S.trail.forEach((t, i) => { const last = i === S.trail.length - 1; if (i) c.insertAdjacentHTML('beforeend', I.sep); const b = document.createElement('button'); b.textContent = t; b.className = (last ? 'here' : 'anc') + (S.trail.length === 1 ? ' root' : ''); if (!last) b.onclick = () => { S.touring = false; goUp(S.trail.length - 1 - i); }; c.append(b); });
    const fill = () => {
      el('fx-title').textContent = S.title;
      // « Libellé : valeur » devient une ligne de fiche technique, le reste une phrase d'introduction
      const rows = [], notes = [];
      for (const f of S.facts) { const m = f.match(/^([^:]{2,40}?)\s*:\s*(.+)$/); if (m) rows.push([m[1].trim(), tidy(m[2])]); else notes.push(tidy(f)); }
      el('fx-notes').textContent = notes.join('. ') + (notes.length ? '.' : ''); el('fx-notes').style.display = notes.length ? '' : 'none';
      const dl = el('fx-rows'); dl.innerHTML = ''; dl.style.display = rows.length ? '' : 'none';
      for (const [k, v] of rows) { const d = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; d.append(dt, dd); dl.append(d); }
      // les points à visiter dans cette gare, tels que le viewer les déclare
      const sp = el('fx-spots'); sp.innerHTML = ''; const here = S.level === 1 ? findStation(S.title) : null, list = here ? spots.filter((h) => h.visibilityGroupId === here.id) : []; sp.style.display = list.length ? '' : 'none';
      if (list.length) { const h = document.createElement('h3'); h.textContent = list.length > 1 ? `${list.length} points à voir ici` : 'À voir ici'; sp.append(h); for (const x of list) { const b = document.createElement('button'); b.type = 'button'; b.className = 'fx-spot'; b.innerHTML = '<b></b><span></span>' + I.sep; b.querySelector('span').textContent = x.label; b.onclick = () => openSpot(x); sp.append(b); } const n = document.createElement('p'); n.className = 'fx-hint'; n.id = 'fx-hint'; n.hidden = true; sp.append(n); }
      el('fx-rows').style.maxHeight = Math.round(S.H * (list.length ? 0.2 : 0.3)) + 'px';
      el('fx-photo').style.display = S.photo ? '' : 'none'; if (S.photo) el('fx-photo').style.backgroundImage = `url("${S.photo}")`;
      el('fx-go').style.display = S.hasTour ? '' : 'none';
      el('fx-pill').innerHTML = `<b></b><span>${S.title}</span>${S.touring ? '<small>Parcours en cours</small>' : ''}${I.up}`;
      measure(); layout();
    };
    clearTimeout(swap);
    if (animate && !reduced && S.open) { el('fx-body').classList.add('out'); swap = setTimeout(() => { fill(); el('fx-body').classList.remove('out'); }, 170); } else fill();
  }

  /* ---------- mise en page ---------- */
  const M = {};
  function measure() {
    S.win = false; S.compact = innerWidth < 640; S.show = S.mode === 'show' && !S.compact; S.z = S.show ? clamp(Math.min(innerWidth / 1280, innerHeight / 720) * 1.25, 1.12, 2.2) : 1;
    S.W = innerWidth / S.z; S.H = innerHeight / S.z; root.classList.toggle('fx-compact', S.compact); root.classList.toggle('fx-show', S.show);
    const cw = S.compact ? S.W - 16 : 328, mw = S.compact ? 208 : 264;
    el('fx-full').style.width = cw + 'px'; el('fx-mfull').style.width = mw + 'px'; el('fx-pill').style.width = S.compact ? cw + 'px' : '';
    el('fx-answer').style.width = (S.compact ? S.W - 16 : Math.min(460, S.W - 40)) + 'px';
    el('fx-rows').style.maxHeight = Math.round(S.H * 0.3) + 'px';
    M.crumb = el('fx-crumb').offsetWidth; M.full = el('fx-full').offsetHeight; M.pill = el('fx-pill').offsetWidth; M.mpill = el('fx-mpill').offsetWidth; M.mfull = el('fx-mfull').offsetHeight; M.answer = el('fx-answer').offsetHeight; M.cw = cw; M.mw = mw;
  }
  const face = (id, on) => el(id).classList.toggle('on', on);
  function layout() {
    const { W, H } = S, T = {}, open = S.open && S.cardOpen && !S.touring, aiOn = S.ai !== 'idle', hasMini = false, miniFull = false; // le plan du parcours reste celui du viewer, à sa place
    face('fx-full', open); face('fx-pill', !open); face('fx-mfull', miniFull); face('fx-mpill', !miniFull);
    if (S.compact) {
      const m = 8; T.crumb = { x: m + 2, y: 10, w: M.crumb, h: 44, r: 22, p: 1 };
      const ch = open ? Math.min(M.full, H * 0.46) : 56; T.card = { x: m, y: H - m - ch, w: W - 16, h: ch, r: open ? 32 : 28, p: S.open ? 1 : 0 };
      const top = S.open ? H - m - ch : H - 30, mw = miniFull ? M.mw : 48, mh = miniFull ? M.mfull : 48;
      T.mini = { x: W - m - mw, y: top - 8 - mh, w: mw, h: mh, r: miniFull ? 28 : 24, p: hasMini ? 1 : 0 };
      T.ai = { x: aiOn ? m : W - m - 48, y: top - 8 - 48, w: aiOn ? W - 16 : 48, h: 48, r: 24, p: 1 }; // téléphone : la commande est un bouton rond tant qu'on ne s'en sert pas
      T.answer = { x: m, y: T.ai.y - 8 - M.answer, w: W - 16, h: M.answer, r: 28, p: aiOn ? 1 : 0 };
    } else {
      const sh = S.show, m = sh ? 28 : 20, base = H - m; T.crumb = { x: m, y: m, w: M.crumb, h: 44, r: 22, p: 1 };
      const win = sh && open; // showroom : la fiche ouverte est une fenêtre, centrée en hauteur
      const ch = open ? Math.min(M.full, H - (sh ? 150 : 110)) : 48, cw = open ? 328 : M.pill;
      T.card = win ? { x: Math.max(m, Math.round(W * 0.06)), y: Math.max(m + 60, Math.round((H - ch) / 2 - 14)), w: cw, h: ch, r: 40, p: 1 } : { x: m, y: base - ch, w: cw, h: ch, r: open ? 28 : 24, p: S.open ? 1 : 0 };
      const mw = miniFull ? M.mw : M.mpill, mh = miniFull ? M.mfull : 48; T.mini = { x: W - m - mw, y: base - 34 - mh, w: mw, h: mh, r: miniFull ? 28 : 24, p: hasMini ? 1 : 0 };
      const L = S.open ? T.card.x + cw + 16 : m, R = hasMini ? W - m - mw - 16 : W - m - 100; const aw = Math.max(48, Math.min(aiOn ? 440 : sh ? 380 : 300, R - L));
      T.ai = { x: clamp(W / 2 - aw / 2, L, Math.max(L, R - aw)), y: base - 48, w: aw, h: 48, r: 24, p: 1 };
      const nw = Math.min(460, W - 40); T.answer = { x: clamp(T.ai.x + aw / 2 - nw / 2, Math.min(L, W - m - nw), W - m - nw), y: T.ai.y - 12 - M.answer, w: nw, h: M.answer, r: 28, p: aiOn ? 1 : 0 };
      S.win = win;
    }
    if (!aiOn) Object.assign(T.answer, { x: T.ai.x, y: T.ai.y - 4, w: T.ai.w, h: 44 });
    if (S.intro !== 'done') for (const k in T) T[k].p = 0;
    face('fx-crumb', S.intro === 'done');
    for (const k in T) { Object.assign(panes[k].tgt, T[k]); panes[k].rest = false; }
    panes.ai.el.classList.toggle('glow', S.ai === 'thinking');
  }

  /* ---------- actions ---------- */
  el('fx-pill').onclick = () => { if (S.touring) { S.touring = false; if (S.playing) transport(); } S.cardOpen = true; render(false); };
  el('fx-handle').onclick = () => { S.cardOpen = false; layout(); };
  const start = () => { S.cardOpen = false; if (!S.playing) transport(); layout(); }; // la fiche se replie, le plan d'origine prend le relais
  el('fx-go').onclick = start; el('fx-mpill').onclick = start;
  el('fx-play').onclick = () => transport();
  el('fx-stop').onclick = () => { if (S.playing) transport(); S.touring = false; S.cardOpen = true; render(false); };
  el('fx-grab').onclick = () => { S.cardOpen = false; layout(); };
  const QP = new URLSearchParams(location.search); let stations = [], spots = [], autoI = -1;
  const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const goStation = (id) => { try { window.unityInstance.SendMessage((window.getUnityGameObjectName && window.getUnityGameObjectName()) || 'ALL Prism Core', 'SelectSelectableTarget', JSON.stringify({ type: 'allprism.selectableTargetRequest', source: 'wrapper-selectable-target-menu', action: 'focus', targetId: id, instanceId: QP.get('instanceId') || '', experienceId: QP.get('experienceId') || '', embedKey: QP.get('embedKey') || '' })); S.cardOpen = true; return true; } catch (e) { return false; } };
  const findStation = (q) => { const n = norm(q); let best = null, score = 0; for (const st of stations) { const k = norm(st.label).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && w !== 'halte' && w !== 'gare' && w !== 'station' && w !== 'acces').filter((w) => n.includes(w)).length; if (k > score) { score = k; best = st; } } return best; };
  const places = () => { const c = el('fx-places'); c.innerHTML = ''; for (const st of stations) { const b = document.createElement('button'); b.type = 'button'; b.className = 'fx-place'; b.textContent = st.label; b.onclick = () => submit('Aller à ' + st.label); c.append(b); } };
  if (QP.get('config')) fetch(QP.get('config')).then((r) => r.json()).then((j) => { stations = ((j.selectableTargetMenu || {}).targets || []).filter((t) => t && t.id && t.label); places(); introText(); render(false); }).catch(() => {});
  if (QP.get('manifestUrl')) fetch(QP.get('manifestUrl')).then((r) => r.json()).then((j) => { spots = (j.hotspots || []).filter((h) => h && h.id && h.label); render(false); }).catch(() => {});
  // on demande le point au viewer ; s'il ne répond pas, on indique où toucher dans la vue
  const openSpot = (x) => { const before = S.title; goStation(x.id); setTimeout(() => { const n = el('fx-hint'); if (S.title === before && n) { n.textContent = `Touchez « ${x.label} » dans la vue pour y entrer.`; n.hidden = false; measure(); layout(); } }, 2600); };
  const ask = el('fx-ask'); let aiT = 0; panes.ai.el.addEventListener('click', () => ask.focus());
  const chips = (list) => { const c = el('fx-chips'); c.innerHTML = ''; for (const q of list) { const b = document.createElement('button'); b.type = 'button'; b.className = 'fx-chip'; b.textContent = q; b.onclick = () => submit(q); c.append(b); } };
  const QS = () => (S.open ? ['Résume cette fiche en une phrase', 'Quelles sont les dimensions du quai ?'] : ['Combien de gares compte le tracé ?', 'Par où commencer la visite ?']);
  function answer(q) {
    if (/résume/i.test(q) && S.facts.length) return `${S.title} : ${S.facts.slice(0, 3).join(', ').toLowerCase()}.`;
    if (/dimension|quai/i.test(q)) { const f = S.facts.find((x) => /\d+\s?m/.test(x) && /quai|long/i.test(x)); if (f) return `D'après la fiche : ${f.toLowerCase()}.`; }
    const st = findStation(q); if (st && /aller|va |emm|montre|voir|direction/i.test(q + ' ')) { setTimeout(() => goStation(st.id), 500); setTimeout(() => closeAI(), 2600); return `En route pour ${st.label}.`; }
    if (/combien/i.test(q)) return `${stations.length || 'Plusieurs'} gares sont sur le tracé. Choisissez-en une ci-dessous, ou touchez son étiquette dans la vue.`;
    if (/commencer/i.test(q)) return 'Commencez par une gare sur la vue d’ensemble, puis ouvrez un point : certains proposent un parcours guidé.';
    return 'Je suis une démonstration : je réponds à partir du texte de la fiche ouverte. Essayez une des questions proposées.';
  }
  function submit(q) {
    q = (q || ask.value).trim(); if (!q) return; ask.value = q; S.ai = 'thinking'; el('fx-who').textContent = 'Recherche'; el('fx-text').hidden = false; el('fx-text').textContent = ' '; chips([]); measure(); layout();
    clearTimeout(aiT); aiT = setTimeout(() => { S.ai = 'answer'; el('fx-who').textContent = 'Réponse'; const t = el('fx-text'); t.innerHTML = ''; answer(q).split(' ').forEach((w, i) => { const s = document.createElement('span'); s.style.animationDelay = i * 38 + 'ms'; s.textContent = w + ' '; t.append(s); }); ask.value = ''; chips(QS().filter((x) => x !== q)); measure(); layout(); }, reduced ? 80 : 1200);
  }
  ask.addEventListener('focus', () => { if (S.ai === 'idle') { S.ai = 'suggest'; el('fx-who').textContent = 'Suggestions'; el('fx-text').hidden = true; places(); chips(QS()); measure(); layout(); } });
  root.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); submit(); });
  const closeAI = () => { if (S.ai !== 'idle') { clearTimeout(aiT); S.ai = 'idle'; ask.value = ''; ask.blur(); layout(); } };
  const onKey = (e) => { if (e.key === 'Escape') closeAI(); };
  const onDown = (e) => { if (!root.contains(e.target)) closeAI(); };
  addEventListener('keydown', onKey); addEventListener('pointerdown', onDown, true);
  // les touches tapées dans la commande ne doivent pas partir vers la 3D
  for (const t of ['keydown', 'keyup', 'keypress']) ask.addEventListener(t, (e) => e.stopPropagation());
  const html = document.documentElement;
  const setMode = (m) => { S.mode = m; html.classList.toggle('fx-orig', m === 'off'); for (const b of el('fx-modes').children) b.setAttribute('aria-pressed', String(b.dataset.m === m)); try { sessionStorage.setItem('fx-mode', m); } catch (e) {} S.idleAt = performance.now(); stopAuto(); measure(); layout(); };
  // showroom : sans personne devant l'écran, la visite passe d'une gare à l'autre toute seule
  const stopAuto = () => { if (S.auto) { S.auto = false; el('fx-auto').classList.remove('on'); } };
  /* ---------- entrée : le nom du projet se pose au centre, puis se range en fil d'Ariane ---------- */
  S.t0 = performance.now();
  const hero = el('fx-hero'), veil = el('fx-veil');
  // sortie : le titre file se ranger là où le fil d'Ariane apparaît, le voile se lève sur la 3D
  const endIntro = () => { if (S.intro === 'done') return; S.intro = 'done'; const fs = parseFloat(getComputedStyle(el('fx-intro-t')).fontSize) || 80; hero.style.transform = `translate(${32 - innerWidth * 0.08}px,${32 - innerHeight / 2}px) scale(${15 / fs})`; hero.classList.add('out'); root.classList.remove('fx-pre'); veil.classList.remove('on'); setTimeout(() => { veil.style.display = 'none'; }, 1600); setTimeout(() => hero.classList.remove('on'), 1000); setTimeout(layout, 520); };
  const introText = () => { const h = el('fx-intro-t'); if (!h.childElementCount) [...ROOT].forEach((c, i) => { const sp = document.createElement('span'); sp.textContent = c === ' ' ? '\u00a0' : c; sp.style.animationDelay = i * 45 + 'ms'; h.append(sp); }); el('fx-intro-s').textContent = stations.length ? `${stations.length} gares à explorer en 3D` : 'Visite en 3D'; };
  const introTick = (now) => {
    if (S.intro === 'wait') { const sp = $('#splashscreen-container'), cs = sp && getComputedStyle(sp); if ((!!window.unityInstance && (!cs || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) && +getComputedStyle($('#unity-canvas') || document.body).opacity > 0.9) || now - S.t0 > 90000) { S.intro = 'show'; S.introAt = now; introText(); veil.classList.add('on'); hero.classList.add('on'); layout(); } }
    else if (S.intro === 'show' && now - S.introAt > 2900) endIntro();
  };
  const onAct = (ev) => { if (ev && ev.type === 'pointermove') { const r = panes.ai.el.getBoundingClientRect(), dx = Math.max(r.left - ev.clientX, 0, ev.clientX - r.right), dy = Math.max(r.top - ev.clientY, 0, ev.clientY - r.bottom); panes.ai.el.classList.toggle('near', dx * dx + dy * dy < 22500); } S.idleAt = performance.now(); stopAuto(); if (ev && ev.type !== 'pointermove' && S.intro === 'show' && performance.now() - S.introAt > 700) endIntro(); };
  for (const t of ['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchstart']) addEventListener(t, onAct, { capture: true, passive: true });
  for (const b of el('fx-modes').children) b.onclick = () => setMode(b.dataset.m);
  let first = 'liquid'; try { first = sessionStorage.getItem('fx-mode') || first; } catch (e) {} if (/showroom/i.test(location.hash + location.search)) first = 'show';
  S.idleAt = performance.now(); S.autoAt = 0;

  /* ---------- boucle ---------- */
  const map = el('fx-map'), mx = map.getContext('2d'); let playIcon = '', raf = 0, last = performance.now(), acc = 0;
  function frame(now) {
    const dt = Math.min(0.034, (now - last) / 1000); last = now; acc += dt;
    introTick(now);
    if (acc > 0.12) { acc = 0; if (read()) render(true); }
    if (S.hasTour) {
      const icon = S.playing ? 'pause' : 'play'; if (icon !== playIcon) { playIcon = icon; el('fx-play').innerHTML = I[icon]; el('fx-play').setAttribute('aria-label', icon === 'pause' ? 'Pause' : 'Lecture'); }
      el('fx-fill').style.transform = `scaleX(${clamp(S.prog, 0, 1)})`; el('fx-pct').textContent = Math.round(S.prog * 100) + ' %';
      if (S.touring) { // le tracé affiché est celui que le viewer dessine lui-même
        const src = theirs.ctrl?.querySelector('.camera-spatial-decor'); mx.clearRect(0, 0, 400, 240);
        if (src && src.width > 4 && src.height > 4) { const k = Math.min(360 / src.width, 200 / src.height); mx.save(); mx.filter = 'none'; mx.drawImage(src, (400 - src.width * k) / 2, (240 - src.height * k) / 2, src.width * k, src.height * k); mx.restore(); }
      }
    }
    if (S.show && stations.length && S.ai === 'idle' && now - S.idleAt > 25000 && now - S.autoAt > 14000) { S.autoAt = now; S.auto = true; el('fx-auto').classList.add('on'); autoI = (autoI + 1) % stations.length; goStation(stations[autoI].id); }
    for (const k in panes) stepPane(k, dt);
    const g = el('fx-grab'), cc = panes.card.cur; g.classList.toggle('on', !!S.win && cc.p > 0.9); if (S.win) g.style.transform = `translate3d(${((cc.x + cc.w / 2 - 79) * S.z).toFixed(1)}px,${((cc.y + cc.h + 16) * S.z).toFixed(1)}px,0) scale(${S.z})`;
    raf = requestAnimationFrame(frame);
  }
  const onResize = () => { measure(); layout(); };
  addEventListener('resize', onResize);
  read(); setMode(first); render(false); raf = requestAnimationFrame(frame);
  window.__prismSkin = { S, panes, destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onResize); removeEventListener('keydown', onKey); removeEventListener('pointerdown', onDown, true); for (const t of ['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchstart']) removeEventListener(t, onAct, { capture: true }); html.classList.remove('fx-orig'); root.remove(); css.remove(); delete window.__prismSkin; } };
})();
})();
