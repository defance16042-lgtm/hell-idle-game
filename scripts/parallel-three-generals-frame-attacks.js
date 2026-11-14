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
      names: ['高順將軍', '高順'], bodyDir: 'gao_shun_attack', waveDir: 'gao_shun_attack_wave',
      waveScale: .44, waveCurve: -.012, waveLift: -.02, spriteScale: 1.18,
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
      imageFor(`${root}/${definition.bodyDir}/frame_${String(index + 1).padStart(2, '0')}.png`));
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
    const changedSpriteScale = definition.spriteScale !== 1;
    if (changedSpriteScale) {
      sprite.style.setProperty('scale', String(definition.spriteScale), 'important');
      sprite.style.setProperty('transform-origin', 'center bottom', 'important');
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
      previousSpriteOrigin, previousSpriteOriginPriority
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

  let yuanmenCanvas = null;
  let yuanmenRaf = 0;
  function playLuBuYuanmenShootingVfx() {
    const stage = document.getElementById('battle-stage');
    const sprite = document.querySelector('#monster-icon .monster-sprite');
    const player = document.getElementById('player-icon');
    if (!stage || !sprite || !player) return false;
    if (!yuanmenCanvas || yuanmenCanvas.parentElement !== stage) {
      yuanmenCanvas?.remove();
      yuanmenCanvas = document.createElement('canvas');
      yuanmenCanvas.className = 'lu-bu-yuanmen-vfx';
      yuanmenCanvas.setAttribute('aria-hidden', 'true');
      yuanmenCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:96';
      if (getComputedStyle(stage).position === 'static') stage.style.position = 'relative';
      stage.appendChild(yuanmenCanvas);
    }
    if (yuanmenRaf) cancelAnimationFrame(yuanmenRaf);
    const ctx = yuanmenCanvas.getContext('2d');
    const sr = stage.getBoundingClientRect(), mr = sprite.getBoundingClientRect(), pr = player.getBoundingClientRect();
    const from = { x: mr.left - sr.left + mr.width * .18, y: mr.top - sr.top + mr.height * .42 };
    const to = { x: pr.left - sr.left + pr.width * .50, y: pr.top - sr.top + pr.height * .48 };
    const dx = to.x - from.x, dy = to.y - from.y, distance = Math.max(1, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx), started = performance.now(), duration = 920;
    const draw = now => {
      const rect = stage.getBoundingClientRect();
      if (!yuanmenCanvas?.isConnected) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (yuanmenCanvas.width !== Math.round(rect.width * dpr) || yuanmenCanvas.height !== Math.round(rect.height * dpr)) { yuanmenCanvas.width = Math.round(rect.width * dpr); yuanmenCanvas.height = Math.round(rect.height * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, rect.width, rect.height);
      const t = Math.min(1, Math.max(0, (now - started) / duration));
      const travel = t < .18 ? 0 : Math.min(1, (t - .18) / .57);
      const ease = 1 - Math.pow(1 - travel, 2.1);
      const x = from.x + dx * ease, y = from.y + dy * ease;
      if (t < .25) {
        const r = 10 + t / .25 * 28, g = ctx.createRadialGradient(from.x, from.y, 0, from.x, from.y, r);
        g.addColorStop(0, 'rgba(255,248,190,.95)'); g.addColorStop(.32, 'rgba(255,180,56,.65)'); g.addColorStop(1, 'rgba(147,43,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(from.x, from.y, r, 0, Math.PI * 2); ctx.fill();
      }
      if (t >= .13 && t < .86) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = t > .72 ? Math.max(0, 1 - (t - .72) / .14) : 1;
        const tail = ctx.createLinearGradient(-120, 0, 12, 0); tail.addColorStop(0, 'rgba(117,33,242,0)'); tail.addColorStop(.55, 'rgba(167,57,255,.45)'); tail.addColorStop(1, 'rgba(255,213,91,.95)');
        ctx.fillStyle = tail; ctx.beginPath(); ctx.moveTo(-120, -7); ctx.quadraticCurveTo(-48, -18, 18, -3); ctx.lineTo(30, 0); ctx.lineTo(18, 3); ctx.quadraticCurveTo(-48, 18, -120, 7); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff4b0'; ctx.shadowColor = '#ffad37'; ctx.shadowBlur = 13; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(26, 0); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff7cf'; ctx.beginPath(); ctx.moveTo(31, 0); ctx.lineTo(18, -7); ctx.lineTo(21, 0); ctx.lineTo(18, 7); ctx.closePath(); ctx.fill(); ctx.restore();
        for (let i = 0; i < 6; i++) { const f = (i / 6 + t * 1.7) % 1, px = x - dx * .18 * f, py = y - dy * .18 * f + Math.sin(now * .02 + i) * 5; ctx.fillStyle = i % 2 ? '#c46cff' : '#ffe28b'; ctx.fillRect(px, py, 3, 3); }
      }
      if (t >= .72) {
        const q = Math.min(1, (t - .72) / .28), alpha = 1 - q, r = 12 + q * 52;
        ctx.globalAlpha = alpha; ctx.strokeStyle = '#ffe89a'; ctx.shadowColor = '#b64cff'; ctx.shadowBlur = 18; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(to.x, to.y, r, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.strokeStyle = '#9a46e8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(to.x - r * .7, to.y + r * .45); ctx.lineTo(to.x + r * .7, to.y - r * .45); ctx.stroke();
        for (let i = 0; i < 10; i++) { const a = i * Math.PI * 2 / 10 + angle, inner = 8 + q * 8, outer = 24 + q * 38; ctx.strokeStyle = i % 2 ? '#ffbf50' : '#c56bff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(to.x + Math.cos(a) * inner, to.y + Math.sin(a) * inner); ctx.lineTo(to.x + Math.cos(a) * outer, to.y + Math.sin(a) * outer); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      if (t < 1) yuanmenRaf = requestAnimationFrame(draw); else { ctx.clearRect(0, 0, rect.width, rect.height); yuanmenRaf = 0; }
    };
    yuanmenRaf = requestAnimationFrame(draw);
    return true;
  }
  const previous = window.playParallelThreeKingdomsBossAttackStoryboard;
  window.playParallelThreeKingdomsBossAttackStoryboard = (name, skillName) => {
    const cleanName = String(name || '').trim();
    if (cleanName === '呂布' && window.__parallelLuBuPhase2Active) return playLuBuYuanmenShootingVfx();
    const definition = definitionByName.get(cleanName);
    if (definition) return playFrameSequence(definition);
    return previous?.(name, skillName) || false;
  };
})();
