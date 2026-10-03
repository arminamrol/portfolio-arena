import { describe, expect, it } from 'vitest'
import { createRunStore } from './runStore'

describe('Run store', () => {
  it('starts the Hero at the origin with no move target', () => {
    const run = createRunStore()

    expect(run.getState().heroPosition).toEqual({ x: 0, z: 0 })
    expect(run.getState().moveTarget).toBeNull()
  })

  it('moving the Hero updates its position', () => {
    const run = createRunStore()

    run.getState().heroMovedTo({ x: 3, z: -2 })

    expect(run.getState().heroPosition).toEqual({ x: 3, z: -2 })
  })

  it('setting a move target exposes it for movement and the marker', () => {
    const run = createRunStore()

    run.getState().setMoveTarget({ x: 5, z: 7 })

    expect(run.getState().moveTarget).toEqual({ x: 5, z: 7 })
  })

  it('keeps the move target while the Hero is still on its way', () => {
    const run = createRunStore()
    run.getState().setMoveTarget({ x: 5, z: 0 })

    run.getState().heroMovedTo({ x: 2, z: 0 })

    expect(run.getState().moveTarget).toEqual({ x: 5, z: 0 })
  })

  it('clears the move target once the Hero arrives', () => {
    const run = createRunStore()
    run.getState().setMoveTarget({ x: 5, z: 0 })

    run.getState().heroMovedTo({ x: 5, z: 0 })

    expect(run.getState().moveTarget).toBeNull()
  })
})
