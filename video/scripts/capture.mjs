// Captures deterministic frame sequences of the running app for the video.
//
// The page clock is virtual: performance.now, Date.now and
// requestAnimationFrame are replaced before the app loads, and CSS
// transitions/animations are paused and seeked through the Web Animations
// API. Each recorded frame advances exactly 1/30 s, so three.js easing,
// wind, camera damping and CSS fades all play back smoothly regardless of
// how long a screenshot takes. The pointer path is recorded per frame so the
// video can draw its own cursor.
//
// Usage: start the app (`npm run dev` in the repo root), then
//   node scripts/capture.mjs [shot ...]

import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/'
const FPS = 30
const STEP = 1000 / FPS
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'captures')

const VIRTUAL_CLOCK = `(() => {
  let now = 0
  const epoch = Date.now()
  performance.now = () => now
  Date.now = () => epoch + now
  let queue = []
  let nextId = 0
  window.requestAnimationFrame = (cb) => { const id = ++nextId; queue.push({ id, cb }); return id }
  window.cancelAnimationFrame = (id) => { queue = queue.filter((r) => r.id !== id) }
  const born = new WeakMap()
  window.__advance = (ms) => {
    now += ms
    for (const a of document.getAnimations()) {
      if (!born.has(a)) born.set(a, now - ms)
      a.pause()
      a.currentTime = now - born.get(a)
    }
    const due = queue
    queue = []
    for (const r of due) {
      try { r.cb(now) } catch (e) { console.error(e) }
    }
  }
})()`

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * Shot steps run at a frame index:
 *   move: { to: selector | [x, y], dur }  eased pointer move (target resolved when the move starts)
 *   down / up / click                      mouse buttons at the current pointer position
 *   key: 'R'                               key press
 *   scroll: { sel, by, dur }               eased scrollTop animation of an element
 */
const SHOTS = {
  explore: {
    hash: '#pflanze/goldfruchtpalme',
    frames: 380,
    start: [1180, 640],
    steps: [
      { at: 60, move: { to: [700, 470], dur: 24 } },
      { at: 86, down: true },
      { at: 88, move: { to: [1000, 430], dur: 46 } },
      { at: 136, move: { to: [880, 520], dur: 26 } },
      { at: 163, up: true },
      { at: 168, move: { to: '[aria-label="Zoom in"]', dur: 22 } },
      { at: 192, click: true },
      { at: 222, move: { to: '[aria-label="Reset camera"]', dur: 14 } },
      { at: 238, click: true },
      { at: 262, move: { to: '.selector__item:has-text("Parlor Palm")', dur: 28 } },
      { at: 292, click: true },
      { at: 310, move: { to: [1120, 700], dur: 40 } },
    ],
  },
  roots: {
    hash: '#pflanze/bergpalme',
    frames: 165,
    warmup: 90,
    start: [1100, 300],
    steps: [
      { at: 4, move: { to: '[role="radio"]:has-text("Roots")', dur: 22 } },
      { at: 28, click: true },
      { at: 70, move: { to: [640, 520], dur: 22 } },
      { at: 94, down: true },
      { at: 96, move: { to: [760, 505], dur: 50 } },
      { at: 148, up: true },
    ],
  },
  anatomy: {
    hash: '#pflanze/gruenlilie',
    frames: 180,
    warmup: 90,
    start: [1150, 260],
    steps: [
      { at: 4, move: { to: '[role="radio"]:has-text("Anatomy")', dur: 20 } },
      { at: 26, click: true },
      { at: 60, move: { to: [730, 520], dur: 26 } },
      { at: 92, move: { to: '.hotspot >> nth=0', dur: 24 } },
      { at: 122, click: true },
      { at: 150, move: { to: [880, 610], dur: 28 } },
    ],
  },
  sheet: {
    hash: '#pflanze/goldfruchtpalme',
    frames: 75,
    warmup: 90,
    start: [1400, 520],
    steps: [{ at: 4, scroll: { sel: '.panel__scroll', by: 1150, dur: 66 } }],
  },
  vessel: {
    hash: '#pflanze/gruenlilie',
    frames: 90,
    warmup: 90,
    start: [1000, 640],
    steps: [
      { at: 2, move: { to: '.vessel button >> nth=0', dur: 14 } },
      { at: 18, click: true },
      { at: 40, move: { to: '.vessel button >> nth=1', dur: 12 } },
      { at: 54, click: true },
    ],
  },
  compare: {
    hash: '#vergleich',
    frames: 75,
    warmup: 40,
    start: [1300, 700],
    steps: [{ at: 6, scroll: { sel: '.app--compare', by: 260, dur: 64 } }],
  },
  mobile: {
    hash: '#pflanze/bergpalme',
    frames: 75,
    warmup: 90,
    viewport: { width: 390, height: 844 },
    dpr: 3,
    steps: [],
  },
}

async function resolvePoint(page, to) {
  if (Array.isArray(to)) return to
  const box = await page.locator(to).first().boundingBox()
  if (!box) throw new Error(`No box for ${to}`)
  return [box.x + box.width / 2, box.y + box.height / 2]
}

async function captureShot(browser, name, shot) {
  const viewport = shot.viewport ?? { width: 1600, height: 900 }
  const context = await browser.newContext({ viewport, deviceScaleFactor: shot.dpr ?? 1.5, reducedMotion: 'no-preference' })
  await context.addInitScript(VIRTUAL_CLOCK)
  const page = await context.newPage()
  page.on('console', (m) => m.type() === 'error' && console.warn(`  [page] ${m.text()}`))
  page.on('pageerror', (e) => console.warn(`  [page] ${e.message}`))

  await page.goto(BASE + shot.hash, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  if (shot.hash.startsWith('#pflanze')) await page.waitForSelector('.stage__canvas canvas')
  // Let the scene mount (geometry, environment map) before the clock starts.
  for (let i = 0; i < 4; i++) {
    await page.evaluate((ms) => window.__advance(ms), STEP)
    await page.waitForTimeout(250)
  }
  for (let i = 0; i < (shot.warmup ?? 0); i++) await page.evaluate((ms) => window.__advance(ms), STEP)

  const dir = path.join(OUT, name)
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })

  let pos = shot.start ?? [viewport.width / 2, viewport.height / 2]
  let down = false
  let move = null
  let scroll = null
  const cursor = []
  await page.mouse.move(...pos)

  for (let f = 0; f < shot.frames; f++) {
    for (const s of shot.steps.filter((s) => s.at === f)) {
      if (s.move) move = { from: pos, to: await resolvePoint(page, s.move.to), start: f, dur: s.move.dur }
      if (s.down) { await page.mouse.down(); down = true }
      if (s.up) { await page.mouse.up(); down = false }
      if (s.click) { await page.mouse.down(); await page.mouse.up() }
      if (s.key) await page.keyboard.press(s.key)
      if (s.scroll) {
        const top = await page.evaluate((sel) => document.querySelector(sel).scrollTop, s.scroll.sel)
        scroll = { ...s.scroll, from: top, start: f }
      }
    }
    if (move) {
      const t = Math.min(1, (f - move.start) / move.dur)
      const k = ease(t)
      pos = [move.from[0] + (move.to[0] - move.from[0]) * k, move.from[1] + (move.to[1] - move.from[1]) * k]
      await page.mouse.move(...pos)
      if (t >= 1) move = null
    }
    if (scroll) {
      const t = Math.min(1, (f - scroll.start) / scroll.dur)
      const y = scroll.from + scroll.by * ease(t)
      await page.evaluate(([sel, y]) => (document.querySelector(sel).scrollTop = y), [scroll.sel, y])
      if (t >= 1) scroll = null
    }
    const click = shot.steps.some((s) => s.at === f && (s.click || s.down))
    cursor.push({ x: +pos[0].toFixed(1), y: +pos[1].toFixed(1), down: down || click, click })

    await page.evaluate((ms) => window.__advance(ms), STEP)
    await page.screenshot({ path: path.join(dir, `${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 90 })
    if (f % 30 === 0) process.stdout.write(`  ${name} ${f}/${shot.frames}\r`)
  }

  const meta = { name, frames: shot.frames, viewport, dpr: shot.dpr ?? 1.5, cursor: shot.steps.length ? cursor : null }
  await writeFile(path.join(OUT, `${name}.json`), JSON.stringify(meta))
  await context.close()
  console.log(`  ${name}: ${shot.frames} frames`)
}

const only = process.argv.slice(2)
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL ?? 'msedge',
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--hide-scrollbars'],
})
try {
  for (const [name, shot] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(name)) continue
    await captureShot(browser, name, shot)
  }
} finally {
  await browser.close()
}
