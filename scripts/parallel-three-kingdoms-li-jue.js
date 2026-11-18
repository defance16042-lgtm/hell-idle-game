(() => {
  'use strict';
  if (window.__parallelThreeKingdomsLiJueV1) return;
  window.__parallelThreeKingdomsLiJueV1 = true;
  const ZONE = '平行三國';
  const ROOT = 'assets/monsters/parallel_three_kingdoms/';
  const IDLE = ROOT + 'li_jue_dark_chibi_idle.png';
  const ARMOR = 'assets/items/';
  if (typeof zoneMonsters === 'undefined' || !zoneMonsters) return;

  const monster = {
    name: '李傕將軍',
    icon: '🪓',
    image: IDLE,
    battleImage: IDLE,
    level: 80, levelRange: '80', attackSpeed: 1.18,
    hp: 428000, maxHp: 428000, atk: 7620, def: 2580, magicDefense: 2060,
    attackType: '鬼神斷月斬', basicAttackName: '鬼神斷月斬',
    attackRange: 'melee', damageType: 'physical',
    exp: 92500, gold: 31200, type: 'special', specialMonster: true,
    specialTier: '平行三國特殊怪', encounterChance: 8,
    facing: 'left-full-body', orientation: 'strict-left-profile',
    visualNote: '原創可愛黑暗 Q 版李傕將軍，黑紅金紫鬼將重甲、紅披風與紫色鬼火；完整全身左側身，面朝左。',
    baseStats: { str: 1580, dex: 690, con: 1460, wis: 520, int: 390, cha: 210 },
    bonusStats: { attack: 188, defense: 126, magicDefense: 82, critical: 0.25, evasion: 0.09 },
    skills: [
      { name: '鬼神斷月斬', phase: 'normal', chance: 0.42, damageType: 'physical', attackRange: 'melee', powerMultiplier: 1.62 },
      { name: '赤焰裂陣', phase: 'normal', chance: 0.24, damageType: 'physical', attackRange: 'melee', powerMultiplier: 1.84 },
      { name: '紫魘鬼神爆', phase: 'lowHp', chance: 0.36, damageType: 'magic', attackRange: 'melee', powerMultiplier: 2.08 }
    ],
    description: '平行三國的李傕將軍，身披黑紅金紫鬼將重甲，側身朝左揮舞鬼刃巨斧。紫色鬼火纏身，保留圓臉短腿的可愛黑暗 Q 版比例。',
    dropTable: ['李傕鬼王盔｜戰士專屬裝備｜可強化｜需求等級 80｜獨立掉落率 5%', '李傕破軍戰甲｜戰士專屬裝備｜可強化｜需求等級 80｜獨立掉落率 5%', '鬼神斬月斧｜戰士專屬裝備｜可強化｜需求等級 80｜獨立掉落率 5%', '暗紅兵符', '鬼將殘頁'],
    uniqueDrops: [
      '李傕鬼王盔｜戰士專屬裝備｜可強化｜需求等級 80｜獨立掉落率 5%｜物理防禦 +142｜魔法防禦 +96｜力量 +34、敏捷 +18、體質 +38、精神 +22、智力 +12、魅力 +16｜生命 +900｜物理減傷 +3%',
      '李傕破軍戰甲｜戰士專屬裝備｜可強化｜需求等級 80｜獨立掉落率 5%｜物理防禦 +236｜魔法防禦 +158｜力量 +42、敏捷 +20、體質 +62、精神 +24、智力 +14、魅力 +18｜生命 +1800｜近距離攻擊 +90｜物理減傷 +5%',
      '鬼神斬月斧｜戰士專屬裝備｜可強化｜需求等級 80｜獨立掉落率 5%｜近距離攻擊 +320｜力量 +48、敏捷 +28、體質 +42、精神 +20、智力 +12、魅力 +18｜近距離暴擊率 +5%｜近距離暴擊傷害 +10%｜攻擊速度 +6%｜吸血 +3%'
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
      statBonuses:{str:34,dex:18,con:38,wis:22,int:12,cha:16,maxHp:900,damageReductionPct:0.03}, extraBonuses:{hpBonus:900,physicalDamageReduction:0.03}, classKeys:['warrior'] },
    { id:'parallel_li_jue_broken_army_armor_v1', name:'李傕破軍戰甲', kind:'armor', slot:'chest', slotLabel:'胸甲',
      icon:ARMOR+'li-jue-破軍戰甲.svg', physicalDefenseBonus:236, magicDefenseBonus:158,
      statBonuses:{str:42,dex:20,con:62,wis:24,int:14,cha:18,maxHp:1800,meleeAttackBonus:90,damageReductionPct:0.05}, extraBonuses:{hpBonus:1800,physicalDamageReduction:0.05}, classKeys:['warrior'] },
    { id:'parallel_li_jue_ghost_moon_axe_v1', name:'鬼神斬月斧', kind:'weapon', slot:'weapon', slotLabel:'武器',
      icon:ARMOR+'li-jue-ghost-axe.svg', attackBonus:320, meleeAttackBonus:320, statBonuses:{str:48,dex:28,con:42,wis:20,int:12,cha:18,meleeCritRate:0.05,meleeCritDamage:0.10,attackSpeedBonus:0.06,lifeStealPct:0.03},
      extraBonuses:{accuracyBonus:18,attackSpeedBonus:0.06,meleeAttackBonus:320,meleeCritRate:0.05,meleeCritDamage:0.10,lifeStealPct:0.03}, classKeys:['warrior'], type:'雙手斧', weaponType:'two-handed-axe', handType:'two-handed', damageType:'physical' }
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

})();
