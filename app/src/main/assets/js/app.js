var currentPage = 'kamus';
var _kanjiReturnFromSearch = false;

// honey: L3 — "Lihat semua" in search results drops the query because
// openKategori() (index.html) has no query param and clearSearchState()
// runs before it. Fix requires index.html change to pass the query + views.js
// to accept initial filter. Deferred — needs coordinated change across files.

var _quizState = {};
var _flashState = {};

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

var _settingsPrevView = null;
var _themeMode = 'light';

function updateThemePickerActive(mode) {
  var opts = document.querySelectorAll('.theme-picker__option');
  for (var i = 0; i < opts.length; i++) {
    var v = opts[i].getAttribute('data-theme-mode');
    if (v === mode) opts[i].classList.add('active');
    else opts[i].classList.remove('active');
  }
}

function applyTheme(mode) {
  if (mode !== 'light' && mode !== 'dark') mode = 'light';
  _themeMode = mode;
  document.documentElement.setAttribute('data-theme', mode);
  updateThemePickerActive(mode);
  try {
    localStorage.setItem('wakaru-theme-mode', mode);
    localStorage.setItem('wakaru-theme', mode);
  } catch (e) {}
}

function loadTheme() {
  var savedMode = null;
  try { savedMode = localStorage.getItem('wakaru-theme-mode'); } catch (e) {}
  if (savedMode !== 'light' && savedMode !== 'dark') {
    var legacy = null;
    try { legacy = localStorage.getItem('wakaru-theme'); } catch (e2) {}
    if (legacy === 'light' || legacy === 'dark') savedMode = legacy;
    else savedMode = 'light';
  }
  applyTheme(savedMode);
}

function openSettings() {
  var kamusView = document.getElementById('kamus-view');
  var appView = document.getElementById('app-view');
  var settingsView = document.getElementById('settings-view');
  if (!settingsView) return;
  // store previous view reference for back navigation
  if (appView && !appView.hidden) _settingsPrevView = 'app';
  else _settingsPrevView = 'kamus';
  // also remember logical page so we can restore currentPage
  try { settingsView.dataset.prevPage = currentPage; } catch (e2) {}
  if (kamusView) kamusView.hidden = true;
  if (appView) appView.hidden = true;
  settingsView.hidden = false;
  settingsView.removeAttribute('hidden');
  currentPage = 'settings';
  updateThemePickerActive(_themeMode);
  try { settingsView.focus(); } catch (e3) {}
}

function closeSettings() {
  var kamusView = document.getElementById('kamus-view');
  var appView = document.getElementById('app-view');
  var settingsView = document.getElementById('settings-view');
  if (!settingsView) return;
  settingsView.hidden = true;
  var prevPage = null;
  try { prevPage = settingsView.dataset.prevPage || null; } catch (e2) {}
  if (_settingsPrevView === 'app' && appView) {
    appView.hidden = false;
    if (kamusView) kamusView.hidden = true;
    currentPage = prevPage || currentPage;
    if (currentPage === 'settings') currentPage = 'kamus';
    // if appView is empty (edge case), fallback to kamus grid
    if (!appView.innerHTML || appView.innerHTML.trim() === '') {
      currentPage = 'kamus';
      if (kamusView) kamusView.hidden = false;
      appView.hidden = true;
    } else {
      try { appView.focus(); } catch (e3) {}
    }
  } else {
    if (kamusView) kamusView.hidden = false;
    if (appView) appView.hidden = true;
    currentPage = 'kamus';
  }
}

function init() {
  loadTheme();
  WakaruData.loadAll().catch(function (err) { console.error('WakaruData.loadAll failed:', err); });
  var settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
  var picker = document.querySelector('.theme-picker');
  if (picker) {
    picker.addEventListener('click', function (e) {
      var opt = e.target.closest('.theme-picker__option');
      if (!opt) return;
      var mode = opt.getAttribute('data-theme-mode');
      if (mode) applyTheme(mode);
    });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.audio-btn');
    if (btn) {
      var text = btn.getAttribute('data-speak');
      if (text) WakaruAudio.speak(text);
    }
    var relatedItem = e.target.closest('.related-item');
    if (relatedItem && relatedItem.getAttribute('data-type') === 'kosakata') {
      var stableId = relatedItem.getAttribute('data-id');
      if (stableId && window.WakaruKamus && window.WakaruKamus.openKategori) {
        var main = document.getElementById('app-view');
        var kamusView = document.getElementById('kamus-view');
        if (main) main.hidden = true;
        if (kamusView) kamusView.hidden = false;
        currentPage = 'kamus';
        window.WakaruKamus.openKategori('kosakata');
        return;
      }
    }
  });
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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showAllStrokes(svgEl);
    if (onDone) onDone();
    return;
  }
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

// ── Kanji detail ──────────────────────────────────────────────────

function openKanjiDetail(char) {
  _kanjiReturnFromSearch = false;
  var searchResults = document.getElementById('home-search-results');
  if (searchResults && !searchResults.hidden) _kanjiReturnFromSearch = true;
  var kanji = WakaruData.getKanji(char);
  if (!kanji) return;
  currentPage = 'kanji:' + char;
  var strokes = WakaruData.getStrokes(char);
  var detailData = WakaruData.getKanjiDetail(char);
  var main = document.getElementById('app-view');
  var kamusView = document.getElementById('kamus-view');
  if (kamusView) kamusView.hidden = true;
  if (main) main.hidden = false;
  if (!main) return;
  renderKanjiDetail(kanji, strokes, detailData);
}

function renderKanjiDetail(kanji, strokes, detail) {
  var main = document.getElementById('app-view');
  var examples = (detail && detail.examples) ? detail.examples : [];
  var meanings = kanji.meanings_id.join(', ');
  var strokeCount = strokes ? strokes.length : (kanji.stroke_count || '');

  var html =
    '<div class="page-header"><span class="page-header__level">Kanji</span></div>' +
    '<div class="kanji-hero">' +
      '<span class="kanji-hero__glyph" lang="ja">' + escHtml(kanji.kanji) + '</span>' +
      '<p class="kanji-hero__meanings">' + escHtml(meanings) + '</p>' +
      (strokeCount ? '<span class="kanji-hero__meta">' + escHtml(strokeCount) + ' goresan</span>' : '') +
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

  // Related vocab — use curated detail.related data
  var detailData = WakaruData.getKanjiDetail && WakaruData.getKanjiDetail(kanji.kanji);
  var related = (detailData && detailData.related) || [];
  if (related.length > 0) {
    html += '<div class="section-block"><h2 class="section-title">Kosakata Terkait</h2><div class="related-list">';
    related.forEach(function (r) {
      var stableId = vocabStableId(r);
      html += '<button type="button" class="related-item" data-type="kosakata" data-id="' + escHtml(stableId) + '">' +
        '<span class="related-kanji" lang="ja">' + escHtml(r.kanji || r.kana) + '</span>' +
        '<span class="related-body">' +
          '<span class="related-kana" lang="ja">' + escHtml(r.kana) + '</span>' +
          '<span class="related-arti">' + escHtml(r.arti) + '</span>' +
        '</span>' +
      '</button>';
    });
    html += '</div></div>';
  }

  main.innerHTML = html;
  // Stroke animation setup
  var svg = main.querySelector('.stroke-svg');
  if (svg) setupStrokeAnimation(svg);
}

// ── Quiz mode ─────────────────────────────────────────────────────

function openQuiz() {
  currentPage = 'quiz';
  _quizState = {};
  renderQuizSetup();
}

function renderQuizSetup() {
  var main = document.getElementById('app-view');
  var kamusView = document.getElementById('kamus-view');
  if (kamusView) kamusView.hidden = true;
  if (main) main.hidden = false;
  if (!main) return;
  main.innerHTML =
    '<div class="page-header"><span class="page-header__level">Kuis</span></div>' +
    '<div class="quiz-setup">' +
      '<h1 class="quiz-setup__title">Kuis N5</h1>' +
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
      '<button class="btn-start" id="btn-quiz-start" type="button">Mulai</button>' +
    '</div>';
  function getSelectedType() {
    var active = document.querySelector('#quiz-type-pills .quiz-pill.is-active');
    return active ? active.dataset.val : 'kanji';
  }
  function getSelectedCount() {
    var active = document.querySelector('#quiz-count-pills .quiz-pill.is-active');
    return active ? parseInt(active.dataset.val, 10) : 10;
  }
  ['quiz-type-pills', 'quiz-count-pills'].forEach(function (groupId) {
    var group = document.getElementById(groupId);
    if (!group) return;
    group.addEventListener('click', function (e) {
      var pill = e.target.closest('.quiz-pill');
      if (!pill) return;
      group.querySelectorAll('.quiz-pill').forEach(function (p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');
    });
  });
  document.getElementById('btn-quiz-start').addEventListener('click', function () {
    startQuiz(getSelectedType(), getSelectedCount());
  });
}

function generateKanjiQuiz(count) {
  var pool = WakaruData.getByKategori('kanji').slice();
  if (pool.length === 0) return [];
  shuffleArray(pool);
  var picked = pool.slice(0, Math.min(count, pool.length));
  var allMeanings = [];
  pool.forEach(function (k) { if (k.meanings_id && k.meanings_id[0]) allMeanings.push(k.meanings_id[0]); });
  return picked.map(function (k) {
    var correct = (k.meanings_id && k.meanings_id[0]) || '';
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

function generateKosakataQuiz(count) {
  var pool = WakaruData.getByKategori('kosakata').slice();
  if (pool.length === 0) return [];
  shuffleArray(pool);
  var picked = pool.slice(0, Math.min(count, pool.length));
  var allArti = [];
  pool.forEach(function (v) { if (v.arti) allArti.push(v.arti); });
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

function startQuiz(type, count) {
  var questions = type === 'kanji' ? generateKanjiQuiz(count) : generateKosakataQuiz(count);
  if (questions.length === 0) return;
  currentPage = 'quiz';
  _quizState = {
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
  var main = document.getElementById('app-view');
  var kamusView = document.getElementById('kamus-view');
  if (kamusView) kamusView.hidden = true;
  if (main) main.hidden = false;
  var pct = Math.round(((s.idx + 1) / s.count) * 100);
  var isKanji = s.type === 'kanji';
  var questionText = isKanji ? 'Apa arti kanji ini?' : 'Apa artinya?';
  var displayChar = isKanji ? '<span class="quiz-kanji" lang="ja">' + escHtml(q.kanji) + '</span>' :
    '<span class="quiz-kanji" lang="ja">' + escHtml(q.display) + '</span>' +
    '<span class="quiz-sub" lang="ja">' + escHtml(q.kana) + '</span>' +
    '<span class="quiz-sub quiz-sub--romaji">' + escHtml(q.romaji) + '</span>';
  var html =
    '<div class="quiz-header">' +
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
  document.getElementById('quiz-options').addEventListener('click', function (e) {
    var btn = e.target.closest('.quiz-option');
    if (!btn) return;
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
      var allBtns = btn.parentElement.querySelectorAll('.quiz-option');
      allBtns.forEach(function (b) {
        if (b.dataset.idx !== String(chosenIdx) && q.options[parseInt(b.dataset.idx, 10)] === q.correct) {
          b.classList.add('quiz-option--correct');
        }
      });
      s.wrongAnswers.push({ question: isKanji ? q.kanji : (q.display + ' (' + q.kana + ')'), chosen: chosen, correct: q.correct });
    }
    var allBtns2 = btn.parentElement.querySelectorAll('.quiz-option');
    allBtns2.forEach(function (b) { b.disabled = true; });
    var delay = isCorrect ? 600 : 900;
    s._advanceTimer = setTimeout(function () {
      if (currentPage !== 'quiz') return;
      s.idx++;
      renderQuizQuestion();
    }, delay);
  });
}

function renderQuizResult() {
  var s = _quizState;
  var pct = Math.round((s.score / s.count) * 100);
  var main = document.getElementById('app-view');
  var kamusView = document.getElementById('kamus-view');
  if (kamusView) kamusView.hidden = true;
  if (main) main.hidden = false;
  var html =
    '<div class="quiz-header">' +
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
  document.getElementById('btn-quiz-retry').addEventListener('click', function () {
    startQuiz(s.type, s.count);
  });
  document.getElementById('btn-quiz-done').addEventListener('click', function () { wakaruGoBack(); });
}

// ── Flashcard mode ────────────────────────────────────────────────

function openFlash() {
  currentPage = 'flash';
  var saved = loadFlashSession();
  if (saved && saved.mode) {
    var items = WakaruData.getByKategori(saved.mode);
    if (items && items.length > 0) {
      items = items.slice();
      _flashState = {
        mode: saved.mode,
        items: items,
        idx: Math.min(saved.idx || 0, items.length - 1),
        showBack: false,
        seenIds: {},
        autoPlay: true
      };
      try { _flashState.autoPlay = localStorage.getItem('wakaru-flash-autoplay') !== 'off'; } catch (e) {}
      renderFlashCard();
      return;
    }
  }
  _flashState = {};
  renderFlashSetup();
}

function renderFlashSetup() {
  var main = document.getElementById('app-view');
  var kamusView = document.getElementById('kamus-view');
  if (kamusView) kamusView.hidden = true;
  if (main) main.hidden = false;
  if (!main) return;
  var autoPlay = true;
  try { autoPlay = localStorage.getItem('wakaru-flash-autoplay') !== 'off'; } catch (e) {}
  var kategori = WakaruData.getKategoriList();
  var pillsHtml = kategori.map(function (k, i) {
    return '<button class="quiz-pill' + (i === 0 ? ' is-active' : '') + '" data-val="' + escHtml(k.id) + '" type="button">' + escHtml(k.name) + ' · ' + k.count + '</button>';
  }).join('');
  main.innerHTML =
    '<div class="page-header"><span class="page-header__level">Flashcard</span></div>' +
    '<div class="quiz-setup">' +
      '<h1 class="quiz-setup__title">Flashcard N5</h1>' +
      '<div class="quiz-setup__section">' +
        '<span class="quiz-setup__label">Kategori</span>' +
        '<div class="quiz-pill-group" id="flash-mode-pills">' + pillsHtml + '</div>' +
      '</div>' +
      '<label class="flash-shuffle-label"><input type="checkbox" id="flash-shuffle-toggle" checked> Acak urutan</label>' +
      '<label class="flash-shuffle-label"><input type="checkbox" id="flash-autoplay-toggle"' + (autoPlay ? ' checked' : '') + '> Putar audio otomatis</label>' +
      '<button class="btn-start" id="btn-flash-start" type="button">Mulai</button>' +
    '</div>';
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
    startFlash(modePill ? modePill.dataset.val : 'kanji', shuffle, autoPlayEnabled);
  });
}

function startFlash(mode, shuffle, autoPlay) {
  if (autoPlay === undefined) {
    try { autoPlay = localStorage.getItem('wakaru-flash-autoplay') !== 'off'; } catch (e) { autoPlay = true; }
  }
  var items = WakaruData.getByKategori(mode);
  if (!items || items.length === 0) return;
  items = items.slice();
  if (shuffle) shuffleArray(items);
  currentPage = 'flash';
  _flashState = { mode: mode, items: items, idx: 0, showBack: false, seenIds: {}, autoPlay: autoPlay };
  saveFlashSession(mode, 0);
  renderFlashCard();
}

function renderFlashCard() {
  var s = _flashState;
  if (s.idx >= s.items.length) { renderFlashComplete(); return; }
  var item = s.items[s.idx];
  var main = document.getElementById('app-view');
  var kamusView = document.getElementById('kamus-view');
  if (kamusView) kamusView.hidden = true;
  if (main) main.hidden = false;
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
    // Front: pick the best display char for the item schema
    var frontChar = item.kanji || item.kana || item.pola || item.partikel || item.verb || item.adj || item.char || '';
    frontHtml = '<span class="flash-glyph" lang="ja">' + escHtml(frontChar) + '</span>';
    var kanaText = item.kana || item.char || '';
    if (kanaText && kanaText !== frontChar) {
      frontHtml += '<span class="flash-kana" lang="ja">' + escHtml(kanaText) + '</span>';
    }
    // Back: show meaning/definition, plus extra detail per schema
    backHtml = '<span class="flash-arti">' + escHtml(item.arti || '') + '</span>';
    if (item.fungsi) {
      backHtml += '<span class="flash-kana">' + escHtml(item.fungsi) + '</span>';
    }
    if (item.contoh) {
      backHtml += '<span class="flash-kana" lang="ja">' + escHtml(item.contoh) + '</span>';
      if (item.terjemahan) backHtml += '<span class="flash-arti">' + escHtml(item.terjemahan) + '</span>';
    }
    // Speech text: pick best audio field
    speechText = item.kana || item.char || item.pola || item.partikel || item.verb || item.adj || '';
    if (speechText) {
      backHtml += '<button type="button" class="audio-btn flash-audio" data-speak="' + escHtml(speechText) + '" aria-label="Dengarkan">' + SPEAKER_ICON + '</button>';
    }
  }
  var html =
    '<div class="quiz-header">' +
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
  var main = document.getElementById('app-view');
  var kamusView = document.getElementById('kamus-view');
  if (kamusView) kamusView.hidden = true;
  if (main) main.hidden = false;
  var total = s.items.length;
  clearFlashSession();
  var html =
    '<div class="quiz-header">' +
      '<span class="quiz-progress-text">Selesai</span>' +
    '</div>' +
    '<div class="quiz-result">' +
      '<p class="quiz-result__score">' + total + ' kartu selesai</p>' +
      '<div class="quiz-result__actions">' +
        '<button class="btn-start" id="btn-flash-retry" type="button">Ulangi</button>' +
        '<button class="btn-stroke btn-stroke--secondary" id="btn-flash-done" type="button">Kembali</button>' +
      '</div>' +
    '</div>';
  main.innerHTML = html;
  document.getElementById('btn-flash-retry').addEventListener('click', function () {
    startFlash(s.mode, true, s.autoPlay);
  });
  document.getElementById('btn-flash-done').addEventListener('click', function () { wakaruGoBack(); });
}

// ── Flash session persistence ─────────────────────────────────────

function saveFlashSession(mode, idx) {
  try { localStorage.setItem('wakaru-flash-session', JSON.stringify({ mode: mode, idx: idx })); } catch (e) {}
}
function loadFlashSession() {
  try {
    var raw = localStorage.getItem('wakaru-flash-session');
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    if (parsed && typeof parsed.mode === 'string' && typeof parsed.idx === 'number') return parsed;
  } catch (e) {}
  return null;
}
function clearFlashSession() {
  try { localStorage.removeItem('wakaru-flash-session'); } catch (e) {}
}

// ── Navigation ────────────────────────────────────────────────────

function wakaruGoBack() {
  var settingsView = document.getElementById('settings-view');
  if (settingsView && !settingsView.hidden) {
    closeSettings();
    return 'true';
  }
  if (currentPage === 'kamus') return 'false';
  if (currentPage.indexOf('kanji:') === 0) {
    currentPage = 'kamus';
    var appView = document.getElementById('app-view');
    if (appView) appView.hidden = true;
    var kamusView = document.getElementById('kamus-view');
    if (kamusView) kamusView.hidden = false;
    if (_kanjiReturnFromSearch) {
      _kanjiReturnFromSearch = false;
    } else {
      if (window.WakaruKamus && window.WakaruKamus.openKategori) {
        window.WakaruKamus.openKategori('kanji');
      }
    }
    return 'true';
  }
  if (currentPage === 'quiz' || currentPage === 'flash') {
    if (currentPage === 'flash' && _flashState && _flashState.mode) {
      saveFlashSession(_flashState.mode, _flashState.idx);
    }
    currentPage = 'kamus';
    var appView = document.getElementById('app-view');
    if (appView) appView.hidden = true;
    var kamusView = document.getElementById('kamus-view');
    if (kamusView) kamusView.hidden = false;
    if (window.WakaruKamus && window.WakaruKamus.showGrid) {
      window.WakaruKamus.showGrid();
    }
    return 'true';
  }
  return 'false';
}

init();
