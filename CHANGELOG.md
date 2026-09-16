# Changelog

## v3.1 — 2026-09-15

### Fitur
- Halaman Pengaturan (gear icon di header): pilih tema Terang/Gelap/Sistem (segmented control), Tentang (nama, versi, deskripsi), Lisensi data (kanji-data MIT, KanjiVG CC BY-SA 3.0, OpenJLPT CC BY, jepang.org/jlptsensei.com)
- Mode tema "Sistem": mengikuti preferensi OS, update otomatis saat OS berubah

### Data
- Kanji detail lengkap: 79 → 117 kanji (38 kanji baru dengan contoh kalimat N5 + kosakata terkait)
- Stroke order lengkap: 79 → 117 kanji (38 SVG path baru dari KanjiVG)
- Fix stroke count 4 kanji yang salah di kanji.json (週 15→11, 飲 13→12, 駅 11→14, 院 9→10)

### Fix
- Kosakata terkait di detail kanji kini pakai data kurasi (kanji-detail.related) — sebelumnya scan substring yang mengabaikan data kurasi
- Pencarian global kini menemukan bentuk konjugasi (forms object) — konsisten dengan filter kategori
- Unhandled rejection saat load data gagal di startup — tambah .catch handler

### Tooling
- Smoke test otomatis `scripts/smoke_test.py`: validasi 11 JSON (parse, struktur, integritas kanji-detail/strokes ⊆ kanji.json, stroke count match, no duplicates), HTML required elements, JS syntax — 40 checks

## v3.0 — 2026-09-15

### Fitur
- Kamus N5 lengkap 9 kategori: Hiragana, Katakana, Kanji, Kosakata, Bunpou, Partikel, Kata Kerja, Kata Sifat, Kata Bantu
- UI baru: grid 9 kategori di beranda, view per kategori — gojuon dengan toggle hiragana/katakana, kosakata per 15 topik, bunpou list→detail dengan contoh + audio, tabel konjugasi sticky (verb 40×12, adj 25×7), kanji grid/list + pencarian
- Pencarian global dari beranda: cari semua kata/kana/kanji, hasil dikelompokkan per kategori, debounce 300ms
- Flashcard penuh 9 mode sesuai kategori (sebelumnya exposure-only 4 mode): audio, acak, lanjut session
- Kuis 9 kategori: distractor dari data nyata, skor + review jawaban salah
- Dark mode, aksesibilitas (ARIA, keyboard, kontras), tombol sentuh ≥44px, responsive 3→2→1 kolom

### Data
- Kosakata 668→797 (15 topik, tanpa duplikat, POS benar)
- Kanji 103→117
- Hiragana & Katakana baru: 105 + 105 dengan audio
- Konjugasi baru: verb 40 kata × 12 bentuk, adj 25 × 7 bentuk

### Fix
- Flashcard blank untuk 7 kategori (render schema-aware: kanji/kana/pola/partikel/verb/adj/char)
- Audio fallback untuk bunpou, hiragana, katakana
- Detail kartu grammar (contoh + terjemahan) dan partikel (fungsi)

## v2.0 — 2026-09-14

### Fitur (Fase 3)
- **Tab Kamus**: 7 kategori (Kata Benda, Kata Sifat, Kata Bantu, Kata Kerja, Partikel, Bunpou, Kanji) untuk N5, search real-time (kanji/kana/arti), count entri, level N4/N3 "segera hadir"
- **Flashcard exposure-only**: 4 mode (Benda/Sifat/Kerja/Kanji), flip kartu = tandai "dilihat" (hapus tombol hafal), "Flashcard Hari Ini" quick start, "Lanjut" resume session, auto-play audio toggle, acak
- **Quiz practice**: "Quiz Cepat" (kanji, 10 soal), progress bar benar, konfirmasi keluar, skor X/100 + review jawaban salah
- **Progress**: "sudah dilihat" saja — kosakata 668 + kanji 103, tersimpan per level
- **Data**: `kosakata.json` 668/668 ber-POS (noun 390, verb 161, i-adj 59, na-adj 14, lainnya 44) via `scripts/enrich_pos.py`; `kata_bantu.json` 10, `partikel.json` 14, `bunpou.json` 88
- **A11y**: level cards `role=button` + keyboard (Enter/Space) + aria-label

### Fix & Polish
- Fix flashcard quick-start kosong saat cache data belum hangat (warm `kamusLoad('n5')` di init)
- Fix progress quiz: `(idx+1)/count`
- Level action buttons wrap rapi di layar sempit (flex-wrap)

## v1.4beta — 2026-09-13

### Fitur (P2.4–P2.7)
- **Kanji detail view**: kanji besar + arti, stroke order animasi (SVG KanjiVG, putar per goresan + nomor urut), readings on/kun/nama dengan tombol audio, contoh kalimat + terjemahan, kosakata terkait
- **Quiz mode**: pilih jenis (Kanji/Kosakata) + jumlah soal (10/30), 4 opsi, feedback langsung, skor X/100, review jawaban salah, skor terbaik tersimpan
- **Flashcard mode**: 3 mode sembunyikan (arti/kana/kanji), tap untuk balik, acak, navigasi prev/next, tandai sudah hafal
- **Audio**: Android TTS via JS bridge (speakJapanese) — tombol 🔊 di readings, contoh kalimat, flashcard; fallback senyap di browser
- **Data**: `kanji-detail.json` — 79 kanji × contoh kalimat N5 kurasi + 229 kosakata terkait (script `scripts/gen_kanji_detail.py`)

### Fix & Polish
- Fix crash kanji detail: strokes.json array-of-arrays → `segs.join(' ')`
- Fix aria-label precedence bug di list kosakata (layout rusak)
- Audio button: span → `<button>` 44×44, ikon SVG speaker (bukan emoji), focus-visible
- Reading pill: hapus nested button-in-button
- Flashcard: keyboard accessible (role=button, Enter/Space), audio tidak membalik kartu
- Touch target ≥44px: tab, quiz-pill, btn-stroke, reading-pill
- Stroke animasi: guard re-entry, prefers-reduced-motion → langsung tampil semua
- Quiz: opsi non-pilihan disabled, tap untuk lanjut cepat, aria-live
- TTS: `shutdown()` di onDestroy, `volatile ready`, hapus KITKAT branch mati, hardening WebView
- Dark mode: hover level-action, shadow kartu baru, progress track 6px seragam

## v1.3beta — 2026-09-13

### Fitur (P2.3)
- **Level detail view**: list materi kanji + kosakata N5 dengan data nyata (79 kanji, 668 kosakata)
- **Filter tabs**: Semua / Kanji / Kosakata dengan count badge
- **Search real-time**: cari kanji (karakter/arti) atau kosakata (kanji/kana/arti/romaji)
- **Progress tracking**: bar progres kanji + kosakata, item yang sudah dilihat ditandai ✓
- Loading skeleton, empty state, error state + retry

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