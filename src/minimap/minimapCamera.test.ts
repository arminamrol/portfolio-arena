import { describe, expect, it } from 'vitest'
import { GROUND_SIZE, mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { minimapPlacement, minimapToWorld, minimapViewport } from './minimapCamera'

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

const LARGE = { smallScreen: false, narrowScreen: false }
const SIDEWAYS_PHONE = { smallScreen: true, narrowScreen: false }
const UPRIGHT_PHONE = { smallScreen: true, narrowScreen: true }

describe('minimapPlacement', () => {
  it('puts a 200px minimap in the bottom right of a large screen', () => {
    expect(minimapPlacement(LARGE)).toEqual({ size: 200, margin: 16, corner: 'bottom' })
  })

  it('shrinks the minimap on a phone turned sideways, keeping it bottom right', () => {
    expect(minimapPlacement(SIDEWAYS_PHONE)).toEqual({ size: 112, margin: 16, corner: 'bottom' })
  })

  it('moves the minimap to the top right of a phone held upright, clear of the Ability bar', () => {
    expect(minimapPlacement(UPRIGHT_PHONE)).toEqual({ size: 112, margin: 16, corner: 'top' })
  })
})

describe('minimapViewport', () => {
  // WebGL measures y up from the canvas's bottom edge, the DOM down from its top.
  it('places a bottom-right minimap a margin up from the bottom', () => {
    expect(minimapViewport(minimapPlacement(LARGE), 1000, 800)).toEqual({ x: 784, y: 16, size: 200 })
  })

  it('places a top-right minimap a margin down from the top', () => {
    expect(minimapViewport(minimapPlacement(UPRIGHT_PHONE), 390, 844)).toEqual({ x: 262, y: 716, size: 112 })
  })
})
