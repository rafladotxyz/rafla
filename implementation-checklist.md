# Rafla Implementation Checklist

## Done

- [x] Replace synthetic room fallback with explicit 404s and proper invite handling - completed 2026-05-23
- [x] Persist per-room `minPlayers` end-to-end and read it in draw UI - completed 2026-05-23
- [x] Compute real leaderboard prize totals - completed 2026-05-23
- [x] Remove dead public/private room state from Flip and Spin - completed 2026-05-23
- [x] Surface API persistence failures in Draw, Flip, and Spin - completed 2026-05-23
- [x] Add a real dashboard route and wire home/dashboard navigation - completed 2026-05-23
- [x] Add app-wide motion primitives and responsive home/dashboard polish - completed 2026-05-23
- [x] Clean unfinished draw page warnings and remove dead state - completed 2026-05-23

- [x] Harden contract reads against wrong-network balanceOf errors and use deployed token addresses - completed 2026-05-23
- [x] Add dashboard user details and remove dashboard link from navbar - completed 2026-05-23
- [x] Refresh room create/join cards with custom amount/player controls and cleaner visuals - completed 2026-05-23

- [x] Add shared navbar + responsive shell to profile and leaderboard pages - completed 2026-05-23

- [x] Make minimum deposit errors explain misconfigured on-chain values clearly - completed 2026-05-23

## Verified

- `pnpm exec eslint` on touched TS/TSX files - passed
- `pnpm exec prisma generate` - passed
- `pnpm exec prisma migrate deploy` - passed
- `pnpm exec tsc --noEmit` - passed

## Notes

- Keep this file updated as each implementation lands.
- Mark items complete only after the API, UI, and data model are aligned.
