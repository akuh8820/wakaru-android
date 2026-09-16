# Wakaru v3.1 — Todo List

## Phase 1: Data Fix + Test ✅

### Task 1: Generate kanji-detail 38 kanji ✅
- [x] Identify 38 missing kanji from kanji.json
- [x] Create example sentences (N5 grammar) for each
- [x] Create related vocab for each (auto from kosakata + curated fallback for 送/思/急/場/市)
- [x] Append to kanji-detail.json
- [x] Verify: 117 keys total
- [x] Verify: each has examples (≥1) + related (≥1)
- [x] Fixes: H-1

### Task 2: Generate strokes 38 kanji ✅
- [x] Download KanjiVG SVGs for 38 missing kanji
- [x] Extract SVG path data (scripts/gen_strokes.py)
- [x] Append to strokes.json
- [x] Verify: 117 keys total
- [x] Verify: stroke count matches kanji.json (fixed 4 wrong counts: 週/飲/駅/院)
- [x] Fixes: H-1

### Task 3: Smoke test script ✅
- [x] Create scripts/smoke_test.py
- [x] Validate all 11 JSON files parse without error
- [x] Check expected keys & types per file
- [x] Check kanji-detail keys ⊆ kanji.json chars
- [x] Check strokes keys ⊆ kanji.json chars
- [x] Check no duplicate entries
- [x] Check kanji-detail examples have jp/kana/id
- [x] Check conjugation forms complete
- [x] Print pass/fail summary
- [x] Exit 0 on pass, 1 on fail
- [x] Result: 40 checks, all pass

### Checkpoint 1: Data Complete ✅
- [x] kanji-detail.json has 117 keys
- [x] strokes.json has 117 keys
- [x] smoke_test.py → ALL PASS

## Phase 2: Bug Fixes ✅

### Task 3.5: Fix dead related data (L-1) ✅
- [x] Read app.js renderKanjiDetail (line 274-280)
- [x] Replace substring scan with curated detail.related
- [x] Verify kanji detail pages show related vocab correctly
- [x] Fixes: L-1

### Task 3.6: Fix global search forms (L-2) ✅
- [x] Read data.js matchesQuery (line 33-45)
- [x] Add forms object handling (mirror views.js:collectFields logic)
- [x] Test: search masu-form verb → finds result
- [x] Fixes: L-2

### Task 3.7: Fix unhandled rejection (L-3) ✅
- [x] Read index.html inline loadAll() (line 156)
- [x] Add .catch() handler with console.error
- [x] Verify: no unhandled rejection on data load failure
- [x] Fixes: L-3

### Checkpoint 2: Bugs Fixed ✅
- [x] L-1: related field rendered properly
- [x] L-2: global search finds conjugation forms
- [x] L-3: no unhandled rejections

## Phase 3: Settings Page ✅

### Task 4: Settings HTML ✅
- [x] Add SVG gear icon di header (sebelah theme toggle)
- [x] Add #settings-view section (hidden)
- [x] Theme picker: 3-segment control (Terang | Gelap | Sistem)
- [x] About: app name, version, description
- [x] License: data sources list
- [x] Back button
- [x] Acceptance: gear icon opens settings, back returns

### Task 5: Settings CSS ✅
- [x] Settings view follows design tokens
- [x] Theme picker: segmented control, active highlighted
- [x] Sections separated by border-top
- [x] Back button styled like .back-btn
- [x] Dark mode: all settings adapt
- [x] Responsive: works on small screens

### Task 6: Settings JS ✅
- [x] Gear icon click → show settings, hide current view
- [x] Back button → return to previous view
- [x] Theme picker: click → update data-theme + localStorage
- [x] System mode: listen prefers-color-scheme changes
- [x] Header toggle syncs with settings picker
- [x] Init: load saved preference (light/dark/system)
- [x] wakaruGoBack() handles settings view

### Checkpoint 3: Settings Done ✅
- [x] Settings page opens from gear icon
- [x] Theme picker works (light/dark/system)
- [x] About & License display correctly
- [x] Back navigation works

## Phase 4: Release ✅

### Task 7: Version bump + CHANGELOG ✅
- [x] app/build.gradle: versionCode 7→8, versionName "3.0"→"3.1"
- [x] CHANGELOG.md: v3.1 section
- [x] README.md: update feature list

### Checkpoint 4: Release Ready ✅
- [x] Version 3.1
- [x] All smoke tests pass (40/40)
- [x] CHANGELOG updated