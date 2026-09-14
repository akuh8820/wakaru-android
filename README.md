# Wakaru — 分かる

App belajar bahasa Jepang untuk Android.

## Fitur

- **3 Level**: N5 (Pemula), N4 (Menengah Bawah), N3 (Menengah)
- **Level detail view**: halaman per level dengan materi list, progress bar, dan aksi (Quiz, Flashcard)
- **Materi list**: kanji (79 item) + kosakata (668 item) per level, dengan filter A-Z, search, dan indikator "sudah dilihat"
- **Kanji detail**: arti, readings (kun'yomi/on'yomi), contoh penggunaan, related vocab, dan animasi stroke order (KanjiVG)
- **Quiz**: mode pilihan ganda dengan setup jumlah soal, skor, dan review jawaban
- **Flashcard**: flip card dengan front/back, shuffle, dan audio TTS
- **Audio TTS**: speakJapanese via Android bridge untuk pengucapan
- **Tema Light / Dark**
- **Offline** — semua konten lokal, tidak perlu internet

## Download

Download APK terbaru dari [GitHub Releases](https://github.com/akuh8820/wakaru-android/releases)

## Tech Stack

- Java (MainActivity, Android bridge)
- HTML5, CSS3, Vanilla JS (SPA-lite, WebView-based)
- targetSdk 35, minSdk 24, Java 17
- Android Gradle Plugin
- GitHub Actions (build APK + release via softprops/action-gh-release)

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

## Project Structure

```
app/src/main/
├── assets/
│   ├── css/style.css        # Design system (Minimal theme)
│   ├── js/                   # SPA logic (level, quiz, flashcard, audio)
│   └── data/                 # JSON data (kanji, kosakata per level)
├── java/.../MainActivity.java  # WebView shell + Android bridge
└── res/                      # Android resources
```

## Data Sources

- **Kanji data**: [kanji-data](https://github.com/sepTN/kanji-data) (MIT)
- **Stroke order**: [KanjiVG](https://kanjivg.tagaini.net) (CC BY-SA 3.0, © 2009/2010/2011 Ulrich Apel) — digunakan sesuai lisensi
- **Kosakata**: [jepang.org](https://jepang.org) — arti bahasa Indonesia

## License

MIT
