import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Component, Suspense, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import * as THREE from 'three'
import type { AnatomyRegion, Plant } from '../data/types'
import type { StageAnim } from '../viewTypes'
import { foliageShader } from './materials'
import { buildProceduralGeometry } from './models/registry'

interface Props {
  plant: Plant
  anim: RefObject<StageAnim>
}

const ROOT_GLOW = new THREE.Color('#f7f3e6')
const HIGHLIGHT = new THREE.Color('#fffbe8')
/** Opacity foliage keeps in root view, so the roots stay readable. */
const SHOOT_VEIL = 0.16

/** Renders the plant's shoot and roots from a procedural generator or a GLB file. */
export function PlantModel({ plant, anim }: Props) {
  const model = plant.model
  if (model.kind === 'procedural') return <ProceduralPlant key={plant.id} plant={plant} anim={anim} />

  const fallback = model.fallback ? <ProceduralPlant key={`${plant.id}-fallback`} plant={{ ...plant, model: model.fallback }} anim={anim} /> : null
  return (
    <ModelErrorBoundary fallback={fallback} url={model.url}>
      <Suspense fallback={fallback}>
        <GltfPlant url={model.url} rootsUrl={model.rootsUrl} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

function FoliageMaterial({ height, roughness, materialRef }: { height: number; roughness: number; materialRef: RefObject<THREE.MeshStandardMaterial | null> }) {
  const shader = useMemo(() => foliageShader(height), [height])
  return (
    <meshStandardMaterial
      ref={materialRef}
      vertexColors
      roughness={roughness}
      side={THREE.DoubleSide}
      emissive={HIGHLIGHT}
      emissiveIntensity={0}
      transparent
      onBeforeCompile={shader.onBeforeCompile}
      customProgramCacheKey={shader.customProgramCacheKey}
    />
  )
}

function ProceduralPlant({ plant, anim }: Props) {
  const geometry = useMemo(() => buildProceduralGeometry(plant), [plant])
  const height = plant.dimensions.specimenHeight
  const leaf = useRef<THREE.MeshStandardMaterial>(null)
  const stem = useRef<THREE.MeshStandardMaterial>(null)
  const crown = useRef<THREE.MeshStandardMaterial>(null)
  const roots = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(() => {
    const a = anim.current
    if (!a) return
    const shootOpacity = 1 - a.reveal * (1 - SHOOT_VEIL)
    const parts: [THREE.MeshStandardMaterial | null, number][] = [
      [leaf.current, a.highlight.leaf * 0.28],
      [stem.current, a.highlight.stem * 0.35],
      [crown.current, a.highlight.crown * 0.35],
    ]
    for (const [m, glow] of parts) {
      if (!m) continue
      m.opacity = shootOpacity
      m.depthWrite = shootOpacity > 0.95
      m.emissiveIntensity = glow
    }
    // In root view the roots print like a cyanotype: bright, low-contrast.
    if (roots.current) {
      roots.current.emissiveIntensity = a.reveal * 0.55 + a.highlight.roots * 0.3
      roots.current.roughness = 0.75 + a.reveal * 0.2
    }
  })

  return (
    <group>
      <mesh geometry={geometry.leaves} userData={{ region: 'leaf' }} castShadow receiveShadow>
        <FoliageMaterial height={height} roughness={0.58} materialRef={leaf} />
      </mesh>
      <mesh geometry={geometry.stems} userData={{ region: 'stem' }} castShadow receiveShadow>
        <FoliageMaterial height={height} roughness={0.62} materialRef={stem} />
      </mesh>
      <mesh geometry={geometry.crown} userData={{ region: 'crown' }} castShadow receiveShadow>
        <FoliageMaterial height={height} roughness={0.7} materialRef={crown} />
      </mesh>
      <mesh geometry={geometry.roots} userData={{ region: 'roots' as AnatomyRegion }}>
        <meshStandardMaterial ref={roots} vertexColors roughness={0.75} emissive={ROOT_GLOW} emissiveIntensity={0} />
      </mesh>
    </group>
  )
}

/** Falls back to the procedural model if a GLB file is missing or invalid. */
class ModelErrorBoundary extends Component<{ fallback: ReactNode; url: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn(`Plant model ${this.props.url} could not be loaded; showing fallback.`, error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
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
 * Not yet exercised with a real asset.
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
