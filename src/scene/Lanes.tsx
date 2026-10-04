import { useEffect, useMemo } from 'react'
import { BoxGeometry, CanvasTexture, MeshStandardMaterial, SRGBColorSpace } from 'three'
import type { LaneLayout } from '../map/mapLayout'
import type { GroundPosition } from '../run/movement'
import { mainViewOnlyLayers } from './layers'

const LANE_WIDTH = 2
const LANE_THICKNESS = 0.02
// World units from the bottom to the top of a label's text box.
const LABEL_HEIGHT = 1.4

// Created once and shared by every lane segment. A geometry is only vertex
// data uploaded to the GPU; where a mesh appears and how big it is comes from
// the mesh's own transform. So one 1×1×1 box, scaled per segment, replaces a
// new BoxGeometry (and a new GPU buffer) for each segment. Same for the
// material: one material means one compiled shader program, reused.
// R3F only disposes what it creates from JSX, so objects made by hand like
// these are ours to manage; as module-level singletons they live as long as
// the page.
const segmentGeometry = new BoxGeometry(1, 1, 1)
const laneMaterial = new MeshStandardMaterial({ color: '#b39a6b', roughness: 1 })

export function Lanes({ lanes }: { lanes: LaneLayout[] }) {
  return (
    <>
      {lanes.map((lane) => (
        <group key={lane.key}>
          {lane.path.slice(1).map((to, i) => (
            <LaneSegment key={i} from={lane.path[i]} to={to} />
          ))}
          <LaneLabel text={lane.label} position={lane.labelPosition} />
        </group>
      ))}
    </>
  )
}

function LaneSegment({ from, to }: { from: GroundPosition; to: GroundPosition }) {
  const dx = to.x - from.x
  const dz = to.z - from.z
  // Extending each segment by the lane width fills the gap that would open on
  // the outside of a corner where two segments meet.
  const length = Math.hypot(dx, dz) + LANE_WIDTH

  return (
    <mesh
      geometry={segmentGeometry}
      material={laneMaterial}
      // The box's centre goes at the segment's midpoint, half its thickness
      // up so it rests on the ground.
      position={[(from.x + to.x) / 2, LANE_THICKNESS / 2, (from.z + to.z) / 2]}
      // Turn the box's local +Z (its length) to point along the segment;
      // atan2(x, z) for the same reason as the Hero's facing.
      rotation={[0, Math.atan2(dx, dz), 0]}
      // Scale is applied before rotation, in the box's own axes:
      // x = width, y = thickness, z = length.
      scale={[LANE_WIDTH, LANE_THICKNESS, length]}
      receiveShadow
    />
  )
}

function LaneLabel({ text, position }: { text: string; position: GroundPosition }) {
  const texture = useMemo(() => createLabelTexture(text), [text])
  // Unlike the shared geometry above, this texture belongs to one label, so
  // it is freed (its GPU copy deleted) when the label goes away.
  useEffect(() => () => texture.dispose(), [texture])
  const { width, height } = texture.image as HTMLCanvasElement

  return (
    // Parent/child transforms: the group stands at the label's spot and turns
    // 45° around Y, so its local +X points to the right of the screen
    // (world (1, 0, -1)). The child plane is tipped -90° around X to lie flat.
    // Rotations stack through the parent, so the text lies on the ground
    // *and* reads left to right on screen; the plane never needs to know.
    // It floats just above the lane, but below the move target marker, and
    // is left off the minimap, where it would be too small to read.
    <group position={[position.x, LANE_THICKNESS + 0.01, position.z]} rotation={[0, Math.PI / 4, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} layers={mainViewOnlyLayers}>
        <planeGeometry args={[(LABEL_HEIGHT * width) / height, LABEL_HEIGHT]} />
        {/* The texture is sampled across the plane's UVs (0..1 corner to
            corner). transparent lets the canvas's clear pixels show the lane
            through; depthWrite off stops those clear pixels hiding things
            drawn after them. MeshBasicMaterial ignores lights, so the text
            stays readable in shadow. */}
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

// Draws the text onto an offscreen 2D canvas and wraps it in a texture: the
// hand-written version of what a text helper library would do for us.
function createLabelTexture(text: string) {
  const fontSize = 64
  const font = `bold ${fontSize}px system-ui, sans-serif`
  const padding = fontSize * 0.4

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2D canvas is not available')
  context.font = font
  canvas.width = Math.ceil(context.measureText(text).width + padding * 2)
  canvas.height = Math.ceil(fontSize * 1.6)

  // Resizing a canvas resets its drawing state, so set the font again.
  context.font = font
  context.fillStyle = 'rgba(20, 24, 33, 0.6)'
  context.beginPath()
  context.roundRect(0, 0, canvas.width, canvas.height, canvas.height / 2)
  context.fill()
  context.fillStyle = '#f4ecd8'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new CanvasTexture(canvas)
  // The canvas holds ordinary sRGB colours; telling Three.js so makes it
  // convert them correctly instead of washing them out.
  texture.colorSpace = SRGBColorSpace
  // The label is seen at a grazing angle; anisotropic filtering keeps the
  // foreshortened text sharp instead of blurry.
  texture.anisotropy = 8
  return texture
}
