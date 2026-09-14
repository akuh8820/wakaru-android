var currentPage = 'home';

var levels = [
  { id: 'n5', name: 'N5', title: 'N5 — Pemula', description: 'Pelajaran untuk pemula absolut. Mulai dari kana dasar.', icon: 'あ' },
  { id: 'n4', name: 'N4', title: 'N4 — Menengah Bawah', description: 'Bangun fondasi grammar dan vocab.', icon: '漢' },
  { id: 'n3', name: 'N3', title: 'N3 — Menengah', description: 'Tingkatkan kemampuan membaca dan mendengar.', icon: '文' }
];

var _levelState = { levelId: null, tab: 'semua', query: '' };
var _quizState = { levelId: null };
var _flashState = { levelId: null };

// ── Helpers ───────────────────────────────────────────────────────

function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var WakaruAudio = {
  speak: function (text) {
    try {
      if (typeof Android !== 'undefined' && Android && Android.speakJapanese) {
        Android.speakJapanese(String(text || ''));
      }
    } catch (e) { /* silent fallback for browser testing */ }
  }
};

function shuffleArray(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function cleanReadingForSpeech(r) {
  return String(r || '').replace(/[.・\-\u30FC]/g, '');
}

function vocabStableId(v) {
  return (v.kanji || '') + '|' + v.kana + '|' + v.arti;
}

var SPEAKER_ICON = '<svg class="audio-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';

// ── Init / Theme ──────────────────────────────────────────────────

function init() {
  loadTheme();
  renderHome();
  WakaruData.kamusLoad('n5');
  var toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', toggleTheme);
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.audio-btn');
    if (btn) {
      var text = btn.getAttribute('data-speak');
      if (text) WakaruAudio.speak(text);
    }
  });
}

function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('wakaru-theme', next); } catch (e) {}
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
  var btn = document.getElementById('theme-toggle');
  var saved = null;
  try { saved = localStorage.getItem('wakaru-theme'); } catch (e) {}
  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ── Home ──────────────────────────────────────────────────────────

function renderHome() {
  currentPage = 'home';
  _levelState = { levelId: null, tab: 'semua', query: '' };
  var main = document.getElementById('home');
  main.removeAttribute('data-level-view');
  main.innerHTML = '<p>Pilih level belajarmu:</p><div id="level-cards">' +
    levels.map(function (l) {
      return '<div class="card" data-level="' + escHtml(l.id) + '" role="button" tabindex="0" aria-label="' + escHtml(l.name) + ' — ' + escHtml(l.description) + '">' +
        '<span class="card-icon">' + l.icon + '</span>' +
        '<div class="card-body"><h2>' + escHtml(l.name) + '</h2><p>' + escHtml(l.description) + '</p></div></div>';
    }).join('') +
    '</div>';
  main.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('click', function () { goLevel(card.dataset.level); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goLevel(card.dataset.level); }
    });
  });
}

// ── Level navigation ──────────────────────────────────────────────

function goLevel(id) {
  var level = levels.find(function (l) { return l.id === id; });
  if (!level) return;
  currentPage = 'level:' + id;
  _levelState = { levelId: id, tab: 'semua', query: '' };
  var main = document.getElementById('home');
  main.setAttribute('data-level-view', id);
  main.innerHTML =
    '<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali ke daftar level">← Kembali</button><span class="page-header__level">' + escHtml(level.name) + '</span></div>' +
    '<div class="level-loading" role="status" aria-live="polite"><div class="spinner" aria-hidden="true"></div><p>Memuat materi ' + escHtml(level.name) + '…</p></div>';
  var backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', renderHome);
  WakaruData.load(id).then(function (data) {
    if (_levelState.levelId !== id || currentPage !== 'level:' + id) return;
    renderLevelView(level, data);
  }).catch(function (err) {
    if (_levelState.levelId !== id || currentPage !== 'level:' + id) return;
    renderLevelError(level, err);
  });
}

function renderLevelError(level, err) {
  var main = document.getElementById('home');
  var msg = err && err.message ? err.message : 'Gagal memuat data.';
  main.innerHTML =
    '<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali ke daftar level">← Kembali</button><span class="page-header__level">' + escHtml(level.name) + '</span></div>' +
    '<div class="level-hero" data-level="' + escHtml(level.id) + '"><h1>' + escHtml(level.title) + '</h1><p class="level-hero__desc">' + escHtml(level.description) + '</p></div>' +
    '<div class="error-state" role="alert"><p class="error-state__title">Gagal memuat materi</p><p class="error-state__msg">' + escHtml(msg) + '</p><button class="btn-retry" id="btn-retry" type="button">Coba lagi</button></div>';
  document.getElementById('back-btn').addEventListener('click', renderHome);
  var retry = document.getElementById('btn-retry');
  if (retry) retry.addEventListener('click', function () { goLevel(level.id); });
}

// ── Level view ────────────────────────────────────────────────────

function renderLevelView(level, data) {
  var main = document.getElementById('home');
  var prog = WakaruData.getLevelProgress(level.id);
  var kanjiTotal = data.kanji.length;
  var kosakataTotal = data.kosakata.length;
  var kanjiSeenCount = WakaruData.getProgress(level.id).kanjiSeen.length;
  var kosakataSeenCount = WakaruData.getProgress(level.id).kosakataSeen.length;
  var flashSession = getFlashSession();
  var resumeHtml = (flashSession && flashSession.levelId === level.id) ?
    '<button class="level-action-btn" id="btn-flash-resume" type="button">Lanjut</button>' : '';
  main.innerHTML =
    '<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali ke daftar level">← Kembali</button><span class="page-header__level">' + escHtml(level.name) + '</span></div>' +
    '<div class="level-hero" data-level="' + escHtml(level.id) + '">' +
      '<h1>' + escHtml(level.title) + '</h1>' +
      '<p class="level-hero__desc">' + escHtml(level.description) + '</p>' +
      '<div class="lev-progress" role="group" aria-label="Progres belajar">' +
        '<div class="lev-progress__item">' +
          '<div class="lev-progress__head"><span class="lev-progress__label">Kanji</span><span class="lev-progress__pct" id="pct-kanji">' + prog.kanjiPct + '%</span></div>' +
          '<div class="lev-progress__track" aria-hidden="true"><div class="lev-progress__fill" id="fill-kanji" style="width:' + prog.kanjiPct + '%"></div></div>' +
          '<span class="lev-progress__sub" id="sub-kanji">' + kanjiSeenCount + ' dari ' + kanjiTotal + ' dipelajari</span>' +
        '</div>' +
        '<div class="lev-progress__item">' +
          '<div class="lev-progress__head"><span class="lev-progress__label">Kosakata</span><span class="lev-progress__pct" id="pct-kosakata">' + prog.kosakataPct + '%</span></div>' +
          '<div class="lev-progress__track" aria-hidden="true"><div class="lev-progress__fill lev-progress__fill--vocab" id="fill-kosakata" style="width:' + prog.kosakataPct + '%"></div></div>' +
          '<span class="lev-progress__sub" id="sub-kosakata">' + kosakataSeenCount + ' dari ' + kosakataTotal + ' dipelajari</span>' +
        '</div>' +
      '</div>' +
      '<div class="level-actions">' +
        '<button class="level-action-btn" id="btn-flash-quick" type="button">Flashcard Hari Ini</button>' +
        '<button class="level-action-btn" id="btn-flash-mode" type="button">Mode…</button>' +
        '<button class="level-action-btn" id="btn-quiz-quick" type="button">Quiz Cepat</button>' +
        '<button class="level-action-btn" id="btn-quiz-setup" type="button">Pilih jenis…</button>' +
        resumeHtml +
      '</div>' +
    '</div>' +
    '<div class="level-toolbar">' +
      '<label class="search-wrap" aria-label="Cari materi">' +
        '<span class="search-wrap__icon" aria-hidden="true">⌕</span>' +
        '<input class="search-input" id="materi-search" type="search" placeholder="Cari kanji atau kosakata…" autocomplete="off" spellcheck="false" aria-label="Cari materi">' +
      '</label>' +
      '<div class="tabs" role="tablist" aria-label="Filter materi">' +
        '<button class="tab is-active" role="tab" aria-selected="true" data-tab="semua" type="button">Semua</button>' +
        '<button class="tab" role="tab" aria-selected="false" data-tab="kanji" type="button">Kanji</button>' +
        '<button class="tab" role="tab" aria-selected="false" data-tab="kosakata" type="button">Kosakata</button>' +
      '</div>' +
    '</div>' +
    '<div id="level-count" class="level-count" aria-live="polite"></div>' +
    '<div id="level-list" class="materi-list" aria-live="polite"></div>' +
    '<div id="level-empty" class="empty-state" hidden><p class="empty-state__title">Tidak ditemukan</p><p class="empty-state__msg">Coba kata kunci lain atau ganti filter.</p></div>';
  document.getElementById('back-btn').addEventListener('click', renderHome);
  document.getElementById('btn-flash-quick').addEventListener('click', function () {
    startFlash(level.id, 'benda', true);
  });
  document.getElementById('btn-flash-mode').addEventListener('click', function () { openFlash(level.id); });
  var resumeBtn = document.getElementById('btn-flash-resume');
  if (resumeBtn) resumeBtn.addEventListener('click', function () {
    var session = getFlashSession();
    var mode = (session && session.levelId === level.id) ? session.mode : 'benda';
    startFlash(level.id, mode, true);
  });
  document.getElementById('btn-quiz-quick').addEventListener('click', function () {
    startQuiz(level.id, 'kanji', 10);
  });
  document.getElementById('btn-quiz-setup').addEventListener('click', function () { openQuiz(level.id); });
  bindLevelEvents(level.id, data);
  renderMateriList(level.id, data);
}

// ── Level events & materi list ────────────────────────────────────

function bindLevelEvents(levelId, data) {
  var tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var tab = t.dataset.tab;
      if (!tab || _levelState.tab === tab) return;
      _levelState.tab = tab;
      tabs.forEach(function (x) {
        var active = x.dataset.tab === tab;
        x.classList.toggle('is-active', active);
        x.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      renderMateriList(levelId, data);
    });
  });
  var search = document.getElementById('materi-search');
  if (search) {
    search.addEventListener('input', function () {
      _levelState.query = search.value;
      renderMateriList(levelId, data);
    });
  }
  var listEl = document.getElementById('level-list');
  if (listEl) {
    listEl.addEventListener('click', function (e) {
      var item = e.target.closest('.materi-item');
      if (!item) return;
      var type = item.dataset.type;
      var id = item.dataset.id;
      if (!type || !id) return;
      var wasSeen = WakaruData.isSeen(levelId, type, id);
      WakaruData.markSeen(levelId, type, id);
      if (!wasSeen) {
        item.classList.add('is-seen');
        var seenDot = item.querySelector('.mi-seen');
        if (seenDot) seenDot.setAttribute('aria-label', 'Sudah dilihat');
        updateProgressBars(levelId);
        item.classList.add('is-tapped');
        setTimeout(function () { item.classList.remove('is-tapped'); }, 220);
      }
      if (type === 'kanji') {
        setTimeout(function () { openKanjiDetail(levelId, id); }, 150);
      }
    });
  }
}

function updateProgressBars(levelId) {
  var prog = WakaruData.getLevelProgress(levelId);
  var p = WakaruData.getProgress(levelId);
  var data = WakaruData.getLevel(levelId);
  if (!data) return;
  var elPctK = document.getElementById('pct-kanji');
  var elFillK = document.getElementById('fill-kanji');
  var elSubK = document.getElementById('sub-kanji');
  var elPctV = document.getElementById('pct-kosakata');
  var elFillV = document.getElementById('fill-kosakata');
  var elSubV = document.getElementById('sub-kosakata');
  if (elPctK) elPctK.textContent = prog.kanjiPct + '%';
  if (elFillK) elFillK.style.width = prog.kanjiPct + '%';
  if (elSubK) elSubK.textContent = p.kanjiSeen.length + ' dari ' + data.kanji.length + ' dipelajari';
  if (elPctV) elPctV.textContent = prog.kosakataPct + '%';
  if (elFillV) elFillV.style.width = prog.kosakataPct + '%';
  if (elSubV) elSubV.textContent = p.kosakataSeen.length + ' dari ' + data.kosakata.length + ' dipelajari';
}

function filterKanjiList(list, q) {
  if (!q) return list;
  var needle = q.toLowerCase().trim();
  if (!needle) return list;
  return list.filter(function (k) {
    var mean = k.meanings_id.join(' ').toLowerCase();
    return k.kanji.indexOf(needle) !== -1 || mean.indexOf(needle) !== -1;
  });
}

function renderMateriList(levelId, data) {
  var query = _levelState.query || '';
  var tab = _levelState.tab || 'semua';
  var trimmedQ = query.trim();
  var kanjiFiltered = filterKanjiList(data.kanji, trimmedQ);
  var vocabFiltered;
  if (trimmedQ) {
    vocabFiltered = WakaruData.searchKosakata(levelId, trimmedQ);
  } else {
    vocabFiltered = data.kosakata.slice();
  }
  var listEl = document.getElementById('level-list');
  var emptyEl = document.getElementById('level-empty');
  var countEl = document.getElementById('level-count');
  if (!listEl) return;
  var html = '';
  var showEmpty = false;
  var countText = '';
  if (tab === 'kanji') {
    if (kanjiFiltered.length === 0) showEmpty = true;
    else { html = kanjiFiltered.map(function (k) { return kanjiItemHtml(levelId, k); }).join(''); countText = kanjiFiltered.length + ' kanji'; }
  } else if (tab === 'kosakata') {
    if (vocabFiltered.length === 0) showEmpty = true;
    else { html = vocabFiltered.map(function (v, idx) { return vocabItemHtml(levelId, v, idx); }).join(''); countText = vocabFiltered.length + ' kosakata'; }
  } else {
    var hasKanji = kanjiFiltered.length > 0;
    var hasVocab = vocabFiltered.length > 0;
    if (!hasKanji && !hasVocab) showEmpty = true;
    else {
      if (hasKanji) {
        html += '<p class="section-head"><span>Kanji</span><span class="section-head__count">' + kanjiFiltered.length + '</span></p>';
        html += kanjiFiltered.map(function (k) { return kanjiItemHtml(levelId, k); }).join('');
      }
      if (hasVocab) {
        html += '<p class="section-head"><span>Kosakata</span><span class="section-head__count">' + vocabFiltered.length + '</span></p>';
        html += vocabFiltered.map(function (v, idx) { return vocabItemHtml(levelId, v, idx); }).join('');
      }
      var parts = [];
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
  var seen = WakaruData.isSeen(levelId, 'kanji', k.kanji);
  var meanings = escHtml(k.meanings_id.join('; '));
  var on = k.on_readings.length ? escHtml(k.on_readings.join('・')) : '—';
  var kun = k.kun_readings.length ? escHtml(k.kun_readings.join('・')) : '—';
  var stroke = k.stroke_count ? k.stroke_count + ' goresan' : '';
  return '<button type="button" class="materi-item materi-kanji' + (seen ? ' is-seen' : '') + '" data-type="kanji" data-id="' + escHtml(k.kanji) + '" aria-label="Kanji ' + escHtml(k.kanji) + ', ' + meanings + '">' +
    '<span class="mi-kanji" lang="ja" aria-hidden="true">' + escHtml(k.kanji) + '</span>' +
    '<span class="mi-body">' +
      '<span class="mi-mean">' + meanings + '</span>' +
      '<span class="mi-read"><span class="mi-read__label">on</span> ' + on + ' <span class="mi-read__sep">/</span> <span class="mi-read__label">kun</span> ' + kun + '</span>' +
      (stroke ? '<span class="mi-meta">' + escHtml(stroke) + '</span>' : '') +
    '</span>' +
    '<span class="mi-seen' + (seen ? ' is-on' : '') + '" aria-hidden="true" title="' + (seen ? 'Sudah dilihat' : '') + '">' + (seen ? '✓' : '') + '</span>' +
  '</button>';
}

function vocabItemHtml(levelId, v, idx) {
  var stableId = vocabStableId(v);
  var seen = WakaruData.isSeen(levelId, 'kosakata', stableId);
  var displayKanji = v.kanji ? escHtml(v.kanji) : '';
  var displayKana = escHtml(v.kana);
  var arti = escHtml(v.arti);
  var romaji = escHtml(v.romaji);
  var cat = escHtml(v.category || '');
  return '<button type="button" class="materi-item materi-vocab' + (seen ? ' is-seen' : '') + '" data-type="kosakata" data-id="' + escHtml(stableId) + '" aria-label="' + escHtml(displayKanji || displayKana) + ', ' + arti + '">' +
    '<span class="mi-body">' +
      '<span class="mi-vhead"><span class="mi-vkanji" lang="ja">' + (displayKanji || displayKana) + '</span>' + (displayKanji ? '<span class="mi-vkana" lang="ja">' + displayKana + '</span>' : '') + '</span>' +
      '<span class="mi-mean mi-mean--vocab">' + arti + '</span>' +
      '<span class="mi-romaji">' + romaji + '</span>' +
    '</span>' +
    (cat ? '<span class="mi-cat">' + cat + '</span>' : '') +
    '<span class="mi-seen' + (seen ? ' is-on' : '') + '" aria-hidden="true">' + (seen ? '✓' : '') + '</span>' +
  '</button>';
}

// ── FEATURE 1 — Kanji detail view ─────────────────────────────────

function openKanjiDetail(levelId, char) {
  if (currentPage !== 'kanji:' + levelId + ':' + char &&
      currentPage !== 'level:' + levelId) return;
  currentPage = 'kanji:' + levelId + ':' + char;
  var level = levels.find(function (l) { return l.id === levelId; });
  var kanji = WakaruData.getKanji(levelId, char);
  var strokes = WakaruData.getStrokes(levelId, char);
  if (!kanji) { goLevel(levelId); return; }
  var main = document.getElementById('home');
  main.innerHTML =
    '<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali">← Kembali</button><span class="page-header__level">' + escHtml(level.name) + '</span></div>' +
    '<div class="level-loading" role="status" aria-live="polite"><div class="spinner" aria-hidden="true"></div><p>Memuat detail kanji…</p></div>';
  document.getElementById('back-btn').addEventListener('click', function () { goLevel(levelId); });
  WakaruData.loadKanjiDetail(levelId).then(function (detail) {
    if (currentPage !== 'kanji:' + levelId + ':' + char) return;
    var detailData = detail ? detail[char] : null;
    renderKanjiDetail(levelId, level, kanji, strokes, detailData);
  }).catch(function () {
    if (currentPage !== 'kanji:' + levelId + ':' + char) return;
    renderKanjiDetail(levelId, level, kanji, strokes, null);
  });
}

function renderKanjiDetail(levelId, level, kanji, strokes, detail) {
  var main = document.getElementById('home');
  var examples = (detail && detail.examples) ? detail.examples : [];
  var related = (detail && detail.related) ? detail.related : [];
  var meanings = kanji.meanings_id.join(', ');
  var strokeCount = strokes ? strokes.length : (kanji.stroke_count || '');
  // Build hero
  var html =
    '<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali">← Kembali</button><span class="page-header__level">' + escHtml(level.name) + '</span></div>' +
    '<div class="kanji-hero" data-level="' + escHtml(level.id) + '">' +
      '<span class="kanji-hero__glyph" lang="ja">' + escHtml(kanji.kanji) + '</span>' +
      '<p class="kanji-hero__meanings">' + escHtml(meanings) + '</p>' +
      (strokeCount ? '<span class="kanji-hero__meta">' + strokeCount + ' goresan</span>' : '') +
    '</div>';
  // Stroke order section
  if (strokes && strokes.length > 0) {
    html +=
      '<div class="section-block">' +
        '<h2 class="section-title">Urutan Goresan</h2>' +
        '<div class="stroke-wrap">' +
          '<svg class="stroke-svg" viewBox="0 0 109 109" role="img" aria-label="Urutan goresan ' + escHtml(kanji.kanji) + '">' +
            strokes.map(function (segs) { return '<path class="stroke-path" d="' + escHtml(segs.join(' ')) + '" />'; }).join('') +
            strokes.map(function (segs, i) {
              var first = String(segs[0] || '');
              var m = first.match(/^M([\d.]+)[,\s]([\d.]+)/);
              var x = m ? parseFloat(m[1]) : 54;
              var y = m ? parseFloat(m[2]) - 4 : 10;
              return '<text class="stroke-num" x="' + x + '" y="' + y + '">' + (i + 1) + '</text>';
            }).join('') +
          '</svg>' +
          '<div class="stroke-controls">' +
            '<button class="btn-stroke" id="btn-stroke-play" type="button">Putar</button>' +
            '<button class="btn-stroke btn-stroke--secondary" id="btn-stroke-all" type="button">Tampilkan semua</button>' +
          '</div>' +
          '<span class="stroke-count-label">' + strokes.length + ' goresan</span>' +
        '</div>' +
      '</div>';
  }
  // Readings
  var hasOn = kanji.on_readings && kanji.on_readings.length > 0;
  var hasKun = kanji.kun_readings && kanji.kun_readings.length > 0;
  var hasName = kanji.name_readings && kanji.name_readings.length > 0;
  if (hasOn || hasKun || hasName) {
    html += '<div class="section-block"><h2 class="section-title">Cara Baca</h2><div class="readings-list">';
    if (hasOn) {
      html += '<div class="reading-group">' +
        '<span class="reading-group__label">On\'yomi</span>' +
        '<div class="reading-pills">' +
          kanji.on_readings.map(function (r) {
            return '<div class="reading-pill"><span lang="ja">' + escHtml(r) + '</span><button type="button" class="audio-btn" data-speak="' + escHtml(cleanReadingForSpeech(r)) + '" aria-label="Dengarkan bacaan ' + escHtml(r) + '">' + SPEAKER_ICON + '</button></div>';
          }).join('') +
        '</div></div>';
    }
    if (hasKun) {
      html += '<div class="reading-group">' +
        '<span class="reading-group__label">Kun\'yomi</span>' +
        '<div class="reading-pills">' +
          kanji.kun_readings.map(function (r) {
            return '<div class="reading-pill"><span lang="ja">' + escHtml(r) + '</span><button type="button" class="audio-btn" data-speak="' + escHtml(cleanReadingForSpeech(r)) + '" aria-label="Dengarkan bacaan ' + escHtml(r) + '">' + SPEAKER_ICON + '</button></div>';
          }).join('') +
        '</div></div>';
    }
    if (hasName) {
      html += '<div class="reading-group">' +
        '<span class="reading-group__label">Nama</span>' +
        '<div class="reading-pills">' +
          kanji.name_readings.map(function (r) {
            return '<div class="reading-pill"><span lang="ja">' + escHtml(r) + '</span><button type="button" class="audio-btn" data-speak="' + escHtml(cleanReadingForSpeech(r)) + '" aria-label="Dengarkan bacaan ' + escHtml(r) + '">' + SPEAKER_ICON + '</button></div>';
          }).join('') +
        '</div></div>';
    }
    html += '</div></div>';
  }
  // Examples
  if (examples.length > 0) {
    html += '<div class="section-block"><h2 class="section-title">Contoh Kalimat</h2><div class="examples-list">';
    examples.forEach(function (ex) {
      html += '<div class="example-item">' +
        '<div class="example-jp">' +
          '<span lang="ja">' + escHtml(ex.jp) + '</span>' +
          '<button type="button" class="audio-btn" data-speak="' + escHtml(ex.jp) + '" aria-label="Dengarkan kalimat">' + SPEAKER_ICON + '</button>' +
        '</div>' +
        '<span class="example-kana" lang="ja">' + escHtml(ex.kana) + '</span>' +
        '<span class="example-id">' + escHtml(ex.id) + '</span>' +
      '</div>';
    });
    html += '</div></div>';
  }
  // Related vocab
  if (related.length > 0) {
    html += '<div class="section-block"><h2 class="section-title">Kosakata Terkait</h2><div class="related-list">';
    related.forEach(function (r) {
      var stableId = vocabStableId(r);
      var rSeen = WakaruData.isSeen(levelId, 'kosakata', stableId);
      html += '<button type="button" class="related-item' + (rSeen ? ' is-seen' : '') + '" data-type="kosakata" data-id="' + escHtml(stableId) + '" data-level="' + escHtml(levelId) + '">' +
        '<span class="related-kanji" lang="ja">' + escHtml(r.kanji || r.kana) + '</span>' +
        '<span class="related-body">' +
          '<span class="related-kana" lang="ja">' + escHtml(r.kana) + '</span>' +
          '<span class="related-arti">' + escHtml(r.arti) + '</span>' +
        '</span>' +
        '<span class="mi-seen' + (rSeen ? ' is-on' : '') + '" aria-hidden="true">' + (rSeen ? '✓' : '') + '</span>' +
      '</button>';
    });
    html += '</div></div>';
  }
  main.innerHTML = html;
  document.getElementById('back-btn').addEventListener('click', function () { goLevel(levelId); });
  // Related item clicks
  main.querySelectorAll('.related-item').forEach(function (el) {
    el.addEventListener('click', function () {
      var rid = el.dataset.id;
      var rSeen = WakaruData.isSeen(levelId, 'kosakata', rid);
      WakaruData.markSeen(levelId, 'kosakata', rid);
      if (!rSeen) {
        el.classList.add('is-seen');
        var dot = el.querySelector('.mi-seen');
        if (dot) { dot.classList.add('is-on'); dot.textContent = '✓'; }
      }
    });
  });
  // Stroke animation setup
  var svg = main.querySelector('.stroke-svg');
  if (svg) setupStrokeAnimation(svg);
}

// ── Stroke animation ──────────────────────────────────────────────

function setupStrokeAnimation(svgEl) {
  var paths = svgEl.querySelectorAll('.stroke-path');
  paths.forEach(function (p) { p.style.opacity = '0.15'; });
  var playBtn = document.getElementById('btn-stroke-play');
  var allBtn = document.getElementById('btn-stroke-all');
  var showingAll = false;
  var isAnimating = false;
  var wrap = svgEl.closest('.stroke-wrap');
  if (playBtn) playBtn.addEventListener('click', function () {
    if (isAnimating) return;
    isAnimating = true;
    if (wrap) wrap.setAttribute('aria-busy', 'true');
    playBtn.disabled = true;
    animateStrokes(svgEl, function () {
      isAnimating = false;
      if (wrap) wrap.removeAttribute('aria-busy');
      playBtn.disabled = false;
    });
  });
  if (allBtn) allBtn.addEventListener('click', function () {
    if (isAnimating) return;
    showingAll = !showingAll;
    if (showingAll) {
      showAllStrokes(svgEl);
      allBtn.textContent = 'Sembunyikan';
    } else {
      resetStrokes(svgEl);
      allBtn.textContent = 'Tampilkan semua';
    }
  });
}

function resetStrokes(svgEl) {
  var paths = svgEl.querySelectorAll('.stroke-path');
  var nums = svgEl.querySelectorAll('.stroke-num');
  paths.forEach(function (p) {
    p.style.transition = 'none';
    p.style.strokeDasharray = 'none';
    p.style.strokeDashoffset = '0';
    p.style.opacity = '0.15';
  });
  nums.forEach(function (n) { n.style.opacity = '0'; });
}

function animateStrokes(svgEl, onDone) {
  var paths = svgEl.querySelectorAll('.stroke-path');
  var nums = svgEl.querySelectorAll('.stroke-num');
  if (paths.length === 0) { if (onDone) onDone(); return; }
  // Respect prefers-reduced-motion: skip animation
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showAllStrokes(svgEl);
    if (onDone) onDone();
    return;
  }
  // Reset first
  paths.forEach(function (p) {
    p.style.transition = 'none';
    p.style.opacity = '0.15';
    var len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
  });
  nums.forEach(function (n) { n.style.opacity = '0'; });
  var i = 0;
  function next() {
    if (i >= paths.length) {
      nums.forEach(function (n) { n.style.opacity = '1'; });
      if (onDone) onDone();
      return;
    }
    var p = paths[i];
    p.style.transition = 'stroke-dashoffset 350ms ease, opacity 100ms ease';
    p.style.opacity = '1';
    p.style.strokeDashoffset = '0';
    i++;
    setTimeout(next, 380);
  }
  next();
}

function showAllStrokes(svgEl) {
  var paths = svgEl.querySelectorAll('.stroke-path');
  var nums = svgEl.querySelectorAll('.stroke-num');
  paths.forEach(function (p) {
    p.style.transition = 'none';
    p.style.strokeDasharray = 'none';
    p.style.strokeDashoffset = '0';
    p.style.opacity = '1';
  });
  nums.forEach(function (n) { n.style.opacity = '1'; });
}

// ── FEATURE 2 — Quiz mode ─────────────────────────────────────────

function openQuiz(levelId) {
  currentPage = 'quiz:' + levelId;
  _quizState = { levelId: levelId };
  renderQuizSetup(levelId);
}

function renderQuizSetup(levelId) {
  var level = levels.find(function (l) { return l.id === levelId; });
  var main = document.getElementById('home');
  var bestKanji = WakaruData.getQuizBest(levelId, 'kanji');
  var bestKosakata = WakaruData.getQuizBest(levelId, 'kosakata');
  main.innerHTML =
    '<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali">← Kembali</button><span class="page-header__level">' + escHtml(level.name) + '</span></div>' +
    '<div class="quiz-setup">' +
      '<h1 class="quiz-setup__title">Kuis ' + escHtml(level.name) + '</h1>' +
      '<div class="quiz-setup__section">' +
        '<span class="quiz-setup__label">Jenis</span>' +
        '<div class="quiz-pill-group" id="quiz-type-pills">' +
          '<button class="quiz-pill is-active" data-val="kanji" type="button">Kanji</button>' +
          '<button class="quiz-pill" data-val="kosakata" type="button">Kosakata</button>' +
        '</div>' +
      '</div>' +
      '<div class="quiz-setup__section">' +
        '<span class="quiz-setup__label">Jumlah soal</span>' +
        '<div class="quiz-pill-group" id="quiz-count-pills">' +
          '<button class="quiz-pill is-active" data-val="10" type="button">10</button>' +
          '<button class="quiz-pill" data-val="30" type="button">30</button>' +
        '</div>' +
      '</div>' +
      '<div class="quiz-best" id="quiz-best-display"></div>' +
      '<button class="btn-start" id="btn-quiz-start" type="button">Mulai</button>' +
    '</div>';
  // Best score display
  function updateBestDisplay() {
    var type = getSelectedType();
    var best = type === 'kanji' ? bestKanji : bestKosakata;
    var el = document.getElementById('quiz-best-display');
    if (el) el.textContent = best > 0 ? 'Terbaik: ' + best + '/100' : '';
  }
  function getSelectedType() {
    var active = document.querySelector('#quiz-type-pills .quiz-pill.is-active');
    return active ? active.dataset.val : 'kanji';
  }
  function getSelectedCount() {
    var active = document.querySelector('#quiz-count-pills .quiz-pill.is-active');
    return active ? parseInt(active.dataset.val, 10) : 10;
  }
  // Pill selection
  ['quiz-type-pills', 'quiz-count-pills'].forEach(function (groupId) {
    var group = document.getElementById(groupId);
    if (!group) return;
    group.addEventListener('click', function (e) {
      var pill = e.target.closest('.quiz-pill');
      if (!pill) return;
      group.querySelectorAll('.quiz-pill').forEach(function (p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');
      updateBestDisplay();
    });
  });
  updateBestDisplay();
  document.getElementById('back-btn').addEventListener('click', function () { goLevel(levelId); });
  document.getElementById('btn-quiz-start').addEventListener('click', function () {
    startQuiz(levelId, getSelectedType(), getSelectedCount());
  });
}

function generateKanjiQuiz(levelId, count) {
  var data = WakaruData.getLevel(levelId);
  if (!data) return [];
  var pool = data.kanji.slice();
  shuffleArray(pool);
  var picked = pool.slice(0, Math.min(count, pool.length));
  var allMeanings = [];
  data.kanji.forEach(function (k) { if (k.meanings_id[0]) allMeanings.push(k.meanings_id[0]); });
  return picked.map(function (k) {
    var correct = k.meanings_id[0] || '';
    var seen = {};
    var distractors = [];
    for (var i = 0; i < allMeanings.length && distractors.length < 3; i++) {
      var m = allMeanings[i];
      if (m !== correct && !seen[m]) { seen[m] = true; distractors.push(m); }
    }
    while (distractors.length < 3) distractors.push('—');
    var options = [correct].concat(distractors);
    shuffleArray(options);
    return { kanji: k.kanji, correct: correct, options: options };
  });
}

function generateKosakataQuiz(levelId, count) {
  var data = WakaruData.getLevel(levelId);
  if (!data) return [];
  var pool = data.kosakata.slice();
  shuffleArray(pool);
  var picked = pool.slice(0, Math.min(count, pool.length));
  var allArti = [];
  data.kosakata.forEach(function (v) { if (v.arti) allArti.push(v.arti); });
  return picked.map(function (v) {
    var correct = v.arti || '';
    var seen = {};
    var distractors = [];
    for (var i = 0; i < allArti.length && distractors.length < 3; i++) {
      var a = allArti[i];
      if (a !== correct && !seen[a]) { seen[a] = true; distractors.push(a); }
    }
    while (distractors.length < 3) distractors.push('—');
    var options = [correct].concat(distractors);
    shuffleArray(options);
    return { display: v.kanji || v.kana, kana: v.kana, romaji: v.romaji, correct: correct, options: options };
  });
}

function startQuiz(levelId, type, count) {
  var questions = type === 'kanji' ? generateKanjiQuiz(levelId, count) : generateKosakataQuiz(levelId, count);
  if (questions.length === 0) return;
  currentPage = 'quiz:' + levelId;
  _quizState = {
    levelId: levelId,
    type: type,
    count: questions.length,
    questions: questions,
    idx: 0,
    score: 0,
    wrongAnswers: [],
    answered: false
  };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  var s = _quizState;
  if (s.idx >= s.questions.length) { renderQuizResult(); return; }
  var q = s.questions[s.idx];
  var main = document.getElementById('home');
  var pct = Math.round(((s.idx + 1) / s.count) * 100);
  var isKanji = s.type === 'kanji';
  var questionText = isKanji ? 'Apa arti kanji ini?' : 'Apa artinya?';
  var displayChar = isKanji ? '<span class="quiz-kanji" lang="ja">' + escHtml(q.kanji) + '</span>' :
    '<span class="quiz-kanji" lang="ja">' + escHtml(q.display) + '</span>' +
    '<span class="quiz-sub" lang="ja">' + escHtml(q.kana) + '</span>' +
    '<span class="quiz-sub quiz-sub--romaji">' + escHtml(q.romaji) + '</span>';
  var html =
    '<div class="quiz-header">' +
      '<button class="back-btn" id="back-btn" type="button" aria-label="Kembali">← Kembali</button>' +
      '<span class="quiz-progress-text" aria-live="polite">Soal ' + (s.idx + 1) + '/' + s.count + '</span>' +
    '</div>' +
    '<div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:' + pct + '%"></div></div>' +
    '<div class="quiz-card">' +
      '<div class="quiz-prompt">' + displayChar + '</div>' +
      '<p class="quiz-question">' + escHtml(questionText) + '</p>' +
      '<div class="quiz-options" id="quiz-options">' +
        q.options.map(function (opt, i) {
          return '<button class="quiz-option" data-idx="' + i + '" type="button">' + escHtml(opt) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';
  main.innerHTML = html;
  s.answered = false;
  document.getElementById('back-btn').addEventListener('click', function () {
    if (confirm('Keluar dari kuis? Skor belum disimpan.')) {
      goLevel(s.levelId);
    }
  });
  document.getElementById('quiz-options').addEventListener('click', function (e) {
    var btn = e.target.closest('.quiz-option');
    if (!btn) return;
    // Allow early advance: tap/click anywhere after answering
    if (s.answered) {
      clearTimeout(s._advanceTimer);
      s.idx++;
      renderQuizQuestion();
      return;
    }
    s.answered = true;
    var chosenIdx = parseInt(btn.dataset.idx, 10);
    var chosen = q.options[chosenIdx];
    var isCorrect = chosen === q.correct;
    if (isCorrect) {
      s.score++;
      btn.classList.add('quiz-option--correct');
    } else {
      btn.classList.add('quiz-option--wrong');
      // highlight correct
      var allBtns = btn.parentElement.querySelectorAll('.quiz-option');
      allBtns.forEach(function (b) {
        if (b.dataset.idx !== String(chosenIdx) && q.options[parseInt(b.dataset.idx, 10)] === q.correct) {
          b.classList.add('quiz-option--correct');
        }
      });
      s.wrongAnswers.push({ question: isKanji ? q.kanji : (q.display + ' (' + q.kana + ')'), chosen: chosen, correct: q.correct });
    }
    // Disable all options
    var allBtns = btn.parentElement.querySelectorAll('.quiz-option');
    allBtns.forEach(function (b) { b.disabled = true; });
    var delay = isCorrect ? 600 : 900;
    s._advanceTimer = setTimeout(function () {
      if (currentPage !== 'quiz:' + s.levelId) return;
      s.idx++;
      renderQuizQuestion();
    }, delay);
  });
}

function renderQuizResult() {
  var s = _quizState;
  var pct = Math.round((s.score / s.count) * 100);
  WakaruData.setQuizBest(s.levelId, s.type, pct);
  var main = document.getElementById('home');
  var html =
    '<div class="quiz-header">' +
      '<button class="back-btn" id="back-btn" type="button" aria-label="Kembali">← Kembali</button>' +
      '<span class="quiz-progress-text">Selesai</span>' +
    '</div>' +
    '<div class="quiz-result">' +
      '<p class="quiz-result__score">Skor: ' + pct + '/100</p>' +
      '<p class="quiz-result__detail">' + s.score + ' benar dari ' + s.count + ' soal</p>';
  if (s.wrongAnswers.length > 0) {
    html += '<div class="quiz-review"><h2 class="quiz-review__title">Jawaban yang salah</h2>';
    s.wrongAnswers.forEach(function (w) {
      html += '<div class="quiz-review__item">' +
        '<span class="quiz-review__q">' + escHtml(w.question) + '</span>' +
        '<span class="quiz-review__yours">Jawabanmu: ' + escHtml(w.chosen) + '</span>' +
        '<span class="quiz-review__correct">Benar: ' + escHtml(w.correct) + '</span>' +
      '</div>';
    });
    html += '</div>';
  }
  html +=
      '<div class="quiz-result__actions">' +
        '<button class="btn-start" id="btn-quiz-retry" type="button">Coba Lagi</button>' +
        '<button class="btn-stroke btn-stroke--secondary" id="btn-quiz-done" type="button">Selesai</button>' +
      '</div>' +
    '</div>';
  main.innerHTML = html;
  document.getElementById('back-btn').addEventListener('click', function () { goLevel(s.levelId); });
  document.getElementById('btn-quiz-retry').addEventListener('click', function () {
    startQuiz(s.levelId, s.type, s.count);
  });
  document.getElementById('btn-quiz-done').addEventListener('click', function () { goLevel(s.levelId); });
}

// ── FEATURE 3 — Flashcard mode ────────────────────────────────────

function openFlash(levelId) {
  currentPage = 'flash:' + levelId;
  _flashState = { levelId: levelId };
  renderFlashSetup(levelId);
}

function renderFlashSetup(levelId) {
  var level = levels.find(function (l) { return l.id === levelId; });
  var main = document.getElementById('home');
  var autoPlay = true;
  try { autoPlay = localStorage.getItem('wakaru-flash-autoplay') !== 'off'; } catch (e) {}
  main.innerHTML =
    '<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali">← Kembali</button><span class="page-header__level">' + escHtml(level.name) + '</span></div>' +
    '<div class="quiz-setup">' +
      '<h1 class="quiz-setup__title">Flashcard ' + escHtml(level.name) + '</h1>' +
      '<div class="level-loading" role="status" aria-live="polite"><div class="spinner" aria-hidden="true"></div><p>Memuat data…</p></div>' +
    '</div>';
  document.getElementById('back-btn').addEventListener('click', function () { goLevel(levelId); });
  WakaruData.kamusLoad(levelId).then(function () {
    if (currentPage !== 'flash:' + levelId) return;
    var nounCount = WakaruData.getByCategory('noun').length;
    var sifatCount = WakaruData.getByCategory('kata-sifat').length;
    var verbCount = WakaruData.getByCategory('verb').length;
    var kanjiCount = WakaruData.getByCategory('kanji').length;
    main.innerHTML =
      '<div class="page-header"><button class="back-btn" id="back-btn" type="button" aria-label="Kembali">← Kembali</button><span class="page-header__level">' + escHtml(level.name) + '</span></div>' +
      '<div class="quiz-setup">' +
        '<h1 class="quiz-setup__title">Flashcard ' + escHtml(level.name) + '</h1>' +
        '<div class="quiz-setup__section">' +
          '<span class="quiz-setup__label">Kategori</span>' +
          '<div class="quiz-pill-group" id="flash-mode-pills">' +
            '<button class="quiz-pill is-active" data-val="benda" type="button">Benda · ' + nounCount + '</button>' +
            '<button class="quiz-pill" data-val="sifat" type="button">Sifat · ' + sifatCount + '</button>' +
            '<button class="quiz-pill" data-val="kerja" type="button">Kerja · ' + verbCount + '</button>' +
            '<button class="quiz-pill" data-val="kanji" type="button">Kanji · ' + kanjiCount + '</button>' +
          '</div>' +
        '</div>' +
        '<label class="flash-shuffle-label"><input type="checkbox" id="flash-shuffle-toggle" checked> Acak urutan</label>' +
        '<label class="flash-shuffle-label"><input type="checkbox" id="flash-autoplay-toggle"' + (autoPlay ? ' checked' : '') + '> Putar audio otomatis</label>' +
        '<button class="btn-start" id="btn-flash-start" type="button">Mulai</button>' +
      '</div>';
    document.getElementById('back-btn').addEventListener('click', function () { goLevel(levelId); });
    document.getElementById('flash-mode-pills').addEventListener('click', function (e) {
      var pill = e.target.closest('.quiz-pill');
      if (!pill) return;
      document.querySelectorAll('#flash-mode-pills .quiz-pill').forEach(function (p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');
    });
    document.getElementById('btn-flash-start').addEventListener('click', function () {
      var modePill = document.querySelector('#flash-mode-pills .quiz-pill.is-active');
      var shuffle = document.getElementById('flash-shuffle-toggle').checked;
      var autoPlayEnabled = document.getElementById('flash-autoplay-toggle').checked;
      try { localStorage.setItem('wakaru-flash-autoplay', autoPlayEnabled ? 'on' : 'off'); } catch (e) {}
      startFlash(levelId, modePill ? modePill.dataset.val : 'benda', shuffle, autoPlayEnabled);
    });
  });
}

function startFlash(levelId, mode, shuffle, autoPlay) {
  var categoryMap = { 'benda': 'noun', 'sifat': 'kata-sifat', 'kerja': 'verb', 'kanji': 'kanji' };
  if (autoPlay === undefined) {
    try { autoPlay = localStorage.getItem('wakaru-flash-autoplay') !== 'off'; } catch (e) { autoPlay = true; }
  }
  function begin(items) {
    if (!items || items.length === 0) return;
    items = items.slice();
    if (shuffle) shuffleArray(items);
    currentPage = 'flash:' + levelId;
    _flashState = { levelId: levelId, mode: mode, items: items, idx: 0, showBack: false, seenIds: {}, autoPlay: autoPlay };
    saveFlashSession(levelId, mode, 0);
    renderFlashCard();
  }
  var items = WakaruData.getByCategory(categoryMap[mode] || 'noun');
  if (items && items.length > 0) { begin(items); return; }
  WakaruData.kamusLoad(levelId).then(function () {
    begin(WakaruData.getByCategory(categoryMap[mode] || 'noun'));
  });
}

function renderFlashCard() {
  var s = _flashState;
  if (s.idx >= s.items.length) { renderFlashComplete(); return; }
  var item = s.items[s.idx];
  var main = document.getElementById('home');
  var pct = Math.round(((s.idx + 1) / s.items.length) * 100);
  var isKanji = s.mode === 'kanji';
  var frontHtml = '', backHtml = '', speechText = '';
  if (isKanji) {
    frontHtml = '<span class="flash-glyph" lang="ja">' + escHtml(item.kanji) + '</span>';
    var meanings = (item.meanings_id || []).join(', ');
    var onReadings = (item.on_readings || []).join('・');
    var kunReadings = (item.kun_readings || []).join('・');
    backHtml = '<span class="flash-arti">' + escHtml(meanings) + '</span>';
    if (onReadings) backHtml += '<span class="flash-kana">on: ' + escHtml(onReadings) + '</span>';
    if (kunReadings) backHtml += '<span class="flash-kana">kun: ' + escHtml(kunReadings) + '</span>';
    speechText = (item.on_readings && item.on_readings[0]) ? cleanReadingForSpeech(item.on_readings[0]) : ((item.kun_readings && item.kun_readings[0]) ? cleanReadingForSpeech(item.kun_readings[0]) : '');
    backHtml += '<button type="button" class="audio-btn flash-audio" data-speak="' + escHtml(speechText) + '" aria-label="Dengarkan">' + SPEAKER_ICON + '</button>';
  } else {
    frontHtml = '<span class="flash-glyph" lang="ja">' + escHtml(item.kanji || item.kana) + '</span>';
    if (item.kanji) frontHtml += '<span class="flash-kana" lang="ja">' + escHtml(item.kana) + '</span>';
    backHtml = '<span class="flash-arti">' + escHtml(item.arti) + '</span>';
    speechText = item.kana;
    backHtml += '<button type="button" class="audio-btn flash-audio" data-speak="' + escHtml(item.kana) + '" aria-label="Dengarkan">' + SPEAKER_ICON + '</button>';
  }
  var html =
    '<div class="quiz-header">' +
      '<button class="back-btn" id="back-btn" type="button" aria-label="Kembali">← Kembali</button>' +
      '<span class="quiz-progress-text">' + (s.idx + 1) + ' / ' + s.items.length + '</span>' +
    '</div>' +
    '<div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:' + pct + '%"></div></div>' +
    '<div class="flash-card-area">' +
      '<div class="flash-card" id="flash-card" role="button" tabindex="0">' +
        '<div class="flash-front">' + frontHtml + '</div>' +
        '<div class="flash-back" id="flash-back" hidden>' + backHtml + '</div>' +
      '</div>' +
      '<p class="flash-hint" id="flash-hint">Ketuk untuk melihat</p>' +
      '<div class="flash-nav">' +
        '<button class="flash-nav-btn" id="flash-prev" type="button" aria-label="Sebelumnya">←</button>' +
        '<button class="flash-nav-btn" id="flash-next" type="button" aria-label="Berikutnya">→</button>' +
      '</div>' +
    '</div>';
  main.innerHTML = html;
  s.showBack = false;
  var card = document.getElementById('flash-card');
  function flipCard(e) {
    if (e && e.target && e.target.closest && e.target.closest('.audio-btn')) return;
    var back = document.getElementById('flash-back');
    var hint = document.getElementById('flash-hint');
    if (!s.showBack) {
      back.removeAttribute('hidden');
      hint.textContent = 'Ketuk untuk menyembunyikan';
      s.showBack = true;
      var id = isKanji ? item.kanji : vocabStableId(item);
      var type = isKanji ? 'kanji' : 'kosakata';
      if (!s.seenIds[id]) {
        s.seenIds[id] = true;
        WakaruData.markSeen(s.levelId, type, id);
      }
      if (s.autoPlay && speechText) {
        setTimeout(function () { WakaruAudio.speak(speechText); }, 200);
      }
    } else {
      back.setAttribute('hidden', '');
      hint.textContent = 'Ketuk untuk melihat';
      s.showBack = false;
    }
  }
  card.addEventListener('click', flipCard);
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flipCard();
    }
  });
  document.getElementById('back-btn').addEventListener('click', function () {
    saveFlashSession(s.levelId, s.mode, s.idx);
    goLevel(s.levelId);
  });
  document.getElementById('flash-prev').addEventListener('click', function () {
    if (s.idx > 0) { s.idx--; renderFlashCard(); }
  });
  document.getElementById('flash-next').addEventListener('click', function () {
    s.idx++;
    if (s.idx >= s.items.length) { renderFlashComplete(); }
    else { renderFlashCard(); }
  });
}

function renderFlashComplete() {
  var s = _flashState;
  var main = document.getElementById('home');
  var seenCount = 0;
  for (var k in s.seenIds) { if (s.seenIds[k]) seenCount++; }
  var total = s.items.length;
  clearFlashSession();
  var html =
    '<div class="quiz-header">' +
      '<button class="back-btn" id="back-btn" type="button" aria-label="Kembali">← Kembali</button>' +
      '<span class="quiz-progress-text">Selesai</span>' +
    '</div>' +
    '<div class="quiz-result">' +
      '<p class="quiz-result__score">' + seenCount + '/' + total + ' kartu dilihat</p>' +
      '<div class="quiz-result__actions">' +
        '<button class="btn-start" id="btn-flash-retry" type="button">Ulangi</button>' +
        '<button class="btn-stroke btn-stroke--secondary" id="btn-flash-done" type="button">Kembali</button>' +
      '</div>' +
    '</div>';
  main.innerHTML = html;
  document.getElementById('back-btn').addEventListener('click', function () { goLevel(s.levelId); });
  document.getElementById('btn-flash-retry').addEventListener('click', function () {
    startFlash(s.levelId, s.mode, true, s.autoPlay);
  });
  document.getElementById('btn-flash-done').addEventListener('click', function () { goLevel(s.levelId); });
}

// ── Flash session persistence ─────────────────────────────────────

function getFlashSession() {
  try {
    var raw = localStorage.getItem('wakaru-flash-session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function saveFlashSession(levelId, mode, idx) {
  try { localStorage.setItem('wakaru-flash-session', JSON.stringify({ levelId: levelId, mode: mode, idx: idx })); } catch (e) {}
}
function clearFlashSession() {
  try { localStorage.removeItem('wakaru-flash-session'); } catch (e) {}
}

// ── Navigation ────────────────────────────────────────────────────

function wakaruGoBack() {
  if (currentPage === 'home') return 'false';
  if (currentPage.indexOf('kanji:') === 0 || currentPage.indexOf('flash:') === 0) {
    var levelId = currentPage.split(':')[1];
    goLevel(levelId);
    return 'true';
  }
  if (currentPage.indexOf('quiz:') === 0) {
    var levelId = currentPage.split(':')[1];
    var onResult = !!document.querySelector('.quiz-result');
    if (!onResult && !confirm('Keluar dari kuis? Skor belum disimpan.')) {
      return 'true';
    }
    goLevel(levelId);
    return 'true';
  }
  renderHome();
  return 'true';
}

init();
