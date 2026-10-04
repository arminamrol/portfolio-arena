import { describe, expect, it } from 'vitest'
import { mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { GROUND_SIZE } from '../scene/Ground'
import { minimapToWorld } from './minimapCamera'

const layout = mapLayout(resumeData)
const half = GROUND_SIZE / 2

describe('minimapToWorld', () => {
  it('maps the centre of the minimap to the centre of the map', () => {
    const world = minimapToWorld(0.5, 0.5)
    expect(world.x).toBeCloseTo(0)
    expect(world.z).toBeCloseTo(0)
  })

  it('shows the whole ground, with the Nexus corner top right and the Base corner bottom left', () => {
    // (0, 0) is the minimap's top-left corner, (1, 1) its bottom-right.
    const topRight = minimapToWorld(1, 0)
    expect(topRight.x).toBeCloseTo(-half)
    expect(topRight.z).toBeCloseTo(-half)

    const bottomLeft = minimapToWorld(0, 1)
    expect(bottomLeft.x).toBeCloseTo(half)
    expect(bottomLeft.z).toBeCloseTo(half)

    // The Nexus and Base sit toward those corners.
    expect(Math.sign(layout.nexus.x)).toBe(Math.sign(topRight.x))
    expect(Math.sign(layout.base.x)).toBe(Math.sign(bottomLeft.x))
  })

  it('keeps the other two corners on the top and bottom Lanes\' bends', () => {
    const topLeft = minimapToWorld(0, 0)
    expect(topLeft.x).toBeCloseTo(-half)
    expect(topLeft.z).toBeCloseTo(half)

    const bottomRight = minimapToWorld(1, 1)
    expect(bottomRight.x).toBeCloseTo(half)
    expect(bottomRight.z).toBeCloseTo(-half)
  })

  it('clamps points just outside the minimap onto its edge', () => {
    const world = minimapToWorld(1.2, -0.1)
    expect(world.x).toBeCloseTo(-half)
    expect(world.z).toBeCloseTo(-half)
  })
})
