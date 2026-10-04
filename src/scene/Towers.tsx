import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Mesh, MeshStandardMaterial, RingGeometry, type Group, type MeshBasicMaterial, type Object3D } from 'three'
import { getModel, modelInstance } from '../assets/loadModels'
import type { LaneLayout, TowerLayout } from '../map/mapLayout'
import { TOWER_RANGE, useRevealed, useRunStore } from '../run/runStore'

// World units from a Tower's foot to the tip of its roof.
const TOWER_HEIGHT = 3.8
// Seconds the Capture effect lasts.
const CAPTURE_DURATION = 0.8
// How much bigger the Tower briefly grows at the peak of a Capture.
const CAPTURE_POP = 0.25

// A thin ring the size of the Tower's range; the Capture effect scales it.
// Shared by every Tower: adding a Resume Entry adds a mesh, not new GPU
// buffers (see Lanes.tsx).
const rangeRingGeometry = new RingGeometry(TOWER_RANGE - 0.15, TOWER_RANGE, 48)

// The Tower model's material, and a gold-glowing copy of it for Captured
// Towers. Swapping a mesh's material is cheap: both shader programs are
// compiled once and reused, so a Captured Tower costs nothing extra to draw.
// Made on first use, since the model has to have loaded.
let materials: { normal: MeshStandardMaterial; captured: MeshStandardMaterial } | null = null
function towerMaterials() {
  if (!materials) {
    const normal = standardMaterialOf(getModel('tower').scene)
    const captured = normal.clone()
    // emissive is light the surface gives off itself, added on top of the
    // lit colour: the whole Tower glows warm, even on its shadowed side.
    captured.emissive.set('#a8781c')
    captured.emissiveIntensity = 0.45
    materials = { normal, captured }
  }
  return materials
}

function standardMaterialOf(object: Object3D): MeshStandardMaterial {
  const found = new Set<MeshStandardMaterial>()
  object.traverse((child) => {
    if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) found.add(child.material)
  })
  const [material, ...others] = found
  if (!material || others.length > 0) throw new Error('Expected the Tower model to use exactly one material')
  return material
}

function setMaterial(object: Object3D, material: MeshStandardMaterial) {
  object.traverse((child) => {
    if (child instanceof Mesh) child.material = material
  })
}

// One Tower per Resume Entry, standing where the map layout put them.
export function Towers({ lanes }: { lanes: LaneLayout[] }) {
  return (
    <>
      {lanes.flatMap((lane) =>
        lane.towers.map((tower) => <Tower key={tower.entryId} tower={tower} />),
      )}
    </>
  )
}

function Tower({ tower }: { tower: TowerLayout }) {
  // Re-renders only when this Tower's Captured flag flips, i.e. once.
  const captured = useRunStore((state) => state.captures.has(tower.entryId))
  const revealed = useRevealed(tower.position)
  const body = useRef<Group>(null)
  const ring = useRef<Mesh>(null)
  const ringMaterial = useRef<MeshBasicMaterial>(null)
  // The tween's clock: 0 at the moment of Capture, 1 when the effect is
  // over. Starts finished, so nothing plays until a Capture.
  const progress = useRef(1)
  const [model] = useState(() => modelInstance('tower', { height: TOWER_HEIGHT }))

  useEffect(() => {
    const { normal, captured: glowing } = towerMaterials()
    setMaterial(model, captured ? glowing : normal)
  }, [model, captured])

  // Play on the change from un-Captured to Captured only, not whenever this
  // component mounts already Captured (hot reload, StrictMode's remount).
  const wasCaptured = useRef(captured)
  useEffect(() => {
    if (captured && !wasCaptured.current) progress.current = 0
    wasCaptured.current = captured
  }, [captured])

  // A tween is a number walked from 0 to 1 over a fixed time, then mapped
  // onto properties. Advancing it by delta / duration makes it last the same
  // wall-clock time at any frame rate. We write straight to the Object3Ds
  // and material, never to React state, so nothing re-renders per frame.
  useFrame((_, delta) => {
    if (progress.current >= 1 || !body.current || !ring.current || !ringMaterial.current) return
    progress.current = Math.min(1, progress.current + delta / CAPTURE_DURATION)
    const t = progress.current
    // Ease-out cubic: fast at first, settling gently at the end.
    const eased = 1 - (1 - t) ** 3

    // A shockwave: the ring grows out of the Tower's foot and fades away.
    ring.current.visible = t < 1
    ring.current.scale.setScalar(0.2 + eased * 1.3)
    ringMaterial.current.opacity = 1 - eased

    // A pop: sin over 0..π rises then falls back to 0, so the Tower swells
    // and returns exactly to its normal size when the tween ends.
    body.current.scale.setScalar(1 + Math.sin(t * Math.PI) * CAPTURE_POP)
  })

  return (
    // Each Tower is a group: placing the group places all its parts, and the
    // parts' positions below are relative to the Tower's foot.
    // The Fog is a flat veil and the Tower sticks up through it, so the
    // Tower hides itself until its spot is revealed. `visible` is inherited:
    // hiding the group skips drawing (and shadow-casting) every child.
    <group position={[tower.position.x, 0, tower.position.z]} visible={revealed}>
      <group ref={body}>
        <primitive object={model} />
      </group>
      {/* Laid flat like the move target marker, just above the Lanes. */}
      <mesh ref={ring} geometry={rangeRingGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} visible={false}>
        {/* transparent: true is what makes the GPU blend by opacity; without
            it, opacity is ignored. depthWrite off so the fading ring never
            hides what is drawn after it. Each Tower gets its own material
            here, because each fades on its own. */}
        <meshBasicMaterial ref={ringMaterial} color="#f2e394" transparent depthWrite={false} />
      </mesh>
    </group>
  )
}
