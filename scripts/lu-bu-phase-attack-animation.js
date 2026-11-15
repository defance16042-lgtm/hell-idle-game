(() => {
  'use strict';
  if (window.__luBuPhaseAttackAnimationV1) return;
  window.__luBuPhaseAttackAnimationV1 = true;

  const BASE = 'assets/monsters/parallel_three_kingdoms/';
  const PHASE1 = Array.from({ length: 6 }, (_, i) => `${BASE}lu_bu_attack/frame_${String(i + 1).padStart(2, '0')}.png`);
  const PHASE2 = Array.from({ length: 6 }, (_, i) => `${BASE}lu_bu_attack_wave/frame_${String(i + 1).padStart(2, '0')}.png`);
  const DURATIONS = [105, 90, 85, 85, 95, 115];
  let runId = 0;
  let activeRoot = null;
  let activeSprite = null;
  let originalVisibility = '';
  let activeFrameRequest = 0;

  function asset(path) {
    return typeof window.resolveEmbeddedAsset === 'function' ? window.resolveEmbeddedAsset(path) : path;
  }

  function clearAnimation() {
    runId++;
    if (activeFrameRequest) cancelAnimationFrame(activeFrameRequest);
    activeFrameRequest = 0;
    activeRoot?.remove();
    activeRoot = null;
    if (activeSprite?.isConnected) activeSprite.style.visibility = originalVisibility;
    activeSprite = null;
  }

  function makeRoot(stage) {
    const root = document.createElement('div');
    root.className = 'lu-bu-attack-overlay';
    root.setAttribute('aria-hidden', 'true');
    root.style.cssText = 'position:absolute;inset:0;z-index:120;overflow:visible;pointer-events:none;contain:layout style;';
    if (getComputedStyle(stage).position === 'static') stage.style.position = 'relative';
    stage.appendChild(root);
    return root;
  }

  function playLuBuAttack(_name, attackName) {
    const monster = typeof currentMonster !== 'undefined' ? currentMonster : window.currentMonster;
    if (!monster || monster.name !== '呂布') return false;
    const icon = document.querySelector('#monster-icon');
    const sprite = icon?.querySelector('.monster-sprite');
    const stage = icon?.closest('.battle-stage') || document.getElementById('battle-stage');
    if (!sprite || !stage) return false;

    clearAnimation();
    const id = ++runId;
    const requestedAttack = String(attackName || '').trim();
    const phase2 = Number(monster._parallelLuBuPhase) === 2
      || window.__parallelLuBuPhase2Active === true
      || monster.attackType === '轅門射戟'
      || monster.basicAttackName === '轅門射戟'
      || requestedAttack.includes('轅門射戟');
    const root = makeRoot(stage);
    activeRoot = root;
    activeSprite = sprite;
    originalVisibility = sprite.style.visibility;
    sprite.style.visibility = 'hidden';

    const stageRect = stage.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    const centerX = iconRect.left - stageRect.left + iconRect.width / 2;
    const centerY = iconRect.top - stageRect.top + iconRect.height / 2;
    const spriteImg = document.createElement('img');
    spriteImg.alt = '';
    spriteImg.draggable = false;
    spriteImg.decoding = 'async';
    spriteImg.src = asset(phase2 ? (monster.phase2Image || `${BASE}lu_bu-bow-boss.png`) : PHASE1[0]);
    spriteImg.style.cssText = `position:absolute;left:${centerX}px;top:${centerY}px;width:min(30vw,230px);height:min(39vh,260px);min-width:150px;min-height:180px;max-width:230px;max-height:260px;object-fit:contain;object-position:center;transform:translate(-50%,-50%);filter:drop-shadow(0 0 8px rgba(255,65,45,.82));`;
    root.appendChild(spriteImg);

    const effect = document.createElement('img');
    effect.alt = '';
    effect.draggable = false;
    effect.decoding = 'async';
    effect.style.cssText = 'position:absolute;width:clamp(120px,25vw,220px);height:clamp(80px,18vh,150px);object-fit:contain;opacity:0;filter:drop-shadow(0 0 12px rgba(70,190,255,.85)) drop-shadow(0 0 18px rgba(255,65,80,.75));';
    root.appendChild(effect);

    const durations = phase2 ? [100, 105, 105, 105, 105, 105] : DURATIONS;
    let frame = 0;
    let lastSpriteFrame = -1;
    let startedAt = 0;
    const total = durations.reduce((a, b) => a + b, 0);
    const effectStart = phase2 ? 130 : 310;
    const effectDuration = phase2 ? 700 : 610;
    let effectFrame = 0;
    let lastEffectFrame = 0;

    function tick(now) {
      if (id !== runId || !root.isConnected) return;
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;

      if (!phase2) {
        let sum = 0;
        let target = 0;
        while (target < DURATIONS.length - 1 && elapsed >= sum + DURATIONS[target]) sum += DURATIONS[target++];
        frame = target;
        if (frame !== lastSpriteFrame) {
          spriteImg.src = asset(PHASE1[frame]);
          lastSpriteFrame = frame;
        }
      } else {
        // 第二階段維持完整弓將全身；輕微拉弓蓄力，不以裁切放大角色圖層。
        const pull = elapsed < 190 ? 1 + elapsed / 190 * 0.045 : elapsed < 340 ? 1.045 : 1.045 - Math.min(1, (elapsed - 340) / 260) * 0.045;
        spriteImg.style.transform = `translate(-50%,-50%) scale(${pull})`;
        if (elapsed > 260 && elapsed < 520) spriteImg.style.filter = 'drop-shadow(0 0 12px rgba(255,210,95,.98)) drop-shadow(0 0 20px rgba(255,75,45,.8))';
      }

      if (elapsed >= effectStart && elapsed <= effectStart + effectDuration) {
        const q = Math.max(0, Math.min(1, (elapsed - effectStart) / effectDuration));
        const stageWidth = stage.clientWidth;
        const xStart = centerX - 15;
        const xEnd = Math.max(24, Math.min(stageWidth * 0.28, centerX - 115));
        const x = xStart + (xEnd - xStart) * q;
        const y = centerY + (phase2 ? 5 : 16) + Math.sin(q * Math.PI) * (phase2 ? -18 : -8);
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        effect.style.transform = `translate(-50%,-50%) scale(${0.7 + Math.sin(q * Math.PI) * 0.35}) rotate(${phase2 ? -8 : -3}deg)`;
        effect.style.opacity = String(Math.min(1, (elapsed - effectStart) / 90, (effectStart + effectDuration - elapsed) / 120));
        const desired = Math.min(5, Math.floor(q * 6));
        if (desired !== lastEffectFrame || !effect.src) {
          effectFrame = desired;
          lastEffectFrame = desired;
          effect.src = asset(PHASE2[effectFrame]);
        }
      } else {
        effect.style.opacity = '0';
      }

      const finishAt = Math.max(total, effectStart + effectDuration) + 120;
      if (elapsed < finishAt) activeFrameRequest = requestAnimationFrame(tick);
      else clearAnimation();
    }
    activeFrameRequest = requestAnimationFrame(tick);
    return true;
  }

  window.playParallelThreeKingdomsBossAttackStoryboard = function(name, attackName) {
    if (name === '呂布') return playLuBuAttack(name, attackName);
    if (name === '董卓' && typeof window.playDongZhuoAttackStoryboard === 'function') return window.playDongZhuoAttackStoryboard();
    return false;
  };
  window.addEventListener('pagehide', clearAnimation, { once: true });
})();
