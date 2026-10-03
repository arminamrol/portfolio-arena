import { describe, expect, it } from 'vitest'
import { MAX_ZOOM, MIN_ZOOM, isometricCameraPosition, zoomAfterWheel } from './isometricCamera'

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
