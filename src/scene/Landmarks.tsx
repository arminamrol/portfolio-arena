import type { GroundPosition } from '../run/movement'
import { useRevealed } from '../run/runStore'

// Thin enough that the Hero (standing at y = 0) looks like it stands on it,
// and below the move target marker so the marker still shows on top.
const PLATFORM_HEIGHT = 0.03

// Placeholder Base, Shop and Nexus until the art pass. Each is used once, so
// plain JSX geometries are fine here: there is nothing to share.

export function Base({ position }: { position: GroundPosition }) {
  return (
    <group position={[position.x, 0, position.z]}>
      <Platform color="#8f8a7d" />
    </group>
  )
}

export function Shop({ position }: { position: GroundPosition }) {
  // Hidden until revealed: it would stick up through the Fog (see Towers).
  const revealed = useRevealed(position)
  return (
    <group position={[position.x, 0, position.z]} visible={revealed}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#a0673c" />
      </mesh>
      {/* A cone with 4 radial segments is a pyramid; turned 45° so its edges
          line up with the box. */}
      <mesh position={[0, 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.7, 1, 4]} />
        <meshStandardMaterial color="#b8463a" />
      </mesh>
    </group>
  )
}

export function Nexus({ position }: { position: GroundPosition }) {
  // Hidden until revealed: it would stick up through the Fog (see Towers).
  const revealed = useRevealed(position)
  return (
    <group position={[position.x, 0, position.z]} visible={revealed}>
      <Platform color="#5d5870" />
      <mesh position={[0, 2.5, 0]} castShadow>
        <octahedronGeometry args={[1.5]} />
        {/* emissive is light the surface gives off itself: it is added on
            top of the lit colour, so the crystal glows even on its shadowed
            side. It does not light anything around it. */}
        <meshStandardMaterial color="#9d7be0" emissive="#3b2470" />
      </mesh>
    </group>
  )
}

// A round slab the Base and Nexus stand on, centred on its parent group.
function Platform({ color }: { color: string }) {
  return (
    <mesh position={[0, PLATFORM_HEIGHT / 2, 0]} receiveShadow>
      <cylinderGeometry args={[3, 3, PLATFORM_HEIGHT, 32]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  )
}
