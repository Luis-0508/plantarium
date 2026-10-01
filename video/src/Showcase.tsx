import { linearTiming, TransitionSeries } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { AbsoluteFill } from 'remotion'
import { AppReveal } from './scenes/AppReveal'
import { Architecture } from './scenes/Architecture'
import { Intro } from './scenes/Intro'
import { Montage, SHOT } from './scenes/Montage'
import { Outro } from './scenes/Outro'
import { Premise } from './scenes/Premise'
import { RootsAnatomy } from './scenes/RootsAnatomy'
import { C } from './theme'

const SCENES = [
  { id: 'intro', frames: 135, Component: Intro },
  { id: 'premise', frames: 135, Component: Premise },
  { id: 'app', frames: 360, Component: AppReveal },
  { id: 'roots-anatomy', frames: 250, Component: RootsAnatomy },
  { id: 'architecture', frames: 180, Component: Architecture },
  { id: 'montage', frames: SHOT * 4 + 6, Component: Montage },
  { id: 'outro', frames: 125, Component: Outro },
]
const FADE = 16

export const DURATION = SCENES.reduce((sum, s) => sum + s.frames, 0) - FADE * (SCENES.length - 1)

export function Showcase() {
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <TransitionSeries>
        {SCENES.flatMap(({ id, frames, Component }, i) => [
          ...(i ? [<TransitionSeries.Transition key={`${id}-in`} presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />] : []),
          <TransitionSeries.Sequence key={id} durationInFrames={frames}>
            <Component />
          </TransitionSeries.Sequence>,
        ])}
      </TransitionSeries>
    </AbsoluteFill>
  )
}
