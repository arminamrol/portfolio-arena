import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Color, DataTexture, LinearFilter, PlaneGeometry, RedFormat, ShaderMaterial } from 'three'
import { GROUND_SIZE } from '../map/mapLayout'
import { FOG_CELLS, type Fog as FogCells } from '../run/fog'
import { runStore } from '../run/runStore'

// Above the Lanes, Lane labels and platforms (0.03), below the move target
// marker (0.04), so a click into the Fog still shows where the Hero is going.
const FOG_HEIGHT = 0.035
// The Fog's colour. The scene uses it as its background too, so unexplored
// ground fades into the void around the map.
export const FOG_COLOR = '#1d2330'

// A DataTexture is a texture whose pixels come from a typed array we fill
// ourselves, instead of an image. One texel per Fog cell, in the same order
// as the Run store's grid (row 0 first), so cells copy across one for one.
// RedFormat stores a single 8-bit channel per texel: 0 reads as 0.0 in the
// shader, 255 as 1.0. Our cells are 0 or 1, so we scale them to 0 or 255.
const texels = new Uint8Array(FOG_CELLS * FOG_CELLS)
const fogTexture = new DataTexture(texels, FOG_CELLS, FOG_CELLS, RedFormat)
// LinearFilter blends the four nearest texels when sampling between texel
// centres (bilinear filtering). That turns the hard square cell edges into
// a soft ramp one cell wide: the blur we want, for free, on the GPU.
fogTexture.magFilter = LinearFilter
fogTexture.minFilter = LinearFilter
// WebGL assumes by default that each row of texels starts on a 4-byte
// boundary. Our rows are FOG_CELLS single bytes, so tell it rows are
// tightly packed; otherwise any width not divisible by 4 would skew rows.
fogTexture.unpackAlignment = 1

// A ShaderMaterial is a material whose GPU programs we write ourselves, in
// GLSL. The vertex shader runs once per vertex and places it on screen; the
// fragment shader runs once per pixel the mesh covers and returns its colour.
// Three.js prepends the usual declarations (projectionMatrix, modelMatrix,
// position, ...) for us.
const fogMaterial = new ShaderMaterial({
  // Uniforms are values the same for every vertex and pixel of a draw call,
  // set from JavaScript. A texture uniform becomes a sampler2D in GLSL.
  uniforms: {
    fogMap: { value: fogTexture },
    fogColor: { value: new Color(FOG_COLOR) },
    groundSize: { value: GROUND_SIZE },
  },
  vertexShader: /* glsl */ `
    uniform float groundSize;
    // A varying is written per vertex and read per pixel, interpolated
    // across the triangle in between.
    varying vec2 vFogUv;

    void main() {
      // World position of this vertex: the model matrix applies the mesh's
      // transform (here, the -90° tip that lays the plane flat).
      vec4 world = modelMatrix * vec4(position, 1.0);
      // The texture's u runs along world x and v along world z, 0 at the
      // map's -x/-z edges and 1 at the +x/+z edges, matching the grid.
      vFogUv = world.xz / groundSize + 0.5;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D fogMap;
    uniform vec3 fogColor;
    varying vec2 vFogUv;

    void main() {
      // 0 in the Fog, 1 where revealed, a ramp in between from the filter.
      float revealed = texture2D(fogMap, vFogUv).r;
      // smoothstep eases the straight ramp into an S-curve, so the edge
      // reads as a soft glow rather than a linear gradient.
      gl_FragColor = vec4(fogColor, 1.0 - smoothstep(0.0, 1.0, revealed));
      // Converts our sRGB colour the way built-in materials do.
      #include <colorspace_fragment>
    }
  `,
  // The alpha above only blends with what is behind when transparent is on.
  // depthWrite off: the plane is a see-through veil and must not stop
  // transparent things drawn after it (the Ability effects) from showing.
  transparent: true,
  depthWrite: false,
})

const fogGeometry = new PlaneGeometry(GROUND_SIZE, GROUND_SIZE)

// Darkness over the ground the Hero has not explored. A single flat plane
// on layer 0, so the main camera and the minimap camera both draw it, and
// the minimap shows exactly the Fog the world shows. Tall things (Towers,
// the Nexus) stick up through it, so those hide themselves until revealed.
export function Fog() {
  // The grid we last copied into the texture. The Run store makes a new
  // array only when more is revealed, so comparing references tells us
  // when to upload, without re-rendering React.
  const uploaded = useRef<FogCells | null>(null)

  useFrame(() => {
    const { fog } = runStore.getState()
    if (fog === uploaded.current) return
    for (let i = 0; i < fog.length; i++) texels[i] = fog[i] * 255
    // Tells Three.js to send the new texels to the GPU before the next draw.
    // Re-uploading a byte per cell is cheap, and happens only while new ground is
    // being revealed.
    fogTexture.needsUpdate = true
    uploaded.current = fog
  })

  return (
    // Transparent objects are drawn after opaque ones, sorted back to front
    // by distance from the camera. The Lane labels are transparent too and
    // lie just under the Fog; sorting could draw one after the Fog, over it.
    // A higher renderOrder always draws the Fog after them.
    <mesh geometry={fogGeometry} material={fogMaterial} rotation={[-Math.PI / 2, 0, 0]} position={[0, FOG_HEIGHT, 0]} renderOrder={1} />
  )
}
