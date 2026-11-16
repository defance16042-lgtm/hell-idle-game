(() => {
  'use strict';
  if (window.__parallelThreeKingdomsLiJueV1) return;
  window.__parallelThreeKingdomsLiJueV1 = true;
  const ZONE = '平行三國';
  const ROOT = 'assets/monsters/parallel_three_kingdoms/';
  const ARMOR = 'assets/items/';
  if (typeof zoneMonsters === 'undefined' || !zoneMonsters) return;

  const monster = {
    name: '李傕將軍',
    icon: '👹',
    image: ROOT + 'li-jue-general.svg',
    battleImage: ROOT + 'li-jue-general.svg',
    level: 80, levelRange: '80', attackSpeed: 1.18,
    hp: 428000, maxHp: 428000, atk: 7620, def: 2580, magicDefense: 2060,
    attackType: '鬼神斷月斬', basicAttackName: '鬼神斷月斬',
    attackRange: 'melee', damageType: 'physical',
    exp: 92500, gold: 31200, type: 'special', specialMonster: true,
    specialTier: '平行三國特殊怪', encounterChance: 8,
    facing: 'left-full-body', orientation: 'strict-left-profile',
    visualNote: '可愛黑暗 Q 版李傕將軍，黑紅金紫重甲、紅披風、額冠與李傕軍旗；完整站立全身圖。',
    baseStats: { str: 1580, dex: 690, con: 1460, wis: 520, int: 390, cha: 210 },
    bonusStats: { attack: 188, defense: 126, magicDefense: 82, critical: 0.25, evasion: 0.09 },
    skills: [
      { name: '鬼神斷月斬', phase: 'normal', chance: 0.42, damageType: 'physical', attackRange: 'melee', powerMultiplier: 1.62 },
      { name: '赤焰裂陣', phase: 'normal', chance: 0.24, damageType: 'physical', attackRange: 'melee', powerMultiplier: 1.84 },
      { name: '紫魘鬼神爆', phase: 'lowHp', chance: 0.36, damageType: 'magic', attackRange: 'melee', powerMultiplier: 2.08 }
    ],
    description: '平行三國的李傕將軍，身披黑紅金紫鬼將重甲，揮舞鬼刃巨斧。戰旗獵獵、紫色鬼火纏身，外表兇悍卻保留圓臉短腿的可愛黑暗 Q 版比例。',
    dropTable: ['李傕鬼王盔（戰士專屬一般頭盔，可強化｜需求等級 80｜獨立掉落率 5%）', '李傕破軍戰甲（戰士專屬一般胸甲，可強化｜需求等級 80｜獨立掉落率 5%）', '鬼神斬月斧（戰士專屬一般雙手斧，可強化｜需求等級 80｜獨立掉落率 5%）', '暗紅兵符', '鬼將殘頁'],
    uniqueDrops: [
      '李傕鬼王盔｜一般頭盔｜戰士專屬、可強化｜需求等級 80｜獨立掉落率 5%｜物理防禦 +142｜魔法防禦 +96｜力量 +28、體質 +24、精神 +18｜生命 +900｜物理減傷 +3%',
      '李傕破軍戰甲｜一般胸甲｜戰士專屬、可強化｜需求等級 80｜獨立掉落率 5%｜物理防禦 +236｜魔法防禦 +158｜力量 +32、體質 +48、精神 +20｜生命 +1800｜物理減傷 +5%',
      '鬼神斬月斧｜一般雙手斧｜戰士專屬、可強化｜需求等級 80｜獨立掉落率 5%｜攻擊力 +292｜力量 +42、體質 +18｜暴擊率 +4%｜命中 +18｜攻擊速度 +6%'
    ],
    zone: ZONE, threatTier: 'parallel-three-kingdoms-special'
  };
  const roster = Array.isArray(zoneMonsters[ZONE]) ? zoneMonsters[ZONE] : (zoneMonsters[ZONE] = []);
  const existing = roster.find(entry => entry && entry.name === monster.name);
  if (existing) Object.assign(existing, monster); else roster.push(monster);
  window.parallelThreeKingdomsLiJue = monster;

  const dropDefs = [
    { id:'parallel_li_jue_ghost_helm_v1', name:'李傕鬼王盔', kind:'armor', slot:'head', slotLabel:'頭盔',
      icon:ARMOR+'li-jue-war-helm.svg', physicalDefenseBonus:142, magicDefenseBonus:96,
      statBonuses:{str:28,con:24,wis:18}, extraBonuses:{hpBonus:900,physicalDamageReduction:0.03}, classKeys:['warrior'] },
    { id:'parallel_li_jue_broken_army_armor_v1', name:'李傕破軍戰甲', kind:'armor', slot:'chest', slotLabel:'胸甲',
      icon:ARMOR+'li-jue-破軍戰甲.svg', physicalDefenseBonus:236, magicDefenseBonus:158,
      statBonuses:{str:32,con:48,wis:20}, extraBonuses:{hpBonus:1800,physicalDamageReduction:0.05}, classKeys:['warrior'] },
    { id:'parallel_li_jue_ghost_moon_axe_v1', name:'鬼神斬月斧', kind:'weapon', slot:'weapon', slotLabel:'武器',
      icon:ARMOR+'li-jue-ghost-axe.svg', attackBonus:292, statBonuses:{str:42,con:18,meleeCritRate:0.04},
      extraBonuses:{accuracyBonus:18,attackSpeedBonus:0.06}, classKeys:['warrior'], type:'雙手斧', weaponType:'two-handed-axe', handType:'two-handed', damageType:'physical' }
  ];
  window.awardParallelThreeKingdomsLiJueDrops = function(target) {
    const player = typeof currentPlayer !== 'undefined' ? currentPlayer : window.currentPlayer;
    if (!player || !target || target.name !== monster.name || target.__liJueDropsResolved) return 0;
    target.__liJueDropsResolved = true;
    player.items ||= {};
    player.items.armors = Array.isArray(player.items.armors) ? player.items.armors : [];
    player.items.weapons = Array.isArray(player.items.weapons) ? player.items.weapons : [];
    let count = 0;
    for (const def of dropDefs) {
      if (Math.random() >= 0.05) continue;
      const item = {
        instanceId: def.id + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
        id:def.id, templateId:def.id, kind:def.kind, name:def.name,
        slot:def.slot, slotLabel:def.slotLabel, icon:def.icon, iconAsset:def.icon, image:def.icon,
        level:80, requiredLevel:80, requiredMonsterLevel:80,
        rarity:'普通', quality:'普通', qualityColor:'#ffffff',
        classKeys:[...def.classKeys], enhancementLevel:0, enhanceable:true, canEnhance:true, cannotEnhance:false,
        sourceMonster:monster.name, sourceDropChance:0.05,
        uniqueDropType:'parallel_three_kingdoms_li_jue_unique',
        obtainedAt:Date.now(), statBonuses:{...def.statBonuses}, stats:{...def.statBonuses}, bonusStats:{...def.extraBonuses}, ...def.extraBonuses,
        properties:[monster.name+'專屬掉落｜一般裝備｜可強化｜獨立掉落率 5%','需求等級 80｜僅戰士可裝備'], 
        ...(def.kind==='armor' ? {
          armorType:'physical',
          physicalDefenseBonus:def.physicalDefenseBonus, basePhysicalDefenseBonus:def.physicalDefenseBonus,
          magicDefenseBonus:def.magicDefenseBonus, baseMagicDefenseBonus:def.magicDefenseBonus
        } : {
          type:def.type, weaponType:def.weaponType, damageType:def.damageType,
          attackBonus:def.attackBonus, baseAttackBonus:def.attackBonus, baseAttackSpeedBonus:0
        })
      };
      if (def.kind==='weapon') {
        item.properties.push('攻擊力 +292','力量 +42｜體質 +18','暴擊率 +4%','命中 +18','攻擊速度 +6%');
        player.items.weapons.push(item);
      } else {
        item.properties.push('物理防禦 +'+def.physicalDefenseBonus,'魔法防禦 +'+def.magicDefenseBonus,
          ...Object.entries(def.statBonuses).map(([key,value]) => ({str:'力量',dex:'敏捷',con:'體質',wis:'精神',int:'智力',cha:'魅力'}[key]+' +'+value)),
          '生命 +'+def.extraBonuses.hpBonus,'物理減傷 +'+Math.round(def.extraBonuses.physicalDamageReduction*100)+'%');
        player.items.armors.push(item);
      }
      count++;
      if (typeof addBattleLog==='function') addBattleLog('👑 <strong style="color:#d6a0ff">'+monster.name+'掉落【一般裝備 '+def.name+'】！</strong>（戰士專屬｜可強化｜需求等級 80｜獨立掉落率 5%）');
    }
    if (typeof saveGame==='function') saveGame();
    if (document.getElementById('inventory-float')?.style.display==='flex' && typeof renderInventory==='function') renderInventory();
    if (!count && typeof addBattleLog==='function') addBattleLog('🎲 李傕將軍本次沒有掉落專屬裝備（各部位獨立掉落率 5%）。');
    return count;
  };



  function playLiJueAttack() {
    const target = typeof currentMonster!=='undefined' ? currentMonster : window.currentMonster;
    if (!target || target.name!==monster.name) return false;
    const stage = document.getElementById('battle-stage');
    const sprite = document.querySelector('#monster-icon .monster-sprite');
    if (!stage || !sprite) return false;
    const oldTransform=sprite.style.transform, oldFilter=sprite.style.filter, oldTransition=sprite.style.transition;
    let overlay=stage.querySelector('.li-jue-attack-fx');
    overlay?.remove();
    overlay=document.createElement('div');
    overlay.className='li-jue-attack-fx';
    overlay.setAttribute('aria-hidden','true');
    overlay.style.cssText='position:absolute;inset:0;z-index:100;pointer-events:none;overflow:visible;';
    const svg='<svg viewBox="0 0 600 360" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"><defs><linearGradient id="ljg"><stop stop-color="#ff394f" stop-opacity="0"/><stop offset=".5" stop-color="#ff315f"/><stop offset="1" stop-color="#c45cff" stop-opacity="0"/></linearGradient><filter id="ljblur"><feGaussianBlur stdDeviation="7"/></filter></defs><path class="lj-slash" d="M520 80 Q320 15 80 245" fill="none" stroke="url(#ljg)" stroke-width="36" stroke-linecap="round" filter="url(#ljblur)"/><path class="lj-slash2" d="M520 120 Q300 60 115 280" fill="none" stroke="#ffcf75" stroke-width="7" stroke-linecap="round"/><path class="lj-burst" d="M300 40 325 140 420 105 350 185 440 245 325 220 280 330 270 220 155 260 245 180 175 95 275 140Z" fill="#a83dff" opacity="0"/></svg>';
    overlay.innerHTML=svg;
    if (getComputedStyle(stage).position==='static') stage.style.position='relative';
    stage.appendChild(overlay);
    const poses=[
      ['translateX(0) rotate(0deg) scale(1)', 'drop-shadow(0 0 4px #8d35ff)', 150],
      ['translateX(-9px) rotate(-7deg) scale(1.04)', 'drop-shadow(0 0 10px #ff405d)', 130],
      ['translateX(15px) rotate(9deg) scale(1.08)', 'drop-shadow(0 0 18px #ff405d)', 120],
      ['translateX(-7px) rotate(-5deg) scale(1.02)', 'drop-shadow(0 0 20px #b34cff)', 130],
      ['translateY(-16px) rotate(4deg) scale(1.1)', 'drop-shadow(0 0 24px #b34cff)', 170],
      ['translateY(0) rotate(0deg) scale(1)', 'drop-shadow(0 0 5px #8d35ff)', 180]
    ];
    let index=0;
    const tick=()=>{
      if (!sprite.isConnected || !overlay.isConnected) return;
      if (index>=poses.length) {
        sprite.style.transform=oldTransform; sprite.style.filter=oldFilter; sprite.style.transition=oldTransition; overlay.remove(); return;
      }
      const [transform,filter,duration]=poses[index++];
      sprite.style.transition='transform '+duration+'ms ease,filter '+duration+'ms ease';
      sprite.style.transform=transform; sprite.style.filter=filter;
      const slashes=overlay.querySelectorAll('.lj-slash,.lj-slash2');
      slashes.forEach((path,i)=>{path.style.transition='opacity '+duration+'ms ease';path.style.opacity=index>=2&&index<=5?'1':'0';});
      const burst=overlay.querySelector('.lj-burst');
      if (burst) { burst.style.opacity=index===5?'.8':'0'; burst.style.transition='opacity 160ms ease'; }
      setTimeout(tick,duration);
    };
    tick();
    return true;
  }
  const originalStoryboard=window.playParallelThreeKingdomsBossAttackStoryboard;
  window.playParallelThreeKingdomsBossAttackStoryboard=function(name,attackName) {
    if (name==='李傕將軍' || name==='李傕') {
      const played = typeof originalStoryboard==='function' ? originalStoryboard.apply(this,arguments) : false;
      return played || playLiJueAttack();
    }
    return typeof originalStoryboard==='function' ? originalStoryboard.apply(this,arguments) : false;
  };
  window.playLiJueAttackStoryboard=playLiJueAttack;
})();