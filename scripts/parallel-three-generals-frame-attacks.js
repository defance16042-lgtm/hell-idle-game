(() => {
  'use strict';

  if (window.__parallelThreeGeneralsFrameAttacksV1) return;
  window.__parallelThreeGeneralsFrameAttacksV1 = true;

  const root = 'assets/monsters/parallel_three_kingdoms';
  const definitions = [
    {
      names: ['李儒'], bodyDir: 'li_ru_attack', waveDir: 'li_ru_attack_wave',
      waveScale: .42, waveCurve: -.015, waveLift: -.025, spriteScale: 1.2,
      frameMs: [135, 120, 105, 95, 125, 180],
      waveStops: [0.02, 0.06, 0.28, 0.62, 0.88, 1],
      waveAlpha: [.28, .55, .92, 1, .88, .30]
    },
    {
      names: ['樊稠將軍', '樊稠'], bodyDir: 'fan_chou_attack', waveDir: 'fan_chou_attack_wave',
      waveScale: .42, waveCurve: .01, waveLift: .015, spriteScale: 1.2,
      frameMs: [135, 120, 105, 95, 125, 180],
      waveStops: [0.02, 0.07, 0.30, 0.64, 0.90, 1],
      waveAlpha: [.26, .54, .95, 1, .92, .36]
    },
    {
      names: ['張濟將軍', '張濟'], bodyDir: 'zhang_ji_attack', waveDir: 'zhang_ji_attack_wave',
      waveScale: .42, waveCurve: -.005, waveLift: -.01, spriteScale: 1.2,
      frameMs: [130, 115, 100, 90, 120, 175],
      waveStops: [0.01, 0.05, 0.34, 0.70, 0.94, 1],
      waveAlpha: [.22, .50, .95, 1, .88, .24]
    },
    {
      names: ['呂布'], bodyDir: 'lu_bu_attack', waveDir: 'lu_bu_attack_wave',
      waveScale: .42, waveCurve: .02, waveLift: -.035, spriteScale: 1.2,
      frameMs: [150, 130, 110, 95, 145, 195],
      waveStops: [0.01, 0.06, 0.28, 0.60, 0.88, 1],
      waveAlpha: [.30, .62, .98, 1, .96, .38]
    },
    {
      names: ['高順將軍', '高順'], bodyDir: 'gao_shun_attack', bodySource: `${root}/gao_shun-general.png`, waveDir: 'gao_shun_attack_wave',
      // 高順舊分鏡影格含相鄰畫格殘影且部分身體貼邊；改用完整立繪作人物底圖，
      // 六段以位移、傾身與紅色氣勁變化呈現攻擊，避免人物被切成半身。
      fullBodyMotion: [
        { translate: '0 0', rotate: '0deg', filter: 'drop-shadow(0 0 0 rgba(255,35,35,0))' },
        { translate: '-1.5% 0', rotate: '-3deg', filter: 'drop-shadow(0 0 5px rgba(220,35,35,.35))' },
        { translate: '2% -1%', rotate: '-7deg', filter: 'drop-shadow(0 0 12px rgba(255,30,30,.70))' },
        { translate: '4% 0', rotate: '4deg', filter: 'drop-shadow(0 0 18px rgba(255,20,20,.90))' },
        { translate: '1% 0', rotate: '2deg', filter: 'drop-shadow(0 0 10px rgba(255,30,30,.55))' },
        { translate: '0 0', rotate: '0deg', filter: 'drop-shadow(0 0 0 rgba(255,35,35,0))' }
      ],
      waveScale: .50, waveCurve: -.02, waveLift: -.02, spriteScale: 1.0,
      frameMs: [140, 120, 105, 92, 125, 185],
      waveStops: [0.01, 0.06, 0.30, 0.64, 0.90, 1],
      waveAlpha: [.24, .55, .94, 1, .90, .30]
    }
  ];

  const imageFor = path => {
    const source = typeof resolveEmbeddedAsset === 'function' ? resolveEmbeddedAsset(path) : path;
    const image = new Image();
    image.decoding = 'async';
    image.src = source;
    return { source, image };
  };

  for (const definition of definitions) {
    definition.bodyFrames = Array.from({ length: 6 }, (_, index) =>
      imageFor(definition.bodySource || `${root}/${definition.bodyDir}/frame_${String(index + 1).padStart(2, '0')}.png`));
    definition.waveFrames = Array.from({ length: 6 }, (_, index) =>
      imageFor(`${root}/${definition.waveDir}/frame_${String(index + 1).padStart(2, '0')}.png`));
    const images = [...definition.bodyFrames, ...definition.waveFrames].map(entry => entry.image);
    definition.ready = Promise.all(images.map(image => {
      if (image.complete) return Promise.resolve(image.naturalWidth > 0);
      return new Promise(resolve => {
        image.addEventListener('load', () => resolve(true), { once: true });
        image.addEventListener('error', () => resolve(false), { once: true });
      });
    })).then(results => results.every(Boolean));
  }

  const definitionByName = new Map();
  for (const definition of definitions) {
    for (const name of definition.names) definitionByName.set(name, definition);
  }

  let runId = 0;
  let active = null;

  function restoreStagePosition(record) {
    if (!record.changedStagePosition) return;
    if (record.previousStagePosition) record.stage.style.position = record.previousStagePosition;
    else record.stage.style.removeProperty('position');
  }

  function restoreInlineStyle(element, property, value, priority) {
    if (value) element.style.setProperty(property, value, priority);
    else element.style.removeProperty(property);
  }

  function restoreSpriteScale(record) {
    if (!record.changedSpriteScale) return;
    restoreInlineStyle(record.sprite, 'scale', record.previousSpriteScale, record.previousSpriteScalePriority);
    restoreInlineStyle(record.sprite, 'transform-origin', record.previousSpriteOrigin, record.previousSpriteOriginPriority);
    restoreInlineStyle(record.sprite, 'translate', record.previousSpriteTranslate, record.previousSpriteTranslatePriority);
    restoreInlineStyle(record.sprite, 'rotate', record.previousSpriteRotate, record.previousSpriteRotatePriority);
    restoreInlineStyle(record.sprite, 'filter', record.previousSpriteFilter, record.previousSpriteFilterPriority);
    restoreInlineStyle(record.sprite, 'transition', record.previousSpriteTransition, record.previousSpriteTransitionPriority);
  }

  function finish(token) {
    if (!active || active.token !== token) return;
    for (const timer of active.timers) clearTimeout(timer);
    if (active.sprite.isConnected) active.sprite.setAttribute('src', active.idleSource);
    restoreSpriteScale(active);
    active.waveImage.remove();
    restoreStagePosition(active);
    active = null;
  }

  function cancelActive() {
    runId++;
    if (!active) return;
    for (const timer of active.timers) clearTimeout(timer);
    if (active.sprite.isConnected) active.sprite.setAttribute('src', active.idleSource);
    restoreSpriteScale(active);
    active.waveImage.remove();
    restoreStagePosition(active);
    active = null;
  }

  function placeWave(record, frameIndex) {
    const { definition, stage, waveImage, sourcePoint, targetPoint, stageRect, maxWaveWidth } = record;
    const travel = definition.waveStops[frameIndex];
    const curveY = Math.sin(Math.PI * travel) * stageRect.height * definition.waveCurve;
    const x = sourcePoint.x + (targetPoint.x - sourcePoint.x) * travel;
    const y = sourcePoint.y + (targetPoint.y - sourcePoint.y) * travel + curveY + stageRect.height * definition.waveLift;
    const width = Math.min(stageRect.width * definition.waveScale, maxWaveWidth, 720);
    const height = width / 1.5;

    waveImage.style.left = `${x - width / 2}px`;
    waveImage.style.top = `${y - height / 2}px`;
    waveImage.style.width = `${width}px`;
    waveImage.style.height = `${height}px`;
    waveImage.style.opacity = String(definition.waveAlpha[frameIndex]);
    waveImage.style.transform = definition.waveFlip ? 'scaleX(-1)' : 'none';
  }

  function playFrameSequence(definition) {
    const stage = document.getElementById('battle-stage');
    const sprite = document.querySelector('#monster-icon .monster-sprite');
    const player = document.getElementById('player-icon');
    if (!stage || !sprite || !player || !sprite.isConnected) return false;

    cancelActive();
    const stageRect = stage.getBoundingClientRect();
    const monsterRect = sprite.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const maxWaveWidth = Math.min(stageRect.width * .52, 620);
    if (stageRect.width < 10 || stageRect.height < 10 || !monsterRect.width || !playerRect.width) return false;

    const originalStagePosition = stage.style.getPropertyValue('position');
    const changedStagePosition = getComputedStyle(stage).position === 'static';
    if (changedStagePosition) stage.style.position = 'relative';
    const previousSpriteScale = sprite.style.getPropertyValue('scale');
    const previousSpriteScalePriority = sprite.style.getPropertyPriority('scale');
    const previousSpriteOrigin = sprite.style.getPropertyValue('transform-origin');
    const previousSpriteOriginPriority = sprite.style.getPropertyPriority('transform-origin');
    const previousSpriteTranslate = sprite.style.getPropertyValue('translate');
    const previousSpriteTranslatePriority = sprite.style.getPropertyPriority('translate');
    const previousSpriteRotate = sprite.style.getPropertyValue('rotate');
    const previousSpriteRotatePriority = sprite.style.getPropertyPriority('rotate');
    const previousSpriteFilter = sprite.style.getPropertyValue('filter');
    const previousSpriteFilterPriority = sprite.style.getPropertyPriority('filter');
    const previousSpriteTransition = sprite.style.getPropertyValue('transition');
    const previousSpriteTransitionPriority = sprite.style.getPropertyPriority('transition');
    const changedSpriteScale = definition.spriteScale !== 1 || Boolean(definition.fullBodyMotion);
    if (changedSpriteScale) {
      sprite.style.setProperty('scale', String(definition.spriteScale), 'important');
      sprite.style.setProperty('transform-origin', 'center bottom', 'important');
      if (definition.fullBodyMotion) sprite.style.setProperty('transition', 'translate 90ms ease, rotate 90ms ease, filter 90ms ease', 'important');
    }

    const waveImage = document.createElement('img');
    waveImage.className = 'parallel-generals-slash-frames';
    waveImage.alt = '';
    waveImage.setAttribute('aria-hidden', 'true');
    waveImage.draggable = false;
    waveImage.src = definition.waveFrames[0].source;
    waveImage.style.cssText = 'position:absolute;display:block;width:0;height:0;opacity:0;object-fit:contain;pointer-events:none;user-select:none;z-index:90;will-change:left,top,opacity';
    stage.appendChild(waveImage);

    const idleSource = sprite.getAttribute('src') || sprite.src;
    const sourcePoint = {
      x: monsterRect.left - stageRect.left + monsterRect.width * .20,
      y: monsterRect.top - stageRect.top + monsterRect.height * .48
    };
    const targetPoint = {
      x: playerRect.left - stageRect.left + playerRect.width * .55,
      y: playerRect.top - stageRect.top + playerRect.height * .52
    };
    const record = {
      token: ++runId, definition, stage, sprite, idleSource, waveImage,
      sourcePoint, targetPoint, stageRect, maxWaveWidth, timers: [],
      changedStagePosition, previousStagePosition: originalStagePosition,
      changedSpriteScale, previousSpriteScale, previousSpriteScalePriority,
      previousSpriteOrigin, previousSpriteOriginPriority,
      previousSpriteTranslate, previousSpriteTranslatePriority,
      previousSpriteRotate, previousSpriteRotatePriority,
      previousSpriteFilter, previousSpriteFilterPriority,
      previousSpriteTransition, previousSpriteTransitionPriority
    };
    active = record;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const totalDuration = definition.frameMs.reduce((sum, value) => sum + value, 0);
    const reducedScale = Math.max(.7, 680 / totalDuration);
    const frameDurations = prefersReducedMotion
      ? definition.frameMs.map(value => Math.round(value * reducedScale))
      : definition.frameMs;

    const showFrame = index => {
      if (!active || active.token !== record.token || !sprite.isConnected) {
        finish(record.token);
        return;
      }
      if (index >= definition.bodyFrames.length) {
        finish(record.token);
        return;
      }
      sprite.setAttribute('src', definition.bodyFrames[index].source);
      if (definition.fullBodyMotion) {
        const pose = definition.fullBodyMotion[index];
        sprite.style.setProperty('translate', pose.translate, 'important');
        sprite.style.setProperty('rotate', pose.rotate, 'important');
        sprite.style.setProperty('filter', pose.filter, 'important');
      }
      waveImage.src = definition.waveFrames[index].source;
      placeWave(record, index);
      const timer = setTimeout(() => showFrame(index + 1), frameDurations[index]);
      record.timers.push(timer);
    };

    definition.ready.then(ready => {
      if (!active || active.token !== record.token) return;
      if (!ready) {
        finish(record.token);
        return;
      }
      showFrame(0);
    });
    return true;
  }

  const previous = window.playParallelThreeKingdomsBossAttackStoryboard;
  window.playParallelThreeKingdomsBossAttackStoryboard = (name, skillName) => {
    const cleanName = String(name || '').trim();
    const skill = String(skillName || '').trim();
    const isLuBuPhase2 = cleanName === '呂布' && (
      window.__parallelLuBuPhase2Active === true ||
      (() => {
        try {
          return typeof currentMonster !== 'undefined'
            && currentMonster?.name === '呂布'
            && (Number(currentMonster?._parallelLuBuPhase) === 2
              || currentMonster?.attackType === '轅門射戟'
              || currentMonster?.basicAttackName === '轅門射戟');
        } catch (_) { return false; }
      })() ||
      skill.includes('轅門射戟')
    );
    // 第二階段交由前置載入的呂布專用動畫處理器播放；不可只回報 true，否則畫面不會有動畫。
    if (isLuBuPhase2) return typeof previous === 'function' ? previous(name, skillName) : false;
    const definition = definitionByName.get(cleanName);
    if (definition) return playFrameSequence(definition);
    return previous?.(name, skillName) || false;
  };
})();
