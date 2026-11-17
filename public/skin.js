(function ft() {
  if (document.title.split("|").length < 3 && performance.now() < 6e4)
    return setTimeout(ft, 200);
  (() => {
    window.__prismSkin && window.__prismSkin.destroy();
    const k = (e, a = document) => a.querySelector(e),
      M = (e, a, n) => Math.min(n, Math.max(a, e)),
      oe = matchMedia("(prefers-reduced-motion: reduce)").matches,
      xt = !!window.chrome || /Chrome\//.test(navigator.userAgent),
      Le = getComputedStyle(document.documentElement),
      ct =
        (
          Le.getPropertyValue("--all-prism-theme-accent-color") || "#ed695a"
        ).trim() || "#ed695a",
      Me =
        (Le.getPropertyValue("--all-prism-poi-font-family") || "").trim() ||
        "system-ui",
      B = document.createElement("style");
    (B.id = "fx-style"),
      (B.textContent = `
  html:not(.fx-orig) #poi-card-panel,html:not(.fx-orig) .camera-spatial-control{opacity:0!important;pointer-events:none!important}
  .fx-orig #fx .fx-pane,.fx-orig #fx-grab,.fx-orig #fx-auto{display:none!important}
  /* \xC9chelle iOS : 26 titre, 17 gras pour ce qu'on nomme, 15 pour ce qu'on lit, 13 pour le secondaire. Rien entre. */
  #fx{position:fixed;inset:0;z-index:2147483000;pointer-events:none;text-align:left;
    font:400 15px/20px -apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Helvetica,Arial,sans-serif;letter-spacing:-.01em;
    color:var(--ink);-webkit-font-smoothing:antialiased;font-feature-settings:"ss01","cv11";
    --ink:rgba(255,255,255,.96);--soft:rgba(255,255,255,.64);--faint:rgba(255,255,255,.14);--fill:rgba(255,255,255,.10);
    --glass:rgba(22,24,28,.58);--accent:${ct};--on-accent:#1d0a07;--ease:cubic-bezier(.2,0,0,1)}
  :where(#fx) *{box-sizing:border-box;margin:0;padding:0}
  #fx button{font:inherit;letter-spacing:inherit;color:inherit;background:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
  #fx button:focus-visible{outline:2px solid #fff;outline-offset:3px}
  #fx input,#fx input:focus-visible{outline:none}
  /* la vitre : fum\xE9e, neutre, un liser\xE9 clair en haut, une ombre large et douce */
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
  .fx-title{font-family:${Me},-apple-system,system-ui,sans-serif;font-size:22px;line-height:26px;font-weight:600;letter-spacing:-.012em;text-wrap:balance}
  .fx-notes{margin-top:4px;color:var(--soft);font-size:15px;line-height:20px;text-wrap:pretty}
  .fx-rows{margin-top:16px;display:flex;flex-direction:column;overflow:auto;scrollbar-width:none}
  .fx-rows::-webkit-scrollbar{display:none}
  .fx-rows div{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:10px 0;border-top:1px solid var(--faint)}
  .fx-rows dt{color:var(--soft);flex:none;max-width:52%}
  .fx-rows dd{text-align:right;font-weight:500;font-variant-numeric:tabular-nums;text-wrap:balance}
  .fx-btn{margin-top:18px;height:50px;border-radius:25px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:17px;line-height:22px;font-weight:600;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 84%,#fff),var(--accent))!important;color:var(--on-accent)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 12px 26px -12px var(--accent);transition:transform .2s var(--ease),filter .2s}
  .fx-btn:hover{filter:brightness(1.07)}
  .fx-btn:active{transform:scale(.97)}

  /* pastilles : fiche repli\xE9e, parcours */
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

  /* hors produit : avant, apr\xE8s */
  #fx-modes{position:absolute;right:20px;top:20px;display:flex;gap:2px;padding:4px;border-radius:22px;background:rgba(16,18,21,.62);pointer-events:auto;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
  #fx-modes button{height:36px;padding:0 14px;border-radius:18px;font-size:13px;line-height:18px;color:rgba(255,255,255,.72);transition:background .2s,color .2s}
  #fx-modes button[aria-pressed=true]{background:rgba(255,255,255,.18);color:#fff}

  /* lieux : aller directement \xE0 une gare */
  #fx-places{display:flex;flex-wrap:wrap;gap:8px}
  #fx-places:empty{display:none}
  .fx-place{height:38px;padding:0 15px;border-radius:19px;background:linear-gradient(180deg,rgba(255,255,255,.15),rgba(255,255,255,.07))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 0 0 1px rgba(255,255,255,.05);font-size:15px;line-height:20px;font-weight:500;display:flex;align-items:center;gap:8px;transition:background .2s,transform .2s var(--ease)}
  .fx-place::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--accent)}
  .fx-place:hover{background:linear-gradient(180deg,rgba(255,255,255,.24),rgba(255,255,255,.12))!important;transform:translateY(-1px)}
  .fx-place:active{transform:scale(.97)}

  /* showroom : la fiche devient une fen\xEAtre pos\xE9e dans l'espace, avec sa poign\xE9e dessous */
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
  #fx .fx-spot{position:relative;height:34px;padding:0 2px;display:flex;align-items:center;gap:10px;font-size:15px;line-height:20px;font-weight:500;border-bottom:1px solid rgba(255,255,255,.08)}
  #fx .fx-spot b{width:6px;height:6px;border-radius:50%;background:var(--accent);flex:none}
  #fx .fx-spot span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #fx .fx-spot svg{flex:none;opacity:.5}
  #fx .fx-hint{margin-top:12px;font-size:13px;line-height:18px;color:var(--soft)}
  #fx .fx-map{aspect-ratio:auto;height:188px;display:grid;place-items:center;overflow:hidden}
  #fx .fx-map svg{width:100%;height:100%;display:block}
  #fx .fx-mini header span{font-size:17px;font-weight:600;color:var(--ink)}
  #fx .fx-fold{width:32px;height:32px;border-radius:50%;background:var(--fill);display:grid;place-items:center;flex:none;transition:background .2s}
  #fx .fx-fold:hover{background:rgba(255,255,255,.2)}
  #fx .fx-fold svg{margin:0;opacity:.8}
  #fx .fx-mini header{align-items:center}
  #fx .fx-pct{flex:none;width:44px;text-align:right;font-size:13px;line-height:18px;color:var(--soft);font-variant-numeric:tabular-nums}
  #fx .fx-seek{flex:1;min-width:0;height:28px;margin:0;background:none;-webkit-appearance:none;appearance:none;cursor:pointer;--v:0%}
  #fx .fx-seek::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:linear-gradient(90deg,#fff var(--v),rgba(255,255,255,.2) var(--v))}
  #fx .fx-seek::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;margin-top:-8px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4),0 0 0 6px rgba(255,255,255,0);transition:box-shadow .2s}
  #fx .fx-seek:hover::-webkit-slider-thumb,#fx .fx-seek:active::-webkit-slider-thumb{box-shadow:0 2px 8px rgba(0,0,0,.4),0 0 0 6px rgba(255,255,255,.16)}
  #fx .fx-seek::-moz-range-track{height:4px;border-radius:2px;background:rgba(255,255,255,.2)}
  #fx .fx-seek::-moz-range-progress{height:4px;border-radius:2px;background:#fff}
  #fx .fx-seek::-moz-range-thumb{width:20px;height:20px;border:0;border-radius:50%;background:#fff}
  #fx .fx-pane[data-k=mini]{background:none!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;overflow:visible}
  #fx .fx-pane[data-k=mini]::after{content:none}
  #fx .fx-mini{padding:0;gap:2px}
  #fx .fx-mini header,#fx .fx-pct{display:none}
  #fx .fx-map{position:relative;height:auto;aspect-ratio:9/8;border-radius:0;box-shadow:none;background:radial-gradient(ellipse at center,rgba(10,12,14,.4),rgba(10,12,14,0) 70%);-webkit-mask-image:radial-gradient(ellipse at center,#000 50%,transparent 76%);mask-image:radial-gradient(ellipse at center,#000 50%,transparent 76%)}
  #fx .fx-map canvas,#fx #fx-plan{position:absolute;inset:0;width:100%;height:100%}
  #fx .fx-row{gap:6px;padding:0 22px 0 14px;opacity:.7;transition:opacity .35s var(--ease)}
  #fx .fx-pane[data-k=mini]:hover .fx-row{opacity:1}
  #fx .fx-play{width:28px;height:28px;background:none!important;color:#fff!important;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))}
  #fx .fx-seek{height:24px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.45))}
  #fx .fx-seek::-webkit-slider-runnable-track{height:2px;border-radius:1px;background:linear-gradient(90deg,#fff var(--v),rgba(255,255,255,.32) var(--v))}
  #fx .fx-seek::-webkit-slider-thumb{width:10px;height:10px;margin-top:-4px;box-shadow:none;transition:transform .2s var(--ease)}
  #fx .fx-seek:hover::-webkit-slider-thumb,#fx .fx-seek:active::-webkit-slider-thumb{box-shadow:none;transform:scale(1.5)}
  #fx .fx-seek::-moz-range-track,#fx .fx-seek::-moz-range-progress{height:2px}
  #fx .fx-seek::-moz-range-thumb{width:10px;height:10px}
  #fx.fx-compact #fx-pill{height:56px;padding:0 20px}
  #fx .fx-map{border-radius:0;background:none;overflow:visible;-webkit-mask-image:none;mask-image:none}
  #fx .fx-map::before{content:"";position:absolute;inset:-18%;pointer-events:none;background:radial-gradient(closest-side,rgba(8,10,12,.5),rgba(8,10,12,.2) 55%,rgba(8,10,12,0));-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);-webkit-mask-image:radial-gradient(closest-side,#000 35%,transparent 100%);mask-image:radial-gradient(closest-side,#000 35%,transparent 100%)}
  #fx .fx-pane[data-k=mini]{pointer-events:none}
  #fx .fx-pane[data-k=mini] .fx-row,#fx .fx-pane[data-k=mini] .fx-map{pointer-events:auto}
  #fx.fx-compact .fx-map{width:220px;margin-left:auto}
  #fx.fx-compact .fx-row{padding:0 6px 0 2px;opacity:.9}
  /* la barre IA devient l'\xE9l\xE9ment principal */
  #fx .fx-pane[data-k=ai] .fx-ring{opacity:.72}
  #fx .fx-ai{gap:12px;padding:0 20px 0 18px}
  #fx .fx-ai input{font-size:17px;font-weight:500}
  /* visite : un accessoire au-dessus de la barre, rien qu'un curseur */
  #fx .fx-pane[data-k=mini] .fx-mini{gap:10px}
  #fx .fx-scrub{position:relative;height:44px;border-radius:22px;cursor:pointer;pointer-events:auto;touch-action:none;outline:none;--v:0%;
    background:rgba(22,24,28,.5);-webkit-backdrop-filter:blur(16px) saturate(160%);backdrop-filter:blur(16px) saturate(160%);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.22),0 12px 30px -12px rgba(0,0,0,.5)}
  #fx .fx-scrub:focus-visible{box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),0 0 0 2px #fff}
  #fx .fx-track{position:absolute;left:16px;right:16px;top:50%;height:3px;margin-top:-1.5px;border-radius:2px;background:rgba(255,255,255,.22);overflow:hidden}
  #fx .fx-track b{position:absolute;left:0;top:0;bottom:0;width:var(--v);background:rgba(255,255,255,.9);border-radius:2px}
  #fx .fx-knob{position:absolute;top:50%;left:calc(16px + (100% - 32px) * var(--v) / 100%);width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;display:grid;place-items:center;color:#15171a;
    background:radial-gradient(circle at 35% 28%,#fff,rgba(255,255,255,.86) 60%,rgba(230,236,244,.8));box-shadow:0 4px 12px rgba(0,0,0,.35),inset 0 -1px 2px rgba(0,0,0,.12);
    transition:width .25s var(--ease),height .25s var(--ease),margin .25s var(--ease),background .25s,box-shadow .25s}
  #fx .fx-knob svg{width:12px;height:12px}
  #fx .fx-scrub.held .fx-knob{width:42px;height:30px;margin:-15px 0 0 -21px;border-radius:15px;background:rgba(255,255,255,.28);-webkit-backdrop-filter:blur(4px) saturate(180%);backdrop-filter:blur(4px) saturate(180%);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.6),inset 0 1px 0 rgba(255,255,255,.8),0 6px 16px rgba(0,0,0,.3)}
  #fx .fx-row{display:none}
  /* le plan : trac\xE9 blanc, sans fond, pos\xE9 sur la vue */
  #fx .fx-map canvas{display:none}
  #fx .fx-map::before{inset:-12%;background:radial-gradient(closest-side,rgba(8,10,12,.34),rgba(8,10,12,.12) 55%,rgba(8,10,12,0));-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
  #fx #fx-plan .camera-spatial-surface-floor,#fx #fx-plan .camera-spatial-surface-footprint{fill:rgba(255,255,255,.07)}
  #fx #fx-plan .camera-spatial-surface-wall{fill:rgba(255,255,255,.14)}
  #fx #fx-plan .camera-spatial-surface-outline{stroke:rgba(255,255,255,.3)}
  #fx #fx-plan .camera-spatial-context{stroke:rgba(255,255,255,.28)}
  #fx #fx-plan .camera-spatial-route-edge{stroke:rgba(0,0,0,.35)}
  #fx #fx-plan .camera-spatial-route{stroke:#fff}
  #fx #fx-plan .camera-spatial-dot{fill:var(--accent)}
  #fx #fx-plan .camera-spatial-ring{stroke:#fff}
  #fx.fx-compact .fx-map{width:150px}
  #fx .fx-scrub{display:none}
  #fx .fx-map{width:220px;margin-left:auto}
  #fx #fx-plan{cursor:grab;touch-action:none}
  #fx .fx-tour{display:grid;grid-template-columns:44px 1fr;column-gap:12px;align-items:center;margin-top:2px}
  #fx .fx-tour .sep{grid-column:1/-1;height:1px;margin:16px -2px 14px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.16) 12%,rgba(255,255,255,.16) 88%,transparent)}
  #fx .fx-tour .hd{grid-column:2;display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
  #fx .fx-tour .hd b{font-size:15px;line-height:20px;font-weight:600}
  #fx .fx-tour .hd small{font-size:12px;line-height:16px;color:var(--soft)}
  #fx .fx-tour .pp{grid-row:2/span 3;grid-column:1;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#14161a!important;background:radial-gradient(120% 90% at 50% 0%,#fff,rgba(255,255,255,.86))!important;box-shadow:inset 0 0 0 .5px rgba(255,255,255,.6),0 8px 20px -8px rgba(0,0,0,.6);transition:transform .11s var(--ease)}
  #fx .fx-tour .pp:active{transform:scale(.94)}
  #fx .fx-tour .pp svg{width:15px;height:15px}
  #fx .fx-tour .trk{grid-column:2;position:relative;height:22px;display:flex;align-items:center;cursor:pointer;touch-action:none;outline:none;--v:0%}
  #fx .fx-tour .seg{display:flex;gap:3px;width:100%;height:4px;transition:height .2s var(--ease)}
  #fx .fx-tour .seg span{position:relative;flex:1;height:100%;border-radius:3px;background:rgba(255,255,255,.2);overflow:hidden}
  #fx .fx-tour .seg span::after{content:"";position:absolute;inset:0;width:var(--f,0%);background:linear-gradient(90deg,rgba(255,255,255,.82),#fff);border-radius:inherit}
  #fx .fx-tour .dot{position:absolute;left:var(--v);top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 2px #fff,0 0 0 7px color-mix(in srgb,var(--accent) 22%,transparent),0 2px 6px rgba(0,0,0,.4);transition:width .2s var(--ease),height .2s var(--ease),margin .2s var(--ease)}
  #fx .fx-tour .trk.held .seg{height:8px}
  #fx .fx-tour .trk.held .dot,#fx .fx-tour .trk:focus-visible .dot{width:18px;height:18px;margin:-9px 0 0 -9px}
  #fx .fx-tour .ends{grid-column:2;display:flex;justify-content:space-between;margin-top:4px;font-size:12px;line-height:16px;color:rgba(255,255,255,.42)}
  .fx-compact #fx-full.tour .fx-rows,.fx-compact #fx-full.tour .fx-spots{display:none!important}
  #fx-arc{display:none!important}
  /* téléphone : la fiche défile en entier, rien ne passe sous les boutons */
  #fx.fx-compact #fx-full{overflow:hidden}
  #fx.fx-compact #fx-full .fx-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;scrollbar-width:none;-webkit-mask-image:linear-gradient(#000 calc(100% - 22px),transparent);mask-image:linear-gradient(#000 calc(100% - 22px),transparent)}
  #fx.fx-compact #fx-full .fx-body::-webkit-scrollbar{display:none}
  #fx.fx-compact #fx-answer{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;scrollbar-width:none}
  /* le logo ALL prism et l'aide d'A-LL ne passent plus sous l'interface */
  html.fx-c:not(.fx-orig) #footer{position:fixed!important;left:auto!important;right:14px!important;top:calc(env(safe-area-inset-top,0px) + 26px)!important;bottom:auto!important;width:auto!important;height:auto!important;padding:0!important;margin:0!important;z-index:1;opacity:.55;pointer-events:none;transition:opacity .3s}
  html.fx-c:not(.fx-orig) #footer img{height:11px!important;width:auto!important}
  html.fx-c.fx-ai-open:not(.fx-orig) #footer{opacity:0}
  html:not(.fx-orig) #interaction-hint{display:none!important}
  /* t\xE9l\xE9phone, visite : la fiche se r\xE9duit au lecteur, le nom du lieu reste dans le fil d'Ariane */
  #fx.fx-tmini .fx-handle,#fx.fx-tmini .fx-photo,#fx.fx-tmini .fx-title,#fx.fx-tmini .fx-notes,#fx.fx-tmini .fx-rows,#fx.fx-tmini .fx-spots,#fx.fx-tmini .fx-tour .sep,#fx.fx-tmini .fx-tour .hd,#fx.fx-tmini .fx-tour .ends{display:none!important}
  #fx.fx-tmini .fx-body{padding:6px 18px 6px 6px}
  #fx.fx-tmini .fx-tour{margin:0}
  #fx.fx-tmini .fx-tour .pp{grid-row:1}
  #fx.fx-tmini .fx-tour .trk{grid-row:1;height:44px}
  /* IA au repos : une pastille ronde sur mobile, une pastille courte sur ordinateur */
  #fx .fx-pane[data-k=ai].min .fx-ai{padding:0;justify-content:center;gap:0}
  #fx .fx-pane[data-k=ai].min .fx-ai input{position:absolute;inset:0;opacity:0;width:100%;cursor:pointer}
  #fx .fx-pane[data-k=ai].min .fx-ring{opacity:.5}
  #fx-arc{position:absolute;left:0;top:0;height:64px;pointer-events:auto;touch-action:none;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .5s var(--ease),transform .5s var(--ease),visibility 0s .5s}
  #fx-arc.on{opacity:1;visibility:visible;transform:none;transition-delay:0s}
  #fx-arcsvg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;cursor:pointer}
  #fx-arc .sh{fill:none;stroke:rgba(0,0,0,.28);stroke-width:7;stroke-linecap:round;filter:blur(3px)}
  #fx-arc .tr{fill:none;stroke:rgba(255,255,255,.3);stroke-width:2;stroke-linecap:round}
  #fx-arc .pr{fill:none;stroke:#fff;stroke-width:2.5;stroke-linecap:round}
  #fx-arc .dot{fill:var(--accent);stroke:#fff;stroke-width:2.5;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))}
  #fx-arc .halo{fill:rgba(255,255,255,.16);stroke:rgba(255,255,255,.5);stroke-width:1;opacity:0;transform:scale(.5);transform-box:fill-box;transform-origin:center;transition:opacity .25s,transform .35s var(--ease)}
  #fx-arc:hover .halo,#fx-arc.held .halo{opacity:1;transform:none}
  #fx #fx-arcplay{position:absolute;left:-2px;top:2px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:#fff;background:rgba(22,24,28,.42);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);transition:background .2s}
  #fx #fx-arcplay:hover{background:rgba(255,255,255,.2)}
  #fx #fx-arcplay svg{display:block;width:11px;height:11px}
  #fx-veil{position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(90deg,rgba(8,10,12,.6),rgba(8,10,12,.2) 72%);-webkit-backdrop-filter:blur(26px) saturate(150%);backdrop-filter:blur(26px) saturate(150%);transition:opacity 1.3s var(--ease)}
  #fx-veil.on{opacity:1;transition:none}
  #fx-hero{position:absolute;left:8vw;top:50%;transform:translateY(-55%);transform-origin:0 0;pointer-events:none;color:#fff;display:none}
  #fx-hero.on{display:block}
  #fx-hero h2{font-family:${Me},-apple-system,system-ui,sans-serif;font-size:clamp(52px,9vw,132px);line-height:.95;font-weight:600;letter-spacing:-.035em;white-space:nowrap}
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
  #fx .fx-pane[data-k=ai]{--beam:conic-gradient(from 0deg,#fff 0deg,rgba(255,244,214,.95) 7deg,rgba(255,196,132,.8) 18deg,rgba(255,132,124,.5) 32deg,rgba(255,95,114,.18) 46deg,rgba(255,95,114,0) 60deg,rgba(95,141,255,0) 300deg,rgba(95,141,255,.18) 314deg,rgba(88,150,255,.5) 328deg,rgba(120,190,255,.8) 342deg,rgba(214,240,255,.95) 353deg,#fff 360deg);background:linear-gradient(115deg,rgba(95,141,255,.07),rgba(78,164,255,.05) 30%,rgba(255,255,255,.02) 50%,rgba(255,171,98,.05) 70%,rgba(255,95,114,.07)),rgba(13,14,17,.62);
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
  @media (prefers-reduced-motion:reduce){#fx .fx-pane::before{animation:none}.fx-face,.fx-body{transition:none}.fx-answer p span{animation:none;opacity:1}}
  `),
      (B.textContent = B.textContent.replace(
        /^  (\.fx-[^{]*)\{/gm,
        (e, a) =>
          "  " +
          a
            .split(",")
            .map((n) =>
              /^\.fx-orig/.test(n)
                ? n
                : /^\.fx-(compact|show)(?=[ {]|$)/.test(n)
                  ? "#fx" + n
                  : "#fx " + n,
            )
            .join(",") +
          "{",
      )),
      document.head.append(B);
    const v = document.createElement("div");
    (v.id = "fx"), (v.className = "fx-pre");
    const z = {
      back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>',
      play: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.6v10.8a.6.6 0 0 0 .92.5l8.3-5.4a.6.6 0 0 0 0-1L5.42 2.1a.6.6 0 0 0-.92.5Z"/></svg>',
      pause:
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3.4" y="2.5" width="3.3" height="11" rx="1"/><rect x="9.3" y="2.5" width="3.3" height="11" rx="1"/></svg>',
      up: '<svg class="chev" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 5-5 5 5"/></svg>',
      sep: '<svg class="sep" width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m1 1 5 5-5 5"/></svg>',
      route:
        '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 16c0-5 3-4 5-7s1-5 4-5 5 3 5 6-3 4-5 6-9 5-9 0Z"/></svg>',
      spark:
        '<svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor"><path d="M11 2.2c.5 3.9 1.9 5.3 5.8 5.8-3.9.5-5.3 1.9-5.8 5.8-.5-3.9-1.9-5.3-5.8-5.8 3.9-.5 5.3-1.9 5.8-5.8Z"/><path d="M17 13.4c.25 1.9.9 2.6 2.8 2.8-1.9.25-2.6.9-2.8 2.8-.25-1.9-.9-2.6-2.8-2.8 1.9-.25 2.6-.9 2.8-2.8Z" opacity=".7"/></svg>',
    };
    (v.innerHTML = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs id="fx-defs"><linearGradient id="fxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe0ff"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#ffdf96"/></linearGradient></defs></svg>
    <div id="fx-veil"></div><div id="fx-hero"><h2 id="fx-intro-t"></h2><p id="fx-intro-s"></p></div><nav class="fx-pane" data-k="crumb" aria-label="O\xF9 je suis"><div class="fx-face fx-crumb" id="fx-crumb"></div></nav>
    <section class="fx-pane" data-k="card" aria-live="polite">
      <div class="fx-face fx-full" id="fx-full"><div class="fx-handle" id="fx-handle" role="button" tabindex="0" aria-label="Replier la fiche"></div><div class="fx-photo" id="fx-photo"></div>
        <div class="fx-body" id="fx-body"><h1 class="fx-title" id="fx-title"></h1><p class="fx-notes" id="fx-notes"></p><dl class="fx-rows" id="fx-rows"></dl><div class="fx-spots" id="fx-spots"></div><div class="fx-tour" id="fx-tour"><i class="sep"></i><div class="hd"><b>Visite guid\xE9e</b><small id="fx-tstate">Pr\xEAte</small></div><button class="pp" id="fx-tplay" type="button" aria-label="Lecture">${z.play}</button><div class="trk" id="fx-trk" role="slider" tabindex="0" aria-label="Avancer dans la visite" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="seg" id="fx-tseg"></div><span class="dot"></span></div><div class="ends"><span>D\xE9part</span><span>Arriv\xE9e</span></div></div></div></div>
      <button class="fx-face fx-pill" id="fx-pill" type="button" aria-label="Ouvrir la fiche"></button>
    </section>
    <section class="fx-pane" data-k="mini" aria-label="Parcours guid\xE9">
      <button class="fx-face fx-pill" id="fx-mpill" type="button" aria-label="Ouvrir la visite guid\xE9e">${z.route}<span>Visite</span></button>
      <div class="fx-face fx-mini" id="fx-mfull"><header><span>Visite guid\xE9e</span><button class="fx-fold" id="fx-stop" type="button" aria-label="Replier la visite">${z.sep}</button></header><div class="fx-map" id="fx-mapbox"><canvas id="fx-decor" width="2" height="2"></canvas><div id="fx-plan"></div></div>
        <div class="fx-scrub" id="fx-scrub" role="slider" tabindex="0" aria-label="Avancer dans la visite" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="fx-track"><b></b></i><span class="fx-knob" id="fx-knob"></span></div><span class="fx-pct" id="fx-pct"></span></div>
    </section>
    <section class="fx-pane" data-k="answer" aria-live="polite"><div class="fx-face on fx-answer" id="fx-answer"><div class="who"><span id="fx-who">Suggestions</span><span>R\xE9ponses d'exemple</span></div><p id="fx-text" hidden></p><div id="fx-places"></div><div id="fx-chips"></div></div></section>
    <form class="fx-pane" data-k="ai" autocomplete="off"><i class="fx-bloom"><u><b></b><b></b></u></i><i class="fx-ring"><u><b></b><b></b></u></i><div class="fx-face on fx-ai">${z.spark}<input id="fx-ask" type="text" placeholder="Demander \xE0 l'IA\u2026" aria-label="Demander \xE0 l'IA"></div></form>
    <div id="fx-arc" aria-hidden="false"><svg id="fx-arcsvg"><path class="sh"/><path class="tr"/><path class="pr"/><g class="kn"><circle class="halo" r="16"/><circle class="dot" r="7"/></g></svg><button id="fx-arcplay" type="button" aria-label="Lecture"></button></div>
    <button id="fx-grab" type="button" aria-label="Replier la fiche"><b></b><i></i></button>
    <div id="fx-auto">Visite automatique. Touchez l'\xE9cran pour reprendre la main.</div>
    <div id="fx-modes" role="group" aria-label="Version de l'interface"><button type="button" data-m="off">Origine</button><button type="button" data-m="liquid">Liquide</button><button type="button" data-m="show">Showroom</button></div>`),
      document.body.append(v);
    const r = (e) => v.querySelector("#" + e),
      Ee = {};
    function dt(e, a, n, i, s, p) {
      if (!xt) return "";
      (a = Math.round(a)), (n = Math.round(n)), (i = Math.min(i, a / 2, n / 2));
      const o = "fxl-" + e,
        x = [a, n, Math.round(i), s, p].join("_");
      if (Ee[e] === x) return `url(#${o}) `;
      Ee[e] = x;
      const f = document.createElement("canvas");
      (f.width = a), (f.height = n);
      const l = f.getContext("2d"),
        c = l.createImageData(a, n),
        h = c.data;
      for (let m = 0; m < n; m++)
        for (let y = 0; y < a; y++) {
          const C = y + 0.5 - a / 2,
            g = m + 0.5 - n / 2,
            $ = Math.abs(C) - (a / 2 - i),
            I = Math.abs(g) - (n / 2 - i),
            R = Math.max($, 0),
            O = Math.max(I, 0),
            ne = Math.hypot(R, O),
            zt = ne + Math.min(Math.max($, I), 0) - i;
          let ye = 0,
            ke = 0;
          ne > 0
            ? ((ye = (R / ne) * Math.sign(C)), (ke = (O / ne) * Math.sign(g)))
            : $ > I
              ? (ye = Math.sign(C))
              : (ke = Math.sign(g));
          const lt = M(1 + zt / s, 0, 1),
            pt = lt * lt,
            ie = (m * a + y) * 4;
          (h[ie] = 128 + ye * pt * 127),
            (h[ie + 1] = 128 + ke * pt * 127),
            (h[ie + 2] = 128),
            (h[ie + 3] = 255);
        }
      l.putImageData(c, 0, 0);
      let d = v.querySelector("#" + o);
      return (
        d ||
          ((d = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "filter",
          )),
          (d.id = o),
          d.setAttribute("color-interpolation-filters", "sRGB"),
          d.setAttribute("x", "0"),
          d.setAttribute("y", "0"),
          d.setAttribute("width", "100%"),
          d.setAttribute("height", "100%"),
          r("fx-defs").append(d)),
        (d.innerHTML = `<feImage href="${f.toDataURL()}" x="0" y="0" width="${a}" height="${n}" result="m" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="m" scale="${p}" xChannelSelector="R" yChannelSelector="G"/>`),
        `url(#${o}) `
      );
    }
    const gt = {
        x: [260, 30],
        y: [260, 30],
        w: [220, 28],
        h: [220, 28],
        r: [220, 28],
        p: [200, 28],
      },
      E = {};
    for (const e of v.querySelectorAll(".fx-pane"))
      E[e.dataset.k] = {
        el: e,
        cur: { x: 0, y: 0, w: 1, h: 1, r: 0, p: 0 },
        vel: { x: 0, y: 0, w: 0, h: 0, r: 0, p: 0 },
        tgt: { x: 0, y: 0, w: 1, h: 1, r: 0, p: 0 },
        fresh: !0,
        still: 0,
      };
    const ut = {
      crumb: [14, 64, 5],
      card: [34, 96, 18],
      mini: [24, 70, 12],
      answer: [30, 84, 18],
      ai: [16, 72, 6],
    };
    function ht(e, a) {
      const n = E[e],
        i = n.cur,
        s = n.tgt;
      let p = 0;
      if (n.rest) return;
      n.fresh && (Object.assign(i, s, { p: 0 }), (n.fresh = !1));
      for (const g in i) {
        if (oe) {
          i[g] = s[g];
          continue;
        }
        const [$, I] = gt[g];
        (n.vel[g] += (-$ * (i[g] - s[g]) - I * n.vel[g]) * a),
          (i[g] += n.vel[g] * a),
          (p += Math.abs(n.vel[g]));
      }
      (i.w = Math.max(i.w, 1)), (i.h = Math.max(i.h, 1));
      const o = n.el.style,
        x = Math.min(i.r, i.w / 2, i.h / 2),
        f = t.z;
      (o.transform = `translate3d(${(i.x * f).toFixed(2)}px,${(i.y * f).toFixed(2)}px,0) scale(${f})`),
        (o.width = i.w.toFixed(1) + "px"),
        (o.height = i.h.toFixed(1) + "px"),
        (o.borderRadius = x.toFixed(1) + "px"),
        (o.opacity = M((i.p - 0.3) / 0.6, 0, 1).toFixed(3)),
        n.el.classList.toggle("off", s.p < 0.5),
        (n.still = p < 6 ? n.still + a : 0);
      const [l, c, h] = ut[e],
        d = t.show ? Math.round(h * 1.5) : t.compact ? Math.min(h, 10) : h,
        m =
          n.still > 0.12 && i.p > 0.9
            ? dt(e, s.w, s.h, s.r, l, c)
            : n.lens && p < 60
              ? n.lens
              : "";
      n.still > 0.12 && (n.lens = m);
      const y = `${m}blur(${d}px) saturate(170%)`;
      n.bf !== y &&
        ((n.bf = y),
        (o.backdropFilter = y),
        (o.webkitBackdropFilter = `blur(${d}px) saturate(170%)`)),
        (o.visibility = i.p < 0.02 && s.p < 0.5 ? "hidden" : "visible");
      let C = 0;
      for (const g in i) C = Math.max(C, Math.abs(i[g] - s[g]));
      n.still > 0.4 && C < 0.05 && (n.rest = !0);
    }
    const L = {
        panel: k("#poi-card-panel"),
        close: k("#poi-card-close-button"),
        ctrl: k(".camera-spatial-control"),
      },
      N =
        (document.title.split("|").pop() || "").trim() || "Vue d\u2019ensemble",
      t = {
        open: !1,
        level: 0,
        trail: [N],
        eyebrow: "",
        title: "",
        facts: [],
        photo: "",
        hasTour: !1,
        touring: !1,
        prog: 0,
        playing: !1,
        cardOpen: !0,
        ai: "idle",
        W: 0,
        H: 0,
        compact: !1,
        key: "",
        mode: "liquid",
        show: !1,
        z: 1,
        auto: !1,
        intro: "wait",
        miniOpen: !0,
      },
      bt = (e) =>
        (e || "")
          .trim()
          .toLowerCase()
          .replace(/(^|[\s\-:])(\p{L})/gu, (a, n, i) => n + i.toUpperCase());
    function Ae() {
      const e = L.panel || (L.panel = k("#poi-card-panel"));
      if (!e) return !1;
      L.close = L.close || k("#poi-card-close-button");
      const a = e.dataset.open === "true",
        n = (g) => g && getComputedStyle(g).display !== "none",
        i = (k("#poi-card-title")?.textContent || "").trim(),
        s = n(k("#poi-card-eyebrow"))
          ? k("#poi-card-eyebrow").textContent.trim()
          : "",
        o = [k("#poi-card-bullets"), k("#poi-card-text")]
          .filter(n)
          .map((g) => g.innerText)
          .join(
            `
`,
          )
          .split(/\n|•/)
          .map((g) => g.trim())
          .filter(Boolean),
        x = k("#poi-card-image"),
        f = n(x) ? x.currentSrc || x.src : "",
        l = (L.ctrl = L.ctrl || k(".camera-spatial-control")),
        c =
          !!l &&
          !l.hasAttribute("hidden") &&
          getComputedStyle(l).display !== "none",
        h = l && l.querySelector(".camera-spatial-handle"),
        d = (h && parseFloat(h.getAttribute("aria-valuenow") || "0")) || 0,
        m = [a, i, s, o.length, f, c].join("|");
      if (
        (Math.abs(d - t.prog) > 1e-4 && (t.lastMove = performance.now()),
        (t.prog = d),
        (t.playing = performance.now() - (t.lastMove || 0) < 700),
        m === t.key)
      )
        return !1;
      (t.key = m),
        t.compact && i !== t.title && (t.cardOpen = !1),
        (t.open = a && !!i),
        (t.eyebrow = s),
        (t.title = i),
        (t.facts = o),
        (t.photo = f);
      const C = t.hasTour;
      if (
        ((t.hasTour = c && t.open),
        t.compact && t.hasTour && !C && (t.cardOpen = !0),
        !t.open)
      )
        (t.level = 0), (t.trail = [N]), (t.touring = !1);
      else {
        const g = !!s && s.toLowerCase() !== N.toLowerCase();
        (t.level = g ? 2 : 1),
          (t.trail = g ? [N, bt(s), i] : [N, i]),
          t.hasTour || (t.touring = !1);
      }
      return !0;
    }
    const Te = (e = 1) => {
        for (let a = 0; a < e; a++) setTimeout(() => L.close?.click(), a * 450);
      },
      mt = () => L.ctrl?.querySelector(".camera-spatial-transport")?.click();
    let Ce = 0;
    const ze = (e) =>
      e
        .trim()
        .replace(/^[◦\-–·]\s*/, "")
        .replace(/\.$/, "")
        .replace(/(\d)\s?%/g, "$1\u202F%")
        .replace(/\bm2\b/g, "m\xB2")
        .replace(/(\d)\s(m|m²|km|s|min|sec)\b/g, "$1\u202F$2")
        .replace(/\(Conforme Lhand\)/i, "(conforme LHand)");
    function K(e) {
      const a = r("fx-crumb");
      if (((a.innerHTML = ""), t.trail.length > 1)) {
        const i = document.createElement("button");
        (i.className = "back"),
          (i.innerHTML = z.back),
          i.setAttribute(
            "aria-label",
            "Retour \xE0 " + t.trail[t.trail.length - 2],
          ),
          (i.onclick = () => {
            (t.touring = !1), Te(1);
          }),
          a.append(i);
      }
      t.trail.forEach((i, s) => {
        const p = s === t.trail.length - 1;
        s && a.insertAdjacentHTML("beforeend", z.sep);
        const o = document.createElement("button");
        (o.textContent = i),
          (o.className =
            (p ? "here" : "anc") + (t.trail.length === 1 ? " root" : "")),
          p ||
            (o.onclick = () => {
              (t.touring = !1), Te(t.trail.length - 1 - s);
            }),
          a.append(o);
      });
      const n = () => {
        r("fx-title").textContent = t.title;
        const i = [],
          s = [];
        for (const l of t.facts) {
          const c = l.match(/^([^:]{2,40}?)\s*:\s*(.+)$/);
          c ? i.push([c[1].trim(), ze(c[2])]) : s.push(ze(l));
        }
        (r("fx-notes").textContent = s.join(". ") + (s.length ? "." : "")),
          (r("fx-notes").style.display = s.length ? "" : "none");
        const p = r("fx-rows");
        (p.innerHTML = ""), (p.style.display = i.length ? "" : "none");
        for (const [l, c] of i) {
          const h = document.createElement("div"),
            d = document.createElement("dt"),
            m = document.createElement("dd");
          (d.textContent = l), (m.textContent = c), h.append(d, m), p.append(h);
        }
        const o = r("fx-spots");
        o.innerHTML = "";
        const x = t.level === 1 ? Ve(t.title) : null,
          f = x ? Ue.filter((l) => l.visibilityGroupId === x.id) : [];
        if (((o.style.display = f.length ? "" : "none"), f.length)) {
          const l = document.createElement("h3");
          (l.textContent =
            f.length > 1
              ? `${f.length} points \xE0 voir ici`
              : "\xC0 voir ici"),
            o.append(l);
          for (const h of f) {
            const d = document.createElement("div");
            (d.className = "fx-spot"),
              (d.innerHTML = "<b></b><span></span>"),
              (d.querySelector("span").textContent = h.label),
              o.append(d);
          }
          const c = document.createElement("p");
          (c.className = "fx-hint"),
            (c.id = "fx-hint"),
            (c.textContent =
              f.length > 1
                ? "Touchez un point coloré dans la vue pour y entrer."
                : "Touchez le point coloré dans la vue pour y entrer."),
            o.append(c);
        }
        (r("fx-rows").style.maxHeight = t.compact
          ? "none"
          : Math.round(t.H * (f.length ? 0.2 : 0.3)) + "px"),
          (r("fx-photo").style.display = t.photo ? "" : "none"),
          t.photo &&
            (r("fx-photo").style.backgroundImage = `url("${t.photo}")`),
          (r("fx-tour").style.display = t.hasTour ? "" : "none"),
          r("fx-full").classList.toggle("tour", t.hasTour),
          Oe(),
          (r("fx-pill").innerHTML =
            `<b></b><span>${t.title}</span>${t.touring ? "<small>Parcours en cours</small>" : ""}${z.up}`),
          F(),
          w();
      };
      clearTimeout(Ce),
        e && !oe && t.open
          ? (r("fx-body").classList.add("out"),
            (Ce = setTimeout(() => {
              n(), r("fx-body").classList.remove("out");
            }, 170)))
          : n();
    }
    const b = {};
    function F() {
      (t.win = !1),
        (t.compact = innerWidth < 640),
        (t.show = t.mode === "show" && !t.compact),
        (t.z = t.show
          ? M(Math.min(innerWidth / 1280, innerHeight / 720) * 1.25, 1.12, 2.2)
          : 1);
      const e = window.visualViewport;
      (t.kb = !!(t.compact && e && innerHeight - e.height > 120)),
        (v.style.transform = t.kb
          ? `translate3d(0,${Math.round(e.offsetTop)}px,0)`
          : ""),
        (v.style.height = t.kb ? Math.round(e.height) + "px" : ""),
        (v.style.bottom = t.kb ? "auto" : ""),
        (t.W = innerWidth / t.z),
        (t.H = (t.kb ? e.height : innerHeight) / t.z),
        v.classList.toggle("fx-compact", t.compact),
        v.classList.toggle("fx-show", t.show);
      const a = t.compact ? t.W - 16 : 328,
        n = t.compact ? 150 : 220;
      (r("fx-full").style.width = (t.compact && t.hasTour ? a - 64 : a) + "px"),
        (r("fx-mfull").style.width = n + "px"),
        (r("fx-pill").style.width = t.compact ? a - 64 + "px" : ""),
        v.classList.toggle("fx-tmini", t.compact && t.hasTour),
        (r("fx-answer").style.width =
          (t.compact ? t.W - 16 : Math.min(460, t.W - 40)) + "px"),
        (r("fx-rows").style.maxHeight = t.compact
          ? "none"
          : Math.round(t.H * 0.3) + "px"),
        (r("fx-full").style.maxHeight = t.compact
          ? Math.round(t.H * 0.58) + "px"
          : ""),
        (r("fx-answer").style.maxHeight = t.compact
          ? Math.max(160, Math.round(t.H - 10 - 52 - 8 - 12)) + "px"
          : ""),
        document.documentElement.classList.toggle("fx-c", t.compact),
        (b.crumb = r("fx-crumb").offsetWidth),
        (b.full = r("fx-full").offsetHeight),
        (b.pill = r("fx-pill").offsetWidth),
        (b.mpill = r("fx-mpill").offsetWidth),
        (b.mfull = r("fx-mfull").offsetHeight),
        (b.answer = r("fx-answer").offsetHeight),
        (b.cw = a),
        (b.mw = n);
    }
    const X = (e, a) => r(e).classList.toggle("on", a);
    function w() {
      const { W: e, H: a } = t,
        n = {},
        i = t.compact && t.hasTour,
        s = (t.open && t.cardOpen && !t.touring) || i,
        p = t.ai !== "idle",
        o = t.hasTour,
        x = o;
      if (
        (X("fx-full", s),
        X("fx-pill", !s),
        X("fx-mfull", x),
        X("fx-mpill", !x),
        t.compact)
      ) {
        (n.crumb = { x: 10, y: 10, w: b.crumb, h: 44, r: 22, p: 1 }),
          (t.kb || p) && (n.crumb.p = 0);
        const l = a - 8 - 52,
          c = a - 8 - 56,
          h = e - 16 - 64;
        if (
          ((n.ai = p
            ? { x: 8, y: 10, w: e - 16, h: 52, r: 26, p: 1 }
            : { x: e - 8 - 56, y: c, w: 56, h: 56, r: 28, p: 1 }),
          i)
        )
          n.card = { x: 8, y: c, w: h, h: 56, r: 28, p: t.open && !p ? 1 : 0 };
        else if (s) {
          const g = Math.min(b.full, a * 0.58);
          n.card = {
            x: 8,
            y: c - 8 - g,
            w: e - 16,
            h: g,
            r: 32,
            p: t.open && !p ? 1 : 0,
          };
        } else
          n.card = { x: 8, y: c, w: h, h: 56, r: 28, p: t.open && !p ? 1 : 0 };
        const d = t.open && !p ? n.card.y : l,
          m = b.mfull,
          y = 150,
          C = o && !p;
        (n.mini = { x: e - 8 - y, y: 62, w: y, h: m, r: 0, p: C ? 1 : 0 }),
          (t.arcBox = null),
          (n.answer = {
            x: 8,
            y: 10 + 52 + 8,
            w: e - 16,
            h: b.answer,
            r: 28,
            p: p ? 1 : 0,
          });
      } else {
        const f = t.show,
          l = f ? 28 : 20,
          c = a - l;
        n.crumb = { x: l, y: l, w: b.crumb, h: 44, r: 22, p: 1 };
        const h = f && s,
          d = s ? Math.min(b.full, a - (f ? 150 : 110)) : 48,
          m = s ? 328 : b.pill;
        n.card = h
          ? {
              x: Math.max(l, Math.round(e * 0.06)),
              y: Math.max(l + 60, Math.round((a - d) / 2 - 14)),
              w: m,
              h: d,
              r: 40,
              p: 1,
            }
          : { x: l, y: c - d, w: m, h: d, r: s ? 28 : 24, p: t.open ? 1 : 0 };
        const y = 220,
          C = b.mfull,
          g = o && !p;
        n.mini = { x: e - l - y, y: l + 60, w: y, h: C, r: 0, p: g ? 1 : 0 };
        const $ = t.open ? n.card.x + m + 16 : l,
          I = e - l - 100,
          R = Math.max(48, Math.min(p ? 480 : 236, I - $));
        n.ai = {
          x: M(e / 2 - R / 2, $, Math.max($, I - R)),
          y: c - 52,
          w: R,
          h: 52,
          r: 26,
          p: 1,
        };
        const O = Math.min(460, e - 40);
        (n.answer = {
          x: M(n.ai.x + R / 2 - O / 2, Math.min($, e - l - O), e - l - O),
          y: n.ai.y - 12 - b.answer,
          w: O,
          h: b.answer,
          r: 28,
          p: p ? 1 : 0,
        }),
          (t.win = h);
      }
      if (
        (p ||
          Object.assign(n.answer, {
            x: n.ai.x,
            y: n.ai.y - 4,
            w: n.ai.w,
            h: 44,
          }),
        t.intro !== "done")
      )
        for (const f in n) n[f].p = 0;
      if ((X("fx-crumb", t.intro === "done"), !t.compact)) {
        const f = t.hasTour && !p,
          l = t.open ? n.card.x + n.card.w + 24 : 24,
          c = e - 24,
          h = Math.min(620, c - l);
        t.arcBox = null;
      }
      {
        const f = r("fx-arc"),
          l = t.arcBox;
        f.classList.toggle("on", !!l),
          l &&
            ((f.style.transform = ""),
            (f.style.left = l.x * t.z + "px"),
            (f.style.top = l.y * t.z + "px"),
            (f.style.width = l.w * t.z + "px"),
            t.arcShape && t.arcShape(Math.round(l.w * t.z)));
      }
      for (const f in n) Object.assign(E[f].tgt, n[f]), (E[f].rest = !1);
      document.documentElement.classList.toggle("fx-ai-open", t.ai !== "idle"),
      E.ai.el.classList.toggle("glow", t.ai === "thinking"),
        E.ai.el.classList.toggle("min", t.compact && !p);
    }
    (r("fx-pill").onclick = () => {
      t.touring && ((t.touring = !1), t.playing && mt()),
        (t.cardOpen = !0),
        K(!1);
    }),
      (r("fx-handle").onclick = () => {
        (t.cardOpen = !1), w();
      });
    const St = () => {
      (t.autoPlay = !0), w();
    };
    r("fx-mpill").onclick = () => {
      (t.miniOpen = !0), w();
    };
    const A = r("fx-scrub"),
      re = r("fx-knob");
    let u = null,
      Se = 0,
      T = !1,
      S = null;
    const _ = () => {
        (t.autoPlay = !t.autoPlay), t.autoPlay && t.prog >= 0.995 && (u = 0);
      },
      Q = (e) => {
        A.style.setProperty("--v", (M(e, 0, 1) * 100).toFixed(2) + "%"),
          A.setAttribute("aria-valuenow", Math.round(e * 100));
      },
      Pe = (e) => {
        const a = A.getBoundingClientRect();
        return M((e.clientX - a.left - 16) / Math.max(1, a.width - 32), 0, 1);
      },
      vt = (e) => {
        const a = L.ctrl && L.ctrl.querySelector(".camera-spatial-handle");
        if (a)
          for (const n of ["keydown", "keyup"])
            a.dispatchEvent(
              new KeyboardEvent(n, { key: e, bubbles: !0, cancelable: !0 }),
            );
      };
    A.addEventListener("pointerdown", (e) => {
      e.stopPropagation(),
        A.setPointerCapture(e.pointerId),
        (S = { x: e.clientX, onKnob: re.contains(e.target), moved: !1 }),
        A.classList.add("held"),
        S.onKnob || ((t.autoPlay = !1), (T = !0), (u = Pe(e)), Q(u));
    }),
      A.addEventListener("pointermove", (e) => {
        S &&
          (Math.abs(e.clientX - S.x) > 4 && (S.moved = !0),
          (S.moved || !S.onKnob) &&
            ((t.autoPlay = !1), (T = !0), (u = Pe(e)), Q(u)));
      });
    const $e = () => {
      S && S.onKnob && !S.moved && _(),
        (S = null),
        (T = !1),
        A.classList.remove("held");
    };
    A.addEventListener("pointerup", $e),
      A.addEventListener("pointercancel", $e),
      A.addEventListener("keydown", (e) => {
        e.stopPropagation();
        const a = {
          ArrowRight: 0.05,
          ArrowLeft: -0.05,
          ArrowUp: 0.05,
          ArrowDown: -0.05,
        }[e.key];
        a !== void 0
          ? (e.preventDefault(),
            (t.autoPlay = !1),
            (u = M(t.prog + a, 0, 1)),
            Q(u))
          : (e.key === " " || e.key === "Enter") && (e.preventDefault(), _());
      }),
      A.addEventListener("keyup", (e) => e.stopPropagation());
    const He = r("fx-arc"),
      H = r("fx-arcsvg"),
      [wt, G, se] = H.querySelectorAll("path"),
      yt = H.querySelector(".kn");
    let U = 0,
      le = !1,
      De = 0;
    const kt = (e) => {
        if (e === De) return;
        De = e;
        const a = `M 44,14 Q ${(e + 44) / 2},58 ${e - 14},14`;
        for (const n of [wt, G, se]) n.setAttribute("d", a);
        (U = G.getTotalLength()), (se.style.strokeDasharray = U + " " + U);
      },
      qe = (e) => {
        if (!U) return;
        (e = M(e, 0, 1)),
          (se.style.strokeDashoffset = (U * (1 - e)).toFixed(1));
        const a = G.getPointAtLength(U * e);
        yt.setAttribute(
          "transform",
          `translate(${a.x.toFixed(1)},${a.y.toFixed(1)})`,
        );
      },
      Lt = (e, a, n) => {
        const i = e.getTotalLength();
        let s = 0,
          p = 1e9;
        for (let o = 0; o <= 160; o++) {
          const x = e.getPointAtLength((i * o) / 160),
            f = (x.x - a) ** 2 + (x.y - n) ** 2;
          f < p && ((p = f), (s = o / 160));
        }
        return s;
      },
      Mt = (e, a) => {
        const n = e.getScreenCTM();
        return n
          ? new DOMPoint(a.clientX, a.clientY).matrixTransform(n.inverse())
          : null;
      },
      pe = (e, a, n) => {
        const i = Mt(a, n);
        i && ((t.autoPlay = !1), (T = !0), (u = Lt(e, i.x, i.y)), qe(u));
      };
    H.addEventListener("pointerdown", (e) => {
      e.stopPropagation(),
        H.setPointerCapture(e.pointerId),
        (le = !0),
        He.classList.add("held"),
        pe(G, H, e);
    }),
      H.addEventListener("pointermove", (e) => {
        le && pe(G, H, e);
      });
    const Fe = () => {
      (le = !1), (T = !1), He.classList.remove("held");
    };
    H.addEventListener("pointerup", Fe),
      H.addEventListener("pointercancel", Fe),
      (t.arcShape = kt),
      (r("fx-arcplay").onclick = (e) => {
        e.stopPropagation(), _();
      });
    const W = r("fx-plan");
    let fe = !1;
    const Ie = (e) => {
      const a = W.querySelector("svg"),
        n = a && a.querySelector(".camera-spatial-route");
      n && pe(n, a, e);
    };
    W.addEventListener("pointerdown", (e) => {
      e.stopPropagation(), W.setPointerCapture(e.pointerId), (fe = !0), Ie(e);
    }),
      W.addEventListener("pointermove", (e) => {
        fe && Ie(e);
      });
    const je = () => {
      (fe = !1), (T = !1);
    };
    W.addEventListener("pointerup", je),
      W.addEventListener("pointercancel", je);
    const P = r("fx-trk"),
      Z = r("fx-tseg");
    let J = [1],
      xe = !1,
      Re = "";
    function Oe() {
      const e = L.ctrl && L.ctrl.querySelector(".camera-spatial-route"),
        a = (e && (e.getAttribute("d") || e.getAttribute("points"))) || "";
      if (a === Re && Z.children.length) return;
      Re = a;
      const n = (a.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || []).map(Number),
        i = [];
      for (let o = 0; o + 1 < n.length; o += 2) i.push([n[o], n[o + 1]]);
      let s = [];
      if (!/[CQSA]/i.test(a))
        for (let o = 1; o < i.length; o++) {
          const x = Math.hypot(i[o][0] - i[o - 1][0], i[o][1] - i[o - 1][1]);
          x > 0.5 && s.push(x);
        }
      const p = s.reduce((o, x) => o + x, 0);
      (J = s.length > 1 && s.length < 9 && p > 0 ? s.map((o) => o / p) : [1]),
        (Z.innerHTML = J.map(
          (o) => `<span style="flex:${o.toFixed(4)}"></span>`,
        ).join(""));
    }
    const ee = (e) => {
        e = M(e, 0, 1);
        let a = 0,
          n = 0;
        const i = Z.children;
        J.forEach((p, o) => {
          const x = i[o];
          if (!x) return;
          const f = M((e - a) / p, 0, 1);
          x.style.setProperty("--f", (f * 100).toFixed(1) + "%"),
            e > a + 1e-6 && (n = o),
            (a += p);
        });
        const s = (J.length - 1) * 3;
        P.style.setProperty(
          "--v",
          `calc(${(e * 100).toFixed(2)}% - ${(e * s).toFixed(1)}px + ${n * 3}px)`,
        ),
          P.setAttribute("aria-valuenow", Math.round(e * 100));
      },
      Be = (e) => {
        const a = Z.getBoundingClientRect();
        return M((e.clientX - a.left) / Math.max(1, a.width), 0, 1);
      };
    P.addEventListener("pointerdown", (e) => {
      e.stopPropagation(),
        P.setPointerCapture(e.pointerId),
        (xe = !0),
        P.classList.add("held"),
        (t.autoPlay = !1),
        (T = !0),
        (u = Be(e)),
        ee(u);
    }),
      P.addEventListener("pointermove", (e) => {
        xe && ((u = Be(e)), ee(u));
      });
    const Ne = () => {
      (xe = !1), (T = !1), P.classList.remove("held");
    };
    P.addEventListener("pointerup", Ne),
      P.addEventListener("pointercancel", Ne),
      P.addEventListener("keydown", (e) => {
        e.stopPropagation();
        const a = {
          ArrowRight: 0.05,
          ArrowLeft: -0.05,
          ArrowUp: 0.05,
          ArrowDown: -0.05,
        }[e.key];
        a !== void 0
          ? (e.preventDefault(),
            (t.autoPlay = !1),
            (u = M(t.prog + a, 0, 1)),
            ee(u))
          : (e.key === " " || e.key === "Enter") && (e.preventDefault(), _());
      }),
      P.addEventListener("keyup", (e) => e.stopPropagation()),
      (r("fx-tplay").onclick = (e) => {
        e.stopPropagation(), _();
      });
    const Et = (e) => {
      if (
        (t.autoPlay &&
          !T &&
          (u == null || u > 0.01) &&
          (t.prog >= 0.995
            ? (t.autoPlay = !1)
            : (u = Math.min(1, t.prog + 0.02))),
        u == null || e - Se < 70)
      )
        return;
      const a = u - t.prog;
      if (Math.abs(a) < 0.006) {
        T || (u = null);
        return;
      }
      (Se = e),
        vt(
          u < 0.005
            ? "Home"
            : u > 0.995
              ? "End"
              : a >= 0.1
                ? "PageUp"
                : a <= -0.1
                  ? "PageDown"
                  : a > 0
                    ? "ArrowRight"
                    : "ArrowLeft",
        );
    };
    r("fx-grab").onclick = () => {
      (t.cardOpen = !1), w();
    };
    const j = new URLSearchParams(location.search);
    let D = [],
      Ue = [],
      ce = -1;
    const We = (e) => e.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""),
      de = (e) => {
        try {
          return (
            window.unityInstance.SendMessage(
              (window.getUnityGameObjectName &&
                window.getUnityGameObjectName()) ||
                "ALL Prism Core",
              "SelectSelectableTarget",
              JSON.stringify({
                type: "allprism.selectableTargetRequest",
                source: "wrapper-selectable-target-menu",
                action: "focus",
                targetId: e,
                instanceId: j.get("instanceId") || "",
                experienceId: j.get("experienceId") || "",
                embedKey: j.get("embedKey") || "",
              }),
            ),
            (t.cardOpen = !0),
            !0
          );
        } catch {
          return !1;
        }
      },
      Ve = (e) => {
        const a = We(e);
        let n = null,
          i = 0;
        for (const s of D) {
          const p = We(s.label)
            .split(/[^a-z0-9]+/)
            .filter(
              (o) =>
                o.length > 3 &&
                o !== "halte" &&
                o !== "gare" &&
                o !== "station" &&
                o !== "acces",
            )
            .filter((o) => a.includes(o)).length;
          p > i && ((i = p), (n = s));
        }
        return n;
      },
      Ye = () => {
        const e = r("fx-places");
        e.innerHTML = "";
        for (const a of D) {
          const n = document.createElement("button");
          (n.type = "button"),
            (n.className = "fx-place"),
            (n.textContent = a.label),
            (n.onclick = () => he("Aller \xE0 " + a.label)),
            e.append(n);
        }
      };
    j.get("config") &&
      fetch(j.get("config"))
        .then((e) => e.json())
        .then((e) => {
          (D = ((e.selectableTargetMenu || {}).targets || []).filter(
            (a) => a && a.id && a.label,
          )),
            Ye(),
            et(),
            K(!1);
        })
        .catch(() => {}),
      j.get("manifestUrl") &&
        fetch(j.get("manifestUrl"))
          .then((e) => e.json())
          .then((e) => {
            (Ue = (e.hotspots || []).filter((a) => a && a.id && a.label)),
              K(!1);
          })
          .catch(() => {});
    const At = (e) => {
        const a = t.title;
        de(e.id),
          setTimeout(() => {
            const n = r("fx-hint");
            t.title === a &&
              n &&
              ((n.textContent = `Touchez \xAB ${e.label} \xBB dans la vue pour y entrer.`),
              (n.hidden = !1),
              F(),
              w());
          }, 2600);
      },
      q = r("fx-ask");
    let ge = 0;
    E.ai.el.addEventListener("click", () => q.focus());
    const ue = (e) => {
        const a = r("fx-chips");
        a.innerHTML = "";
        for (const n of e) {
          const i = document.createElement("button");
          (i.type = "button"),
            (i.className = "fx-chip"),
            (i.textContent = n),
            (i.onclick = () => he(n)),
            a.append(i);
        }
      },
      Ke = () =>
        t.open
          ? [
              "R\xE9sume cette fiche en une phrase",
              "Quelles sont les dimensions du quai ?",
            ]
          : [
              "Combien de gares compte le trac\xE9 ?",
              "Par o\xF9 commencer la visite ?",
            ];
    function Tt(e) {
      if (/résume/i.test(e) && t.facts.length)
        return `${t.title} : ${t.facts.slice(0, 3).join(", ").toLowerCase()}.`;
      if (/dimension|quai/i.test(e)) {
        const n = t.facts.find(
          (i) => /\d+\s?m/.test(i) && /quai|long/i.test(i),
        );
        if (n) return `D'apr\xE8s la fiche : ${n.toLowerCase()}.`;
      }
      const a = Ve(e);
      return a && /aller|va |emm|montre|voir|direction/i.test(e + " ")
        ? (setTimeout(() => de(a.id), 500),
          setTimeout(() => be(), 2600),
          `En route pour ${a.label}.`)
        : /combien/i.test(e)
          ? `${D.length || "Plusieurs"} gares sont sur le trac\xE9. Choisissez-en une ci-dessous, ou touchez son \xE9tiquette dans la vue.`
          : /commencer/i.test(e)
            ? "Commencez par une gare sur la vue d\u2019ensemble, puis ouvrez un point : certains proposent un parcours guid\xE9."
            : "Je suis une d\xE9monstration : je r\xE9ponds \xE0 partir du texte de la fiche ouverte. Essayez une des questions propos\xE9es.";
    }
    function he(e) {
      (e = (e || q.value).trim()),
        e &&
          ((q.value = e),
          (t.ai = "thinking"),
          (r("fx-who").textContent = "Recherche"),
          (r("fx-text").hidden = !1),
          (r("fx-text").textContent = "\xA0"),
          ue([]),
          F(),
          w(),
          clearTimeout(ge),
          (ge = setTimeout(
            () => {
              (t.ai = "answer"), (r("fx-who").textContent = "R\xE9ponse");
              const a = r("fx-text");
              (a.innerHTML = ""),
                Tt(e)
                  .split(" ")
                  .forEach((n, i) => {
                    const s = document.createElement("span");
                    (s.style.animationDelay = i * 38 + "ms"),
                      (s.textContent = n + " "),
                      a.append(s);
                  }),
                (q.value = ""),
                ue(Ke().filter((n) => n !== e)),
                F(),
                w();
            },
            oe ? 80 : 1200,
          )));
    }
    E.ai.el.addEventListener("pointerdown", () => {
      t.ai === "idle" && q.focus();
    }),
      q.addEventListener("focus", () => {
        kbSettle(),
        t.ai === "idle" &&
          ((t.ai = "suggest"),
          (r("fx-who").textContent = "Suggestions"),
          (r("fx-text").hidden = !0),
          Ye(),
          ue(Ke()),
          F(),
          w());
      }),
      v.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault(), he();
      });
    const be = () => {
        t.ai !== "idle" &&
          (clearTimeout(ge), (t.ai = "idle"), (q.value = ""), q.blur(), w());
      },
      Xe = (e) => {
        e.key === "Escape" && be();
      },
      _e = (e) => {
        v.contains(e.target) || be();
      };
    addEventListener("keydown", Xe), addEventListener("pointerdown", _e, !0);
    for (const e of ["keydown", "keyup", "keypress"])
      q.addEventListener(e, (a) => a.stopPropagation());
    q.addEventListener("blur", () => kbSettle());
    for (const e of ["wheel", "touchmove"])
      for (const k of ["fx-body", "fx-answer"])
        r(k).addEventListener(e, (a) => a.stopPropagation(), { passive: !0 });
    const Ge = document.documentElement,
      Qe = (e) => {
        (t.mode = e), Ge.classList.toggle("fx-orig", e === "off");
        for (const a of r("fx-modes").children)
          a.setAttribute("aria-pressed", String(a.dataset.m === e));
        try {
          sessionStorage.setItem("fx-mode", e);
        } catch {}
        (t.idleAt = performance.now()), Ze(), F(), w();
      },
      Ze = () => {
        t.auto && ((t.auto = !1), r("fx-auto").classList.remove("on"));
      };
    t.t0 = performance.now();
    const te = r("fx-hero"),
      me = r("fx-veil"),
      Je = () => {
        if (t.intro === "done") return;
        t.intro = "done";
        const e = parseFloat(getComputedStyle(r("fx-intro-t")).fontSize) || 80;
        (te.style.transform = `translate(${32 - innerWidth * 0.08}px,${32 - innerHeight / 2}px) scale(${15 / e})`),
          te.classList.add("out"),
          v.classList.remove("fx-pre"),
          me.classList.remove("on"),
          setTimeout(() => {
            me.style.display = "none";
          }, 1600),
          setTimeout(() => te.classList.remove("on"), 1e3),
          setTimeout(w, 520);
      },
      et = () => {
        const e = r("fx-intro-t");
        e.childElementCount ||
          [...N].forEach((a, n) => {
            const i = document.createElement("span");
            (i.textContent = a === " " ? "\xA0" : a),
              (i.style.animationDelay = n * 45 + "ms"),
              e.append(i);
          }),
          (r("fx-intro-s").textContent = D.length
            ? `${D.length} gares \xE0 explorer en 3D`
            : "Visite en 3D");
      },
      Ct = (e) => {
        if (t.intro === "wait") {
          const a = k("#splashscreen-container"),
            n = a && getComputedStyle(a);
          ((window.unityInstance &&
            (!n ||
              n.display === "none" ||
              n.visibility === "hidden" ||
              +n.opacity < 0.05) &&
            +getComputedStyle(k("#unity-canvas") || document.body).opacity >
              0.9) ||
            e - t.t0 > 9e4) &&
            ((t.intro = "show"),
            (t.introAt = e),
            et(),
            me.classList.add("on"),
            te.classList.add("on"),
            w());
        } else t.intro === "show" && e - t.introAt > 2900 && Je();
      },
      tt = (e) => {
        if (e && e.type === "pointermove") {
          const a = E.ai.el.getBoundingClientRect(),
            n = Math.max(a.left - e.clientX, 0, e.clientX - a.right),
            i = Math.max(a.top - e.clientY, 0, e.clientY - a.bottom);
          E.ai.el.classList.toggle("near", n * n + i * i < 22500);
        }
        (t.idleAt = performance.now()),
          Ze(),
          e &&
            e.type !== "pointermove" &&
            t.intro === "show" &&
            performance.now() - t.introAt > 700 &&
            Je();
      };
    for (const e of [
      "pointerdown",
      "pointermove",
      "wheel",
      "keydown",
      "touchstart",
    ])
      addEventListener(e, tt, { capture: !0, passive: !0 });
    for (const e of r("fx-modes").children) e.onclick = () => Qe(e.dataset.m);
    let ae = "liquid";
    try {
      ae = sessionStorage.getItem("fx-mode") || ae;
    } catch {}
    /showroom/i.test(location.hash + location.search) && (ae = "show"),
      (t.idleAt = performance.now()),
      (t.autoAt = 0);
    let at = "",
      nt = 0,
      it = "",
      ot = "",
      ve = 0,
      rt = performance.now(),
      we = 0;
    function st(e) {
      const a = Math.min(0.034, (e - rt) / 1e3);
      if (
        ((rt = e),
        (we += a),
        Ct(e),
        we > 0.12 && ((we = 0), Ae() && K(!0)),
        t.hasTour)
      ) {
        const s = t.autoPlay ? "pause" : "play";
        s !== ot &&
          ((ot = s),
          (re.innerHTML = z[s]),
          re.setAttribute("aria-label", s === "pause" ? "Pause" : "Lecture"),
          A.classList.toggle("playing", s === "pause")),
          (r("fx-pct").textContent = Math.round(t.prog * 100) + " %"),
          !T && u == null && Q(t.prog),
          qe(T && u != null ? u : t.prog),
          (r("fx-arcplay").innerHTML = z[t.autoPlay ? "pause" : "play"]),
          ee(T && u != null ? u : t.prog);
        {
          const p = t.autoPlay
              ? "En lecture"
              : t.prog > 0.995
                ? "Termin\xE9e"
                : t.prog > 0.005
                  ? "En pause"
                  : "Pr\xEAte",
            o = r("fx-tstate");
          if (o.textContent !== p) {
            o.textContent = p;
            const x = r("fx-tplay");
            (x.innerHTML = z[t.autoPlay ? "pause" : "play"]),
              x.setAttribute("aria-label", t.autoPlay ? "Pause" : "Lecture");
          }
        }
        if ((Et(e), e - nt > 280)) {
          nt = e;
          const p = L.ctrl && L.ctrl.querySelector(".camera-spatial-map"),
            o = p ? p.outerHTML : "";
          if (o !== at) {
            (at = o), (r("fx-plan").innerHTML = o), Oe();
            const l = p && p.viewBox && p.viewBox.baseVal,
              c = l && l.height ? (l.width / l.height).toFixed(3) : "";
            c &&
              c !== it &&
              ((it = c), (r("fx-mapbox").style.aspectRatio = c), F(), w());
          }
          const x = null,
            f = r("fx-decor");
          if (x && x.width > 4 && x.height > 4) {
            (f.width !== x.width || f.height !== x.height) &&
              ((f.width = x.width), (f.height = x.height));
            const l = f.getContext("2d");
            l.clearRect(0, 0, f.width, f.height);
            try {
              l.drawImage(x, 0, 0);
            } catch {}
          }
        }
      }
      t.show &&
        D.length &&
        t.ai === "idle" &&
        e - t.idleAt > 25e3 &&
        e - t.autoAt > 14e3 &&
        ((t.autoAt = e),
        (t.auto = !0),
        r("fx-auto").classList.add("on"),
        (ce = (ce + 1) % D.length),
        de(D[ce].id));
      for (const s in E) ht(s, a);
      const n = r("fx-grab"),
        i = E.card.cur;
      n.classList.toggle("on", !!t.win && i.p > 0.9),
        t.win &&
          (n.style.transform = `translate3d(${((i.x + i.w / 2 - 79) * t.z).toFixed(1)}px,${((i.y + i.h + 16) * t.z).toFixed(1)}px,0) scale(${t.z})`),
        (ve = requestAnimationFrame(st));
    }
    let kbT = 0;
    function kbSettle() {
      // iOS : le clavier s'ouvre en ~0,5 s, la page est poussée vers le haut et
      // les événements visualViewport arrivent tard ou pas du tout. On remet la
      // page à zéro et on recalcule à chaque image pendant 1,4 s.
      const end = performance.now() + 1400;
      cancelAnimationFrame(kbT);
      const tick = () => {
        if (t.compact && document.activeElement === q) {
          const se = document.scrollingElement || document.documentElement;
          (window.scrollY || se.scrollTop) && window.scrollTo(0, 0);
          document.body && document.body.scrollTop && (document.body.scrollTop = 0);
        }
        F(), w(), kbDebug();
        performance.now() < end && (kbT = requestAnimationFrame(tick));
      };
      kbT = requestAnimationFrame(tick);
    }
    let kbBox = null;
    function kbDebug() {
      if (!/kbdebug/.test(location.search + location.hash)) return;
      kbBox ||
        ((kbBox = document.createElement("pre")),
        (kbBox.style.cssText =
          "position:fixed;left:4px;bottom:4px;z-index:2147483647;margin:0;padding:4px 6px;font:11px/1.3 ui-monospace,monospace;color:#0f0;background:rgba(0,0,0,.75);pointer-events:none;white-space:pre"),
        document.body.append(kbBox));
      const e = window.visualViewport || {};
      kbBox.textContent = `inner ${innerWidth}x${innerHeight}  vv ${Math.round(e.width)}x${Math.round(e.height)}\nvv.top ${Math.round(e.offsetTop)} page ${Math.round(e.pageTop)} scrollY ${Math.round(scrollY)}\nkb ${t.kb} ai ${t.ai} focus ${document.activeElement === q}`;
    }
    const V = () => {
      F(), w(), kbDebug();
    };
    addEventListener("resize", V);
    const Y = window.visualViewport;
    Y && (Y.addEventListener("resize", V), Y.addEventListener("scroll", V)),
      Ae(),
      Qe(ae),
      K(!1),
      (ve = requestAnimationFrame(st)),
      (window.__prismSkin = {
        S: t,
        panes: E,
        destroy() {
          cancelAnimationFrame(ve),
            removeEventListener("resize", V),
            Y &&
              (Y.removeEventListener("resize", V),
              Y.removeEventListener("scroll", V)),
            removeEventListener("keydown", Xe),
            removeEventListener("pointerdown", _e, !0);
          for (const e of [
            "pointerdown",
            "pointermove",
            "wheel",
            "keydown",
            "touchstart",
          ])
            removeEventListener(e, tt, { capture: !0 });
          Ge.classList.remove("fx-orig"),
            v.remove(),
            B.remove(),
            delete window.__prismSkin;
        },
      });
  })();
})();
