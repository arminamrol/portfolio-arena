import { describe, expect, it } from 'vitest'
import { isometricCameraPosition } from './isometricCamera'

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
