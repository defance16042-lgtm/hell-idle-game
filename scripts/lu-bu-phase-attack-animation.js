(() => {
  'use strict';
  if (window.__luBuPhaseAttackAnimationV2) return;
  window.__luBuPhaseAttackAnimationV2 = true;

  const BASE = 'assets/monsters/parallel_three_kingdoms/';
  const PHASE1_IDLE = `${BASE}lu_bu_fullbody_left.png`;
  const PHASE1_ATTACK_FRAMES = Array.from({ length: 6 }, (_, i) =>
    `${BASE}lu_bu_attack/frame_${String(i + 1).padStart(2, '0')}.png`
  );
  const PHASE2_IDLE = `${BASE}lu_bu_mounted_archer_chibi.png`;
  const PHASE2_ATTACK_SHEET = `${BASE}lu_bu_phase2_attack_spritesheet.png`;
  const PHASE2_POSITIONS = ['0% 0%', '50% 0%', '100% 0%', '0% 100%', '50% 100%', '100% 100%'];
  const PHASE1_DURATIONS = [120, 105, 100, 85, 150, 180];
  const PHASE2_DURATIONS = [120, 105, 100, 80, 150, 180];
  let runId = 0;
  let activeRoot = null;
  let activeSprite = null;
  let originalVisibility = '';

  function asset(path) {
    return typeof window.resolveEmbeddedAsset === 'function' ? window.resolveEmbeddedAsset(path) : path;
  }

  function clearAnimation() {
    runId++;
    activeRoot?.remove();
    activeRoot = null;
    if (activeSprite?.isConnected) {
      activeSprite.style.visibility = originalVisibility;
      const monster = typeof currentMonster !== 'undefined' ? currentMonster : window.currentMonster;
      if (monster?.name === '呂布') {
        const phase = Number(monster._parallelLuBuPhase || 1);
        activeSprite.setAttribute('src', asset(phase === 2 ? PHASE2_IDLE : PHASE1_IDLE));
      }
    }
    activeSprite = null;
  }

  function syncLuBuIdleArtwork() {
    const monster = typeof currentMonster !== 'undefined' ? currentMonster : window.currentMonster;
    if (!monster || monster.name !== '呂布') return;
    const phase = Number(monster._parallelLuBuPhase || 1);
    if (phase !== 1 && phase !== 2) return;
    const sprite = document.querySelector('#monster-icon .monster-sprite');
    const wanted = phase === 2 ? PHASE2_IDLE : PHASE1_IDLE;
    if (sprite && sprite.getAttribute('src') !== asset(wanted)) sprite.setAttribute('src', asset(wanted));
  }

  const luBuArtworkObserver = new MutationObserver(syncLuBuIdleArtwork);
  luBuArtworkObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'class']
  });
  syncLuBuIdleArtwork();

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
    sprite.setAttribute('src', asset(phase2 ? PHASE2_IDLE : PHASE1_IDLE));
    sprite.style.visibility = 'hidden';

    const stageRect = stage.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    const centerX = iconRect.left - stageRect.left + iconRect.width / 2;
    const centerY = iconRect.top - stageRect.top + iconRect.height / 2;

    const attackVisual = document.createElement('div');
    attackVisual.setAttribute('aria-hidden', 'true');
    attackVisual.style.cssText = [
      'position:absolute',
      `left:${centerX}px`,
      `top:${centerY}px`,
      'width:min(30vw,230px)',
      'height:min(39vh,260px)',
      'min-width:150px',
      'min-height:180px',
      'max-width:230px',
      'max-height:260px',
      'transform:translate(-50%,-50%)',
      'background-repeat:no-repeat',
      'background-position:center',
      'background-size:contain',
      'filter:drop-shadow(0 0 10px rgba(255,45,45,.9))',
      'pointer-events:none',
      'image-rendering:auto'
    ].join(';');
    root.appendChild(attackVisual);

    const frames = phase2 ? PHASE2_POSITIONS : PHASE1_ATTACK_FRAMES.map(path => path);
    const durations = phase2 ? PHASE2_DURATIONS : PHASE1_DURATIONS;
    let frameIndex = 0;
    let lastFrame = -1;

    const showFrame = () => {
      if (id !== runId || !root.isConnected || !sprite.isConnected) return;

      if (frameIndex !== lastFrame) {
        if (phase2) {
          attackVisual.style.backgroundImage = `url("${asset(PHASE2_ATTACK_SHEET)}")`;
          attackVisual.style.backgroundSize = '300% 200%';
          attackVisual.style.backgroundPosition = PHASE2_POSITIONS[frameIndex];
          attackVisual.style.filter = 'drop-shadow(0 0 13px rgba(255,45,65,1)) drop-shadow(0 0 24px rgba(125,0,30,.9))';
        } else {
          attackVisual.style.backgroundImage = `url("${asset(frames[frameIndex])}")`;
          attackVisual.style.backgroundSize = 'contain';
          attackVisual.style.backgroundPosition = 'center';
          attackVisual.style.filter = 'drop-shadow(0 0 12px rgba(255,45,45,.95)) drop-shadow(0 0 24px rgba(120,0,20,.8))';
        }
        lastFrame = frameIndex;
      }

      const delay = durations[frameIndex];
      frameIndex++;
      if (frameIndex < frames.length) {
        setTimeout(showFrame, delay);
      } else {
        setTimeout(() => {
          if (id === runId) clearAnimation();
        }, delay);
      }
    };

    showFrame();
    return true;
  }

  window.playLuBuDarkChibiAttack = function() {
    return playLuBuAttack('呂布', '赤焰騎戰');
  };

  window.playParallelThreeKingdomsBossAttackStoryboard = function(name, attackName) {
    if (name === '呂布') return playLuBuAttack(name, attackName);
    if (name === '董卓' && typeof window.playDongZhuoAttackStoryboard === 'function') return window.playDongZhuoAttackStoryboard();
    return false;
  };
})();
