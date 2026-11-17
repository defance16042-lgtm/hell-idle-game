(() => {
  'use strict';
  if (window.__parallelThreeKingdomsLuBuBestiaryPortraitV1) return;
  window.__parallelThreeKingdomsLuBuBestiaryPortraitV1 = true;

  const ZONE = '平行三國';
  if (typeof zoneMonsters === 'undefined' || !zoneMonsters) return;

  const portrait = 'assets/monsters/parallel_three_kingdoms/lu_bu_dark_chibi_idle.png';
  const mountedIdle = 'assets/monsters/parallel_three_kingdoms/lu_bu_red_hare_idle.png';
  const monster = {
    name: '呂布', icon: null,
    image: portrait, battleImage: mountedIdle,
    level: 100, levelRange: '100', attackSpeed: 0.88,
    hp: 2480000, maxHp: 2480000, atk: 12800, def: 4380, magicDefense: 3960,
    attackType: '赤紫方天裂空斬', basicAttackName: '赤紫方天裂空斬',
    attackRange: 'melee', damageType: 'physical',
    exp: 280000, gold: 128000, type: 'boss', encounterChance: 0.5,
    facing: 'left-full-body', orientation: 'strict-left-profile',
    visualNote: '可愛黑暗風格的呂布騎乘赤兔馬；呂布、赤兔馬、馬尾、四蹄、披風與方天畫戟完整入鏡並朝左。',
    baseStats: { str: 2680, dex: 1180, con: 2460, wis: 1040, int: 980, cha: 320 },
    bonusStats: { attack: 326, defense: 284, magicDefense: 246, critical: 0.38, evasion: 0.16 },
    element: 'shadow',
    skills: [
      { name: '赤紫方天裂空斬', phase: 'normal', chance: 0.42, damageType: 'physical', attackRange: 'melee', powerMultiplier: 2.12, effect: 'heavy' },
      { name: '鬼神踏陣', phase: 'lowHp', chance: 0.24, damageType: 'physical', attackRange: 'melee', powerMultiplier: 1.88, effect: 'shock' }
    ],
    description: '平行三國區域首領。呂布騎乘赤兔馬揮動方天畫戟，以紅紫鬼火包裹的奔襲斬擊攻向玩家。',
    dropTable: ['魂幣 128,000', '經驗 280,000', '補血藥水（12%）'],
    uniqueDrops: [],
    bossPhases: [
      { name: '赤紫鬼神', trigger: '戰鬥開始', description: '呂布騎乘赤兔馬，以赤紫方天裂空斬與鬼神踏陣發動近戰攻擊。' }
    ],
    zone: ZONE, threatTier: 'parallel-three-kingdoms-boss'
  };

  const roster = Array.isArray(zoneMonsters[ZONE]) ? zoneMonsters[ZONE] : (zoneMonsters[ZONE] = []);
  const existing = roster.find(entry => entry && entry.name === monster.name);
  if (existing) Object.assign(existing, monster);
  else roster.push(monster);
  window.parallelThreeKingdomsLuBu = existing || monster;
})();
