# 0003. DOM labels projected from 3D anchors instead of WebGL text

- Status: Accepted
- Date: 2026-09-30 (recorded 2026-10-16 from code and history)

## Context

Hotspot labels and root-ruler ticks belong to points in the 3D scene, but must
be crisp at any zoom, translatable, keyboard-focusable and readable by screen
readers. Text rendered into WebGL is none of these by default.

## Decision

Labels are ordinary DOM elements in `ui/StageOverlay.tsx`. They register
themselves by id in `three/anchorRegistry.ts` (which has no three.js imports,
so the UI bundle stays small). Inside the canvas, `ScreenAnchors.tsx`
projects each 3D anchor to screen space every frame and positions the
matching element.

## Consequences

- Labels use the normal i18n strings, CSS and accessibility tree; hotspots
  are real `<button>` elements with `aria-pressed`.
- A per-frame projection loop (`useFrame`) runs while the stage is visible;
  it must stay cheap.
- Positioning lives outside React state, so moving labels does not re-render
  the UI tree.
