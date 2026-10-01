import { createRoot } from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { plants } from '../../../src/data/plants'
import type { Plant } from '../../../src/data/types'
import { PlantModel } from '../../../src/three/PlantModel'
import type { StageAnim } from '../../../src/viewTypes'
import { StageBoundary, StageFailure } from '../../../src/ui/StageBoundary'

function Probe() {
  useFrame(({ scene }) => {
    const status = document.getElementById('model-status')!
    const namedModel = scene.getObjectByName('leaf_fixture')
    status.textContent = namedModel ? 'loaded' : scene.children.some((child) => child.children.length > 0) ? 'fallback' : 'loading'
  })
  return null
}

function Throwing(): never { throw new Error('Expected test render failure') }

export function Models() {
  const fallback = plants[0].model
  if (fallback.kind !== 'procedural') throw new Error('Expected procedural fixture')
  const [plant, setPlant] = useState<Plant>({ ...plants[0], model: { kind: 'gltf', url: '/fixture/missing.gltf', fallback } })
  const anim = useRef<StageAnim>({ grow: 1, pose: 0, pot: 1, ghost: 0, soil: 1, stipple: 0, reveal: 0, shadow: 1,
    highlight: { leaf: 0, stem: 0, crown: 0, soil: 0, roots: 0 } })
  return <>
    <button onClick={() => { setPlant({ ...plant, model: { kind: 'gltf', url: '/fixture/valid.gltf', fallback } }) }}>Load working model</button>
    <button onClick={() => { setPlant({ ...plant, model: { kind: 'gltf', url: '/fixture/valid.gltf', rootsUrl: '/fixture/missing-roots.gltf', fallback } }) }}>Load broken roots</button>
    <output id="model-status">loading</output>
    <StageBoundary fallback={<StageFailure plantId="fixture" onPlantSwap={() => {}} />}>
      {location.search.includes('throw') ? <Throwing /> : <div style={{ width: 320, height: 240 }}>
        <Canvas><PlantModel plant={plant} anim={anim} /><Probe /></Canvas>
      </div>}
    </StageBoundary>
  </>
}
createRoot(document.getElementById('root')!).render(<Models />)
