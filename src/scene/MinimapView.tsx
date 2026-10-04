import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { CircleGeometry, MeshBasicMaterial, PlaneGeometry, type BufferGeometry, type Group } from 'three'
import { GROUND_SIZE, type MapLayout, type TowerLayout } from '../map/mapLayout'
import { useDisplayProfile } from '../display/displayProfile'
import { minimapCamera, minimapPlacement, minimapViewport } from '../minimap/minimapCamera'
import type { GroundPosition } from '../run/movement'
import { runStore, useRevealed, useRunStore } from '../run/runStore'
import { MAIN_VIEW_LAYER, minimapOnlyLayers } from './layers'

// Icons float well above the tallest model (the Nexus crystal), so from
// straight above they are always in front; the Hero's icon is highest of all.
const ICON_HEIGHT = 10
const HERO_ICON_HEIGHT = 11
// Built in the XY plane like the ground; tipped flat to face the camera above.
const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0]
// The minimap always shows the whole ground, so a world-sized icon would
// shrink on it as the ground grows. Icon sizes below are in ICON_UNITs, a
// fortieth of the ground's side, so each icon keeps its size on the minimap.
const ICON_UNIT = GROUND_SIZE / 40

// Unlit materials: icons are flat symbols, not lit objects. Shared, as in
// Towers.tsx, so every icon reuses the same GPU buffers and shader program.
const towerIconGeometry = new CircleGeometry(ICON_UNIT, 16)
const heroIconGeometry = new CircleGeometry(1.1 * ICON_UNIT, 16)
const heroOutlineGeometry = new CircleGeometry(1.5 * ICON_UNIT, 16)
const shopIconGeometry = new PlaneGeometry(2.4 * ICON_UNIT, 2.4 * ICON_UNIT)
// A circle with 4 segments has a vertex on each axis: a diamond.
const nexusIconGeometry = new CircleGeometry(2 * ICON_UNIT, 4)
const towerIconMaterial = new MeshBasicMaterial({ color: '#5a7bb5' })
const capturedTowerIconMaterial = new MeshBasicMaterial({ color: '#e0b84a' })
const heroIconMaterial = new MeshBasicMaterial({ color: '#ffe9a8' })
const heroOutlineMaterial = new MeshBasicMaterial({ color: '#1d2330' })
const shopIconMaterial = new MeshBasicMaterial({ color: '#b8463a' })
const nexusIconMaterial = new MeshBasicMaterial({ color: '#9d7be0' })

// Draws the minimap: the same scene seen again from the top-down
// minimapCamera, into the bottom-right square of the canvas.
export function MinimapView({ layout }: { layout: MapLayout }) {
  const camera = useThree((state) => state.camera)
  const placement = minimapPlacement(useDisplayProfile())
  // The main camera sees layer 0 by default; add the main-view-only layer.
  useLayoutEffect(() => {
    camera.layers.enable(MAIN_VIEW_LAYER)
    return () => camera.layers.disable(MAIN_VIEW_LAYER)
  }, [camera])

  // A useFrame with a priority above 0 tells R3F "I render this frame": it
  // stops calling gl.render itself, and runs this after every priority-0
  // useFrame (Hero movement, camera follow), so both pictures show this
  // frame's positions.
  useFrame(({ gl, scene, camera, size }) => {
    // 1. The main view, over the whole canvas. Viewport and scissor are in
    //    CSS pixels; the renderer multiplies them by the pixel ratio.
    gl.setScissorTest(false)
    gl.setViewport(0, 0, size.width, size.height)
    gl.render(scene, camera)

    // 2. The minimap. The viewport is where the camera's picture is mapped:
    //    NDC -1..1 is stretched over this rectangle instead of the canvas.
    //    It does not stop drawing outside it, though, and clearing ignores
    //    it entirely, so the scissor test clips every pixel write (the clear
    //    included) to the same rectangle. WebGL counts y from the bottom, so
    //    "bottom right" is a small y and "top right" a large one.
    const { x, y, size: side } = minimapViewport(placement, size.width, size.height)
    gl.setViewport(x, y, side, side)
    gl.setScissor(x, y, side, side)
    gl.setScissorTest(true)
    // Shadow maps depend on the lights, not on the camera looking, so the
    // ones the main pass just rendered are still valid. Without this, every
    // render() call would redraw them: a second, invisible shadow pass.
    gl.shadowMap.autoUpdate = false
    // Scene fog fades by distance from the camera; the minimap camera hangs
    // high above the map, so it would haze the whole minimap. A map should
    // be crisp, so the minimap is drawn without it.
    const haze = scene.fog
    scene.fog = null
    gl.render(scene, minimapCamera)
    scene.fog = haze
    gl.shadowMap.autoUpdate = true
    gl.setScissorTest(false)
  }, 1)

  return (
    <>
      <MinimapIcon geometry={shopIconGeometry} material={shopIconMaterial} position={layout.shop} />
      <MinimapIcon geometry={nexusIconGeometry} material={nexusIconMaterial} position={layout.nexus} />
      {layout.lanes.flatMap((lane) => lane.towers.map((tower) => <TowerIcon key={tower.entryId} tower={tower} />))}
      <HeroIcon />
    </>
  )
}

function TowerIcon({ tower }: { tower: TowerLayout }) {
  // Turns gold on Capture, like the Tower's roof.
  const captured = useRunStore((state) => state.captures.has(tower.entryId))
  return <MinimapIcon geometry={towerIconGeometry} material={captured ? capturedTowerIconMaterial : towerIconMaterial} position={tower.position} />
}

type MinimapIconProps = {
  geometry: BufferGeometry
  material: MeshBasicMaterial
  position: GroundPosition
}

// A flat symbol over a spot on the map, seen by the minimap camera only.
// Icons float above the Fog plane, so each hides until its spot is revealed,
// like the structure it stands for.
function MinimapIcon({ geometry, material, position }: MinimapIconProps) {
  const revealed = useRevealed(position)
  return <mesh geometry={geometry} material={material} layers={minimapOnlyLayers} rotation={FLAT} position={[position.x, ICON_HEIGHT, position.z]} visible={revealed} />
}

function HeroIcon() {
  const ref = useRef<Group>(null)
  const start = runStore.getState().heroPosition

  // Follows the Hero the same way Hero.tsx moves: straight to the Object3D,
  // never through React state.
  useFrame(() => {
    const { heroPosition } = runStore.getState()
    ref.current?.position.set(heroPosition.x, HERO_ICON_HEIGHT, heroPosition.z)
  })

  // Layers are per object, not inherited from the group: each mesh needs
  // its own. The outline sits a little lower, so the fill draws over it.
  return (
    <group ref={ref} position={[start.x, HERO_ICON_HEIGHT, start.z]}>
      <mesh geometry={heroOutlineGeometry} material={heroOutlineMaterial} layers={minimapOnlyLayers} rotation={FLAT} position={[0, -0.1, 0]} />
      <mesh geometry={heroIconGeometry} material={heroIconMaterial} layers={minimapOnlyLayers} rotation={FLAT} />
    </group>
  )
}
