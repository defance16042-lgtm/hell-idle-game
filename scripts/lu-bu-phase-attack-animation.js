(() => {
  'use strict';
  if (window.__luBuPhaseAttackAnimationV1) return;
  window.__luBuPhaseAttackAnimationV1 = true;

  const BASE = 'assets/monsters/parallel_three_kingdoms/';
  const PHASE1 = Array.from({ length: 6 }, (_, i) => `${BASE}lu_bu_attack/frame_${String(i + 1).padStart(2, '0')}.png`);
  const PHASE2_SHEET = `${BASE}lu_bu_phase2_bow_sheet.png`;
  const PHASE2_POSITIONS = ['0% 0%', '50% 0%', '100% 0%', '0% 100%', '50% 100%', '100% 100%'];
  const DURATIONS = [105, 90, 85, 85, 95, 115];
  const PHASE2_DURATIONS = [140, 120, 130, 120, 130, 180];
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

    const spriteImg = document.createElement('div');
    spriteImg.setAttribute('aria-hidden', 'true');
    spriteImg.style.cssText = `position:absolute;left:${centerX}px;top:${centerY}px;width:min(30vw,230px);height:min(39vh,260px);min-width:150px;min-height:180px;max-width:230px;max-height:260px;transform:translate(-50%,-50%);background-repeat:no-repeat;background-position:center;background-size:contain;background-image:url("${asset(phase2 ? PHASE2_SHEET : PHASE1[0])}");filter:drop-shadow(0 0 8px rgba(255,65,45,.82));`;
    if (phase2) {
      spriteImg.style.backgroundSize = '300% 200%';
      spriteImg.style.backgroundPosition = PHASE2_POSITIONS[0];
    }
    root.appendChild(spriteImg);

    let lastSpriteFrame = -1;
    let startedAt = 0;
    const phase2FinishAt = 1250;
    const phase1FinishAt = DURATIONS.reduce((a, b) => a + b, 0) + 120;

    function tick(now) {
      if (id !== runId || !root.isConnected) return;
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;

      const frameDurations = phase2 ? PHASE2_DURATIONS : DURATIONS;
      let sum = 0;
      let frame = 0;
      while (frame < frameDurations.length - 1 && elapsed >= sum + frameDurations[frame]) sum += frameDurations[frame++];
      if (frame !== lastSpriteFrame) {
        if (phase2) {
          spriteImg.style.backgroundPosition = PHASE2_POSITIONS[frame];
          spriteImg.style.filter = frame === 3 || frame === 4
            ? 'drop-shadow(0 0 13px rgba(255,215,105,1)) drop-shadow(0 0 24px rgba(255,95,25,.9))'
            : 'drop-shadow(0 0 8px rgba(255,65,45,.82))';
        } else {
          spriteImg.style.backgroundImage = `url("${asset(PHASE1[frame])}")`;
        }
        lastSpriteFrame = frame;
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
