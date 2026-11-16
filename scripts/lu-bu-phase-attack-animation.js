(() => {
  'use strict';
  if (window.__luBuPhaseAttackAnimationV1) return;
  window.__luBuPhaseAttackAnimationV1 = true;

  const BASE = 'assets/monsters/parallel_three_kingdoms/';
  const PHASE1 = Array.from({ length: 6 }, (_, i) => `${BASE}lu_bu_attack/frame_${String(i + 1).padStart(2, '0')}.png`);
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

  function createBowShotOverlay(root, centerX, centerY, impactX) {
    const layer = document.createElement('div');
    layer.style.cssText = `position:absolute;left:${centerX - 130}px;top:${centerY - 130}px;width:260px;height:260px;overflow:visible;pointer-events:none;filter:drop-shadow(0 0 7px rgba(255,175,45,.8));`;
    layer.innerHTML = `
      <svg viewBox="0 0 260 260" width="260" height="260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="luBuGoldArrow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#fff6bd"/><stop offset=".45" stop-color="#ffc247"/><stop offset="1" stop-color="#e84a18"/>
          </linearGradient>
          <filter id="luBuArrowGlow" x="-80%" y="-100%" width="260%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path d="M145 48 Q78 130 145 212" fill="none" stroke="#f5bd55" stroke-width="7" stroke-linecap="round" opacity=".96"/>
        <path id="luBuBowString" d="M145 48 Q145 130 145 212" fill="none" stroke="#fff1c8" stroke-width="2.2" stroke-linecap="round"/>
        <g id="luBuArrow" filter="url(#luBuArrowGlow)">
          <path id="luBuArrowTrail" d="M172 130 L35 130" fill="none" stroke="url(#luBuGoldArrow)" stroke-width="7" stroke-linecap="round" opacity=".0"/>
          <path d="M172 130 L48 130" fill="none" stroke="#ffe8a1" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M48 130 L67 120 L62 130 L67 140 Z" fill="#fff4c6" stroke="#d98a2d" stroke-width="1.4"/>
          <path d="M160 130 L170 121 M160 130 L170 139" fill="none" stroke="#f8d58a" stroke-width="2"/>
        </g>
        <g id="luBuImpact" opacity="0">
          <circle cx="20" cy="130" r="10" fill="#fff7cb" opacity=".95"/>
          <circle cx="20" cy="130" r="25" fill="none" stroke="#ffb83d" stroke-width="5"/>
          <path d="M20 95 V76 M20 165 V184 M-15 130 H-34 M55 130 H74 M-5 105 L-18 92 M45 155 L58 168 M45 105 L58 92 M-5 155 L-18 168" stroke="#ffe59a" stroke-width="4" stroke-linecap="round"/>
        </g>
      </svg>`;
    root.appendChild(layer);
    const impact = layer.querySelector('#luBuImpact');
    impact.setAttribute('transform', `translate(${impactX - 20} 0)`);
    return {
      layer,
      string: layer.querySelector('#luBuBowString'),
      arrow: layer.querySelector('#luBuArrow'),
      trail: layer.querySelector('#luBuArrowTrail'),
      impact: layer.querySelector('#luBuImpact')
    };
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
    // 明確階段值優先：第一階段不可被殘留的全域旗標、弓形態攻擊資料或上次技能名稱覆蓋。
    const hasExplicitPhase = monster._parallelLuBuPhase !== undefined && monster._parallelLuBuPhase !== null;
    const phase2 = hasExplicitPhase
      ? Number(monster._parallelLuBuPhase) === 2
      : (window.__parallelLuBuPhase2Active === true
        || monster.attackType === '轅門射戟'
        || monster.basicAttackName === '轅門射戟'
        || requestedAttack.includes('轅門射戟'));

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

    const durations = DURATIONS;
    let lastSpriteFrame = -1;
    let startedAt = 0;
    const playerIcon = document.getElementById('player-icon');
    const playerRect = playerIcon?.getBoundingClientRect();
    const targetX = playerRect ? playerRect.left - stageRect.left + playerRect.width * 0.5 : 36;
    const arrowStartX = centerX - 82;
    const impactX = Math.max(15, Math.min(245, targetX - (centerX - 130)));
    const bow = phase2 ? createBowShotOverlay(root, centerX, centerY, impactX) : null;
    const phase2FinishAt = 1080;
    const phase1FinishAt = durations.reduce((a, b) => a + b, 0) + 120;

    function tick(now) {
      if (id !== runId || !root.isConnected) return;
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;

      if (!phase2) {
        let sum = 0;
        let frame = 0;
        while (frame < DURATIONS.length - 1 && elapsed >= sum + DURATIONS[frame]) sum += DURATIONS[frame++];
        if (frame !== lastSpriteFrame) {
          spriteImg.src = asset(PHASE1[frame]);
          lastSpriteFrame = frame;
        }
      } else {
        // 全新弓箭動作：架弓 -> 拉弦蓄力 -> 放箭 -> 箭矢飛向玩家 -> 命中閃光。
        const pullStart = 120;
        const pullEnd = 390;
        const releaseAt = 520;
        const hitAt = 850;
        const pullProgress = Math.max(0, Math.min(1, (elapsed - pullStart) / (pullEnd - pullStart)));
        const easePull = pullProgress * pullProgress * (3 - 2 * pullProgress);
        const released = elapsed >= releaseAt;
        const travelProgress = Math.max(0, Math.min(1, (elapsed - releaseAt) / (hitAt - releaseAt)));
        const travel = Math.max(0, arrowStartX - targetX) * (travelProgress * travelProgress * (3 - 2 * travelProgress));
        const drawBack = released ? 0 : easePull * 30;

        bow.string.setAttribute('d', `M145 48 Q${145 + drawBack} 130 145 212`);
        bow.arrow.setAttribute('transform', `translate(${released ? -travel : drawBack} 0)`);
        bow.trail.setAttribute('opacity', released ? String(Math.min(.95, travelProgress * 1.2)) : String(easePull * .35));
        bow.trail.setAttribute('stroke-width', released ? String(5 + travelProgress * 4) : '3');

        if (elapsed >= pullEnd && elapsed < releaseAt) {
          spriteImg.style.filter = 'drop-shadow(0 0 13px rgba(255,215,105,1)) drop-shadow(0 0 24px rgba(255,95,25,.9))';
          bow.layer.style.filter = 'drop-shadow(0 0 12px rgba(255,200,75,1))';
        } else {
          spriteImg.style.filter = 'drop-shadow(0 0 8px rgba(255,65,45,.82))';
          bow.layer.style.filter = 'drop-shadow(0 0 7px rgba(255,175,45,.8))';
        }
        bow.impact.setAttribute('opacity', elapsed >= hitAt ? String(Math.max(0, 1 - (elapsed - hitAt) / 190)) : '0');
        spriteImg.style.transform = `translate(-50%,-50%) scale(${released ? 1 : 1 + easePull * .025})`;
      }

      const finishAt = phase2 ? phase2FinishAt : phase1FinishAt;
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
