import { describe, expect, it } from 'vitest'
import { resumeData } from '../resume/resumeData'
import type { LaneEntries, LaneKey, ResumeData, ResumeEntry } from '../resume/types'
import type { GroundPosition } from '../run/movement'
import { NEXUS_RANGE, TOWER_RANGE } from '../run/runStore'
import { mapLayout, type MapLayout } from './mapLayout'

describe('mapLayout', () => {
  it('lays out one labelled Lane per category, each running from the Base to the Nexus', () => {
    const layout = mapLayout(resumeData)

    expect(layout.lanes.map((lane) => lane.label)).toEqual(['Beginnings', 'Projects', 'Experience'])
    for (const lane of layout.lanes) {
      expect(lane.path[0]).toEqual(layout.base)
      expect(lane.path.at(-1)).toEqual(layout.nexus)
    }
  })

  it('places one Tower per Resume Entry, spaced evenly along a straight Lane', () => {
    // Mid runs straight from the Base (24, 24) to the Nexus (-24, -24). Three
    // Towers split it into four equal gaps.
    const mid = laneByLabel(mapLayout(withLaneSizes({ top: 2, mid: 3, bottom: 2 })), 'Projects')

    expect(mid.towers.map((tower) => tower.entryId)).toEqual(['mid-0', 'mid-1', 'mid-2'])
    expectPositions(mid.towers, [
      { x: 12, z: 12 },
      { x: 0, z: 0 },
      { x: -12, z: -12 },
    ])
  })

  it('measures Tower spacing along the path, around corners', () => {
    // Top runs (24, 24) → (-24, 24) → (-24, -24): 96 units. Two Towers split
    // it into three gaps of 32. The second Tower, 64 along, is 16 past the
    // corner.
    const top = laneByLabel(mapLayout(withLaneSizes({ top: 2, mid: 3, bottom: 2 })), 'Beginnings')

    expectPositions(top.towers, [
      { x: -8, z: 24 },
      { x: -24, z: 8 },
    ])
  })

  it('re-spaces a Lane when a Resume Entry is added to it', () => {
    // Three Towers split the 96-unit top Lane into four gaps of 24.
    const top = laneByLabel(mapLayout(withLaneSizes({ top: 3, mid: 3, bottom: 2 })), 'Beginnings')

    expect(top.towers.map((tower) => tower.entryId)).toEqual(['top-0', 'top-1', 'top-2'])
    expectPositions(top.towers, [
      { x: 0, z: 24 },
      { x: -24, z: 24 },
      { x: -24, z: 0 },
    ])
  })

  it('places a lone Tower halfway along its Lane', () => {
    // Half of the 96-unit top Lane is 48 units: exactly the corner.
    const top = laneByLabel(mapLayout(withLaneSizes({ top: 1, mid: 3, bottom: 4 })), 'Beginnings')

    expectPositions(top.towers, [{ x: -24, z: 24 }])
  })

  it('spaces four Towers evenly along a Lane', () => {
    // Bottom runs (24, 24) → (24, -24) → (-24, -24): 96 units. Four Towers
    // split it into five gaps of 19.2; the last two are past the corner.
    const bottom = laneByLabel(mapLayout(withLaneSizes({ top: 1, mid: 3, bottom: 4 })), 'Experience')

    expectPositions(bottom.towers, [
      { x: 24, z: 4.8 },
      { x: 24, z: -14.4 },
      { x: 14.4, z: -24 },
      { x: -4.8, z: -24 },
    ])
  })

  it.each([
    ['one Tower', 1],
    ['four Towers', 4],
  ] as const)('keeps every range apart when each Lane has %s', (_, size) => {
    const layout = mapLayout(withLaneSizes({ top: size, mid: size, bottom: size }))
    const positions = layout.lanes.flatMap((lane) => lane.towers.map((tower) => tower.position))

    positions.forEach((a, i) =>
      positions.slice(i + 1).forEach((b) => expect(distance(a, b)).toBeGreaterThan(2 * TOWER_RANGE)),
    )
    for (const position of positions) {
      expect(distance(position, layout.base)).toBeGreaterThan(TOWER_RANGE)
      expect(distance(position, layout.nexus)).toBeGreaterThan(TOWER_RANGE + NEXUS_RANGE)
    }
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

// The placeholder Resume Data with each Lane cut down or padded out to the
// given number of Resume Entries.
function withLaneSizes(sizes: Record<LaneKey, LaneEntries['length']>) {
  const resize = (key: LaneKey) => {
    const lane = resumeData.lanes[key]
    const entries: ResumeEntry[] = Array.from({ length: sizes[key] }, (_, i) => ({
      ...lane.entries[i % lane.entries.length],
      id: `${key}-${i}`,
    }))
    return { ...lane, entries: entries as LaneEntries }
  }
  return {
    ...resumeData,
    lanes: { top: resize('top'), mid: resize('mid'), bottom: resize('bottom') },
  } satisfies ResumeData
}

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
