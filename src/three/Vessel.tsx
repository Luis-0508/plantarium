import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import type { StageAnim } from '../viewTypes'
import { createGhostMaterial, createPotTexture, createRadialTexture, createSoilTexture } from './materials'
import { POT_BASE, POT_TAPER, POT_WALL, SOIL_DROP, innerRadiusAt } from './models/potShape'

interface Props {
  radius: number
  height: number
  color: string
  anim: RefObject<StageAnim>
}

/** Unit pot profile (radius 1, height 1, rim at y = 0) for a LatheGeometry. */
function potProfile() {
  const outer = (y: number) => 1 - (1 - POT_TAPER) * -y
  const pts: [number, number][] = [
    [0, -1],
    [POT_TAPER - 0.03, -1],
    [POT_TAPER, -0.985],
    [outer(-0.16), -0.16],
    [outer(-0.16) + 0.05, -0.15],
    [1.05, -0.012],
    [1.04, 0],
    [1 - POT_WALL, 0],
    [innerRadiusAt(-(1 - POT_BASE), 1, 1), -(1 - POT_BASE)],
    [0, -(1 - POT_BASE)],
  ]
  return pts.map(([x, y]) => new THREE.Vector2(x, y))
}

const STIPPLE_COUNT = 2200

/**
 * Pot, soil body, top dressing and the root-view stipple. Built at unit size
 * and eased toward each plant's pot dimensions so plant switches morph.
 */
const STIPPLE_ROOT = new THREE.Color('#dfe7ef')
const STIPPLE_SOIL = new THREE.Color('#4a3a2c')
const GHOST_PLANT = new THREE.Color('#33443b')
const GHOST_ROOT = new THREE.Color('#e6eef7')

export function Vessel({ radius, height, color, anim }: Props) {
  const group = useRef<THREE.Group>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const potMat = useRef<THREE.MeshStandardMaterial>(null)
  const ghostMesh = useRef<THREE.Mesh>(null)
  const soilSide = useRef<THREE.MeshStandardMaterial>(null)
  const soilTop = useRef<THREE.MeshStandardMaterial>(null)
  const soilBottom = useRef<THREE.MeshStandardMaterial>(null)
  const stipple = useRef<THREE.PointsMaterial>(null)
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null)
  const size = useRef({ r: radius, h: height })

  const potGeometry = useMemo(() => new THREE.LatheGeometry(potProfile(), 72), [])
  const soil = useMemo(() => {
    const top = -SOIL_DROP
    const bottom = -(1 - POT_BASE)
    const geo = new THREE.CylinderGeometry(innerRadiusAt(top, 1, 1) - 0.004, innerRadiusAt(bottom, 1, 1) - 0.004, top - bottom, 64, 1)
    geo.translate(0, (top + bottom) / 2, 0)
    return geo
  }, [])

  const stippleGeometry = useMemo(() => {
    let seed = 3
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const pos = new Float32Array(STIPPLE_COUNT * 3)
    for (let i = 0; i < STIPPLE_COUNT; i++) {
      const y = -SOIL_DROP - rnd() * (1 - POT_BASE - SOIL_DROP)
      const r = Math.sqrt(rnd()) * (innerRadiusAt(y, 1, 1) - 0.01)
      const a = rnd() * Math.PI * 2
      pos.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geo
  }, [])

  const textures = useMemo(() => ({ soil: createSoilTexture(), pot: createPotTexture(), shadow: createRadialTexture() }), [])
  const ghostMaterial = useMemo(() => createGhostMaterial(), [])
  useEffect(
    () => () => {
      Object.values(textures).forEach((t) => t.dispose())
      ghostMaterial.dispose()
    },
    [textures, ghostMaterial],
  )

  // The pot colour eases toward `color` in useFrame; JSX only sets the start.
  const [initialColor] = useState(color)
  const targetColor = useMemo(() => new THREE.Color(color), [color])

  useFrame((_, dt) => {
    const a = anim.current
    if (!a || !group.current) return
    const k = 1 - Math.exp(-dt * 4)
    size.current.r += (radius - size.current.r) * k
    size.current.h += (height - size.current.h) * k
    const { r, h } = size.current
    group.current.scale.set(r, h, r)

    const pot = potMat.current
    if (pot) {
      pot.color.lerp(targetColor, k)
      pot.opacity = a.pot
      pot.depthWrite = a.pot > 0.98
      pot.visible = a.pot > 0.005
    }

    const ghost = ghostMesh.current?.material as THREE.ShaderMaterial | undefined
    if (ghost) {
      ghost.uniforms.uOpacity.value = a.ghost
      ghost.uniforms.uColor.value.copy(GHOST_PLANT).lerp(GHOST_ROOT, a.reveal)
      ghost.visible = a.ghost > 0.005
    }

    for (const m of [soilSide.current, soilTop.current, soilBottom.current]) {
      if (!m) continue
      m.opacity = a.soil
      m.depthWrite = a.soil > 0.98
      m.visible = a.soil > 0.01
    }
    if (stipple.current) {
      stipple.current.opacity = a.stipple
      stipple.current.color.copy(a.reveal > 0.5 ? STIPPLE_ROOT : STIPPLE_SOIL)
      stipple.current.visible = a.stipple > 0.01
    }
    if (shadowMat.current) shadowMat.current.opacity = a.shadow

    if (shadow.current) {
      shadow.current.position.y = -h - 0.001
      shadow.current.scale.setScalar(r * 3.4)
    }
  })

  return (
    <>
      <group ref={group}>
        <mesh geometry={potGeometry} castShadow receiveShadow renderOrder={2}>
          <meshStandardMaterial ref={potMat} color={initialColor} map={textures.pot} roughness={0.86} transparent />
        </mesh>
        <mesh ref={ghostMesh} geometry={potGeometry} material={ghostMaterial} renderOrder={4} />
        <mesh geometry={soil} userData={{ region: 'soil' }} receiveShadow renderOrder={1}>
          <meshStandardMaterial ref={soilSide} attach="material-0" color="#3a2b1f" roughness={1} transparent />
          <meshStandardMaterial ref={soilTop} attach="material-1" map={textures.soil} roughness={1} transparent />
          <meshStandardMaterial ref={soilBottom} attach="material-2" color="#3a2b1f" roughness={1} transparent />
        </mesh>
        <points geometry={stippleGeometry} renderOrder={3}>
          <pointsMaterial ref={stipple} color={STIPPLE_ROOT} size={0.0032} transparent depthWrite={false} opacity={0} />
        </points>
      </group>
      <mesh ref={shadow} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={shadowMat} map={textures.shadow} transparent depthWrite={false} />
      </mesh>
    </>
  )
}
