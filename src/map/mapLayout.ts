import type { GroundPosition } from '../run/movement'
import type { LaneKey, ResumeData } from '../resume/types'

export type LaneLayout = {
  key: LaneKey
  label: string
  // Corner points from the Base to the Nexus; the Lane is the straight
  // segments between them.
  path: GroundPosition[]
  // On the Lane, halfway from the Base to the first Tower.
  labelPosition: GroundPosition
  towers: TowerLayout[]
}

// A Tower shows exactly one Resume Entry.
export type TowerLayout = {
  entryId: string
  position: GroundPosition
}

export type MapLayout = {
  base: GroundPosition
  shop: GroundPosition
  nexus: GroundPosition
  lanes: LaneLayout[]
}

// Distance from the map centre to the Base and Nexus along each axis. The
// ground is a square centred on the origin; seen through the isometric
// camera it is a diamond, with +x+z at the bottom corner and -x-z at the top.
const CORNER = 14

const BASE: GroundPosition = { x: CORNER, z: CORNER }
const NEXUS: GroundPosition = { x: -CORNER, z: -CORNER }
// Beside the Base, to its right on screen, clear of the bottom Lane.
const SHOP: GroundPosition = { x: CORNER + 4, z: CORNER - 1.5 }

// Each Lane's path. Mid runs straight up the screen; top and bottom bend
// around the diamond's left and right corners.
const LANE_PATHS: Record<LaneKey, GroundPosition[]> = {
  top: [BASE, { x: -CORNER, z: CORNER }, NEXUS],
  mid: [BASE, NEXUS],
  bottom: [BASE, { x: CORNER, z: -CORNER }, NEXUS],
}

const LANE_ORDER: LaneKey[] = ['top', 'mid', 'bottom']

// Where everything stands on the map, computed from the Resume Data alone.
// Pure: the scene draws from it and the Run store checks against it, so what
// is drawn and what is checked never disagree.
export function mapLayout(resume: ResumeData): MapLayout {
  return {
    base: BASE,
    shop: SHOP,
    nexus: NEXUS,
    lanes: LANE_ORDER.map((key) => {
      const { label, entries } = resume.lanes[key]
      const path = LANE_PATHS[key]
      const gap = pathLength(path) / (entries.length + 1)
      return {
        key,
        label,
        path,
        labelPosition: pointAlongPath(path, gap / 2),
        // n Towers split the path into n + 1 equal stretches,
        // measured along the path (so around corners), not in a straight
        // line. The ends are left free for the Base and Nexus.
        towers: entries.map((entry, i) => ({
          entryId: entry.id,
          position: pointAlongPath(path, gap * (i + 1)),
        })),
      }
    }),
  }
}

function pathLength(path: GroundPosition[]): number {
  let length = 0
  for (let i = 1; i < path.length; i++) length += distance(path[i - 1], path[i])
  return length
}

// The point `along` units from the start of the path, walking its segments.
function pointAlongPath(path: GroundPosition[], along: number): GroundPosition {
  let remaining = along
  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1]
    const to = path[i]
    const segment = distance(from, to)
    if (remaining <= segment) {
      const t = remaining / segment
      return { x: from.x + (to.x - from.x) * t, z: from.z + (to.z - from.z) * t }
    }
    remaining -= segment
  }
  return path[path.length - 1]
}

function distance(a: GroundPosition, b: GroundPosition) {
  return Math.hypot(b.x - a.x, b.z - a.z)
}
