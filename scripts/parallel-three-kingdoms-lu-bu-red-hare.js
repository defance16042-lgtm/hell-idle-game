(() => {
  'use strict';
  if (window.__parallelThreeKingdomsLuBuRedHareV2) return;
  window.__parallelThreeKingdomsLuBuRedHareV2 = true;

  const ROOT = 'assets/monsters/parallel_three_kingdoms/';
  const IDLE = ROOT + 'lu_bu_red_hare_idle.png';
  const FRAME_PATHS = [
    IDLE,
    ROOT + 'lu_bu_red_hare_attack/frame_02_windup.png',
    ROOT + 'lu_bu_red_hare_attack/frame_03_charge.png',
    ROOT + 'lu_bu_red_hare_attack/frame_04_strike.png',
    ROOT + 'lu_bu_red_hare_attack/frame_05_recover.png'
  ];
  const FRAME_MS = [85, 155, 125, 110, 230];
  const POSES = ['0 0', '-2% 0', '-8% -1%', '-10% 0', '-1% 0'];

  const assetSource = path =>
    typeof resolveEmbeddedAsset === 'function' ? resolveEmbeddedAsset(path) : path;

  const frames = FRAME_PATHS.map(path => {
    const image = new Image();
    image.decoding = 'async';
    image.src = assetSource(path);
    return image;
  });

  const ready = Promise.all(frames.map(image => {
    if (image.complete) return Promise.resolve(image.naturalWidth > 0);
    return new Promise(resolve => {
      image.addEventListener('load', () => resolve(true), { once: true });
      image.addEventListener('error', () => resolve(false), { once: true });
    });
  })).then(results => results.every(Boolean));

  let runId = 0;
  let active = null;

  function restore(record) {
    if (!record) return;
    for (const timer of record.timers) clearTimeout(timer);
    if (record.sprite?.isConnected) {
      record.sprite.setAttribute('src', record.idleSource);
      if (record.previousTranslate) record.sprite.style.setProperty('translate', record.previousTranslate);
      else record.sprite.style.removeProperty('translate');
      if (record.previousTransition) record.sprite.style.setProperty('transition', record.previousTransition);
      else record.sprite.style.removeProperty('transition');
    }
    active = null;
  }

  function cancel() {
    runId++;
    if (active) restore(active);
  }

  function playLuBuRedHareAttack() {
    const sprite = document.querySelector('#monster-icon .monster-sprite');
    if (!sprite || !sprite.isConnected) return false;

    cancel();

    const record = {
      token: ++runId,
      sprite,
      timers: [],
      idleSource: sprite.getAttribute('src') || sprite.src,
      previousTranslate: sprite.style.getPropertyValue('translate'),
      previousTransition: sprite.style.getPropertyValue('transition')
    };
    active = record;

    const showFrame = index => {
      if (!active || active.token !== record.token || !sprite.isConnected) {
        restore(record);
        return;
      }
      if (index >= frames.length) {
        restore(record);
        return;
      }

      sprite.setAttribute('src', frames[index].src);
      sprite.style.setProperty('translate', POSES[index], 'important');
      sprite.style.setProperty('transition', 'translate 95ms ease', 'important');

      const timer = setTimeout(() => showFrame(index + 1), FRAME_MS[index]);
      record.timers.push(timer);
    };

    ready.then(allLoaded => {
      if (!active || active.token !== record.token) return;
      if (!allLoaded) {
        restore(record);
        return;
      }
      showFrame(0);
    });

    return true;
  }

  const previousStoryboard = window.playParallelThreeKingdomsBossAttackStoryboard;

  window.playParallelThreeKingdomsBossAttackStoryboard = function(name, attackName, ...rest) {
    if (name === '呂布' || name === '吕布') {
      const played = playLuBuRedHareAttack();
      if (played) return true;
    }
    return typeof previousStoryboard === 'function'
      ? previousStoryboard.call(this, name, attackName, ...rest)
      : false;
  };

  window.playLuBuRedHareAttackStoryboard = playLuBuRedHareAttack;
})();
