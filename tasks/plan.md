# Wakaru v3.0 — N5 Full Dictionary Redesign

## Overview
Redesign kamus Wakaru jadi complete JLPT N5 dictionary — 9 kategori, ~800 kosakata, 103 kanji, 80 grammar, semua offline. Hapus semua N4-N1. Tanpa progress tracking.

## Scope
- Level: N5 only
- Offline: 100%
- Kosakata: ~800 (dari 668 + tambah)
- Kanji: 103 (dari 79 + tambah 24)
- Grammar: 80 pola
- Kategori: 9 (Hiragana, Katakana, Kanji, Kosakata, Grammar, Partikel, Kata Kerja, Kata Sifat, Kata Bantu)
- Conjugation: ~40 verb + ~25 adj
- Progress tracking: Dihapus

## Design System
- Palette: Sage green (#5B7B5A) + cream, dark mode existing
- Accent per kategori: Sage, Purple, Vermilion, Cyan, Amber, Red, Blue, Green, Violet
- Typography: Inter + Noto Sans JP + Inconsolata
- Character-first UI: karakter JP sebagai visual hero

## Data Pipeline (Phase 0)
- [ ] Generate Hiragana (~100) + Katakana (~100)
- [ ] Reorganize kosakata 668 → ~800 per 15 topik
- [ ] Expand kanji 79 → 103
- [ ] Compile grammar 80 pola
- [ ] Generate conjugation tables (verb + adj)

## Data Layer (Phase 1)
- [ ] Rewrite `js/data.js` — 9 kategori API, hapus progress API

## Cleanup (Phase 2)
- [ ] Hapus N4-N1 refs (31 references) + progress tracking

## UI Redesign (Phase 3)
- [ ] Kamus home — 9 kategori grid
- [ ] Kana grid view (gojuon table)
- [ ] Kosakata per Topik view
- [ ] Grammar view
- [ ] Conjugation tables view
- [ ] Partikel + Kata Bantu view
- [ ] Kanji list + detail

## Integration & Release (Phase 4)
- [ ] Global search
- [ ] Flashcard + quiz (tanpa progress)
- [ ] Dark mode + responsive + a11y
- [ ] Build + release v3.0

## Data Sources
- kanji-data (existing 79, MIT)
- OpenJLPT (662 N5 vocab, CC BY)
- passjapanese.com + jlptsensei.com (grammar)
- KanjiVG (stroke order, CC BY-SA 3.0)

## Releases
- v2.0 (2026-09-12): Kamus + Flashcard
- v3.0 (planned): Full N5 dictionary
