# Wakaru v3.1 — Fix Issues + Settings Page

## Overview
Fix data gaps & bugs dari v3.0 review, tambah Settings page (theme, about, license).

## Issues Found (verify agent)

| ID | Severity | Issue | Lokasi |
|----|----------|-------|--------|
| H-1 | High | 38/117 kanji lack detail + stroke data (32.5% kanji pages degraded) | kanji-detail.json, strokes.json |
| L-1 | Low | kanji-detail[].related is dead data — renderer ignores curated data, recomputes via substring scan | app.js:274-280 |
| L-2 | Low | Global search misses conjugation forms values — data.js:matchesQuery only handles strings/arrays, not nested forms object | data.js:33-45 |
| L-3 | Low | Unhandled rejection on startup — inline loadAll() di index.html tanpa .catch | index.html:156 |

## Work Streams

### WS-A: Complete Kanji Data
- Task 1: Generate kanji-detail for 38 missing kanji → H-1
- Task 2: Generate strokes for 38 missing kanji → H-1

### WS-B: Smoke Test
- Task 3: Automated validation script

### WS-C: Bug Fixes
- Task 3.5: Fix dead related data (L-1)
- Task 3.6: Fix global search forms (L-2)
- Task 3.7: Fix unhandled rejection (L-3)

### WS-D: Settings Page
- Task 4: Settings HTML (gear icon + settings view)
- Task 5: Settings CSS (segmented control, sections)
- Task 6: Settings JS (navigation + theme logic: light/dark/system)

### WS-E: Release
- Task 7: Version bump 3.1 + CHANGELOG

## Dependency Graph

```
WS-A (data fix) ──────┐
                       ├──→ Checkpoint: Data Complete
WS-B (smoke test) ────┘
                       
WS-C (bug fixes) ─────→ Checkpoint: Bugs Fixed

WS-D (settings) ──────→ Checkpoint: Settings Done

WS-E (release) ────────→ Final Checkpoint
```

WS-A ∥ WS-B (paralel)
WS-C independent (can run paralel with WS-A/B)
WS-D independent (can run paralel with WS-A/B/C)
WS-E after all

## Checkpoints

### Checkpoint 1: Data + Test
- kanji-detail.json 117 keys
- strokes.json 117 keys
- smoke_test.py → ALL PASS

### Checkpoint 2: Bugs Fixed
- L-1: related field rendered properly
- L-2: global search finds conjugation forms
- L-3: no unhandled rejections

### Checkpoint 3: Settings Done
- Settings page: gear icon → theme picker + about + license
- Theme: light / dark / system works

### Checkpoint 4: Release Ready
- Version 3.1
- CHANGELOG updated
- All smoke tests pass

## Design Decisions
- Settings icon: SVG gear (konsisten dengan audio buttons)
- Theme picker: Segmented control (Light | Dark | System)
- Theme "system": follows prefers-color-scheme media query
- Related data (L-1): render curated detail.related instead of substring scan
