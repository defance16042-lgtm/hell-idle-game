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


// 第二階段：赤兔鬼神・騎射形態（第一階段 HP 歸零後才切換）
(() => {
  'use strict';
  if (window.__parallelLuBuMountedArcherPhaseV1) return;
  window.__parallelLuBuMountedArcherPhaseV1 = true;

  const ROOT = 'assets/monsters/parallel_three_kingdoms/';
  // 逐格使用真正全身透明素材；不依賴曾失效的佔位精靈表，也不把角色縮成小圖示。
  const PHASE2_PATHS = [
    ROOT + 'lu_bu_red_hare_phase2_idle.png',
    ROOT + 'lu_bu_red_hare_phase2_attack/frame_03_aim.png',
    ROOT + 'lu_bu_red_hare_phase2_attack/frame_04_release.png',
    ROOT + 'lu_bu_red_hare_phase2_attack/frame_05_recover.png'
  ];
  const resolvePhase2Asset = path => typeof resolveEmbeddedAsset === 'function' ? resolveEmbeddedAsset(path) : path;
  const FRAME_IMAGES = PHASE2_PATHS.map(path => {
    const image = new Image();
    image.decoding = 'async';
    image.src = resolvePhase2Asset(path);
    return image;
  });
  const FRAME_SOURCES = FRAME_IMAGES.map(image => image.src);
  const IDLE_FRAME = FRAME_SOURCES[0];
  const waitImages = Promise.all(FRAME_IMAGES.map(image => {
    if (image.complete) return Promise.resolve(image.naturalWidth > 0);
    return new Promise(resolve => {
      image.addEventListener('load', () => resolve(true), { once: true });
      image.addEventListener('error', () => resolve(false), { once: true });
    });
  }));
  const idleFrameSource = () => IDLE_FRAME;
  const ATTACKS = {
    '赤焰穿雲箭': { frames: [1, 2, 3], times: [230, 190, 220] },
    '鬼神連珠射': { frames: [1, 2, 1, 2, 3], times: [110, 100, 100, 100, 220] },
    '赤兔迴旋斬射': { frames: [1, 2, 3, 1, 2, 3], times: [100, 100, 160, 100, 100, 220] },
    '赤兔滅世箭': { frames: [1, 1, 2, 3], times: [220, 250, 230, 260] }
  };
  let playbackToken = 0;
  let playbackTimers = [];

  function getSprite() {
    return document.querySelector('#monster-icon .monster-sprite');
  }
  function stopPlayback() {
    playbackToken++;
    playbackTimers.forEach(clearTimeout);
    playbackTimers = [];
  }
  function playFrames(indices, durations) {
    const sprite = getSprite();
    if (!sprite) return false;
    stopPlayback();
    const token = playbackToken;
    let cursor = 0;
    const step = () => {
      if (token !== playbackToken || !sprite.isConnected) return;
      if (cursor >= indices.length) {
        sprite.src = idleFrameSource();
        return;
      }
      const imageIndex = indices[cursor];
      sprite.src = FRAME_SOURCES[imageIndex] || sprite.src;
      const delay = durations[cursor] || 120;
      cursor++;
      playbackTimers.push(setTimeout(step, delay));
    };
    waitImages.then(results => {
      if (token !== playbackToken) return;
      if (results.every(Boolean)) step();
      else if (typeof addBattleLog === 'function') addBattleLog('⚠️ 呂布第二階段動畫素材尚未完整載入。');
    });
    return true;
  }

  window.advanceParallelLuBuBossPhase = function(monster) {
    if (!monster || monster.name !== '呂布' || Number(monster._luBuPhaseIndex || 0) !== 0 || Number(monster.hp) > 0) return false;
    monster._luBuPhaseIndex = 1;
    monster.maxHp = 3200000;
    monster.hp = monster.maxHp;
    monster.atk = Math.floor((Number(monster.atk) || 12800) * 1.28);
    monster.attackSpeed = 0.76;
    monster.attackType = '赤兔鬼神騎射';
    monster.basicAttackName = '赤焰穿雲箭';
    monster.attackRange = 'ranged';
    monster.damageType = 'physical';
    monster.image = idleFrameSource();
    monster.battleImage = idleFrameSource();
    monster.skills = [
      { name: '赤焰穿雲箭', phase: 'normal', chance: 0.34, damageType: 'physical', attackRange: 'ranged', powerMultiplier: 2.05, effect: 'heavy' },
      { name: '鬼神連珠射', phase: 'normal', chance: 0.30, damageType: 'physical', attackRange: 'ranged', powerMultiplier: 1.72, effect: 'shock', hits: 4 },
      { name: '赤兔迴旋斬射', phase: 'lowHp', chance: 0.22, damageType: 'physical', attackRange: 'ranged', powerMultiplier: 2.25, effect: 'heavy', hits: 3 },
      { name: '赤兔滅世箭', phase: 'lowHp', chance: 0.14, damageType: 'physical', attackRange: 'ranged', powerMultiplier: 3.4, effect: 'shock' }
    ];
    monster.bossPhases = [
      { name: '赤紫鬼神・方天畫戟', trigger: '第一條生命', description: '騎乘赤兔馬，以方天畫戟進行近戰攻擊。' },
      { name: '赤兔鬼神・騎射形態', trigger: '第一階段 HP 歸零後', description: '赤兔馬進入鬼焰奔馳，呂布改用寶雕弓發動連射與終極箭技。' }
    ];
    stopPlayback();
    const sprite = getSprite();
    waitImages.then(ok => { if (ok && Number(monster._luBuPhaseIndex) === 1) { monster.image = IDLE_FRAME; monster.battleImage = IDLE_FRAME; if (sprite) sprite.src = IDLE_FRAME; } });
    if (sprite) sprite.src = idleFrameSource();
    const stage = document.getElementById('monster-icon');
    if (stage) {
      stage.classList.remove('monster-hit-recoil');
      stage.classList.add('lu-bu-phase-two-enter');
      setTimeout(() => stage.classList.remove('lu-bu-phase-two-enter'), 900);
    }
    if (typeof updateMonsterHealthUI === 'function') updateMonsterHealthUI();
    if (typeof updateGameUI === 'function') updateGameUI();
    if (typeof addBattleLog === 'function') addBattleLog('🐎 <strong style="color:#ff70dc">呂布第一階段戰敗！赤兔馬嘶鳴躍起，呂布拔出寶雕弓——第二階段【赤兔鬼神・騎射形態】降臨！</strong>');
    if (typeof saveGame === 'function') saveGame();
    if (typeof window.showFloatingDmg === 'function') window.showFloatingDmg('monster-icon', '第二形態', '#ff70dc', '', '赤兔鬼神');
    if (typeof window.updateMonsterHealthUI === 'function') window.updateMonsterHealthUI();
    if (typeof window.updateGameUI === 'function') window.updateGameUI();
    try { if (typeof nextPlayerAttackAt !== 'undefined') nextPlayerAttackAt = Date.now() + 1200; } catch (_) {}
    try { if (typeof nextMonsterAttackAt !== 'undefined') nextMonsterAttackAt = Date.now() + 1500; } catch (_) {}
    try { if (typeof monsterDefeatInProgress !== 'undefined') monsterDefeatInProgress = false; } catch (_) {}
    try { if (typeof monsterZeroHpSince !== 'undefined') monsterZeroHpSince = 0; } catch (_) {}
    return true;
  };

  const previousStoryboard = window.playParallelThreeKingdomsBossAttackStoryboard;
  window.playParallelThreeKingdomsBossAttackStoryboard = function(name, attackName, ...rest) {
    if ((name === '呂布' || name === '吕布') && Number((typeof currentMonster !== 'undefined' ? currentMonster : window.currentMonster)?._luBuPhaseIndex) === 1) {
      const key = Object.keys(ATTACKS).find(label => String(attackName || '').includes(label)) || '赤焰穿雲箭';
      const attack = ATTACKS[key];
      return playFrames(attack.frames, attack.times);
    }
    return typeof previousStoryboard === 'function'
      ? previousStoryboard.call(this, name, attackName, ...rest)
      : false;
  };
  window.playLuBuMountedArcherStoryboard = attackName => {
    const key = Object.keys(ATTACKS).find(label => String(attackName || '').includes(label)) || '赤焰穿雲箭';
    return playFrames(ATTACKS[key].frames, ATTACKS[key].times);
  };
  const style = document.createElement('style');
  style.textContent = '@keyframes luBuPhaseTwoEnter{0%{filter:brightness(1);transform:translateY(0) scale(1)}35%{filter:brightness(2.4) drop-shadow(0 0 26px #ff42d7);transform:translateY(-18px) scale(1.08)}100%{filter:brightness(1.2) drop-shadow(0 0 12px #a800ff);transform:translateY(0) scale(1)}}#monster-icon.lu-bu-phase-two-enter{animation:luBuPhaseTwoEnter .9s ease-out}';
  document.head.appendChild(style);
})();
