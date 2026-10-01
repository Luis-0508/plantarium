import { loadFont as loadHanken } from '@remotion/google-fonts/HankenGrotesk'
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono'
import { loadFont as loadNewsreader } from '@remotion/google-fonts/Newsreader'
import { Easing } from 'remotion'

const serif = loadNewsreader('normal', { weights: ['400', '500'], subsets: ['latin'] })
loadNewsreader('italic', { weights: ['400'], subsets: ['latin'] })
const sans = loadHanken('normal', { weights: ['400', '500', '600'], subsets: ['latin'] })
const mono = loadMono('normal', { weights: ['400', '500'], subsets: ['latin'] })

export const FPS = 30
export const WIDTH = 1920
export const HEIGHT = 1080

/** The app's tokens (src/index.css), plus a darker ground for the video. */
export const C = {
  night: '#081629',
  deep: '#0f2747',
  prussian: '#1d4677',
  tint: '#d3dde9',
  rootWhite: '#f1eedd',
  paper: '#f6f7f3',
  ink: '#18231e',
  moss: '#8fae5f',
  line: 'rgba(241, 238, 221, 0.16)',
}

export const F = {
  serif: `${serif.fontFamily}, Georgia, serif`,
  sans: `${sans.fontFamily}, system-ui, sans-serif`,
  mono: `${mono.fontFamily}, ui-monospace, monospace`,
}

/** The app's --ease: cubic-bezier(0.22, 0.8, 0.24, 1). */
export const ease = Easing.bezier(0.22, 0.8, 0.24, 1)
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1)

/** Browser window on the dark ground used by every capture scene (CSS px of a 1600×900 viewport). */
export const WINDOW = { x: 160, y: 30, bar: 38, w: 1600, h: 900 }

export const REPO = 'github.com/Luis-0508/plantarium'
