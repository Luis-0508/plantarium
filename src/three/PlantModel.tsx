import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, type RefObject } from 'react'
import * as THREE from 'three'
import type { AnatomyRegion, Plant } from '../data/types'
import type { StageAnim } from '../viewTypes'
import { withWind } from './materials'
import { buildProceduralGeometry } from './models/registry'

interface Props {
  plant: Plant
  anim: RefObject<StageAnim>
}

const ROOT_GLOW = new THREE.Color('#f7f3e6')
const HIGHLIGHT = new THREE.Color('#fffbe8')

/** Renders the plant's shoot and roots, choosing procedural or GLTF source. */
export function PlantModel({ plant, anim }: Props) {
  if (plant.model.kind === 'gltf') return <GltfPlant url={plant.model.url} rootsUrl={plant.model.rootsUrl} />
  return <ProceduralPlant plant={plant} anim={anim} />
}

function ProceduralPlant({ plant, anim }: Props) {
  const geometry = useMemo(() => buildProceduralGeometry(plant), [plant])
  const height = plant.dimensions.specimenHeight

  const materials = useMemo(() => {
    const surface = (roughness: number) =>
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness, side: THREE.DoubleSide, emissive: HIGHLIGHT, emissiveIntensity: 0, transparent: true })
    return {
      leaf: withWind(surface(0.58), height),
      stem: withWind(surface(0.62), height),
      crown: withWind(surface(0.7), height),
      roots: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, emissive: ROOT_GLOW, emissiveIntensity: 0 }),
    }
  }, [height])

  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials])

  useFrame(() => {
    const a = anim.current
    if (!a) return
    // Foliage recedes to a veil in root view so the roots stay readable.
    const shootOpacity = 1 - a.reveal * 0.84
    for (const m of [materials.leaf, materials.stem, materials.crown]) {
      m.opacity = shootOpacity
      m.depthWrite = shootOpacity > 0.95
    }
    materials.leaf.emissiveIntensity = a.highlight.leaf * 0.28
    materials.stem.emissiveIntensity = a.highlight.stem * 0.35
    materials.crown.emissiveIntensity = a.highlight.crown * 0.35
    // In root view the roots print like a cyanotype: bright, low-contrast.
    materials.roots.emissiveIntensity = a.reveal * 0.55 + a.highlight.roots * 0.3
    materials.roots.roughness = 0.75 + a.reveal * 0.2
  })

  const part = (region: AnatomyRegion, geo: THREE.BufferGeometry, material: THREE.Material, shadows = true) => (
    <mesh geometry={geo} material={material} userData={{ region }} castShadow={shadows} receiveShadow={shadows} />
  )

  return (
    <group>
      {part('leaf', geometry.leaves, materials.leaf)}
      {part('stem', geometry.stems, materials.stem)}
      {part('crown', geometry.crown, materials.crown)}
      {part('roots', geometry.roots, materials.roots, false)}
    </group>
  )
}

const REGION_PATTERN: [RegExp, AnatomyRegion][] = [
  [/root/i, 'roots'],
  [/leaf|frond|blade/i, 'leaf'],
  [/stem|cane|petiole|runner/i, 'stem'],
  [/crown|sheath/i, 'crown'],
]

/**
 * Loads a modelled plant. Mesh names map to anatomy regions ("leaf_*",
 * "stem_*", "crown_*", "roots_*"), so picking and hotspots keep working.
 */
function GltfPlant({ url, rootsUrl }: { url: string; rootsUrl?: string }) {
  const { scene } = useGLTF(url)
  const clone = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      const match = REGION_PATTERN.find(([re]) => re.test(obj.name))
      if (match) obj.userData.region = match[1]
      if ((obj as THREE.Mesh).isMesh) obj.castShadow = obj.receiveShadow = true
    })
    return root
  }, [scene])
  return (
    <group>
      <primitive object={clone} />
      {rootsUrl && <GltfRoots url={rootsUrl} />}
    </group>
  )
}

function GltfRoots({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const clone = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => (obj.userData.region = 'roots'))
    return root
  }, [scene])
  return <primitive object={clone} />
}
