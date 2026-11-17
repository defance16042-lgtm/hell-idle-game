(() => {
  'use strict';
  if (window.__parallelThreeKingdomsLuBuRedHareV1) return;
  window.__parallelThreeKingdomsLuBuRedHareV1 = true;

  const ROOT = 'assets/monsters/parallel_three_kingdoms/';
  const IDLE = `${ROOT}lu_bu_red_hare_idle.png`;
  const FRAME_PATHS = [
    IDLE,
    `${ROOT}lu_bu_red_hare_attack/frame_02_windup.png`,
    `${ROOT}lu_bu_red_hare_attack/frame_03_charge.png`,
    `${ROOT}lu_bu_red_hare_attack/frame_04_strike.png`,
    `${ROOT}lu_bu_red_hare_attack/frame_05_recover.png`
  ];
  const FRAME_MS = [85, 155, 125, 110, 230];
  const FRAME_DURATIONS = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    ? FRAME_MS.map(ms => Math.max(65, Math.round(ms * 0.8)))
    : FRAME_MS.slice();
  const POSES = [
    { translate: '0 0', filter: 'drop-shadow(0 0 3px rgba(255,55,70,.28))' },
    { translate: '-2% 0', filter: 'drop-shadow(0 0 8px rgba(255,55,70,.55))' },
    { translate: '-8% -1%', filter: 'drop-shadow(0 0 15px rgba(255,45,60,.82))' },
    { translate: '-10% 0', filter: 'drop-shadow(0 0 23px rgba(255,45,70,1))' },
    { translate: '-1% 0', filter: 'drop-shadow(0 0 11px rgba(190,55,255,.68))' }
  ];
  const assetSource = path => typeof resolveEmbeddedAsset === 'function' ? resolveEmbeddedAsset(path) : path;
  const frames = FRAME_PATHS.map(path => {
    const image = new Image();
    image.decoding = 'async';
    image.src = assetSource(path);
    return { source: image.src, image };
  });
  const ready = Promise.all(frames.map(({ image }) => {
    if (image.complete) return Promise.resolve(image.naturalWidth > 0);
    return new Promise(resolve => {
      image.addEventListener('load', () => resolve(true), { once: true });
      image.addEventListener('error', () => resolve(false), { once: true });
    });
  })).then(results => results.every(Boolean));

  if (!document.getElementById('lu-bu-red-hare-vfx-style')) {
    const style = document.createElement('style');
    style.id = 'lu-bu-red-hare-vfx-style';
    style.textContent = `
      .lu-bu-red-hare-vfx{position:absolute;inset:0;z-index:90;pointer-events:none;overflow:hidden;opacity:1}
      .lu-bu-red-hare-vfx svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
      .lu-bu-red-hare-vfx .lubu-slash-glow,.lu-bu-red-hare-vfx .lubu-slash-core{fill:none;stroke-linecap:round;stroke-dasharray:1100;stroke-dashoffset:1100;opacity:0}
      .lu-bu-red-hare-vfx.strike .lubu-slash-glow{animation:lubuRedHareSlash .24s cubic-bezier(.12,.8,.2,1) forwards}
      .lu-bu-red-hare-vfx.strike .lubu-slash-core{animation:lubuRedHareSlash .22s cubic-bezier(.12,.8,.2,1) .015s forwards}
      .lu-bu-red-hare-vfx .lubu-impact{transform-origin:230px 350px;opacity:0}
      .lu-bu-red-hare-vfx.impact .lubu-impact{animation:lubuRedHareImpact .22s ease-out forwards}
      .lu-bu-red-hare-vfx.charge .lubu-speedline{animation:lubuRedHareSpeed .23s ease-out forwards}
      @keyframes lubuRedHareSlash{0%{stroke-dashoffset:1100;opacity:0}18%{opacity:1}100%{stroke-dashoffset:0;opacity:0}}
      @keyframes lubuRedHareImpact{0%{opacity:0;transform:scale(.2)}25%{opacity:.95}100%{opacity:0;transform:scale(1.35)}}
      @keyframes lubuRedHareSpeed{0%{opacity:0;transform:translateX(50px)}40%{opacity:.85}100%{opacity:0;transform:translateX(-25px)}}
    `;
    document.head.appendChild(style);
  }

  let runId = 0;
  let active = null;

  function restoreInlineStyle(element, property, value, priority) {
    if (value) element.style.setProperty(property, value, priority);
    else element.style.removeProperty(property);
  }

  function restoreSprite(record) {
    const currentMonsterName = typeof currentMonster !== 'undefined'
      ? currentMonster?.name
      : window.currentMonster?.name;
    if (record.sprite.isConnected && (!currentMonsterName || currentMonsterName === '呂布' || currentMonsterName === '吕布')) {
      record.sprite.setAttribute('src', record.idleSource);
    }
    restoreInlineStyle(record.sprite, 'translate', record.previousTranslate, record.previousTranslatePriority);
    restoreInlineStyle(record.sprite, 'filter', record.previousFilter, record.previousFilterPriority);
    restoreInlineStyle(record.sprite, 'transition', record.previousTransition, record.previousTransitionPriority);
  }

  function finish(token) {
    if (!active || active.token !== token) return;
    for (const timer of active.timers) clearTimeout(timer);
    restoreSprite(active);
    active.overlay.remove();
    if (active.changedStagePosition) {
      if (active.previousStagePosition) active.stage.style.position = active.previousStagePosition;
      else active.stage.style.removeProperty('position');
    }
    active = null;
  }

  function cancelActive() {
    runId++;
    if (active) finish(active.token);
  }

  function playLuBuRedHareAttack() {
    const stage = document.getElementById('battle-stage');
    const sprite = document.querySelector('#monster-icon .monster-sprite');
    if (!stage || !sprite || !sprite.isConnected) return false;
    const bounds = stage.getBoundingClientRect();
    if (bounds.width < 10 || bounds.height < 10) return false;

    cancelActive();
    const previousStagePosition = stage.style.position;
    const changedStagePosition = getComputedStyle(stage).position === 'static';
    if (changedStagePosition) stage.style.position = 'relative';

    const overlay = document.createElement('div');
    overlay.className = 'lu-bu-red-hare-vfx';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<svg viewBox="0 0 1000 500" preserveAspectRatio="none"><defs><linearGradient id="lubu-red-hare-grad" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#fff0a8"/><stop offset=".32" stop-color="#ff596f"/><stop offset=".72" stop-color="#df3cff"/><stop offset="1" stop-color="#7e1cbb" stop-opacity="0"/></linearGradient><filter id="lubu-red-hare-blur"><feGaussianBlur stdDeviation="8"/></filter></defs><path class="lubu-speedline" d="M900 280 L500 310 M920 320 L590 360 M850 235 L620 255" fill="none" stroke="#ff334d" stroke-width="11" stroke-linecap="round" opacity="0"/><path class="lubu-slash-glow" d="M960 74 Q620 26 210 405" stroke="url(#lubu-red-hare-grad)" stroke-width="52" filter="url(#lubu-red-hare-blur)"/><path class="lubu-slash-core" d="M960 74 Q620 26 210 405" stroke="url(#lubu-red-hare-grad)" stroke-width="14"/><circle class="lubu-impact" cx="230" cy="350" r="68" fill="none" stroke="#ff647d" stroke-width="13"/><circle class="lubu-impact" cx="230" cy="350" r="34" fill="#ffc96b" opacity=".5"/></svg>';
    stage.appendChild(overlay);

    const record = {
      token: ++runId, stage, sprite, overlay, timers: [],
      idleSource: sprite.getAttribute('src') || sprite.src,
      changedStagePosition, previousStagePosition,
      previousTranslate: sprite.style.getPropertyValue('translate'),
      previousTranslatePriority: sprite.style.getPropertyPriority('translate'),
      previousFilter: sprite.style.getPropertyValue('filter'),
      previousFilterPriority: sprite.style.getPropertyPriority('filter'),
      previousTransition: sprite.style.getPropertyValue('transition'),
      previousTransitionPriority: sprite.style.getPropertyPriority('transition')
    };
    active = record;

    const showFrame = index => {
      if (!active || active.token !== record.token || !sprite.isConnected) {
        finish(record.token);
        return;
      }
      if (index >= frames.length) {
        finish(record.token);
        return;
      }
      sprite.setAttribute('src', frames[index].source);
      sprite.style.setProperty('translate', POSES[index].translate, 'important');
      sprite.style.setProperty('filter', POSES[index].filter, 'important');
      sprite.style.setProperty('transition', 'translate 95ms ease,filter 95ms ease', 'important');
      if (index === 2) overlay.classList.add('charge');
      if (index === 3) overlay.classList.add('strike');
      if (index === 4) overlay.classList.add('impact');
      const timer = setTimeout(() => showFrame(index + 1), FRAME_DURATIONS[index]);
      record.timers.push(timer);
    };

    ready.then(allLoaded => {
      if (!active || active.token !== record.token) return;
      if (!allLoaded) {
        finish(record.token);
        return;
      }
      showFrame(0);
    });
    return true;
  }

  const previousStoryboard = window.playParallelThreeKingdomsBossAttackStoryboard;
  window.playParallelThreeKingdomsBossAttackStoryboard = function (name, attackName, ...rest) {
    if (name === '呂布' || name === '吕布') {
      if (String(attackName || '').includes('轅門射戟')) {
        return typeof previousStoryboard === 'function' ? previousStoryboard.call(this, name, attackName, ...rest) : false;
      }
      const played = playLuBuRedHareAttack();
      if (played) return true;
    }
    return typeof previousStoryboard === 'function'
      ? previousStoryboard.call(this, name, attackName, ...rest)
      : false;
  };
  window.playLuBuRedHareAttackStoryboard = playLuBuRedHareAttack;
})();
