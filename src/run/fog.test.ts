import { describe, expect, it } from 'vitest'
import { GROUND_SIZE } from '../map/mapLayout'
import { createFog, FOG_CELLS, FOG_REVEAL_RADIUS, isRevealed, revealAround } from './fog'

const half = GROUND_SIZE / 2

describe('Fog', () => {
  it('keeps its cells half a world unit wide on any size of ground', () => {
    expect(GROUND_SIZE / FOG_CELLS).toBe(0.5)
  })

  it.each([
    ['far +x +z', { x: half - 1, z: half - 1 }],
    ['far -x -z', { x: -half + 1, z: -half + 1 }],
    ['far +x -z', { x: half - 1, z: -half + 1 }],
    ['far -x +z', { x: -half + 1, z: half - 1 }],
  ])('covers and reveals the %s corner of the ground', (_, corner) => {
    const fog = createFog()
    expect(isRevealed(fog, corner)).toBe(false)

    const revealed = revealAround(fog, corner)

    expect(isRevealed(revealed, corner)).toBe(true)
    // Only around the corner: the opposite corner stays in Fog.
    expect(isRevealed(revealed, { x: -corner.x, z: -corner.z })).toBe(false)
  })

  it('reveals no further than the reveal radius', () => {
    const fog = revealAround(createFog(), { x: 0, z: 0 })

    expect(isRevealed(fog, { x: FOG_REVEAL_RADIUS - 1, z: 0 })).toBe(true)
    expect(isRevealed(fog, { x: FOG_REVEAL_RADIUS + 1, z: 0 })).toBe(false)
  })
})
