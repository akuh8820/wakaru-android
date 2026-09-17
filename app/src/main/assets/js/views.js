/**
 * WakaruViews — kategori-specific view renderer (Phase 3 lane 2)
 * ES5, no modules. Single entry: renderKategoriView(id, container)
 * 9 kategori-specific views.
 */
var WakaruViews = (function () {
  'use strict';


  function debounce(fn, ms) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

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

  function buildRow(it, categoryId, rowIdx) {
    var rowClass = 'materi-item kamus-row';
    var isKanji = categoryId === 'kanji' && !!it.kanji;
    if (isKanji) rowClass += ' kamus-row--clickable materi-kanji';
    var title = it.kanji || it.kana || it.verb || it.adj || it.partikel || it.pola || it.char || '';
    var dataAttr = ' data-kamus-item="' + escHtml(title) + '"';
    if (typeof rowIdx === 'number') dataAttr += ' data-row-idx="' + rowIdx + '"';
    var h = '<div class="' + rowClass + '"' + dataAttr + '>';
    if (isKanji) {
      var mean = escHtml((it.meanings_id || []).join(', '));
      var onR = (it.on_readings || []).slice(0, 2).join('\u30FB');
      var kunR = (it.kun_readings || []).slice(0, 2).join('\u30FB');
      var read = escHtml(onR + (kunR ? ' / ' + kunR : ''));
      h += '<span class="mi-kanji" lang="ja">' + escHtml(it.kanji) + '</span>';
      h += '<span class="mi-body"><span class="mi-mean">' + mean + '</span><span class="mi-read">' + read + '</span></span>';
    } else if (categoryId === 'partikel') {
      h += '<span class="mi-kanji" lang="ja">' + escHtml(it.partikel) + '</span>';
      h += '<span class="mi-body"><span class="mi-mean" lang="ja">' + escHtml(it.kana) + '</span>';
      h += '<span class="mi-read">' + escHtml(it.fungsi) + '</span>';
      h += '<span class="mi-meta">' + escHtml(it.contoh) + ' \u2014 ' + escHtml(it.arti_contoh) + '</span></span>';
    } else if (categoryId === 'grammar') {
      h += '<span class="mi-body"><span class="mi-vkanji" lang="ja">' + escHtml(it.pola) + '</span>';
      h += '<span class="mi-mean">' + escHtml(it.arti) + '</span>';
      h += '<span class="mi-read">' + escHtml(it.contoh) + ' \u2014 ' + escHtml(it.terjemahan) + '</span></span>';
    } else if (categoryId === 'kata-kerja' || categoryId === 'kata-sifat') {
      var word = escHtml(it.verb || it.adj || it.kanji || it.kana);
      var kana = escHtml(it.kana || '');
      var romaji = escHtml(it.romaji || '');
      h += '<span class="mi-body"><span class="mi-vhead"><span class="mi-vkanji" lang="ja">' + word + '</span>';
      if (it.kanji && it.kana && it.kanji !== it.kana) {
        h += '<span class="mi-vkana" lang="ja">' + kana + '</span>';
      }
      h += '</span><span class="mi-mean">' + escHtml(it.arti) + '</span>';
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
        h += '<span class="mi-kanji" lang="ja">' + escHtml(it.char) + '</span>';
        h += '<span class="mi-body"><span class="mi-mean">' + escHtml(romaji2) + '</span>';
        if (it.row) h += '<span class="mi-read">Baris ' + escHtml(it.row) + '</span>';
        h += '</span>';
      } else {
        var showKana = it.kanji && it.kana && it.kanji !== it.kana;
        h += '<span class="mi-body"><span class="mi-vhead"><span class="mi-vkanji" lang="ja">' + escHtml(w) + '</span>';
        if (showKana) h += '<span class="mi-vkana" lang="ja">' + escHtml(kana2) + '</span>';
        h += '</span><span class="mi-mean">' + escHtml(arti) + '</span>';
        if (!showKana && kana2) h += '<span class="mi-read" lang="ja">' + escHtml(kana2) + '</span>';
        if (romaji2) h += '<span class="mi-romaji">' + escHtml(romaji2) + '</span>';
        h += '</span>';
      }
    }
    h += '</div>';
    return h;
  }

  function renderListDetailView(container, opts) {
    cleanHandlers(container);
    var selected = null;
    var currentFilter = (typeof opts.initialQuery === 'string' && opts.initialQuery) ? opts.initialQuery : '';

    function listHtml() {
      var all = opts.getItems();
      var filtered = filterItems(all, currentFilter);
      var h = '';
      if (opts.headerHtml) h += opts.headerHtml();
      h += '<label class="search-wrap" aria-label="' + escHtml(opts.searchLabel || 'Cari') + '">';
      h += '<span class="search-wrap__icon" aria-hidden="true">\u2315</span>';
      h += '<input id="kategori-search" class="search-input" type="search" placeholder="' + escHtml(opts.placeholder || 'Cari\u2026') + '" autocomplete="off" spellcheck="false" aria-label="' + escHtml(opts.searchLabel || 'Cari') + '" value="' + escHtml(currentFilter) + '">';
      h += '</label>';
      h += '<div id="kategori-list" class="materi-list kategori-list" aria-live="polite"' + (filtered.length ? '' : ' hidden') + '>';
      for (var i = 0; i < filtered.length; i++) h += opts.rowHtml(filtered[i], all.indexOf(filtered[i]));
      h += '</div>';
      h += '<div class="empty-state"' + (filtered.length ? ' hidden' : '') + '><p class="empty-state__title">Tidak ditemukan</p><p class="empty-state__msg">Coba kata kunci lain.</p></div>';
      return h;
    }

    function updateList() {
      var all = opts.getItems();
      var filtered = filterItems(all, currentFilter);
      var listEl = container.querySelector ? container.querySelector('#kategori-list') : null;
      var emptyEl = container.querySelector ? container.querySelector('.empty-state') : null;
      if (listEl) {
        if (!filtered.length) listEl.innerHTML = '';
        else {
          var parts = [];
          for (var i = 0; i < filtered.length; i++) parts.push(opts.rowHtml(filtered[i], all.indexOf(filtered[i])));
          listEl.innerHTML = parts.join('');
        }
        listEl.hidden = filtered.length === 0;
      }
      if (emptyEl) emptyEl.hidden = filtered.length !== 0;
    }

    function refresh() {
      container.innerHTML = selected && opts.detailHtml ? opts.detailHtml(selected) : listHtml();
      if (selected) { focusContainer(container); }
      else {
        var inp = container.querySelector ? container.querySelector('#kategori-search') : null;
        if (inp) { try { inp.focus(); } catch (e) {} if (currentFilter) { try { var len = inp.value.length; inp.setSelectionRange(len, len); } catch (e2) {} } }
        else focusContainer(container);
      }
    }

    function back() {
      if (selected && opts.detailHtml) { selected = null; refresh(); return true; }
      if (opts.onBack) return opts.onBack();
      return false;
    }

    var ctrl = { refresh: refresh, back: back, setFilter: function (q) { currentFilter = q; } };
    WakaruNav.category = { id: opts.navId || '', back: back };
    refresh();

    function onClick(ev) {
      if (selected) return;
      if (!opts.onRowClick && !opts.detailHtml) return;
      var t = ev.target;
      if (opts.onHeaderClick && opts.onHeaderClick(ev, ctrl)) return;
      var row = t.closest ? t.closest('[data-row-idx]') : null;
      if (row && container.contains(row)) {
        var idx = parseInt(row.getAttribute('data-row-idx'), 10);
        if (!isNaN(idx)) {
          var all = opts.getItems();
          if (all[idx]) {
            if (opts.onRowClick) opts.onRowClick(all[idx], idx);
            else if (opts.detailHtml) { selected = all[idx]; refresh(); }
          }
        }
      }
    }

    var debouncedInput = debounce(function (inp) { currentFilter = inp.value; updateList(); }, 150);

    function onInput(ev) { var inp = ev.target; if (inp && inp.id === 'kategori-search' && !selected) debouncedInput(inp); }

    bindHandlers(container, onClick, onInput);
    return ctrl;
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

  /* 1. hiragana / katakana - Gojuon grid */
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

    doRenderKana();

    function doRenderKana() {
      var order = ['A', 'K', 'S', 'T', 'N', 'H', 'M', 'Y', 'R', 'W', 'Lainnya'];
      var labels = { A: 'A\u884C', K: 'K\u884C', S: 'S\u884C', T: 'T\u884C', N: 'N\u884C', H: 'H\u884C', M: 'M\u884C', Y: 'Y\u884C', R: 'R\u884C', W: 'W\u884C', Lainnya: 'Lainnya' };
      var byRow = {};
      for (var i = 0; i < order.length; i++) byRow[order[i]] = [];
      for (var j = 0; j < data.length; j++) {
        var r = data[j].row;
        if (byRow[r]) byRow[r].push(data[j]);
        else byRow['Lainnya'].push(data[j]);
      }
      var h = '';
      h += '<div class="gojuon" role="list" aria-label="' + escHtml(title) + ' gojuon">';
      for (var ri = 0; ri < order.length; ri++) {
        var rowKey = order[ri];
        var items = byRow[rowKey] || [];
        if (!items.length) continue;
        h += '<div class="gj-row" role="listitem">';
        h += '<span class="gj-row-label" aria-hidden="true">' + escHtml(labels[rowKey]) + '</span>';
        h += '<div class="gj-row-cells">';
        for (var ci = 0; ci < items.length; ci++) {
          var it = items[ci];
          h += '<button type="button" class="gj-cell" data-char="' + escHtml(it.char) + '" data-romaji="' + escHtml(it.romaji) + '" aria-label="' + escHtml(it.char) + ' \u2014 ' + escHtml(it.romaji) + '">';
          h += '<span class="gj-cell__char" lang="ja">' + escHtml(it.char) + '</span>';
          h += '<span class="gj-cell__roma">' + escHtml(it.romaji) + '</span>';
          h += '</button>';
        }
        h += '</div></div>';
      }
      h += '</div>';
      h += '<p class="gj-hint">Ketuk kana untuk melihat romaji dan mendengar pelafalan.</p>';
      container.innerHTML = h;
      focusContainer(container);
      WakaruNav.category = { id: id, back: function () { return false; } };

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
      }
      bindHandlers(container, onClick, null);
    }
  }

  /* 2. kosakata - Topic cards + topic list */
  function renderKosakataView(container, initialQuery) {
    if (!container) return;
    cleanHandlers(container);
    var info = getKategoriInfo('kosakata');
    var title = info.name || 'Kosakata';
    var topics = [];
    try {
      topics = (typeof WakaruData !== 'undefined' && WakaruData.getKosakataTopics) ? WakaruData.getKosakataTopics() : [];
    } catch (e) { topics = []; }
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
    var currentFilter = (typeof initialQuery === 'string' && initialQuery) ? initialQuery : '';

    function buildCards() {
      var h = '';
      h += '<div class="topic-grid" role="list" aria-label="Topik kosakata">';
      for (var i = 0; i < topics.length; i++) {
        var t = topics[i];
        var cnt = topicCounts[t] || 0;
        var ic = firstCharMap[t] || t.charAt(0);
        h += '<button type="button" class="topic-card" data-topic="' + escHtml(t) + '" role="listitem" aria-label="' + escHtml(t) + ' \u2014 ' + cnt + ' entri">';
        h += '<span class="topic-card__icon" lang="ja" aria-hidden="true">' + escHtml(ic) + '</span>';
        h += '<span class="topic-card__accent" aria-hidden="true"></span>';
        h += '<span class="topic-card__label">' + escHtml(t) + '</span>';
        h += '<span class="topic-card__count">' + cnt + ' entri</span>';
        h += '</button>';
      }
      h += '</div>';
      return h;
    }

    function refresh() {
      if (currentTopic === null) {
        cleanHandlers(container);
        container.innerHTML = buildCards();
        WakaruNav.category = { id: 'kosakata', back: function () { return false; } };
        bindHandlers(container, onCardClick, null);
        focusContainer(container);
      } else {
        renderListDetailView(container, {
          getItems: function () {
            try { return (typeof WakaruData !== 'undefined' && WakaruData.getKosakataByTopic) ? WakaruData.getKosakataByTopic(currentTopic) : []; } catch (e) { return []; }
          },
          rowHtml: function (item, idx) { return buildRow(item, 'kosakata', idx); },
          initialQuery: currentFilter,
          placeholder: 'Cari kata, kana, atau arti\u2026',
          searchLabel: 'Cari di ' + currentTopic,
          navId: 'kosakata',
          onBack: function () { currentTopic = null; currentFilter = ''; refresh(); return true; }
        });
      }
    }

    refresh();

    function onCardClick(ev) {
      var t = ev.target;
      var card = t.closest ? t.closest('[data-topic]') : null;
      if (card && container.contains(card)) {
        var tp = card.getAttribute('data-topic');
        if (tp) { currentTopic = tp; currentFilter = ''; refresh(); }
      }
    }
  }

  /* 3. grammar - Group tabs + list + detail */
  function renderGrammarView(container, initialQuery) {
    if (!container) return;
    cleanHandlers(container);
    var info = getKategoriInfo('grammar');
    var title = info.name || 'Grammar';
    var groups = [];
    try { groups = (typeof WakaruData !== 'undefined' && WakaruData.getGrammarGroups) ? WakaruData.getGrammarGroups() : []; } catch (e) { groups = []; }
    var activeGroup = groups.length ? groups[0] : null;

    function getGroupItems(g) {
      try { return (typeof WakaruData !== 'undefined' && WakaruData.getGrammarByGroup) ? WakaruData.getGrammarByGroup(g) : []; } catch (e) { return []; }
    }

    function headerHtml() {
      var h = '<div class="grammar-pills" role="tablist" aria-label="Kelompok grammar">';
      for (var i = 0; i < groups.length; i++) {
        var g = groups[i];
        var isActive = g === activeGroup;
        h += '<button type="button" role="tab" class="grammar-pill' + (isActive ? ' is-active' : '') + '" data-group="' + escHtml(g) + '" aria-selected="' + (isActive ? 'true' : 'false') + '" aria-label="Kelompok ' + escHtml(g) + '">' + escHtml(g) + '</button>';
      }
      h += '</div>';
      return h;
    }

    function rowHtml(it, idx) {
      return '<button type="button" class="materi-item kamus-row grammar-row" data-grammar-group="' + escHtml(activeGroup) + '" data-row-idx="' + idx + '" aria-label="' + escHtml(it.pola) + '">' +
        '<span class="mi-body"><span class="mi-vkanji" lang="ja">' + escHtml(it.pola) + '</span>' +
        '<span class="mi-mean">' + escHtml(it.arti) + '</span>' +
        '<span class="mi-read">' + escHtml(it.contoh) + ' \u2014 ' + escHtml(it.terjemahan) + '</span></span></button>';
    }

    function detailHtml(item) {
      var h = '<div class="grammar-detail">';
      h += '<h2 class="grammar-detail__pola" lang="ja">' + escHtml(item.pola) + '</h2>';
      h += '<p class="grammar-detail__arti">' + escHtml(item.arti) + '</p>';
      if (item.romaji) h += '<p class="grammar-detail__romaji">' + escHtml(item.romaji) + '</p>';
      h += '<div class="grammar-detail__contoh">';
      h += '<span lang="ja">' + escHtml(item.contoh) + '</span>';
      h += '<button type="button" class="audio-btn" data-speak="' + escHtml(item.contoh) + '" aria-label="Dengarkan contoh ' + escHtml(item.contoh) + '"><svg class="audio-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button>';
      h += '</div>';
      h += '<p class="grammar-detail__terjemahan">' + escHtml(item.terjemahan) + '</p>';
      h += '</div>';
      return h;
    }

    renderListDetailView(container, {
      getItems: function () { return activeGroup ? getGroupItems(activeGroup) : []; },
      headerHtml: headerHtml,
      rowHtml: rowHtml,
      detailHtml: detailHtml,
      navId: 'grammar',
      placeholder: 'Cari pola atau arti\u2026',
      searchLabel: 'Cari di ' + (activeGroup || title),
      initialQuery: initialQuery,
      onHeaderClick: function (ev, ctrl) {
        var t = ev.target;
        var pill = t.closest ? t.closest('[data-group]') : null;
        if (pill && container.contains(pill)) {
          var g = pill.getAttribute('data-group');
          if (g && g !== activeGroup) { activeGroup = g; ctrl.setFilter(''); ctrl.refresh(); return true; }
        }
        return false;
      }
    });
  }

  /* 4. kata-kerja / kata-sifat - Conjugation tables */
  function renderConjugationView(id, container, initialQuery) {
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
      var currentFilter = (typeof initialQuery === 'string' && initialQuery) ? initialQuery : '';
      var grouped = {};
      var groupOrder = [];
      for (var i = 0; i < items.length; i++) {
        var g = items[i].group || 'lainnya';
        if (!grouped[g]) { grouped[g] = []; groupOrder.push(g); }
        grouped[g].push(items[i]);
      }
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

      function buildTableContent() {
        var h = '';
        h += '<div class="conj-wrap" role="region" aria-label="Tabel konjugasi ' + escHtml(title) + '" tabindex="0">';
        h += '<table class="conj-table"><thead><tr>';
        h += '<th class="conj-th conj-th--corner">Kata</th>';
        for (var f = 0; f < formKeys.length; f++) {
          var fk = formKeys[f];
          var lab = formLabels[fk] || fk;
          h += '<th class="conj-th" scope="col">' + escHtml(lab) + '</th>';
        }
        h += '</tr></thead><tbody>';
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
          h += '<tr class="conj-group-row"><td colspan="' + (formKeys.length + 1) + '">' + escHtml(gname) + ' \u00B7 ' + visibleRows.length + '</td></tr>';
          for (var ri = 0; ri < visibleRows.length; ri++) {
            var it = visibleRows[ri];
            var word = it.verb || it.adj || it.kanji || it.kana || '';
            h += '<tr>';
            h += '<th class="conj-first" scope="row"><span class="conj-first__word" lang="ja">' + escHtml(word) + '</span>';
            if (it.kana && it.kana !== word) h += '<span class="conj-first__kana" lang="ja">' + escHtml(it.kana) + '</span>';
            h += '<span class="conj-first__arti">' + escHtml(it.arti || '') + '</span></th>';
            for (var fi = 0; fi < formKeys.length; fi++) {
              var fkey = formKeys[fi];
              var formVal = (it.forms && it.forms[fkey]) ? it.forms[fkey] : '\u2014';
              h += '<td class="conj-td"><button type="button" class="conj-cell" data-speak="' + escHtml(formVal) + '" aria-label="' + escHtml(word) + ' ' + escHtml(formLabels[fkey] || fkey) + ' \u2014 ' + escHtml(formVal) + '" lang="ja">' + escHtml(formVal) + '</button></td>';
            }
            h += '</tr>';
          }
        }
        h += '</tbody></table>';
        h += '</div>';
        h += '<p class="conj-hint">Geser tabel ke samping untuk melihat semua bentuk \u00B7 ketuk sel untuk mendengar.</p>';
        return h;
      }

      function buildHtml() {
        var h = '';
        h += '<label class="search-wrap" aria-label="Cari di ' + escHtml(title) + '">';
        h += '<span class="search-wrap__icon" aria-hidden="true">\u2315</span>';
        h += '<input id="kategori-search" class="search-input" type="search" placeholder="Cari verba atau arti\u2026" autocomplete="off" spellcheck="false" aria-label="Cari di ' + escHtml(title) + '" value="' + escHtml(currentFilter) + '">';
        h += '</label>';
        h += '<div id="conj-content">';
        h += buildTableContent();
        h += '</div>';
        return h;
      }

      container.innerHTML = buildHtml();
      focusContainer(container);
      WakaruNav.category = { id: id, back: function () { return false; } };

      function onClick(ev) {
        var t = ev.target;
        var cell = t.closest ? t.closest('.conj-cell') : null;
        if (cell && container.contains(cell)) {
          var txt = cell.getAttribute('data-speak');
          if (txt && txt !== '\u2014') speak(txt);
          return;
        }
      }

      function onInput(ev) {
        var inp = ev.target;
        if (inp && inp.id === 'kategori-search') {
          currentFilter = inp.value;
          var contentEl = container.querySelector ? container.querySelector('#conj-content') : null;
          if (contentEl) contentEl.innerHTML = buildTableContent();
        }
      }

      bindHandlers(container, onClick, onInput);
    }
  }

  /* 5. partikel / kata-bantu - List + detail */
  function renderDetailView(id, container, initialQuery) {
    if (!container) return;
    cleanHandlers(container);
    var info = getKategoriInfo(id);
    var title = info.name || id;

    function rowHtml(it, idx) {
      var h = '<button type="button" class="materi-item kamus-row" data-row-idx="' + idx + '" aria-label="' + escHtml(it.partikel || it.kanji || it.kana) + '">';
      if (id === 'partikel') {
        h += '<span class="mi-kanji" lang="ja">' + escHtml(it.partikel) + '</span>';
        h += '<span class="mi-body"><span class="mi-mean" lang="ja">' + escHtml(it.kana) + '</span>';
        h += '<span class="mi-read">' + escHtml(it.fungsi) + '</span></span>';
      } else {
        var w = it.kanji || it.kana || '';
        h += '<span class="mi-body"><span class="mi-vhead"><span class="mi-vkanji" lang="ja">' + escHtml(w) + '</span>';
        h += '<span class="mi-vkana" lang="ja">' + escHtml(it.kana || '') + '</span></span>';
        h += '<span class="mi-mean">' + escHtml(it.arti || '') + '</span>';
        if (it.romaji) h += '<span class="mi-romaji">' + escHtml(it.romaji) + '</span>';
        h += '</span>';
      }
      h += '</button>';
      return h;
    }

    function detailHtml(item) {
      var h = '';
      if (id === 'partikel') {
        h += '<div class="detail-hero">';
        h += '<span class="detail-hero__char" lang="ja">' + escHtml(item.partikel) + '</span>';
        h += '<span class="detail-hero__kana" lang="ja">' + escHtml(item.kana || '') + '</span>';
        h += '<p class="detail-hero__fungsi">' + escHtml(item.fungsi || '') + '</p>';
        h += '</div>';
        if (item.contoh) {
          h += '<div class="section-block"><h2 class="section-title">Contoh</h2>';
          h += '<div class="example-item"><div class="example-jp"><span lang="ja">' + escHtml(item.contoh) + '</span>';
          h += '<button type="button" class="audio-btn" data-speak="' + escHtml(item.contoh) + '" aria-label="Dengarkan contoh"><svg class="audio-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button></div>';
          if (item.arti_contoh) h += '<span class="example-id">' + escHtml(item.arti_contoh) + '</span>';
          h += '</div></div>';
        }
      } else {
        var w2 = item.kanji || item.kana || '';
        h += '<div class="detail-hero">';
        h += '<span class="detail-hero__char" lang="ja">' + escHtml(w2) + '</span>';
        if (item.kana && item.kana !== w2) h += '<span class="detail-hero__kana" lang="ja">' + escHtml(item.kana) + '</span>';
        h += '<p class="detail-hero__fungsi">' + escHtml(item.arti || '') + '</p>';
        if (item.romaji) h += '<p class="detail-hero__romaji">' + escHtml(item.romaji) + '</p>';
        if (item.kana) {
          h += '<button type="button" class="audio-btn detail-hero__audio" data-speak="' + escHtml(item.kana) + '" aria-label="Dengarkan ' + escHtml(item.kana) + '"><svg class="audio-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button>';
        }
        h += '</div>';
      }
      return h;
    }

    renderListDetailView(container, {
      getItems: function () {
        try { return (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori(id) : []; } catch (e) { return []; }
      },
      rowHtml: rowHtml,
      detailHtml: detailHtml,
      navId: id,
      placeholder: id === 'partikel' ? 'Cari partikel atau fungsi\u2026' : 'Cari kata atau arti\u2026',
      searchLabel: 'Cari di ' + title,
      initialQuery: initialQuery
    });
  }

  /* 6. kanji - Grid/list toggle + search */
  function renderKanjiView(container, initialQuery) {
    if (!container) return;
    cleanHandlers(container);
    var info = getKategoriInfo('kanji');
    var title = info.name || 'Kanji';
    var items = [];
    try { items = (typeof WakaruData !== 'undefined' && WakaruData.getByKategori) ? WakaruData.getByKategori('kanji') : []; } catch (e) { items = []; }
    doRenderKanji();

    function doRenderKanji() {
      var viewMode = 'grid';
      var currentFilter = (typeof initialQuery === 'string' && initialQuery) ? initialQuery : '';

      function filtered() { return filterItems(items, currentFilter); }

      function buildHtml() {
        var filt = filtered();
        var h = '';
        h += '<div class="kanji-controls">';
        h += '<div class="kanji-toggle" role="group" aria-label="Tampilan kanji">';
        h += '<button type="button" class="kanji-toggle__btn' + (viewMode === 'grid' ? ' is-active' : '') + '" data-kanji-mode="grid" aria-pressed="' + (viewMode === 'grid' ? 'true' : 'false') + '" aria-label="Tampilan grid">Grid</button>';
        h += '<button type="button" class="kanji-toggle__btn' + (viewMode === 'list' ? ' is-active' : '') + '" data-kanji-mode="list" aria-pressed="' + (viewMode === 'list' ? 'true' : 'false') + '" aria-label="Tampilan list">List</button>';
        h += '</div>';
        h += '<span class="kanji-controls__hint">' + escHtml(filt.length ? filt.length + ' entri' : 'Tidak ada hasil') + '</span>';
        h += '</div>';
        h += '<label class="search-wrap" aria-label="Cari kanji">';
        h += '<span class="search-wrap__icon" aria-hidden="true">\u2315</span>';
        h += '<input id="kategori-search" class="search-input" type="search" placeholder="Cari kanji, bacaan, atau arti\u2026" autocomplete="off" spellcheck="false" aria-label="Cari kanji" value="' + escHtml(currentFilter) + '">';
        h += '</label>';
        if (viewMode === 'grid') {
          h += '<div id="kategori-list" class="kanji-grid" role="list" aria-label="Grid kanji" aria-live="polite">';
          if (filt.length) {
            for (var i = 0; i < filt.length; i++) {
              var it = filt[i];
              h += '<button type="button" class="kanji-grid__cell" data-kanji-char="' + escHtml(it.kanji) + '" role="listitem" aria-label="Kanji ' + escHtml(it.kanji) + '">';
              h += '<span class="kanji-grid__char" lang="ja">' + escHtml(it.kanji) + '</span>';
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
        h += '<div class="empty-state" hidden><p class="empty-state__title">Tidak ditemukan</p><p class="empty-state__msg">Coba kata kunci lain.</p></div>';
        return h;
      }

      container.innerHTML = buildHtml();
      focusContainer(container);
      WakaruNav.category = { id: 'kanji', back: function () { return false; } };

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
        var row = t.closest ? t.closest('.materi-item') : null;
        if (row && container.contains(row) && viewMode === 'list') {
          var val = row.getAttribute('data-kamus-item');
          if (val && typeof window.openKanjiDetail === 'function') window.openKanjiDetail(val);
          return;
        }
      }

      var debouncedKanjiInput = debounce(function (inp) {
        currentFilter = inp.value;
        var filt = filtered();
        var listEl = container.querySelector ? container.querySelector('#kategori-list') : null;
        var hintEl = container.querySelector ? container.querySelector('.kanji-controls__hint') : null;
        var emptyEl = container.querySelector ? container.querySelector('.empty-state') : null;
        if (hintEl) hintEl.textContent = filt.length ? filt.length + ' entri' : 'Tidak ada hasil';
        if (emptyEl) emptyEl.hidden = filt.length !== 0;
        if (listEl) {
          if (viewMode === 'grid') {
            if (!filt.length) listEl.innerHTML = '';
            else {
              var parts = [];
              for (var i = 0; i < filt.length; i++) parts.push('<button type="button" class="kanji-grid__cell" data-kanji-char="' + escHtml(filt[i].kanji) + '" role="listitem" aria-label="Kanji ' + escHtml(filt[i].kanji) + '"><span class="kanji-grid__char" lang="ja">' + escHtml(filt[i].kanji) + '</span></button>');
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
      }, 150);

      function onInput(ev) {
        var inp = ev.target;
        if (inp && inp.id === 'kategori-search') debouncedKanjiInput(inp);
      }

      bindHandlers(container, onClick, onInput);
    }
  }

  function renderKategoriView(id, container, initialQuery) {
    if (!container) return;
    WakaruNav.category = null;
    if (id === 'hiragana' || id === 'katakana') return renderKanaView(id, container);
    if (id === 'kosakata') return renderKosakataView(container, initialQuery);
    if (id === 'grammar') return renderGrammarView(container, initialQuery);
    if (id === 'kata-kerja' || id === 'kata-sifat') return renderConjugationView(id, container, initialQuery);
    if (id === 'partikel' || id === 'kata-bantu') return renderDetailView(id, container, initialQuery);
    if (id === 'kanji') return renderKanjiView(container, initialQuery);
    if (typeof console !== 'undefined' && console.warn) console.warn('WakaruViews: no renderer for kategori "' + id + '"');
  }

  return {
    renderKategoriView: renderKategoriView,
    handleBack: function () { return WakaruNav.category && typeof WakaruNav.category.back === 'function' ? WakaruNav.category.back() : false; }
  };
})();
