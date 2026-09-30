import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import type { StageAnim } from '../viewTypes'
import { createGhostMaterial, createRadialTexture, createSoilTexture } from './materials'
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
export function Vessel({ radius, height, color, anim }: Props) {
  const group = useRef<THREE.Group>(null)
  const shadow = useRef<THREE.Mesh>(null)
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

  const mats = useMemo(() => {
    const soilTexture = createSoilTexture()
    return {
      pot: new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, transparent: true }),
      ghost: createGhostMaterial(),
      soilSide: new THREE.MeshStandardMaterial({ color: '#3a2b1f', roughness: 1, transparent: true }),
      soilTop: new THREE.MeshStandardMaterial({ map: soilTexture, roughness: 1, transparent: true }),
      stipple: new THREE.PointsMaterial({ color: '#dfe7ef', size: 0.0032, transparent: true, depthWrite: false, opacity: 0 }),
      shadow: new THREE.MeshBasicMaterial({ map: createRadialTexture(), transparent: true, depthWrite: false }),
    }
    // Created once; the pot colour is eased toward `color` in useFrame.
  }, [])

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => {
        ;(m as THREE.MeshStandardMaterial).map?.dispose()
        m.dispose()
      })
    },
    [mats],
  )

  const targetColor = useMemo(() => new THREE.Color(color), [color])
  const ghostPlant = useMemo(() => new THREE.Color('#33443b'), [])
  const ghostRoot = useMemo(() => new THREE.Color('#e6eef7'), [])

  useFrame((_, dt) => {
    const a = anim.current
    if (!a || !group.current) return
    const k = 1 - Math.exp(-dt * 4)
    size.current.r += (radius - size.current.r) * k
    size.current.h += (height - size.current.h) * k
    const { r, h } = size.current
    group.current.scale.set(r, h, r)

    mats.pot.color.lerp(targetColor, k)
    mats.pot.opacity = a.pot
    mats.pot.depthWrite = a.pot > 0.98
    mats.pot.visible = a.pot > 0.005

    const ghostUniforms = (mats.ghost as THREE.ShaderMaterial).uniforms
    ghostUniforms.uOpacity.value = a.ghost
    ghostUniforms.uColor.value.copy(ghostPlant).lerp(ghostRoot, a.reveal)
    mats.ghost.visible = a.ghost > 0.005

    for (const m of [mats.soilSide, mats.soilTop]) {
      m.opacity = a.soil
      m.depthWrite = a.soil > 0.98
    }
    mats.soilSide.visible = a.soil > 0.01
    mats.stipple.opacity = a.stipple
    mats.stipple.color.set(a.reveal > 0.5 ? '#dfe7ef' : '#4a3a2c')
    mats.stipple.visible = a.stipple > 0.01
    mats.shadow.opacity = a.shadow

    if (shadow.current) {
      shadow.current.position.y = -h - 0.001
      shadow.current.scale.setScalar(r * 3.4)
    }
  })

  return (
    <>
      <group ref={group}>
        <mesh geometry={potGeometry} material={mats.pot} castShadow receiveShadow renderOrder={2} />
        <mesh geometry={potGeometry} material={mats.ghost} renderOrder={4} />
        <mesh geometry={soil} material={[mats.soilSide, mats.soilTop, mats.soilSide]} userData={{ region: 'soil' }} receiveShadow renderOrder={1} />
        <points geometry={stippleGeometry} material={mats.stipple} renderOrder={3} />
      </group>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} material={mats.shadow}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </>
  )
}
