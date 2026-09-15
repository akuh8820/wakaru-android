/**
 * WakaruViews — kategori-specific view renderer (Phase 3 lane 2)
 * ES5, no modules. Single entry: renderKategoriView(id, container)
 * 10 kategori-specific views + generic fallback.
 */
var WakaruViews = (function () {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function getKategoriInfo(id) {
    if (typeof WakaruData !== 'undefined' && WakaruData.getKategoriList) {
      var list = WakaruData.getKategoriList();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
      }
    }
    return { id: id, name: id, icon: '', color: '' };
  }

  function speak(text) {
    try {
      if (window.WakaruAudio && typeof window.WakaruAudio.speak === 'function') {
        window.WakaruAudio.speak(String(text || ''));
      } else if (typeof Android !== 'undefined' && Android && Android.speakJapanese) {
        Android.speakJapanese(String(text || ''));
      }
    } catch (e) {}
  }

  function focusContainer(container) {
    try {
      if (container && container.setAttribute) container.setAttribute('tabindex', '-1');
      if (container && container.focus) container.focus();
    } catch (e) {}
  }

  function collectFields(item) {
    var fields = [];
    for (var k in item) {
      if (!item.hasOwnProperty(k)) continue;
      var v = item[k];
      if (typeof v === 'string') fields.push(v.toLowerCase());
      else if (Array.isArray(v)) {
        for (var i = 0; i < v.length; i++) {
          if (typeof v[i] === 'string') fields.push(v[i].toLowerCase());
        }
      }
    }
    if (item.forms && typeof item.forms === 'object') {
      for (var fk in item.forms) {
        if (item.forms.hasOwnProperty(fk) && typeof item.forms[fk] === 'string') fields.push(item.forms[fk].toLowerCase());
      }
    }
    return fields;
  }

  function filterItems(items, q) {
    if (!q) return items;
    var lower = q.toLowerCase().trim();
    if (!lower) return items;
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var fields = collectFields(items[i]);
      for (var j = 0; j < fields.length; j++) {
        if (fields[j].indexOf(lower) !== -1) { out.push(items[i]); break; }
      }
    }
    return out;
  }

  function buildRow(it, categoryId) {
    var rowClass = 'materi-item kamus-row';
    var isKanji = categoryId === 'kanji' && !!it.kanji;
    if (isKanji) rowClass += ' kamus-row--clickable materi-kanji';
    var title = it.kanji || it.kana || it.verb || it.adj || it.partikel || it.pola || it.char || '';
    var dataAttr = ' data-kamus-item="' + esc(title) + '"';
    var h = '<div class="' + rowClass + '"' + dataAttr + '>';
    if (isKanji) {
      var mean = esc((it.meanings_id || []).join(', '));
      var onR = (it.on_readings || []).slice(0, 2).join('・');
      var kunR = (it.kun_readings || []).slice(0, 2).join('・');
      var read = esc(onR + (kunR ? ' / ' + kunR : ''));
      h += '<span class="mi-kanji" lang="ja">' + esc(it.kanji) + '</span>';
      h += '<span class="mi-body"><span class="mi-mean">' + mean + '</span><span class="mi-read">' + read + '</span></span>';
    } else if (categoryId === 'partikel') {
      h += '<span class="mi-kanji" lang="ja">' + esc(it.partikel) + '</span>';
      h += '<span class="mi-body"><span class="mi-mean" lang="ja">' + esc(it.kana) + '</span>';
      h += '<span class="mi-read">' + esc(it.fungsi) + '</span>';
      h += '<span class="mi-meta">' + esc(it.contoh) + ' — ' + esc(it.arti_contoh) + '</span></span>';
    } else if (categoryId === 'grammar') {
      h += '<span class="mi-body"><span class="mi-vkanji" lang="ja">' + esc(it.pola) + '</span>';
      h += '<span class="mi-mean">' + esc(it.arti) + '</span>';
      h += '<span class="mi-read">' + esc(it.contoh) + ' — ' + esc(it.terjemahan) + '</span></span>';
    } else if (categoryId === 'kata-kerja' || categoryId === 'kata-sifat') {
      var word = esc(it.verb || it.adj || it.kanji || it.kana);
      var kana = esc(it.kana || '');
      var romaji = esc(it.romaji || '');
      h += '<span class="mi-body"><span class="mi-vhead"><span class="mi-vkanji" lang="ja">' + word + '</span>';
      if (it.kanji && it.kana && it.kanji !== it.kana) {
        h += '<span class="mi-vkana" lang="ja">' + kana + '</span>';
      }
      h += '</span><span class="mi-mean">' + esc(it.arti) + '</span>';
      if (!(it.kanji && it.kana && it.kanji !== it.kana) && kana) {
        h += '<span class="mi-read" lang="ja">' + kana + '</span>';
      }
      if (romaji) h += '<span class="mi-romaji">' + romaji + '</span>';
      h += '</span>';
    } else {
      var w = it.kanji || it.char || it.kana || '';
      var kana2 = it.kana || '';
      var arti = it.arti || '';
      var romaji2 = it.romaji || '';
      if (it.char) {
        h += '<span class="mi-kanji" lang="ja">' + esc(it.char) + '</span>';
        h += '<span class="mi-body"><span class="mi-mean">' + esc(romaji2) + '</span>';
        if (it.row) h += '<span class="mi-read">Baris ' + esc(it.row) + '</span>';
        h += '</span>';
      } else {
        var showKana = it.kanji && it.kana && it.kanji !== it.kana;
        h += '<span class="mi-body"><span class="mi-vhead"><span class="mi-vkanji" lang="ja">' + esc(w) + '</span>';
        if (showKana) h += '<span class="mi-vkana" lang="ja">' + esc(kana2) + '</span>';
        h += '</span><span class="mi-mean">' + esc(arti) + '</span>';
        if (!showKana && kana2) h += '<span class="mi-read" lang="ja">' + esc(kana2) + '</span>';
        if (romaji2) h += '<span class="mi-romaji">' + esc(romaji2) + '</span>';
        h += '</span>';
      }
    }
    h += '</div>';
    return h;
  }

  function renderList(items, categoryId, listEl, countEl, emptyEl, filter) {
    var filtered = filterItems(items, filter);
    if (countEl) countEl.textContent = filtered.length ? filtered.length + ' entri' : '';
    if (emptyEl) emptyEl.hidden = filtered.length !== 0;
    if (listEl) listEl.hidden = filtered.length === 0;
    if (!listEl) return;
    if (filtered.length === 0) { listEl.innerHTML = ''; return; }
    var parts = [];
    for (var i = 0; i < filtered.length; i++) {
      parts.push(buildRow(filtered[i], categoryId));
    }
    listEl.innerHTML = parts.join('');
  }

  function cleanHandlers(container) {
    try {
      if (container._wakaruClick && container.removeEventListener) container.removeEventListener('click', container._wakaruClick);
      if (container._wakaruInput && container.removeEventListener) container.removeEventListener('input', container._wakaruInput);
    } catch (e) {}
    container._wakaruClick = null;
    container._wakaruInput = null;
  }

  function bindHandlers(container, clickFn, inputFn) {
    if (container.addEventListener) {
      if (clickFn) {
        container.addEventListener('click', clickFn);
        container._wakaruClick = clickFn;
      }
      if (inputFn) {
        container.addEventListener('input', inputFn);
        container._wakaruInput = inputFn;
      }
    }
  }

  /* ── 1. hiragana / katakana — Gojuon grid ───────────────────── */
  function renderKanaView(id, container) {
    if (!container) return;
    cleanHandlers(container);
    var info = getKategoriInfo(id);
    var title = info.name || id;
    var isHira = id === 'hiragana';
    var data = [];
    try {
      if (isHira) {
        data = (typeof WakaruData !== 'undefined' && WakaruData.getHiragana) ? WakaruData.getHiragana() : [];
        if (!data || !data.length) data = (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori('hiragana') : [];
      } else {
        data = (typeof WakaruData !== 'undefined' && WakaruData.getKatakana) ? WakaruData.getKatakana() : [];
        if (!data || !data.length) data = (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori('katakana') : [];
      }
    } catch (e) { data = []; }

    // handle promise
    if (data && typeof data.then === 'function') {
      container.innerHTML = '<div class="level-loading" role="status" aria-live="polite"><div class="spinner" aria-hidden="true"></div><p>Memuat…</p></div>';
      data.then(function (items) {
        data = items || [];
        doRenderKana();
      });
      return;
    }
    doRenderKana();

    function doRenderKana() {
      var order = ['A', 'K', 'S', 'T', 'N', 'H', 'M', 'Y', 'R', 'W', 'Lainnya'];
      var labels = { A: 'A行', K: 'K行', S: 'S行', T: 'T行', N: 'N行', H: 'H行', M: 'M行', Y: 'Y行', R: 'R行', W: 'W行', Lainnya: 'Lainnya' };
      var byRow = {};
      for (var i = 0; i < order.length; i++) byRow[order[i]] = [];
      for (var j = 0; j < data.length; j++) {
        var r = data[j].row;
        if (byRow[r]) byRow[r].push(data[j]);
        else {
          if (!byRow['Lainnya']) byRow['Lainnya'] = [];
          byRow['Lainnya'].push(data[j]);
        }
      }
      var h = '';
      h += '<div class="page-header kategori-view__header">';
      h += '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke kategori">← Kembali</button>';
      h += '<div class="kana-toggle" role="group" aria-label="Pilih kana">';
      h += '<button type="button" class="kana-toggle__btn' + (isHira ? ' is-active' : '') + '" data-kana="hiragana" aria-label="Tampilkan Hiragana" aria-pressed="' + (isHira ? 'true' : 'false') + '">Hiragana</button>';
      h += '<button type="button" class="kana-toggle__btn' + (!isHira ? ' is-active' : '') + '" data-kana="katakana" aria-label="Tampilkan Katakana" aria-pressed="' + (!isHira ? 'true' : 'false') + '">Katakana</button>';
      h += '</div>';
      h += '<span class="page-header__level">' + esc(title) + '</span>';
      h += '</div>';
      h += '<div class="level-count" id="kategori-count" aria-live="polite">' + data.length + ' kana</div>';
      h += '<div class="gojuon" role="list" aria-label="' + esc(title) + ' gojuon">';
      for (var ri = 0; ri < order.length; ri++) {
        var rowKey = order[ri];
        var items = byRow[rowKey] || [];
        if (!items.length) continue;
        h += '<div class="gj-row" role="listitem">';
        h += '<span class="gj-row-label" aria-hidden="true">' + esc(labels[rowKey]) + '</span>';
        h += '<div class="gj-row-cells">';
        for (var ci = 0; ci < items.length; ci++) {
          var it = items[ci];
          h += '<button type="button" class="gj-cell" data-char="' + esc(it.char) + '" data-romaji="' + esc(it.romaji) + '" aria-label="' + esc(it.char) + ' — ' + esc(it.romaji) + '">';
          h += '<span class="gj-cell__char" lang="ja">' + esc(it.char) + '</span>';
          h += '<span class="gj-cell__roma">' + esc(it.romaji) + '</span>';
          h += '</button>';
        }
        h += '</div></div>';
      }
      h += '</div>';
      h += '<p class="gj-hint">Ketuk kana untuk melihat romaji dan mendengar pelafalan.</p>';
      container.innerHTML = h;
      focusContainer(container);

      function onClick(ev) {
        var t = ev.target;
        var cell = t.closest ? t.closest('.gj-cell') : null;
        if (cell && container.contains(cell)) {
          var ch = cell.getAttribute('data-char');
          var wasActive = cell.className.indexOf('is-active') !== -1;
          var all = container.querySelectorAll ? container.querySelectorAll('.gj-cell.is-active') : [];
          for (var k = 0; k < all.length; k++) all[k].className = all[k].className.replace(' is-active', '').replace('is-active', '');
          if (!wasActive) cell.className += ' is-active';
          if (ch) speak(ch);
          return;
        }
        var toggle = t.closest ? t.closest('[data-kana]') : null;
        if (toggle && container.contains(toggle)) {
          var nk = toggle.getAttribute('data-kana');
          if (nk && nk !== id) {
            renderKanaView(nk, container);
          }
          return;
        }
        var back = t.closest ? t.closest('#kategori-back-btn') : null;
        if (back) {
          if (window.WakaruKamus && window.WakaruKamus.showGrid) window.WakaruKamus.showGrid();
        }
      }
      bindHandlers(container, onClick, null);
    }
  }

  /* ── 2. kosakata — Topic cards + topic list ────────────────── */
  function renderKosakataView(container) {
    if (!container) return;
    cleanHandlers(container);
    var info = getKategoriInfo('kosakata');
    var title = info.name || 'Kosakata';
    var topics = [];
    try {
      topics = (typeof WakaruData !== 'undefined' && WakaruData.getKosakataTopics) ? WakaruData.getKosakataTopics() : [];
    } catch (e) { topics = []; }
    // fallback scan if empty but kosakata exists
    if (!topics.length) {
      try {
        var allK = (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori('kosakata') : [];
        var seen = {};
        for (var i = 0; i < allK.length; i++) {
          var cat = allK[i].category;
          if (cat && !seen[cat]) { seen[cat] = true; topics.push(cat); }
        }
      } catch (e2) {}
    }
    var topicCounts = {};
    var firstCharMap = {};
    for (var ti = 0; ti < topics.length; ti++) {
      var tp = topics[ti];
      try {
        var arr = (typeof WakaruData !== 'undefined' && WakaruData.getKosakataByTopic) ? WakaruData.getKosakataByTopic(tp) : [];
        topicCounts[tp] = arr.length;
        if (arr.length) {
          var first = arr[0];
          var ch = (first.kanji || first.kana || tp.charAt(0) || '').charAt(0);
          firstCharMap[tp] = ch;
        } else { firstCharMap[tp] = tp.charAt(0); }
      } catch (e) { topicCounts[tp] = 0; firstCharMap[tp] = tp.charAt(0); }
    }
    var currentTopic = null;
    var currentFilter = '';

    function buildCards() {
      var h = '';
      h += '<div class="page-header kategori-view__header">';
      h += '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke kategori">← Kembali</button>';
      h += '<span class="page-header__level">' + esc(title) + '</span>';
      h += '</div>';
      h += '<div class="level-count" aria-live="polite">' + topics.length + ' topik · ' + getTotalWords() + ' kata</div>';
      h += '<div class="topic-grid" role="list" aria-label="Topik kosakata">';
      for (var i = 0; i < topics.length; i++) {
        var t = topics[i];
        var cnt = topicCounts[t] || 0;
        var ic = firstCharMap[t] || t.charAt(0);
        h += '<button type="button" class="topic-card" data-topic="' + esc(t) + '" role="listitem" aria-label="' + esc(t) + ' — ' + cnt + ' entri">';
        h += '<span class="topic-card__icon" lang="ja" aria-hidden="true">' + esc(ic) + '</span>';
        h += '<span class="topic-card__accent" aria-hidden="true"></span>';
        h += '<span class="topic-card__label">' + esc(t) + '</span>';
        h += '<span class="topic-card__count">' + cnt + ' entri</span>';
        h += '</button>';
      }
      h += '</div>';
      return h;
    }

    function getTotalWords() {
      var s = 0;
      for (var k in topicCounts) if (topicCounts.hasOwnProperty(k)) s += topicCounts[k];
      return s;
    }

    function buildTopicList() {
      var items = [];
      try { items = (typeof WakaruData !== 'undefined' && WakaruData.getKosakataByTopic) ? WakaruData.getKosakataByTopic(currentTopic) : []; } catch (e) { items = []; }
      var filtered = filterItems(items, currentFilter);
      var h = '';
      h += '<div class="page-header kategori-view__header">';
      h += '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke topik">← Kembali</button>';
      h += '<span class="page-header__level">' + esc(currentTopic) + '</span>';
      h += '</div>';
      h += '<label class="search-wrap" aria-label="Cari di ' + esc(currentTopic) + '">';
      h += '<span class="search-wrap__icon" aria-hidden="true">⌕</span>';
      h += '<input id="kategori-search" class="search-input" type="search" placeholder="Cari kata, kana, atau arti…" autocomplete="off" spellcheck="false" aria-label="Cari di ' + esc(currentTopic) + '" value="' + esc(currentFilter) + '">';
      h += '</label>';
      h += '<div class="level-count" id="kategori-count" aria-live="polite">' + (filtered.length ? filtered.length + ' entri' : 'Tidak ada hasil') + '</div>';
      h += '<div id="kategori-list" class="materi-list kategori-list" aria-live="polite">';
      if (filtered.length) {
        for (var i = 0; i < filtered.length; i++) h += buildRow(filtered[i], 'kosakata');
      }
      h += '</div>';
      if (!filtered.length) {
        h += '<div class="empty-state"><p class="empty-state__title">Tidak ditemukan</p><p class="empty-state__msg">Coba kata kunci lain.</p></div>';
      }
      return h;
    }

    function refresh() {
      if (currentTopic === null) container.innerHTML = buildCards();
      else container.innerHTML = buildTopicList();
      var inp = container.querySelector ? container.querySelector('#kategori-search') : null;
      if (inp && currentTopic !== null) {
        try { inp.focus(); } catch (e) {}
        if (currentFilter) {
          try { var len = inp.value.length; inp.setSelectionRange(len, len); } catch (e2) {}
        }
      } else {
        focusContainer(container);
      }
    }

    refresh();

    function onClick(ev) {
      var t = ev.target;
      var card = t.closest ? t.closest('[data-topic]') : null;
      if (card && container.contains(card)) {
        var tp = card.getAttribute('data-topic');
        if (tp) {
          currentTopic = tp;
          currentFilter = '';
          refresh();
        }
        return;
      }
      var back = t.closest ? t.closest('#kategori-back-btn') : null;
      if (back) {
        if (currentTopic !== null) {
          currentTopic = null;
          currentFilter = '';
          refresh();
        } else {
          if (window.WakaruKamus && window.WakaruKamus.showGrid) window.WakaruKamus.showGrid();
        }
        return;
      }
    }

    function onInput(ev) {
      var inp = ev.target;
      if (inp && inp.id === 'kategori-search') {
        currentFilter = inp.value;
        var items = [];
        try { items = (typeof WakaruData !== 'undefined' && WakaruData.getKosakataByTopic) ? WakaruData.getKosakataByTopic(currentTopic) : []; } catch (e) { items = []; }
        var filtered = filterItems(items, currentFilter);
        var listEl = container.querySelector ? container.querySelector('#kategori-list') : null;
        var countEl = container.querySelector ? container.querySelector('#kategori-count') : null;
        var emptyEl = container.querySelector ? container.querySelector('.empty-state') : null;
        if (countEl) countEl.textContent = filtered.length ? filtered.length + ' entri' : 'Tidak ada hasil';
        if (listEl) {
          if (!filtered.length) listEl.innerHTML = '';
          else {
            var parts = [];
            for (var i = 0; i < filtered.length; i++) parts.push(buildRow(filtered[i], 'kosakata'));
            listEl.innerHTML = parts.join('');
          }
        }
        if (emptyEl) emptyEl.hidden = filtered.length !== 0;
        if (listEl) listEl.hidden = filtered.length === 0;
      }
    }

    bindHandlers(container, onClick, onInput);
  }

  /* ── 3. grammar — Group tabs + list + detail ────────────────── */
  function renderGrammarView(container) {
    if (!container) return;
    cleanHandlers(container);
    var info = getKategoriInfo('grammar');
    var title = info.name || 'Grammar';
    var groups = [];
    try { groups = (typeof WakaruData !== 'undefined' && WakaruData.getGrammarGroups) ? WakaruData.getGrammarGroups() : []; } catch (e) { groups = []; }
    if (!groups.length) {
      try {
        var allB = (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori('grammar') : [];
        var seen = {};
        for (var i = 0; i < allB.length; i++) { var g = allB[i].kelompok; if (g && !seen[g]) { seen[g] = true; groups.push(g); } }
      } catch (e2) {}
    }
    var activeGroup = groups.length ? groups[0] : null;
    var selected = null;
    var currentFilter = '';

    function getGroupItems(g) {
      try { return (typeof WakaruData !== 'undefined' && WakaruData.getGrammarByGroup) ? WakaruData.getGrammarByGroup(g) : []; } catch (e) { return []; }
    }

    function buildListHtml() {
      var items = activeGroup ? getGroupItems(activeGroup) : [];
      var filtered = filterItems(items, currentFilter);
      var h = '';
      h += '<div class="page-header kategori-view__header">';
      h += '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke kategori">← Kembali</button>';
      h += '<span class="page-header__level">' + esc(title) + '</span>';
      h += '</div>';
      h += '<div class="grammar-pills" role="tablist" aria-label="Kelompok grammar">';
      for (var i = 0; i < groups.length; i++) {
        var g = groups[i];
        var isActive = g === activeGroup;
        h += '<button type="button" role="tab" class="grammar-pill' + (isActive ? ' is-active' : '') + '" data-group="' + esc(g) + '" aria-selected="' + (isActive ? 'true' : 'false') + '" aria-label="Kelompok ' + esc(g) + '">' + esc(g) + '</button>';
      }
      h += '</div>';
      h += '<label class="search-wrap" aria-label="Cari di ' + esc(activeGroup || title) + '">';
      h += '<span class="search-wrap__icon" aria-hidden="true">⌕</span>';
      h += '<input id="kategori-search" class="search-input" type="search" placeholder="Cari pola atau arti…" autocomplete="off" spellcheck="false" aria-label="Cari grammar" value="' + esc(currentFilter) + '">';
      h += '</label>';
      h += '<div class="level-count" id="kategori-count" aria-live="polite">' + (filtered.length ? filtered.length + ' pola' : 'Tidak ada hasil') + '</div>';
      h += '<div id="kategori-list" class="materi-list kategori-list" aria-live="polite">';
      if (filtered.length) {
        for (var j = 0; j < filtered.length; j++) {
          var it = filtered[j];
          var idx = -1;
          for (var k = 0; k < items.length; k++) if (items[k] === it) { idx = k; break; }
          h += '<button type="button" class="materi-item kamus-row grammar-row" data-grammar-group="' + esc(activeGroup) + '" data-grammar-idx="' + idx + '" aria-label="' + esc(it.pola) + '">';
          h += '<span class="mi-body"><span class="mi-vkanji" lang="ja">' + esc(it.pola) + '</span>';
          h += '<span class="mi-mean">' + esc(it.arti) + '</span>';
          h += '<span class="mi-read">' + esc(it.contoh) + ' — ' + esc(it.terjemahan) + '</span></span>';
          h += '</button>';
        }
      }
      h += '</div>';
      if (!filtered.length) {
        h += '<div class="empty-state"><p class="empty-state__title">Tidak ditemukan</p><p class="empty-state__msg">Coba kata kunci lain.</p></div>';
      }
      return h;
    }

    function buildDetailHtml() {
      var h = '';
      h += '<div class="page-header kategori-view__header">';
      h += '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke daftar">← Kembali</button>';
      h += '<span class="page-header__level">' + esc(activeGroup || title) + '</span>';
      h += '</div>';
      h += '<div class="grammar-detail">';
      h += '<h2 class="grammar-detail__pola" lang="ja">' + esc(selected.pola) + '</h2>';
      h += '<p class="grammar-detail__arti">' + esc(selected.arti) + '</p>';
      if (selected.romaji) h += '<p class="grammar-detail__romaji">' + esc(selected.romaji) + '</p>';
      h += '<div class="grammar-detail__contoh">';
      h += '<span lang="ja">' + esc(selected.contoh) + '</span>';
      h += '<button type="button" class="audio-btn" data-speak="' + esc(selected.contoh) + '" aria-label="Dengarkan contoh ' + esc(selected.contoh) + '"><svg class="audio-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button>';
      h += '</div>';
      h += '<p class="grammar-detail__terjemahan">' + esc(selected.terjemahan) + '</p>';
      h += '</div>';
      return h;
    }

    function refresh() {
      if (selected) container.innerHTML = buildDetailHtml();
      else container.innerHTML = buildListHtml();
      if (!selected) {
        var inp = container.querySelector ? container.querySelector('#kategori-search') : null;
        if (inp) { try { inp.focus(); } catch (e) {} }
      } else {
        focusContainer(container);
      }
    }

    refresh();

    function onClick(ev) {
      var t = ev.target;
      if (selected) {
        var back = t.closest ? t.closest('#kategori-back-btn') : null;
        if (back) { selected = null; refresh(); return; }
        return;
      }
      var pill = t.closest ? t.closest('[data-group]') : null;
      if (pill && container.contains(pill)) {
        var g = pill.getAttribute('data-group');
        if (g && g !== activeGroup) { activeGroup = g; currentFilter = ''; selected = null; refresh(); }
        return;
      }
      var row = t.closest ? t.closest('[data-grammar-idx]') : null;
      if (row && container.contains(row)) {
        var idx = parseInt(row.getAttribute('data-grammar-idx'), 10);
        var items = activeGroup ? getGroupItems(activeGroup) : [];
        if (!isNaN(idx) && items[idx]) { selected = items[idx]; refresh(); }
        return;
      }
      var back2 = t.closest ? t.closest('#kategori-back-btn') : null;
      if (back2) {
        if (window.WakaruKamus && window.WakaruKamus.showGrid) window.WakaruKamus.showGrid();
      }
    }

    function onInput(ev) {
      var inp = ev.target;
      if (inp && inp.id === 'kategori-search' && !selected) {
        currentFilter = inp.value;
        var items = activeGroup ? getGroupItems(activeGroup) : [];
        var filtered = filterItems(items, currentFilter);
        var listEl = container.querySelector ? container.querySelector('#kategori-list') : null;
        var countEl = container.querySelector ? container.querySelector('#kategori-count') : null;
        var emptyEl = container.querySelector ? container.querySelector('.empty-state') : null;
        if (countEl) countEl.textContent = filtered.length ? filtered.length + ' pola' : 'Tidak ada hasil';
        if (listEl) {
          if (!filtered.length) listEl.innerHTML = '';
          else {
            var parts = [];
            for (var i = 0; i < filtered.length; i++) {
              var it = filtered[i];
              var idx = -1;
              for (var k = 0; k < items.length; k++) if (items[k] === it) { idx = k; break; }
              parts.push('<button type="button" class="materi-item kamus-row grammar-row" data-grammar-group="' + esc(activeGroup) + '" data-grammar-idx="' + idx + '" aria-label="' + esc(it.pola) + '"><span class="mi-body"><span class="mi-vkanji" lang="ja">' + esc(it.pola) + '</span><span class="mi-mean">' + esc(it.arti) + '</span><span class="mi-read">' + esc(it.contoh) + ' — ' + esc(it.terjemahan) + '</span></span></button>');
            }
            listEl.innerHTML = parts.join('');
          }
        }
        if (emptyEl) emptyEl.hidden = filtered.length !== 0;
        if (listEl) listEl.hidden = filtered.length === 0;
      }
    }

    bindHandlers(container, onClick, onInput);
  }

  /* ── 4. kata-kerja / kata-sifat — Conjugation tables ──────── */
  function renderConjugationView(id, container) {
    if (!container) return;
    cleanHandlers(container);
    var isVerb = id === 'kata-kerja';
    var info = getKategoriInfo(id);
    var title = info.name || id;
    var items = [];
    try {
      if (typeof WakaruData !== 'undefined' && WakaruData.getConjugation) items = WakaruData.getConjugation(id);
      if (!items || !items.length) items = (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori(id) : [];
    } catch (e) { items = []; }
    if (items && typeof items.then === 'function') {
      container.innerHTML = '<div class="level-loading" role="status" aria-live="polite"><div class="spinner" aria-hidden="true"></div><p>Memuat…</p></div>';
      items.then(function (arr) {
        items = arr || [];
        doRenderConj();
      });
      return;
    }
    doRenderConj();

    function doRenderConj() {
      var verbForms = ['masu', 'masen', 'mashita', 'masendeshita', 'te', 'ta', 'nai', 'nakatta', 'potential', 'passive', 'causative', 'volitional'];
      var adjForms = ['masu', 'masen', 'mashita', 'masendeshita', 'te', 'nai', 'nakatta'];
      var formKeys = isVerb ? verbForms : adjForms;
      var formLabels = {
        masu: 'masu', masen: 'masen', mashita: 'mashita', masendeshita: 'masen-deshita',
        te: 'te', ta: 'ta', nai: 'nai', nakatta: 'nakatta',
        potential: 'potensial', passive: 'pasif', causative: 'kausatif', volitional: 'volitional'
      };
      var currentFilter = '';
      var grouped = {};
      var groupOrder = [];
      for (var i = 0; i < items.length; i++) {
        var g = items[i].group || 'lainnya';
        if (!grouped[g]) { grouped[g] = []; groupOrder.push(g); }
        grouped[g].push(items[i]);
      }
      // sort groupOrder for consistency: verb godan/ichidan/irregular, adj i-adj/na-adj
      if (isVerb) {
        var verbOrder = ['godan', 'ichidan', 'irregular'];
        groupOrder.sort(function (a, b) {
          var ai = verbOrder.indexOf(a); var bi = verbOrder.indexOf(b);
          if (ai === -1) ai = 99; if (bi === -1) bi = 99;
          return ai - bi;
        });
      } else {
        var adjOrder = ['i-adj', 'na-adj'];
        groupOrder.sort(function (a, b) {
          var ai = adjOrder.indexOf(a); var bi = adjOrder.indexOf(b);
          if (ai === -1) ai = 99; if (bi === -1) bi = 99;
          return ai - bi;
        });
      }

      function filteredItems() {
        if (!currentFilter) return items;
        return filterItems(items, currentFilter);
      }

      function buildHtml() {
        var h = '';
        h += '<div class="page-header kategori-view__header">';
        h += '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke kategori">← Kembali</button>';
        h += '<span class="page-header__level">' + esc(title) + '</span>';
        h += '</div>';
        h += '<label class="search-wrap" aria-label="Cari di ' + esc(title) + '">';
        h += '<span class="search-wrap__icon" aria-hidden="true">⌕</span>';
        h += '<input id="kategori-search" class="search-input" type="search" placeholder="Cari verba atau arti…" autocomplete="off" spellcheck="false" aria-label="Cari di ' + esc(title) + '" value="' + esc(currentFilter) + '">';
        h += '</label>';
        var total = isVerb ? items.length + ' verba' : items.length + ' adjektiva';
        h += '<div class="level-count" id="kategori-count" aria-live="polite">' + esc(total) + (currentFilter ? ' · filter: ' + esc(currentFilter) : '') + '</div>';
        h += '<div class="conj-wrap" role="region" aria-label="Tabel konjugasi ' + esc(title) + '" tabindex="0">';
        h += '<table class="conj-table"><thead><tr>';
        h += '<th class="conj-th conj-th--corner">Kata</th>';
        for (var f = 0; f < formKeys.length; f++) {
          var fk = formKeys[f];
          var lab = formLabels[fk] || fk;
          h += '<th class="conj-th" scope="col">' + esc(lab) + '</th>';
        }
        h += '</tr></thead><tbody>';
        // filtered groups
        var filt = filteredItems();
        var filtSet = {};
        for (var s = 0; s < filt.length; s++) {
          var key = (filt[s].verb || filt[s].adj || filt[s].kanji || filt[s].kana) + '|' + filt[s].kana;
          filtSet[key] = true;
        }
        for (var gi = 0; gi < groupOrder.length; gi++) {
          var gname = groupOrder[gi];
          var rows = grouped[gname] || [];
          var visibleRows = [];
          for (var r = 0; r < rows.length; r++) {
            var rk = (rows[r].verb || rows[r].adj || rows[r].kanji || rows[r].kana) + '|' + rows[r].kana;
            if (!currentFilter || filtSet[rk]) visibleRows.push(rows[r]);
          }
          if (!visibleRows.length) continue;
          h += '<tr class="conj-group-row"><td colspan="' + (formKeys.length + 1) + '">' + esc(gname) + ' · ' + visibleRows.length + '</td></tr>';
          for (var ri = 0; ri < visibleRows.length; ri++) {
            var it = visibleRows[ri];
            var word = it.verb || it.adj || it.kanji || it.kana || '';
            h += '<tr>';
            h += '<th class="conj-first" scope="row"><span class="conj-first__word" lang="ja">' + esc(word) + '</span>';
            if (it.kana && it.kana !== word) h += '<span class="conj-first__kana" lang="ja">' + esc(it.kana) + '</span>';
            h += '<span class="conj-first__arti">' + esc(it.arti || '') + '</span></th>';
            for (var fi = 0; fi < formKeys.length; fi++) {
              var fkey = formKeys[fi];
              var formVal = (it.forms && it.forms[fkey]) ? it.forms[fkey] : '—';
              h += '<td class="conj-td"><button type="button" class="conj-cell" data-speak="' + esc(formVal) + '" aria-label="' + esc(word) + ' ' + esc(formLabels[fkey] || fkey) + ' — ' + esc(formVal) + '" lang="ja">' + esc(formVal) + '</button></td>';
            }
            h += '</tr>';
          }
        }
        h += '</tbody></table>';
        h += '</div>';
        h += '<p class="conj-hint">Geser tabel ke samping untuk melihat semua bentuk · ketuk sel untuk mendengar.</p>';
        return h;
      }

      container.innerHTML = buildHtml();
      focusContainer(container);

      function onClick(ev) {
        var t = ev.target;
        var cell = t.closest ? t.closest('.conj-cell') : null;
        if (cell && container.contains(cell)) {
          var txt = cell.getAttribute('data-speak');
          if (txt && txt !== '—') speak(txt);
          return;
        }
        var back = t.closest ? t.closest('#kategori-back-btn') : null;
        if (back) {
          if (window.WakaruKamus && window.WakaruKamus.showGrid) window.WakaruKamus.showGrid();
        }
      }

      function onInput(ev) {
        var inp = ev.target;
        if (inp && inp.id === 'kategori-search') {
          currentFilter = inp.value;
          container.innerHTML = buildHtml();
          var newInp = container.querySelector ? container.querySelector('#kategori-search') : null;
          if (newInp) {
            try { newInp.focus(); } catch (e) {}
            try { var len = newInp.value.length; newInp.setSelectionRange(len, len); } catch (e2) {}
          }
        }
      }

      bindHandlers(container, onClick, onInput);
    }
  }

  /* ── 5. partikel / kata-bantu — List + detail ──────────── */
  function renderDetailView(id, container) {
    if (!container) return;
    cleanHandlers(container);
    var info = getKategoriInfo(id);
    var title = info.name || id;
    var items = [];
    try { items = (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori(id) : []; } catch (e) { items = []; }
    if (items && typeof items.then === 'function') {
      container.innerHTML = '<div class="level-loading" role="status" aria-live="polite"><div class="spinner" aria-hidden="true"></div><p>Memuat…</p></div>';
      items.then(function (arr) { items = arr || []; doRenderDetail(); });
      return;
    }
    doRenderDetail();

    function doRenderDetail() {
      var selected = null;
      var currentFilter = '';
      function buildList() {
        var filtered = filterItems(items, currentFilter);
        var h = '';
        h += '<div class="page-header kategori-view__header">';
        h += '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke kategori">← Kembali</button>';
        h += '<span class="page-header__level">' + esc(title) + '</span>';
        h += '</div>';
        h += '<label class="search-wrap" aria-label="Cari di ' + esc(title) + '">';
        h += '<span class="search-wrap__icon" aria-hidden="true">⌕</span>';
        h += '<input id="kategori-search" class="search-input" type="search" placeholder="Cari partikel atau fungsi…" autocomplete="off" spellcheck="false" aria-label="Cari di ' + esc(title) + '" value="' + esc(currentFilter) + '">';
        h += '</label>';
        h += '<div class="level-count" id="kategori-count" aria-live="polite">' + (filtered.length ? filtered.length + ' entri' : 'Tidak ada hasil') + '</div>';
        h += '<div id="kategori-list" class="materi-list kategori-list" aria-live="polite">';
        if (filtered.length) {
          for (var i = 0; i < filtered.length; i++) h += buildDetailRow(filtered[i], i, items);
        }
        h += '</div>';
        if (!filtered.length) h += '<div class="empty-state"><p class="empty-state__title">Tidak ditemukan</p><p class="empty-state__msg">Coba kata kunci lain.</p></div>';
        return h;
      }

      function buildDetailRow(it, idxInFiltered, allItems) {
        var realIdx = -1;
        for (var k = 0; k < allItems.length; k++) if (allItems[k] === it) { realIdx = k; break; }
        var row = '<button type="button" class="materi-item kamus-row" data-detail-idx="' + realIdx + '" aria-label="' + esc(it.partikel || it.kanji || it.kana) + '">';
        if (id === 'partikel') {
          row += '<span class="mi-kanji" lang="ja">' + esc(it.partikel) + '</span>';
          row += '<span class="mi-body"><span class="mi-mean" lang="ja">' + esc(it.kana) + '</span>';
          row += '<span class="mi-read">' + esc(it.fungsi) + '</span></span>';
        } else {
          var w = it.kanji || it.kana || '';
          row += '<span class="mi-body"><span class="mi-vhead"><span class="mi-vkanji" lang="ja">' + esc(w) + '</span>';
          row += '<span class="mi-vkana" lang="ja">' + esc(it.kana || '') + '</span></span>';
          row += '<span class="mi-mean">' + esc(it.arti || '') + '</span>';
          if (it.romaji) row += '<span class="mi-romaji">' + esc(it.romaji) + '</span>';
          row += '</span>';
        }
        row += '</button>';
        return row;
      }

      function buildDetail() {
        var h = '';
        h += '<div class="page-header kategori-view__header">';
        h += '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke daftar">← Kembali</button>';
        h += '<span class="page-header__level">' + esc(title) + '</span>';
        h += '</div>';
        if (id === 'partikel') {
          h += '<div class="detail-hero">';
          h += '<span class="detail-hero__char" lang="ja">' + esc(selected.partikel) + '</span>';
          h += '<span class="detail-hero__kana" lang="ja">' + esc(selected.kana || '') + '</span>';
          h += '<p class="detail-hero__fungsi">' + esc(selected.fungsi || '') + '</p>';
          h += '</div>';
          if (selected.contoh) {
            h += '<div class="section-block"><h2 class="section-title">Contoh</h2>';
            h += '<div class="example-item"><div class="example-jp"><span lang="ja">' + esc(selected.contoh) + '</span>';
            h += '<button type="button" class="audio-btn" data-speak="' + esc(selected.contoh) + '" aria-label="Dengarkan contoh"><svg class="audio-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button></div>';
            if (selected.arti_contoh) h += '<span class="example-id">' + esc(selected.arti_contoh) + '</span>';
            h += '</div></div>';
          }
        } else {
          var w2 = selected.kanji || selected.kana || '';
          h += '<div class="detail-hero">';
          h += '<span class="detail-hero__char" lang="ja">' + esc(w2) + '</span>';
          if (selected.kana && selected.kana !== w2) h += '<span class="detail-hero__kana" lang="ja">' + esc(selected.kana) + '</span>';
          h += '<p class="detail-hero__fungsi">' + esc(selected.arti || '') + '</p>';
          if (selected.romaji) h += '<p class="detail-hero__romaji">' + esc(selected.romaji) + '</p>';
          if (selected.kana) {
            h += '<button type="button" class="audio-btn detail-hero__audio" data-speak="' + esc(selected.kana) + '" aria-label="Dengarkan ' + esc(selected.kana) + '"><svg class="audio-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button>';
          }
          h += '</div>';
        }
        return h;
      }

      function refresh() {
        if (selected) container.innerHTML = buildDetail();
        else container.innerHTML = buildList();
        if (!selected) {
          var inp = container.querySelector ? container.querySelector('#kategori-search') : null;
          if (inp) try { inp.focus(); } catch (e) {}
        } else {
          focusContainer(container);
        }
      }

      refresh();

      function onClick(ev) {
        var t = ev.target;
        if (selected) {
          var back = t.closest ? t.closest('#kategori-back-btn') : null;
          if (back) { selected = null; refresh(); return; }
          return;
        }
        var row = t.closest ? t.closest('[data-detail-idx]') : null;
        if (row && container.contains(row)) {
          var idx = parseInt(row.getAttribute('data-detail-idx'), 10);
          if (!isNaN(idx) && items[idx]) { selected = items[idx]; refresh(); }
          return;
        }
        var back2 = t.closest ? t.closest('#kategori-back-btn') : null;
        if (back2) {
          if (window.WakaruKamus && window.WakaruKamus.showGrid) window.WakaruKamus.showGrid();
        }
      }

      function onInput(ev) {
        var inp = ev.target;
        if (inp && inp.id === 'kategori-search' && !selected) {
          currentFilter = inp.value;
          var filtered = filterItems(items, currentFilter);
          var listEl = container.querySelector ? container.querySelector('#kategori-list') : null;
          var countEl = container.querySelector ? container.querySelector('#kategori-count') : null;
          var emptyEl = container.querySelector ? container.querySelector('.empty-state') : null;
          if (countEl) countEl.textContent = filtered.length ? filtered.length + ' entri' : 'Tidak ada hasil';
          if (listEl) {
            if (!filtered.length) listEl.innerHTML = '';
            else {
              var parts = [];
              for (var i = 0; i < filtered.length; i++) parts.push(buildDetailRow(filtered[i], i, items));
              listEl.innerHTML = parts.join('');
            }
          }
          if (emptyEl) emptyEl.hidden = filtered.length !== 0;
          if (listEl) listEl.hidden = filtered.length === 0;
        }
      }

      bindHandlers(container, onClick, onInput);
    }
  }

  /* ── 6. kanji — Grid/list toggle + search ─────────────────── */
  function renderKanjiView(container) {
    if (!container) return;
    cleanHandlers(container);
    var info = getKategoriInfo('kanji');
    var title = info.name || 'Kanji';
    var items = [];
    try { items = (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori('kanji') : []; } catch (e) { items = []; }
    if (items && typeof items.then === 'function') {
      container.innerHTML = '<div class="level-loading" role="status" aria-live="polite"><div class="spinner" aria-hidden="true"></div><p>Memuat…</p></div>';
      items.then(function (arr) { items = arr || []; doRenderKanji(); });
      return;
    }
    doRenderKanji();

    function doRenderKanji() {
      var viewMode = 'grid';
      var currentFilter = '';

      function filtered() { return filterItems(items, currentFilter); }

      function buildHtml() {
        var filt = filtered();
        var h = '';
        h += '<div class="page-header kategori-view__header">';
        h += '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke kategori">← Kembali</button>';
        h += '<span class="page-header__level">' + esc(title) + '</span>';
        h += '</div>';
        h += '<div class="kanji-controls">';
        h += '<div class="kanji-toggle" role="group" aria-label="Tampilan kanji">';
        h += '<button type="button" class="kanji-toggle__btn' + (viewMode === 'grid' ? ' is-active' : '') + '" data-kanji-mode="grid" aria-pressed="' + (viewMode === 'grid' ? 'true' : 'false') + '" aria-label="Tampilan grid">Grid</button>';
        h += '<button type="button" class="kanji-toggle__btn' + (viewMode === 'list' ? ' is-active' : '') + '" data-kanji-mode="list" aria-pressed="' + (viewMode === 'list' ? 'true' : 'false') + '" aria-label="Tampilan list">List</button>';
        h += '</div>';
        h += '<span class="kanji-controls__hint">' + esc(filt.length ? filt.length + ' entri' : 'Tidak ada hasil') + '</span>';
        h += '</div>';
        h += '<label class="search-wrap" aria-label="Cari kanji">';
        h += '<span class="search-wrap__icon" aria-hidden="true">⌕</span>';
        h += '<input id="kategori-search" class="search-input" type="search" placeholder="Cari kanji, bacaan, atau arti…" autocomplete="off" spellcheck="false" aria-label="Cari kanji" value="' + esc(currentFilter) + '">';
        h += '</label>';
        h += '<div class="level-count" id="kategori-count" aria-live="polite">' + esc(filt.length ? filt.length + ' kanji' : '') + '</div>';
        if (viewMode === 'grid') {
          h += '<div id="kategori-list" class="kanji-grid" role="list" aria-label="Grid kanji" aria-live="polite">';
          if (filt.length) {
            for (var i = 0; i < filt.length; i++) {
              var it = filt[i];
              h += '<button type="button" class="kanji-grid__cell" data-kanji-char="' + esc(it.kanji) + '" role="listitem" aria-label="Kanji ' + esc(it.kanji) + '">';
              h += '<span class="kanji-grid__char" lang="ja">' + esc(it.kanji) + '</span>';
              h += '</button>';
            }
          }
          h += '</div>';
        } else {
          h += '<div id="kategori-list" class="materi-list kategori-list" aria-live="polite">';
          if (filt.length) {
            for (var j = 0; j < filt.length; j++) h += buildRow(filt[j], 'kanji');
          }
          h += '</div>';
        }
        if (!filt.length) h += '<div class="empty-state"><p class="empty-state__title">Tidak ditemukan</p><p class="empty-state__msg">Coba kata kunci lain.</p></div>';
        return h;
      }

      container.innerHTML = buildHtml();
      focusContainer(container);

      function onClick(ev) {
        var t = ev.target;
        var modeBtn = t.closest ? t.closest('[data-kanji-mode]') : null;
        if (modeBtn && container.contains(modeBtn)) {
          var m = modeBtn.getAttribute('data-kanji-mode');
          if (m && m !== viewMode) { viewMode = m; container.innerHTML = buildHtml(); var inp = container.querySelector ? container.querySelector('#kategori-search') : null; if (inp) try { inp.focus(); } catch (e) {} }
          return;
        }
        var gridCell = t.closest ? t.closest('[data-kanji-char]') : null;
        if (gridCell && container.contains(gridCell)) {
          var ch = gridCell.getAttribute('data-kanji-char');
          if (ch && typeof window.openKanjiDetail === 'function') window.openKanjiDetail(ch);
          return;
        }
        // list kanji click
        var row = t.closest ? t.closest('.materi-item') : null;
        if (row && container.contains(row) && viewMode === 'list') {
          var val = row.getAttribute('data-kamus-item');
          if (val && typeof window.openKanjiDetail === 'function') window.openKanjiDetail(val);
          return;
        }
        var back = t.closest ? t.closest('#kategori-back-btn') : null;
        if (back) {
          if (window.WakaruKamus && window.WakaruKamus.showGrid) window.WakaruKamus.showGrid();
        }
      }

      function onInput(ev) {
        var inp = ev.target;
        if (inp && inp.id === 'kategori-search') {
          currentFilter = inp.value;
          var filt = filtered();
          var listEl = container.querySelector ? container.querySelector('#kategori-list') : null;
          var countEl = container.querySelector ? container.querySelector('#kategori-count') : null;
          var hintEl = container.querySelector ? container.querySelector('.kanji-controls__hint') : null;
          var emptyEl = container.querySelector ? container.querySelector('.empty-state') : null;
          if (countEl) countEl.textContent = filt.length ? filt.length + ' kanji' : '';
          if (hintEl) hintEl.textContent = filt.length ? filt.length + ' entri' : 'Tidak ada hasil';
          if (emptyEl) emptyEl.hidden = filt.length !== 0;
          if (listEl) {
            if (viewMode === 'grid') {
              if (!filt.length) listEl.innerHTML = '';
              else {
                var parts = [];
                for (var i = 0; i < filt.length; i++) parts.push('<button type="button" class="kanji-grid__cell" data-kanji-char="' + esc(filt[i].kanji) + '" role="listitem" aria-label="Kanji ' + esc(filt[i].kanji) + '"><span class="kanji-grid__char" lang="ja">' + esc(filt[i].kanji) + '</span></button>');
                listEl.innerHTML = parts.join('');
              }
            } else {
              if (!filt.length) listEl.innerHTML = '';
              else {
                var parts2 = [];
                for (var j = 0; j < filt.length; j++) parts2.push(buildRow(filt[j], 'kanji'));
                listEl.innerHTML = parts2.join('');
              }
            }
            listEl.hidden = filt.length === 0;
          }
        }
      }

      bindHandlers(container, onClick, onInput);
    }
  }

  /* ── Generic fallback (original) ───────────────────────────── */
  function renderGeneric(id, container) {
    cleanHandlers(container);
    if (!container) return;
    var info = getKategoriInfo(id);
    var title = info.name || id;
    var raw = (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori(id) : [];
    function doRender(items) {
      items = items || [];
      var html =
        '<div class="page-header kategori-view__header">' +
          '<button id="kategori-back-btn" class="back-btn" type="button" aria-label="Kembali ke kategori">← Kembali</button>' +
          '<span class="page-header__level">' + esc(title) + '</span>' +
        '</div>' +
        '<label class="search-wrap" aria-label="Cari di ' + esc(title) + '">' +
          '<span class="search-wrap__icon" aria-hidden="true">⌕</span>' +
          '<input id="kategori-search" class="search-input" type="search" placeholder="Cari kata, kana, atau arti…" autocomplete="off" spellcheck="false" aria-label="Cari di ' + esc(title) + '">' +
        '</label>' +
        '<div id="kategori-count" class="level-count" aria-live="polite"></div>' +
        '<div id="kategori-list" class="materi-list kategori-list" aria-live="polite"></div>' +
        '<div id="kategori-empty" class="empty-state" hidden>' +
          '<p class="empty-state__title">Tidak ditemukan</p><p class="empty-state__msg">Coba kata kunci lain.</p>' +
        '</div>';
      container.innerHTML = html;
      focusContainer(container);
      var searchEl = container.querySelector ? container.querySelector('#kategori-search') : null;
      var listEl = container.querySelector ? container.querySelector('#kategori-list') : null;
      var countEl = container.querySelector ? container.querySelector('#kategori-count') : null;
      var emptyEl = container.querySelector ? container.querySelector('#kategori-empty') : null;
      function onClick(ev) {
        var back = ev.target.closest ? ev.target.closest('#kategori-back-btn') : null;
        if (back) {
          if (window.WakaruKamus && window.WakaruKamus.showGrid) window.WakaruKamus.showGrid();
          return;
        }
        var row = ev.target.closest ? ev.target.closest('.materi-item') : null;
        if (row && container.contains(row)) {
          if (id === 'kanji' && typeof window.openKanjiDetail === 'function') {
            var val = row.getAttribute('data-kamus-item');
            if (val) window.openKanjiDetail(val);
          }
        }
      }
      function onInput() {
        if (searchEl) renderList(items, id, listEl, countEl, emptyEl, searchEl.value);
      }
      bindHandlers(container, onClick, onInput);
      renderList(items, id, listEl, countEl, emptyEl, '');
    }
    if (raw && typeof raw.then === 'function') {
      container.innerHTML = '<div class="level-loading" role="status" aria-live="polite"><div class="spinner" aria-hidden="true"></div><p>Memuat…</p></div>';
      raw.then(function (items) { doRender(items); });
    } else {
      doRender(raw);
    }
  }

  function renderKategoriView(id, container) {
    if (!container) return;
    if (id === 'hiragana' || id === 'katakana') return renderKanaView(id, container);
    if (id === 'kosakata') return renderKosakataView(container);
    if (id === 'grammar') return renderGrammarView(container);
    if (id === 'kata-kerja' || id === 'kata-sifat') return renderConjugationView(id, container);
    if (id === 'partikel' || id === 'kata-bantu') return renderDetailView(id, container);
    if (id === 'kanji') return renderKanjiView(container);
    return renderGeneric(id, container);
  }

  return {
    renderKategoriView: renderKategoriView
  };
})();

