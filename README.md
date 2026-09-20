# Wakaru — 分かる

App belajar bahasa Jepang untuk Android. Offline 100%, tanpa framework.

## Fitur

- **11 halaman**: Beranda, Level, Kuis, Flashcard, Pengaturan, Kana, Kanji Detail, Kosakata, Bunpou, Konjugasi, Partikel
- **9 kategori N5**: Hiragana, Katakana, Kanji, Kosakata, Bunpou, Partikel, Kata Kerja, Kata Sifat, Kata Bantu
- **Progress tracking**: progres per kategori tersimpan di localStorage, resume kapan saja
- **Streak harian**: lacak hari berturut-turut belajar
- **Target kosakata harian**: atur target belajar per hari
- **Quiz**: soal pilihan 4 dari data nyata, feedback benar/salah, review jawaban salah
- **Flashcard**: flip card, shuffle, filter "Masih Belajar"/"Sudah Hafal"
- **Audio TTS**: pengucapan bahasa Jepang via WebView Android bridge
- **Dark mode**: toggle di Pengaturan, tersimpan di localStorage
- **Offline** — semua konten lokal, tidak perlu internet

## Download

Download APK terbaru dari [GitHub Releases](https://github.com/akuh8820/wakaru-android/releases)

## Tech Stack

- Java (MainActivity, Android bridge)
- HTML5, CSS3, Vanilla JS (SPA-lite, WebView-based)
- CSS tokens: 107 variabel desain (warna, tipografi, spacing, radius)
- Dark mode via `data-theme` attribute + CSS variable overrides
- targetSdk 35, minSdk 24, Java 17
- GitHub Actions (build APK + release)

## Build

```bash
# Clone
git clone https://github.com/akuh8820/wakaru-android.git
cd wakaru-android

# Build via GitHub Actions (recommended)
# Push ke main branch → APK otomatis ter-build

# Build lokal (butuh Android SDK)
gradle assembleRelease
```

## Struktur Project

```
app/src/main/
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Design tokens (107 variabel, light + dark)
│   │   ├── style.css           # Base + komponen global
│   │   ├── nav.css             # Bottom navigation
│   │   ├── header.css          # Header + TTS status
│   │   ├── beranda.css         # Halaman beranda
│   │   ├── level.css           # Grid kategori + progress
│   │   ├── quiz.css            # Kuis interaktif
│   │   ├── flashcard.css       # Flashcard + flip animation
│   │   ├── settings.css        # Pengaturan + theme toggle
│   │   ├── kana.css            # Hiragana/Katakana table
│   │   ├── kanji-detail.css    # Detail kanji + stroke order
│   │   ├── kosakata.css        # Daftar kosakata
│   │   ├── bunpou.css          # Tata bahasa
│   │   ├── konjugasi.css       # Tabel konjugasi
│   │   └── partikel.css        # Partikel bahasa Jepang
│   ├── js/
│   │   ├── data.js             # Data loader + utilitas global
│   │   ├── progress.js         # Progress tracking + streak + target harian
│   │   ├── views.js            # Navigasi antar halaman
│   │   └── app.js              # Logika quiz, flashcard, interaksi
│   ├── data/n5/                # JSON data per kategori
│   ├── fonts/                  # Inter + Inconsolata (woff2)
│   └── index.html              # Entry point WebView
├── java/.../MainActivity.java  # WebView shell + Android bridge
└── res/                        # Android resources
```

## Sumber Data

- **Kanji**: [kanji-data](https://github.com/sepTN/kanji-data) (MIT)
- **Stroke order**: [KanjiVG](https://kanjivg.tagaini.net) (CC BY-SA 3.0)
- **Kosakata**: [jepang.org](https://jepang.org)

## Lisensi

MIT
