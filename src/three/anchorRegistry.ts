/**
 * DOM labels live in the regular React tree (ui/StageOverlay) and register
 * their element here; the canvas-side ScreenAnchors projects 3D anchors onto
 * them every frame. Kept free of three.js imports so the UI bundle stays small.
 */
const elements = new Map<string, HTMLElement>()

export function anchorRef(id: string) {
  return (el: HTMLElement | null) => {
    if (el) elements.set(id, el)
    else elements.delete(id)
  }
}

export const anchorElement = (id: string) => elements.get(id)

export const hotspotId = (region: string) => `hotspot-${region}`
