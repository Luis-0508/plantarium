# Plantarium showcase video

A ~42 s product video (1920×1080, 30 fps, silent) built with
[Remotion](https://www.remotion.dev/). It is a separate npm project; the app
itself does not depend on it. See [STORYBOARD.md](STORYBOARD.md) for scenes,
timing and visual direction.

## How it is made

1. **Capture** (`scripts/capture.mjs`): drives the running app in headless
   Edge with Playwright and screenshots it frame by frame. The page clock is
   virtual (`performance.now`, `Date.now`, `requestAnimationFrame`, and CSS
   animations seeked through the Web Animations API), so three.js easing,
   wind, camera damping and CSS fades advance exactly 1/30 s per frame. The
   pointer path is saved alongside and redrawn as a cursor in the video.
2. **Compose** (`src/`): Remotion scenes play the frame sequences inside a
   browser window on a cyanotype ground, plus typographic intro/outro and an
   animated architecture diagram.

## Usage

```bash
npm install
# in the repository root, in another terminal: npm run dev  (serves :5173)
npm run capture          # writes public/captures/ (~360 MB, gitignored)
npm run studio           # preview and scrub in Remotion Studio
npm run render           # writes ../output/plantarium-showcase.mp4
```

`npm run capture -- explore roots` re-captures selected shots. Set
`BROWSER_CHANNEL=chrome` to use Chrome instead of Edge, or `BASE_URL` to point
at another server. The composition imports the capture metadata, so captures
must exist before Studio or a render can start.

## Layout

```text
scripts/capture.mjs     Shot definitions (actions per frame) and the virtual-clock capture
src/Showcase.tsx        Scene order, durations and transitions
src/scenes/             Intro, Premise, AppReveal, RootsAnatomy, Architecture, Montage, Outro
src/components/         Capture player + cursor, browser window, caption, mark, ground
src/theme.ts            Colours, fonts and easing taken from the app
```

Shot timings in `capture.mjs` and scene timings in `src/scenes` are coupled
(e.g. the plant switch at capture frame 292); change them together.
