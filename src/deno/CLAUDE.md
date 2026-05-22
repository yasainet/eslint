# src/deno/CLAUDE.md

Supabase Edge Functions (Deno) 固有 rule の置き場所判断:

- `boundaries/<surface>.mjs` — Deno 固有の boundary (外界 → features の入口)
  - 種類: lib / utils / entry-point
- `local-plugins/` — Deno 固有の local plugin
- `index.mjs` — Deno entry。common の rule + 上記 file を合成

Deno entry 横断の共通 rule は `src/common/` に追加する。
