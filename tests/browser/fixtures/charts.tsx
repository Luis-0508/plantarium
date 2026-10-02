import { createRoot } from 'react-dom/client'
import { plants } from '../../../src/data/plants'
import { temperatureAxis } from '../../../src/ui/viz/chart-layout'
import { RangeAxis } from '../../../src/ui/viz/Scales'
import { RootDiagram } from '../../../src/ui/viz/RootDiagram'
import { SoilMix } from '../../../src/ui/viz/SoilMix'
import '../../../src/index.css'

const temperature = { minimum: -12, maximum: 42, ideal: { min: 18, max: 28 } }
const axis = temperatureAxis(temperature)
createRoot(document.getElementById('root')!).render(
  <main style={{ maxWidth: 380, padding: 16 }}>
    <h1>Extended specimen charts</h1>
    <RangeAxis {...axis} ideal={temperature.ideal} tolerated={{ min: -12, max: 42 }} unit=" °C" label="Extended temperature" />
    <SoilMix mix={plants[0].care.soil.mix} ph={{ min: 2.2, max: 12.4 }} />
    <RootDiagram roots={{ ...plants[0].roots, depthCm: 75, spreadCm: 80, recommendedPotDepthCm: { min: 80, max: 100 } }} />
  </main>,
)
