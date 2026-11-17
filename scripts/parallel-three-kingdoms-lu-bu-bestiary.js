(() => {
  'use strict';
  if (window.__parallelThreeKingdomsLuBuBestiaryPortraitV1) return;
  window.__parallelThreeKingdomsLuBuBestiaryPortraitV1 = true;

  const zoneName = '平行三國';
  const portraitPath = 'assets/monsters/parallel_three_kingdoms/lu_bu_dark_chibi_idle.png';
  const applyPortrait = () => {
    const roster = typeof zoneMonsters !== 'undefined'
      ? zoneMonsters[zoneName]
      : window.zoneMonsters?.[zoneName];
    const luBu = Array.isArray(roster)
      ? roster.find(monster => monster && monster.name === '呂布')
      : null;
    if (!luBu) return false;

    // Only change the bestiary portrait. Preserve the existing battle sprite and all gameplay data.
    luBu.image = portraitPath;
    return true;
  };

  applyPortrait();
  if (typeof window.openBestiaryZone === 'function') {
    const originalOpenBestiaryZone = window.openBestiaryZone;
    window.openBestiaryZone = function (...args) {
      applyPortrait();
      return originalOpenBestiaryZone.apply(this, args);
    };
  }
})();
