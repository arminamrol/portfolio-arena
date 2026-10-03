import { describe, expect, it } from 'vitest'
import { stepToward } from './movement'

describe('stepToward', () => {
  it('moves exactly the given distance along the line to the target', () => {
    const next = stepToward({ x: 0, z: 0 }, { x: 6, z: 8 }, 5)

    expect(next.x).toBeCloseTo(3)
    expect(next.z).toBeCloseTo(4)
  })

  it('stops on the target instead of overshooting it', () => {
    expect(stepToward({ x: 0, z: 0 }, { x: 1, z: 0 }, 5)).toEqual({ x: 1, z: 0 })
  })

  it('covers the same ground in two short frames as in one long frame', () => {
    const target = { x: 10, z: -4 }
    const speed = 6
    const oneFrame = stepToward({ x: 0, z: 0 }, target, speed * 0.5)
    const twoFrames = stepToward(stepToward({ x: 0, z: 0 }, target, speed * 0.25), target, speed * 0.25)

    expect(twoFrames.x).toBeCloseTo(oneFrame.x)
    expect(twoFrames.z).toBeCloseTo(oneFrame.z)
  })
})
