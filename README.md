# CS - Community Service Hour Tracker

A lightweight, dark-themed tracker designed for quick use on mobile devices in low-light environments (theater shows, band concerts, event volunteer setups).

![App Icon](icon.svg)

Live at: **https://duckie-jr.github.io/Community-service/**

## Features

- **Live Tracker**: Start/stop timer with blocky tabular digits (`00:00:00`). Keeps running across page reloads and restores automatically.
- **Service History**: Sortable, searchable log list with edit/delete, per-entry hour badges, and an accumulated total (hours + session count).
- **Log Past Hours**: Manual entry form for historical events, with overnight (past-midnight) time handling.
- **Export for your resume**:
  - `Resume .md` — formatted Markdown with your name, total hours, a **per-activity hours summary** (great for resumes), and full session details.
  - `CSV` — spreadsheet-friendly log.
  - `Backup .json` — full data backup; import merges backups and skips duplicates.
- **Zero dependencies**: no Tailwind, icon, or font CDNs — one self-contained HTML file plus `sw.js` for full offline caching. Loads instantly, works offline.
- **Your data stays yours**: everything is stored in your browser's `localStorage` (keys `cs_service_logs`, `cs_timer_state`).

## Install on Android (Chrome PWA)

1. Open the page in **Google Chrome** on your Android device.
2. Tap the **Three Dots Menu (⋮)** → **Add to Home Screen** / **Install App**.
3. Launch **CS Tracker** from your home screen as a standalone app.

---

### Minimal Palette Reference

- **Black**: `#000000` (Canvas)
- **Very Dark Navy**: `#080d1a` (Input Fills / Active Tabs)
- **Dark Navy**: `#121e36` (Borders & Secondary Controls)
- **White**: `#ffffff` (Text & Icons)
