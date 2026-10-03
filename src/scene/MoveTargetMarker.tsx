import { useRunStore } from '../run/runStore'

export function MoveTargetMarker() {
  // Subscribing with a selector: this component re-renders only when the
  // move target changes (a click, or the Hero arriving), never per frame.
  const target = useRunStore((state) => state.moveTarget)
  if (!target) return null

  return (
    // Lifted a hair above the ground and the Lanes so the coplanar surfaces
    // don't fight over the same depth-buffer values ("z-fighting" flicker).
    <mesh position={[target.x, 0.04, target.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.35, 0.5, 32]} />
      <meshBasicMaterial color="#f2e394" />
    </mesh>
  )
}
