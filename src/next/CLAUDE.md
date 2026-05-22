# src/next/CLAUDE.md

Next.js 固有 rule の置き場所判断:

- `boundaries/<surface>.mjs` — Next.js 固有の boundary (外界 → features の入口)
  - 種類: page / route / sitemap / hooks / components / lib
- `layers/<layer>.mjs` — Next.js 固有の layer
  - 種類: components / hooks / layouts
- `directives.mjs` — `"use server"` / `"use client"` 等の directive 制約
- `imports.mjs` — Next.js 固有の import パターン
- `tailwindcss.mjs` — Tailwind CSS rule (margin 禁止等)
- `index.mjs` — Next.js entry。common の rule + 上記 file を合成

Next.js entry 横断の共通 rule は `src/common/` に追加する。
