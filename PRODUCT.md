# Product

## Register

product

## Users

Casual social players: friends dropping into rooms together for quick sessions,
often mobile-first. They arrive wallet-in-hand (EVM or Solana) but are not
necessarily degen traders; they came to play a round of spin, flip, or draw with
people they know. Context is social and low-stakes: hanging out, splitting
attention, expecting the next reveal within seconds. The job to be done is
"turn chance into a shared moment" without friction between opening the app and
watching a result land.

## Product Purpose

Rafla is a real-time, room-based crypto game platform: spin, flip, and draw
games played live with friends, wallet-native flow, shared suspense. Success
looks like fast room joins, players returning for another round immediately,
and results that feel legitimately exciting rather than rigged or noisy.

## Brand Personality

Sleek and premium: confident, restrained casino-grade polish where trust is
signaled through composure, not neon. Three words: composed, anticipatory,
premium. Emotional goal: the quiet confidence of a high-end table right before
the reveal; excitement comes from timing and contrast, never from clutter.

## Anti-references

- Sketchy crypto-casino: neon purple gradients, glowing 3D coins, bonus
  banners, fake urgency countdowns everywhere.
- Cheap mobile-game spam: clashing colors, confetti overload, carnival clutter.
- Sterile fintech dashboard: tables and sidebars that drain all suspense.
- Anything that reads "gambling app trying too hard"; Rafla should feel like a
  premium game night, not a sportsbook.

## Design Principles

1. **Suspense through restraint**: build anticipation with pacing, scale, and
   darkness; never with flashing, confetti, or urgency tricks.
2. **The reveal is the hero**: every screen exists to make the moment before
   the result land feel larger; optimize layouts around that beat.
3. **Zero-friction rooms**: joining a friend's room must be one obvious action;
   design for thumb-reach and glanceability first.
4. **Premium composure earns trust**: calm surfaces, generous space, and
   precise type signal fairness better than any badge or disclaimer.
5. **Real-time legibility**: live state (whose turn, pot size, time left) must
   be readable at arm's length in under a second.

## Accessibility & Inclusion

Target WCAG 2.1 AA. `prefers-reduced-motion` is already handled globally in
`globals.css`; keep honoring it in all new animation work. Known concern:
game states lean on color and motion cues (spins, flips, progress glows), so
provide non-color indicators (icons, text labels, state changes) for win/lose
and turn order, keep focus rings visible against near-black surfaces, and test
magenta-on-dark contrast (`#D946EF` on `#050505`) for small text.
