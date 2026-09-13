# Changelog

## v1.3beta — 2026-09-13

### CI/CD
- Migrate actions: checkout v4→v5, setup-java v4→v5, upload-artifact v4→v5, action-gh-release v2→v3 (Node.js 20 deprecation)

## v1.2beta — 2026-09-13

### Data Pipeline (Fase 2)
- **N5 Kanji**: 79 kanji dengan arti bahasa Indonesia, readings (on/kun/nama), stroke count, grade, frekuensi
- **N5 Kosakata**: 668 kosakata dengan kanji, kana, arti Indonesia, romaji, kategori baris gojuon
- **Stroke Order**: 79 SVG path kanji dari KanjiVG (CC BY-SA 3.0) untuk visualisasi cara menulis

### Data Layer
- `WakaruData` API (13 methods): load/cache JSON, search kosakata, filter baris gojuon, progress tracking
- Progress persistence via localStorage (kanji/kosakata yang sudah dilihat, skor quiz terbaik)
- WebViewAssetLoader: fetch() API bisa akses file JSON lokal via `https://appassets.androidplatform.net`

### CI/CD
- Tambah `workflow_dispatch` trigger untuk manual build
- Fix: `AssetsPathHandler` inner class import (androidx.webkit)

## v1.1 — 2026-09-13

### Design
- **Warm Minimal**: level cards kini punya identitas warna sendiri — N5 sage, N4 amber, N3 blue (border kiri + icon box tinted)
- Spacing lebih compact (card gap 8px, padding 12px) — mengurangi ruang kosong
- Heading card lebih bold (700) dan sedikit lebih besar
- Shadow lebih dalam (2px/8px default, 6px/20px hover) — card terasa lebih "angkat"
- Dark mode: warna level diadaptasi (sage #8EB08E, amber #F59E0B, blue #60A5FA)

### Fix
- Eyebrow "WAKARU — 日本語" tidak lagi bocor ke detail view (scope `p:first-child`)
- Duplicate `.card:hover` rule di-merge

## v1.0 — 2026-09-13

### Design
- TypeUI Minimal design system (sage green #5B7B5A, surface #F4F4F1, Inter + Noto Sans JP + Inconsolata)
- App icon AI-generated: kanji 分 putih di sage green (adaptive icon + round icon)
- Light/dark theme dengan token system lengkap
- WCAG AA contrast, touch targets ≥44px, prefers-reduced-motion

### Fitur
- Home screen: pilih level (N5 あ, N4 漢, N3 文)
- Detail view per level (placeholder materi)
- Theme toggle (🌙/☀️) dengan persistensi localStorage

### Fix
- Crash on launch (theme mismatch AppCompat)
- Release automation idempotent (tag lama di-delete sebelum recreate)
- Security: purge APK/zip dari git history