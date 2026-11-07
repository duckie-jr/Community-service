# CS - Community Service Hour Tracker

A lightweight, dark-themed tracker designed specifically for quick use on mobile devices in low-light environments (such as theater shows, band concerts, and event volunteer setups).

![App Icon](icon.svg)

## Features

- **Active Tracker**: Live start/stop timer with zero-shift blocky tabular digits (`00:00:00`).
- **Service History**: Log list with custom sorting options, search filtering, edit/delete actions, and accumulated service counter.
- **Log Past Hours**: Manual entry form for historical events with default dates set to today.
- **Custom Sort Autocomplete**: Automatically suggests past activity titles following strict ordering: **Symbols $\rightarrow$ Numbers (0–9) $\rightarrow$ Uppercase (A–Z) $\rightarrow$ Lowercase (a–z)**.
- **Export / Data Bar**: Quick top-right overlay to export formatted Markdown resume files (`.md`), backup JSON files (`.json`), or import existing backups.
- **Offline & Local**: Everything auto-saves to browser `localStorage` and caches via an inline Service Worker.

## How to Install on Android (Chrome PWA)

1. Host or open `index.html` alongside `manifest.json` and `icon.svg` on your web server or GitHub Pages.
2. Open the webpage in **Google Chrome** on your Android device.
3. Tap the **Three Dots Menu (⋮)** in the top right corner.
4. Select **Add to Home Screen** or **Install App**.
5. Launch **CS Tracker** directly from your home screen as a full-screen standalone application.

---

### Minimal Palette Reference
- **Black**: `#000000` (Canvas)
- **Very Dark Navy**: `#080d1a` (Input Fills / Active Tabs)
- **Dark Navy**: `#121e36` (Borders & Secondary Controls)
- **White**: `#ffffff` (Text & Icons)