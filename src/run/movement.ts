// World units per second the Hero walks: Base to Nexus along the mid Lane
// in about eight and a half seconds.
export const HERO_SPEED = 8

// A point on the ground. The ground is the world XZ plane (Three.js is Y-up),
// so a ground position needs only x and z; height is the scene's concern.
export type GroundPosition = { x: number; z: number }

// Moves `from` toward `to` by at most `maxDistance`, landing exactly on `to`
// rather than overshooting it. Callers pass `speed * delta` so the Hero covers
// the same ground per second at 30 fps or 144 fps.
export function stepToward(from: GroundPosition, to: GroundPosition, maxDistance: number): GroundPosition {
  const dx = to.x - from.x
  const dz = to.z - from.z
  const remaining = Math.hypot(dx, dz)
  if (remaining <= maxDistance) return { x: to.x, z: to.z }

  const t = maxDistance / remaining
  return { x: from.x + dx * t, z: from.z + dz * t }
}
