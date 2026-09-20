# Wakaru Design System

> Dokumen referensi design tokens untuk app Wakaru. Semua styling pakai CSS variables dari `css/tokens.css`.

## Prinsip

- **Minimal, bukan kosong**: whitespace terukur, warna hemat, tipografi jelas
- **Token-driven**: semua nilai warna, ukuran, spacing dari CSS variable — tidak ada hardcoded hex di komponen
- **Dark mode wajib**: light + dark mode via `data-theme` attribute
- **Offline-first**: tidak ada dependency eksternal, semua font dibundel

---

## Warna

### Palet inti

| Token | Light | Dark | Keterangan |
|---|---|---|---|
| `--bg` | `#F4F4F1` | `#181A18` | Background utama |
| `--surface` | `#FFFFFF` | `#242624` | Kartu, panel |
| `--surface-2` | `#FAFAF8` | `#2A2C2A` | Alternatif surface |
| `--text` | `#0C0C09` | `#F2F0EB` | Teks utama |
| `--muted` | `#6B6B63` | `#A8A6A0` | Teks sekunder |
| `--muted-2` | `#8A8A83` | `#8E8C86` | Teks teredam |
| `--border` | `#E8E6E0` | `#2E302E` | Border default |
| `--border-strong` | `#DDDBD5` | `#3A3C39` | Border tegas |

### Aksen (sage green)

| Token | Light | Dark |
|---|---|---|
| `--accent` | `#5B7B5A` | `#8EB08E` |
| `--accent-hover` | `#4E6A4E` | `#A1C2A1` |
| `--accent-light` | `#E9EFE9` | `#2A332A` |
| `--accent-text` | `#FFFFFF` | `#0C0C09` |

### Semantik

| Token | Light | Dark |
|---|---|---|
| `--success` | `#16A34A` | `#4ADE80` |
| `--warning` | `#D97706` | `#FCD34D` |
| `--danger` | `#DC2626` | `#F87171` |

### Warna kategori

| Kategori | Light | Light BG | Dark | Dark BG |
|---|---|---|---|---|
| Sage (kana) | `#5B7B5A` | `#E9EFE9` | `#8EB08E` | `#2A332A` |
| Purple (kanji) | `#7C5CBF` | `#EDE8F7` | `#A78BFA` | `#2E2850` |
| Vermilion (kosakata) | `#C94A2B` | `#FDE8E1` | `#FB7A5A` | `#3A2520` |
| Cyan (bunpou) | `#148CA3` | `#E0F2F7` | `#38BDF8` | `#1E3238` |
| Amber (konjugasi) | `#B7791F` | `#FEF3C7` | `#FCD34D` | `#3A2E1A` |
| Red (partikel) | `#DC2626` | `#FEE2E2` | `#F87171` | `#3A2020` |
| Blue (quiz) | `#2563EB` | `#DBEAFE` | `#60A5FA` | `#1E2E4A` |
| Green (progress) | `#16A34A` | `#DCFCE7` | `#4ADE80` | `#1E3325` |
| Violet (flashcard) | `#7C3AED` | `#EDE9FE` | `#A78BFA` | `#2A2540` |

---

## Tipografi

### Font

| Token | Font | Penggunaan |
|---|---|---|
| `--font-sans` | Inter, Hiragino Sans, Yu Gothic, system-ui | Body text, UI |
| `--font-mono` | Inconsolata, ui-monospace, SFMono-Regular | Code, label caps |
| `--font-jp` | sans-serif | Karakter Jepang |

Font dibundel sebagai `.woff2` di `fonts/` — offline 100%.

### Skala ukuran

| Token | Nilai | Penggunaan |
|---|---|---|
| `--text-xs` | `0.7rem` | Label kecil, badge |
| `--text-sm` | `0.8125rem` | Caption, metadata |
| `--text-base` | `0.9375rem` | Body text default |
| `--text-md` | `1rem` | Body text besar |
| `--text-lg` | `1.125rem` | Sub-heading |
| `--text-xl` | `1.25rem` | Heading kecil |
| `--text-2xl` | `1.5rem` | Heading |
| `--text-3xl` | `2rem` | Judul halaman |

### Weight

| Token | Nilai |
|---|---|
| `--font-normal` | 400 |
| `--font-medium` | 500 |
| `--font-semibold` | 600 |
| `--font-bold` | 700 |

### Line height & letter spacing

| Token | Nilai |
|---|---|
| `--leading-tight` | 1.2 |
| `--leading-normal` | 1.5 |
| `--leading-relaxed` | 1.6 |
| `--tracking-tight` | -0.025em |
| `--tracking-normal` | 0 |
| `--tracking-wide` | 0.05em |
| `--tracking-wider` | 0.12em |

---

## Spacing

Grid 8pt (4 sebagai half-step):

| Token | Nilai | px |
|---|---|---|
| `--space-2xs` | 0.25rem | 4 |
| `--space-xs` | 0.5rem | 8 |
| `--space-sm` | 0.75rem | 12 |
| `--space-md` | 1rem | 16 |
| `--space-lg` | 1.5rem | 24 |
| `--space-xl` | 2rem | 32 |
| `--space-2xl` | 3rem | 48 |

---

## Border Radius

| Token | Nilai | Penggunaan |
|---|---|---|
| `--r-sm` | 4px | Tombol kecil, input |
| `--r-md` | 8px | Kartu, panel |
| `--r-pill` | 999px | Badge, pill button |

---

## Shadow

| Token | Light | Dark |
|---|---|---|
| `--shadow` | `rgba(12,12,9,0.06)` | `rgba(0,0,0,0.35)` |
| `--shadow-hover` | `rgba(12,12,9,0.08)` | `rgba(0,0,0,0.5)` |

---

## Dark Mode

Aktif via attribute `data-theme="dark"` di `<html>`. Toggle di halaman Pengaturan, disimpan ke `localStorage` dengan key `wakaru-theme-mode`.

Theme guard inline di `<head>` baca localStorage sebelum CSS load untuk mencegah FOUC (flash of unstyled content).

---

## File terkait

- `css/tokens.css` — sumber semua token (107 variabel light, 35 dark overrides)
- `css/style.css` — base styling + komponen global
- `css/<screen>.css` — styling per halaman (11 file)
- `design.md` — dokumen ini
