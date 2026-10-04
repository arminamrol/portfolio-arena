import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useDisplayProfile } from '../display/displayProfile'
import type { GroundPosition } from '../run/movement'
import { useRevealed } from '../run/runStore'
import { Model } from './Model'

// Footprint of the round pad the Base and Nexus stand on, in world units.
const PAD_WIDTH = 4.5
const NEXUS_CRYSTAL_HEIGHT = 4.5
const SHOP_WIDTH = 2.6
// How fast the Nexus crystal turns, in radians per second.
const NEXUS_SPIN = 0.4

export function Base({ position }: { position: GroundPosition }) {
  return (
    <group position={[position.x, 0, position.z]}>
      <Model name="pad" size={{ width: PAD_WIDTH }} />
    </group>
  )
}

export function Shop({ position }: { position: GroundPosition }) {
  // Hidden until revealed: it would stick up through the Fog (see Towers).
  const revealed = useRevealed(position)
  return (
    // Turned to face the Base, down and to the left on screen.
    <group position={[position.x, 0, position.z]} rotation={[0, -Math.PI / 4, 0]} visible={revealed}>
      <Model name="shop" size={{ width: SHOP_WIDTH }} />
    </group>
  )
}

export function Nexus({ position }: { position: GroundPosition }) {
  // Hidden until revealed: it would stick up through the Fog (see Towers).
  const revealed = useRevealed(position)
  const crystal = useRef<Group>(null)
  // A slow, endless spin is ambient motion: under reduced motion the
  // crystal holds still.
  const { reducedMotion } = useDisplayProfile()

  useFrame((_, delta) => {
    if (crystal.current && !reducedMotion) crystal.current.rotation.y += NEXUS_SPIN * delta
  })

  return (
    <group position={[position.x, 0, position.z]} visible={revealed}>
      <Model name="pad" size={{ width: PAD_WIDTH }} />
      <group ref={crystal}>
        <Model name="nexus" size={{ height: NEXUS_CRYSTAL_HEIGHT }} />
      </group>
    </group>
  )
}

