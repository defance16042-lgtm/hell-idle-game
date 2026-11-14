(() => {
  'use strict';
  if (window.__BESTIARY_TABS_V3__) return;
  window.__BESTIARY_TABS_V3__ = true;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const fmt = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString('zh-TW') : '—';
  const typeName = monster => monster?.type === 'boss' ? 'BOSS' : monster?.type === 'special' ? '特殊怪' : monster?.type === 'training' ? '修練目標' : '一般怪';
  const typeClass = monster => monster?.type === 'boss' ? 'boss' : monster?.type === 'special' ? 'special' : monster?.type === 'training' ? 'training' : 'normal';
  const icon = monster => monster?.type === 'boss' ? '👑' : monster?.type === 'special' ? '✦' : monster?.type === 'training' ? '🎯' : '👹';
  const sourceZones = () => typeof window.getBestiaryZones === 'function' ? window.getBestiaryZones() : [];
  const modalBody = () => document.getElementById('modal-body');
  const modal = () => document.getElementById('modal-window');
  const render = html => {
    const body = modalBody();
    const win = modal();
    if (!body || !win) return;
    body.className = 'bestiary-v3';
    body.dataset.modalType = 'bestiary-v3';
    body.innerHTML = html;
    win.style.display = 'flex';
  };

  const legacyDetail = window.openBestiaryDetailV2;
  const legacyDetailByIndex = window.openBestiaryDetail;
  const CAVE = '魔物首領窟';
  const SECOND = '魔物首領窟・第二層';
  const THIRD = '魔物首領窟・第三層';
  const zoneList = () => sourceZones().filter(([zone]) => zone !== SECOND && zone !== THIRD).map(([zone, list]) => ({ zone, list: (list || []).filter(Boolean) }));
  const layerList = key => {
    const source = typeof zoneMonsters !== 'undefined' ? zoneMonsters : {};
    return Array.isArray(source[key]) ? source[key].filter(Boolean) : (zoneList().find(item => item.zone === key)?.list || []);
  };
  const layers = [
    { key: CAVE, title: '第一層', icon: '🏰', tone: '#d6a64c', desc: '魔物首領窟原始第一層。' },
    { key: SECOND, title: '第二層', icon: '🌊', tone: '#37e8ff', desc: '海底深淵、墮落天界與九神龍圖鑑。' },
    { key: THIRD, title: '第三層', icon: '🪐', tone: '#b35cff', desc: '克卜勒異星機械首領層。' }
  ];
  const state = { zone: '', page: 1, pageSize: Number.MAX_SAFE_INTEGER };

  function shell(title, subtitle, content) {
    return `<div class="b3-shell"><header class="b3-header"><div><div class="b3-kicker">HELL IDLE · BESTIARY</div><h3>${title}</h3><p>${subtitle}</p></div><button class="modal-btn b3-close" type="button" data-b3-action="close">關閉圖鑑</button></header>${content}</div>`;
  }

  function bind() {
    const body = modalBody();
    if (!body) return;
    body.querySelectorAll('[data-b3-action="close"]').forEach(button => button.addEventListener('click', () => window.closeModal?.()));
    body.querySelectorAll('[data-b3-zone]').forEach(button => button.addEventListener('click', () => openZone(button.dataset.b3Zone)));
    body.querySelectorAll('[data-b3-layer]').forEach(button => button.addEventListener('click', () => openZone(button.dataset.b3Layer)));
    body.querySelectorAll('[data-b3-monster]').forEach(button => button.addEventListener('click', () => openDetail(button.dataset.b3Zone, button.dataset.b3Monster)));
    body.querySelectorAll('[data-b3-page]').forEach(button => button.addEventListener('click', () => {
      state.page = Number(button.dataset.b3Page) || 1;
      openZone(state.zone);
    }));
  }

  function openHome() {
    const zones = zoneList();
    const cards = zones.map(({ zone, list }) => {
      const levels = list.map(m => Number(m.level)).filter(Number.isFinite);
      const zoneIcon = zone === '平行三國'
        ? '<img class="parallel-three-kingdoms-bestiary-icon" src="assets/regions/parallel-three-kingdoms-bestiary-icon.png" alt="平行三國怪物圖鑑原始圖示" loading="eager">'
        : (typeof window.getBestiaryZoneIcon === 'function'
          ? window.getBestiaryZoneIcon(zone)
          : (zone.includes('克卜勒') ? '🪐' : zone.includes('三國') ? '⚔️' : zone.includes('首領窟') ? '🏰' : '🗺️'));
      const isCave = zone === CAVE;
      return `<button type="button" class="b3-zone-card" data-b3-zone="${esc(zone)}"><span class="b3-zone-icon">${zoneIcon}</span><strong>${esc(zone)}</strong><span>${isCave ? '第一層・第二層・第三層' : `${list.length} 筆怪物資料`}</span><small>${isCave ? '進入後選擇樓層' : (levels.length ? `等級 ${Math.min(...levels)}–${Math.max(...levels)}` : '尚無等級資料')}</small></button>`;
    }).join('');
    const total = zones.reduce((sum, item) => sum + item.list.length, 0);
    render(shell('📖 怪物全圖鑑', `共收錄 ${total} 筆資料；圖鑑只依區域分類，請選擇要查看的區域。`, `<section class="b3-page"><div class="b3-page-title"><strong>區域分類</strong><span>每個區域獨立分頁顯示怪物資料</span></div><div class="b3-zone-grid">${cards || '<p class="b3-empty">目前尚無圖鑑資料。</p>'}</div></section>`));
    bind();
  }

  function monsterCards(entries) {
    return entries.map(({ zone, monster }) => `<button type="button" class="b3-monster-card ${typeClass(monster)}" data-b3-zone="${esc(zone)}" data-b3-monster="${esc(monster.name)}"><span class="b3-monster-art">${monster.image ? `<img src="${esc(typeof window.resolveEmbeddedAsset === 'function' ? window.resolveEmbeddedAsset(monster.image) : monster.image)}" alt="${esc(monster.name)}" loading="lazy">` : esc(monster.icon || icon(monster))}</span><span class="b3-monster-info"><strong>${esc(monster.name)}</strong><span><b>Lv.${esc(monster.levelRange || monster.level || '—')}</b>｜${typeName(monster)}</span><small>生命 ${fmt(monster.hp || monster.maxHp)}｜攻擊 ${fmt(monster.atk)}</small></span></button>`).join('');
  }

  function openZone(zone) {
    state.zone = zone;
    if (zone === CAVE) return openCaveLayers();
    const entry = zoneList().find(item => item.zone === zone);
    const source = entry || { zone, list: layerList(zone) };
    if (!source.list.length) return openHome();
    const list = source.list.slice().sort((a, b) => (Number(a.level) || 0) - (Number(b.level) || 0) || String(a.name).localeCompare(String(b.name), 'zh-Hant'));
    const pages = Math.max(1, Math.ceil(list.length / state.pageSize));
    state.page = Math.min(Math.max(1, state.page), pages);
    const pageItems = list.slice((state.page - 1) * state.pageSize, state.page * state.pageSize).map(monster => ({ zone, monster }));
    const pager = pages > 1 ? `<div class="b3-pager"><button class="modal-btn" data-b3-page="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>上一頁</button><span>第 ${state.page}／${pages} 頁</span><button class="modal-btn" data-b3-page="${state.page + 1}" ${state.page >= pages ? 'disabled' : ''}>下一頁</button></div>` : '';
    render(shell(`🗺️ ${esc(zone)}`, `本區資料獨立保存，共 ${source.list.length} 筆怪物資料；目前顯示第 ${state.page} 頁。`, `<div class="b3-subnav"><button class="modal-btn" data-b3-action="back-zones">← 返回區域分類</button></div><section class="b3-page"><div class="b3-card-grid">${monsterCards(pageItems) || '<p class="b3-empty">此區域目前沒有怪物資料。</p>'}</div>${pager}</section>`));
    const body = modalBody();
    body.querySelector('[data-b3-action="back-zones"]')?.addEventListener('click', openHome);
    bind();
  }

  function openCaveLayers() {
    const cards = layers.map(layer => {
      const list = layerList(layer.key);
      const levels = list.map(m => Number(m.level)).filter(Number.isFinite);
      return `<button type="button" class="b3-zone-card b3-layer-card" data-b3-layer="${esc(layer.key)}" style="border-color:${layer.tone};"><span class="b3-zone-icon">${layer.icon}</span><strong>${layer.title}</strong><span>${list.length} 筆怪物資料</span><small>${layer.desc}${levels.length ? `｜等級 ${Math.min(...levels)}–${Math.max(...levels)}` : ''}</small></button>`;
    }).join('');
    render(shell('🏰 魔物首領窟｜樓層圖鑑', '請選擇第一層、第二層或第三層；三層資料分開保存。', `<div class="b3-subnav"><button class="modal-btn" data-b3-action="back-zones">← 返回區域分類</button></div><section class="b3-page"><div class="b3-zone-grid">${cards}</div></section>`));
    const body = modalBody();
    body.querySelector('[data-b3-action="back-zones"]')?.addEventListener('click', openHome);
    bind();
  }

  function openDetail(zone, name) {
    // 所有區域都沿用呂布所在「平行三國」的完整分頁詳情，而不是回到舊版三分頁卡片。
    if (typeof legacyDetailByIndex === 'function' && typeof window.getBestiaryEntries === 'function') {
      const index = window.getBestiaryEntries().findIndex(entry => entry?.zone === zone && entry?.monster?.name === name);
      if (index >= 0) return legacyDetailByIndex(index);
    }
    if (typeof legacyDetail === 'function') return legacyDetail(zone, name);
  }

  window.openBestiaryTabsV3 = openHome;
  window.openBestiaryV2 = openHome;
  window.openBestiary = openHome;
  // 詳情分頁內的「返回區域」按鈕會呼叫這個名稱，需回到新版橫式圖鑑入口。
  window.openBestiaryZone = openZone;
  window.openBestiaryZoneV2 = openZone;
  window.openBestiaryDetailV2 = openDetail;
})();
