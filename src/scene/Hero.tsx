import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, type Group } from 'three'
import { stepToward } from '../run/movement'
import { runStore } from '../run/runStore'

// World units per second.
const HERO_SPEED = 6
// How quickly the Hero turns to face its target (higher = snappier).
const TURN_SHARPNESS = 12

export function Hero() {
  const ref = useRef<Group>(null)
  const start = runStore.getState().heroPosition
  // The yaw the Hero is turning toward. Kept outside the store so the turn
  // can finish after the Hero arrives and the move target is cleared.
  const facing = useRef(0)

  // useFrame runs inside R3F's render loop, once per frame before rendering.
  // `delta` is the seconds since the last frame (~0.016 at 60 fps, ~0.007 at
  // 144 fps). Multiplying speeds by delta makes motion depend on elapsed time,
  // not on how many frames the machine manages to draw.
  //
  // We read the store with getState() and mutate the Object3D directly:
  // no setState, so React does not re-render 60 times a second.
  useFrame((_, delta) => {
    const hero = ref.current
    if (!hero) return
    const { heroPosition, moveTarget, heroMovedTo } = runStore.getState()

    if (moveTarget) {
      // Yaw that points the Hero's +Z face at the target. atan2(x, z) (not the
      // usual atan2(y, x)) because a rotation of 0 around Y faces +Z.
      const dx = moveTarget.x - heroPosition.x
      const dz = moveTarget.z - heroPosition.z
      if (dx !== 0 || dz !== 0) facing.current = Math.atan2(dx, dz)

      const next = stepToward(heroPosition, moveTarget, HERO_SPEED * delta)
      heroMovedTo(next)
      hero.position.set(next.x, 0, next.z)
    }

    hero.rotation.y = turnToward(hero.rotation.y, facing.current, TURN_SHARPNESS, delta)
  })

  return (
    // A Group is an empty Object3D: no geometry, just a transform. Moving and
    // rotating the group carries its children along (the scene graph), so the
    // body and nose never need their own movement code.
    <group ref={ref} position={[start.x, 0, start.z]}>
      {/* Placeholder box until the art pass. Raised by half its height so it
          rests on the ground (a box's origin is its centre). */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial color="#d9a441" />
      </mesh>
      {/* Nose on the +Z face so you can see which way the Hero is facing. */}
      <mesh position={[0, 1.1, 0.6]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#7a4f12" />
      </mesh>
    </group>
  )
}

// Eases an angle toward a target along the shorter way round. Without the
// wrap, turning from 170° to -170° would spin 340° instead of 20°.
function turnToward(current: number, target: number, sharpness: number, delta: number) {
  const diff = MathUtils.euclideanModulo(target - current + Math.PI, Math.PI * 2) - Math.PI
  // damp() is frame-rate-independent lerp: it closes the same fraction of the
  // gap per second no matter how the second is sliced into frames.
  return MathUtils.damp(current, current + diff, sharpness, delta)
}
