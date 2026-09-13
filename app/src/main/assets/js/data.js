/**
 * WakaruData — data layer for the Wakaru Japanese-learning app.
 *
 * API:
 *   WakaruData.load(levelId)            → Promise<{kanji, kosakata, strokes}>
 *   WakaruData.getLevel(levelId)        → cached data or null (sync)
 *   WakaruData.getKanji(levelId, char)  → kanji object | undefined
 *   WakaruData.getStrokes(levelId, char)→ strokes array | undefined
 *   WakaruData.searchKosakata(levelId, q)→ filtered kosakata
 *   WakaruData.filterByCategory(levelId, cat) → filtered kosakata
 *   WakaruData.getCategories(levelId)   → category strings in gojuon order
 *   WakaruData.getProgress(levelId)     → progress object
 *   WakaruData.markSeen(levelId, type, id)
 *   WakaruData.isSeen(levelId, type, id) → boolean
 *   WakaruData.getQuizBest(levelId, type) → number
 *   WakaruData.setQuizBest(levelId, type, score)
 *   WakaruData.getLevelProgress(levelId) → {kanjiPct, kosakataPct}
 *   WakaruData.loadKanjiDetail(levelId)  → Promise<dict>
 */
var WakaruData = (function () {
  'use strict';

  var GOJUON_ORDER = ['A行','K行','S行','T行','N行','H行','M行','Y行','R行','W行','Lainnya'];
  var CACHE = new Map();
  var DETAIL_CACHE = {};
  var PROGRESS_KEY = 'wakaru-progress';

  // ── localStorage helpers ──────────────────────────────────────────
  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* blocked */ }
  }
  function readProgress() {
    var raw = lsGet(PROGRESS_KEY);
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }
  function writeProgress(obj) {
    lsSet(PROGRESS_KEY, JSON.stringify(obj));
  }
  function defaultProgress() {
    return { kanjiSeen: [], kosakataSeen: [], quizBest: { kanji: 0, kosakata: 0 } };
  }

  // ── Data fetch & cache ───────────────────────────────────────────
  function fetchJSON(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error('Failed to load ' + path + ' (' + res.status + ')');
      return res.json();
    });
  }

  function load(levelId) {
    if (CACHE.has(levelId)) return Promise.resolve(CACHE.get(levelId));
    var base = 'data/' + levelId + '/';
    return Promise.all([
      fetchJSON(base + 'kanji.json'),
      fetchJSON(base + 'kosakata.json'),
      fetchJSON(base + 'strokes.json')
    ]).then(function (results) {
      var data = { kanji: results[0], kosakata: results[1], strokes: results[2] };
      CACHE.set(levelId, data);
      return data;
    });
  }

  function getLevel(levelId) {
    return CACHE.has(levelId) ? CACHE.get(levelId) : null;
  }

  // ── Kanji lookups ────────────────────────────────────────────────
  function getKanji(levelId, char) {
    var data = getLevel(levelId);
    if (!data) return undefined;
    for (var i = 0; i < data.kanji.length; i++) {
      if (data.kanji[i].kanji === char) return data.kanji[i];
    }
    return undefined;
  }

  function getStrokes(levelId, char) {
    var data = getLevel(levelId);
    if (!data) return undefined;
    return data.strokes[char];
  }

  // ── Kosakata queries ─────────────────────────────────────────────
  function searchKosakata(levelId, query) {
    var data = getLevel(levelId);
    if (!data) return [];
    var q = (query || '').toLowerCase();
    if (!q) return data.kosakata;
    return data.kosakata.filter(function (item) {
      return item.kanji.indexOf(q) !== -1 ||
             item.kana.indexOf(q) !== -1 ||
             item.arti.toLowerCase().indexOf(q) !== -1 ||
             item.romaji.toLowerCase().indexOf(q) !== -1;
    });
  }

  function filterByCategory(levelId, category) {
    var data = getLevel(levelId);
    if (!data) return [];
    return data.kosakata.filter(function (item) {
      return item.category === category;
    });
  }

  function getCategories(levelId) {
    var data = getLevel(levelId);
    if (!data) return [];
    var seen = {};
    var cats = [];
    data.kosakata.forEach(function (item) {
      if (!seen[item.category]) {
        seen[item.category] = true;
        cats.push(item.category);
      }
    });
    return GOJUON_ORDER.filter(function (c) { return seen[c]; });
  }

  // ── Progress persistence ─────────────────────────────────────────
  function getProgress(levelId) {
    var all = readProgress();
    return all[levelId] ? all[levelId] : defaultProgress();
  }

  function saveLevelProgress(levelId, progress) {
    var all = readProgress();
    all[levelId] = progress;
    writeProgress(all);
  }

  function markSeen(levelId, type, id) {
    var p = getProgress(levelId);
    var key = type === 'kanji' ? 'kanjiSeen' : 'kosakataSeen';
    if (p[key].indexOf(id) === -1) {
      p[key].push(id);
      saveLevelProgress(levelId, p);
    }
  }

  function isSeen(levelId, type, id) {
    var p = getProgress(levelId);
    var key = type === 'kanji' ? 'kanjiSeen' : 'kosakataSeen';
    return p[key].indexOf(id) !== -1;
  }

  function getQuizBest(levelId, type) {
    var p = getProgress(levelId);
    return (p.quizBest && p.quizBest[type]) || 0;
  }

  function setQuizBest(levelId, type, score) {
    var p = getProgress(levelId);
    if (!p.quizBest) p.quizBest = {};
    if (score > (p.quizBest[type] || 0)) {
      p.quizBest[type] = score;
      saveLevelProgress(levelId, p);
    }
  }

  function getLevelProgress(levelId) {
    var data = getLevel(levelId);
    if (!data) return { kanjiPct: 0, kosakataPct: 0 };
    var p = getProgress(levelId);
    var totalK = data.kanji.length || 1;
    var totalV = data.kosakata.length || 1;
    return {
      kanjiPct: Math.round(p.kanjiSeen.length / totalK * 100),
      kosakataPct: Math.round(p.kosakataSeen.length / totalV * 100)
    };
  }

  // ── Kanji detail ──────────────────────────────────────────────────
  function loadKanjiDetail(levelId) {
    if (DETAIL_CACHE[levelId]) return Promise.resolve(DETAIL_CACHE[levelId]);
    var path = 'data/' + levelId + '/kanji-detail.json';
    return fetchJSON(path).then(function (detail) {
      DETAIL_CACHE[levelId] = detail;
      return detail;
    });
  }

  // ── Public API ───────────────────────────────────────────────────
  return {
    load: load,
    getLevel: getLevel,
    getKanji: getKanji,
    getStrokes: getStrokes,
    searchKosakata: searchKosakata,
    filterByCategory: filterByCategory,
    getCategories: getCategories,
    getProgress: getProgress,
    markSeen: markSeen,
    isSeen: isSeen,
    getQuizBest: getQuizBest,
    setQuizBest: setQuizBest,
    getLevelProgress: getLevelProgress,
    loadKanjiDetail: loadKanjiDetail
  };
})();
