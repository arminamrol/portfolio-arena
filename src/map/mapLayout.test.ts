import { describe, expect, it } from 'vitest'
import { resumeData } from '../resume/resumeData'
import type { ResumeData } from '../resume/types'
import type { GroundPosition } from '../run/movement'
import { mapLayout, type MapLayout } from './mapLayout'

describe('mapLayout', () => {
  it('lays out one labelled Lane per category, each running from the Base to the Nexus', () => {
    const layout = mapLayout(resumeData)

    expect(layout.lanes.map((lane) => lane.label)).toEqual(['Education', 'Projects', 'Experience'])
    for (const lane of layout.lanes) {
      expect(lane.path[0]).toEqual(layout.base)
      expect(lane.path.at(-1)).toEqual(layout.nexus)
    }
  })

  it('places one Tower per Resume Entry, spaced evenly along a straight Lane', () => {
    // Mid runs straight from the Base (14, 14) to the Nexus (-14, -14). Three
    // Towers split it into four equal gaps.
    const mid = laneByLabel(mapLayout(resumeData), 'Projects')

    expect(mid.towers.map((tower) => tower.entryId)).toEqual(['portfolio-arena', 'tiny-charts', 'design-tokens-cli'])
    expectPositions(mid.towers, [
      { x: 7, z: 7 },
      { x: 0, z: 0 },
      { x: -7, z: -7 },
    ])
  })

  it('measures Tower spacing along the path, around corners', () => {
    // Top runs (14, 14) → (-14, 14) → (-14, -14): 56 units. Two Towers split
    // it into three gaps of 56 / 3 ≈ 18.67. The second Tower, 37.33 along,
    // is 9.33 past the corner.
    const top = laneByLabel(mapLayout(resumeData), 'Education')

    expectPositions(top.towers, [
      { x: -4.667, z: 14 },
      { x: -14, z: 4.667 },
    ])
  })

  it('re-spaces a Lane when a Resume Entry is added to it', () => {
    const [first, second] = resumeData.lanes.top.entries
    const extra = { ...first, id: 'extra-course' }
    const withExtra = {
      ...resumeData,
      lanes: { ...resumeData.lanes, top: { ...resumeData.lanes.top, entries: [first, second, extra] } },
    } satisfies ResumeData

    // Three Towers split the 56-unit top Lane into four gaps of 14.
    const top = laneByLabel(mapLayout(withExtra), 'Education')

    expect(top.towers.map((tower) => tower.entryId)).toEqual([first.id, second.id, 'extra-course'])
    expectPositions(top.towers, [
      { x: 0, z: 14 },
      { x: -14, z: 14 },
      { x: -14, z: 0 },
    ])
  })

  it('puts the Shop near the Base, clear of every Lane', () => {
    const layout = mapLayout(resumeData)

    expect(distance(layout.shop, layout.base)).toBeLessThan(6)
    for (const lane of layout.lanes) {
      expect(distanceToPath(layout.shop, lane.path)).toBeGreaterThan(2)
    }
  })

  it('places each Lane label on its Lane, between the Base and the first Tower', () => {
    for (const lane of mapLayout(resumeData).lanes) {
      const label = distanceAlongPath(lane.labelPosition, lane.path)

      expect(label).toBeGreaterThan(0)
      expect(label).toBeLessThan(distanceAlongPath(lane.towers[0].position, lane.path))
    }
  })
})

function distance(a: GroundPosition, b: GroundPosition) {
  return Math.hypot(b.x - a.x, b.z - a.z)
}

// Shortest distance from a point to any segment of the path.
function distanceToPath(point: GroundPosition, path: GroundPosition[]) {
  return Math.min(...segments(path).map(([a, b]) => distance(point, closestOnSegment(point, a, b))))
}

// How far along the path a point lying on it is.
function distanceAlongPath(point: GroundPosition, path: GroundPosition[]) {
  let walked = 0
  for (const [a, b] of segments(path)) {
    if (distance(point, closestOnSegment(point, a, b)) < 1e-6) return walked + distance(a, point)
    walked += distance(a, b)
  }
  throw new Error('Point is not on the path')
}

function segments(path: GroundPosition[]) {
  return path.slice(1).map((b, i) => [path[i], b] as const)
}

function closestOnSegment(p: GroundPosition, a: GroundPosition, b: GroundPosition): GroundPosition {
  const abx = b.x - a.x
  const abz = b.z - a.z
  const t = Math.min(1, Math.max(0, ((p.x - a.x) * abx + (p.z - a.z) * abz) / (abx * abx + abz * abz)))
  return { x: a.x + abx * t, z: a.z + abz * t }
}

function laneByLabel(layout: MapLayout, label: string) {
  const lane = layout.lanes.find((l) => l.label === label)
  if (!lane) throw new Error(`No Lane labelled ${label}`)
  return lane
}

function expectPositions(towers: { position: GroundPosition }[], expected: GroundPosition[]) {
  expect(towers).toHaveLength(expected.length)
  towers.forEach((tower, i) => {
    expect(tower.position.x).toBeCloseTo(expected[i].x)
    expect(tower.position.z).toBeCloseTo(expected[i].z)
  })
}
