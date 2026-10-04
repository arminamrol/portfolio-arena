import { describe, expect, it } from 'vitest'
import { MAX_ZOOM, MIN_ZOOM, followStep, isometricCameraPosition, zoomAfterWheel } from './isometricCamera'

describe('isometricCameraPosition', () => {
  it('sits on the true isometric diagonal at the requested distance', () => {
    const [x, y, z] = isometricCameraPosition(30)

    expect(Math.hypot(x, y, z)).toBeCloseTo(30)
    // 45° yaw: equal x and z
    expect(x).toBeCloseTo(z)
    // ~35.264° elevation above the ground plane
    const elevation = Math.atan2(y, Math.hypot(x, z)) * (180 / Math.PI)
    expect(elevation).toBeCloseTo(35.264, 2)
  })
})

describe('zoomAfterWheel', () => {
  it('zooms in when the wheel scrolls up and out when it scrolls down', () => {
    expect(zoomAfterWheel(40, -100)).toBeGreaterThan(40)
    expect(zoomAfterWheel(40, 100)).toBeLessThan(40)
  })

  it('never leaves the zoom limits', () => {
    expect(zoomAfterWheel(MAX_ZOOM, -10_000)).toBe(MAX_ZOOM)
    expect(zoomAfterWheel(MIN_ZOOM, 10_000)).toBe(MIN_ZOOM)
  })
})

describe('followStep', () => {
  // One frame at 60 fps.
  const FRAME = 1 / 60

  it('glides toward the Hero, closing only part of the gap in one frame', () => {
    const next = followStep(0, 10, FRAME, false)
    expect(next).toBeGreaterThan(0)
    expect(next).toBeLessThan(1)
  })

  it('gets close to the Hero within a second', () => {
    let position = 0
    for (let frame = 0; frame < 60; frame++) position = followStep(position, 10, FRAME, false)
    expect(position).toBeGreaterThan(9.9)
  })

  it('stays locked on the Hero under reduced motion, with no glide to catch up', () => {
    expect(followStep(0, 10, FRAME, true)).toBe(10)
  })
})
