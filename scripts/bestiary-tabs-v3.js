(() => {
  'use strict';
  if (window.__BESTIARY_TABS_V3__) return;
  window.__BESTIARY_TABS_V3__ = true;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const fmt = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString('zh-TW') : '—';
  const typeName = monster => monster?.type === 'boss' ? 'BOSS' : monster?.type === 'special' ? '特殊怪' : monster?.type === 'training' ? '修練目標' : '一般怪';
  const typeClass = monster => monster?.type === 'boss' ? 'boss' : monster?.type === 'special' ? 'special' : monster?.type === 'training' ? 'training' : 'normal';
  const icon = monster => monster?.type === 'boss' ? '👑' : monster?.type === 'special' ? '✦' : monster?.type === 'training' ? '🎯' : '👹';
  const sourceZones = () => {
    if (typeof window.getBestiaryZones === 'function') return window.getBestiaryZones();
    return [];
  };
  const allEntries = () => sourceZones().flatMap(([zone, list]) => (Array.isArray(list) ? list : []).filter(Boolean).map(monster => ({ zone, monster })));
  const modalBody = () => document.getElementById('modal-body');
  const modal = () => document.getElementById('modal-window');
  const render = html => { const body = modalBody(); const win = modal(); if (!body || !win) return; body.className = 'bestiary-v3'; body.dataset.modalType = 'bestiary-v3'; body.innerHTML = html; win.style.display = 'flex'; };

  let state = { zone: '', filter: 'all', page: 1, pageSize: 10 };
  const legacyDetail = window.openBestiaryDetailV2;
  const legacyDetailByIndex = window.openBestiaryDetail;
  const zoneList = () => sourceZones().map(([zone, list]) => ({ zone, list: (list || []).filter(Boolean) }));

  function tabs(active) {
    return `<nav class="b3-tabs" role="tablist" aria-label="怪物圖鑑分類分頁">
      <button type="button" class="${active === 'zones' ? 'active' : ''}" data-b3-home="zones">區域圖鑑</button>
      <button type="button" class="${active === 'types' ? 'active' : ''}" data-b3-home="types">怪物類型</button>
      <button type="button" class="${active === 'levels' ? 'active' : ''}" data-b3-home="levels">等級索引</button>
    </nav>`;
  }
  function shell(title, subtitle, active, content, back = '') {
    return `<div class="b3-shell"><header class="b3-header"><div><div class="b3-kicker">HELL IDLE · BESTIARY</div><h3>${title}</h3><p>${subtitle}</p></div><button class="modal-btn b3-close" type="button" data-b3-action="close">關閉圖鑑</button></header>${back}${content}</div>`;
  }
  function bind() {
    const body = modalBody(); if (!body) return;
    body.querySelectorAll('[data-b3-home]').forEach(button => button.addEventListener('click', () => {
      const key = button.dataset.b3Home; key === 'zones' ? openHome() : key === 'types' ? openTypes() : openLevels();
    }));
    body.querySelectorAll('[data-b3-action="close"]').forEach(button => button.addEventListener('click', () => window.closeModal?.()));
    body.querySelectorAll('[data-b3-zone]').forEach(button => button.addEventListener('click', () => openZone(button.dataset.b3Zone)));
    body.querySelectorAll('[data-b3-monster]').forEach(button => button.addEventListener('click', () => openDetail(button.dataset.b3Zone, button.dataset.b3Monster)));
    body.querySelectorAll('[data-b3-filter]').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.b3Filter; state.page = 1; openZone(state.zone); }));
    body.querySelectorAll('[data-b3-page]').forEach(button => button.addEventListener('click', () => { state.page = Number(button.dataset.b3Page) || 1; openZone(state.zone); }));
  }
  function openHome() {
    const zones = zoneList();
    const cards = zones.map(({ zone, list }) => {
      const field = list.filter(m => m.type !== 'training');
      const levels = field.map(m => Number(m.level)).filter(Number.isFinite);
      return `<button type="button" class="b3-zone-card" data-b3-zone="${esc(zone)}"><span class="b3-zone-icon">${zone.includes('克卜勒') ? '🪐' : zone.includes('三國') ? '⚔️' : zone.includes('首領窟') ? '🏰' : '🗺️'}</span><strong>${esc(zone)}</strong><span>${field.length} 種怪物${list.length > field.length ? `｜修練 ${list.length - field.length}` : ''}</span><small>${levels.length ? `等級 ${Math.min(...levels)}–${Math.max(...levels)}` : '尚無一般戰鬥資料'}</small></button>`;
    }).join('');
    const total = allEntries().length;
    render(shell('📖 怪物全圖鑑', `共收錄 ${total} 筆資料。每個區域、類型與等級都獨立分頁，呂布與克卜勒資料分區保存。`, 'zones', `${tabs('zones')}<section class="b3-page"><div class="b3-page-title"><strong>區域分頁</strong><span>請點選一個區域進入該區怪物清單</span></div><div class="b3-zone-grid">${cards || '<p class="b3-empty">目前尚無圖鑑資料。</p>'}</div></section>`));
    bind();
  }
  function openTypes() {
    const entries = allEntries();
    const groups = [['normal','一般怪物','🗡️'],['special','特殊怪物','✦'],['boss','首領 BOSS','👑'],['training','修練目標','🎯']].map(([key, title, glyph]) => {
      const items = entries.filter(({ monster }) => typeClass(monster) === key);
      const zones = [...new Set(items.map(x => x.zone))];
      return `<button type="button" class="b3-type-card ${key}" data-b3-filter-type="${key}"><span>${glyph}</span><strong>${title}</strong><small>${items.length} 筆｜${zones.length} 個區域</small></button>`;
    }).join('');
    render(shell('📚 怪物類型索引', '把所有區域資料依一般怪、特殊怪、BOSS 與修練目標分頁整理。', 'types', `${tabs('types')}<section class="b3-page"><div class="b3-type-grid">${groups}</div><div class="b3-type-hint">點擊類型後會顯示該類型的獨立清單。</div></section>`));
    const body = modalBody(); body.querySelectorAll('[data-b3-filter-type]').forEach(button => button.addEventListener('click', () => openTypeList(button.dataset.b3FilterType)));
    bind();
  }
  function openTypeList(type) {
    const entries = allEntries().filter(({ monster }) => typeClass(monster) === type).sort((a,b) => (Number(a.monster.level)||0)-(Number(b.monster.level)||0));
    const title = { normal:'一般怪物', special:'特殊怪物', boss:'首領 BOSS', training:'修練目標' }[type] || '怪物清單';
    const cards = monsterCards(entries);
    render(shell(`${icon({type})} ${title}`, `本分類共 ${entries.length} 筆資料；按區域與等級整理，不與其他類型混排。`, 'types', `${tabs('types')}<div class="b3-subnav"><button class="modal-btn" data-b3-action="back-types">← 返回類型分頁</button></div><section class="b3-page"><div class="b3-card-grid">${cards || '<p class="b3-empty">目前沒有資料。</p>'}</div></section>`));
    const body = modalBody(); body.querySelector('[data-b3-action="back-types"]')?.addEventListener('click', openTypes); bind();
  }
  function openLevels() {
    const entries = allEntries().filter(({ monster }) => monster.type !== 'training').sort((a,b) => (Number(a.monster.level)||0)-(Number(b.monster.level)||0));
    const buckets = new Map(); entries.forEach(entry => { const level = Number(entry.monster.level); const key = Number.isFinite(level) ? `${Math.floor(level / 10) * 10 + 1}–${Math.floor(level / 10) * 10 + 10}` : '未標示等級'; if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(entry); });
    const cards = [...buckets.entries()].map(([range, list]) => `<button type="button" class="b3-level-card" data-b3-level-range="${esc(range)}"><strong>Lv.${esc(range)}</strong><span>${list.length} 筆怪物資料</span><small>點擊查看此等級分頁</small></button>`).join('');
    render(shell('🧭 等級索引', '依等級區間分頁，避免所有怪物資料一次堆在同一頁。', 'levels', `${tabs('levels')}<section class="b3-page"><div class="b3-level-grid">${cards}</div></section>`));
    const body = modalBody(); body.querySelectorAll('[data-b3-level-range]').forEach(button => button.addEventListener('click', () => openLevelList(button.dataset.b3LevelRange))); bind();
  }
  function openLevelList(range) {
    const entries = allEntries().filter(({ monster }) => { const level = Number(monster.level); return monster.type !== 'training' && (Number.isFinite(level) && `${Math.floor(level / 10) * 10 + 1}–${Math.floor(level / 10) * 10 + 10}` === range); }).sort((a,b) => (Number(a.monster.level)||0)-(Number(b.monster.level)||0));
    render(shell(`🧭 Lv.${esc(range)}`, `此等級分頁共 ${entries.length} 筆，資料依區域與等級排列。`, 'levels', `${tabs('levels')}<div class="b3-subnav"><button class="modal-btn" data-b3-action="back-levels">← 返回等級索引</button></div><section class="b3-page"><div class="b3-card-grid">${monsterCards(entries) || '<p class="b3-empty">目前沒有資料。</p>'}</div></section>`));
    const body = modalBody(); body.querySelector('[data-b3-action="back-levels"]')?.addEventListener('click', openLevels); bind();
  }
  function monsterCards(entries) {
    return entries.map(({ zone, monster }) => `<button type="button" class="b3-monster-card ${typeClass(monster)}" data-b3-zone="${esc(zone)}" data-b3-monster="${esc(monster.name)}"><span class="b3-monster-art">${monster.image ? `<img src="${esc(typeof window.resolveEmbeddedAsset === 'function' ? window.resolveEmbeddedAsset(monster.image) : monster.image)}" alt="${esc(monster.name)}" loading="lazy">` : icon(monster)}</span><span class="b3-monster-info"><strong>${esc(monster.name)}</strong><span><b>Lv.${esc(monster.levelRange || monster.level || '—')}</b>｜${typeName(monster)}</span><small>${esc(zone)}</small><small>生命 ${fmt(monster.hp || monster.maxHp)}｜攻擊 ${fmt(monster.atk)}</small></span></button>`).join('');
  }
  function openZone(zone) {
    state.zone = zone; state.filter = state.filter || 'all';
    const entry = zoneList().find(item => item.zone === zone); if (!entry) return openHome();
    const filters = [['all','全部'],['normal','一般怪'],['special','特殊怪'],['boss','BOSS'],['training','修練']];
    const list = entry.list.filter(m => state.filter === 'all' || typeClass(m) === state.filter).sort((a,b) => (Number(a.level)||0)-(Number(b.level)||0) || String(a.name).localeCompare(String(b.name), 'zh-Hant'));
    const pages = Math.max(1, Math.ceil(list.length / state.pageSize)); state.page = Math.min(Math.max(1, state.page), pages);
    const pageItems = list.slice((state.page - 1) * state.pageSize, state.page * state.pageSize).map(monster => ({ zone, monster }));
    const filterHtml = filters.map(([key,label]) => `<button type="button" class="b3-filter ${state.filter === key ? 'active' : ''}" data-b3-filter="${key}">${label} <small>${key === 'all' ? entry.list.length : entry.list.filter(m => typeClass(m) === key).length}</small></button>`).join('');
    const pager = pages > 1 ? `<div class="b3-pager"><button class="modal-btn" data-b3-page="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>上一頁</button><span>第 ${state.page}／${pages} 頁</span><button class="modal-btn" data-b3-page="${state.page + 1}" ${state.page >= pages ? 'disabled' : ''}>下一頁</button></div>` : '';
    render(shell(`🗺️ ${esc(zone)}`, `本區資料獨立保存，共 ${entry.list.length} 筆；目前顯示 ${list.length} 筆。`, 'zones', `${tabs('zones')}<div class="b3-subnav"><button class="modal-btn" data-b3-action="back-zones">← 返回區域分頁</button></div><section class="b3-page"><div class="b3-filter-row">${filterHtml}</div><div class="b3-card-grid">${monsterCards(pageItems) || '<p class="b3-empty">此分類目前沒有資料。</p>'}</div>${pager}</section>`));
    const body = modalBody(); body.querySelector('[data-b3-action="back-zones"]')?.addEventListener('click', openHome); bind();
  }
  function openDetail(zone, name) {
    if (zone === '平行三國' && typeof legacyDetailByIndex === 'function' && typeof window.getBestiaryEntries === 'function') {
      const index = window.getBestiaryEntries().findIndex(entry => entry?.zone === zone && entry?.monster?.name === name);
      if (index >= 0) return legacyDetailByIndex(index);
    }
    if (typeof legacyDetail === 'function') return legacyDetail(zone, name);
    if (typeof legacyDetailByIndex === 'function') return legacyDetailByIndex(zone, name);
  }
  window.openBestiaryTabsV3 = openHome;
  window.openBestiaryV2 = openHome;
  window.openBestiary = openHome;
  window.openBestiaryZoneV2 = openZone;
  window.openBestiaryDetailV2 = openDetail;
})();
