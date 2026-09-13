let currentPage = 'home';

const levels = [
  { id: 'n5', name: 'N5', title: 'N5 — Pemula', description: 'Pelajaran untuk pemula absolut. Mulai dari kana dasar.', icon: 'あ' },
  { id: 'n4', name: 'N4', title: 'N4 — Menengah Bawah', description: 'Bangun fondasi grammar dan vocab.', icon: '漢' },
  { id: 'n3', name: 'N3', title: 'N3 — Menengah', description: 'Tingkatkan kemampuan membaca dan mendengar.', icon: '文' }
];

function init() {
  loadTheme();
  renderHome();
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', toggleTheme);
}

function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
let _levelState = { levelId: null, tab: 'semua', query: '' };

function renderHome() {
  currentPage = 'home';
  _levelState = { levelId: null, tab: 'semua', query: '' };
  const main = document.getElementById('home');
  main.removeAttribute('data-level-view');
  main.innerHTML = '<p>Pilih level belajarmu:</p><div id="level-cards">' +
    levels.map(l =>
      `<div class="card" data-level="${l.id}"><span class="card-icon">${l.icon}</span><div class="card-body"><h2>${l.name}</h2><p>${l.description}</p></div></div>`
    ).join('') +
    '</div>';
  main.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => { goLevel(card.dataset.level); });
  });
}

function goLevel(id) {
  const level = levels.find(l => l.id === id);
  if (!level) return;
  currentPage = `level:${id}`;
  _levelState = { levelId: id, tab: 'semua', query: '' };
  const main = document.getElementById('home');
  main.setAttribute('data-level-view', id);
  main.innerHTML =
    `<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali ke daftar level">← Kembali</button><span class="page-header__level">${escHtml(level.name)}</span></div>` +
    `<div class="level-loading" role="status" aria-live="polite"><div class="spinner" aria-hidden="true"></div><p>Memuat materi ${escHtml(level.name)}…</p></div>`;
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', renderHome);
  WakaruData.load(id).then(function (data) {
    // race guard: user went back before load finished
    if (_levelState.levelId !== id || currentPage !== `level:${id}`) return;
    renderLevelView(level, data);
  }).catch(function (err) {
    if (_levelState.levelId !== id || currentPage !== `level:${id}`) return;
    renderLevelError(level, err);
  });
}

function renderLevelError(level, err) {
  const main = document.getElementById('home');
  const msg = err && err.message ? err.message : 'Gagal memuat data.';
  main.innerHTML =
    `<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali ke daftar level">← Kembali</button><span class="page-header__level">${escHtml(level.name)}</span></div>` +
    `<div class="level-hero" data-level="${escHtml(level.id)}"><h1>${escHtml(level.title)}</h1><p class="level-hero__desc">${escHtml(level.description)}</p></div>` +
    `<div class="error-state" role="alert"><p class="error-state__title">Gagal memuat materi</p><p class="error-state__msg">${escHtml(msg)}</p><button class="btn-retry" id="btn-retry" type="button">Coba lagi</button></div>`;
  document.getElementById('back-btn').addEventListener('click', renderHome);
  const retry = document.getElementById('btn-retry');
  if (retry) retry.addEventListener('click', function () { goLevel(level.id); });
}

function renderLevelView(level, data) {
  const main = document.getElementById('home');
  const prog = WakaruData.getLevelProgress(level.id);
  const kanjiTotal = data.kanji.length;
  const kosakataTotal = data.kosakata.length;
  const kanjiSeenCount = WakaruData.getProgress(level.id).kanjiSeen.length;
  const kosakataSeenCount = WakaruData.getProgress(level.id).kosakataSeen.length;
  main.innerHTML =
    `<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali ke daftar level">← Kembali</button><span class="page-header__level">${escHtml(level.name)}</span></div>` +
    `<div class="level-hero" data-level="${escHtml(level.id)}">` +
      `<h1>${escHtml(level.title)}</h1>` +
      `<p class="level-hero__desc">${escHtml(level.description)}</p>` +
      `<div class="lev-progress" role="group" aria-label="Progres belajar">` +
        `<div class="lev-progress__item">` +
          `<div class="lev-progress__head"><span class="lev-progress__label">Kanji</span><span class="lev-progress__pct" id="pct-kanji">${prog.kanjiPct}%</span></div>` +
          `<div class="lev-progress__track" aria-hidden="true"><div class="lev-progress__fill" id="fill-kanji" style="width:${prog.kanjiPct}%"></div></div>` +
          `<span class="lev-progress__sub" id="sub-kanji">${kanjiSeenCount} dari ${kanjiTotal} dipelajari</span>` +
        `</div>` +
        `<div class="lev-progress__item">` +
          `<div class="lev-progress__head"><span class="lev-progress__label">Kosakata</span><span class="lev-progress__pct" id="pct-kosakata">${prog.kosakataPct}%</span></div>` +
          `<div class="lev-progress__track" aria-hidden="true"><div class="lev-progress__fill lev-progress__fill--vocab" id="fill-kosakata" style="width:${prog.kosakataPct}%"></div></div>` +
          `<span class="lev-progress__sub" id="sub-kosakata">${kosakataSeenCount} dari ${kosakataTotal} dipelajari</span>` +
        `</div>` +
      `</div>` +
    `</div>` +
    `<div class="level-toolbar">` +
      `<label class="search-wrap" aria-label="Cari materi">` +
        `<span class="search-wrap__icon" aria-hidden="true">⌕</span>` +
        `<input class="search-input" id="materi-search" type="search" placeholder="Cari kanji atau kosakata…" autocomplete="off" spellcheck="false" aria-label="Cari materi">` +
      `</label>` +
      `<div class="tabs" role="tablist" aria-label="Filter materi">` +
        `<button class="tab is-active" role="tab" aria-selected="true" data-tab="semua" type="button">Semua</button>` +
        `<button class="tab" role="tab" aria-selected="false" data-tab="kanji" type="button">Kanji</button>` +
        `<button class="tab" role="tab" aria-selected="false" data-tab="kosakata" type="button">Kosakata</button>` +
      `</div>` +
    `</div>` +
    `<div id="level-count" class="level-count" aria-live="polite"></div>` +
    `<div id="level-list" class="materi-list" aria-live="polite"></div>` +
    `<div id="level-empty" class="empty-state" hidden><p class="empty-state__title">Tidak ditemukan</p><p class="empty-state__msg">Coba kata kunci lain atau ganti filter.</p></div>`;
  document.getElementById('back-btn').addEventListener('click', renderHome);
  bindLevelEvents(level.id, data);
  renderMateriList(level.id, data);
}

function bindLevelEvents(levelId, data) {
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      const tab = t.dataset.tab;
      if (!tab || _levelState.tab === tab) return;
      _levelState.tab = tab;
      tabs.forEach(function (x) {
        const active = x.dataset.tab === tab;
        x.classList.toggle('is-active', active);
        x.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      renderMateriList(levelId, data);
    });
  });
  const search = document.getElementById('materi-search');
  if (search) {
    search.addEventListener('input', function () {
      _levelState.query = search.value;
      renderMateriList(levelId, data);
    });
  }
  const listEl = document.getElementById('level-list');
  if (listEl) {
    listEl.addEventListener('click', function (e) {
      const item = e.target.closest('.materi-item');
      if (!item) return;
      const type = item.dataset.type;
      const id = item.dataset.id;
      if (!type || !id) return;
      const wasSeen = WakaruData.isSeen(levelId, type, id);
      WakaruData.markSeen(levelId, type, id);
      if (!wasSeen) {
        item.classList.add('is-seen');
        const seenDot = item.querySelector('.mi-seen');
        if (seenDot) seenDot.setAttribute('aria-label', 'Sudah dilihat');
        // update progress live
        updateProgressBars(levelId);
        // subtle feedback
        item.classList.add('is-tapped');
        setTimeout(function () { item.classList.remove('is-tapped'); }, 220);
      }
      // hook untuk P2.4: detail kanji akan dibuka di sini
      // if (type === 'kanji') openKanjiDetail(levelId, id);
    });
  }
}

function updateProgressBars(levelId) {
  const prog = WakaruData.getLevelProgress(levelId);
  const p = WakaruData.getProgress(levelId);
  const data = WakaruData.getLevel(levelId);
  if (!data) return;
  const elPctK = document.getElementById('pct-kanji');
  const elFillK = document.getElementById('fill-kanji');
  const elSubK = document.getElementById('sub-kanji');
  const elPctV = document.getElementById('pct-kosakata');
  const elFillV = document.getElementById('fill-kosakata');
  const elSubV = document.getElementById('sub-kosakata');
  if (elPctK) elPctK.textContent = prog.kanjiPct + '%';
  if (elFillK) elFillK.style.width = prog.kanjiPct + '%';
  if (elSubK) elSubK.textContent = p.kanjiSeen.length + ' dari ' + data.kanji.length + ' dipelajari';
  if (elPctV) elPctV.textContent = prog.kosakataPct + '%';
  if (elFillV) elFillV.style.width = prog.kosakataPct + '%';
  if (elSubV) elSubV.textContent = p.kosakataSeen.length + ' dari ' + data.kosakata.length + ' dipelajari';
}

function filterKanjiList(list, q) {
  if (!q) return list;
  const needle = q.toLowerCase().trim();
  if (!needle) return list;
  return list.filter(function (k) {
    const mean = k.meanings_id.join(' ').toLowerCase();
    return k.kanji.indexOf(needle) !== -1 || mean.indexOf(needle) !== -1;
  });
}

function renderMateriList(levelId, data) {
  const query = _levelState.query || '';
  const tab = _levelState.tab || 'semua';
  const trimmedQ = query.trim();
  let kanjiFiltered = filterKanjiList(data.kanji, trimmedQ);
  let vocabFiltered;
  if (trimmedQ) {
    vocabFiltered = WakaruData.searchKosakata(levelId, trimmedQ);
  } else {
    vocabFiltered = data.kosakata.slice();
  }
  const listEl = document.getElementById('level-list');
  const emptyEl = document.getElementById('level-empty');
  const countEl = document.getElementById('level-count');
  if (!listEl) return;
  let html = '';
  let showEmpty = false;
  let countText = '';
  if (tab === 'kanji') {
    if (kanjiFiltered.length === 0) showEmpty = true;
    else { html = kanjiFiltered.map(function (k) { return kanjiItemHtml(levelId, k); }).join(''); countText = kanjiFiltered.length + ' kanji'; }
  } else if (tab === 'kosakata') {
    if (vocabFiltered.length === 0) showEmpty = true;
    else { html = vocabFiltered.map(function (v, idx) { return vocabItemHtml(levelId, v, idx); }).join(''); countText = vocabFiltered.length + ' kosakata'; }
  } else {
    const hasKanji = kanjiFiltered.length > 0;
    const hasVocab = vocabFiltered.length > 0;
    if (!hasKanji && !hasVocab) showEmpty = true;
    else {
      if (hasKanji) {
        html += `<p class="section-head"><span>Kanji</span><span class="section-head__count">${kanjiFiltered.length}</span></p>`;
        html += kanjiFiltered.map(function (k) { return kanjiItemHtml(levelId, k); }).join('');
      }
      if (hasVocab) {
        html += `<p class="section-head"><span>Kosakata</span><span class="section-head__count">${vocabFiltered.length}</span></p>`;
        html += vocabFiltered.map(function (v, idx) { return vocabItemHtml(levelId, v, idx); }).join('');
      }
      const parts = [];
      if (hasKanji) parts.push(kanjiFiltered.length + ' kanji');
      if (hasVocab) parts.push(vocabFiltered.length + ' kosakata');
      countText = parts.join(' · ');
    }
  }
  listEl.innerHTML = html;
  if (countEl) countEl.textContent = showEmpty ? '' : countText;
  if (emptyEl) emptyEl.hidden = !showEmpty;
  listEl.hidden = showEmpty;
}

function kanjiItemHtml(levelId, k) {
  const seen = WakaruData.isSeen(levelId, 'kanji', k.kanji);
  const meanings = escHtml(k.meanings_id.join('; '));
  const on = k.on_readings.length ? escHtml(k.on_readings.join('・')) : '—';
  const kun = k.kun_readings.length ? escHtml(k.kun_readings.join('・')) : '—';
  const stroke = k.stroke_count ? k.stroke_count + ' goresan' : '';
  return `<button type="button" class="materi-item materi-kanji${seen ? ' is-seen' : ''}" data-type="kanji" data-id="${escHtml(k.kanji)}" aria-label="Kanji ${escHtml(k.kanji)}, ${meanings}">` +
    `<span class="mi-kanji" lang="ja" aria-hidden="true">${escHtml(k.kanji)}</span>` +
    `<span class="mi-body">` +
      `<span class="mi-mean">${meanings}</span>` +
      `<span class="mi-read"><span class="mi-read__label">on</span> ${on} <span class="mi-read__sep">/</span> <span class="mi-read__label">kun</span> ${kun}</span>` +
      (stroke ? `<span class="mi-meta">${escHtml(stroke)}</span>` : '') +
    `</span>` +
    `<span class="mi-seen${seen ? ' is-on' : ''}" aria-hidden="true" title="${seen ? 'Sudah dilihat' : ''}">${seen ? '✓' : ''}</span>` +
  `</button>`;
}

function vocabItemHtml(levelId, v, idx) {
  // id stabil: kana+kanji+arti membedakan homonim (mis. 暑い/熱い/厚い → sama kana)
  const stableId = (v.kanji || '') + '|' + v.kana + '|' + v.arti;
  const seen = WakaruData.isSeen(levelId, 'kosakata', stableId);
  const displayKanji = v.kanji ? escHtml(v.kanji) : '';
  const displayKana = escHtml(v.kana);
  const arti = escHtml(v.arti);
  const romaji = escHtml(v.romaji);
  const cat = escHtml(v.category || '');
  return `<button type="button" class="materi-item materi-vocab${seen ? ' is-seen' : ''}" data-type="kosakata" data-id="${escHtml(stableId)}" aria-label="${displayKanji || displayKana}, ${arti}">` +
    `<span class="mi-body">` +
      `<span class="mi-vhead"><span class="mi-vkanji" lang="ja">${displayKanji || displayKana}</span>${displayKanji ? `<span class="mi-vkana" lang="ja">${displayKana}</span>` : ''}</span>` +
      `<span class="mi-mean mi-mean--vocab">${arti}</span>` +
      `<span class="mi-romaji">${romaji}</span>` +
    `</span>` +
    (cat ? `<span class="mi-cat">${cat}</span>` : '') +
    `<span class="mi-seen${seen ? ' is-on' : ''}" aria-hidden="true">${seen ? '✓' : ''}</span>` +
  `</button>`;
}

function wakaruGoBack() {
  if (currentPage !== 'home') {
    renderHome();
    return 'true';
  }
  return 'false';
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('wakaru-theme', next); } catch(e) {}
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
  const btn = document.getElementById('theme-toggle');
  let saved = null;
  try { saved = localStorage.getItem('wakaru-theme'); } catch(e) {}
  const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

init();
