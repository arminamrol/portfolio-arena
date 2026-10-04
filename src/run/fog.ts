import { GROUND_SIZE } from '../map/mapLayout'
import type { GroundPosition } from './movement'

// Fog is a coarse grid of square cells laid over the ground: FOG_CELLS
// columns along world x, FOG_CELLS rows along world z, each cell either
// revealed or not. Half a world unit per cell is fine enough that the
// edge looks round once the scene smooths it, and coarse enough to stay
// cheap on a phone, whatever the size of the ground.
const CELLS_PER_UNIT = 2
export const FOG_CELLS = GROUND_SIZE * CELLS_PER_UNIT
const CELL_SIZE = 1 / CELLS_PER_UNIT
const HALF = GROUND_SIZE / 2

// World units around the Hero that are revealed. Larger than the Tower
// range, so a Tower is always revealed before the Hero can Capture it.
export const FOG_REVEAL_RADIUS = 6

// One byte per cell, row by row: cell (column, row) is at
// `row * FOG_CELLS + column`, row 0 at the -z edge, column 0 at the -x edge.
// 1 = revealed, 0 = in Fog. A flat typed array rather than a Set of cells:
// it is small (a byte per cell), quick to copy, and maps one-to-one onto the
// texture the scene draws Fog with.
export type Fog = Readonly<Uint8Array>

export function createFog(): Fog {
  return new Uint8Array(FOG_CELLS * FOG_CELLS)
}

// Reveals every cell whose centre is within FOG_REVEAL_RADIUS of `position`.
// Returns a new array when that reveals anything, or the same one when every
// such cell was already revealed, so subscribers see a change only when the
// picture actually changes. Cells are never hidden again.
export function revealAround(fog: Fog, position: GroundPosition): Fog {
  let next: Uint8Array | null = null
  // Off-map positions reveal from the nearest point on the map's edge.
  const x = clampToMap(position.x)
  const z = clampToMap(position.z)
  // Only the cells in the square around the circle can be in it.
  const fromColumn = cellIndex(x - FOG_REVEAL_RADIUS)
  const toColumn = cellIndex(x + FOG_REVEAL_RADIUS)
  const fromRow = cellIndex(z - FOG_REVEAL_RADIUS)
  const toRow = cellIndex(z + FOG_REVEAL_RADIUS)

  for (let row = fromRow; row <= toRow; row++) {
    for (let column = fromColumn; column <= toColumn; column++) {
      const i = row * FOG_CELLS + column
      if (fog[i] || Math.hypot(cellCentre(column) - x, cellCentre(row) - z) > FOG_REVEAL_RADIUS) continue
      next ??= new Uint8Array(fog)
      next[i] = 1
    }
  }
  return next ?? fog
}

// Whether the cell under `position` is revealed. Off-map positions read the
// nearest cell on the map's edge.
export function isRevealed(fog: Fog, position: GroundPosition): boolean {
  return fog[cellIndex(position.z) * FOG_CELLS + cellIndex(position.x)] === 1
}

// The column (for x) or row (for z) a world coordinate falls in, clamped
// to the grid.
function cellIndex(coordinate: number) {
  return Math.min(FOG_CELLS - 1, Math.max(0, Math.floor((coordinate + HALF) / CELL_SIZE)))
}

function cellCentre(index: number) {
  return (index + 0.5) * CELL_SIZE - HALF
}

function clampToMap(coordinate: number) {
  return Math.min(HALF, Math.max(-HALF, coordinate))
}
