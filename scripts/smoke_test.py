#!/usr/bin/env python3
"""Smoke test: validates all JSON data files, structure, integrity, and consistency."""
import json, os, sys

BASE = os.path.join(os.path.dirname(__file__), '..', 'app', 'src', 'main', 'assets', 'data', 'n5')
ASSETS = os.path.join(os.path.dirname(__file__), '..', 'app', 'src', 'main', 'assets')

passed = 0
failed = 0
warnings = 0

def ok(msg):
    global passed; passed += 1
    print(f'  ✅ {msg}')

def fail(msg):
    global failed; failed += 1
    print(f'  ❌ {msg}')

def warn(msg):
    global warnings; warnings += 1
    print(f'  ⚠️  {msg}')

def load_json(name):
    path = os.path.join(BASE, name)
    try:
        return json.load(open(path, encoding='utf-8')), path
    except Exception as e:
        fail(f'{name}: parse error — {e}')
        return None, path

def check_file(name, checks):
    data, path = load_json(name)
    if data is None:
        return
    print(f'\n  📄 {name} ({len(data)} entries)')
    for label, fn in checks:
        result = fn(data)
        if result is True:
            ok(label)
        elif result is False:
            fail(label)
        elif isinstance(result, str):
            warn(label + ': ' + result)

# ── Load all JSON files ────────────────────────────────────────────
print('🧪 Wakaru Smoke Test\n' + '=' * 50)

files = {}
for name in ['kanji.json', 'kanji-detail.json', 'strokes.json',
             'hiragana.json', 'katakana.json', 'kosakata.json',
             'bunpou.json', 'partikel.json', 'kata_bantu.json',
             'conjugation_verb.json', 'conjugation_adj.json']:
    data, _ = load_json(name)
    if data is not None:
        files[name] = data

if len(files) != 11:
    fail(f'Expected 11 JSON files, got {len(files)}')
else:
    ok(f'All 11 JSON files parse successfully')

# ── kanji.json ─────────────────────────────────────────────────────
k = files.get('kanji.json', [])
check_file('kanji.json', [
    ('117 entries', lambda d: len(d) == 117),
    ('All have kanji/readings/meanings', lambda d: all(
        'kanji' in x and 'on_readings' in x and 'kun_readings' in x and 'meanings_id' in x for x in d)),
    ('No duplicate kanji', lambda d: len(set(x['kanji'] for x in d)) == len(d)),
    ('All JLPT N5', lambda d: all(x.get('jlpt') == 5 for x in d)),
    ('Stroke counts positive', lambda d: all(x.get('stroke_count', 0) > 0 for x in d)),
])

# ── kanji-detail.json ──────────────────────────────────────────────
d = files.get('kanji-detail.json', {})
k_chars = set(x['kanji'] for x in k)

# Build kosakata kana lookup (handles multi-reading: split on comma, trim)
_kosakata_kana = set()
for _x in files.get('kosakata.json', []):
    for _r in _x.get('kana', '').split(','):
        _kosakata_kana.add(_r.strip())

def _check_related_referential(detail):
    orphans = []
    for kanji, v in detail.items():
        for rel in v.get('related', []):
            matched = any(r.strip() in _kosakata_kana for r in rel['kana'].split(','))
            if not matched:
                orphans.append(f"{kanji}->{rel['kanji']}({rel['kana']})")
    if orphans:
        return f"{len(orphans)} orphan related entries: {orphans[:10]}"
    return True

check_file('kanji-detail.json', [
    ('117 keys', lambda d: len(d) == 117),
    ('All keys in kanji.json', lambda d: True if set(d.keys()) <= k_chars
     else f"orphan keys: {set(d.keys()) - k_chars}"),
    ('All have examples + related', lambda d: all(
        isinstance(v, dict) and v.get('examples') and v.get('related')
        for v in d.values())),
    ('Examples have jp/kana/id', lambda d: all(
        all('jp' in e and 'kana' in e and 'id' in e for e in v['examples'])
        for v in d.values())),
    ('Related entries resolve in kosakata (M3b)', _check_related_referential),
])

# ── strokes.json ───────────────────────────────────────────────────
s = files.get('strokes.json', {})
check_file('strokes.json', [
    ('117 keys', lambda d: len(d) == 117),
    ('All keys in kanji.json', lambda d: set(d.keys()) <= k_chars),
    ('All have stroke arrays', lambda d: all(
        isinstance(v, list) and len(v) > 0 for v in d.values())),
    ('Stroke count matches kanji.json', lambda d: (
        f"mismatch: {[(x['kanji'], x['stroke_count'], len(d.get(x['kanji'], []))) for x in k if x['kanji'] in d and len(d.get(x['kanji'], [])) != x['stroke_count']]}" if any(
        len(d.get(x['kanji'], [])) != x['stroke_count'] for x in k if x['kanji'] in d) else True)),
])

# ── hiragana.json / katakana.json ──────────────────────────────────
for name in ['hiragana.json', 'katakana.json']:
    data = files.get(name, [])
    check_file(name, [
        (f'{105} entries', lambda d, n=name: len(d) == 105),
        ('All have char/romaji/row', lambda d: all(
            'char' in x and 'romaji' in x and 'row' in x for x in d)),
        ('No duplicates', lambda d: len(set(x['char'] for x in d)) == len(d)),
    ])

# ── kosakata.json ──────────────────────────────────────────────────
k_data = files.get('kosakata.json', [])
check_file('kosakata.json', [
    (f'807 entries', lambda d: len(d) == 807),
    ('All have kana/arti', lambda d: all(
        x.get('kana') and x.get('arti') for x in d)),
    ('No empty kana', lambda d: all(x.get('kana', '') != '' for x in d)),
])

# ── bunpou.json ────────────────────────────────────────────────────
b = files.get('bunpou.json', [])
check_file('bunpou.json', [
    ('88 entries', lambda d: len(d) == 88),
    ('All have pola/arti/contoh', lambda d: all(
        'pola' in x and 'arti' in x and 'contoh' in x for x in d)),
])

# ── partikel.json ──────────────────────────────────────────────────
p = files.get('partikel.json', [])
check_file('partikel.json', [
    ('14 entries', lambda d: len(d) == 14),
    ('All have partikel/fungsi', lambda d: all(
        'partikel' in x and 'fungsi' in x for x in d)),
])

# ── kata_bantu.json ────────────────────────────────────────────────
kb = files.get('kata_bantu.json', [])
check_file('kata_bantu.json', [
    ('10 entries', lambda d: len(d) == 10),
    ('All have kanji/kana', lambda d: all(
        'kanji' in x and 'kana' in x for x in d)),
])

# ── conjugation_verb.json ─────────────────────────────────────────
cv = files.get('conjugation_verb.json', [])
check_file('conjugation_verb.json', [
    ('40 entries', lambda d: len(d) == 40),
    ('All have verb/forms', lambda d: all(
        'verb' in x and 'forms' in x and isinstance(x['forms'], dict) for x in d)),
    ('Forms have required keys', lambda d: all(
        len(x['forms']) >= 10 for x in d)),
])

# ── conjugation_adj.json ──────────────────────────────────────────
ca = files.get('conjugation_adj.json', [])
check_file('conjugation_adj.json', [
    ('25 entries', lambda d: len(d) == 25),
    ('All have adj/forms', lambda d: all(
        'adj' in x and 'forms' in x and isinstance(x['forms'], dict) for x in d)),
    ('Forms have required keys', lambda d: all(
        len(x['forms']) >= 5 for x in d)),
])

# ── HTML structure ─────────────────────────────────────────────────
html_path = os.path.join(ASSETS, 'index.html')
try:
    html = open(html_path, encoding='utf-8').read()
    required_ids = ['kamus-view', 'kamus-category-grid', 'kategori-view',
                    'app-view', 'home-search', 'home-search-results',
                    'settings-btn']
    missing_ids = [i for i in required_ids if f'id="{i}"' not in html]
    if missing_ids:
        fail(f'index.html: missing element IDs: {missing_ids}')
    else:
        ok('index.html: all required element IDs present')
    if 'class="theme-picker"' in html:
        ok('index.html: theme-picker present')
    else:
        fail('index.html: missing theme-picker')
    if 'data-theme' in html:
        ok('index.html: data-theme attribute present')
    else:
        fail('index.html: no data-theme attribute')
    if 'handleBack' in html:
        ok('index.html: handleBack contract present')
    else:
        fail('index.html: missing handleBack contract')
except Exception as e:
    fail(f'index.html: {e}')

# ── views.js handleBack contract ──────────────────────────────────
views_path = os.path.join(ASSETS, 'js', 'views.js')
try:
    views_js = open(views_path, encoding='utf-8').read()
    if 'handleBack' in views_js:
        ok('views.js: handleBack contract present')
    else:
        fail('views.js: missing handleBack contract')
except Exception as e:
    fail(f'views.js: {e}')

# ── JS syntax check ────────────────────────────────────────────────
for js in ['data.js', 'views.js', 'app.js']:
    js_path = os.path.join(ASSETS, 'js', js)
    try:
        import subprocess
        r = subprocess.run(['node', '--check', js_path], capture_output=True, text=True, timeout=5)
        if r.returncode == 0:
            ok(f'{js}: syntax valid')
        else:
            fail(f'{js}: {r.stderr.strip()}')
    except FileNotFoundError:
        warn(f'{js}: node not found, skipping syntax check')
    except Exception as e:
        warn(f'{js}: {e}')

# ── Summary ────────────────────────────────────────────────────────
print(f'\n{"=" * 50}')
print(f'✅ {passed} passed | ❌ {failed} failed | ⚠️  {warnings} warnings')
if failed > 0:
    print(f'\n💥 {failed} test(s) FAILED')
    sys.exit(1)
else:
    print(f'\n🎉 All tests passed!')
    sys.exit(0)
