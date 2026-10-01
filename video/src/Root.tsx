import { Composition } from 'remotion'
import { DURATION, Showcase } from './Showcase'
import { FPS, HEIGHT, WIDTH } from './theme'

export function Root() {
  return <Composition id="Showcase" component={Showcase} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
}
