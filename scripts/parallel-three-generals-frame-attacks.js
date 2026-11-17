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
    // 呂布第一、第二階段由 lu-bu-phase-attack-animation.js 使用全新原創 SVG；不再載入舊版 Emoji／PNG 攻擊影格。
    {
      names: ['高順將軍', '高順'], bodySource: `${root}/gao_shun_dark_chibi_left.png`, cssSlash: true,
      // 高順：使用現有 PNG 立繪做六段原創戰鬥動作，不使用 SVG／Emoji。
      fullBodyMotion: [
        { translate: '0 0', rotate: '0deg', filter: 'drop-shadow(0 0 2px rgba(255,65,45,.2))' },
        { translate: '-3% 1%', rotate: '-8deg', filter: 'drop-shadow(0 0 10px rgba(220,35,35,.55))' },
        { translate: '5% -2%', rotate: '-15deg', filter: 'drop-shadow(0 0 18px rgba(255,45,35,.85))' },
        { translate: '11% 0', rotate: '8deg', filter: 'drop-shadow(0 0 30px rgba(255,30,20,1))' },
        { translate: '3% -1%', rotate: '4deg', filter: 'drop-shadow(0 0 20px rgba(255,55,35,.78))' },
        { translate: '0 0', rotate: '0deg', filter: 'drop-shadow(0 0 3px rgba(255,65,45,.25))' }
      ],
      waveScale: .62, waveCurve: -.025, waveLift: -.025, spriteScale: 1.08,
      frameMs: [135, 115, 95, 85, 120, 175],
      waveStops: [0.01, 0.06, 0.30, 0.64, 0.90, 1],
      waveAlpha: [.24, .55, .94, 1, .90, .30]
    },
    {
      names: ['李傕將軍', '李傕'], bodySource: `${root}/li_jue_dark_chibi_left.svg`, waveDir: 'li_jue_attack_wave', waveExtension: 'svg',
      // 以人物完整輪廓立繪為底，六段連續位移與紅紫鬼刃斬擊波組成連續攻擊。
      fullBodyMotion: [
        { translate: '0 0', rotate: '0deg', filter: 'drop-shadow(0 0 2px rgba(160,55,255,.25))' },
        { translate: '-2% 0', rotate: '-8deg', filter: 'drop-shadow(0 0 8px rgba(255,45,75,.65))' },
        { translate: '3% -1%', rotate: '10deg', filter: 'drop-shadow(0 0 15px rgba(255,35,75,.9))' },
        { translate: '5% 0', rotate: '-12deg', filter: 'drop-shadow(0 0 22px rgba(190,55,255,1))' },
        { translate: '-1% -2%', rotate: '7deg', filter: 'drop-shadow(0 0 16px rgba(190,55,255,.85))' },
        { translate: '0 0', rotate: '0deg', filter: 'drop-shadow(0 0 3px rgba(160,55,255,.3))' }
      ],
      waveScale: .58, waveCurve: -.035, waveLift: -.025, spriteScale: 1.12,
      frameMs: [145, 120, 105, 95, 125, 190],
      waveStops: [.02, .08, .30, .58, .84, 1],
      waveAlpha: [.25, .58, .95, 1, .90, .32]
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
    definition.waveFrames = definition.cssSlash ? [] : Array.from({ length: 6 }, (_, index) =>
      imageFor(`${root}/${definition.waveDir}/frame_${String(index + 1).padStart(2, '0')}.${definition.waveExtension || 'png'}`));
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

    const waveImage = document.createElement(definition.cssSlash ? 'div' : 'img');
    waveImage.className = definition.cssSlash ? 'parallel-generals-css-slash' : 'parallel-generals-slash-frames';
    if (!definition.cssSlash) waveImage.alt = '';
    waveImage.setAttribute('aria-hidden', 'true');
    if (!definition.cssSlash) waveImage.draggable = false;
    if (!definition.cssSlash) waveImage.src = definition.waveFrames[0].source;
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
      if (!definition.cssSlash) waveImage.src = definition.waveFrames[index].source;
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


  // 呂布第二形態：PNG 六格弓將攻擊動畫。
  // 使用 3x2 PNG 精靈圖，不使用 SVG／Emoji；每格 32x32，實際戰鬥時放大顯示。
  const luBuPhase2AttackSheet = 'assets/monsters/parallel_three_kingdoms/lu_bu_phase2_attack_spritesheet.png';
  let luBuPhase2AttackRun = 0;

  function playLuBuPhase2PngAttack() {
    const stage = document.getElementById('battle-stage');
    const sprite = document.querySelector('#monster-icon .monster-sprite');
    const player = document.getElementById('player-icon');
    if (!stage || !sprite || !player || !sprite.isConnected) return false;

    const run = ++luBuPhase2AttackRun;
    const idleSource = sprite.getAttribute('src') || sprite.src;
    const oldTransform = sprite.style.getPropertyValue('transform');
    const oldOrigin = sprite.style.getPropertyValue('transform-origin');

    const frame = document.createElement('div');
    frame.className = 'lu-bu-phase2-png-attack';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = [
      'position:absolute',
      'pointer-events:none',
      'z-index:95',
      'width:128px',
      'height:128px',
      'background-image:url("' + (typeof resolveEmbeddedAsset === 'function' ? resolveEmbeddedAsset(luBuPhase2AttackSheet) : luBuPhase2AttackSheet) + '")',
      'background-repeat:no-repeat',
      'background-size:384px 256px',
      'background-position:0 0',
      'image-rendering:auto',
      'transform:translate(-50%,-50%)',
      'will-change:left,top,background-position,transform'
    ].join(';');

    const stageRect = stage.getBoundingClientRect();
    const monsterRect = sprite.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    frame.style.left = `${monsterRect.left - stageRect.left + monsterRect.width * .50}px`;
    frame.style.top = `${monsterRect.top - stageRect.top + monsterRect.height * .48}px`;
    stage.appendChild(frame);

    // 攻擊時先隱藏原本的站立圖，六格 PNG 完整跑完再恢復。
    sprite.style.setProperty('opacity', '0', 'important');

    const frames = [
      { x: 0,   y: 0,   ms: 120, dx: 0,   dy: 0,   r: 0 },
      { x: -128, y: 0,   ms: 105, dx: 5,   dy: -2,  r: -2 },
      { x: -256, y: 0,   ms: 100, dx: 10,  dy: -4,  r: -3 },
      { x: 0,   y: -128,ms: 80,  dx: 18,  dy: -1,  r: 2 },
      { x: -128,y: -128,ms: 150, dx: 24,  dy: 0,   r: 1 },
      { x: -256,y: -128,ms: 180, dx: 6,   dy: 1,   r: 0 }
    ];

    let i = 0;
    const show = () => {
      if (run !== luBuPhase2AttackRun || !frame.isConnected || !sprite.isConnected) {
        frame.remove();
        sprite.style.removeProperty('opacity');
        if (oldTransform) sprite.style.setProperty('transform', oldTransform);
        else sprite.style.removeProperty('transform');
        if (oldOrigin) sprite.style.setProperty('transform-origin', oldOrigin);
        else sprite.style.removeProperty('transform-origin');
        if (sprite.isConnected) sprite.setAttribute('src', idleSource);
        return;
      }
      const f = frames[i];
      frame.style.backgroundPosition = `${f.x}px ${f.y}px`;
      frame.style.transform = `translate(calc(-50% + ${f.dx}px), calc(-50% + ${f.dy}px)) rotate(${f.r}deg) scale(1.15)`;
      i++;
      if (i < frames.length) {
        setTimeout(show, f.ms);
      } else {
        setTimeout(() => {
          if (run === luBuPhase2AttackRun) {
            frame.remove();
            sprite.style.removeProperty('opacity');
            if (oldTransform) sprite.style.setProperty('transform', oldTransform);
            else sprite.style.removeProperty('transform');
            if (oldOrigin) sprite.style.setProperty('transform-origin', oldOrigin);
            else sprite.style.removeProperty('transform-origin');
            sprite.setAttribute('src', idleSource);
          }
        }, 60);
      }
    };
    show();
    return true;
  }

  const previous = window.playParallelThreeKingdomsBossAttackStoryboard;
  window.playParallelThreeKingdomsBossAttackStoryboard = (name, skillName) => {
    const cleanName = String(name || '').trim();
    const skill = String(skillName || '').trim();
    const luBuMonster = (() => {
      try {
        return typeof currentMonster !== 'undefined' && currentMonster?.name === '呂布'
          ? currentMonster : null;
      } catch (_) { return null; }
    })();
    const hasExplicitLuBuPhase = !!luBuMonster
      && luBuMonster._parallelLuBuPhase !== undefined
      && luBuMonster._parallelLuBuPhase !== null;
    // 第一階段的明確狀態必須優先，避免第二階段全域旗標或弓系技能資料殘留。
    const isLuBuPhase2 = cleanName === '呂布' && (
      hasExplicitLuBuPhase
        ? Number(luBuMonster._parallelLuBuPhase) === 2
        : (window.__parallelLuBuPhase2Active === true
          || luBuMonster?.attackType === '轅門射戟'
          || luBuMonster?.basicAttackName === '轅門射戟'
          || skill.includes('轅門射戟'))
    );
    // 呂布第一階段：直接使用 GitHub 內的 6 張 PNG 攻擊影格，確保戰鬥流程一定會實際播放 PNG。
    if (cleanName === '呂布' && !isLuBuPhase2) {
      const phase1Frames = Array.from({ length: 6 }, (_, index) =>
        `assets/monsters/parallel_three_kingdoms/lu_bu_attack/frame_${String(index + 1).padStart(2, '0')}.png`
      );
      const stage = document.getElementById('battle-stage');
      const sprite = document.querySelector('#monster-icon .monster-sprite');
      const player = document.getElementById('player-icon');
      if (!stage || !sprite || !player || !sprite.isConnected) return false;

      const run = ++luBuPhase2AttackRun;
      const idleSource = sprite.getAttribute('src') || sprite.src;
      const overlay = document.createElement('img');
      overlay.className = 'lu-bu-phase1-png-attack';
      overlay.alt = '';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.draggable = false;
      overlay.style.cssText = 'position:absolute;pointer-events:none;z-index:95;width:230px;height:260px;object-fit:contain;transform:translate(-50%,-50%);image-rendering:auto;filter:drop-shadow(0 0 12px rgba(255,45,45,.95)) drop-shadow(0 0 24px rgba(120,0,20,.8));';

      const stageRect = stage.getBoundingClientRect();
      const monsterRect = sprite.getBoundingClientRect();
      overlay.style.left = `${monsterRect.left - stageRect.left + monsterRect.width * .50}px`;
      overlay.style.top = `${monsterRect.top - stageRect.top + monsterRect.height * .48}px`;
      stage.appendChild(overlay);
      sprite.style.setProperty('opacity', '0', 'important');

      const durations = [120, 105, 100, 85, 150, 180];
      let i = 0;
      const show = () => {
        if (run !== luBuPhase2AttackRun || !overlay.isConnected || !sprite.isConnected) {
          overlay.remove();
          sprite.style.removeProperty('opacity');
          if (sprite.isConnected) sprite.setAttribute('src', idleSource);
          return;
        }
        overlay.src = typeof resolveEmbeddedAsset === 'function' ? resolveEmbeddedAsset(phase1Frames[i]) : phase1Frames[i];
        i++;
        if (i < phase1Frames.length) {
          setTimeout(show, durations[i - 1]);
        } else {
          setTimeout(() => {
            if (run === luBuPhase2AttackRun) {
              overlay.remove();
              sprite.style.removeProperty('opacity');
              sprite.setAttribute('src', idleSource);
            }
          }, durations[i - 1]);
        }
      };
      show();
      return true;
    }

    // 呂布第二階段：直接使用 3x2 PNG 弓形態攻擊精靈圖。
    if (isLuBuPhase2) return playLuBuPhase2PngAttack() || (typeof previous === 'function' ? previous(name, skillName) : false);
    const definition = definitionByName.get(cleanName);
    if (definition) return playFrameSequence(definition);
    return previous?.(name, skillName) || false;
  };
})();
