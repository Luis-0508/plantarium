# Plantarium showcase — storyboard

1920×1080 · 30 fps · ~42 s · silent (no narration, no music).

## Visual direction

- **Ground:** deep Prussian / cyanotype (`#0b1d36` → `#0f2747`) with the app's
  fine vertical line texture and a faint paper grain. This is the root view's
  palette, pushed one step darker so the light app captures read as lit
  "specimen plates" on a dark table.
- **Type:** Newsreader (serif, titles, italic for botanical names), Hanken
  Grotesk (UI captions), JetBrains Mono (small technical labels, index numbers,
  file paths). All from Google Fonts, same as the app.
- **Colour:** root-white `#f1eedd` for text and line work, prussian-tint
  `#d3dde9` for secondary text, moss `#4d6b2f` / `#8fae5f` as the only warm
  accent. No gradients-for-the-sake-of-it, no glows beyond a soft vignette.
- **Motion:** slow eased push-ins (`cubic-bezier(.22,.8,.24,1)`, the app's own
  `--ease`), line-drawing reveals, crossfades and masked wipes. No bounces.
- **Footage:** real browser captures of the running app, rendered frame by
  frame with a virtual clock (deterministic, no dropped frames). The cursor is
  recorded during capture and redrawn in the video.
- **Captions:** small lower-left labels: mono index (`01 / VIEW`) + one short
  English sentence. The app UI is captured in English, its default language.

## Scenes

| # | Time | Scene | Content | Visual |
|---|------|-------|---------|--------|
| 1 | 0:00–0:04.5 | **Intro** | Mark's root system draws itself, wordmark rises: *Plantarium*. Mono line: `AN INTERACTIVE 3D HERBARIUM` | Centered on cyanotype ground, roots drawn stroke by stroke, soil line sweeps left→right |
| 2 | 0:04.5–0:09 | **Premise** | "Every houseplant as a living specimen — *from leaf to root.*" Three tags: procedural shoots · grown roots · care data as graphics | Serif statement, words fade up; the three plant glyphs from the app drawn as line art |
| 3 | 0:09–0:12 | **Into the app** | Browser frame (`localhost:5173/#pflanze/goldfruchtpalme`) rises from below and scales up until the app fills the frame; the palm grows out of its pot | 3D-tilted window settling flat, then push into full bleed |
| 4 | 0:12–0:20 | **3D specimen** | Orbit drag around the Areca palm, zoom in, switch to the parlor palm (shrink-and-regrow) | Full-bleed capture, synthetic cursor, slow push-in; captions `01 / ORBIT` "Every plant is a 3D model you can orbit and inspect." → `02 / GROW` "Procedurally generated from botanical parameters and a seed." |
| 5 | 0:20–0:28 | **Roots & anatomy** | Click *Roots*: pot turns to glass, cyanotype ground, depth ruler. Then the spider plant in *Anatomy*: hover hotspots, click *Leaf*, card opens | Two captures joined by a vertical wipe; captions `03 / ROOTS` "Roots grow as constrained random walks inside the pot." → `04 / ANATOMY` "Pick leaves, stems, crown and roots on the model itself." |
| 6 | 0:28–0:34 | **Architecture** | Data-driven pipeline: `src/data` → params + seed → `src/three/models` → R3F scene → interaction & `src/ui` | Nodes draw in on the cyanotype grid, connections animate with travelling dots; tech row: React 19 · TypeScript · three.js · React Three Fiber · Vite |
| 7 | 0:34–0:39 | **Montage** | Specimen sheet scroll · pot ghost/hidden toggle · to-scale comparison · mobile layout | ~1.2 s hard-ish cuts with short whip-blur; small mono labels per shot |
| 8 | 0:39–0:43 | **Outro** | Mark + *Plantarium*, `github.com/Luis-0508/plantarium`, `MIT · open source` | Calm, centered; roots under the soil line pulse once |

## Capture plan (`scripts/capture.mjs`)

Viewport 1600×900 at device scale 1.5 (2400×1350 frames, headroom for
push-ins); mobile shot at 390×844 @ 3×. Virtual clock: `performance.now`,
`Date.now` and `requestAnimationFrame` are replaced before the app loads, and
CSS transitions/animations are paused and seeked through the Web Animations
API, so every 1/30 s step is exact.

| Shot | Frames | Actions |
|------|--------|---------|
| `explore` | 300 | Areca palm grows in → drag-orbit → zoom → click *Parlor Palm* → regrow |
| `roots` | 150 | Parlor palm → click *Roots* → slight orbit |
| `anatomy` | 165 | Spider plant → click *Anatomy* → hover hotspots → click *Leaf* |
| `sheet` | 60 | Scroll the specimen sheet |
| `vessel` | 60 | Toggle pot: visible → transparent → off |
| `compare` | 60 | Comparison page, gentle scroll |
| `mobile` | 60 | Phone layout, palm |
