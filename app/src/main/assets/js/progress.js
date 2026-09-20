/**
 * WakaruProgress / WakaruStreak / WakaruDaily
 * localStorage API — v4 keys, no overlap with v3
 */
(function () {
  'use strict';

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }
  function yesterdayStr() {
    return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  }

  // ── Progress ─────────────────────────────────────────────────
  window.WakaruProgress = {
    _key: 'wakaru-progress-v4',
    save: function (category, data) {
      try {
        var all = this.getAll();
        all[category] = { completed: data.completed || 0, total: data.total || 0 };
        localStorage.setItem(this._key, JSON.stringify(all));
      } catch (e) {}
    },
    load: function (category) {
      try {
        var all = this.getAll();
        return all[category] || { completed: 0, total: 0 };
      } catch (e) { return { completed: 0, total: 0 }; }
    },
    getAll: function () {
      try {
        var raw = localStorage.getItem(this._key);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    },
    reset: function (category) {
      try {
        var all = this.getAll();
        delete all[category];
        localStorage.setItem(this._key, JSON.stringify(all));
      } catch (e) {}
    }
  };

  // ── Streak ───────────────────────────────────────────────────
  window.WakaruStreak = {
    _key: 'wakaru-streak-v4',
    get: function () {
      try {
        var raw = localStorage.getItem(this._key);
        return raw ? JSON.parse(raw) : { count: 0, lastDate: '' };
      } catch (e) { return { count: 0, lastDate: '' }; }
    },
    increment: function () {
      try {
        var s = this.get();
        var today = todayStr();
        if (s.lastDate === today) return s;
        if (s.lastDate === yesterdayStr()) {
          s.count++;
        } else {
          s.count = 1;
        }
        s.lastDate = today;
        localStorage.setItem(this._key, JSON.stringify(s));
        return s;
      } catch (e) { return { count: 0, lastDate: '' }; }
    },
    isToday: function () {
      try {
        var s = this.get();
        return s.lastDate === todayStr();
      } catch (e) { return false; }
    }
  };

  // ── Daily ────────────────────────────────────────────────────
  window.WakaruDaily = {
    _key: 'wakaru-daily-v4',
    get: function () {
      try {
        var raw = localStorage.getItem(this._key);
        if (!raw) return { target: 20, doneToday: 0, date: todayStr() };
        var d = JSON.parse(raw);
        if (d.date !== todayStr()) {
          return { target: d.target || 20, doneToday: 0, date: todayStr() };
        }
        return d;
      } catch (e) {
        return { target: 20, doneToday: 0, date: todayStr() };
      }
    },
    setTarget: function (n) {
      try {
        var d = this.get();
        d.target = n;
        localStorage.setItem(this._key, JSON.stringify(d));
      } catch (e) {}
    },
    addDone: function (n) {
      try {
        var d = this.get();
        var today = todayStr();
        if (d.date !== today) { d.doneToday = 0; d.date = today; }
        d.doneToday += n;
        localStorage.setItem(this._key, JSON.stringify(d));
        return d;
      } catch (e) {
        return { target: 20, doneToday: 0, date: todayStr() };
      }
    }
  };
})();
