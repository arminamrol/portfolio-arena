import { describe, expect, it } from 'vitest'
import { resumeData } from '../resume/resumeData'
import type { GroundPosition } from '../run/movement'
import { distance, GROUND_SIZE, mapLayout } from './mapLayout'
import { sceneryLayout } from './scenery'

const layout = mapLayout(resumeData)
const items = sceneryLayout(layout)
const half = GROUND_SIZE / 2

describe('sceneryLayout', () => {
  it('keeps every item on the ground', () => {
    for (const { position } of items) {
      expect(Math.abs(position.x)).toBeLessThanOrEqual(half)
      expect(Math.abs(position.z)).toBeLessThanOrEqual(half)
    }
  })

  it('keeps every item off the Lanes and away from Towers and landmarks', () => {
    const segments = layout.lanes.flatMap((lane) => lane.path.slice(1).map((to, i) => [lane.path[i], to] as const))
    const towers = layout.lanes.flatMap((lane) => lane.towers.map((tower) => tower.position))

    for (const { position } of items) {
      for (const [a, b] of segments) expect(distanceToSegment(position, a, b)).toBeGreaterThan(2)
      for (const tower of towers) expect(distance(position, tower)).toBeGreaterThan(3)
      for (const landmark of [layout.base, layout.shop, layout.nexus]) expect(distance(position, landmark)).toBeGreaterThan(4)
    }
  })

  it('dresses the whole ground, out to every edge', () => {
    // Each quarter of the ground has scenery, and some of it stands near
    // each of the four edges.
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      expect(items.some(({ position }) => Math.sign(position.x) === sx && Math.sign(position.z) === sz)).toBe(true)
    }
    const outermost = (pick: (p: GroundPosition) => number) => Math.max(...items.map(({ position }) => pick(position)))
    expect(outermost((p) => p.x)).toBeGreaterThan(half - 3)
    expect(outermost((p) => -p.x)).toBeGreaterThan(half - 3)
    expect(outermost((p) => p.z)).toBeGreaterThan(half - 3)
    expect(outermost((p) => -p.z)).toBeGreaterThan(half - 3)
  })

  it('scales the number of items with the ground, within what a phone draws smoothly', () => {
    // At least one item per 30 square units of ground, after what the Lanes
    // and clearings take away. Each item is one draw call (and one more in
    // the shadow pass), so a few hundred is the most a phone should carry.
    expect(items.length).toBeGreaterThan((GROUND_SIZE * GROUND_SIZE) / 30)
    expect(items.length).toBeLessThanOrEqual(400)
  })

  it('gives the same scenery on every Run', () => {
    expect(sceneryLayout(layout)).toEqual(items)
  })
})

function distanceToSegment(p: GroundPosition, a: GroundPosition, b: GroundPosition) {
  const dx = b.x - a.x
  const dz = b.z - a.z
  const t = Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz)))
  return distance(p, { x: a.x + dx * t, z: a.z + dz * t })
}
