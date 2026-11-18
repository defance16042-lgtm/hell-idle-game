(() => {
  'use strict';

  if (window.__parallelThreeKingdomsGaoShunAttackV1) return;
  window.__parallelThreeKingdomsGaoShunAttackV1 = true;

  const ROOT = 'assets/monsters/parallel_three_kingdoms';
  const IDLE = `${ROOT}/gao_shun_bestiary_left.png`;
  const FRAME_PATHS = {
    windup: `${ROOT}/gao_shun_attack/frame_02_shield_windup.png`,
    bash: `${ROOT}/gao_shun_attack/frame_03_shield_bash.png`,
    slash: `${ROOT}/gao_shun_attack/frame_04_sword_slash.png`,
    recover: `${ROOT}/gao_shun_attack/frame_05_recover.png`
  };
  const resolve = path => typeof window.resolveEmbeddedAsset === 'function'
    ? window.resolveEmbeddedAsset(path)
    : (typeof resolveEmbeddedAsset === 'function' ? resolveEmbeddedAsset(path) : path);
  const imageEntries = Object.fromEntries(Object.entries({ idle: IDLE, ...FRAME_PATHS }).map(([key, path]) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = resolve(path);
    return [key, { source: image.src, image }];
  }));
  const assetsReady = Promise.all(Object.values(imageEntries).map(({ image }) => {
    if (image.complete) return Promise.resolve(image.naturalWidth > 0);
    return new Promise(resolveImage => {
      image.addEventListener('load', () => resolveImage(true), { once: true });
      image.addEventListener('error', () => resolveImage(false), { once: true });
    });
  })).then(results => results.every(Boolean));

  let playbackToken = 0;
  let timers = [];
  let activeSprite = null;
  const idleSource = imageEntries.idle.source;

  function cancelPlayback(restore = true) {
    playbackToken++;
    timers.forEach(clearTimeout);
    timers = [];
    if (restore && activeSprite?.isConnected) activeSprite.setAttribute('src', idleSource);
    activeSprite = null;
  }

  function playSequence(sequence, skillName) {
    const stageMonster = typeof currentMonster !== 'undefined' ? currentMonster : window.currentMonster;
    const sprite = document.querySelector('#monster-icon .monster-sprite');
    if (!sprite?.isConnected) return false;

    cancelPlayback();
    const token = playbackToken;
    activeSprite = sprite;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const baseDurations = sequence.map(key => key === 'slash' ? 185 : key === 'bash' ? 155 : key === 'recover' ? 205 : 150);
    const durations = reducedMotion ? baseDurations.map(ms => Math.round(ms * 0.65)) : baseDurations;

    assetsReady.then(ready => {
      if (token !== playbackToken || !sprite.isConnected) return;
      if (!ready) {
        sprite.setAttribute('src', idleSource);
        activeSprite = null;
        if (typeof addBattleLog === 'function') addBattleLog('⚠️ 高順盾刀分鏡素材未能完整載入，已回到待機姿勢。');
        return;
      }

      let index = 0;
      const advance = () => {
        if (token !== playbackToken || !sprite.isConnected) return;
        if (index >= sequence.length) {
          sprite.setAttribute('src', idleSource);
          activeSprite = null;
          timers = [];
          return;
        }
        sprite.setAttribute('src', imageEntries[sequence[index]].source);
        const timer = setTimeout(() => {
          index++;
          advance();
        }, durations[index]);
        timers.push(timer);
      };
      advance();
    });
    return true;
  }

  const previousStoryboard = window.playParallelThreeKingdomsBossAttackStoryboard;
  window.playParallelThreeKingdomsBossAttackStoryboard = function(name, skillName, ...rest) {
    const cleanName = String(name || '').trim();
    if (cleanName === '高順將軍' || cleanName === '高順') {
      const skill = String(skillName || '');
      const sequence = skill.includes('堅陣回斬')
        ? ['windup', 'slash', 'recover']
        : ['windup', 'bash', 'slash', 'recover'];
      return playSequence(sequence, skill);
    }
    return typeof previousStoryboard === 'function'
      ? previousStoryboard.call(this, name, skillName, ...rest)
      : false;
  };
})();
