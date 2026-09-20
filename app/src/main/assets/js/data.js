window.WakaruNav = { page: 'kamus', category: null };
window.escHtml = function (s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

/**
 * WakaruData — data layer for the Wakaru Japanese-learning app.
 *
 * Kategori-based API. All data loaded upfront via loadAll().
 */
var WakaruData = (function () {
  'use strict';

  var KATEGORI = [
    { id: 'hiragana',    name: 'Hiragana',    icon: 'あ', color: 'sage' },
    { id: 'katakana',    name: 'Katakana',    icon: 'ア', color: 'purple' },
    { id: 'kanji',       name: 'Kanji',       icon: '漢', color: 'vermilion' },
    { id: 'kosakata',    name: 'Kosakata',    icon: '単', color: 'cyan' },
    { id: 'grammar',     name: 'Grammar',     icon: '文', color: 'amber' },
    { id: 'partikel',    name: 'Partikel',    icon: 'は', color: 'red' },
    { id: 'kata-kerja',  name: 'Kata Kerja',  icon: '動', color: 'blue' },
    { id: 'kata-sifat',  name: 'Kata Sifat',  icon: '形', color: 'green' },
    { id: 'kata-bantu',  name: 'Kata Bantu',  icon: '助', color: 'violet' }
  ];

  var DATA = {};
  var LOADED = false;
  var _loading = null;

  // ── Helpers ───────────────────────────────────────────────────────

  function fetchJSON(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error('Failed to load ' + path + ' (' + res.status + ')');
      return res.json();
    });
  }

  var SKIP_SEARCH_KEYS = { url: 1 };

  function matchesQuery(item, q) {
    var keys = Object.keys(item);
    for (var i = 0; i < keys.length; i++) {
      if (SKIP_SEARCH_KEYS[keys[i]]) continue;
      var val = item[keys[i]];
      if (typeof val === 'string' && val.toLowerCase().indexOf(q) !== -1) return true;
      if (Array.isArray(val)) {
        for (var j = 0; j < val.length; j++) {
          if (typeof val[j] === 'string' && val[j].toLowerCase().indexOf(q) !== -1) return true;
        }
      }
    }
    if (item.forms && typeof item.forms === 'object') {
      for (var fk in item.forms) {
        if (item.forms.hasOwnProperty(fk) && typeof item.forms[fk] === 'string') {
          if (item.forms[fk].toLowerCase().indexOf(q) !== -1) return true;
        }
      }
    }
    return false;
  }

  // ── Kategori → DATA key mapping ──────────────────────────────────

  function kategoriKey(id) {
    switch (id) {
      case 'hiragana':   return 'hiragana';
      case 'katakana':   return 'katakana';
      case 'kanji':      return 'kanji';
      case 'kosakata':   return 'kosakata';
      case 'grammar':    return 'bunpou';
      case 'partikel':   return 'partikel';
      case 'kata-kerja': return 'conjugationVerb';
      case 'kata-sifat': return 'conjugationAdj';
      case 'kata-bantu': return 'kataBantu';
      default:           return null;
    }
  }

  function allArrays() {
    return [
      DATA.hiragana, DATA.katakana, DATA.kanji, DATA.kosakata,
      DATA.bunpou, DATA.partikel, DATA.kataBantu,
      DATA.conjugationVerb, DATA.conjugationAdj
    ];
  }

  // ── Public API ───────────────────────────────────────────────────

  function loadAll() {
    if (LOADED) return Promise.resolve(DATA);
    if (_loading) return _loading;

    var base = 'data/n5/';
    _loading = Promise.all([
      fetchJSON(base + 'hiragana.json'),
      fetchJSON(base + 'katakana.json'),
      fetchJSON(base + 'kanji.json'),
      fetchJSON(base + 'kosakata.json'),
      fetchJSON(base + 'bunpou.json'),
      fetchJSON(base + 'partikel.json'),
      fetchJSON(base + 'kata_bantu.json'),
      fetchJSON(base + 'conjugation_verb.json'),
      fetchJSON(base + 'conjugation_adj.json')
    ]).then(function (r) {
      DATA.hiragana = r[0];
      DATA.katakana = r[1];
      DATA.kanji = r[2];
      DATA.kosakata = r[3];
      DATA.bunpou = r[4];
      DATA.partikel = r[5];
      DATA.kataBantu = r[6];
      DATA.conjugationVerb = r[7];
      DATA.conjugationAdj = r[8];
      LOADED = true;
      _loading = null;
      return DATA;
    });
    return _loading;
  }

  function isLoaded() {
    return LOADED;
  }

  function getKategoriList() {
    return KATEGORI.map(function (k) {
      var key = kategoriKey(k.id);
      var count = (key && DATA[key]) ? DATA[key].length : 0;
      return { id: k.id, name: k.name, icon: k.icon, color: k.color, count: count };
    });
  }

  function getByKategori(id) {
    var key = kategoriKey(id);
    if (!key || !DATA[key]) return [];
    return DATA[key];
  }

  function getHiragana() {
    return DATA.hiragana || [];
  }

  function getKatakana() {
    return DATA.katakana || [];
  }

  function getKosakataByTopic(topic) {
    if (!DATA.kosakata) return [];
    return DATA.kosakata.filter(function (item) {
      return item.category === topic;
    });
  }

  function getKosakataTopics() {
    if (!DATA.kosakata) return [];
    var seen = {};
    var topics = [];
    DATA.kosakata.forEach(function (item) {
      if (item.category && !seen[item.category]) {
        seen[item.category] = true;
        topics.push(item.category);
      }
    });
    return topics;
  }

  function getGrammarByGroup(kelompok) {
    if (!DATA.bunpou) return [];
    return DATA.bunpou.filter(function (item) {
      return item.kelompok === kelompok;
    });
  }

  function getGrammarGroups() {
    if (!DATA.bunpou) return [];
    var seen = {};
    var groups = [];
    DATA.bunpou.forEach(function (item) {
      if (item.kelompok && !seen[item.kelompok]) {
        seen[item.kelompok] = true;
        groups.push(item.kelompok);
      }
    });
    return groups;
  }

  function getConjugation(type) {
    if (type === 'kata-kerja') return DATA.conjugationVerb || [];
    if (type === 'kata-sifat') return DATA.conjugationAdj || [];
    return [];
  }

  function getKanji(char) {
    if (!DATA.kanji) return undefined;
    for (var i = 0; i < DATA.kanji.length; i++) {
      if (DATA.kanji[i].kanji === char) return DATA.kanji[i];
    }
    return undefined;
  }

  // ── Lazy-loaded data (kanji-detail, strokes) ─────────────────────

  var _strokesData = null;
  var _strokesPromise = null;
  var _kanjiDetailData = null;
  var _kanjiDetailPromise = null;

  function getStrokes(char) {
    if (!_strokesData) return undefined;
    return _strokesData[char];
  }

  function getKanjiDetail(char) {
    if (!_kanjiDetailData) return null;
    return _kanjiDetailData[char] || null;
  }

  function loadStrokes() {
    if (_strokesData) return Promise.resolve(_strokesData);
    if (_strokesPromise) return _strokesPromise;
    _strokesPromise = fetchJSON('data/n5/strokes.json').then(function (data) {
      _strokesData = data;
      _strokesPromise = null;
      return data;
    }, function (err) {
      _strokesPromise = null;
      throw err;
    });
    return _strokesPromise;
  }

  function loadKanjiDetail() {
    if (_kanjiDetailData) return Promise.resolve(_kanjiDetailData);
    if (_kanjiDetailPromise) return _kanjiDetailPromise;
    _kanjiDetailPromise = fetchJSON('data/n5/kanji-detail.json').then(function (data) {
      _kanjiDetailData = data;
      _kanjiDetailPromise = null;
      return data;
    }, function (err) {
      _kanjiDetailPromise = null;
      throw err;
    });
    return _kanjiDetailPromise;
  }

  function search(query, kategoriId) {
    var q = (query || '').toLowerCase();
    var key = kategoriId ? kategoriKey(kategoriId) : null;

    if (!q) {
      if (key && DATA[key]) return DATA[key];
      return [];
    }

    var items;
    if (key) {
      items = DATA[key] || [];
    } else {
      items = [].concat.apply([], allArrays());
    }

    return items.filter(function (item) {
      return matchesQuery(item, q);
    });
  }

  // ── Public API ───────────────────────────────────────────────────

  return {
    loadAll: loadAll,
    isLoaded: isLoaded,
    getKategoriList: getKategoriList,
    getByKategori: getByKategori,
    getHiragana: getHiragana,
    getKatakana: getKatakana,
    getKosakataByTopic: getKosakataByTopic,
    getKosakataTopics: getKosakataTopics,
    getGrammarByGroup: getGrammarByGroup,
    getGrammarGroups: getGrammarGroups,
    getConjugation: getConjugation,
    getKanji: getKanji,
    getStrokes: getStrokes,
    getKanjiDetail: getKanjiDetail,
    loadStrokes: loadStrokes,
    loadKanjiDetail: loadKanjiDetail,
    search: search
  };
})();
window.WakaruData = WakaruData;
