# Wakaru — 分かる

App belajar bahasa Jepang untuk Android.

## Fitur

- 3 Level: N5 (Pemula), N4 (Menengah Bawah), N3 (Menengah)
- Tema Light / Dark
- Offline — semua konten lokal, tidak perlu internet
- WebView-based (HTML/CSS/JS murni)

## Download

Download APK terbaru dari [GitHub Releases](https://github.com/akuh8820/wakaru-android/releases)

## Tech Stack

- Kotlin (WebView shell)
- HTML5, CSS3, Vanilla JS (SPA-lite)
- Android Gradle Plugin 8.4.2
- GitHub Actions (cloud build)

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

## License

MIT
