import { createRoot } from 'react-dom/client'
import { plants } from '../../../src/data/plants'
import { Comparison } from '../../../src/ui/Comparison'
import '../../../src/index.css'

// Extended fixtures stay outside the application bundle and horticultural data.
const extended = Array.from({ length: 6 }, (_, i) => ({ ...plants[i % plants.length],
  id: `fixture-${i}`, commonName: { en: `Test plant ${i + 1}`, de: `Testpflanze ${i + 1}` },
  dimensions: { ...plants[0].dimensions, maxIndoorHeightCm: { min: 100, max: 480 } },
  care: { ...plants[0].care, temperature: { minimum: -10, maximum: 45, ideal: { min: 18, max: 28 } } },
  roots: { ...plants[0].roots, depthCm: 80 },
}))
createRoot(document.getElementById('root')!).render(<div className="app app--compare"><Comparison plants={extended} onOpen={(id) => { location.hash = id }} /></div>)
