#!/usr/bin/env python3
"""Generate strokes.json entries for kanji missing stroke data, from KanjiVG SVGs.

KanjiVG: https://github.com/KanjiVG/kanjivg (CC BY-SA 3.0)
Each SVG has <g class="kvg:StrokePaths"> with <g class="kvg:Stroke"> children,
each containing a <path d="...">. We extract the d attribute per stroke.
"""
import json, os, re, sys, urllib.request

BASE = os.path.join(os.path.dirname(__file__), '..', 'app', 'src', 'main', 'assets', 'data', 'n5')
KANJIVG_URL = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/{:05x}.svg'

def fetch_svg(ch):
    url = KANJIVG_URL.format(ord(ch))
    req = urllib.request.Request(url, headers={'User-Agent': 'wakaru-gen-strokes'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode('utf-8')

def extract_strokes(svg):
    """Return list of stroke path strings from KanjiVG SVG."""
    strokes = []
    # KanjiVG: each stroke is a <path> with kvg:type attr, id like kvg:XXXXX-sN
    for m in re.finditer(r'<path[^>]*\bid="kvg:[^"]*-s\d+"[^>]*\bd="([^"]+)"', svg):
        strokes.append([m.group(1)])
    return strokes

def main():
    kanji_list = json.load(open(os.path.join(BASE, 'kanji.json')))
    strokes = json.load(open(os.path.join(BASE, 'strokes.json')))

    missing = [k['kanji'] for k in kanji_list if k['kanji'] not in strokes]
    if not missing:
        print('OK: no missing strokes')
        return

    print(f'Fetching {len(missing)} kanji from KanjiVG...')
    added = 0
    for ch in missing:
        try:
            svg = fetch_svg(ch)
            paths = extract_strokes(svg)
            if not paths:
                print(f'  WARN: no strokes extracted for {ch}')
                continue
            strokes[ch] = paths
            added += 1
            print(f'  {ch}: {len(paths)} strokes')
        except Exception as e:
            print(f'  ERROR {ch}: {e}')

    dest = os.path.join(BASE, 'strokes.json')
    with open(dest, 'w', encoding='utf-8') as f:
        json.dump(strokes, f, ensure_ascii=False, separators=(',', ':'))
    print(f'OK: {len(strokes)} kanji → {dest} ({os.path.getsize(dest)} bytes), added {added}')

if __name__ == '__main__':
    main()