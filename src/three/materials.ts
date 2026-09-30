import * as THREE from 'three'

/** Shared uniforms so every swaying material reads the same clock. */
export const windUniforms = {
  uTime: { value: 0 },
  uWind: { value: 1 },
}

/**
 * Shader hooks for foliage, passed as material props: a gentle,
 * height-weighted sway (a continuous function of position, so attached parts
 * like rachis and leaflets move together) plus cheap back-face translucency.
 */
export function foliageShader(height: number) {
  const onBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = windUniforms.uTime
    shader.uniforms.uWind = windUniforms.uWind
    shader.uniforms.uWindHeight = { value: height }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;\nuniform float uWindHeight;')
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
        float windH = clamp(position.y / uWindHeight, 0.0, 1.4);
        float sway = windH * windH * uWind * uWindHeight * 0.035;
        transformed.x += (sin(uTime * 0.9 + position.z * 2.5) + 0.35 * sin(uTime * 2.1 + position.x * 9.0 + position.z * 7.0)) * sway;
        transformed.z += cos(uTime * 0.75 + position.x * 2.5) * sway * 0.8;
        transformed.y += sin(uTime * 1.6 + position.x * 8.0) * sway * 0.25;`,
      )
    // Cheap translucency: back faces of thin leaves pick up some of their own
    // colour instead of going nearly black, as light would pass through them.
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n  if (!gl_FrontFacing) totalEmissiveRadiance += diffuseColor.rgb * 0.16;',
    )
  }
  return { onBeforeCompile, customProgramCacheKey: () => `foliage-${height.toFixed(3)}` }
}

/** View-dependent rim glow: reads like a glass vitrine or an X-ray outline. */
export function createGhostMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color('#e6eef7') },
      uOpacity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.2);
        gl_FragColor = vec4(uColor, (0.05 + f * 0.85) * uOpacity);
      }`,
  })
}

/** Procedural top-dressing texture: humus, perlite specks, bark chips. */
export function createSoilTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#3b2c20'
  ctx.fillRect(0, 0, size, size)
  let seed = 11
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 2600; i++) {
    const shade = 30 + rnd() * 40
    ctx.fillStyle = `rgb(${shade + 18}, ${shade + 6}, ${shade - 6})`
    ctx.beginPath()
    ctx.arc(rnd() * size, rnd() * size, 1 + rnd() * 5, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = rnd() < 0.5 ? '#6e4a2e' : '#80593a'
    ctx.save()
    ctx.translate(rnd() * size, rnd() * size)
    ctx.rotate(rnd() * Math.PI)
    ctx.fillRect(-6, -3, 8 + rnd() * 10, 4 + rnd() * 4)
    ctx.restore()
  }
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = rnd() < 0.7 ? '#e9e6dc' : '#cfcac0'
    ctx.beginPath()
    ctx.arc(rnd() * size, rnd() * size, 1.2 + rnd() * 2.8, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/**
 * Stoneware finish for the pot: near-white so the material colour shows
 * through, with fine iron speckle and faint throwing rings (v runs along the
 * lathe profile).
 */
export function createPotTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f4f2ee'
  ctx.fillRect(0, 0, size, size)
  let seed = 29
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let y = 0; y < size; y += 3) {
    ctx.fillStyle = `rgba(90, 80, 70, ${0.02 + rnd() * 0.035})`
    ctx.fillRect(0, y, size, 1)
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(70, 58, 48, ${0.15 + rnd() * 0.35})`
    ctx.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 1.2, 1 + rnd() * 1.2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.repeat.set(3, 1)
  return texture
}

/** Soft radial falloff used for the grounding shadow under the pot. */
export function createRadialTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(24,35,30,0.55)')
  g.addColorStop(0.45, 'rgba(24,35,30,0.22)')
  g.addColorStop(1, 'rgba(24,35,30,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}
