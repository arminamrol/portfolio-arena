import type { GroundPosition } from '../run/movement'
import { distance, GROUND_SIZE, type MapLayout } from './mapLayout'

export type SceneryKind = 'tree' | 'treeLarge' | 'rocks' | 'rocksLarge'

export type SceneryItem = {
  kind: SceneryKind
  position: GroundPosition
  // Turn around the vertical axis, in radians.
  rotation: number
  // Size multiplier around the kind's normal size.
  scale: number
}

// Spacing of the grid items are scattered from, before jitter.
const SPACING = 2.6
// Share of grid points that get an item.
const DENSITY = 0.45
// Clear ground kept around Lanes (from their centre line), Towers and the
// Base, Shop and Nexus, so items never block a path or hide a structure.
const LANE_CLEARANCE = 2.4
const TOWER_CLEARANCE = 3.2
const LANDMARK_CLEARANCE = 5
// Kept off the very edge of the ground.
const EDGE = 1

// Trees and rocks scattered around the map, away from everything the Hero
// walks to. Deterministic: the same layout gives the same scenery on every
// Run, with no Math.random().
export function sceneryLayout(layout: MapLayout): SceneryItem[] {
  const landmarks = [layout.base, layout.shop, layout.nexus]
  const towers = layout.lanes.flatMap((lane) => lane.towers.map((tower) => tower.position))
  const segments = layout.lanes.flatMap((lane) => lane.path.slice(1).map((to, i) => [lane.path[i], to] as const))
  const half = GROUND_SIZE / 2 - EDGE
  const items: SceneryItem[] = []

  for (let gx = -half; gx <= half; gx += SPACING) {
    for (let gz = -half; gz <= half; gz += SPACING) {
      const roll = random(gx, gz, 0)
      if (roll > DENSITY) continue
      const position = {
        x: clamp(gx + (random(gx, gz, 1) - 0.5) * SPACING, -half, half),
        z: clamp(gz + (random(gx, gz, 2) - 0.5) * SPACING, -half, half),
      }
      if (segments.some(([from, to]) => distanceToSegment(position, from, to) < LANE_CLEARANCE)) continue
      if (towers.some((tower) => distance(position, tower) < TOWER_CLEARANCE)) continue
      if (landmarks.some((landmark) => distance(position, landmark) < LANDMARK_CLEARANCE)) continue
      const pick = random(gx, gz, 3)
      items.push({
        // Mostly trees, some rocks.
        kind: pick < 0.4 ? 'tree' : pick < 0.75 ? 'treeLarge' : pick < 0.9 ? 'rocks' : 'rocksLarge',
        position,
        rotation: random(gx, gz, 4) * Math.PI * 2,
        scale: 0.8 + random(gx, gz, 5) * 0.5,
      })
    }
  }
  return items
}

// A repeatable pseudo-random number in [0, 1) for a grid point and channel:
// the classic GLSL-style sine hash.
function random(x: number, z: number, channel: number) {
  const n = Math.sin(x * 12.9898 + z * 78.233 + channel * 37.719) * 43758.5453
  return n - Math.floor(n)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

// Shortest distance from p to the segment from a to b: project p onto the
// segment's line, clamp to its ends, measure.
function distanceToSegment(p: GroundPosition, a: GroundPosition, b: GroundPosition) {
  const dx = b.x - a.x
  const dz = b.z - a.z
  const t = clamp(((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz), 0, 1)
  return distance(p, { x: a.x + dx * t, z: a.z + dz * t })
}
