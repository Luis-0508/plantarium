import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, type RefObject } from 'react'
import * as THREE from 'three'
import { anchorElement } from './anchorRegistry'

export interface AnchorItem {
  id: string
  position: [number, number, number]
}

const v = new THREE.Vector3()

/**
 * Projects `items` (in the local space of `object`, or world space) onto their
 * registered DOM elements. This avoids one React root per label (as drei's
 * Html would create) and keeps the labels in the accessible DOM tree.
 */
export function ScreenAnchors({ items, object }: { items: AnchorItem[]; object?: RefObject<THREE.Object3D | null> }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useEffect(
    () => () => {
      for (const item of items) {
        const el = anchorElement(item.id)
        if (el) el.style.visibility = 'hidden'
      }
    },
    [items],
  )

  useFrame(() => {
    const parent = object?.current
    for (const item of items) {
      const el = anchorElement(item.id)
      if (!el) continue
      v.set(...item.position)
      if (parent) parent.localToWorld(v)
      v.project(camera)
      const visible = v.z < 1 && v.z > -1
      el.style.visibility = visible ? 'visible' : 'hidden'
      if (!visible) continue
      const x = ((v.x + 1) / 2) * size.width
      const y = ((1 - v.y) / 2) * size.height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }
  })

  return null
}
